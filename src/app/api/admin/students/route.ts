// src/app/api/admin/students/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session || (session.user.role !== 'admin' && session.user.role !== 'tutore')) {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  const { searchParams } = new URL(req.url);
  const serieId = searchParams.get('serieId');   // UUID
  const tutorId = searchParams.get('tutorId');   // TEXT (user id)

  const where: string[] = [];
  const params: any[] = [];
  let idx = 1;

  if (serieId) {
    where.push(`ss.series_id = $${idx++}`);
    params.push(serieId);
  }

  if (tutorId) {
    // daca vrei si suport pt "__none__", poti trece tutorId="__none__" si sa tratezi aici:
    // where.push(`stt.tutor_user_id IS NULL`)
    where.push(`stt.tutor_user_id = $${idx++}`);
    params.push(tutorId);
  }

  const result = await db.query<{
    id: string;
    student_no: number | null;
    nume: string;
    prenume: string;
    email: string;
    telefon: string | null;
    status: string | null;
    created_at: string | null;

    series_id: string | null;
    series_name: string | null;

    tutor_user_id: string | null;
    tutor_name: string | null;
  }>(
    `
    SELECT
      st.id,
      st.student_no,
      st.nume,
      st.prenume,
      st.email,
      st.telefon,
      st.status,
      st.created_at,
      ss.series_id,
      se.name AS series_name,
      stt.tutor_user_id,
      COALESCE(u.name, u.email) AS tutor_name
    FROM students st
    LEFT JOIN student_series ss ON ss.student_id = st.id
    LEFT JOIN series se ON se.id = ss.series_id
    LEFT JOIN student_tutors stt ON stt.student_id = st.id
    LEFT JOIN "user" u ON u.id = stt.tutor_user_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY st.created_at DESC NULLS LAST
    `,
    params
  );

  return NextResponse.json(
    result.rows.map((r) => ({
      id: r.id,
      studentNo: r.student_no,
      firstName: r.prenume,
      lastName: r.nume,
      email: r.email,
      phone: r.telefon,
      approvedAt: r.created_at,
      status:
        r.status === 'active'
          ? 'activ'
          : r.status === 'inactive'
          ? 'inactiv'
          : r.status === 'graduate'
          ? 'absolvent'
          : r.status ?? 'activ',
      serieId: r.series_id,
      serieName: r.series_name ?? '',
      tutorUserId: r.tutor_user_id,
      tutorName: r.tutor_name ?? '',
    }))
  );
}
