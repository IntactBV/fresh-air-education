import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';

type Node =
  | { id: string; name: string; type: 'folder'; children: Node[] }
  | { id: string; name: string; type: 'file'; relativePath: string };

const ASSETS_ROOT = path.join(process.cwd(), 'src', 'app', 'edu', 'materiale', 'assets');
const DOCX_EXT = /\.docx$/i;

async function walk(absDir: string, relDir = ''): Promise<Node[]> {
  const items = await fs.readdir(absDir, { withFileTypes: true });

  items.sort((a, b) => {
    if (a.isDirectory() && !b.isDirectory()) return -1;
    if (!a.isDirectory() && b.isDirectory()) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });

  const out: Node[] = [];
  for (const it of items) {
    const abs = path.join(absDir, it.name);
    const rel = relDir ? path.join(relDir, it.name) : it.name;

    if (it.isDirectory()) {
      out.push({
        id: rel.replaceAll(path.sep, '/'),
        name: it.name,
        type: 'folder',
        children: await walk(abs, rel),
      });
    } else if (DOCX_EXT.test(it.name)) {
      out.push({
        id: rel.replaceAll(path.sep, '/'),
        name: it.name,
        type: 'file',
        relativePath: rel.replaceAll(path.sep, '/'),
      });
    }
  }
  return out;
}

export async function GET() {
  try {
    const exists = await fs.stat(ASSETS_ROOT).then(s => s.isDirectory()).catch(() => false);
    if (!exists) {
      return NextResponse.json({ nodes: [], message: '`assets` folder not found.' }, { status: 200 });
    }
    const nodes = await walk(ASSETS_ROOT);
    return NextResponse.json({ nodes }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'List error' }, { status: 500 });
  }
}
