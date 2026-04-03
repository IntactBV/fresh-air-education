import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { PoolClient } from 'pg';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { generateStudentUser } from '@/utils/auth-helpers';
import { sendApplicationStatusEmail } from '@/utils/email';

const approveBodySchema = z
  .object({
    serieId: z.string().uuid().nullable().optional(),
    tutorUserId: z.string().min(1).nullable().optional(),
  })
  .optional();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const reviewerId = session.user.id;

  let serieId: string | null = null;
  let tutorUserId: string | null = null;

  try {
    const json = await req.json().catch(() => undefined);
    const parsed = approveBodySchema.safeParse(json);

    if (parsed.success) {
      serieId = parsed.data?.serieId ?? null;
      tutorUserId = parsed.data?.tutorUserId ?? null;
    } else {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Body invalid.' }, { status: 400 });
  }

  const appRes = await db.query(
    `
      SELECT
        id,
        email,
        telefon,
        nume,
        prenume,
        cnp,
        status
      FROM student_applications
      WHERE id = $1
    `,
    [id]
  );

  if ((appRes.rowCount ?? 0) === 0) {
    return NextResponse.json({ error: 'Cererea nu a fost gasita.' }, { status: 404 });
  }

  const app = appRes.rows[0] as {
    id: string;
    email: string;
    telefon: string | null;
    nume: string | null;
    prenume: string | null;
    cnp: string | null;
    status: string;
  };

  const studentAuthUser = await generateStudentUser({
    email: app.email,
    name: [app.nume, app.prenume].filter(Boolean).join(' '),
    headers: req.headers,
  });

  let client: PoolClient | null = null;
  let studentId: string;

  try {
    client = await db.connect();
    await client.query('BEGIN');
    await client.query("SET LOCAL lock_timeout = '5s'");
    await client.query("SET LOCAL statement_timeout = '30s'");

    const lockedAppRes = await client.query(
      `
        SELECT id, status
        FROM student_applications
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if ((lockedAppRes.rowCount ?? 0) === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json({ error: 'Cererea nu a fost gasita.' }, { status: 404 });
    }

    const lockedApp = lockedAppRes.rows[0] as { id: string; status: string };

    await client.query(
      `
        UPDATE student_applications
        SET status = 'approved',
            reviewed_at = now(),
            reviewed_by = $2
        WHERE id = $1
      `,
      [id, reviewerId]
    );

    const existingStudent = await client.query(
      `
        SELECT id
        FROM students
        WHERE application_id = $1
        LIMIT 1
      `,
      [id]
    );

    if ((existingStudent.rowCount ?? 0) > 0) {
      const row = existingStudent.rows[0] as { id: string };

      const upd = await client.query(
        `
          UPDATE students
          SET
            user_id = $2,
            email = $3,
            telefon = $4,
            nume = $5,
            prenume = $6,
            cnp = $7,
            status = 'active',
            updated_at = now()
          WHERE id = $1
          RETURNING id
        `,
        [row.id, studentAuthUser.id, app.email, app.telefon, app.nume, app.prenume, app.cnp]
      );

      studentId = upd.rows[0].id;
    } else {
      const studentRes = await client.query(
        `
          INSERT INTO students (
            application_id,
            user_id,
            email,
            telefon,
            nume,
            prenume,
            cnp,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
          RETURNING id
        `,
        [app.id, studentAuthUser.id, app.email, app.telefon, app.nume, app.prenume, app.cnp]
      );

      studentId = studentRes.rows[0].id;
    }

    await client.query(`DELETE FROM student_series WHERE student_id = $1`, [studentId]);

    if (serieId) {
      await client.query(
        `
          INSERT INTO student_series (student_id, series_id, assigned_at, assigned_by)
          VALUES ($1::uuid, $2::uuid, NOW(), $3::text)
          ON CONFLICT DO NOTHING
        `,
        [studentId, serieId, reviewerId]
      );
    }

    await client.query(`DELETE FROM student_tutors WHERE student_id = $1`, [studentId]);

    if (tutorUserId) {
      await client.query(
        `
          INSERT INTO student_tutors (student_id, tutor_user_id, assigned_at, assigned_by)
          VALUES ($1::uuid, $2::text, NOW(), $3::text)
          ON CONFLICT (student_id) DO UPDATE
          SET tutor_user_id = EXCLUDED.tutor_user_id,
              assigned_at = EXCLUDED.assigned_at,
              assigned_by = EXCLUDED.assigned_by
        `,
        [studentId, tutorUserId, reviewerId]
      );
    }

    await client.query('COMMIT');
    client.release();
    client = null;

    try {
      await sendApplicationStatusEmail({
        email: app.email,
        status: 'approved',
        studentName: [app.nume, app.prenume].filter(Boolean).join(' ') || null,
      });
    } catch (emailErr) {
      console.error('failed to send application approved email:', emailErr);
    }

    return NextResponse.json(
      {
        success: true,
        studentId,
        userId: studentAuthUser.id,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('error approving application:', err);

    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback failure
      }
    }

    return NextResponse.json({ error: 'Eroare la aprobarea cererii.' }, { status: 500 });
  } finally {
    client?.release();
  }
}