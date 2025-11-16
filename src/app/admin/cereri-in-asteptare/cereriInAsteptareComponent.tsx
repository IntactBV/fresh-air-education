// src/app/admin/cereri-in-asteptare/cereriInAsteptareComponent.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconArrowForward from '@/components/icon/icon-arrow-forward';
import IconClock from '@/components/icon/icon-clock';
import IconCheckCircle from '@/components/icon/icon-circle-check';
import IconXCircle from '@/components/icon/icon-x-circle';
import IconDatabase from '@/components/icon/icon-database';

type ApiApplication = {
  id: string;
  application_no: number;
  nume: string;
  prenume: string;
  email: string;
  telefon: string | null;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at: string;
};

function formatRoDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  approved: 'Aprobat',
  rejected: 'Respins',
};

export default function CereriInAsteptareComponent() {
  // tabs: pending / approved / rejected
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<ApiApplication[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // search + sort + pagination state
  const [search, setSearch] = useState('');
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'application_no',
    direction: 'desc',
  });

  const [counts, setCounts] = useState<{ pending: number; approved: number; rejected: number }>({
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    let cancelled = false;

    const loadAllCounts = async () => {
      setLoading(true);
      try {
        const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
          fetch('/api/admin/student-applications?status=pending'),
          fetch('/api/admin/student-applications?status=approved'),
          fetch('/api/admin/student-applications?status=rejected'),
        ]);

        const [pendingData, approvedData, rejectedData] = await Promise.all([
          pendingRes.ok ? pendingRes.json() : { items: [] },
          approvedRes.ok ? approvedRes.json() : { items: [] },
          rejectedRes.ok ? rejectedRes.json() : { items: [] },
        ]);

        if (cancelled) return;

        setCounts({
          pending: (pendingData.items || []).length,
          approved: (approvedData.items || []).length,
          rejected: (rejectedData.items || []).length,
        });

        setItems(pendingData.items || []);
        setFetchError(null);
      } catch (err) {
        console.error(err);
        if (!cancelled) {
          setFetchError('Nu am putut incarca cererile.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadAllCounts();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    // daca deja avem items pentru tab-ul curent din fetch-ul initial (doar pentru pending),
    // nu e musai sa refacem fetch-ul, dar ca sa fie proaspat il refacem
    const loadTab = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/student-applications?status=${tab}`);
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        setItems(data.items || []);
        // update count doar pentru tab-ul curent (in caz ca s-a schimbat)
        setCounts((prev) => ({ ...prev, [tab]: (data.items || []).length }));
        setFetchError(null);
      } catch (err) {
        console.error(err);
        setFetchError('Nu am putut incarca cererile.');
      } finally {
        setLoading(false);
      }
    };

    // dupa primul mount, o sa ajungem si aici, e ok
    loadTab();
  }, [tab]);

  const base = useMemo(() => {
    return items.map((it) => ({
      ...it,
      fullName: `${it.nume} ${it.prenume}`.trim(),
      dateDisplay: formatRoDate(it.created_at),
      shortId: it.application_no ? `#${it.application_no}` : '',
    }));
  }, [items]);

  // filtrare dupa search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) => {
      return (
        r.shortId.toLowerCase().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.telefon || '').toLowerCase().includes(q) ||
        r.dateDisplay.toLowerCase().includes(q)
      );
    });
  }, [search, base]);

  // sortare
  const sorted = useMemo(() => {
    // daca se sorteaza dupa data
    if (sortStatus.columnAccessor === 'dateDisplay') {
      const data = [...filtered].sort((a, b) => {
        const da = new Date(a.created_at).getTime();
        const db = new Date(b.created_at).getTime();
        return sortStatus.direction === 'desc' ? db - da : da - db;
      });
      return data;
    }

    const data = sortBy(filtered, sortStatus.columnAccessor as keyof (typeof filtered)[number]);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  // pagination
  useEffect(() => setPage(1), [pageSize, search, sortStatus, tab]);
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords = sorted.slice(from, to);

  // badge de status in coloana
  const renderStatusBadge = (status: string) => {
    const label = STATUS_LABEL[status] || status;
    let cls = 'badge bg-primary/10 text-primary';
    if (status === 'approved') cls = 'badge bg-success/10 text-success';
    if (status === 'rejected') cls = 'badge bg-danger/10 text-danger';
    return <span className={cls}>{label}</span>;
  };

  return (
    <div className="panel mt-6">
      {/* Header */}
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Cereri studenti</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestioneaza cererile primite din formularul public.
          </p>
        </div>
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
          <input
            type="text"
            className="form-input w-64"
            placeholder="Cauta dupa nume, email, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Tabs header */}
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              type="button"
              onClick={() => setTab('pending')}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tab === 'pending' ? '!border-primary text-primary' : ''
              }`}
            >
              <IconClock className="h-4 w-4 shrink-0 group-hover:!text-primary" />
              In asteptare
              <span
                className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary"
              >
                {counts.pending}
              </span>
            </button>
          </li>
          <li className="inline-block">
            <button
              type="button"
              onClick={() => setTab('approved')}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-success hover:text-success ${
                tab === 'approved' ? '!border-success text-success' : ''
              }`}
            >
              <IconCheckCircle className="h-4 w-4 shrink-0 group-hover:!text-success" />
              Aprobate
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-success/10 px-2 text-xs font-medium text-success">
                {counts.approved}
              </span>
            </button>
          </li>
          <li className="inline-block">
            <button
              type="button"
              onClick={() => setTab('rejected')}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-danger hover:text-danger ${
                tab === 'rejected' ? '!border-danger text-danger' : ''
              }`}
            >
              <IconXCircle className="h-4 w-4 shrink-0 group-hover:!text-danger" />
              Respinse
                <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-danger/10 px-2 text-xs font-medium text-danger">
                  {counts.rejected}
                </span>
            </button>
          </li>
        </ul>
      </div>

      {fetchError && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-100">
          {fetchError}
        </div>
      )}

      {/* Table */}
      <div className="datatables">
        {isMounted && pageRecords.length > 0 ? (
          <DataTable
            className="table-hover whitespace-nowrap"
            records={loading ? [] : pageRecords}
            columns={[
              {
                accessor: 'shortId',
                title: '#',
                sortable: true,
                width: 80,
              },
              {
                accessor: 'fullName',
                title: 'Nume',
                sortable: true,
              },
              {
                accessor: 'email',
                title: 'Email',
                sortable: true,
              },
              {
                accessor: 'telefon',
                title: 'Telefon',
                sortable: true,
              },
              {
                accessor: 'dateDisplay',
                title: 'Data',
                sortable: true,
              },
              {
                accessor: 'status',
                title: 'Status',
                render: (row) => renderStatusBadge(row.status),
              },
              {
                accessor: 'actions',
                title: 'Actiuni',
                titleClassName: '!text-right',
                render: (row) => (
                  <div className="flex justify-end">
                    <Tippy content="Vezi detalii">
                      <Link
                        href={`/admin/cereri-in-asteptare/${row.id}`}
                        className="btn btn-sm btn-outline-primary flex items-center gap-2"
                      >
                        <span>Detalii</span>
                        <IconArrowForward className="h-4 w-4" />
                      </Link>
                    </Tippy>
                  </div>
                ),
              },
            ]}
            totalRecords={loading ? 0 : sorted.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={300}
            fetching={loading}
            paginationText={({ from, to, totalRecords }) => `Afisez ${from}-${to} din ${totalRecords} inregistrari`}
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-[#1b2333]/40">
            <IconDatabase className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Nu exista inregistrari de afisat
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
