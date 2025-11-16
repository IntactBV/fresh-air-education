import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { z } from 'zod';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const result = await db.query<{
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    created_by: string | null;
    created_by_name: string | null;
    members_count: number;
  }>(
    `
    SELECT
      s.id,
      s.name,
      s.description,
      s.created_at,
      s.created_by,
      s.created_by_name,
      COUNT(ss.student_id) AS members_count
    FROM series s
    LEFT JOIN student_series ss ON ss.series_id = s.id
    GROUP BY s.id
    ORDER BY s.created_at DESC
    `
  );

  return NextResponse.json(
    result.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.created_at,
      createdBy: r.created_by,
      createdByName: r.created_by_name,
      membersCount: Number(r.members_count || 0),
    }))
  );
}

const createSeriesSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = createSeriesSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description } = parsed.data;
  const createdBy = session?.user?.id ?? null;
  const createdByName = session?.user?.name ?? null;


  // verifica unicitate nume (case-insensitive)
  const exists = await db.query(
    `SELECT id FROM series WHERE LOWER(name) = LOWER($1) LIMIT 1`,
    [name.trim()]
  );
  if (exists.rowCount && exists.rowCount > 0) {
    return NextResponse.json({ error: 'E deja o serie cu acest nume.' }, { status: 409 });
  }

  const insert = await db.query<
    { id: number; name: string; description: string | null; created_at: string; created_by: string | null; created_by_name: string | null; }
  >(
    `
    INSERT INTO series (name, description, created_at, created_by, created_by_name)
    VALUES ($1, $2, NOW(), $3, $4)
    RETURNING id, name, description, created_at, created_by, created_by_name
    `,
    [name.trim(), description?.trim() || null, createdBy, createdByName]
  );

  const s = insert.rows[0];

  return NextResponse.json(
    {
      id: s.id,
      name: s.name,
      description: s.description,
      createdAt: s.created_at,
      createdBy: s.created_by,
      createdByName: s.created_by_name,
      membersCount: 0,
    },
    { status: 201 }
  );
}