import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { PDFDocument } from 'pdf-lib';

type DocumentType =
  | 'adeverinta_finalizare_stagiu'
  | 'adeverinta_student'
  | 'declaratie_student';

const getTemplateTypeForDocumentType = (docType: DocumentType) => {
  switch (docType) {
    case 'adeverinta_finalizare_stagiu':
      return 'template_acroform_adeverinta_finalizare';
    // enhance: map other document types to their template types
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

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  const isAuthorized = session?.user && 
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const documentType = url.searchParams.get('type') as DocumentType | null;
  const studentId = url.searchParams.get('studentId');

  if (!documentType || !studentId) {
    return NextResponse.json(
      { error: 'Missing type or studentId' },
      { status: 400 }
    );
  }

  const templateType = getTemplateTypeForDocumentType(documentType);

  let body: { fields?: Record<string, string> } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const fields = body.fields || {};

  try {
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

    const pdfBytes = await pdfDoc.save();
    const pdfBuffer = Buffer.from(pdfBytes);

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="preview.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('generate-preview error:', e);
    return NextResponse.json(
      { error: 'Failed to generate preview PDF.' },
      { status: 500 }
    );
  }
}
