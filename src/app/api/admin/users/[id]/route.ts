// src/app/api/admin/users/[id]/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

type AppRole = "admin" | "tutore" | "student";

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { role } = await req.json();

  const allowed: AppRole[] = ["admin", "tutore", "student"];
  if (!allowed.includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  await db.query(
    `UPDATE "user"
     SET "role" = $2,
         "updatedAt" = NOW()
     WHERE id = $1`,
    [id, role]
  );

  const updated = await db.query(
    `SELECT id, email, name, "role", "createdAt", "updatedAt", "emailVerified", banned, "banReason"
     FROM "user"
     WHERE id = $1
     LIMIT 1`,
    [id]
  );

  return NextResponse.json(updated.rows[0]);
}
