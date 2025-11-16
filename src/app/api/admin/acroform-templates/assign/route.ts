// src/app/api/admin/acroform-templates/assign/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { PDFDocument } from 'pdf-lib';
import { sendStudentDocumentAssignedEmail } from '@/utils/email';

type DocumentType =
  | 'adeverinta_finalizare_stagiu'
  | 'adeverinta_student'
  | 'declaratie_student';

const getTemplateTypeForDocumentType = (docType: DocumentType) => {
  switch (docType) {
    case 'adeverinta_finalizare_stagiu':
      return 'template_acroform_adeverinta_finalizare';
    // TODO: map other document types to their template types
    default:
      return 'template_acroform_adeverinta_finalizare';
  }
};

function normalizeForWinAnsi(input: string): string {
  if (!input) return '';
  return input
    .replace(/ă/g, 'a')
    .replace(/â/g, 'a')
    .replace(/î/g, 'i')
    .replace(/ș/g, 's')
    .replace(/ş/g, 's')
    .replace(/ț/g, 't')
    .replace(/ţ/g, 't')
    .replace(/Ă/g, 'A')
    .replace(/Â/g, 'A')
    .replace(/Î/g, 'I')
    .replace(/Ș/g, 'S')
    .replace(/Ş/g, 'S')
    .replace(/Ț/g, 'T')
    .replace(/Ţ/g, 'T');
}

