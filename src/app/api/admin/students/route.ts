import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { searchParams } = new URL(req.url);
  const serieId = searchParams.get('serieId');
  const hasSerieFilter = !!serieId;

  // ATENTIE: folosim nume/prenume/telefon (in romana), ca in UPDATE-ul tau
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
      se.name AS series_name
    FROM students st
    LEFT JOIN student_series ss ON ss.student_id = st.id
    LEFT JOIN series se ON se.id = ss.series_id
    ${hasSerieFilter ? 'WHERE ss.series_id = $1' : ''}
    ORDER BY st.created_at DESC NULLS LAST
    `,
    hasSerieFilter ? [serieId] : []
  );

  // mapam in formatul pe care il asteapta componenta
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
    }))
  );

}
