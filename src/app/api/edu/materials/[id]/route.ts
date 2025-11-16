// src/app/api/edu/materials/[id]/route.ts
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

async function studentHasAccessToMaterial(studentId: string, materialId: string) {
  const res = await db.query(
    `
    WITH student_series AS (
      SELECT ss.series_id
      FROM student_series ss
      WHERE ss.student_id = $1
    )
    SELECT 1
    FROM materials m
    LEFT JOIN material_student_access msa
      ON msa.material_id = m.id AND msa.student_id = $1
    LEFT JOIN material_series_access msa2
      ON msa2.material_id = m.id
    LEFT JOIN student_series ss
      ON ss.series_id = msa2.series_id
    WHERE
      m.id = $2
      AND (
        m.visibility = 'public'
        OR msa.student_id IS NOT NULL
        OR ss.series_id IS NOT NULL
      )
    LIMIT 1
    `,
    [studentId, materialId],
  );

  return res.rows.length > 0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: materialId } = await params;

  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  }

  const allowed = await studentHasAccessToMaterial(student.id, materialId);
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const res = await db.query(
    `
    SELECT
      m.id,
      m.original_filename,
      m.mime_type,
      m.category_id,
      mc.name AS category_name,
      db.content,
      db.byte_size
    FROM materials m
    JOIN document_blobs db ON db.id = m.blob_id
    LEFT JOIN material_categories mc ON mc.id = m.category_id
    WHERE m.id = $1
    LIMIT 1
    `,
    [materialId],
  );

  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const file = res.rows[0];
  const download = req.nextUrl.searchParams.get('download') === '1';

  return new NextResponse(file.content, {
    status: 200,
    headers: {
      'Content-Type': file.mime_type ?? 'application/octet-stream',
      'Content-Length': file.byte_size?.toString() ?? undefined,
      'Content-Disposition': download
        ? `attachment; filename="${encodeURIComponent(file.original_filename ?? 'document')}" `
        : `inline; filename="${encodeURIComponent(file.original_filename ?? 'document')}" `,
    },
  });
}
