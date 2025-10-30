'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconArrowForward from '@/components/icon/icon-arrow-forward';

type EnrolledStudent = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  approvedAt: string;
  status: 'activ' | 'absolvent';
};

type Serie = { id: number; name: string };

/** randul afisat in tabel (enriched) */
type Row = EnrolledStudent & {
  fullName: string;
  dateDisplay: string;    // nu-l mai afisam in tabel
  serieId: number | null; // o singura serie / student
  serieName: string;      // badge in tabel
};

const seedStudents: EnrolledStudent[] = [
  { id: 201, firstName: 'Andrei',  lastName: 'Popescu',   email: 'andrei.popescu@example.com',   phone: '+40 723 111 222', approvedAt: '2025-09-20T10:12:00Z', status: 'activ' },
  { id: 202, firstName: 'Maria',   lastName: 'Ionescu',   email: 'maria.ionescu@example.com',    phone: '+40 745 333 444', approvedAt: '2025-09-21T08:35:00Z', status: 'activ' },
  { id: 203, firstName: 'Vlad',    lastName: 'Dumitru',   email: 'vlad.dumitru@example.com',     phone: '+40 735 555 666', approvedAt: '2025-09-22T14:02:00Z', status: 'absolvent' },
  { id: 204, firstName: 'Ioana',   lastName: 'Moldovan',  email: 'ioana.moldovan@example.com',   phone: '+40 726 777 888', approvedAt: '2025-09-24T09:10:00Z', status: 'activ' },
  { id: 205, firstName: 'Elena',   lastName: 'Marin',     email: 'elena.marin@example.com',      phone: '+40 722 999 000', approvedAt: '2025-09-25T16:48:00Z', status: 'activ' },
  { id: 206, firstName: 'Paul',    lastName: 'Stoica',    email: 'paul.stoica@example.com',      phone: '+40 721 123 456', approvedAt: '2025-09-26T07:22:00Z', status: 'activ' },
  { id: 207, firstName: 'Carmen',  lastName: 'Vasile',    email: 'carmen.vasile@example.com',    phone: '+40 741 234 567', approvedAt: '2025-09-27T11:05:00Z', status: 'activ' },
  { id: 208, firstName: 'Roxana',  lastName: 'Georgescu', email: 'roxana.geo@example.com',       phone: '+40 751 345 678', approvedAt: '2025-09-27T18:40:00Z', status: 'absolvent' },
  { id: 209, firstName: 'Dan',     lastName: 'Tudor',     email: 'dan.tudor@example.com',        phone: '+40 731 456 789', approvedAt: '2025-09-28T12:30:00Z', status: 'activ' },
  { id: 210, firstName: 'Bianca',  lastName: 'Radu',      email: 'bianca.radu@example.com',      phone: '+40 761 567 890', approvedAt: '2025-09-29T15:55:00Z', status: 'activ' },
];

const seedSeries: Serie[] = [
  { id: 1, name: 'S1 - Informatica anul 3' },
  { id: 2, name: 'S2 - CTI anul 4' },
  { id: 3, name: 'S3 - Mix interfacultati' },
  { id: 4, name: 'S4 - Pilot backend' },
];

