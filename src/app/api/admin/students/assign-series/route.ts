import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const assignSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1),
  seriesId: z.string().min(1).nullable(), // acum poate fi si null
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = assignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentIds, seriesId } = parsed.data;

  // 1) stergem orice asignare existenta pentru acesti studenti
  await db.query(
    `DELETE FROM student_series WHERE student_id = ANY($1::uuid[])`,
    [studentIds]
  );

  // 2) daca seriesId e null => ne oprim aici (deasignare)
  if (seriesId === null) {
    return NextResponse.json({ ok: true });
  }

  // 3) altfel inseram seria noua
  const assignedBy = session?.user?.id ?? null;
  const values: string[] = [];
  const params: any[] = [];
  let idx = 1;

  for (const studentId of studentIds) {
    values.push(`($${idx++}::uuid, $${idx++}::uuid, NOW(), $${idx++}::text)`);
    params.push(studentId, seriesId, assignedBy);
  }

  await db.query(
    `
    INSERT INTO student_series (student_id, series_id, assigned_at, assigned_by)
    VALUES ${values.join(', ')}
    `,
    params
  );

  return NextResponse.json({ ok: true });
}
