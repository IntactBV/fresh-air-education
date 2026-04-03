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

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || (session.user.role !== 'admin' && session.user.role !== 'tutore')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const reviewerId = session.user.id;

  try {
    const body = await req.json().catch(() => ({}));
    const reason = typeof body.reason === 'string' ? body.reason.trim() : null;

    const result = await db.query(
      `
        UPDATE student_applications
        SET
          status = 'rejected',
          admin_note = COALESCE($2, admin_note),
          reviewed_at = now(),
          reviewed_by = $3
        WHERE id = $1
        RETURNING
          id,
          email,
          nume,
          prenume
      `,
      [id, reason, reviewerId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Cererea nu a fost gasita.' },
        { status: 404 }
      );
    }

    const application = result.rows[0] as {
      id: string;
      email: string;
      nume: string | null;
      prenume: string | null;
    };

    try {
      await sendApplicationStatusEmail({
        email: application.email,
        status: 'rejected',
        studentName:
          [application.nume, application.prenume].filter(Boolean).join(' ') || null,
        note: reason,
      });
    } catch (emailErr) {
      console.error('failed to send application rejected email:', emailErr);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error('error rejecting application:', err);
    return NextResponse.json(
      { error: 'Eroare la respingerea cererii.' },
      { status: 500 }
    );
  }
}