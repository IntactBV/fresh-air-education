import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

interface Params {
  params: { id: string };
}

// GET /api/admin/public-documents/:id/download
export async function GET(
    _req: NextRequest,
    { params }: { params: { id: string } }
  ) {
    const { id } = await params;

  const result = await db.query<
    {
      title: string;
      mime_type: string;
      content: Buffer;
      filename: string;
    }
  >(
    `
    SELECT
      pd.title,
      COALESCE(pd.mime_type, db.mime_type) AS mime_type,
      db.content,
      db.filename
    FROM public_documents pd
    JOIN document_blobs db ON db.id = pd.blob_id
    WHERE pd.id = $1
    AND pd.published = true
    `,
    [id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const doc = result.rows[0];

  return new NextResponse(new Uint8Array(doc.content), {
    status: 200,
    headers: {
      'Content-Type': doc.mime_type ?? 'application/pdf',
      'Content-Disposition': `inline; filename="${doc.filename ?? 'document.pdf'}"`,
    },
  });
}
