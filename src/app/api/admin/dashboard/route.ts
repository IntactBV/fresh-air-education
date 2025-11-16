import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });

  // if (!session?.user?.isAdmin) {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

  try {
    // le rulam in paralel
    const [
      pendingApplicationsQ,
      enrolledStudentsQ,
      materialsQ,
      publicDocsQ,
      announcementsQ,
      publicPagesQ,
    ] = await Promise.all([
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM student_applications
        WHERE status = 'pending'
        `
      ),
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM students
        WHERE status IN ('active', 'inactive', 'graduate')
        `
      ),
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM materials
        `
      ),
      db.query<{ count: string }>(
        `
        SELECT COUNT(*) AS count
        FROM public_documents
        WHERE published = true
        `
      ),
      db.query<{
        id: string;
        title: string;
        description: string | null;
        published_at: string | null;
      }>(
        `
        SELECT id, title, description, published_at
        FROM public_documents
        WHERE published = true
          AND section = 'announcement'
        ORDER BY COALESCE(published_at, created_at) DESC
        LIMIT 2
        `
      ),
      db.query<{
        slug: string;
        title: string;
      }>(
        `
        SELECT slug, title
        FROM public_pages
        WHERE slug = ANY($1)
          AND is_published = true
        ORDER BY title
        `,
        [
          [
            'program-de-practica',
            'termeni-si-conditii',
            'politica-de-confidentialitate',
          ],
        ]
      ),
    ]);

    const pendingRequestsCount = Number(pendingApplicationsQ.rows[0]?.count ?? 0);
    const enrolledStudentsCount = Number(enrolledStudentsQ.rows[0]?.count ?? 0);
    const studentMaterialsCount = Number(materialsQ.rows[0]?.count ?? 0);
    const publicDocumentsCount = Number(publicDocsQ.rows[0]?.count ?? 0);

    const announcements = announcementsQ.rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.description ?? '',
      date: row.published_at
        ? new Date(row.published_at).toISOString().slice(0, 10)
        : undefined,
      ctaLabel: 'Vezi toate',
      ctaHref: '/admin/documente-publice',
      badge: 'Info' as const,
    }));

    // daca ai deja paginile in DB si sunt published, le luam de acolo
    const dbPages = publicPagesQ.rows.map((row) => ({
      title: row.title,
      href: `/admin/${row.slug}`,
    }));

    // fallback daca nu sunt publicate inca
    const fallbackPages = [
      {
        title: 'Program de practica',
        href: '/admin/program-de-practica',
      },
      {
        title: 'Termeni si conditii',
        href: '/admin/termeni-si-conditii',
      },
      {
        title: 'Politica de confidentialitate',
        href: '/admin/politica-de-confidentialitate',
      },
    ];

    return NextResponse.json({
      pendingRequestsCount,
      enrolledStudentsCount,
      studentMaterialsCount,
      publicDocumentsCount,
      announcements,
      staticArticles: dbPages.length > 0 ? dbPages : fallbackPages,

      currentUserName: session?.user?.name ?? null,
    });
  } catch (error) {
    console.error('Eroare la /api/admin/dashboard:', error);
    return NextResponse.json(
      { error: 'Nu am putut incarca datele pentru dashboard.' },
      { status: 500 }
    );
  }
}
