'use client';

import { useEffect, useMemo, useState, Fragment } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Dialog, Transition } from '@headlessui/react';

import IconArrowForward from '@/components/icon/icon-arrow-forward';
import IconX from '@/components/icon/icon-x';
import IconUsers from '@/components/icon/icon-users';
import IconAward from '@/components/icon/icon-award';
import IconDatabase from '@/components/icon/icon-database';

type StudentFromApi = {
  id: string;
  studentNo: number | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  approvedAt: string | null;
  status: 'activ' | 'inactiv' | 'absolvent' | string;
  serieId: string | null;
  serieName: string;
};

type Serie = {
  id: string;
  name: string;
};

type Row = {
  id: string;
  studentNo: number | null;
  fullName: string;
  email: string;
  phone: string;
  approvedAt: string;
  status: 'activ' | 'inactiv' | 'absolvent' | string;
  serieId: string | null;
  serieName: string;
};

function formatRoDate(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

export default function StudentiInscrisiComponent( { baseFolder }: { baseFolder: 'admin' | 'tutore' } ) {
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();

  const [students, setStudents] = useState<StudentFromApi[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);

  const [series, setSeries] = useState<Serie[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // tab: inscrisi (activ+inactiv) vs absolventi
  const [tab, setTab] = useState<'enrolled' | 'graduates'>('enrolled');

  // selectie pentru bulk assign (doar in tab 1)
  const [selectedRecords, setSelectedRecords] = useState<Row[]>([]);

  // modal assign
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSerieId, setAssignSerieId] = useState<string>('');

  // filtre
  const [search, setSearch] = useState('');
  const [serieFilter, setSerieFilter] = useState<string | 'all'>('all');

  // paginare + sort
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'studentNo',
    direction: 'asc',
  });

  useEffect(() => {
    setIsMounted(true);

    // fetch students
    (async () => {
      try {
        const res = await fetch('/api/admin/students', { cache: 'no-store' });
        const data: StudentFromApi[] = await res.json();
        setStudents(data);
      } catch (e) {
        console.error(e);
        setErrorMsg('Nu am putut incarca lista de studenti.');
      } finally {
        setStudentsLoading(false);
      }
    })();

    // fetch series
    (async () => {
      try {
        const res = await fetch('/api/admin/series', { cache: 'no-store' });
        const data: any[] = await res.json();
        setSeries(data.map((s) => ({ id: s.id, name: s.name })));
      } catch (e) {
        console.error(e);
      } finally {
        setSeriesLoading(false);
      }
    })();
  }, []);

  // init filtru din query (?serieId=...)
  useEffect(() => {
    const sid = searchParams.get('serieId');
    if (sid) {
      setSerieFilter(sid);
      setTab('enrolled');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // rows de baza
  const base: Row[] = useMemo(() => {
    return students.map((s) => ({
      id: s.id,
      studentNo: s.studentNo,
      fullName: `${s.firstName} ${s.lastName}`.trim(),
      email: s.email,
      phone: s.phone ?? '',
      approvedAt: formatRoDate(s.approvedAt),
      status: s.status,
      serieId: s.serieId,
      serieName: s.serieName,
    }));
  }, [students]);

  // counturi pentru taburi
  const counts = useMemo(() => {
    let enrolled = 0;
    let graduates = 0;
    for (const s of base) {
      if (s.status === 'absolvent') graduates++;
      else enrolled++;
    }
    return { enrolled, graduates };
  }, [base]);

  // aplicam filtrul de tab
  const filteredByTab: Row[] = useMemo(() => {
    if (tab === 'enrolled') {
      return base.filter((r) => r.status !== 'absolvent');
    }
    return base.filter((r) => r.status === 'absolvent');
  }, [base, tab]);

  // filtrare dupa search + serie (doar tab 1)
  const filtered: Row[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = filteredByTab;

    if (q) {
      rows = rows.filter((r) =>
        [
          r.studentNo?.toString() ?? '',
          r.fullName,
          r.email,
          r.phone,
          r.status,
          r.serieName,
        ].some((v) => v.toLowerCase().includes(q))
      );
    }

    if (tab === 'enrolled' && serieFilter !== 'all') {
      if (serieFilter === '__none__') {
        rows = rows.filter((r) => r.serieId === null);
      } else {
        rows = rows.filter((r) => r.serieId === serieFilter);
      }
    }

    return rows;
  }, [filteredByTab, search, tab, serieFilter]);

  // sortare
  const sorted: Row[] = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof Row);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  // reset paginare la schimbare de filtru/tab
  useEffect(() => setPage(1), [pageSize, search, sortStatus, tab, serieFilter]);

  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords: Row[] = sorted.slice(from, to);

  const handleTabChange = (next: 'enrolled' | 'graduates') => {
    setTab(next);
    setSelectedRecords([]);
    if (next === 'graduates') {
      setSerieFilter('all');
    }
  };

  // modal assign
  const openAssign = () => {
    setAssignSerieId('');
    setAssignOpen(true);
  };

  const saveAssign = async () => {
    if (!selectedRecords.length) {
      setAssignOpen(false);
      return;
    }

    const isRemove = assignSerieId === '__none__';

    try {
      const res = await fetch('/api/admin/students/assign-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: selectedRecords.map((s) => s.id),
          seriesId: isRemove ? null : assignSerieId,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setErrorMsg(
          err?.error?.message || 'Nu am putut asigna/deasigna seria.'
        );
        return;
      }

      // update local
      setStudents((prev) =>
        prev.map((st) => {
          if (selectedRecords.find((sel) => sel.id === st.id)) {
            if (isRemove) {
              return {
                ...st,
                serieId: null,
                serieName: '',
              };
            }
            const serie = series.find((s) => s.id === assignSerieId);
            return {
              ...st,
              serieId: assignSerieId,
              serieName: serie ? serie.name : '',
            };
          }
          return st;
        })
      );

      setAssignOpen(false);
      setSelectedRecords([]);
      setErrorMsg(null);
    } catch (e) {
      console.error(e);
      setErrorMsg('Eroare la comunicarea cu serverul.');
    }
  };

  // coloanele difera un pic in functie de tab
  const columns =
    tab === 'enrolled'
      ? [
          {
            accessor: 'studentNo',
            title: '#Student',
            sortable: true,
            width: 110,
            render: (row: Row) => row.studentNo ?? '—',
          },
          {
            accessor: 'fullName',
            title: 'Nume',
            sortable: true,
          },
          {
            accessor: 'email',
            title: 'E-mail',
            sortable: true,
          },
          {
            accessor: 'serieName',
            title: 'Serie',
            sortable: true,
            render: (row: Row) =>
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
            render: (row: Row) => {
              if (row.status === 'activ') {
                return <span className="badge bg-success/10 text-success">Activ</span>;
              }
              if (row.status === 'inactiv') {
                return <span className="badge bg-warning/10 text-warning">Inactiv</span>;
              }
              return <span className="badge bg-info/10 text-info">Absolvent</span>;
            },
          },
          {
            accessor: 'actions',
            title: 'Actiuni',
            titleClassName: '!text-right',
            render: (row: Row) => (
              <div className="flex justify-end">
                <Tippy content="Vezi detalii">
                  <Link
                    href={`/${baseFolder}/studenti-inscrisi/${row.id}`}
                    className="btn btn-sm btn-outline-primary flex items-center gap-2"
                  >
                    <span>Detalii</span>
                    <IconArrowForward className="h-4 w-4" />
                  </Link>
                </Tippy>
              </div>
            ),
          },
        ]
      : [
          {
            accessor: 'studentNo',
            title: '#Student',
            sortable: true,
            width: 110,
            render: (row: Row) => row.studentNo ?? '—',
          },
          {
            accessor: 'fullName',
            title: 'Nume',
            sortable: true,
          },
          {
            accessor: 'email',
            title: 'E-mail',
            sortable: true,
          },
          {
            accessor: 'approvedAt',
            title: 'Data inscriere',
            sortable: true,
            render: (row: Row) => row.approvedAt || '—',
          },
          {
            accessor: 'status',
            title: 'Status',
            sortable: true,
            render: () => <span className="badge bg-info/10 text-info">Absolvent</span>,
          },
          {
            accessor: 'actions',
            title: 'Actiuni',
            titleClassName: '!text-right',
            render: (row: Row) => (
              <div className="flex justify-end">
                <Tippy content="Vezi detalii">
                  <Link
                    href={`/${baseFolder}/studenti-inscrisi/${row.id}`}
                    className="btn btn-sm btn-outline-primary flex items-center gap-2"
                  >
                    <span>Detalii</span>
                    <IconArrowForward className="h-4 w-4" />
                  </Link>
                </Tippy>
              </div>
            ),
          },
        ];

  return (
    <div className="panel mt-6">
      {/* header */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Studenti inscrisi</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Studentii aprobati din cererile in asteptare.
          </p>
        </div>
      </div>

      {/* tabs ca la cereri */}
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              type="button"
              onClick={() => handleTabChange('enrolled')}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tab === 'enrolled' ? '!border-primary text-primary' : ''
              }`}
            >
              <IconUsers className="h-4 w-4 shrink-0 group-hover:!text-primary" />
              Studenti inscrisi
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                {counts.enrolled}
              </span>
            </button>
          </li>
          <li className="inline-block">
            <button
              type="button"
              onClick={() => handleTabChange('graduates')}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-success hover:text-success ${
                tab === 'graduates' ? '!border-success text-success' : ''
              }`}
            >
              <IconAward className="h-4 w-4 shrink-0 group-hover:!text-success" />
              Absolventi
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-success/10 px-2 text-xs font-medium text-success">
                {counts.graduates}
              </span>
            </button>
          </li>
        </ul>
      </div>

      {/* alert eroare */}
      {errorMsg && (
        <div className="mb-4 flex items-center rounded bg-danger-light p-3.5 text-danger dark:bg-danger-dark-light">
          <span className="pr-2">
            <strong className="mr-1">Eroare:</strong> {errorMsg}
          </span>
          <button
            type="button"
            className="ml-auto hover:opacity-80"
            onClick={() => setErrorMsg(null)}
          >
            <IconX className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* filtre specifice tabului */}
      {tab === 'enrolled' && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Studentii activi sau inactivi.
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
              value={serieFilter}
              onChange={(e) => setSerieFilter(e.target.value)}
              disabled={seriesLoading}
            >
              <option value="all">Toate seriile</option>
              <option value="__none__">— fara serie —</option>
              {series.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

          </div>
        </div>
      )}

      {tab === 'graduates' && (
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Studentii marcati ca absolvent.
          </div>
          <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
            <input
              type="text"
              className="form-input w-64"
              placeholder="Cauta dupa nume, email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* bulk toolbar – doar in tabul de inscrisi */}
      {tab === 'enrolled' && selectedRecords.length > 0 && (
        <div className="mb-3 flex items-center justify-between rounded-md border border-primary/20 p-3 dark:border-[#1b2e4b]">
          <div className="text-sm">
            <span className="font-medium">{selectedRecords.length}</span> selectati
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-primary btn-sm" onClick={openAssign}>
              Asigneaza la serie…
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setSelectedRecords([])}
            >
              Goleste selectia
            </button>
          </div>
        </div>
      )}

      {/* tabel */}
      <div className="datatables">
        {isMounted && pageRecords.length > 0 ? (
          <DataTable<Row>
            className="table-hover whitespace-nowrap"
            records={pageRecords}
            fetching={studentsLoading}
            columns={columns as any}
            highlightOnHover
            totalRecords={sorted.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            selectedRecords={tab === 'enrolled' ? selectedRecords : []}
            onSelectedRecordsChange={tab === 'enrolled' ? setSelectedRecords : () => {}}
            minHeight={200}
            paginationText={({ from, to, totalRecords }) =>
              `Afisez ${from}-${to} din ${totalRecords} inregistrari`
            }
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

      {/* Modal: Asigneaza student la serie… */}
      <Transition appear show={assignOpen} as={Fragment}>
        <Dialog as="div" open={assignOpen} onClose={() => setAssignOpen(false)}>
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
                <Dialog.Panel className="panel my-8 w-full max-w-lg overflow-hidden rounded-lg border-0 bg-white p-0 text-black dark:bg-[#0e1726] dark:text-white-dark">
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                    <h5 className="text-lg font-semibold">Asigneaza student la serie</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setAssignOpen(false)}
                    >
                      <IconX />
                    </button>
                  </div>
                  <div className="p-5 space-y-3">
                    <label className="text-sm">Alege seria</label>
                    <select
                      className="form-select w-full"
                      value={assignSerieId}
                      onChange={(e) => setAssignSerieId(e.target.value)}
                    >
                      <option value="">— Selecteaza —</option>
                      <option value="__none__">— fara serie —</option>
                      {series.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-6 flex justify-end gap-2">
                      <button className="btn btn-outline-secondary" onClick={() => setAssignOpen(false)}>
                        Anuleaza
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={saveAssign}
                        disabled={!selectedRecords.length || assignSerieId === ''}
                      >
                        Salveaza
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
