import { auth } from "@/utils/auth";
import { db } from "@/utils/db";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4080";

type GenerateStudentUserParams = {
  email: string;
  name?: string | null;
  headers: Headers;
};

/**
 * Creates or retrieves an authentication account for a student.
 * If the user already exists in better-auth's "user" table, it returns it.
 * Otherwise, it creates the account with role "student" and triggers a password-reset email.
 */

export async function generateStudentUser({
  email,
  name,
  headers,
}: GenerateStudentUserParams) {
  const existing = await db.query(
    `SELECT id, email, name, "role" FROM "user" WHERE email = $1 LIMIT 1`,
    [email]
  );

  if ((existing.rowCount ?? 0) > 0) {
    const u = existing.rows[0];
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    };
  }

  const randomPassword =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

  try {
    const created = await auth.api.createUser({
      headers,
      body: {
        email,
        name: name ?? '',
        password: randomPassword,
        role: 'student' as any,
      },
    });

    await auth.api.requestPasswordReset({
      headers,
      body: {
        email,
        redirectTo: `${APP_URL}/resetare-parola`,
      },
    });

    return created.user;
  } catch (error) {
    // Another concurrent request may have created the user already.
    const existingAfterCreate = await db.query(
      `SELECT id, email, name, "role" FROM "user" WHERE email = $1 LIMIT 1`,
      [email]
    );

    if ((existingAfterCreate.rowCount ?? 0) > 0) {
      const u = existingAfterCreate.rows[0];
      return {
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
      };
    }

    throw error;
  }
}
