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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return new NextResponse('Not found', { status: 404 });
  }

  const res = await db.query(
    `
    SELECT
      sd.id,
      sd.student_id,
      sd.document_type,
      sd.is_visible_to_student,
      db.content,
      db.filename,
      db.mime_type,
      db.byte_size
    FROM student_documents sd
    JOIN document_blobs db ON db.id = sd.blob_id
    WHERE sd.id = $1
      AND sd.student_id = $2
    LIMIT 1
    `,
    [id, student.id],
  );

  if (res.rows.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const row = res.rows[0];
  if (!row.is_visible_to_student) {
    return new NextResponse('Forbidden', { status: 403 });
  }

  const download = req.nextUrl.searchParams.get('download') === '1';

  return new NextResponse(row.content, {
    status: 200,
    headers: {
      'Content-Type': row.mime_type ?? 'application/octet-stream',
      'Content-Length': row.byte_size?.toString() ?? undefined,
      'Content-Disposition': download
        ? `attachment; filename="${encodeURIComponent(row.filename)}"`
        : `inline; filename="${encodeURIComponent(row.filename)}"`,
    },
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  // verificam ca documentul apartine studentului si ca a fost urcat de student
  const docRes = await db.query(
    `
    SELECT id, blob_id, uploaded_by_role
    FROM student_documents
    WHERE id = $1 AND student_id = $2
    LIMIT 1
    `,
    [id, student.id],
  );

  if (docRes.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const doc = docRes.rows[0];
  if (doc.uploaded_by_role !== 'student') {
    // studentul nu poate sterge ce a pus sistemul/adminul
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.query('DELETE FROM student_documents WHERE id = $1', [id]);
  await db.query('DELETE FROM document_blobs WHERE id = $1', [doc.blob_id]);

  return NextResponse.json({ ok: true });
}
