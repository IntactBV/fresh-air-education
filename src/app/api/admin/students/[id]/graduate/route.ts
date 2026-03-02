// src/app/api/admin/students/[id]/graduate/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

const REQUIRED_APP_DOC_TYPES = [
  'adeverinta_student',
  'conventie_semnata',
  'extras_cont',
] as const;

const REQUIRED_STUDENT_DOC_TYPES = [
  'declaratie_evitare_dubla_finantare_semnata',
  'declaratie_eligibilitate_membru_semnata',
  'adeverinta_finalizare_stagiu',
] as const;

type RequiredAppDocType = (typeof REQUIRED_APP_DOC_TYPES)[number];
type RequiredStudentDocType = (typeof REQUIRED_STUDENT_DOC_TYPES)[number];

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  const { id } = await ctx.params;

  const studentRes = await db.query<{
    id: string;
    status: string;
    user_id: string | null;
    application_id: string;
  }>(
    `SELECT id, status, user_id, application_id FROM students WHERE id = $1 LIMIT 1`,
    [id],
  );

  if (studentRes.rowCount === 0) {
    return NextResponse.json({ error: 'Studentul nu exista.' }, { status: 404 });
  }

  const student = studentRes.rows[0];

  if (student.status === 'absolvent' || student.status === 'graduate') {
    return NextResponse.json({ ok: true, message: 'Studentul este deja absolvent.' });
  }

  if (student.status !== 'active') {
    return NextResponse.json(
      { error: 'Studentul trebuie sa fie in status "active" pentru a fi marcat ca absolvent.' },
      { status: 400 },
    );
  }

  if (!student.user_id) {
    return NextResponse.json(
      { error: 'Studentul nu are cont creat. Nu poate fi marcat ca absolvent.' },
      { status: 400 },
    );
  }

  // 1) required docs from application (single source of truth)
  const appDocsRes = await db.query<{
    document_type: string;
    status: string;
  }>(
    `
    SELECT document_type, status
    FROM student_application_documents
    WHERE student_application_id = $1
      AND document_type = ANY($2::text[])
    `,
    [student.application_id, REQUIRED_APP_DOC_TYPES],
  );

  const presentApp = new Set(
    appDocsRes.rows.filter((d) => d.status !== 'rejected').map((d) => d.document_type),
  );

  for (const required of REQUIRED_APP_DOC_TYPES) {
    if (!presentApp.has(required)) {
      return NextResponse.json(
        {
          error: `Studentului ii lipseste documentul obligatoriu: ${required}.`,
          missing: required as RequiredAppDocType,
        },
        { status: 400 },
      );
    }
  }

  // 2) required docs from student_documents
  const studentDocsRes = await db.query<{
    document_type: string;
    status: string;
  }>(
    `
    SELECT document_type, status
    FROM student_documents
    WHERE student_id = $1
      AND document_type = ANY($2::text[])
    `,
    [id, REQUIRED_STUDENT_DOC_TYPES],
  );

  const presentStudent = new Set(
    studentDocsRes.rows.filter((d) => d.status !== 'rejected').map((d) => d.document_type),
  );

  for (const required of REQUIRED_STUDENT_DOC_TYPES) {
    if (!presentStudent.has(required)) {
      return NextResponse.json(
        {
          error: `Studentului ii lipseste documentul obligatoriu: ${required}.`,
          missing: required as RequiredStudentDocType,
        },
        { status: 400 },
      );
    }
  }

  await db.query(`UPDATE students SET status = 'graduate', updated_at = NOW() WHERE id = $1`, [id]);

  return NextResponse.json({ ok: true });
}