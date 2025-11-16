// src/app/api/public/public-images/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id) {
    return new NextResponse('Missing id', { status: 400 });
  }

  const res = await db.query(
    `
    SELECT mime_type, content
    FROM public_page_images
    WHERE id = $1
    LIMIT 1
    `,
    [id],
  );

  if (res.rowCount === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const row = res.rows[0];

  return new NextResponse(row.content, {
    status: 200,
    headers: {
      'Content-Type': row.mime_type,
      'Content-Length': row.content.length.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
