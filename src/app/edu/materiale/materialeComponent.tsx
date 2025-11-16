'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import IconListCheck from '@/components/icon/icon-list-check';
import IconSearch from '@/components/icon/icon-search';
import IconHome from '@faComponents/icon/icon-home';
import IconFolder from '@/components/icon/icon-folder';
import IconFile from '@/components/icon/icon-file';
import IconDownload from '@/components/icon/icon-download';
import IconMinus from '@/components/icon/icon-minus';
import IconPlus from '@faComponents/icon/icon-plus';
import IconCaretDown from '@/components/icon/icon-caret-down';
import AnimateHeight from 'react-animate-height';
import IconFolderPlus from '@faComponents/icon/icon-folder-plus';
import IconDatabase from '@faComponents/icon/icon-database';
import IconEye from '@/components/icon/icon-eye';

// tipul pe care il intoarce /api/edu/materials
type EduMaterial = {
  id: string;
  title: string | null;
  filename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedAt: string | null;
  uploadedBy: string | null;
  categoryId: string | null;
  categoryName: string | null;
};

// noduri de UI
type Node =
  | {
      id: string;
      name: string;
      type: 'folder';
      children: Node[];
    }
  | {
      id: string;
      name: string;
      type: 'file';
      materialId: string;
      uploadedBy?: string | null;
      uploadedAt?: string | null;
      sizeBytes?: number | null;
      categoryName?: string | null;
    };

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

