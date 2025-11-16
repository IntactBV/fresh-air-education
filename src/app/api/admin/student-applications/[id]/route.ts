// src/app/api/admin/student-applications/[id]/route.ts
import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.connect();
  try {
    const sql = `
      SELECT
        sa.id,
        sa.application_no,
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
        sa.copie_buletin_blob_id,
        db.filename AS copie_buletin_filename,
        sa.institutie,
        sa.facultate,
        sa.specializare,
        sa.ciclu,
        sa.agree,
        sa.terms,
        sa.status,
        sa.admin_note,
        sa.reviewed_by,
        sa.reviewed_at,
        sa.created_at
      FROM student_applications sa
      LEFT JOIN document_blobs db ON db.id = sa.copie_buletin_blob_id
      WHERE sa.id = $1
      LIMIT 1
    `;

    const result = await client.query(sql, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Aplicația nu a fost găsită.' }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error('error fetching student application details:', err);
    return NextResponse.json({ error: 'Eroare la preluarea aplicației.' }, { status: 500 });
  } finally {
    client.release();
  }
}
