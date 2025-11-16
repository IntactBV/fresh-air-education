// src/app/api/admin/students/[id]/route.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

function normalizeStatus(status: string | null): string {
  return status === 'active'
    ? 'activ'
    : status === 'inactive'
    ? 'inactiv'
    : status === 'graduate'
    ? 'absolvent'
    : status ?? 'activ';
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: req.headers });
  // daca vrei sa limitezi:
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await ctx.params; // uuid student

  // 1) student + cererea lui (join direct, pt ca application_id e mereu populat)
  const studentRes = await db.query<{
    s_id: string;
    s_application_id: string;
    s_user_id: string | null;
    s_email: string;
    s_telefon: string | null;
    s_nume: string;
    s_prenume: string;
    s_cnp: string | null;
    s_status: string;
    s_created_at: string;
    s_updated_at: string;
    s_student_no: string | number | null;

    // din student_applications:
    a_id: string;
    a_application_no: string | number | null;
    a_email: string;
    a_telefon: string;
    a_nume: string;
    a_prenume: string;
    a_gen: string;
    a_mediu_resedinta: string;
    a_cnp: string;
    a_judet: string;
    a_localitate: string;
    a_strada: string;
    a_serie_ci: string;
    a_numar_ci: string;
    a_eliberat_de: string;
    a_data_eliberarii: string;
    a_institutie: string;
    a_facultate: string;
    a_specializare: string;
    a_ciclu: string;
    a_copie_buletin_blob_id: string | null;
    a_status: string;
    a_created_at: string;
  }>(
    `
    SELECT
      s.id AS s_id,
      s.application_id AS s_application_id,
      s.user_id AS s_user_id,
      s.email AS s_email,
      s.telefon AS s_telefon,
      s.nume AS s_nume,
      s.prenume AS s_prenume,
      s.cnp AS s_cnp,
      s.status AS s_status,
      s.created_at AS s_created_at,
      s.updated_at AS s_updated_at,
      s.student_no AS s_student_no,

      a.id AS a_id,
      a.application_no AS a_application_no,
      a.email AS a_email,
      a.telefon AS a_telefon,
      a.nume AS a_nume,
      a.prenume AS a_prenume,
      a.gen AS a_gen,
      a.mediu_resedinta AS a_mediu_resedinta,
      a.cnp AS a_cnp,
      a.judet AS a_judet,
      a.localitate AS a_localitate,
      a.strada AS a_strada,
      a.serie_ci AS a_serie_ci,
      a.numar_ci AS a_numar_ci,
      a.eliberat_de AS a_eliberat_de,
      a.data_eliberarii AS a_data_eliberarii,
      a.institutie AS a_institutie,
      a.facultate AS a_facultate,
      a.specializare AS a_specializare,
      a.ciclu AS a_ciclu,
      a.copie_buletin_blob_id AS a_copie_buletin_blob_id,
      a.status AS a_status,
      a.created_at AS a_created_at
    FROM students s
    INNER JOIN student_applications a ON a.id = s.application_id
    WHERE s.id = $1
    LIMIT 1
    `,
    [id]
  );

  if (studentRes.rowCount === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const row = studentRes.rows[0];

  // 2) seria studentului (daca exista)
  const seriesRes = await db.query<{
    series_id: string;
    series_name: string;
  }>(
    `
    SELECT ss.series_id, se.name AS series_name
    FROM student_series ss
    LEFT JOIN series se ON se.id = ss.series_id
    WHERE ss.student_id = $1
    LIMIT 1
    `,
    [id]
  );

  const series = seriesRes.rowCount
    ? {
        id: seriesRes.rows[0].series_id,
        name: seriesRes.rows[0].series_name,
      }
    : null;

  // 3) documentele studentului (din student_documents + document_blobs)
  const docsRes = await db.query<{
    id: string;
    document_type: string;
    blob_id: string;
    uploaded_by_role: string;
    uploaded_by_user: string | null;
    is_visible_to_student: boolean;
    status: string;
    created_at: string;
    filename: string;
    mime_type: string;
  }>(
    `
    SELECT
      sd.id,
      sd.document_type,
      sd.blob_id,
      sd.uploaded_by_role,
      sd.uploaded_by_user,
      sd.is_visible_to_student,
      sd.status,
      sd.created_at,
      db.filename,
      db.mime_type
    FROM student_documents sd
    INNER JOIN document_blobs db ON db.id = sd.blob_id
    WHERE sd.student_id = $1
    ORDER BY sd.created_at DESC
    `,
    [id]
  );

  const documents = docsRes.rows.map((d) => ({
    id: d.id,
    type: d.document_type,
    blobId: d.blob_id,
    filename: d.filename,
    mimeType: d.mime_type,
    uploadedAt: d.created_at,
    uploadedByRole: d.uploaded_by_role,
    uploadedByUser: d.uploaded_by_user,
    isVisibleToStudent: d.is_visible_to_student,
    status: d.status,
    viewUrl: `/api/admin/document-blobs/${d.blob_id}`,
    downloadUrl: `/api/admin/document-blobs/${d.blob_id}/download`,
  }));

  // 4) copia de buletin din aplicatie (e in student_applications, nu in student_documents)
  // luam si filename-ul pt copia de buletin
  let copieBuletin: { blobId: string; downloadUrl: string; filename: string | null } | null = null;
  if (row.a_copie_buletin_blob_id) {
    const copieRes = await db.query<{ filename: string | null }>(
      `SELECT filename FROM document_blobs WHERE id = $1 LIMIT 1`,
      [row.a_copie_buletin_blob_id]
    );
    copieBuletin = {
      blobId: row.a_copie_buletin_blob_id,
      downloadUrl: `/api/admin/document-blobs/${row.a_copie_buletin_blob_id}`,
      filename: copieRes.rowCount ? copieRes.rows[0].filename : null,
    };
  }

  // raspuns final
  return NextResponse.json({
    student: {
      id: row.s_id,
      studentNo: row.s_student_no,
      applicationId: row.s_application_id,
      userId: row.s_user_id,
      email: row.s_email,
      telefon: row.s_telefon,
      nume: row.s_nume,
      prenume: row.s_prenume,
      cnp: row.s_cnp,
      status: normalizeStatus(row.s_status),
      createdAt: row.s_created_at,
      updatedAt: row.s_updated_at,
    },
    application: {
      id: row.a_id,
      applicationNo: row.a_application_no,
      email: row.a_email,
      telefon: row.a_telefon,
      nume: row.a_nume,
      prenume: row.a_prenume,
      gen: row.a_gen,
      mediuResedinta: row.a_mediu_resedinta,
      cnp: row.a_cnp,
      judet: row.a_judet,
      localitate: row.a_localitate,
      strada: row.a_strada,
      serieCI: row.a_serie_ci,
      numarCI: row.a_numar_ci,
      eliberatDe: row.a_eliberat_de,
      dataEliberarii: row.a_data_eliberarii,
      institutie: row.a_institutie,
      facultate: row.a_facultate,
      specializare: row.a_specializare,
      ciclu: row.a_ciclu,
      status: row.a_status,
      createdAt: row.a_created_at,
      copieBuletin: copieBuletin,
    },
    series,     // null sau { id, name }
    documents,  // array din student_documents
  });
}
