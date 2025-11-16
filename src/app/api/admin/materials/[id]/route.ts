import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const material = await db.query(
    `
    SELECT m.*, mc.name AS category_name
    FROM materials m
    LEFT JOIN material_categories mc ON mc.id = m.category_id
    WHERE m.id = $1
    `,
    [id]
  );

  if (!material.rowCount) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const series = await db.query(
    `
    SELECT msa.series_id, s.name
    FROM material_series_access msa
    JOIN series s ON s.id = msa.series_id
    WHERE msa.material_id = $1
    `,
    [id]
  );

  const students = await db.query(
    `
    SELECT msa.student_id, st.nume, st.prenume, st.email
    FROM material_student_access msa
    JOIN students st ON st.id = msa.student_id
    WHERE msa.material_id = $1
    `,
    [id]
  );

  return NextResponse.json({
    material: material.rows[0],
    series: series.rows,
    students: students.rows,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, category_id, visibility } = body;

  const updated = await db.query(
    `
    UPDATE materials
    SET
      title = COALESCE($2, title),
      category_id = COALESCE($3, category_id),
      visibility = COALESCE($4, visibility),
      updated_at = now()
    WHERE id = $1
    RETURNING visibility
    `,
    [id, title ?? null, category_id ?? null, visibility ?? null]
  );

  if (!updated.rowCount) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const newVisibility = updated.rows[0].visibility;

  // dacă acum e public, accesul punctual nu mai are sens
  if (newVisibility === 'public') {
    await db.query('DELETE FROM material_series_access WHERE material_id = $1', [id]);
    await db.query('DELETE FROM material_student_access WHERE material_id = $1', [id]);
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  await db.query('DELETE FROM materials WHERE id = $1', [id]);

  return NextResponse.json({ ok: true });
}
