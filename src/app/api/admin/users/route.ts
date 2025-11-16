import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4080";

type AppRole = "admin" | "tutore" | "student";

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, role } = body as {
    email: string;
    name?: string;
    role: AppRole;
  };

  const randomPassword =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  const user = await auth.api.createUser({
    body: {
      email,
      name: name ?? "",
      password: randomPassword,
      role: role as any,
    },
  });

  await auth.api.requestPasswordReset({
    body: {
      email,
      redirectTo: `${APP_URL}/resetare-parola`,
    },
  });

  return NextResponse.json({ ok: true, user });
}

export async function GET(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const usersRes = await db.query(
    `
    SELECT id, email, name, "role", "createdAt", "updatedAt", "emailVerified", image, banned, "banReason"
    FROM "user"
    ORDER BY "createdAt" DESC
    `
  );

  return NextResponse.json(usersRes.rows);
}