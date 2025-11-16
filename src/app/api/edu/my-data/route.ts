// src/app/api/edu/my-data/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

async function getStudentForUser(userId: string) {
  const res = await db.query(
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
  if (!student || !student.application_id) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const res = await db.query(
    `
    SELECT
      sa.id,
      sa.email,
      sa.telefon,
      sa.nume,
      sa.prenume,
      sa.gen,
      sa.mediu_resedinta,
      sa.cnp,
      sa.judet,
      sa.localitate,
      sa.strada,
      sa.serie_ci,
      sa.numar_ci,
      sa.eliberat_de,
      sa.data_eliberarii,
      sa.institutie,
      sa.facultate,
      sa.specializare,
      sa.ciclu,
      sa.copie_buletin_blob_id,
      db.filename AS copie_buletin_filename
    FROM student_applications sa
    LEFT JOIN document_blobs db ON db.id = sa.copie_buletin_blob_id
    WHERE sa.id = $1
    LIMIT 1
    `,
    [student.application_id],
  );

  if (res.rows.length === 0) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const row = res.rows[0];

  return NextResponse.json({
    id: row.id,
    email: row.email,
    telefon: row.telefon,
    nume: row.nume,
    prenume: row.prenume,
    gen: row.gen,
    mediuResedinta: row.mediu_resedinta,
    cnp: row.cnp,
    judet: row.judet,
    localitate: row.localitate,
    strada: row.strada,
    serieCI: row.serie_ci,
    numarCI: row.numar_ci,
    eliberatDe: row.eliberat_de,
    dataEliberarii: row.data_eliberarii ? row.data_eliberarii.toISOString().slice(0, 10) : null,
    institutie: row.institutie,
    facultate: row.facultate,
    specializare: row.specializare,
    ciclu: row.ciclu,
    copieBuletinBlobId: row.copie_buletin_blob_id,
    copieBuletinNume: row.copie_buletin_filename,
  });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const student = await getStudentForUser(session.user.id);
  if (!student || !student.application_id) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }

  const body = await req.json();

  const {
    email,
    telefon,
    nume,
    prenume,
    gen,
    mediuResedinta,
    cnp,
    judet,
    localitate,
    strada,
    serieCI,
    numarCI,
    eliberatDe,
    dataEliberarii,
    institutie,
    facultate,
    specializare,
    ciclu,
    copieBuletinBlobId,
  } = body as {
    email?: string;
    telefon?: string;
    nume?: string;
    prenume?: string;
    gen?: string;
    mediuResedinta?: string;
    cnp?: string;
    judet?: string;
    localitate?: string;
    strada?: string;
    serieCI?: string;
    numarCI?: string;
    eliberatDe?: string;
    dataEliberarii?: string;
    institutie?: string;
    facultate?: string;
    specializare?: string;
    ciclu?: string;
    copieBuletinBlobId?: string | null;
  };

  await db.query(
    `
    UPDATE student_applications
    SET
      email = COALESCE($2, email),
      telefon = COALESCE($3, telefon),
      nume = COALESCE($4, nume),
      prenume = COALESCE($5, prenume),
      gen = COALESCE($6, gen),
      mediu_resedinta = COALESCE($7, mediu_resedinta),
      cnp = COALESCE($8, cnp),
      judet = COALESCE($9, judet),
      localitate = COALESCE($10, localitate),
      strada = COALESCE($11, strada),
      serie_ci = COALESCE($12, serie_ci),
      numar_ci = COALESCE($13, numar_ci),
      eliberat_de = COALESCE($14, eliberat_de),
      data_eliberarii = COALESCE($15::date, data_eliberarii),
      institutie = COALESCE($16, institutie),
      facultate = COALESCE($17, facultate),
      specializare = COALESCE($18, specializare),
      ciclu = COALESCE($19, ciclu),
      copie_buletin_blob_id = COALESCE($20::uuid, copie_buletin_blob_id),
      updated_at = now()
    WHERE id = $1
    `,
    [
      student.application_id,
      email ?? null,
      telefon ?? null,
      nume ?? null,
      prenume ?? null,
      gen ?? null,
      mediuResedinta ?? null,
      cnp ?? null,
      judet ?? null,
      localitate ?? null,
      strada ?? null,
      serieCI ?? null,
      numarCI ?? null,
      eliberatDe ?? null,
      dataEliberarii ?? null,
      institutie ?? null,
      facultate ?? null,
      specializare ?? null,
      ciclu ?? null,
      typeof copieBuletinBlobId === 'undefined' ? null : copieBuletinBlobId,
    ],
  );

  return NextResponse.json({ ok: true });
}
