// src/app/api/student-applications/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

type UploadedDocType = 'adeverinta_student' | 'conventie_semnata' | 'extras_cont';

const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
]);

function isValidUpload(file: File) {
  const mime = (file.type || '').toLowerCase();
  return ALLOWED_MIME.has(mime);
}

async function insertBlob(client: any, file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const filename = file.name || 'upload';
  const mimeType = file.type || 'application/octet-stream';
  const byteSize = buffer.byteLength;

  const insertBlobSql = `
    INSERT INTO document_blobs (filename, mime_type, byte_size, content)
    VALUES ($1, $2, $3, $4)
    RETURNING id, filename, mime_type, byte_size, uploaded_at;
  `;

  const blobRes = await client.query(insertBlobSql, [
    filename,
    mimeType,
    byteSize,
    buffer,
  ]);

  return blobRes.rows[0] as {
    id: string;
    filename: string;
    mime_type: string;
    byte_size: number;
    uploaded_at: string;
  };
}

async function upsertApplicationDocument(
  client: any,
  studentApplicationId: string,
  documentType: UploadedDocType,
  blobId: string
) {
  const sql = `
    INSERT INTO student_application_documents (
      student_application_id,
      document_type,
      blob_id,
      uploaded_by_role,
      uploaded_by_user,
      is_visible_to_student,
      status
    )
    VALUES ($1, $2, $3, 'student', NULL, true, 'uploaded')
    ON CONFLICT (student_application_id, document_type)
    DO UPDATE
      SET blob_id = EXCLUDED.blob_id,
          uploaded_by_role = EXCLUDED.uploaded_by_role,
          uploaded_by_user = EXCLUDED.uploaded_by_user,
          updated_at = now()
    RETURNING id;
  `;
  await client.query(sql, [studentApplicationId, documentType, blobId]);
}

export async function POST(req: NextRequest) {
  const client = await db.connect();

  try {
    const formData = await req.formData();

    // existing required file
    const copieBuletin = formData.get('copie_buletin') as File | null;

    // new optional files (may not be sent yet by FE)
    const adeverintaStudent = formData.get('adeverinta_student') as File | null;
    const conventieSemnata = formData.get('conventie_semnata') as File | null;
    const extrasCont = formData.get('extras_cont') as File | null;

    const email = (formData.get('email') as string) ?? '';
    const telefon = (formData.get('telefon') as string) ?? '';
    const nume = (formData.get('nume') as string) ?? '';
    const prenume = (formData.get('prenume') as string) ?? '';
    const gen = (formData.get('gen') as string) ?? '';
    const mediu_resedinta = (formData.get('mediu_resedinta') as string) ?? '';

    const cnp = (formData.get('cnp') as string) ?? '';
    const judet = (formData.get('judet') as string) ?? '';
    const localitate = (formData.get('localitate') as string) ?? '';
    const strada = (formData.get('strada') as string) ?? '';

    const serie_ci = (formData.get('serie_ci') as string) ?? '';
    const numar_ci = (formData.get('numar_ci') as string) ?? '';
    const eliberat_de = (formData.get('eliberat_de') as string) ?? '';
    const data_eliberarii_raw = (formData.get('data_eliberarii') as string) ?? '';

    const institutie = (formData.get('institutie') as string) ?? '';
    const facultate = (formData.get('facultate') as string) ?? '';
    const specializare = (formData.get('specializare') as string) ?? '';
    const ciclu = (formData.get('ciclu') as string) ?? '';

    const agreeRaw = (formData.get('agree') as string) ?? 'false';
    const termsRaw = (formData.get('terms') as string) ?? 'false';
    const agree = agreeRaw === 'true' || agreeRaw === '1';
    const terms = termsRaw === 'true' || termsRaw === '1';

    const data_eliberarii =
      data_eliberarii_raw && data_eliberarii_raw.trim().length > 0
        ? new Date(data_eliberarii_raw)
        : null;

    await client.query('BEGIN');

    // 1) copie buletin blob (existing behavior)
    let copieBuletinBlobId: string | null = null;

    if (copieBuletin instanceof File) {
      // keep existing behavior: accept PDF/JPG/PNG (same as FE)
      if (!isValidUpload(copieBuletin)) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Copie buletin: format invalid. Acceptat: PDF/JPG/PNG.' },
          { status: 400 }
        );
      }

      const blob = await insertBlob(client, copieBuletin);
      copieBuletinBlobId = blob.id;
    }

    // 2) insert student_application
    const insertApplicationSql = `
      INSERT INTO student_applications (
        email,
        telefon,
        nume,
        prenume,
        gen,
        mediu_resedinta,
        cnp,
        judet,
        localitate,
        strada,
        serie_ci,
        numar_ci,
        eliberat_de,
        data_eliberarii,
        copie_buletin_blob_id,
        institutie,
        facultate,
        specializare,
        ciclu,
        agree,
        terms
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,
        $7,$8,$9,$10,
        $11,$12,$13,$14,
        $15,
        $16,$17,$18,$19,
        $20,$21
      )
      RETURNING id, application_no;
    `;

    const appRes = await client.query(insertApplicationSql, [
      email,
      telefon,
      nume,
      prenume,
      gen,
      mediu_resedinta,
      cnp,
      judet,
      localitate,
      strada,
      serie_ci,
      numar_ci,
      eliberat_de,
      data_eliberarii,
      copieBuletinBlobId,
      institutie,
      facultate,
      specializare,
      ciclu,
      agree,
      terms,
    ]);

    const applicationId: string = appRes.rows[0].id;

    // 3) optional documents -> document_blobs + student_application_documents
    const optionalUploads: Array<{ key: string; type: UploadedDocType; file: File | null }> = [
      { key: 'adeverinta_student', type: 'adeverinta_student', file: adeverintaStudent },
      { key: 'conventie_semnata', type: 'conventie_semnata', file: conventieSemnata },
      { key: 'extras_cont', type: 'extras_cont', file: extrasCont },
    ];

    for (const u of optionalUploads) {
      if (!(u.file instanceof File)) continue;

      if (!isValidUpload(u.file)) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: `${u.key}: format invalid. Acceptat: PDF/JPG/PNG.` },
          { status: 400 }
        );
      }

      const blob = await insertBlob(client, u.file);
      await upsertApplicationDocument(client, applicationId, u.type, blob.id);
    }

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        applicationId,
        applicationNo: appRes.rows[0].application_no,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Eroare la crearea aplicatiei de student:', error);
    try {
      await client.query('ROLLBACK');
    } catch {
      // ignore
    }
    return NextResponse.json(
      { error: 'Eroare la salvarea aplicatiei.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}