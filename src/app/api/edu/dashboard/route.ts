// src/app/api/edu/dashboard/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1) aflam studentul curent
    const studentRes = await db.query<{ id: string }>(
      `
      SELECT id
      FROM students
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [session.user.id],
    );

    const student = studentRes.rows[0];
    if (!student) {
      // daca nu exista inca student legat, trimitem 0 materiale si listele publice
      const [announcementsQ, methodologiesQ] = await Promise.all([
        db.query(
          `
          SELECT id, title, description, blob_id, mime_type, published_at, created_at
          FROM public_documents
          WHERE section = 'announcement'
            AND published = true
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT 5
          `,
        ),
        db.query(
          `
          SELECT id, title, description, blob_id, mime_type, published_at, created_at
          FROM public_documents
          WHERE section = 'methodology'
            AND published = true
          ORDER BY published_at DESC NULLS LAST, created_at DESC
          LIMIT 5
          `,
        ),
      ]);

      return NextResponse.json({
        currentUserName: session.user.name ?? null,
        materialsCount: 0,
        announcements: announcementsQ.rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          blobId: r.blob_id,
          mimeType: r.mime_type,
          publishedAt: r.published_at,
          createdAt: r.created_at,
        })),
        methodologies: methodologiesQ.rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          blobId: r.blob_id,
          mimeType: r.mime_type,
          publishedAt: r.published_at,
          createdAt: r.created_at,
        })),
      });
    }

    const studentId = student.id;

    // 2) rulam in paralel: count materiale + anunturi + metodologii
    const [materialsCountQ, announcementsQ, methodologiesQ] = await Promise.all([
      db.query<{ count: string }>(
        `
        SELECT COUNT(DISTINCT m.id) AS count
        FROM materials m
        LEFT JOIN material_student_access msa
          ON msa.material_id = m.id
         AND msa.student_id = $1
        LEFT JOIN student_series ss
          ON ss.student_id = $1
        LEFT JOIN material_series_access msa2
          ON msa2.material_id = m.id
         AND msa2.series_id = ss.series_id
        WHERE
          m.visibility = 'public'
          OR msa.student_id IS NOT NULL
          OR msa2.series_id IS NOT NULL
        `,
        [studentId],
      ),
      db.query(
        `
        SELECT id, title, description, blob_id, mime_type, published_at, created_at
        FROM public_documents
        WHERE section = 'announcement'
          AND published = true
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT 5
        `,
      ),
      db.query(
        `
        SELECT id, title, description, blob_id, mime_type, published_at, created_at
        FROM public_documents
        WHERE section = 'methodology'
          AND published = true
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT 5
        `,
      ),
    ]);

    const materialsCount = Number(materialsCountQ.rows[0]?.count ?? 0);

    return NextResponse.json({
      currentUserName: session.user.name ?? null,
      materialsCount,
      announcements: announcementsQ.rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        blobId: r.blob_id,
        mimeType: r.mime_type,
        publishedAt: r.published_at,
        createdAt: r.created_at,
      })),
      methodologies: methodologiesQ.rows.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        blobId: r.blob_id,
        mimeType: r.mime_type,
        publishedAt: r.published_at,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error('eroare /api/edu/dashboard', err);
    return NextResponse.json(
      { error: 'Nu am putut incarca datele pentru dashboard.' },
      { status: 500 },
    );
  }
}
