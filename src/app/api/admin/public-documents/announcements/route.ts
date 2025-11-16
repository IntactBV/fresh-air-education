import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

// GET /api/admin/public-documents/announcements
export async function GET() {
  const result = await db.query(
    `
    SELECT
      id,
      title,
      description,
      blob_id,
      mime_type,
      published_at,
      created_at
    FROM public_documents
    WHERE section = 'announcement'
      AND published = true
    ORDER BY published_at DESC NULLS LAST, created_at DESC
    `
  );

  return NextResponse.json(
    result.rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      blobId: r.blob_id,
      mimeType: r.mime_type,
      publishedAt: r.published_at,
      createdAt: r.created_at,
    }))
  );
}