type AssignBody = {
  studentId: string;
  documentType: DocumentType;
  source: 'generated' | 'signed';
  fields?: Record<string, string>;
  // sourceBlobId nu mai este folosit, dar il lasam in type pentru compatibilitate
  sourceBlobId?: string;
};

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  const isAuthorized =
    session?.user &&
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = req.headers.get('content-type') || '';

  let studentId: string | null = null;
  let documentType: DocumentType | null = null;
  let source: 'generated' | 'signed' | null = null;
  let fields: Record<string, string> | undefined;

  // pentru source === 'signed'
  let signedFileBuffer: Buffer | null = null;
  let signedFileMime: string | null = null;
  let signedFileByteSize: number | null = null;

  if (contentType.includes('multipart/form-data')) {
    // CAZ: varianta semnata – fisierul este trimis direct la /assign
    const formData = await req.formData();
    studentId = (formData.get('studentId') as string) || null;
    documentType = (formData.get('documentType') as DocumentType) || null;
    source = (formData.get('source') as 'signed' | null) || null;

    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Missing file for signed source' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    signedFileBuffer = Buffer.from(arrayBuffer);
    signedFileMime = file.type || 'application/pdf';
    signedFileByteSize = signedFileBuffer.length;
  } else {
    // CAZ: JSON – varianta generata
    let body: AssignBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    studentId = body.studentId;
    documentType = body.documentType;
    source = body.source;
    fields = body.fields;
  }

  if (!studentId || !documentType || !source) {
    return NextResponse.json(
      { error: 'Missing studentId, documentType or source' },
      { status: 400 }
    );
  }

  const uploadedByUser = session.user.id || null;

  // Single canonical blob per (student, documentType)
  const canonicalFilename = `${documentType}_${studentId}.pdf`;
  const defaultMimeType = 'application/pdf';

  try {
    let finalBlobId: string | null = null;

    if (source === 'generated') {
      if (!fields) {
        return NextResponse.json(
          { error: 'Missing fields for generated source' },
          { status: 400 }
        );
      }

      const templateType = getTemplateTypeForDocumentType(documentType);

      const tplRes = await db.query(
        `
        SELECT b.content
        FROM acroform_templates t
        JOIN document_blobs b ON b.id = t.blob_id
        WHERE t.document_type = $1
        LIMIT 1
        `,
        [templateType]
      );

      if (tplRes.rowCount === 0) {
        return NextResponse.json(
          { error: 'Template not found for this document type' },
          { status: 404 }
        );
      }

      const templateBytes: Buffer = tplRes.rows[0].content;

      const pdfDoc = await PDFDocument.load(templateBytes);
      const form = pdfDoc.getForm();

      for (const [name, value] of Object.entries(fields)) {
        try {
          let field;
          try {
            field = form.getField(name);
          } catch {
            field = null;
          }
          if (!field) continue;

          const raw = value ?? '';
          const text = normalizeForWinAnsi(String(raw));

          if ((field as any).setText) {
            (field as any).setText(text);
          }
        } catch {
          // ignore single field failures
        }
      }

      // flatten for final document (no editable fields, no blue highlight)
      form.flatten();

      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);
      const byteSize = pdfBuffer.length;

      // Upsert canonical blob by filename
      const existingBlob = await db.query(
        `
        SELECT id
        FROM document_blobs
        WHERE filename = $1
        LIMIT 1
        `,
        [canonicalFilename]
      );

      if ((existingBlob.rowCount ?? 0) > 0) {
        const blobId = existingBlob.rows[0].id;
        await db.query(
          `
          UPDATE document_blobs
          SET mime_type = $2,
              byte_size = $3,
              content = $4,
              uploaded_at = NOW()
          WHERE id = $1
          `,
          [blobId, defaultMimeType, byteSize, pdfBuffer]
        );
        finalBlobId = blobId;
      } else {
        const blobInsert = await db.query(
          `
          INSERT INTO document_blobs (filename, mime_type, byte_size, content)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [canonicalFilename, defaultMimeType, byteSize, pdfBuffer]
        );
        finalBlobId = blobInsert.rows[0].id;
      }
    } else if (source === 'signed') {
      if (!signedFileBuffer || !signedFileMime || !signedFileByteSize) {
        return NextResponse.json(
          { error: 'Missing signed file content' },
          { status: 400 }
        );
      }

      const existingBlob = await db.query(
        `
        SELECT id
        FROM document_blobs
        WHERE filename = $1
        LIMIT 1
        `,
        [canonicalFilename]
      );

      if ((existingBlob.rowCount ?? 0) > 0) {
        const blobId = existingBlob.rows[0].id;
        await db.query(
          `
          UPDATE document_blobs
          SET mime_type = $2,
              byte_size = $3,
              content = $4,
              uploaded_at = NOW()
          WHERE id = $1
          `,
          [blobId, signedFileMime, signedFileByteSize, signedFileBuffer]
        );
        finalBlobId = blobId;
      } else {
        const blobInsert = await db.query(
          `
          INSERT INTO document_blobs (filename, mime_type, byte_size, content)
          VALUES ($1, $2, $3, $4)
          RETURNING id
          `,
          [canonicalFilename, signedFileMime, signedFileByteSize, signedFileBuffer]
        );
        finalBlobId = blobInsert.rows[0].id;
      }
    }

    if (!finalBlobId) {
      return NextResponse.json(
        { error: 'Could not determine final blob id' },
        { status: 500 }
      );
    }

    // Upsert in student_documents pentru ORICE documentType
    const existingDoc = await db.query(
      `
      SELECT id
      FROM student_documents
      WHERE student_id = $1
        AND document_type = $2
      LIMIT 1
      `,
      [studentId, documentType]
    );

    if ((existingDoc.rowCount ?? 0) > 0) {
      const docId = existingDoc.rows[0].id;
      await db.query(
        `
        UPDATE student_documents
        SET blob_id = $1,
            uploaded_by_role = $2,
            uploaded_by_user = $3,
            is_visible_to_student = true,
            status = 'uploaded',
            updated_at = now()
        WHERE id = $4
        `,
        [finalBlobId, session.user.role, uploadedByUser, docId]
      );
    } else {
      await db.query(
        `
        INSERT INTO student_documents (
          student_id,
          document_type,
          blob_id,
          uploaded_by_role,
          uploaded_by_user,
          is_visible_to_student,
          status
        )
        VALUES ($1, $2, $3, $4, $5, true, 'uploaded')
        `,
        [studentId, documentType, finalBlobId, session.user.role, uploadedByUser]
      );
    }

    try {
      const studentRes = await db.query(
        `
        SELECT email, nume, prenume
        FROM students
        WHERE id = $1
        LIMIT 1
        `,
        [studentId]
      );

      if (studentRes.rowCount && studentRes.rowCount > 0) {
        const s = studentRes.rows[0] as {
          email: string;
          nume: string | null;
          prenume: string | null;
        };

        if (s.email) {
          await sendStudentDocumentAssignedEmail({
            email: s.email,
            studentName: [s.nume, s.prenume].filter(Boolean).join(' ') || null,
            documentType, // deocamdata doar adeverinta_finalizare_stagiu
          });
        }
      }
    } catch (emailErr) {
      console.error(
        'failed to send student document assigned email:',
        emailErr
      );
      // nu afecteaza raspunsul HTTP
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('assign acroform error:', e);
    return NextResponse.json(
      { error: 'Failed to assign document.' },
      { status: 500 }
    );
  }
}
