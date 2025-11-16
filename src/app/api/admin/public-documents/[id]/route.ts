// src/app/api/admin/public-documents/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

// GET /api/admin/public-documents/:id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin)
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const result = await db.query(
    `
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
    WHERE id = $1
    `,
    [id]
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

// DELETE /api/admin/public-documents/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin)
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const result = await db.query(
    `
    DELETE FROM public_documents
    WHERE id = $1
    `,
    [id]
  );

  if (result.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
