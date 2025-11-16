import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { z } from 'zod';
import { auth } from '@/utils/auth';

const createPublicDocumentSchema = z.object({
  section: z.enum(['methodology', 'announcement']),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  blob_id: z.string().uuid('blob_id must be a valid uuid'),
  published: z.boolean().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');

  let sql = `
    SELECT
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
    FROM public_documents
  `;
  const params: any[] = [];

  if (section) {
    sql += ` WHERE section = $1 ORDER BY created_at DESC`;
    params.push(section);
  } else {
    sql += ` ORDER BY created_at DESC`;
  }

  const result = await db.query(sql, params);

  return NextResponse.json(
    result.rows.map((r) => ({
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
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = createPublicDocumentSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { section, title, description, blob_id, published = false } = parsed.data;
  const createdBy = session?.user?.id ?? null;
  const createdByName = session?.user?.name ?? null;
  const publishedAt = published ? new Date() : null;

  const insert = await db.query(
    `
    INSERT INTO public_documents (
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
    )
    VALUES ($1, $2, $3, $4, 'application/pdf', $5, $6, $7, $8, NOW(), NOW())
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
    [
      section,
      title.trim(),
      description?.trim() ?? null,
      blob_id,
      published,
      publishedAt,
      createdBy,
      createdByName,
    ]
  );

  const r = insert.rows[0];

  return NextResponse.json(
    {
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
    },
    { status: 201 }
  );
}
