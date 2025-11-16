// src/app/api/admin/student-applications/[id]/approve/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@/utils/auth";
import { generateStudentUser } from "@/utils/auth-helpers";
import { sendApplicationStatusEmail } from "@/utils/email";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // cine aproba
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const reviewerId = session.user.id;

  // luam aplicatia in afara tranzactiei
  const appRes = await db.query(
    `
      SELECT
        id,
        email,
        telefon,
        nume,
        prenume,
        cnp
      FROM student_applications
      WHERE id = $1
    `,
    [id]
  );

  if ((appRes.rowCount ?? 0) === 0) {
    return NextResponse.json(
      { error: "Cererea nu a fost gasita." },
      { status: 404 }
    );
  }

  const app = appRes.rows[0] as {
    id: string;
    email: string;
    telefon: string | null;
    nume: string | null;
    prenume: string | null;
    cnp: string | null;
  };

  // cream (sau luam) userul de student in better-auth
  // aici se trimite si mail-ul de reset (pentru user nou)
  const studentAuthUser = await generateStudentUser({
    email: app.email,
    name: [app.nume, app.prenume].filter(Boolean).join(" "),
    headers: req.headers,
  });

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    // marcam aplicatia ca approved
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

    // vedem daca exista deja student pentru aceasta aplicatie
    const existingStudent = await client.query(
      `
        SELECT id
        FROM students
        WHERE application_id = $1
        LIMIT 1
      `,
      [id]
    );

    let studentId: string;

    if ((existingStudent.rowCount ?? 0) > 0) {
      const row = existingStudent.rows[0];
      // facem doar update cu user_id si restul datelor
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
            status = 'active'
          WHERE id = $1
          RETURNING id
        `,
        [
          row.id,
          studentAuthUser.id,
          app.email,
          app.telefon,
          app.nume,
          app.prenume,
          app.cnp,
        ]
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
        [
          app.id,
          studentAuthUser.id,
          app.email,
          app.telefon,
          app.nume,
          app.prenume,
          app.cnp,
        ]
      );
      studentId = studentRes.rows[0].id;
    }

    await client.query("COMMIT");

    // trimitem mailul de "aplicatia a fost aprobata"
    // dupa ce tranzactia a reusit
    try {
      await sendApplicationStatusEmail({
        email: app.email,
        status: "approved",
        studentName: [app.nume, app.prenume].filter(Boolean).join(" ") || null,
      });
    } catch (emailErr) {
      console.error(
        "failed to send application approved email:",
        emailErr
      );
      // nu mai dam rollback aici; tranzactia e deja commit
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
    console.error("error approving application:", err);
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: "Eroare la aprobarea cererii." },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
