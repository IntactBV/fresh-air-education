// src/app/api/admin/student-applications/[id]/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

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
        sa.created_at,

        st.id AS student_id,

        ss.series_id AS serie_id,
        sr.name AS serie_name,
        stt.tutor_user_id AS tutor_user_id
      FROM student_applications sa
      LEFT JOIN document_blobs db ON db.id = sa.copie_buletin_blob_id

      LEFT JOIN students st ON st.application_id = sa.id

      LEFT JOIN LATERAL (
        SELECT series_id
        FROM student_series
        WHERE student_id = st.id
        ORDER BY assigned_at DESC
        LIMIT 1
      ) ss ON TRUE
      LEFT JOIN series sr ON sr.id = ss.series_id
      LEFT JOIN student_tutors stt ON stt.student_id = st.id

      WHERE sa.id = $1
      LIMIT 1
    `;

    const result = await db.query(sql, [id]);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Aplicația nu a fost găsită.' },
        { status: 404 }
      );
    }

    const docsRes = await db.query(
      `
      SELECT
        sad.id,
        sad.document_type,
        sad.blob_id,
        sad.created_at,
        sad.updated_at,
        sad.uploaded_by_role,
        sad.uploaded_by_user,
        sad.is_visible_to_student,
        sad.status,
        b.filename,
        b.mime_type,
        b.byte_size,
        b.uploaded_at
      FROM student_application_documents sad
      JOIN document_blobs b ON b.id = sad.blob_id
      WHERE sad.student_application_id = $1
      ORDER BY sad.created_at DESC
      `,
      [id]
    );

    const documents = (docsRes.rows || []).map((r: any) => {
      const blobId = r.blob_id as string;
      return {
        id: r.id as string,
        type: r.document_type as string,
        blobId,
        filename: (r.filename as string) ?? null,
        mimeType: (r.mime_type as string) ?? null,
        byteSize: typeof r.byte_size === 'number' ? r.byte_size : null,
        uploadedAt: (r.uploaded_at as string) ?? (r.created_at as string) ?? null,
        uploadedByRole: (r.uploaded_by_role as string) ?? null,
        uploadedByUser: (r.uploaded_by_user as string) ?? null,
        isVisibleToStudent: Boolean(r.is_visible_to_student),
        status: (r.status as string) ?? null,
        viewUrl: `/api/admin/document-blobs/${blobId}`,
        downloadUrl: `/api/admin/document-blobs/${blobId}/download`,
      };
    });

    return NextResponse.json({
      ...result.rows[0],
      documents,
    });
  } catch (err) {
    console.error('error fetching student application details:', err);
    return NextResponse.json(
      { error: 'Eroare la preluarea aplicației.' },
      { status: 500 }
    );
  }
}