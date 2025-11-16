import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // 👈 trebuie await
  const seriesId = id; // e uuid string, nu il mai convertim

  // stergem intai asignarile
  await db.query(`DELETE FROM student_series WHERE series_id = $1`, [seriesId]);

  // TODO: cand avem material_series:
  // await db.query(`DELETE FROM material_series WHERE series_id = $1`, [seriesId]);

  const del = await db.query(`DELETE FROM series WHERE id = $1`, [seriesId]);
  if (del.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
