import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

type RouteParams = { id: string };

export async function GET(_req: NextRequest, context: { params: Promise<RouteParams> }) {
  const { id } = await context.params;
  const seriesId = Number(id);
  if (Number.isNaN(seriesId)) {
    return NextResponse.json({ error: 'Invalid series id' }, { status: 400 });
  }

  const result = await db.query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM student_series WHERE series_id = $1`,
    [seriesId]
  );

  const count = Number(result.rows[0]?.count || 0);
  return NextResponse.json({ seriesId, membersCount: count });
}
