import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { z } from 'zod';
import { auth } from '@/utils/auth';

const updateSeriesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { id } = await context.params;
  const seriesId = id;

  const json = await req.json();
  const parsed = updateSeriesSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description } = parsed.data;
  const trimmedName = name.trim();
  const trimmedDescription = description?.trim() || null;

  const existing = await db.query(
    `SELECT id FROM series WHERE id = $1 LIMIT 1`,
    [seriesId]
  );

  if (!existing.rowCount) {
    return NextResponse.json({ error: 'Seria nu a fost gasita.' }, { status: 404 });
  }

  const duplicate = await db.query(
    `
      SELECT id
      FROM series
      WHERE LOWER(name) = LOWER($1)
        AND id <> $2
      LIMIT 1
    `,
    [trimmedName, seriesId]
  );

  if (duplicate.rowCount && duplicate.rowCount > 0) {
    return NextResponse.json({ error: 'E deja o serie cu acest nume.' }, { status: 409 });
  }

  const updated = await db.query<{
    id: string;
    name: string;
    description: string | null;
    created_at: string;
    created_by: string | null;
    created_by_name: string | null;
    members_count: number;
  }>(
    `
      UPDATE series s
      SET
        name = $1,
        description = $2
      WHERE s.id = $3
      RETURNING
        s.id,
        s.name,
        s.description,
        s.created_at,
        s.created_by,
        s.created_by_name,
        (
          SELECT COUNT(*)
          FROM student_series ss
          WHERE ss.series_id = s.id
        ) AS members_count
    `,
    [trimmedName, trimmedDescription, seriesId]
  );

  const s = updated.rows[0];

  return NextResponse.json({
    id: s.id,
    name: s.name,
    description: s.description,
    createdAt: s.created_at,
    createdBy: s.created_by,
    createdByName: s.created_by_name,
    membersCount: Number(s.members_count || 0),
  });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const seriesId = id;

  await db.query(`DELETE FROM student_series WHERE series_id = $1`, [seriesId]);

  const del = await db.query(`DELETE FROM series WHERE id = $1`, [seriesId]);

  if (del.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}