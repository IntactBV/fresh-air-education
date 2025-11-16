// src/app/api/admin/student-applications/[id]/reject/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { sendApplicationStatusEmail } from '@/utils/email';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const client = await db.connect();

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reviewerId = session.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason : null;

    await client.query('BEGIN');

    // luam si email + nume pentru emailul de notificare
    const currentRes = await client.query(
      `
        SELECT
          id,
          status,
          email,
          nume,
          prenume
        FROM student_applications
        WHERE id = $1
        FOR UPDATE
      `,
      [id]
    );

    if (currentRes.rowCount === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Cererea nu a fost gasita.' },
        { status: 404 }
      );
    }

    const current = currentRes.rows[0] as {
      id: string;
      status: string;
      email: string;
      nume: string | null;
      prenume: string | null;
    };

    const query =
      current.status === 'rejected'
        ? `
          UPDATE student_applications
          SET admin_note = COALESCE($2, admin_note),
              reviewed_at = now(),
              reviewed_by = $3
          WHERE id = $1
        `
        : `
          UPDATE student_applications
          SET status = 'rejected',
              admin_note = COALESCE($2, admin_note),
              reviewed_at = now(),
              reviewed_by = $3
          WHERE id = $1
        `;

    await client.query(query, [id, reason, reviewerId]);

    await client.query('COMMIT');

    // trimitem email-ul de respingere dupa commit
    try {
      await sendApplicationStatusEmail({
        email: current.email,
        status: 'rejected',
        studentName: [current.nume, current.prenume]
          .filter(Boolean)
          .join(' ') || null,
        note: reason ?? null,
      });
    } catch (emailErr) {
      console.error('failed to send application rejected email:', emailErr);
      // nu mai dam rollback, tranzactia e deja commit
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('error rejecting application:', err);
    await client.query('ROLLBACK');
    return NextResponse.json(
      { error: 'Eroare la respingerea cererii.' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
