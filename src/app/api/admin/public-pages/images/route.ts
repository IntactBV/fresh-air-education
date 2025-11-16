import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized =
    session?.user &&
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json(
      { error: 'Missing slug parameter.' },
      { status: 400 },
    );
  }

  const result = await db.query(
    `
    SELECT
      id,
      filename,
      mime_type,
      byte_size,
      uploaded_at
    FROM public_page_images
    WHERE page_slug = $1
    ORDER BY uploaded_at DESC
    `,
    [slug],
  );

  const images = result.rows.map((row) => ({
    id: row.id,
    filename: row.filename,
    mimeType: row.mime_type,
    byteSize: row.byte_size,
    uploadedAt: row.uploaded_at,
    url: `/api/public/public-images/${row.id}`,
  }));

  return NextResponse.json({ images });
}
