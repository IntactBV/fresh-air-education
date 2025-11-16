import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { auth } from '@/utils/auth';

import { PDFDocument } from 'pdf-lib';

// Allowed template types
const ALLOWED_TYPES = [
  'template_acroform_adeverinta_finalizare',
] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

function isAllowedType(type: string | null): type is AllowedType {
  return !!type && ALLOWED_TYPES.includes(type as AllowedType);
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  const isAuthorized = session?.user && 
    (session.user.role === 'admin' || session.user.role === 'tutore');

  if (!isAuthorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (!isAllowedType(type)) {
    return NextResponse.json({ error: 'Invalid or missing template type.' }, { status: 400 });
  }

  // 1) Fetch template metadata + blob
  const tplRes = await db.query(
    `
    SELECT
      t.id AS template_id,
      t.document_type,
      b.id AS blob_id,
      b.filename,
      b.mime_type,
      b.byte_size,
      b.content
    FROM acroform_templates t
    JOIN document_blobs b ON b.id = t.blob_id
    WHERE t.document_type = $1
    LIMIT 1
    `,
    [type]
  );

  if (tplRes.rowCount === 0) {
    return NextResponse.json(
      { error: 'Template not found for this document type.', fields: [] },
      { status: 404 }
    );
  }

  const row = tplRes.rows[0];
  const pdfBytes = row.content;

  // 2) Load PDF and extract AcroForm fields
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const form = pdfDoc.getForm();
    const allFields = form.getFields();

    const resultFields = allFields.map((field: any) => {
      const name = field.getName();
      const type = field.constructor.name.toLowerCase();

      let fType: 'text' | 'textarea' | 'date' | 'number' | 'unknown' = 'unknown';

      if (type.includes('text')) fType = 'text';
      if (type.includes('button')) fType = 'unknown';
      if (type.includes('checkbox')) fType = 'unknown';

      // Try to detect better types from field name
      const lname = name.toLowerCase();
      if (lname.includes('data') || lname.includes('date')) fType = 'date';
      if (lname.includes('cnp') || lname.includes('numar') || lname.includes('nr')) fType = 'number';
      if (lname.includes('descriere') || lname.includes('observatii') || lname.includes('textarea')) fType = 'textarea';

      const isReadOnly = field.isReadOnly();
      let defaultValue = '';

      try {
        const v = (field as any).getText?.();
        if (typeof v === 'string') defaultValue = v;
      } catch {
        // Ignore errors when getting default value
      }

      return {
        name,
        type: fType,
        readOnly: isReadOnly,
        defaultValue: defaultValue || '',
      };
    });

    return NextResponse.json({
      fields: resultFields,
      initialValues: {},
    });
  } catch (e) {
    return NextResponse.json(
      { error: 'Failed to parse PDF template fields.', fields: [] },
      { status: 500 }
    );
  }
}
