import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const REQUIRED_DOC_TYPES = [
  'adeverinta_student',
  'declaratie_semnata',
  'adeverinta_finalizare',
];

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { id } = await ctx.params; // student id (uuid)

  // 1) luam studentul
  const studentRes = await db.query<{
    id: string;
    status: string;
    user_id: string | null;
  }>(
    `SELECT id, status, user_id FROM students WHERE id = $1 LIMIT 1`,
    [id]
  );

  if (studentRes.rowCount === 0) {
    return NextResponse.json({ error: 'Studentul nu exista.' }, { status: 404 });
  }

  const student = studentRes.rows[0];

  // deja absolvent -> nu mai facem nimic
  if (student.status === 'absolvent') {
    return NextResponse.json({ ok: true, message: 'Studentul este deja absolvent.' });
  }

  // 2) validari de business

  // a) trebuie sa fie activ (in DB e 'active', noi in UI afisam 'activ')
  if (student.status !== 'active') {
    return NextResponse.json(
      { error: 'Studentul trebuie sa fie in status "active" pentru a fi marcat ca absolvent.' },
      { status: 400 }
    );
  }

  // b) trebuie sa aiba cont creat
  if (!student.user_id) {
    return NextResponse.json(
      { error: 'Studentul nu are cont creat. Nu poate fi marcat ca absolvent.' },
      { status: 400 }
    );
  }

  // 3) verificam documentele
  const docsRes = await db.query<{
    document_type: string;
    status: string;
    is_visible_to_student: boolean;
  }>(
    `
    SELECT document_type, status, is_visible_to_student
    FROM student_documents
    WHERE student_id = $1
    `,
    [id]
  );

  const docs = docsRes.rows;

  // construim un set cu docurile ok
  const present = new Set(
    docs
      .filter((d) => d.status !== 'rejected')
      .map((d) => d.document_type)
  );

  for (const required of REQUIRED_DOC_TYPES) {
    if (!present.has(required)) {
      return NextResponse.json(
        {
          error: `Studentului ii lipseste documentul obligatoriu: ${required}.`,
          missing: required,
        },
        { status: 400 }
      );
    }
  }

  // 4) totul e ok -> marcam ca absolvent
  await db.query(
    `UPDATE students SET status = 'graduate', updated_at = NOW() WHERE id = $1`,
    [id]
  );

  return NextResponse.json({ ok: true });
}
