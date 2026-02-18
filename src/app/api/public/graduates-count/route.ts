import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET() {
  try {
    const q = await db.query<{ count: string }>(
      `
      SELECT COUNT(*)::text AS count
      FROM students
      `
    );

    const graduatesCount = Number(q.rows[0]?.count ?? 0);

    const res = NextResponse.json({ graduatesCount });

    res.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300'
    );

    return res;
  } catch (err) {
    return NextResponse.json(
      { error: 'Unable to load graduates count.' },
      { status: 500 }
    );
  }
}
