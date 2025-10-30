'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconArrowForward from '@/components/icon/icon-arrow-forward';

type PendingRequest = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt: string; // ISO date
  status: 'pending';
};

const seed: PendingRequest[] = [
  { id: 101, firstName: 'Ana',    lastName: 'Ionescu',   email: 'ana.ionescu@example.com',    phone: '+40 723 111 222', createdAt: '2025-09-20T10:12:00Z', status: 'pending' },
  { id: 102, firstName: 'Mihai',  lastName: 'Pop',       email: 'mihai.pop@example.com',       phone: '+40 745 333 444', createdAt: '2025-09-21T08:35:00Z', status: 'pending' },
  { id: 103, firstName: 'Ioana',  lastName: 'Dumitru',   email: 'ioana.dumitru@example.com',   phone: '+40 735 555 666', createdAt: '2025-09-22T14:02:00Z', status: 'pending' },
  { id: 104, firstName: 'Andrei', lastName: 'Moldovan',  email: 'andrei.moldovan@example.com', phone: '+40 726 777 888', createdAt: '2025-09-24T09:10:00Z', status: 'pending' },
  { id: 105, firstName: 'Elena',  lastName: 'Marin',     email: 'elena.marin@example.com',     phone: '+40 722 999 000', createdAt: '2025-09-25T16:48:00Z', status: 'pending' },
  { id: 106, firstName: 'Paul',   lastName: 'Stoica',    email: 'paul.stoica@example.com',     phone: '+40 721 123 456', createdAt: '2025-09-26T07:22:00Z', status: 'pending' },
  { id: 107, firstName: 'Carmen', lastName: 'Vasile',    email: 'carmen.vasile@example.com',   phone: '+40 741 234 567', createdAt: '2025-09-27T11:05:00Z', status: 'pending' },
  { id: 108, firstName: 'Vlad',   lastName: 'Georgescu', email: 'vlad.geo@example.com',         phone: '+40 751 345 678', createdAt: '2025-09-27T18:40:00Z', status: 'pending' },
  { id: 109, firstName: 'Roxana', lastName: 'Tudor',     email: 'roxana.tudor@example.com',    phone: '+40 731 456 789', createdAt: '2025-09-28T12:30:00Z', status: 'pending' },
  { id: 110, firstName: 'Dan',    lastName: 'Preda',     email: 'dan.preda@example.com',       phone: '+40 761 567 890', createdAt: '2025-09-29T15:55:00Z', status: 'pending' },
];

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

export default function CereriInAsteptareComponent() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  // derivăm numele complet doar o dată
  const base = useMemo(
    () =>
      seed.map((s) => ({
        ...s,
        fullName: `${s.firstName} ${s.lastName}`,
        dateDisplay: formatRoDate(s.createdAt),
      })),
    []
  );

  // search + sort + pagination state
  const [search, setSearch] = useState('');
  const PAGE_SIZES = [10, 20, 30, 50, 100];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'id',
    direction: 'asc',
  });

  // filtrare după search
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((r) => {
      return (
        r.id.toString().includes(q) ||
        r.fullName.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.dateDisplay.toLowerCase().includes(q)
      );
    });
  }, [search, base]);

  // sortare stabilă
  const sorted = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof typeof filtered[number]);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  // paginație
  useEffect(() => setPage(1), [pageSize, search, sortStatus]);
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords = sorted.slice(from, to);

  return (
    <div className="panel mt-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-xl font-semibold">Cereri în așteptare</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Studenții înscriși prin formular sunt creați cu status <span className="font-medium">pending</span>.
          </p>
        </div>
        <div className="ltr:ml-auto rtl:mr-auto flex items-center gap-3">
          <input
            type="text"
            className="form-input w-64"
            placeholder="Caută după nume, email, telefon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="datatables">
        {isMounted && (
          <DataTable
            className="table-hover whitespace-nowrap"
            records={pageRecords}
            columns={[
              {
                accessor: 'id',
                title: '#ID',
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
                title: 'E-mail',
                sortable: true,
              },
              {
                accessor: 'phone',
                title: 'Telefon',
                sortable: true,
              },
              {
                accessor: 'dateDisplay',
                title: 'Data',
                sortable: true,
              },
              {
                accessor: 'actions',
                title: 'Acțiuni',
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
            totalRecords={sorted.length}
            recordsPerPage={pageSize}
            page={page}
            onPageChange={setPage}
            recordsPerPageOptions={PAGE_SIZES}
            onRecordsPerPageChange={setPageSize}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            minHeight={300}
            paginationText={({ from, to, totalRecords }) => `Afișez ${from}-${to} din ${totalRecords} înregistrări`}
          />
        )}
      </div>
    </div>
  );
}