// din lista flat veniti din API facem foldere pe categorie
const buildTreeFromMaterials = (materials: EduMaterial[]): Node[] => {
  // grupam dupa categorie
  const byCategory = new Map<string, EduMaterial[]>();
  for (const m of materials) {
    const cat = m.categoryName || 'Fara categorie';
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(m);
  }

  // pentru fiecare categorie facem folder
  const folders: Node[] = [];
  for (const [catName, items] of byCategory.entries()) {
    const children: Node[] = items.map<Node>((m) => ({
      id: m.id,
      name: m.title || m.filename || 'Document',
      type: 'file',
      materialId: m.id,
      uploadedAt: m.uploadedAt,
      uploadedBy: m.uploadedBy,
      sizeBytes: m.sizeBytes,
      categoryName: m.categoryName || catName,
    }));

    // sortim alfabetic fișierele in folder
    children.sort((a, b) => a.name.localeCompare(b.name));

    folders.push({
      id: `cat-${catName}`,
      name: catName,
      type: 'folder',
      children,
    });
  }

  // sortim folderele alfabetic
  folders.sort((a, b) => a.name.localeCompare(b.name));
  return folders;
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

const MaterialeEduComponent = () => {
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/edu/materials', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: { materials: EduMaterial[] } = await res.json();

        if (!mounted) return;

        const tree = buildTreeFromMaterials(data.materials || []);
        setNodes(tree);

        // deschidem toate categoriile la load
        const roots = new Set<string>();
        for (const n of tree) if (n.type === 'folder') roots.add(n.id);
        setExpanded(roots);

        setErr(null);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Eroare la incircare.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const toggleFolder = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const isMatch = (name: string, q: string) => name.toLowerCase().includes(q.trim().toLowerCase());

  // filtrim și pistrim structura (categoriile care nu au rezultate sunt ascunse)
  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const walk = (list: Node[]): Node[] =>
      list
        .map((n) => {
          if (n.type === 'folder') {
            const kids = walk(n.children);
            if (kids.length) {
              return { ...n, children: kids } as Node;
            }
            // poate categoria nu are match dar numele categoriei se potrivește
            if (isMatch(n.name, search)) {
              return n;
            }
            return null;
          }
          return isMatch(n.name, search) ? n : null;
        })
        .filter(Boolean) as Node[];
    return walk(nodes);
  }, [nodes, search]);

  // in mod search deschidem tot
  const expandedForRender = useMemo(() => {
    if (!search.trim()) return expanded;
    const all = new Set<string>(expanded);
    const openAll = (list: Node[]) => {
      for (const n of list)
        if (n.type === 'folder') {
          all.add(n.id);
          openAll(n.children);
        }
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

  const getFileById = (id: string | null): (Node & { type: 'file' }) | null => {
    if (!id) return null;
    let found: (Node & { type: 'file' }) | null = null;
    const walk = (list: Node[]) => {
      for (const n of list) {
        if (n.type === 'file' && n.id === id) {
          found = n;
          return;
        }
        if (n.type === 'folder') walk(n.children);
      }
    };
    walk(nodes);
    return found;
  };

  const selectedFile = getFileById(selectedFileId);

  const handleView = (materialId: string) => {
    window.open(`/api/edu/materials/${materialId}`, '_blank', 'noreferrer');
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
          <li>
            <Link href="/edu" className="text-primary hover:underline">
              <IconHome className="h-4 w-4" />
            </Link>
          </li>
          <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            <span>Materiale</span>
          </li>
        </ul>

        <div className="flex w-full flex-col gap-4 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
          <div className="flex gap-3">
            <button
              type="button"
              className={`btn btn-outline-primary p-2 ${view === 'list' && 'bg-primary text-white'}`}
              onClick={() => setView('list')}
              title="List view"
            >
              <IconListCheck />
            </button>
            <button
              type="button"
              className={`btn btn-outline-primary p-2 ${view === 'grid' && 'bg-primary text-white'}`}
              onClick={() => setView('grid')}
              title="Tree view"
            >
              <IconFolderPlus />
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Cauti materiale"
              className="peer form-input py-2 ltr:pr-11 rtl:pl-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              type="button"
              className="absolute top-1/2 -translate-y-1/2 peer-focus:text-primary ltr:right-[11px] rtl:left-[11px]"
              title="Cauti"
            >
              <IconSearch className="mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === 'list' && (
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

                      <div className="text-xs text-muted-foreground sm:text-sm">{totalDocuments} materiale</div>
                    </div>
                  </th>
                </tr>
              </thead>

              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={2} className="py-6 text-sm text-muted-foreground">
                      Se incarci…
                    </td>
                  </tr>
                )}

                {err && !loading && (
                  <tr>
                    <td colSpan={2} className="py-6 text-sm text-danger">
                      Eroare: {err}
                    </td>
                  </tr>
                )}

                {!loading && !err && rows.length === 0 && (
                  <tr>
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-[#1b2333]/40">
                      <IconDatabase className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nu exista materiale incarcate inca.
                      </span>
                    </div>
                  </tr>
                )}

                {!loading &&
                  !err &&
                  rows.map(({ node, depth }) => (
                    <tr key={node.id}>
                      <td
                        className={`align-middle ${
                          node.type === 'folder' ? '!bg-info/5' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center">
                            <div className="shrink-0" style={{ width: depth * 16 }} aria-hidden />
                            <div className="mr-2 shrink-0">
                              {node.type === 'folder' ? (
                                <button
                                  type="button"
                                  onClick={() => toggleFolder(node.id)}
                                  className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted/60"
                                  title={expandedForRender.has(node.id) ? 'Restrange' : 'Extinde'}
                                >
                                  <IconFolder className="h-4 w-4" />
                                </button>
                              ) : (
                                <div className="grid h-8 w-8 place-content-center rounded bg-muted/60">
                                  <IconFile className="h-4 w-4" />
                                </div>
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              {node.type === 'folder' ? (
                                <div className="relative min-w-0 pr-16">
                                  <div className="flex min-w-0 items-center gap-2">
                                    <button
                                      type="button"
                                      className="truncate font-medium bg-transparent border-none p-0 text-left"
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
                                  <div className="truncate font-medium" title={node.name}>
                                    {node.name}
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                    <span className="whitespace-nowrap">{formatBytes(node.sizeBytes)}</span>
                                    <span className="hidden sm:inline">•</span>
                                    {node.categoryName && (
                                      <>
                                        <span className="whitespace-nowrap">{node.categoryName}</span>
                                        <span className="hidden sm:inline">•</span>
                                      </>
                                    )}
                                    <span className="whitespace-nowrap">{node.uploadedBy || 'admin'}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span className="whitespace-nowrap">{formatDate(node.uploadedAt)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                        <td
                          className={`align-middle ${
                            node.type === 'folder' ? '!bg-info/5' : ''
                          }`}
                        >
                        {node.type === 'file' ? (
                          <div className="flex items-center justify-end">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                className="btn btn-xs btn-primary gap-1"
                                onClick={() => handleView(node.materialId)}
                                title="Vezi documentul"
                              >
                                <IconEye className="h-3 w-3" /> Vezi
                              </button>

                              <a
                                href={`/api/edu/materials/${node.materialId}?download=1`}
                                className="btn btn-xs btn-outline-primary gap-1"
                                title="Descarci documentul"
                              >
                                <IconDownload className="h-3 w-3" /> Descarca
                              </a>
                            </div>
                          </div>
                        ) : (
                          ''
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TREE VIEW */}
      {view === 'grid' && (
        <div className="panel mt-5 overflow-hidden border-0 p-0">
          {/* header bar identic */}
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

            <div className="text-xs text-muted-foreground sm:text-sm">{totalDocuments} materiale</div>
          </div>

          <div className="px-4 pb-4">
            {loading ? (
              <div className="py-6 text-sm text-muted-foreground">Se incarci…</div>
            ) : err ? (
              <div className="py-6 text-sm text-danger">Eroare: {err}</div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-sm text-muted-foreground">Nicio potrivire pentru “{search}”.</div>
            ) : (
              <ul className="select-none">
                {filtered.map((n) => (
                  <TreeNodeInlineDetails
                    key={n.id}
                    node={n}
                    depth={0}
                    expanded={expandedForRender}
                    onToggle={toggleFolder}
                    selectedFileId={selectedFileId}
                    setSelectedFileId={setSelectedFileId}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TreeNodeInlineDetails: React.FC<{
  node: Node;
  depth: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
}> = ({ node, depth, expanded, onToggle, selectedFileId, setSelectedFileId }) => {
  const pad = depth * 18;

  if (node.type === 'folder') {
    const isOpen = expanded.has(node.id);
    return (
      <li className="py-1">
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
          style={{ paddingLeft: pad }}
          title={node.name}
        >
          <IconCaretDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          <IconFolder className="h-4 w-4 text-primary" />
          <span className="truncate text-sm font-medium">{node.name}</span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({node.children.reduce((a, c) => a + (c.type === 'file' ? 1 : 0), 0)})
          </span>
        </button>

        <AnimateHeight duration={180} height={isOpen ? 'auto' : 0}>
          <ul>
            {node.children.map((c) => (
              <TreeNodeInlineDetails
                key={c.id}
                node={c}
                depth={depth + 1}
                expanded={expanded}
                onToggle={onToggle}
                selectedFileId={selectedFileId}
                setSelectedFileId={setSelectedFileId}
              />
            ))}
          </ul>
        </AnimateHeight>
      </li>
    );
  }

  // FILE node
  const isSelected = selectedFileId === node.id;

  return (
    <li className="py-1">
      <div>
        <button
          type="button"
          onClick={() => setSelectedFileId(isSelected ? null : node.id)}
          className="flex w-full items-center gap-2 rounded px-2 py-1.5 hover:bg-muted/50"
          style={{ paddingLeft: pad + 22 }}
          title={node.name}
        >
          <IconFile className="h-4 w-4 text-primary" />
          <span className="truncate text-sm">{node.name}</span>
        </button>

        <AnimateHeight duration={180} height={isSelected ? 'auto' : 0}>
          <div
            className="
              ml-[calc(22px+2rem)] mt-1
              w-[520px] max-w-full
              rounded-xl border border-muted/60 dark:border-white/10
              bg-muted/30 p-3
              text-xs text-muted-foreground shadow-sm
            "
          >
            <span className="block w-full truncate text-foreground text-sm font-medium" title={node.name}>
              {node.name}
            </span>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>{formatBytes(node.sizeBytes)}</span>
              <span className="hidden sm:inline">•</span>
              {node.categoryName && (
                <>
                  <span>{node.categoryName}</span>
                  <span className="hidden sm:inline">•</span>
                </>
              )}
              <span>{node.uploadedBy || 'admin'}</span>
              <span className="hidden sm:inline">•</span>
              <span>{formatDate(node.uploadedAt)}</span>
            </div>

            <div className="mt-3 flex gap-2">
              <button
                className="btn btn-xs btn-primary gap-1"
                onClick={() => window.open(`/api/edu/materials/${node.materialId}`, '_blank', 'noreferrer')}
                title="Vezi documentul"
              >
                <IconEye className="h-3 w-3" /> Vezi
              </button>

              <a
                href={`/api/edu/materials/${node.materialId}?download=1`}
                className="btn btn-xs btn-outline-primary gap-1"
                title="Descarca documentul"
              >
                <IconDownload className="h-3 w-3" /> Descarca
              </a>
            </div>
          </div>
        </AnimateHeight>
      </div>
    </li>
  );
};

export default MaterialeEduComponent;
