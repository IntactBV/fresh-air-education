import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';
import { sendMail } from '@/utils/email';

const schema = z.object({
  studentIds: z.array(z.string().uuid()).min(1),
  subject: z.string().min(1).max(200),
  body: z.string().min(1).max(20000),
  cc: z.array(z.string().email()).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { studentIds, subject, body, cc } = parsed.data;

  const q = await db.query<{ id: string; email: string }>(
    `
    SELECT id, email
    FROM students
    WHERE id = ANY($1::uuid[])
    `,
    [studentIds]
  );

  const recipients = q.rows
    .map((r) => ({ id: r.id, email: (r.email || '').trim() }))
    .filter((r) => r.email.length > 0);

  if (!recipients.length) {
    return NextResponse.json({ error: 'Nu am gasit niciun student cu e-mail valid.' }, { status: 400 });
  }

  const results: Array<{ studentId: string; email: string; ok: boolean; error?: string }> = [];

  for (const r of recipients) {
    try {
      await sendMail({
        to: r.email,
        cc: cc && cc.length ? cc : undefined,
        subject,
        text: body,
      });

      results.push({ studentId: r.id, email: r.email, ok: true });
    } catch (e: any) {
      results.push({
        studentId: r.id,
        email: r.email,
        ok: false,
        error: e?.message || 'Send failed',
      });
    }
  }

  const sent = results.filter((x) => x.ok).length;
  const failed = results.length - sent;

  return NextResponse.json({ ok: true, sent, failed, results });
}