import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

const ASSETS_ROOT = path.join(process.cwd(), 'src', 'app', 'edu', 'materiale', 'assets');

function safeJoin(base: string, targetRel: string) {
  const target = path.normalize(targetRel).replace(/^(\.\.(\/|\\|$))+/, '');
  const joined = path.join(base, target);
  const rel = path.relative(base, joined);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('Invalid path');
  }
  return joined;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const relPath = searchParams.get('path');
    const asAttachment = searchParams.get('download') === '1';

    if (!relPath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

    const fileAbs = safeJoin(ASSETS_ROOT, relPath);
    const data = await fs.readFile(fileAbs);

    const headers = new Headers();
    // DOCX MIME
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    if (asAttachment) headers.set('Content-Disposition', `attachment; filename="${path.basename(fileAbs)}"`);

    return new NextResponse(new Uint8Array(data), { status: 200, headers });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'File error' }, { status: 400 });
  }
}
