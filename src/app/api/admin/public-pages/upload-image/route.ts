// src/app/api/admin/public-pages/upload-image/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export const dynamic = 'force-dynamic';

async function getPublicPageIdBySlug(slug: string | null) {
  if (!slug) return null;

  const res = await db.query(
    `
    SELECT id
    FROM public_pages
    WHERE slug = $1
    LIMIT 1
    `,
    [slug],
  );

  return res.rows[0]?.id ?? null;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized =
    session?.user &&
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slugFromQuery = searchParams.get('slug');

  const formData = await req.formData();
  const file = formData.get('file');
  const slugFromForm = formData.get('pageSlug');

  const pageSlug =
    (typeof slugFromForm === 'string' && slugFromForm) ||
    slugFromQuery ||
    null;

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json(
      { error: 'Missing file field in multipart form data.' },
      { status: 400 },
    );
  }

  const fileObj = file as File;
  const mimeType = fileObj.type || 'application/octet-stream';

  if (!mimeType.startsWith('image/')) {
    return NextResponse.json(
      { error: 'Only image files are allowed.' },
      { status: 400 },
    );
  }

  const maxSizeBytes = 5 * 1024 * 1024;
  const arrayBuffer = await fileObj.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.byteLength > maxSizeBytes) {
    return NextResponse.json(
      { error: 'File is too large (max 5 MB).' },
      { status: 400 },
    );
  }

  const filename =
    (typeof formData.get('filename') === 'string' && formData.get('filename')) ||
    fileObj.name ||
    'image';

  const byteSize = buffer.byteLength;
  const publicPageId = await getPublicPageIdBySlug(pageSlug);

  const insertRes = await db.query(
    `
    INSERT INTO public_page_images (
      public_page_id,
      page_slug,
      filename,
      mime_type,
      byte_size,
      content,
      uploaded_by,
      uploaded_by_name
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id, filename, mime_type, byte_size
    `,
    [
      publicPageId,
      pageSlug,
      filename,
      mimeType,
      byteSize,
      buffer,
      session.user.id ?? null,
      (session.user as any).name ?? null,
    ],
  );

  const row = insertRes.rows[0];
  const id = row.id as string;
  const url = `/api/public/public-images/${id}`;

  return NextResponse.json({
    id,
    url,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
  });
}
