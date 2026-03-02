// src/app/api/public/document-blobs/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

const ALLOWED_PUBLIC_TEMPLATE_TYPES = [
  'template_conventie_cadru',
  'template_acord_date_caracter_personal',
  'template_caiet_de_practica',
] as const;


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  // Only allow download if this blob is referenced by an allowed public template type
  const result = await db.query(
    `
    SELECT
      b.filename,
      b.mime_type,
      b.content
    FROM document_blobs b
    JOIN acroform_templates t ON t.blob_id = b.id
    WHERE b.id = $1
      AND t.document_type = ANY($2::text[])
    LIMIT 1
    `,
    [id, ALLOWED_PUBLIC_TEMPLATE_TYPES]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  const row = result.rows[0] as {
    filename: string;
    mime_type: string;
    content: Buffer;
  };

  return new NextResponse(new Uint8Array(row.content), {
    status: 200,
    headers: {
      'Content-Type': row.mime_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(row.filename || 'document')}"`,
      'Cache-Control': 'no-store',
    },
  });
}