// src/app/api/admin/materials/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get('category_id');
  const visibility = searchParams.get('visibility');
  const search = searchParams.get('search');
  const page = Number(searchParams.get('page') ?? 1);
  const pageSize = Number(searchParams.get('pageSize') ?? 20);
  const offset = (page - 1) * pageSize;

  const result = await db.query(
    `
    SELECT
      m.id,
      m.title,
      m.original_filename,
      m.mime_type,
      m.byte_size,
      m.visibility,
      m.uploaded_at,
      m.uploaded_by_name,
      mc.name AS category_name
    FROM materials m
    LEFT JOIN material_categories mc ON mc.id = m.category_id
    WHERE
      ($1::uuid IS NULL OR m.category_id = $1::uuid)
      AND ($2::text IS NULL OR m.visibility = $2::text)
      AND (
        $3::text IS NULL
        OR m.title ILIKE '%' || $3 || '%'
        OR m.original_filename ILIKE '%' || $3 || '%'
      )
    ORDER BY m.uploaded_at DESC
    LIMIT $4 OFFSET $5
    `,
    [categoryId, visibility, search, pageSize, offset]
  );

  return NextResponse.json({ data: result.rows });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  // if (!session?.user?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();

  // 1) extragem ce poate fi in radacina
  const {
    blob_id,
    title,
    category_id,
    visibility: visibilityFromBody,
    series_ids,
    student_ids,
    all,
  } = body as {
    blob_id: string;
    title?: string;
    category_id?: string | null;
    visibility?: string;
    series_ids?: string[];
    student_ids?: string[];
    all?: boolean;
  };

  // 2) extragem si din body.access daca exista
  const access = (body as any).access as
    | {
        all?: boolean;
        seriesIds?: string[];
        studentIds?: string[];
      }
    | undefined;

  if (!blob_id) {
    return NextResponse.json({ error: 'blob_id required' }, { status: 400 });
  }

  // normalizam accesul
  const normalizedAll = typeof all === 'boolean' ? all : access?.all ?? false;
  const normalizedSeriesIds =
    Array.isArray(series_ids) ? series_ids : Array.isArray(access?.seriesIds) ? access?.seriesIds : [];
  const normalizedStudentIds =
    Array.isArray(student_ids) ? student_ids : Array.isArray(access?.studentIds) ? access?.studentIds : [];

  // deducem visibility
  let visibility: 'public' | 'restricted' | 'private';
  if (normalizedAll) {
    visibility = 'public';
  } else if (normalizedSeriesIds.length > 0 || normalizedStudentIds.length > 0) {
    visibility = 'restricted';
  } else if (visibilityFromBody === 'public') {
    visibility = 'public';
  } else {
    visibility = 'private';
  }

  const uploadedBy = session?.user?.id ?? null;
  const uploadedByName = session?.user?.name ?? null;

  const insertMaterial = await db.query(
    `
    INSERT INTO materials (
      blob_id,
      title,
      category_id,
      visibility,
      uploaded_by,
      uploaded_by_name,
      uploaded_at,
      original_filename,
      mime_type,
      byte_size
    )
    SELECT
      $1, $2, $3, $4,
      $5, $6, now(),
      db.filename,
      db.mime_type,
      db.byte_size
    FROM document_blobs db
    WHERE db.id = $1
    RETURNING id
    `,
    [
      blob_id,
      title ?? null,
      category_id ?? null,
      visibility,
      uploadedBy,
      uploadedByName,
    ]
  );

  if (!insertMaterial.rowCount) {
    return NextResponse.json({ error: 'blob not found' }, { status: 400 });
  }

  const materialId = insertMaterial.rows[0].id;

  // doar pentru restricted scriem accesul
  if (visibility === 'restricted') {
    if (normalizedSeriesIds.length) {
      await db.query(
        `
        INSERT INTO material_series_access (material_id, series_id, granted_by)
        SELECT $1, unnest($2::uuid[]), $3
        `,
        [materialId, normalizedSeriesIds, uploadedBy]
      );
    }

    if (normalizedStudentIds.length) {
      await db.query(
        `
        INSERT INTO material_student_access (material_id, student_id, granted_by)
        SELECT $1, unnest($2::uuid[]), $3
        `,
        [materialId, normalizedStudentIds, uploadedBy]
      );
    }
  }

  return NextResponse.json({ id: materialId }, { status: 201 });
}
