// src/app/api/edu/materials/route.ts
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
    return NextResponse.json({ materials: [] });
  }

  const res = await db.query(
    `
    WITH student_series AS (
      SELECT ss.series_id
      FROM student_series ss
      WHERE ss.student_id = $1
    )
    SELECT DISTINCT
      m.id,
      COALESCE(m.title, m.original_filename) AS title,
      m.original_filename,
      m.mime_type,
      m.byte_size,
      m.uploaded_at,
      m.uploaded_by_name,
      m.visibility,
      m.category_id,
      mc.name AS category_name
    FROM materials m
    LEFT JOIN material_categories mc ON mc.id = m.category_id
    LEFT JOIN material_student_access msa
      ON msa.material_id = m.id AND msa.student_id = $1
    LEFT JOIN material_series_access msa2
      ON msa2.material_id = m.id
    LEFT JOIN student_series ss
      ON ss.series_id = msa2.series_id
    WHERE
      m.visibility = 'public'
      OR msa.student_id IS NOT NULL
      OR ss.series_id IS NOT NULL
    ORDER BY m.uploaded_at DESC NULLS LAST, title ASC
    `,
    [student.id],
  );

  const materials = res.rows.map((m) => ({
    id: m.id,
    title: m.title,
    filename: m.original_filename,
    mimeType: m.mime_type,
    sizeBytes: m.byte_size,
    uploadedAt: m.uploaded_at,
    uploadedBy: m.uploaded_by_name,
    categoryId: m.category_id,
    categoryName: m.category_name,
  }));

  return NextResponse.json({ materials });
}
