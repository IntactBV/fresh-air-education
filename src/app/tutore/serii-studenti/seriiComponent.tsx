'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import IconX from '@/components/icon/icon-x';

type Serie = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  createdBy?: string | null;
  createdByName?: string | null;
  membersCount: number;
};

function formatRoDateTime(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function SeriiComponent() {
  const [isMounted, setIsMounted] = useState(false);
  const [rows, setRows] = useState<Serie[]>([]);
  const [loading, setLoading] = useState(true);

  // create modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // search + sort + pagination
  const [search, setSearch] = useState('');
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'name', direction: 'asc' });

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [serieToDelete, setSerieToDelete] = useState<Serie | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // fetch initial
    (async () => {
      try {
        const res = await fetch('/api/admin/series', { cache: 'no-store' });
        if (!res.ok) throw new Error('Failed to load series');
        const data: Serie[] = await res.json();
        setRows(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const base = useMemo(
    () =>
      rows.map((s) => ({
        ...s,
        createdAtDisplay: formatRoDateTime(s.createdAt),
      })),
    [rows]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) =>
      [r.name, r.description ?? '', r.createdAtDisplay, r.createdByName ?? ''].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [search, base]);

  const sorted = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof (typeof filtered)[number]);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  useEffect(() => setPage(1), [pageSize, search, sortStatus]);
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords = sorted.slice(from, to);

  const handleCreate = async () => {
    setFormError(null);
    const name = formName.trim();
    const description = formDescription.trim();

    if (!name) {
      setFormError('Numele este obligatoriu.');
      return;
    }
    // verificare simpla pe client
    if (rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setFormError('Exista deja o serie cu acest nume.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/admin/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setFormError(err?.error ?? 'Eroare la creare serie.');
        return;
      }
      const created: Serie = await res.json();
      // adaugam in lista
      setRows((prev) => [created, ...prev]);
      setCreateOpen(false);
      setFormName('');
      setFormDescription('');
    } catch (e) {
      console.error(e);
      setFormError('Eroare la comunicarea cu serverul.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!serieToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/series/${serieToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        alert('Nu am putut sterge seria.');
        return;
      }
      setRows((prev) => prev.filter((r) => r.id !== serieToDelete.id));
      setDeleteOpen(false);
      setSerieToDelete(null);
    } catch (e) {
      console.error(e);
      alert('Eroare la comunicarea cu serverul.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="panel mt-6">
      {/* header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Serii studenti</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Administreaza seriile de studenti.</p>
        </div>
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
          <input
            type="text"
            className="form-input w-64"
            placeholder="Cauta dupa nume, descriere sau creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => setCreateOpen(true)}>
            Creeaza serie
          </button>
        </div>
      </div>

      {/* table */}
      <div className="datatables">
        {isMounted && (
          <DataTable
            className="table-hover whitespace-nowrap"
            records={pageRecords}
            withColumnBorders={false}
            fetching={loading}
            columns={[
              {
                accessor: 'name',
                title: 'Nume serie',
                sortable: true,
              },
              {
                accessor: 'description',
                title: 'Descriere',
                sortable: true,
                render: (row) => (
                  <span className="text-gray-600 dark:text-gray-300">{row.description || '—'}</span>
                ),
              },
              {
                accessor: 'createdBy',
                title: 'Creat de',
                sortable: true,
                render: (row) => <span>{row.createdByName || '—'}</span>,
              },
              {
                accessor: 'membersCount',
                title: 'Nr. studenti',
                sortable: true,
                width: 140,
                render: (row) => (
                  <Tippy content="Vezi studentii din aceasta serie">
                    <Link
                      href={`/admin/studenti-inscrisi?serieId=${row.id}`}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="badge bg-primary/10 text-primary">{row.membersCount}</span>
                    </Link>
                  </Tippy>
                ),
              },
              {
                accessor: 'createdAtDisplay',
                title: 'Creat la',
                sortable: true,
                width: 160,
              },
              {
                accessor: 'actions',
                title: '',
                textAlignment: 'right',
                width: 60,
                render: (row) => (
                  <button
                    type="button"
                    onClick={() => {
                      setSerieToDelete(row);
                      setDeleteOpen(true);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300"
                    title="Sterge seria"
                  >
                    {/* trash icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </button>
                ),
              },
            ]}
            totalRecords={sorted.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={300}
            paginationText={({ from, to, totalRecords }) =>
              `Afisez ${from}-${to} din ${totalRecords} inregistrari`
            }
          />
        )}
      </div>

      {/* create modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setCreateOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl dark:bg-[#0e1726]">
            <h3 className="mb-4 text-lg font-semibold">Creeaza serie</h3>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm">Nume serie</label>
                <input
                  className="form-input w-full"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: S1 - Informatica anul 3"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Descriere (optional)</label>
                <textarea
                  className="form-textarea w-full"
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Ex: grupa practica 2025"
                  disabled={creating}
                />
              </div>

              {formError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setCreateOpen(false)} disabled={creating}>
                  Anuleaza
                </button>
                <button className="btn btn-primary" onClick={handleCreate} disabled={creating}>
                  {creating ? 'Se salveaza...' : 'Salveaza'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* delete modal */}
      <Transition appear show={deleteOpen} as={Fragment}>
        <Dialog as="div" open={deleteOpen} onClose={() => (!deleting ? setDeleteOpen(false) : null)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-[black]/60 z-[999]" />
          </Transition.Child>

          <div className="fixed inset-0 z-[999] overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center px-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel
                  as="div"
                  className="panel my-10 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark shadow-xl"
                >
                  {/* header */}
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-4 dark:bg-[#121c2c]">
                    <h5 className="text-xl font-semibold">Confirma stergerea</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => (!deleting ? setDeleteOpen(false) : null)}
                    >
                      <IconX />
                    </button>
                  </div>

                  {/* body */}
                  <div className="px-6 py-6 space-y-4">
                    <p className="text-base leading-relaxed">
                      Stergand seria, toti studentii vor fi dezasignati de la aceasta serie. Orice drepturi viitoare legate de
                      aceasta serie (ex. materiale asignate pe serie) nu vor mai fi valabile. Esti sigur ca vrei sa continui?
                    </p>

                    {serieToDelete && (
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Serie: <span className="font-semibold text-gray-900 dark:text-gray-100">{serieToDelete.name}</span>
                      </p>
                    )}

                    <div className="mt-8 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary px-5 py-2 text-base"
                        onClick={() => (!deleting ? setDeleteOpen(false) : null)}
                        disabled={deleting}
                      >
                        Anuleaza
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger px-5 py-2 text-base"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? 'Se sterge...' : 'Sterge'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>

              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>


    </div>
  );
}
