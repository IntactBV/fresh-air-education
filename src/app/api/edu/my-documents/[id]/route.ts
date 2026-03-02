// src/app/api/edu/my-documents/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

type StudentRow = { id: string; application_id: string };

async function getStudentForUser(userId: string): Promise<StudentRow | null> {
  const res = await db.query<StudentRow>(
    `
    SELECT id, application_id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return res.rows[0] ?? null;
}

function buildFileResponse(req: NextRequest, row: any) {
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

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id } = await params;
  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return new NextResponse('Not found', { status: 404 });
  }

  const resStudentDoc = await db.query(
    `
    SELECT
      sd.id,
      sd.student_id,
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

  if (resStudentDoc.rows.length > 0) {
    const row = resStudentDoc.rows[0];
    if (!row.is_visible_to_student) return new NextResponse('Forbidden', { status: 403 });
    return buildFileResponse(req, row);
  }

  const resAppDoc = await db.query(
    `
    SELECT
      sad.id,
      sad.student_application_id,
      sad.is_visible_to_student,
      db.content,
      db.filename,
      db.mime_type,
      db.byte_size
    FROM student_application_documents sad
    JOIN document_blobs db ON db.id = sad.blob_id
    WHERE sad.id = $1
      AND sad.student_application_id = $2
    LIMIT 1
    `,
    [id, student.application_id],
  );

  if (resAppDoc.rows.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const row = resAppDoc.rows[0];
  if (!row.is_visible_to_student) return new NextResponse('Forbidden', { status: 403 });
  return buildFileResponse(req, row);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const docRes = await db.query(
    `
    SELECT id, blob_id, uploaded_by_role
    FROM student_documents
    WHERE id = $1 AND student_id = $2
    LIMIT 1
    `,
    [id, student.id],
  );

  if (docRes.rows.length > 0) {
    const doc = docRes.rows[0];
    if (doc.uploaded_by_role !== 'student') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    await db.query('DELETE FROM student_documents WHERE id = $1', [id]);
    await db.query('DELETE FROM document_blobs WHERE id = $1', [doc.blob_id]);
    return NextResponse.json({ ok: true });
  }

  const appDocRes = await db.query(
    `
    SELECT id, blob_id, uploaded_by_role
    FROM student_application_documents
    WHERE id = $1 AND student_application_id = $2
    LIMIT 1
    `,
    [id, student.application_id],
  );

  if (appDocRes.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const appDoc = appDocRes.rows[0];
  if (appDoc.uploaded_by_role !== 'student') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await db.query('DELETE FROM student_application_documents WHERE id = $1', [id]);
  await db.query('DELETE FROM document_blobs WHERE id = $1', [appDoc.blob_id]);

  return NextResponse.json({ ok: true });
}