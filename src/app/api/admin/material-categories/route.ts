// app/api/admin/material-categories/route.ts
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  // const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const result = await db.query(
    `
    SELECT id, name, description, parent_id
    FROM material_categories
    ORDER BY name ASC
    `
  );

  return NextResponse.json({ data: result.rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { name, description, parent_id } = body;

  if (!name) {
    return NextResponse.json({ error: 'name required' }, { status: 400 });
  }

  const createdBy = session?.user?.id ?? null;

  const result = await db.query(
    `
    INSERT INTO material_categories (name, description, parent_id, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING id
    `,
    [name, description ?? null, parent_id ?? null, createdBy]
  );

  return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
}
