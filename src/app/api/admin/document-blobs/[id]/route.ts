import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await db.connect();

  try {
    const result = await client.query(
      `
      SELECT filename, mime_type, content
      FROM document_blobs
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json({ error: 'Documentul nu a fost gasit.' }, { status: 404 });
    }

    const { filename, mime_type, content } = result.rows[0];

    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': mime_type || 'application/octet-stream',
        // implicit il facem "inline" ca sa poata fi vazut in browser
        'Content-Disposition': `inline; filename="${filename || 'document'}"`,
      },
    });
  } catch (err) {
    console.error('error fetching document blob:', err);
    return NextResponse.json({ error: 'Eroare la preluarea documentului.' }, { status: 500 });
  } finally {
    client.release();
  }
}
