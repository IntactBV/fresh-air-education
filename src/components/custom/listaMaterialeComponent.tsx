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
import IconEye from '@/components/icon/icon-eye';
import IconDatabase from '@/components/icon/icon-database';
import { UploadMaterialModal, type UploadResult } from './UploadMaterialModal';
import { ManageAccessModal } from './ManageAccessModal';
import type { AccessValue } from './AccessEditor';

type MaterialDTO = {
  id: string;
  title: string | null;
  original_filename: string | null;
  mime_type: string | null;
  byte_size: number | null;
  visibility: 'public' | 'restricted' | 'private';
  uploaded_at: string;
  uploaded_by_name: string | null;
  category_name: string | null;
};

type MaterialDetailDTO = {
  id: string;
  blob_id: string;
  title: string | null;
  original_filename: string | null;
  visibility: 'public' | 'restricted' | 'private';
  category_name: string | null;
};

type SeriesDTO = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  createdBy: string | null;
  createdByName: string | null;
  membersCount: number;
};

type StudentDTO = {
  id: string;
  studentNo: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  status: string;
  serieId: string | null;
  serieName: string;
};

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
      visibility?: 'public' | 'restricted' | 'private';
      categoryName?: string | null;
    };

type FlatRow = { node: Node; depth: number };

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

