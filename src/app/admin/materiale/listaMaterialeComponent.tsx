// app/admin/materiale/listaMaterialeComponent.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import IconSearch from '@/components/icon/icon-search';
import IconFolder from '@/components/icon/icon-folder';
import IconFile from '@/components/icon/icon-file';
import IconDownload from '@/components/icon/icon-download';
import IconMinus from '@/components/icon/icon-minus';
import IconPlus from '@faComponents/icon/icon-plus';
import IconTrash from '@/components/icon/icon-trash';
import IconLock from '@/components/icon/icon-lock';
import { UploadMaterialModal, type UploadResult } from './UploadMaterialModal';
import { ManageAccessModal } from './ManageAccessModal';
import type { AccessValue } from './AccessEditor';



// ---------------------
// Tipuri ca în /edu
// ---------------------
type APINode =
  | { id: string; name: string; type: 'folder'; children: APINode[] }
  | { id: string; name: string; type: 'file'; relativePath: string };

type Node =
  | (APINode & { type: 'folder' })
  | (APINode & {
      type: 'file';
      uploadedBy?: string | null;
      uploadedAt?: string | null;
      sizeBytes?: number | null;
    });

const FILE_ENDPOINT = '/api/materiale/file?path=';

// ---------------------
// Utils
// ---------------------
const formatBytes = (n?: number | null) => {
  if (n == null) return '—';
  if (n < 1024) return `${n} B`;
  const kb = n / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
};

const formatDate = (iso?: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
};

// meta “fake” deterministă (ca în EDU)
const decorate = (nodes: APINode[]): Node[] => {
  const now = Date.now();
  const uploaders = ['admin', 'prof. Ionescu', 'asist. Pop', 'prof. Smith'];

  const hashStr = (s: string) => {
    let h = 2166136261; // FNV-1a seed
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  };

  const walk = (list: APINode[]): Node[] =>
    list.map((n) => {
      if (n.type === 'folder') return { ...n, children: walk(n.children) };

      const h = hashStr(n.id);
      const min = 50 * 1024;
      const span = 2.5 * 1024 * 1024;
      const sizeBytes = Math.floor(min + (h % span));
      const daysAgo = (h % 28) + 1;
      const uploadedAt = new Date(now - daysAgo * 86400000).toISOString();
      const uploadedBy = uploaders[h % uploaders.length];

      return { ...n, sizeBytes, uploadedAt, uploadedBy };
    });

  return walk(nodes);
};

type FlatRow = { node: Node; depth: number };
const flatten = (nodes: Node[], expanded: Set<string>, depth = 0): FlatRow[] => {
  const rows: FlatRow[] = [];
  for (const n of nodes) {
    rows.push({ node: n, depth });
    if (n.type === 'folder' && expanded.has(n.id)) rows.push(...flatten(n.children, expanded, depth + 1));
  }
  return rows;
};

