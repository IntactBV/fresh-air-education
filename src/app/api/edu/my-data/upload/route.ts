// src/app/api/edu/my-data/upload/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function POST(req: NextRequest) {

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const client = await db.connect();

  try {
    const formData = await req.formData();

    const file =
      (formData.get('copie_buletin') as File | null) ||
      (formData.get('file') as File | null);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const insertSql = `
      INSERT INTO document_blobs (filename, mime_type, byte_size, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, filename, mime_type, byte_size, uploaded_at
    `;

    const res = await client.query(insertSql, [
      file.name,
      file.type || 'application/octet-stream',
      buffer.byteLength,
      buffer,
    ]);

    const row = res.rows[0];

    return NextResponse.json(
      {
        ok: true,
        blobId: row.id,
        filename: row.filename,
        mimeType: row.mime_type,
        byteSize: row.byte_size,
        uploadedAt: row.uploaded_at,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error('Upload error:', err);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  } finally {
    client.release();
  }
}
