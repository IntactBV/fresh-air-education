//src/app/api/tutore/dashboard/route.ts

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  try {
    // le rulam in paralel
    const [
      enrolledStudentsQ,
      graduatesQ,
      materialsQ,
    ] = await Promise.all([
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM students
        WHERE status IN ('active', 'inactive', 'graduate')
        `
      ),
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM students
        WHERE status = 'graduate'
        `
      ),
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM materials
        `
      ),
      
    ]);

    const enrolledStudentsCount = Number(enrolledStudentsQ.rows[0]?.count ?? 0);
    const graduatesCount = Number(graduatesQ.rows[0]?.count ?? 0);
    const studentMaterialsCount = Number(materialsQ.rows[0]?.count ?? 0);

    return NextResponse.json({
      enrolledStudentsCount,
      graduatesCount,
      studentMaterialsCount,

      currentUserName: session?.user?.name ?? null,
    });
  } catch (error) {
    console.error('Eroare la /api/tutore/dashboard:', error);
    return NextResponse.json(
      { error: 'Nu am putut incarca datele pentru dashboard.' },
      { status: 500 }
    );
  }
}
