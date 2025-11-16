// src/utils/email.ts
import nodemailer from 'nodemailer';

// const isDev = process.env.NODE_ENV !== 'production';

const isDev = false;

const transporter = !isDev
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: true, // true daca port 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  : null;

type SendMailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
};

type StudentDocumentType =
  | 'adeverinta_finalizare_stagiu'
  | 'adeverinta_student'
  | 'declaratie_student';

function getStudentDocumentLabel(docType: StudentDocumentType): string {
  switch (docType) {
    case 'adeverinta_finalizare_stagiu':
      return 'Adeverinta de finalizare a stagiului';
    // case 'adeverinta_student':
    //   return 'Adeverinta de student';
    // case 'declaratie_student':
    //   return 'Declaratie student';
    default:
      return 'Document nou';
  }
}


/**
 * Functia de baza – toate mailurile trec prin ea.
 */
export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  const from = process.env.SMTP_FROM;

  if (!from) {
    throw new Error('Missing SMTP_FROM env');
  }

  if (isDev) {
    console.log('=== DEV EMAIL ===');
    console.log('To:     ', to);
    console.log('Subject:', subject);
    console.log('Text:   ', text);
    console.log('HTML:   ', html);
    console.log('=================');
    return;
  }

  if (!transporter) {
    throw new Error('Email transporter is not configured');
  }
 
  await transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}

/**
 * Template specific pentru reset parola better-auth.
 */
export async function sendPasswordResetEmail(email: string, url: string) {
  const subject = 'Fresh Tech: Seteaza parola contului tau';

  const text = `Salut,

Pentru a accesa contul tau din platforma Fresh Tech, ai nevoie sa setezi o parola.
Poti face acest lucru folosind link-ul de mai jos:

${url}

Daca nu ai solicitat tu acest lucru sau consideri ca ai primit acest mesaj din greseala, poti ignora emailul.

Cu drag,
Echipa Fresh Tech
`;

  const html = `
    <p>Salut,</p>
    <p>Pentru a accesa contul tau din platforma Fresh Tech, ai nevoie sa setezi o parola.</p>
    <p>Poti face acest lucru folosind link-ul de mai jos:</p>
    <p>
      <a href="${url}" style="display:inline-block;padding:8px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:999px;">
        Seteaza parola
      </a>
    </p>
    <p>Daca nu ai solicitat tu acest lucru sau consideri ca ai primit acest mesaj din greseala, poti ignora emailul.</p>
    <p>Cu drag,<br/>Echipa Fresh Tech</p>
  `;

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendApplicationStatusEmail(args: {
  email: string;
  status: 'approved' | 'rejected';
  studentName?: string | null;
  note?: string | null; // motiv respingere
}) {
  const { email, status, studentName, note } = args;

  const friendlyName = studentName || 'Salut';

  let subject: string;
  let text: string;
  let html: string;

  if (status === 'approved') {
    // -------------------------------
    //  TEMPLATE: APLICATIE APROBATA
    // -------------------------------

    subject = 'Fresh Tech: Aplicatia ta a fost aprobata';

    text = `${friendlyName},

Aplicatia ta a fost aprobata. Felicitari!

In curand vei primi un nou email cu instructiunile necesare pentru a seta parola contului tau in platforma Fresh Tech.

Dupa ce iti setezi parola, vei putea accesa platforma si toate functionalitatile disponibile.

Cu drag,
Echipa Fresh Tech`;

    html = `
      <p>${friendlyName},</p>
      <p>Aplicatia ta a fost aprobata. Felicitari!</p>
      <p>In curand vei primi un nou email cu instructiunile necesare pentru a seta parola contului tau in platforma <strong>Fresh Tech</strong>.</p>
      <p>Dupa ce iti setezi parola, vei putea accesa platforma si toate functionalitatile disponibile.</p>
      <p>Cu drag,<br/>Echipa Fresh Tech</p>
    `;

  } else {
    // -------------------------------
    //  TEMPLATE: APLICATIE RESPINSA
    // -------------------------------

    subject = 'Fresh Tech: Aplicatia ta a fost respinsa';

    const extraText = note ? `\n\nDetalii:\n${note}` : '';
    const extraHtml = note ? `<p><strong>Detalii:</strong><br/>${note}</p>` : '';

    text = `${friendlyName},

Aplicatia ta a fost respinsa. Mai jos gasesti mai multe detalii (daca sunt disponibile).${extraText}

Cu drag,
Echipa Fresh Tech`;

    html = `
      <p>${friendlyName},</p>
      <p>Aplicatia ta a fost respinsa. Mai jos gasesti mai multe detalii (daca sunt disponibile).</p>
      ${extraHtml}
      <p>Cu drag,<br/>Echipa Fresh Tech</p>
    `;
  }

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

export async function sendStudentDocumentAssignedEmail(args: {
  email: string;
  studentName?: string | null;
  documentType: StudentDocumentType;
}) {
  const { email, studentName, documentType } = args;

  const friendlyName = studentName || 'Salut';
  const docLabel = getStudentDocumentLabel(documentType);

  const subject = 'Ai un document nou disponibil in platforma Fresh Tech';

  const text = `${friendlyName},

Un nou document este acum disponibil in contul tau: ${docLabel}.

Il poti accesa din sectiunea "Documentele mele" dupa ce te autentifici in platforma Fresh Tech.

Cu drag,
Echipa Fresh Tech`;

  const html = `
    <p>${friendlyName},</p>
    <p>Un nou document este acum disponibil in contul tau: <strong>${docLabel}</strong>.</p>
    <p>Il poti accesa din sectiunea <strong>Documentele mele</strong> dupa ce te autentifici in platforma <strong>Fresh Tech</strong>.</p>
    <p>Cu drag,<br/>Echipa Fresh Tech</p>
  `;

  return sendMail({
    to: email,
    subject,
    text,
    html,
  });
}

