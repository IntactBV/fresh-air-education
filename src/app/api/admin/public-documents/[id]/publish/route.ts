import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { z } from 'zod';
import { auth } from '@/utils/auth';

const publishSchema = z.object({
  published: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = publishSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { published } = parsed.data;

  const result = await db.query(
    `
    UPDATE public_documents
    SET
      published = $2,
      published_at = CASE WHEN $2 = true THEN NOW() ELSE NULL END,
      updated_at = NOW()
    WHERE id = $1
    RETURNING
      id,
      section,
      title,
      description,
      blob_id,
      mime_type,
      published,
      published_at,
      created_by,
      created_by_name,
      created_at,
      updated_at
    `,
    [id, published]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const r = result.rows[0];

  return NextResponse.json({
    id: r.id,
    section: r.section,
    title: r.title,
    description: r.description,
    blobId: r.blob_id,
    mimeType: r.mime_type,
    published: r.published,
    publishedAt: r.published_at,
    createdBy: r.created_by,
    createdByName: r.created_by_name,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  });
}
