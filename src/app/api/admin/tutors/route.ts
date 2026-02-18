// src/app/api/admin/tutors/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/utils/auth';
import { db } from '@/utils/db';

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session || session.user.role !== 'admin') {
  //   return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  // }

  const res = await db.query<{
    id: string;
    email: string;
    name: string | null;
    role: string;
  }>(
    `
    SELECT id, email, name, "role"
    FROM "user"
    WHERE "role" IN ('admin', 'tutore')
    ORDER BY COALESCE(name, email) ASC
    `
  );

  return NextResponse.json(res.rows);
}
