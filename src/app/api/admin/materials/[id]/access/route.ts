// src/app/api/admin/materials/[id]/access/route.ts
import type { NextRequest } from 'next/server';
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
    series: series.rows,
    students: students.rows,
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  // acceptam si "all" in body, pentru ca acum UI-ul are buton distinct pentru public
  const {
    all = false,
    series_ids = [],
    student_ids = [],
  }: {
    all?: boolean;
    series_ids?: string[];
    student_ids?: string[];
  } = body;

  // determinam noua vizibilitate
  let newVisibility: 'public' | 'restricted' | 'private';
  if (all) {
    newVisibility = 'public';
  } else if ((series_ids?.length || 0) > 0 || (student_ids?.length || 0) > 0) {
    newVisibility = 'restricted';
  } else {
    newVisibility = 'private';
  }

  const grantedBy = session?.user?.id ?? null;

  // stergem accesul vechi indiferent de caz
  await db.query('DELETE FROM material_series_access WHERE material_id = $1', [id]);
  await db.query('DELETE FROM material_student_access WHERE material_id = $1', [id]);

  // daca este restricted, trebuie sa scriem accesul
  if (newVisibility === 'restricted') {
    if (Array.isArray(series_ids) && series_ids.length > 0) {
      await db.query(
        `
        INSERT INTO material_series_access (material_id, series_id, granted_by)
        SELECT $1, unnest($2::uuid[]), $3
        `,
        [id, series_ids, grantedBy]
      );
    }

    if (Array.isArray(student_ids) && student_ids.length > 0) {
      await db.query(
        `
        INSERT INTO material_student_access (material_id, student_id, granted_by)
        SELECT $1, unnest($2::uuid[]), $3
        `,
        [id, student_ids, grantedBy]
      );
    }
  }

  // actualizam vizibilitatea materialului
  await db.query(
    'UPDATE materials SET visibility = $2 WHERE id = $1',
    [id, newVisibility]
  );

  return NextResponse.json({ ok: true });
}
