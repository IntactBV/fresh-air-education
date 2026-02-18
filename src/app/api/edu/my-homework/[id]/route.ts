// src/app/api/edu/teme/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

async function getStudentForUser(userId: string) {
  const res = await db.query(
    `
    SELECT id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return res.rows[0] ?? null;
}

function contentDisposition(filename: string, download: boolean) {
  const safe = filename.replace(/[\r\n"]/g, '_');
  return `${download ? 'attachment' : 'inline'}; filename="${safe}"`;
}

export async function GET(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const id = ctx.params.id;
  const url = new URL(req.url);
  const download = url.searchParams.get('download') === '1';

  const hwRes = await db.query(
    `
    SELECT id, blob_id, original_filename, mime_type
    FROM student_homework_files
    WHERE id = $1
      AND student_id = $2
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [id, student.id],
  );

  const hw = hwRes.rows[0];
  if (!hw) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const blobRes = await db.query(
    `
    SELECT content, mime_type, filename
    FROM document_blobs
    WHERE id = $1
    LIMIT 1
    `,
    [hw.blob_id],
  );

  const blob = blobRes.rows[0];
  if (!blob) {
    return NextResponse.json({ error: 'Blob not found' }, { status: 404 });
  }

  const body = Buffer.from(blob.content);

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': hw.mime_type || blob.mime_type || 'application/octet-stream',
      'Content-Disposition': contentDisposition(hw.original_filename || blob.filename, download),
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function DELETE(req: NextRequest, ctx: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const id = ctx.params.id;

  const res = await db.query(
    `
    UPDATE student_homework_files
    SET deleted_at = now(),
        deleted_by_role = 'student',
        deleted_by_user = $1
    WHERE id = $2
      AND student_id = $3
      AND deleted_at IS NULL
    RETURNING id
    `,
    [session.user.id, id, student.id],
  );

  if (res.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
