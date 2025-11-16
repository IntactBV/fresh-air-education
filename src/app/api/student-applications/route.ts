// src/app/api/student-applications/route.ts
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db'; // <- acum din utils

export async function POST(req: NextRequest) {
  const client = await db.connect();

  try {
    const formData = await req.formData();

    const copieBuletin = formData.get('copie_buletin') as File | null;

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

    let copieBuletinBlobId: string | null = null;

    if (copieBuletin instanceof File) {
      const arrayBuffer = await copieBuletin.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const insertBlobSql = `
        INSERT INTO document_blobs (filename, mime_type, byte_size, content)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;

      const blobRes = await client.query(insertBlobSql, [
        copieBuletin.name,
        copieBuletin.type || 'application/octet-stream',
        buffer.byteLength,
        buffer,
      ]);

      copieBuletinBlobId = blobRes.rows[0].id;
    }

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
      data_eliberarii, // poate fi null
      copieBuletinBlobId, // poate fi null
      institutie,
      facultate,
      specializare,
      ciclu,
      agree,
      terms,
    ]);

    await client.query('COMMIT');

    return NextResponse.json(
      {
        success: true,
        applicationId: appRes.rows[0].id,
        applicationNo: appRes.rows[0].application_no,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Eroare la crearea aplicației de student:', error);
    await client.query('ROLLBACK');
    return NextResponse.json(
      { error: 'Eroare la salvarea aplicației.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
