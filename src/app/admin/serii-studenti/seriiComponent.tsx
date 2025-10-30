'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

type Serie = {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string; // ISO
  membersCount: number;
};

const seed: Serie[] = [
  { id: 1, name: 'S1 - Informatica anul 3', description: 'Grupa practica 2025', createdAt: '2025-09-01T10:00:00Z', membersCount: 12 },
  { id: 2, name: 'S2 - CTI anul 4',        description: 'Seria finala',         createdAt: '2025-09-05T09:30:00Z', membersCount: 8  },
  { id: 3, name: 'S3 - Mix interfacultati',description: 'Pilot mixt',           createdAt: '2025-09-10T12:15:00Z', membersCount: 5  },
];

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
  useEffect(() => setIsMounted(true), []);

  const [rows, setRows] = useState<Serie[]>(seed);
  const [createOpen, setCreateOpen] = useState(false);

  // search + sort + pagination
  const [search, setSearch] = useState('');
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

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
      [r.id.toString(), r.name, r.description ?? '', r.createdAtDisplay].some((v) =>
        v.toLowerCase().includes(q)
      )
    );
  }, [search, base]);

  const sorted = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof typeof filtered[number]);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  useEffect(() => setPage(1), [pageSize, search, sortStatus]);
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords = sorted.slice(from, to);

  // create modal state
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleCreate = () => {
    setFormError(null);
    const name = formName.trim();
    const description = formDescription.trim();

    if (!name) {
      setFormError('Numele este obligatoriu.');
      return;
    }
    if (rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) {
      setFormError('Exista deja o serie cu acest nume.');
      return;
    }

    const nextId = rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const newSerie: Serie = {
      id: nextId,
      name,
      description: description || null,
      createdAt: new Date().toISOString(),
      membersCount: 0,
    };
    setRows((prev) => [newSerie, ...prev]);
    setCreateOpen(false);
    setFormName('');
    setFormDescription('');
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
            placeholder="Cauta dupa nume sau descriere..."
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
            columns={[
              { accessor: 'id', title: '#ID', sortable: true, width: 80 },
              { accessor: 'name', title: 'Nume serie', sortable: true },
              {
                accessor: 'description',
                title: 'Descriere',
                render: (row) => <span className="text-gray-600 dark:text-gray-300">{row.description || '—'}</span>,
                sortable: true,
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
              { accessor: 'createdAtDisplay', title: 'Creat la', sortable: true, width: 160 },
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
            paginationText={({ from, to, totalRecords }) => `Afisez ${from}-${to} din ${totalRecords} inregistrari`}
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
                />
              </div>

              {formError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-2 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                  {formError}
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2">
                <button className="btn btn-outline-secondary" onClick={() => setCreateOpen(false)}>
                  Anuleaza
                </button>
                <button className="btn btn-primary" onClick={handleCreate}>
                  Salveaza
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
