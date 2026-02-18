// src/app/api/admin/students/assign-tutor/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const assignSchema = z.object({
  studentIds: z.array(z.string().min(1)).min(1),
  tutorUserId: z.string().min(1).nullable(), // poate fi si null (deasignare)
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const json = await req.json();
  const parsed = assignSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentIds, tutorUserId } = parsed.data;

  // 1) stergem orice asignare existenta pentru acesti studenti
  await db.query(
    `DELETE FROM student_tutors WHERE student_id = ANY($1::uuid[])`,
    [studentIds]
  );

  // 2) daca tutorUserId e null => ne oprim aici (deasignare)
  if (tutorUserId === null) {
    return NextResponse.json({ ok: true });
  }

  // 3) altfel inseram tutorele nou (1 tutore per student => PK student_id)
  const assignedBy = session?.user?.id ?? null;
  const values: string[] = [];
  const params: any[] = [];
  let idx = 1;

  for (const studentId of studentIds) {
    values.push(`($${idx++}::uuid, $${idx++}::text, NOW(), $${idx++}::text)`);
    params.push(studentId, tutorUserId, assignedBy);
  }

  await db.query(
    `
    INSERT INTO student_tutors (student_id, tutor_user_id, assigned_at, assigned_by)
    VALUES ${values.join(', ')}
    `,
    params
  );

  return NextResponse.json({ ok: true });
}
