// src/app/api/admin/users/[id]/unban/route.ts
import { NextResponse } from "next/server";
import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.query(
    `UPDATE "user"
     SET banned = false,
         "banReason" = null
     WHERE id = $1`,
    [id]
  );

  return NextResponse.json({ ok: true });
}
