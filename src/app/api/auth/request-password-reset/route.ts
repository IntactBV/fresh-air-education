// src/app/api/auth/request-password-reset/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4080";
const isDev = process.env.NODE_ENV !== "production";

export async function POST(req: Request) {
  let email: string | undefined;

  try {
    const body = await req.json();
    email = (body?.email ?? "").trim();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  // Check if there is a user with this email
  const userRes = await db.query(
    `SELECT id FROM "user" WHERE email = $1 LIMIT 1`,
    [email]
  );

  if ((userRes.rowCount ?? 0) === 0) {
    // Do not reveal that the user does not exist.
    // Respond with a generic success message.
    if (isDev) {
      return NextResponse.json({
        ok: true,
        note: "No user found for this email, but generic response was returned",
      });
    }

    return NextResponse.json({ ok: true });
  }

  // User exists -> request password reset email via auth
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
      note: "Reset link should be logged in server console by auth provider",
    });
  }

  return NextResponse.json({ ok: true });
}
