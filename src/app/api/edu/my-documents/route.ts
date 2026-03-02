// src/app/api/edu/my-documents/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

type StudentRow = { id: string; application_id: string };

async function getStudentForUser(userId: string): Promise<StudentRow | null> {
  const res = await db.query<StudentRow>(
    `
    SELECT id, application_id
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
      'template_declaratie_eligibilitate_membru',
      'template_conventie_cadru',
      'template_acord_date_caracter_personal'
    )
    `,
  );

  let declEvitareDublaFinantareTemplate: any = null;
  let declEligibilitateMembruTemplate: any = null;
  let conventieCadruTemplate: any = null;

  let acordPrelucrareDatePersonaleTemplate: any = null;

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
    if (row.document_type === 'template_conventie_cadru') {
      conventieCadruTemplate = tplDto;
    }
    if (row.document_type === 'template_acord_date_caracter_personal') {
      acordPrelucrareDatePersonaleTemplate = tplDto;
    }
  }

  if (!student) {
    return NextResponse.json(
      {
        adeverintaStudent: null,
        extrasCont: null,
        conventieSemnata: null,
        acordPrelucrareDatePersonaleSemnat: null,

        declEvitareDublaFinantareSemnata: null,
        declEligibilitateMembruSemnata: null,
        adeverintaFinalizareStagiu: null,

        declEvitareDublaFinantareTemplate,
        declEligibilitateMembruTemplate,
        conventieCadruTemplate,
        acordPrelucrareDatePersonaleTemplate,
      },
      { status: 200 },
    );
  }

  // ---- app docs (single source of truth) ----
  const resAppDocs = await db.query(
    `
    SELECT
      sad.id,
      sad.document_type,
      sad.blob_id,
      sad.status,
      sad.is_visible_to_student,
      sad.created_at,
      sad.uploaded_by_role,
      db.filename,
      db.mime_type,
      db.byte_size
    FROM student_application_documents sad
    JOIN document_blobs db ON db.id = sad.blob_id
    WHERE sad.student_application_id = $1
      AND sad.document_type IN (
        'adeverinta_student',
        'conventie_semnata',
        'extras_cont',
        'acord_prelucrare_date_personale_semnat'
      )
    ORDER BY sad.created_at DESC
    `,
    [student.application_id],
  );

  let adeverintaStudent: any = null;
  let conventieSemnata: any = null;
  let extrasCont: any = null;
  let acordPrelucrareDatePersonaleSemnat: any = null;

  for (const row of resAppDocs.rows) {
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
    if (row.document_type === 'conventie_semnata' && !conventieSemnata) {
      conventieSemnata = docDto;
    }
    if (row.document_type === 'extras_cont' && !extrasCont) {
      extrasCont = docDto;
    }
    if (row.document_type === 'acord_prelucrare_date_personale_semnat' && !acordPrelucrareDatePersonaleSemnat) {
      acordPrelucrareDatePersonaleSemnat = docDto;
    }
  }

  // ---- student docs ----
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
        'declaratie_evitare_dubla_finantare_semnata',
        'declaratie_eligibilitate_membru_semnata',
        'adeverinta_finalizare_stagiu'
      )
    ORDER BY sd.created_at DESC
    `,
    [student.id],
  );

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
      extrasCont,
      conventieSemnata,
      acordPrelucrareDatePersonaleSemnat,

      declEvitareDublaFinantareSemnata,
      declEligibilitateMembruSemnata,
      adeverintaFinalizareStagiu,

      declEvitareDublaFinantareTemplate,
      declEligibilitateMembruTemplate,
      conventieCadruTemplate,
      acordPrelucrareDatePersonaleTemplate,
    },
    { status: 200 },
  );
}