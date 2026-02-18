// src/app/api/edu/teme/route.ts
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

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ files: [] }, { status: 200 });
  }

  const res = await db.query(
    `
    SELECT
      id,
      original_filename,
      mime_type,
      byte_size,
      uploaded_at
    FROM student_homework_files
    WHERE student_id = $1
      AND deleted_at IS NULL
    ORDER BY uploaded_at DESC
    `,
    [student.id],
  );

  const files = res.rows.map((r) => ({
    id: r.id,
    name: r.original_filename,
    mimeType: r.mime_type,
    sizeBytes: r.byte_size,
    uploadedAt: r.uploaded_at,
    url: `/api/edu/teme/${r.id}`,
  }));

  return NextResponse.json({ files }, { status: 200 });
}