const flatten = (nodes: Node[], expanded: Set<string>, depth = 0): FlatRow[] => {
  const rows: FlatRow[] = [];
  for (const n of nodes) {
    rows.push({ node: n, depth });
    if (n.type === 'folder' && expanded.has(n.id)) {
      rows.push(...flatten(n.children, expanded, depth + 1));
    }
  }
  return rows;
};

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const ListaMaterialeComponent: React.FC = () => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [seriesList, setSeriesList] = useState<SeriesDTO[]>([]);
  const [studentsList, setStudentsList] = useState<StudentDTO[]>([]);

  const [showAccess, setShowAccess] = useState(false);
  const [accessTarget, setAccessTarget] = useState<{
    id: string;
    name: string;
    category: string;
    visibility: 'public' | 'private' | 'restricted';
  } | null>(null);
  const [accessValue, setAccessValue] = useState<AccessValue>({
    all: false,
    seriesIds: [],
    studentIds: [],
  });

  const [showUpload, setShowUpload] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);

        const [resMat, resCat, resSeries, resStudents] = await Promise.all([
          fetch('/api/admin/materials', { cache: 'no-store' }),
          fetch('/api/admin/material-categories', { cache: 'no-store' }),
          fetch('/api/admin/series', { cache: 'no-store' }),
          fetch('/api/admin/students', { cache: 'no-store' }),
        ]);

        if (!resMat.ok) throw new Error('Nu s-au putut incarca materialele.');

        const matData: { data: MaterialDTO[] } = await resMat.json();
        const catData: { data: Array<{ id: string; name: string }> } = resCat.ok
          ? await resCat.json()
          : { data: [] };
        const seriesData: SeriesDTO[] = resSeries.ok ? await resSeries.json() : [];
        const studentsData: StudentDTO[] = resStudents.ok ? await resStudents.json() : [];

        if (!mounted) return;

        const catNames = new Set<string>();
        const folders: Record<string, Node & { type: 'folder' }> = {};

        for (const m of matData.data) {
          const catName = m.category_name || 'Neclasificate';
          catNames.add(catName);

          if (!folders[catName]) {
            folders[catName] = {
              id: `cat-${slugify(catName)}`,
              name: catName,
              type: 'folder',
              children: [],
            };
          }

          folders[catName].children.push({
            id: m.id,
            name: m.title || m.original_filename || 'material',
            type: 'file',
            materialId: m.id,
            uploadedAt: m.uploaded_at,
            uploadedBy: m.uploaded_by_name,
            sizeBytes: m.byte_size ?? undefined,
            visibility: m.visibility,
            categoryName: m.category_name,
          });
        }

        const folderArr = Object.values(folders).sort((a, b) => a.name.localeCompare(b.name));

        setNodes(folderArr);
        setCategories(
          Array.from(new Set([...catData.data.map((c) => c.name), ...catNames])).sort()
        );
        setSeriesList(seriesData);
        setStudentsList(studentsData);

        const roots = new Set<string>(folderArr.map((f) => f.id));
        setExpanded(roots);

        setErr(null);
      } catch (e: any) {
        if (mounted) setErr(e?.message || 'Eroare la incarcare.');
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

  const filtered = useMemo(() => {
    if (!search.trim()) return nodes;
    const walk = (list: Node[]): Node[] =>
      list
        .map((n) => {
          if (n.type === 'folder') {
            const kids = walk(n.children);
            return kids.length || isMatch(n.name, search)
              ? ({ ...n, children: kids.length ? kids : n.children } as Node)
              : null;
          }
          return isMatch(n.name, search) ? n : null;
        })
        .filter(Boolean) as Node[];
    return walk(nodes);
  }, [nodes, search]);

  const expandedForRender = useMemo(() => {
    if (!search.trim()) return expanded;
    const all = new Set<string>(expanded);
    const openAll = (list: Node[]) => {
      for (const n of list) {
        if (n.type === 'folder') {
          all.add(n.id);
          openAll(n.children);
        }
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

  const collapseAll = () => setExpanded(new Set());

  const countFilesInNode = (n: Node): number =>
    n.type === 'file' ? 1 : n.children.reduce((acc, c) => acc + countFilesInNode(c), 0);

  const totalDocuments = useMemo(
    () => nodes.reduce((acc, n) => acc + countFilesInNode(n), 0),
    [nodes]
  );

  const handleDelete = async (materialId: string) => {
    if (!confirm('Sigur doresti sa stergi acest material?')) return;
    const res = await fetch(`/api/admin/materials/${materialId}`, { method: 'DELETE' });
    if (!res.ok) {
      alert('Nu s-a putut sterge materialul.');
      return;
    }

    const prune = (list: Node[]): Node[] =>
      list
        .map((n) => {
          if (n.type === 'folder') return { ...n, children: prune(n.children) };
          return n;
        })
        .filter((n) => !(n.type === 'file' && n.materialId === materialId));

    setNodes((prev) => prune(prev));
  };

  const handleView = async (materialId: string) => {
    const res = await fetch(`/api/admin/materials/${materialId}`, { cache: 'no-store' });
    if (!res.ok) {
      alert('Nu s-au putut incarca detaliile materialului.');
      return;
    }
    const data = await res.json();
    const material = data.material as MaterialDetailDTO;
    const blobId = (material as any).blob_id as string;
    if (!blobId) {
      alert('Materialul nu are fisier asociat.');
      return;
    }
    window.open(`/api/admin/document-blobs/${blobId}`, '_blank', 'noreferrer');
  };

  const handleDownload = async (materialId: string) => {
    const res = await fetch(`/api/admin/materials/${materialId}`, { cache: 'no-store' });
    if (!res.ok) {
      alert('Nu s-au putut incarca detaliile materialului.');
      return;
    }
    const data = await res.json();
    const material = data.material as MaterialDetailDTO;
    const blobId = (material as any).blob_id as string;
    if (!blobId) {
      alert('Materialul nu are fisier asociat.');
      return;
    }
    window.open(`/api/admin/document-blobs/${blobId}/download`, '_blank', 'noreferrer');
  };

  const handleAccess = async (materialId: string) => {
    const res = await fetch(`/api/admin/materials/${materialId}`, { cache: 'no-store' });
    if (!res.ok) {
      alert('Nu s-au putut incarca detaliile materialului.');
      return;
    }
    const data = await res.json();
    const material = data.material as MaterialDetailDTO;
    const series = (data.series as Array<{ series_id: string }>) ?? [];
    const students = (data.students as Array<{ student_id: string }>) ?? [];

    let v: AccessValue;

    if (material.visibility === 'public') {
      v = { all: true, seriesIds: [], studentIds: [] };
    } else if (material.visibility === 'private') {
      v = { all: false, seriesIds: [], studentIds: [] };
    } else {
      // restricted
      v = {
        all: false,
        seriesIds: series.map((s) => {
          const found = seriesList.find(
            (srv) => srv.id === s.series_id || String(srv.id) === String(s.series_id)
          );
          return found ? found.name : s.series_id;
        }),
        studentIds: students.map((s) => s.student_id),
      };
    }

    setAccessTarget({
      id: material.id,
      name: material.title || material.original_filename || 'material',
      category: material.category_name || 'Neclasificate',
      visibility: material.visibility,
    });
    setAccessValue(v);
    setShowAccess(true);
  };

  const handleUploadConfirm = async (res: UploadResult) => {

    // 1) upload blob
    const fd = new FormData();
    fd.append('file', res.file);
    const uploadResp = await fetch('/api/admin/document-blobs', {
      method: 'POST',
      body: fd,
    });
    if (!uploadResp.ok) {
      alert('Nu s-a putut incarca fisierul.');
      return;
    }
    const uploadJson = await uploadResp.json();
    const blobId: string = uploadJson.id;

    // 2) categorie
    let categoryId: string | null = null;
    let categoryName = '';

    if (res.category.kind === 'existing') {

      const catResp = await fetch('/api/admin/material-categories', { cache: 'no-store' });

      if (catResp.ok) {
        const catJson = await catResp.json();
        const foundCategory = catJson.data.find((c: { name: string }) => c.name === res.category.name);
        categoryId = foundCategory ? foundCategory.id : null;
        categoryName = res.category.name;
      } else {
        categoryName = 'Neclasificate';
      }
    } else {
      const catResp = await fetch('/api/admin/material-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: res.category.name }),
      });
      if (catResp.ok) {
        const catJson = await catResp.json();
        categoryId = catJson.id;
        categoryName = res.category.name;
      } else {
        categoryName = 'Neclasificate';
      }
    }

    // 3) visibility dedus din acces
    let visibility: 'public' | 'restricted' | 'private';
    if (res.access.all) {
      visibility = 'public';
    } else if (res.access.seriesIds.length > 0 || res.access.studentIds.length > 0) {
      visibility = 'restricted';
    } else {
      visibility = 'private';
    }

    const series_ids = seriesList
      .filter((s) => res.access.seriesIds.includes(s.name))
      .map((s) => s.id);

    // 4) material
    const materialResp = await fetch('/api/admin/materials', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        blob_id: blobId,
        title: res.file.name,
        category_id: categoryId,
        series_ids,
        // trimitem si structura acces originala, ruta o stie acum
        access: {
          all: res.access.all,
          seriesIds: res.access.seriesIds,
          studentIds: res.access.studentIds,
        },
      }),
    });

    if (!materialResp.ok) {
      alert('Materialul nu a putut fi inregistrat.');
      return;
    }

    const materialJson = await materialResp.json();
    const newMaterialId = materialJson.id as string;
    const catLabel = categoryName || 'Neclasificate';

    setNodes((prev) => {
      const next = [...prev];
      const folderIdx = next.findIndex((n) => n.type === 'folder' && n.name === catLabel);
      const newFileNode: Node = {
        id: newMaterialId,
        name: res.file.name,
        type: 'file',
        materialId: newMaterialId,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'admin',
        sizeBytes: res.file.size,
        visibility,
        categoryName: catLabel,
      };
      if (folderIdx === -1) {
        next.push({
          id: `cat-${slugify(catLabel)}`,
          name: catLabel,
          type: 'folder',
          children: [newFileNode],
        });
      } else {
        const folder = next[folderIdx] as Node & { type: 'folder' };
        next[folderIdx] = { ...folder, children: [...folder.children, newFileNode] };
      }
      return next;
    });

    setExpanded((prev) => {
      const next = new Set(prev);
      next.add(`cat-${slugify(categoryName || 'Neclasificate')}`);
      return next;
    });

    setCategories((prev) => {
      const label = categoryName || 'Neclasificate';
      return prev.includes(label) ? prev : [...prev, label];
    });

    setShowUpload(false);
  };

  return (
    <div>
      {/* toolbar */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
            <IconPlus className="h-4 w-4" />
            <span className="ml-1">Incarca material</span>
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
          >
            <IconSearch className="mx-auto" />
          </button>
        </div>
      </div>

      {/* list view */}
      <div className="panel mt-5 overflow-hidden border-0 p-0">
        <div className="table-responsive">
          <table className="table-striped table-hover">
            <thead>
              <tr>
                <th colSpan={2} className="!p-0">
                  <div className="flex items-center justify-between pl-4 pr-0 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={expandAll}
                        className="inline-flex items-center gap-1 bg-transparent p-0 text-primary hover:underline"
                      >
                        <IconPlus className="h-4 w-4" />
                        <span>Extinde tot</span>
                      </button>
                      <span className="h-4 w-px bg-muted-foreground/30" aria-hidden />
                      <button
                        type="button"
                        onClick={collapseAll}
                        className="inline-flex items-center gap-1 bg-transparent p-0 text-primary hover:underline"
                      >
                        <IconMinus className="h-4 w-4" />
                        <span>Restrange tot</span>
                      </button>
                    </div>
                    <div className="px-5 text-xs text-muted-foreground sm:text-sm">
                      {totalDocuments} materiale
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={2} className="py-6 text-sm text-muted-foreground">
                    Se incarca…
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
                  <td colSpan={2}>
                    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-[#1b2333]/40">
                      <IconDatabase className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Nu exista materiale de afisat
                      </span>
                    </div>
                  </td>
                </tr>
              )}

              {!loading &&
                !err &&
                rows.map(({ node, depth }) => (
                  <tr key={node.id}>
                    {node.type === 'folder' ? (
                      <td
                        colSpan={2}
                        className="align-top bg-info/5 hover:bg-info/10"
                      >
                        <div className="min-w-0">
                          <div className="flex min-w-0 items-center">
                            {/* indent */}
                            <div
                              className="shrink-0"
                              style={{ width: depth * 16 }}
                              aria-hidden
                            />

                            {/* icon */}
                            <div className="mr-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => toggleFolder(node.id)}
                                className="flex h-8 w-8 items-center justify-center rounded hover:bg-muted/60"
                              >
                                <IconFolder className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="relative min-w-0 pr-16">
                                <div className="flex min-w-0 items-center gap-2">
                                  <button
                                    type="button"
                                    className="truncate bg-transparent p-0 text-left font-medium"
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
                            </div>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="align-top">
                          <div className="min-w-0">
                            <div className="flex min-w-0 items-start">
                              {/* indent */}
                              <div
                                className="shrink-0"
                                style={{ width: depth * 16 }}
                                aria-hidden
                              />

                              {/* icon */}
                              <div className="mr-2 shrink-0">
                                <div className="grid h-8 w-8 place-content-center rounded bg-muted/60">
                                  <IconFile className="h-4 w-4" />
                                </div>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="mt-1 flex gap-2 text-s">
                                  <div className="truncate font-medium" title={node.name}>
                                    {node.name}
                                  </div>
                                  {node.visibility === 'public' && (
                                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                                      public
                                    </span>
                                  )}
                                  {node.visibility === 'private' && (
                                    <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200">
                                      privat
                                    </span>
                                  )}
                                  {node.visibility === 'restricted' && (
                                    <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200">
                                      restrictionat
                                    </span>
                                  )}
                                </div>

                                <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                                  <span className="whitespace-nowrap">
                                    {formatBytes(node.sizeBytes)}
                                  </span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="whitespace-nowrap">
                                    {node.uploadedBy || '—'}
                                  </span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="whitespace-nowrap">
                                    {formatDate(node.uploadedAt)}
                                  </span>
                                </div>

                                <div className="mt-2 flex w-full flex-wrap items-center justify-end gap-2">
                                  <button
                                    className="btn btn-xs btn-outline-primary"
                                    onClick={() => handleAccess(node.materialId)}
                                  >
                                    <IconLock className="h-3.5 w-3.5" />
                                    <span className="ml-1">Acces</span>
                                  </button>

                                  <button
                                    className="btn btn-xs btn-primary gap-1"
                                    onClick={() => handleView(node.materialId)}
                                  >
                                    <IconEye className="h-3 w-3" /> Vezi
                                  </button>

                                  <button
                                    className="btn btn-xs btn-outline-primary"
                                    onClick={() => handleDownload(node.materialId)}
                                  >
                                    <IconDownload className="h-3.5 w-3.5" />
                                    <span className="ml-1">Descarca</span>
                                  </button>

                                  <button
                                    className="btn btn-xs btn-outline-danger"
                                    onClick={() => handleDelete(node.materialId)}
                                  >
                                    <IconTrash className="h-3.5 w-3.5" />
                                    <span className="ml-1">Sterge</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="align-top" />
                      </>
                    )}
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
          series={seriesList.map((s) => ({ id: s.id, name: s.name }))}
          students={studentsList.map((st) => ({
            id: st.id,
            label: `${st.lastName} ${st.firstName} (${st.email})`,
          }))}
          onClose={() => setShowUpload(false)}
          onConfirm={handleUploadConfirm}
        />
      )}

      {showAccess && accessTarget && (
        <ManageAccessModal
          open={showAccess}
          onClose={() => setShowAccess(false)}
          materialId={accessTarget.id}
          fileName={accessTarget.name}
          categoryName={accessTarget.category}
          series={seriesList.map((s) => ({ id: s.id, name: s.name }))}
          students={studentsList.map((st) => ({
            id: st.id,
            label: `${st.lastName} ${st.firstName} (${st.email})`,
          }))}
          value={accessValue}
          onChange={setAccessValue}
          onSaved={async () => {
            if (!accessTarget) return;

            const isPublic = accessValue.all;
            const hasAny = accessValue.seriesIds.length > 0 || accessValue.studentIds.length > 0;
            const newVisibility: 'public' | 'restricted' | 'private' = isPublic
              ? 'public'
              : hasAny
              ? 'restricted'
              : 'private';

            // mapam seriile din nume in id-uri
            const seriesIdsToSend = isPublic
              ? []
              : accessValue.seriesIds
                  .map((labelOrId) => {
                    const found = seriesList.find(
                      (s) => s.name === labelOrId || s.id === labelOrId
                    );
                    return found ? found.id : null;
                  })
                  .filter(Boolean);

            const resp = await fetch(`/api/admin/materials/${accessTarget.id}/access`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                all: isPublic,
                series_ids: seriesIdsToSend,
                student_ids: isPublic ? [] : accessValue.studentIds,
              }),
            });

            if (!resp.ok) {
              alert('Nu s-a putut salva accesul.');
              return;
            }

            // update local tree
            setNodes((prev) => {
              const patch = (list: Node[]): Node[] =>
                list.map((n) => {
                  if (n.type === 'file' && n.materialId === accessTarget.id) {
                    return { ...n, visibility: newVisibility };
                  }
                  if (n.type === 'folder') {
                    return { ...n, children: patch(n.children) };
                  }
                  return n;
                });
              return patch(prev);
            });

            setShowAccess(false);
          }}
        />
      )}
    </div>
  );
};

export default ListaMaterialeComponent;
