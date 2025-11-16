// src/app/api/edu/template-blobs/[blobId]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

async function getStudentForUser(userId: string) {
  const res = await db.query(
    `
    SELECT id
    FROM students
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT 1
    `,
    [userId],
  );
  return res.rows[0] ?? null;
}

// doar sabloanele permise pot fi servite prin aceasta ruta
const ALLOWED_TEMPLATE_TYPES = [
  'template_declaratie_evitare_dubla_finantare',
  'template_declaratie_eligibilitate_membru',
] as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ blobId: string }> },
) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // verificam ca userul este macar asociat cu un student
  const student = await getStudentForUser(session.user.id);
  if (!student) {
    return new NextResponse('Not found', { status: 404 });
  }

  const { blobId } = await params;

  // verificam ca blobId-ul este legat de un sablon valid (si nu de altceva)
  const res = await db.query(
    `
    SELECT
      b.content,
      b.filename,
      b.mime_type,
      b.byte_size
    FROM acroform_templates t
    JOIN document_blobs b ON b.id = t.blob_id
    WHERE b.id = $1
      AND t.document_type = ANY($2::text[])
    LIMIT 1
    `,
    [blobId, ALLOWED_TEMPLATE_TYPES],
  );

  if (res.rows.length === 0) {
    return new NextResponse('Not found', { status: 404 });
  }

  const row = res.rows[0];
  const download = req.nextUrl.searchParams.get('download') === '1';

  return new NextResponse(row.content, {
    status: 200,
    headers: {
      'Content-Type': row.mime_type ?? 'application/pdf',
      'Content-Length': row.byte_size?.toString() ?? undefined,
      'Content-Disposition': download
        ? `attachment; filename="${encodeURIComponent(row.filename)}"`
        : `inline; filename="${encodeURIComponent(row.filename)}"`,
    },
  });
}
