'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconUpload from '@/components/icon/icon-upload';
import IconTrash from '@/components/icon/icon-trash';
import IconCircleCheck from '@faComponents/icon/icon-circle-check';
import IconInfoCircle from '@faComponents/icon/icon-info-circle';
import IconMenuTodo from '@faComponents/icon/menu/icon-menu-todo';

type TemaFile = {
  id: string;
  name: string;
  sizeBytes: number;
  uploadedAt: string;
  mimeType?: string;
};

const MAX_SIZE = 20 * 1024 * 1024;

function formatDate(dt: string | null | undefined) {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    return d.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dt;
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let b = bytes;
  let i = 0;
  while (b >= 1024 && i < units.length - 1) {
    b /= 1024;
    i += 1;
  }
  return `${b.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function getExt(filename: string) {
  const idx = filename.lastIndexOf('.');
  if (idx === -1) return '';
  return filename.slice(idx + 1).toLowerCase();
}

function buildHomeworkUrl(fileId: string, mode: 'view' | 'download') {
  return mode === 'view'
    ? `/api/edu/my-homework/${fileId}`
    : `/api/edu/my-homework/${fileId}?download=1`;
}

export default function TemeComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [files, setFiles] = useState<TemaFile[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch('/api/edu/my-homework', { cache: 'no-store' });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data?.error || 'Nu s-au putut incarca temele.');
        }

        const data = await res.json();
        const list: TemaFile[] = Array.isArray(data?.files)
          ? data.files.map((f: any) => ({
              id: String(f.id),
              name: String(f.name),
              sizeBytes: Number(f.sizeBytes ?? 0),
              uploadedAt: String(f.uploadedAt),
              mimeType: f.mimeType ? String(f.mimeType) : undefined,
            }))
          : [];

        setFiles(list);
      } catch (e: any) {
        setError(e?.message || 'Eroare la incarcare.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function PanelHeader({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) {
    return (
      <div className="flex items-center gap-3">
        <div className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
    );
  }

  function validateFile(file?: File): string | null {
    if (!file) return 'Nu s-a selectat niciun fisier.';
    if (file.size > MAX_SIZE) return 'Fisierul depaseste limita de 20MB.';
    return null;
  }

  async function handleAddFile(file?: File | null) {
    setError(null);
    const problem = validateFile(file ?? undefined);
    if (problem) {
      setError(problem);
      return;
    }
    if (!file) return;

    try {
      setUploading(true);

      const fd = new FormData();
      fd.append('file', file);

      const res = await fetch('/api/edu/my-homework/upload', {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Upload esuat.');
      }

      const data = await res.json();

      const newItem: TemaFile = {
        id: String(data.id),
        name: String(data.name),
        sizeBytes: Number(data.sizeBytes ?? 0),
        uploadedAt: String(data.uploadedAt),
        mimeType: data.mimeType ? String(data.mimeType) : undefined,
      };

      setFiles((prev) => [newItem, ...prev]);
    } catch (e: any) {
      setError(e?.message || 'Incarcarea a esuat.');
    } finally {
      setUploading(false);
    }
  }

  function handleView(file: TemaFile) {
    window.open(buildHomeworkUrl(file.id, 'view'), '_blank', 'noreferrer');
  }

  function handleDownload(file: TemaFile) {
    window.open(buildHomeworkUrl(file.id, 'download'), '_blank', 'noreferrer');
  }

  async function handleDelete(fileId: string) {
    setError(null);
    try {
      setDeletingId(fileId);

      const res = await fetch(`/api/edu/my-homework/${fileId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Stergerea a esuat.');
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e: any) {
      setError(e?.message || 'Stergerea a esuat.');
    } finally {
      setDeletingId(null);
    }
  }

  const lastUpdate = useMemo(() => {
    if (!files.length) return null;
    const dates = files.map((f) => f.uploadedAt).filter(Boolean) as string[];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0] ?? null;
  }, [files]);

  const hasAny = files.length > 0;

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-danger">
          <div className="flex items-start gap-2">
            <span className="font-semibold">Eroare:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <div className="panel w-full relative">
        <div className="absolute right-4 top-4">
          {hasAny ? (
            <span
              className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
              title="Ai incarcat cel putin un fisier"
            >
              <IconCircleCheck className="h-4 w-4" />
            </span>
          ) : (
            <span
              className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
              title="Nu ai incarcat fisiere"
            >
              <IconInfoCircle className="h-4 w-4" />
            </span>
          )}
        </div>

        <div className="panel-heading">
          <PanelHeader
            icon={<IconMenuTodo />}
            title="Temele mele"
            subtitle={
              lastUpdate
                ? `Ultima actualizare: ${formatDate(lastUpdate)}`
                : 'Gestioneaza fisierele incarcate pentru teme.'
            }
          />
        </div>

        <div className="panel-body flex flex-col gap-4 pt-2 md:pt-4">
          {loading ? (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Se incarca fisierele...
            </div>
          ) : !files.length ? (
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Nu exista fisiere incarcate.
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((f) => {
                const ext = getExt(f.name);
                const busy = deletingId === f.id;

                return (
                  <div
                    key={f.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 p-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium break-words">
                          {f.name}
                          {ext ? (
                            <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                              .{ext}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {formatDate(f.uploadedAt)} • {formatBytes(f.sizeBytes)}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2">
                        <button
                          className="btn btn-xs btn-primary gap-1"
                          onClick={() => handleView(f)}
                          title="Vezi"
                          disabled={busy}
                        >
                          <IconEye className="h-3 w-3" /> Vezi
                        </button>

                        <button
                          className="btn btn-xs btn-outline-primary gap-1"
                          onClick={() => handleDownload(f)}
                          title="Descarca"
                          disabled={busy}
                        >
                          <IconDownload className="h-3 w-3" /> Descarca
                        </button>

                        <button
                          className="btn btn-xs btn-outline-danger gap-1"
                          onClick={() => handleDelete(f.id)}
                          title="Sterge"
                          disabled={busy}
                        >
                          <IconTrash className="h-3 w-3" /> {busy ? 'Se sterge...' : 'Sterge'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              Maxim 20MB per fisier.
            </div>

            <div className="flex justify-end">
              <button
                className="btn btn-primary gap-1"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                title="Incarca un fisier"
              >
                <IconUpload className="h-4 w-4" />
                {uploading ? 'Se incarca...' : 'Incarca fisier'}
              </button>

              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  await handleAddFile(file || null);
                  e.currentTarget.value = '';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
