import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { z } from 'zod';

const updateSchema = z.object({
  title: z.string().min(3),
  contentHtml: z.string().min(1),
  isPublished: z.boolean(),
  showTitlePublic: z.boolean().optional().default(true),
});

// GET — folosit atat in public (homepage), cat si in admin
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isAdminView = searchParams.get('admin') === 'true';

  const result = await db.query(
    `
    SELECT id, slug, title, content_html, is_published, show_title_public, updated_at, updated_by, updated_by_name
    FROM public_pages
    WHERE slug = 'program-de-practica'
    LIMIT 1
    `
  );

  if (result.rowCount === 0) {
    // fallback
    return NextResponse.json({
      id: null,
      slug: 'program-de-practica',
      title: 'Program de practica',
      contentHtml: '',
      updatedAt: null,
      updatedBy: null,
      updatedByName: null,
      isPublished: false,
      showTitlePublic: true,
    });
  }

  const row = result.rows[0];

  if ( !isAdminView && !row.is_published) {
    return NextResponse.json({ title: null, contentHtml: null }, { status: 200 });
  }

  return NextResponse.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    contentHtml: row.content_html,
    isPublished: row.is_published,
    showTitlePublic: row.show_title_public ?? true,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    updatedByName: row.updated_by_name,
  });
}

// PUT — doar adminul
export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized = session?.user && 
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await req.json();
  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { title, contentHtml, isPublished, showTitlePublic } = parsed.data;
  const userId = session?.user?.id ?? null;
  const userName = session?.user?.name ?? null;

  const result = await db.query(
    `
    INSERT INTO public_pages (slug, title, content_html, is_published, show_title_public, updated_by, updated_by_name, updated_at)
    VALUES ('program-de-practica', $1, $2, $3, $4, $5, $6, NOW())
    ON CONFLICT (slug) DO UPDATE
      SET title = EXCLUDED.title,
          content_html = EXCLUDED.content_html,
          is_published = EXCLUDED.is_published,
          show_title_public = EXCLUDED.show_title_public,
          updated_by = EXCLUDED.updated_by,
          updated_by_name = EXCLUDED.updated_by_name,
          updated_at = NOW()
    RETURNING id, slug, title, content_html, is_published, show_title_public, updated_at, updated_by, updated_by_name
    `,
    [title.trim(), contentHtml, isPublished, showTitlePublic ?? true, userId, userName]
  );

  const row = result.rows[0];

  return NextResponse.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    contentHtml: row.content_html,
    isPublished: row.is_published,
    showTitlePublic: row.show_title_public ?? true,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
    updatedByName: row.updated_by_name,
  });
}
