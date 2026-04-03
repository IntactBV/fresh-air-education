// src/app/api/edu/my-homework/upload/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { PoolClient } from 'pg';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const MAX_SIZE = 20 * 1024 * 1024;

async function getStudentForUser(userId: string) {
  const res = await db.query(
    `
    SELECT id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId]
  );
  return res.rows[0] ?? null;
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const formData = await req.formData();
  const file =
    (formData.get('file') as File | null) ||
    (formData.get('document') as File | null);

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let client: PoolClient | null = null;

  try {
    client = await db.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");

    const blobRes = await client.query(
      `
      INSERT INTO document_blobs (filename, mime_type, byte_size, content)
      VALUES ($1, $2, $3, $4)
      RETURNING id, filename, mime_type, byte_size, uploaded_at
      `,
      [
        file.name,
        file.type && file.type.length > 0 ? file.type : 'application/octet-stream',
        buffer.byteLength,
        buffer,
      ]
    );

    const blob = blobRes.rows[0];

    const hwRes = await client.query(
      `
      INSERT INTO student_homework_files (
        student_id,
        blob_id,
        original_filename,
        mime_type,
        byte_size,
        uploaded_by_role,
        uploaded_by_user
      )
      VALUES ($1, $2, $3, $4, $5, 'student', $6)
      RETURNING id, uploaded_at
      `,
      [student.id, blob.id, blob.filename, blob.mime_type, blob.byte_size, session.user.id]
    );

    await client.query('COMMIT');

    return NextResponse.json(
      {
        ok: true,
        id: hwRes.rows[0].id,
        name: blob.filename,
        mimeType: blob.mime_type,
        sizeBytes: blob.byte_size,
        uploadedAt: hwRes.rows[0].uploaded_at,
        url: `/api/edu/teme/${hwRes.rows[0].id}`,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('homework upload err', err);

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback failure
      }
    }

    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  } finally {
    client?.release();
  }
}