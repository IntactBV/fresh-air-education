// src/app/api/edu/my-documents/upload/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

async function getStudentForUser(userId: string) {
  const res = await db.query(
    `
    SELECT id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return res.rows[0] ?? null;
}

// doar aceste tipuri pot fi incarcate de student
const ALLOWED_STUDENT_TYPES = ['adeverinta_student', 'declaratie_evitare_dubla_finantare_semnata', 'declaratie_eligibilitate_membru_semnata'] as const;

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const formData = await req.formData();
  const file =
    (formData.get('file') as File | null) ||
    (formData.get('document') as File | null) ||
    (formData.get('copie_buletin') as File | null);
  const docType = (formData.get('document_type') as string) ?? '';

  if (!ALLOWED_STUDENT_TYPES.includes(docType as any)) {
    return NextResponse.json({ error: 'Invalid document_type' }, { status: 400 });
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const accepted = ['application/pdf', 'image/png', 'image/jpeg'];
  if (!accepted.includes(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const client = await db.connect();
  try {
    await client.query('BEGIN');

    // 1) stergem orice document existent al acestui student de acelasi tip
    const oldDocs = await client.query(
      `
      SELECT sd.id, sd.blob_id
      FROM student_documents sd
      WHERE sd.student_id = $1
        AND sd.document_type = $2
      `,
      [student.id, docType],
    );

    if (oldDocs.rows.length > 0) {
      const oldDocIds = oldDocs.rows.map((r) => r.id);
      const oldBlobIds = oldDocs.rows.map((r) => r.blob_id);

      await client.query(
        `DELETE FROM student_documents WHERE id = ANY($1::uuid[])`,
        [oldDocIds],
      );

      await client.query(
        `DELETE FROM document_blobs WHERE id = ANY($1::uuid[])`,
        [oldBlobIds],
      );
    }

    // 2) inseram blob-ul nou
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const blobRes = await client.query(
      `
      INSERT INTO document_blobs (filename, mime_type, byte_size, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, filename, mime_type, byte_size, uploaded_at
      `,
      [file.name, file.type || 'application/octet-stream', buffer.byteLength, buffer],
    );

    const blob = blobRes.rows[0];

    // 3) inseram documentul nou
    const docRes = await client.query(
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
      VALUES ($1, $2, $3, 'student', $4, true, 'uploaded')
      RETURNING id, created_at
      `,
      [student.id, docType, blob.id, session.user.id],
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        ok: true,
        id: docRes.rows[0].id,
        documentType: docType,
        name: blob.filename,
        mimeType: blob.mime_type,
        sizeBytes: blob.byte_size,
        uploadedAt: docRes.rows[0].created_at,
        url: `/api/edu/my-documents/${docRes.rows[0].id}`,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('upload doc err', err);
    await client.query('ROLLBACK');
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
