import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

const ALLOWED_PUBLIC_TEMPLATE_TYPES = [
  'template_conventie_cadru',
  'template_acord_date_caracter_personal',
  'template_caiet_de_practica',
] as const;

type AllowedPublicType = (typeof ALLOWED_PUBLIC_TEMPLATE_TYPES)[number];

function isAllowedType(type: string | null): type is AllowedPublicType {
  return !!type && ALLOWED_PUBLIC_TEMPLATE_TYPES.includes(type as AllowedPublicType);
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!isAllowedType(type)) {
    return NextResponse.json({ error: 'Invalid or missing template type.' }, { status: 400 });
  }

  const result = await db.query(
    `
    SELECT
      t.document_type,
      t.blob_id,
      t.updated_at,
      b.filename,
      b.mime_type,
      b.byte_size,
      b.uploaded_at
    FROM acroform_templates t
    JOIN document_blobs b ON b.id = t.blob_id
    WHERE t.document_type = $1
    LIMIT 1
    `,
    [type]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({
      template: { exists: false },
    });
  }

  const row = result.rows[0];

  return NextResponse.json({
    template: {
      exists: true,
      documentType: row.document_type,
      blobId: row.blob_id,
      filename: row.filename,
      mimeType: row.mime_type,
      byteSize: row.byte_size,
      uploadedAt: row.uploaded_at,
      updatedAt: row.updated_at,
      downloadUrl: `/api/public/document-blobs/${row.blob_id}`,
    },
  });
}