// ======================
// Componentă principală
// ======================
const ListaMaterialeComponent: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // Load aceleași materiale ca în /edu
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/materiale', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { nodes: APINode[] } = await res.json();
        if (!mounted) return;
        const decorated = decorate(data.nodes || []);
        setNodes(decorated);
        // expandăm folderele rădăcină ca în /edu
        const roots = new Set<string>();
        for (const n of decorated) if (n.type === 'folder') roots.add(n.id);
        setExpanded(roots);
        setErr(null);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Eroare la încărcare.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const toggleFolder = (id: string) =>
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isMatch = (name: string, q: string) => name.toLowerCase().includes(q.trim().toLowerCase());

  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const walk = (list: Node[]): Node[] =>
      list.map(n => {
        if (n.type === 'folder') {
          const kids = walk(n.children);
          return (kids.length || isMatch(n.name, search))
            ? ({ ...n, children: kids.length ? kids : n.children } as Node)
            : null;
        }
        return isMatch(n.name, search) ? n : null;
      }).filter(Boolean) as Node[];
    return walk(nodes);
  }, [nodes, search]);

  const expandedForRender = useMemo(() => {
    if (!search.trim()) return expanded;
    const all = new Set<string>(expanded);
    const openAll = (list: Node[]) => {
      for (const n of list) if (n.type === 'folder') { all.add(n.id); openAll(n.children); }
    };
    openAll(filtered);
    return all;
  }, [expanded, filtered, search]);

  const rows = useMemo(() => flatten(filtered, expandedForRender), [filtered, expandedForRender]);

  const expandAll = () => {
    const all = new Set<string>();
    const walk = (list: Node[]) => {
      for (const n of list) {
        if (n.type === 'folder') {
          all.add(n.id);
          walk(n.children);
        }
      }
    };
    walk(nodes);
    setExpanded(all);
  };

  const collapseAll = () => {
    setExpanded(new Set());
  };

  const countFiles = (list: Node[]): number =>
    list.reduce((acc, n) => acc + (n.type === 'file' ? 1 : countFiles(n.children)), 0);

  const totalDocuments = useMemo(() => countFiles(filtered), [filtered]);

  const countFilesInNode = (n: Node): number =>
    n.type === 'file' ? 1 : n.children.reduce((acc, c) => acc + countFilesInNode(c), 0);

  // Admin actions
  const handleDelete = (id: string) => {
    if (!confirm('Sigur dorești să ștergi acest material?')) return;
    const prune = (list: Node[]): Node[] =>
      list
        .map(n => (n.type === 'folder' ? { ...n, children: prune(n.children) } : n))
        .filter(n => !(n.type === 'file' && n.id === id));
    setNodes(prev => prune(prev));
  };

    const handleAccess = (id: string) => {
      const file = getFileNodeById(id);
      if (!file) return;

      const category = getTopCategoryFromPath(file.relativePath);
      setAccessTarget({ id, name: file.name, category });

      // ensure default value exists
      setAccessByFile(prev => ({
        ...prev,
        [id]: prev[id] ?? { all: true, seriesIds: [], studentIds: [] },
      }));

      setShowAccess(true);
    };


  const [showUpload, setShowUpload] = useState(false);

  const SERIES = ['S1', 'S2', 'S3', 'S4', 'S5'];
  const STUDENTS = Array.from({ length: 1200 }).map((_, i) => ({
    id: `st${i + 1}`,
    label: `Student ${String(i + 1).padStart(4, '0')} (student${i + 1}@mail.edu)`,
  }));

  const categories = useMemo(() => {
    const out = new Set<string>();
    nodes.forEach(n => { if (n.type === 'folder') out.add(n.name); });
    return Array.from(out);
  }, [nodes]);

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const addUploadedFileToTree = (res: UploadResult) => {
  const fileName = res.file.name;
  const fileSize = res.file.size ?? 100 * 1024;
  const nowIso = new Date().toISOString();
  const uploadedBy = 'admin';
  const categoryName =
    res.category.kind === 'existing' ? res.category.name : res.category.name || 'Neclasificate';

  const newFileNode: Node & { type: 'file' } = {
    id: `up-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name: fileName,
    type: 'file',
    relativePath: `${categoryName}/${fileName}`,
    uploadedBy,
    uploadedAt: nowIso,
    sizeBytes: fileSize,
  };

  setNodes(prev => {
    let found = false;
    const next = prev.map(n => {
      if (n.type === 'folder' && n.name === categoryName) {
        found = true;
        return { ...n, children: [...n.children, newFileNode] };
      }
      return n;
    });
    if (!found) {
      const newFolder: Node & { type: 'folder' } = {
        id: `cat-${slugify(categoryName)}`,
        name: categoryName,
        type: 'folder',
        children: [newFileNode],
      };
      return [...next, newFolder];
    }
    return next;
  });

  // extindem rădăcinile după upload, ca materialul să fie vizibil imediat
  setExpanded(prev => {
    const next = new Set(prev);
    nodes.forEach(n => { if (n.type === 'folder') next.add(n.id); });
    next.add(`cat-${slugify(categoryName)}`);
    return next;
  });

  // TODO: res.access -> persistat când există API.
};

  const [showAccess, setShowAccess] = useState(false);
  const [accessTarget, setAccessTarget] = useState<{ id: string; name: string; category: string } | null>(null);

  // demo: per-file access map (replace with backend later)
  const [accessByFile, setAccessByFile] = useState<Record<string, AccessValue>>({});


  const getFileNodeById = (id: string): (Node & { type: 'file' }) | null => {
    let found: (Node & { type: 'file' }) | null = null;
    const walk = (list: Node[]) => {
      for (const n of list) {
        if (n.type === 'file' && n.id === id) {
          found = n as Node & { type: 'file' };
          return;
        }
        if (n.type === 'folder') walk(n.children);
      }
    };
    walk(nodes);
    return found;
  };

  const getTopCategoryFromPath = (relativePath: string) => {
    const seg = relativePath.split('/')[0] || '';
    return seg || 'Neclasificate';
  };


  return (
    <div>
      {/* Toolbar superior: Încărcare (stânga) + Căutare (dreapta) */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <IconPlus className="h-4 w-4" />
            <span className="ml-1">Incarcare material</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Cauta materiale"
            className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            type="button"
            className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
            title="Cauta"
          >
            <IconSearch className="mx-auto" />
          </button>
        </div>
      </div>

      {/* LIST VIEW – identic vizual cu /edu, dar cu acțiuni ADMIN sub fiecare fișier */}
      <div className="panel mt-5 overflow-hidden border-0 p-0">
        <div className="table-responsive">
          <table className="table-striped table-hover">
            <thead>
              <tr>
                <th colSpan={2} className="!p-0">
                  <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={expandAll}
                        className="inline-flex items-center gap-1 bg-transparent p-0 text-primary hover:underline"
                        title="Extinde toate folderele"
                      >
                        <IconPlus className="h-4 w-4" />
                        <span>Extinde tot</span>
                      </button>

                      <span className="h-4 w-px bg-muted-foreground/30" aria-hidden />

                      <button
                        type="button"
                        onClick={collapseAll}
                        className="inline-flex items-center gap-1 bg-transparent p-0 text-primary hover:underline"
                        title="Restrange toate folderele"
                      >
                        <IconMinus className="h-4 w-4" />
                        <span>Restrange tot</span>
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground sm:text-sm">
                      {totalDocuments} materiale
                    </div>
                  </div>
                </th>
              </tr>
            </thead>

            <tbody>
              {loading && (
                <tr><td colSpan={2} className="py-6 text-sm text-muted-foreground">Se încarcă…</td></tr>
              )}

              {err && !loading && (
                <tr><td colSpan={2} className="py-6 text-sm text-danger">Eroare: {err}</td></tr>
              )}

              {!loading && !err && rows.length === 0 && (
                <tr><td colSpan={2} className="py-6 text-sm text-muted-foreground">Nicio potrivire pentru “{search}”.</td></tr>
              )}

              {!loading && !err && rows.map(({ node, depth }) => (
                <tr key={node.id}>
                  <td className="align-top">
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-start">
                        {/* indent vizual */}
                        <div className="shrink-0" style={{ width: depth * 16 }} aria-hidden />

                        {/* icon + toggle pentru foldere */}
                        <div className="mr-2 shrink-0">
                          {node.type === 'folder' ? (
                            <button
                              type="button"
                              onClick={() => toggleFolder(node.id)}
                              className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted/60"
                              title={expandedForRender.has(node.id) ? 'Restrânge' : 'Extinde'}
                            >
                              <IconFolder className="h-4 w-4" />
                            </button>
                          ) : (
                            <div className="grid h-8 w-8 place-content-center rounded bg-muted/60">
                              <IconFile className="h-4 w-4" />
                            </div>
                          )}
                        </div>

                        {/* conținut */}
                        <div className="min-w-0 flex-1">
                          {node.type === 'folder' ? (
                            <div className="relative min-w-0 pr-16">
                              <div className="flex min-w-0 items-center gap-2">
                                <button
                                  type="button"
                                  className="truncate bg-transparent p-0 text-left font-medium"
                                  title={node.name}
                                  onClick={() => toggleFolder(node.id)}
                                >
                                  <span className="truncate">{node.name}</span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    ({countFilesInNode(node)})
                                  </span>
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    {expandedForRender.has(node.id) ? '▾' : '▸'}
                                  </span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* nume fișier */}
                              <div className="truncate font-medium" title={node.name}>
                                {node.name}
                              </div>

                              {/* meta ca în /edu */}
                              <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                <span className="whitespace-nowrap">{formatBytes(node.sizeBytes)}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="whitespace-nowrap">{node.uploadedBy || 'admin'}</span>
                                <span className="hidden sm:inline">•</span>
                                <span className="whitespace-nowrap">{formatDate(node.uploadedAt)}</span>
                              </div>

                              {/* ACȚIUNI ADMIN — pe rând NOU, pentru a evita scroll orizontal */}
                              {/* <div className="mt-2 flex flex-wrap items-center gap-2"> */}
                              <div className="mt-2 flex w-full flex-wrap items-center justify-end gap-2">

                                <button
                                  className="btn btn-xs btn-outline-primary"
                                  title="Acces"
                                  onClick={() => handleAccess(node.id)}
                                >
                                  <IconLock className="h-3.5 w-3.5" />
                                  <span className="ml-1">Acces</span>
                                </button>

                                <a
                                  className="btn btn-xs btn-outline-primary"
                                  title="Descarcă"
                                  href={`${FILE_ENDPOINT}${encodeURIComponent(node.relativePath)}&download=1`}
                                >
                                  <IconDownload className="h-3.5 w-3.5" />
                                  <span className="ml-1">Descarcă</span>
                                </a>

                                <button
                                  className="btn btn-xs btn-outline-danger"
                                  title="Șterge"
                                  onClick={() => handleDelete(node.id)}
                                >
                                  <IconTrash className="h-3.5 w-3.5" />
                                  <span className="ml-1">Șterge</span>
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* col dreapta: lăsăm liberă (acțiunile sunt sub nume) */}
                  <td className="align-top">{/* intenționat gol */}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {showUpload && (
        <UploadMaterialModal
          open={showUpload}
          categories={categories}
          series={SERIES}
          students={STUDENTS}
          onClose={() => setShowUpload(false)}
          onConfirm={(res) => {
            addUploadedFileToTree(res);
            setShowUpload(false);
          }}
        />
      )}

      {showAccess && accessTarget && (
        <ManageAccessModal
          open={showAccess}
          onClose={() => setShowAccess(false)}
          fileName={accessTarget.name}
          categoryName={accessTarget.category}
          series={SERIES}
          students={STUDENTS}
          value={accessByFile[accessTarget.id] ?? { all: true, seriesIds: [], studentIds: [] }}
          onChange={(v) => setAccessByFile(prev => ({ ...prev, [accessTarget.id]: v }))}
          onSave={() => {
            // TODO: call backend to persist accessByFile[accessTarget.id]
            setShowAccess(false);
          }}
        />
      )}


    </div>
  );
};

export default ListaMaterialeComponent;
