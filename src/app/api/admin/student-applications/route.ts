// src/app/api/admin/student-applications/route.ts
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 50);
  const offset = Number(searchParams.get('offset') || 0);
  const status = searchParams.get('status');

  const client = await db.connect();
  try {
    const params: any[] = [];
    let where = '';
    if (status) {
      params.push(status);
      where = `WHERE status = $${params.length}`;
    }

    params.push(limit);
    params.push(offset);

    const sql = `
      SELECT
        id,
        application_no,
        nume,
        prenume,
        email,
        telefon,
        status,
        created_at
      FROM student_applications
      ${where}
      ORDER BY created_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const result = await client.query(sql, params);

    return NextResponse.json({ items: result.rows });
  } catch (err) {
    console.error('error fetching student applications:', err);
    return NextResponse.json({ error: 'Eroare la listarea aplicațiilor.' }, { status: 500 });
  } finally {
    client.release();
  }
}
