// src/app/api/admin/acroform-templates/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const ALLOWED_TYPES = [
  'template_acroform_adeverinta_finalizare',
  'template_declaratie_evitare_dubla_finantare',
  'template_declaratie_eligibilitate_membru',

  // new global templates (.docx)
  'template_conventie_cadru',
  'template_acord_date_caracter_personal',
  'template_caiet_de_practica',
] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(type: string | null): type is AllowedType {
  return !!type && ALLOWED_TYPES.includes(type as AllowedType);
}

const DOCX_MIME =
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function getExt(filename: string) {
  const i = filename.lastIndexOf('.');
  if (i === -1) return '';
  return filename.slice(i + 1).toLowerCase();
}

function isAllowedUpload(file: File) {
  const filename = file.name || '';
  const ext = getExt(filename);

  const mime = (file.type || '').toLowerCase();

  // Keep current behavior: PDF is allowed
  if (mime === 'application/pdf' || ext === 'pdf') {
    return { ok: true as const, mimeType: 'application/pdf', filename };
  }

  // New: allow docx (some browsers send correct mime, some may send octet-stream)
  if (mime === DOCX_MIME || ext === 'docx') {
    return { ok: true as const, mimeType: DOCX_MIME, filename };
  }

  return { ok: false as const };
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized =
    session?.user && (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!isAllowedType(type)) {
    return NextResponse.json(
      { error: 'Invalid or missing template type.' },
      { status: 400 }
    );
  }

  const result = await db.query(
    `
    SELECT
      t.id,
      t.document_type,
      t.blob_id,
      t.created_by,
      t.created_by_name,
      t.created_at,
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
      template: {
        exists: false,
      },
    });
  }

  const row = result.rows[0];

  return NextResponse.json({
    template: {
      exists: true,
      id: row.id,
      documentType: row.document_type,
      blobId: row.blob_id,
      filename: row.filename,
      mimeType: row.mime_type,
      byteSize: row.byte_size,
      uploadedAt: row.uploaded_at,
      createdBy: row.created_by,
      createdByName: row.created_by_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    },
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized =
    session?.user && (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!isAllowedType(type)) {
    return NextResponse.json(
      { error: 'Invalid or missing template type.' },
      { status: 400 }
    );
  }

  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json(
      { error: 'Missing file field in multipart form data.' },
      { status: 400 }
    );
  }

  const allowed = isAllowedUpload(file);
  if (!allowed.ok) {
    return NextResponse.json(
      { error: 'Template must be a PDF or DOCX file.' },
      { status: 400 }
    );
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = file.name || (allowed.mimeType === 'application/pdf' ? 'template.pdf' : 'template.docx');
  const mimeType = allowed.mimeType;
  const byteSize = buffer.byteLength;

  // 1) insert blob
  const blobResult = await db.query(
    `
    INSERT INTO document_blobs (filename, mime_type, byte_size, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id, filename, mime_type, byte_size, uploaded_at
    `,
    [filename, mimeType, byteSize, buffer]
  );

  const blob = blobResult.rows[0];

  // 2) upsert acroform_templates
  const tplResult = await db.query(
    `
    INSERT INTO acroform_templates (document_type, blob_id, created_by, created_by_name)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (document_type)
    DO UPDATE
      SET blob_id         = EXCLUDED.blob_id,
          created_by      = EXCLUDED.created_by,
          created_by_name = EXCLUDED.created_by_name,
          updated_at      = now()
    RETURNING
      id,
      document_type,
      blob_id,
      created_by,
      created_by_name,
      created_at,
      updated_at
    `,
    [type, blob.id, session.user?.id || null, session.user?.name || null]
  );

  const tpl = tplResult.rows[0];

  return NextResponse.json({
    template: {
      exists: true,
      id: tpl.id,
      documentType: tpl.document_type,
      blobId: tpl.blob_id,
      filename: blob.filename,
      mimeType: blob.mime_type,
      byteSize: blob.byte_size,
      uploadedAt: blob.uploaded_at,
      createdBy: tpl.created_by,
      createdByName: tpl.created_by_name,
      createdAt: tpl.created_at,
      updatedAt: tpl.updated_at,
    },
  });
}