// src/app/api/edu/my-documents/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

async function getStudentForUser(userId: string) {
  const res = await db.query(
    `
    SELECT id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return res.rows[0] ?? null;
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);

  // citim sabloanele globale (valabile pentru toti studentii)
  const resTemplates = await db.query(
    `
    SELECT
      t.document_type,
      t.blob_id,
      b.filename,
      b.mime_type,
      b.byte_size,
      b.uploaded_at
    FROM acroform_templates t
    JOIN document_blobs b ON b.id = t.blob_id
    WHERE t.document_type IN (
      'template_declaratie_evitare_dubla_finantare',
      'template_declaratie_eligibilitate_membru'
    )
    `
  );

  let declEvitareDublaFinantareTemplate: any = null;
  let declEligibilitateMembruTemplate: any = null;

  for (const row of resTemplates.rows) {
    const tplDto = {
      blobId: row.blob_id,
      name: row.filename,
      mimeType: row.mime_type,
      sizeBytes: row.byte_size,
      uploadedAt: row.uploaded_at,
    };

    if (row.document_type === 'template_declaratie_evitare_dubla_finantare') {
      declEvitareDublaFinantareTemplate = tplDto;
    }
    if (row.document_type === 'template_declaratie_eligibilitate_membru') {
      declEligibilitateMembruTemplate = tplDto;
    }
  }

  // daca nu exista student, intoarcem sloturile de documente null + sabloane (daca exista)
  if (!student) {
    return NextResponse.json(
      {
        adeverintaStudent: null,
        declEvitareDublaFinantareSemnata: null,
        declEligibilitateMembruSemnata: null,
        adeverintaFinalizareStagiu: null,
        declEvitareDublaFinantareTemplate,
        declEligibilitateMembruTemplate,
      },
      { status: 200 },
    );
  }

  // luam toate documentele relevante, indiferent cine le-a incarcat (student / admin / system)
  const resDocs = await db.query(
    `
    SELECT
      sd.id,
      sd.document_type,
      sd.blob_id,
      sd.status,
      sd.is_visible_to_student,
      sd.created_at,
      sd.uploaded_by_role,
      db.filename,
      db.mime_type,
      db.byte_size
    FROM student_documents sd
    JOIN document_blobs db ON db.id = sd.blob_id
    WHERE sd.student_id = $1
      AND sd.document_type IN (
        'adeverinta_student',
        'declaratie_evitare_dubla_finantare_semnata',
        'declaratie_eligibilitate_membru_semnata',
        'adeverinta_finalizare_stagiu'
      )
    ORDER BY sd.created_at DESC
    `,
    [student.id],
  );

  let adeverintaStudent: any = null;
  let declEvitareDublaFinantareSemnata: any = null;
  let declEligibilitateMembruSemnata: any = null;
  let adeverintaFinalizareStagiu: any = null;

  for (const row of resDocs.rows) {
    if (row.is_visible_to_student === false) continue;

    const docDto = {
      id: row.id,
      blobId: row.blob_id,
      name: row.filename,
      mimeType: row.mime_type,
      sizeBytes: row.byte_size,
      uploadedAt: row.created_at,
      status: row.status,
      uploadedByRole: row.uploaded_by_role,
      url: `/api/edu/my-documents/${row.id}`,
    };

    if (row.document_type === 'adeverinta_student' && !adeverintaStudent) {
      adeverintaStudent = docDto;
    }
    if (row.document_type === 'declaratie_evitare_dubla_finantare_semnata' && !declEvitareDublaFinantareSemnata) {
      declEvitareDublaFinantareSemnata = docDto;
    }
    if (row.document_type === 'declaratie_eligibilitate_membru_semnata' && !declEligibilitateMembruSemnata) {
      declEligibilitateMembruSemnata = docDto;
    }
    if (row.document_type === 'adeverinta_finalizare_stagiu' && !adeverintaFinalizareStagiu) {
      adeverintaFinalizareStagiu = docDto;
    }
  }

  return NextResponse.json(
    {
      adeverintaStudent,
      declEvitareDublaFinantareSemnata,
      declEligibilitateMembruSemnata,
      adeverintaFinalizareStagiu,
      declEvitareDublaFinantareTemplate,
      declEligibilitateMembruTemplate,
    },
    { status: 200 },
  );
}