/** student -> serieId (sau null) */
const initialSeriesMap: Record<number, number | null> = {
  201: 1, 202: 1, 203: 2, 204: 3, 205: null,
  206: 4, 207: 2, 208: 3, 209: null, 210: 1,
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

export default function StudentiInscrisiComponent() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  const searchParams = useSearchParams();

  // serii si mapare (one-to-one)
  const [series] = useState<Serie[]>(seedSeries);
  const [seriesMap, setSeriesMap] = useState<Record<number, number | null>>(initialSeriesMap);

  // base rows (fara serieName completat inca)
  const base = useMemo<Row[]>(
    () =>
      seedStudents.map((s) => ({
        ...s,
        fullName: `${s.firstName} ${s.lastName}`,
        dateDisplay: formatRoDate(s.approvedAt),
        serieId: initialSeriesMap[s.id] ?? null,
        serieName: '',
      })),
    []
  );

  // selectie (conform modelului tau)
  const [selectedRecords, setSelectedRecords] = useState<Row[]>([]);

  // modal „Asigneaza student la serie…”
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSerieId, setAssignSerieId] = useState<number | ''>('');

  // cautare + sort + paginare
  const [search, setSearch] = useState('');
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });

  // filtru dupa serie
  const [serieFilter, setSerieFilter] = useState<number | 'all'>('all');

  // init filtru din ?serieId=
  useEffect(() => {
    const sid = searchParams.get('serieId');
    if (sid) {
      const n = Number(sid);
      if (Number.isFinite(n) && seedSeries.some((s) => s.id === n)) setSerieFilter(n);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const seriesById = useMemo(() => new Map(series.map((s) => [s.id, s])), [series]);

  // sincroneaza serieName/serieId din state
  const enriched: Row[] = useMemo(() => {
    return base.map((r) => {
      const serieId = seriesMap[r.id] ?? null;
      const serie = serieId ? seriesById.get(serieId) || null : null;
      return { ...r, serieId, serieName: serie?.name || '' };
    });
  }, [base, seriesMap, seriesById]);

  // filtrare + cautare (fara data aprobare ca sa scadem latimea)
  const filtered: Row[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = enriched;
    if (q) {
      rows = rows.filter((r) =>
        [r.id, r.fullName, r.email, r.phone, r.status, r.serieName]
          .some((v) => v?.toString().toLowerCase().includes(q))
      );
    }
    if (serieFilter !== 'all') rows = rows.filter((r) => r.serieId === serieFilter);
    return rows;
  }, [search, enriched, serieFilter]);

  const sorted: Row[] = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof Row);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  useEffect(() => setPage(1), [pageSize, search, sortStatus, serieFilter]);

  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords: Row[] = sorted.slice(from, to);

  // bulk: open modal
  const openAssign = () => {
    setAssignSerieId('');
    setAssignOpen(true);
  };

  // bulk: save
  const saveAssign = () => {
    if (!selectedRecords.length || assignSerieId === '') {
      setAssignOpen(false);
      return;
    }
    const serieIdNum = Number(assignSerieId);
    setSeriesMap((prev) => {
      const next = { ...prev };
      for (const s of selectedRecords) next[s.id] = serieIdNum; // one-to-one
      return next;
    });
    setAssignOpen(false);
    setSelectedRecords([]);
  };

  return (
    <div className="panel mt-6">
      {/* header + filtre */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Studenti inscrisi</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Studentii aprobati din cererile in asteptare.</p>
        </div>
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
          <input
            type="text"
            className="form-input w-64"
            placeholder="Cauta dupa nume, email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select w-64"
            value={serieFilter === 'all' ? 'all' : String(serieFilter)}
            onChange={(e) => setSerieFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">Toate seriile</option>
            {seedSeries.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* bulk toolbar */}
      {selectedRecords.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-primary/20 p-3 dark:border-[#1b2e4b]">
          <div className="text-sm">
            <span className="font-medium">{selectedRecords.length}</span> selectati
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={openAssign}>
              Asigneaza student la serie…
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setSelectedRecords([])}>
              Goleste selectia
            </button>
          </div>
        </div>
      )}

      {/* tabel */}
      <div className="datatables">
        {isMounted && (
          <DataTable<Row>
            className="table-hover whitespace-nowrap"
            records={pageRecords}
            columns={[
              { accessor: 'id', title: '#ID', sortable: true, width: 90 },
              { accessor: 'fullName', title: 'Nume', sortable: true },
              { accessor: 'email', title: 'E-mail', sortable: true },
              {
                accessor: 'serieName',
                title: 'Serie',
                sortable: true,
                render: (row) =>
                  row.serieName ? (
                    <span className="badge bg-primary/10 text-primary">{row.serieName}</span>
                  ) : (
                    <span className="text-xs text-gray-500">—</span>
                  ),
              },
              {
                accessor: 'status',
                title: 'Status',
                sortable: true,
                render: (row) =>
                  row.status === 'activ' ? (
                    <span className="badge bg-success/10 text-success">Activ</span>
                  ) : (
                    <span className="badge bg-info/10 text-info">Absolvent</span>
                  ),
              },
              {
                accessor: 'actions',
                title: 'Actiuni',
                titleClassName: '!text-right',
                render: (row) => (
                  <div className="flex justify-end">
                    <Tippy content="Vezi detalii">
                      <Link
                        href={`/admin/studenti-inscrisi/${row.id}`}
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
            highlightOnHover
            totalRecords={sorted.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            selectedRecords={selectedRecords}
            onSelectedRecordsChange={setSelectedRecords}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) => `Afisez ${from}-${to} din ${totalRecords} inregistrari`}
          />
        )}
      </div>

      {/* Modal: Asigneaza student la serie… */}
      {assignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setAssignOpen(false)} />
          <div className="relative z-10 w-full max-w-lg rounded-lg bg-white p-5 shadow-xl dark:bg-[#0e1726]">
            <h3 className="mb-4 text-lg font-semibold">Asigneaza student la serie…</h3>
            <div className="space-y-2">
              <label className="text-sm">Alege seria</label>
              <select
                className="form-select w-full"
                value={assignSerieId === '' ? '' : String(assignSerieId)}
                onChange={(e) => setAssignSerieId(e.target.value === '' ? '' : Number(e.target.value))}
              >
                <option value="">— Selecteaza seria —</option>
                {seedSeries.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="btn btn-outline-secondary" onClick={() => setAssignOpen(false)}>Anuleaza</button>
              <button className="btn btn-primary" onClick={saveAssign} disabled={assignSerieId === ''}>
                Salveaza
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
