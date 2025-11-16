// src/app/api/admin/users/[id]/resend-reset/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4080";
const isDev = process.env.NODE_ENV !== "production";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const userRes = await db.query(
    `SELECT email FROM "user" WHERE id = $1 LIMIT 1`,
    [id]
  );

  if ((userRes.rowCount ?? 0) === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const email = userRes.rows[0].email as string;

  await auth.api.requestPasswordReset({
    headers: req.headers,
    body: {
      email,
      redirectTo: `${APP_URL}/resetare-parola`,
    },
  });

  if (isDev) {
    return NextResponse.json({
      ok: true,
      note: "reset link was logged in server console",
    });
  }

  return NextResponse.json({ ok: true });
}
