'use client';

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  Fragment,
} from 'react';
import { DataTable, type DataTableSortStatus } from 'mantine-datatable';
import sortBy from 'lodash/sortBy';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { Dialog, Transition } from '@headlessui/react';

import IconDatabase from '@/components/icon/icon-database';
import IconX from '@/components/icon/icon-x';
import IconEye from '@/components/icon/icon-eye';
import IconTrash from '@/components/icon/icon-trash';
import IconPlus from '@faComponents/icon/icon-plus';

type PublicDocument = {
  id: string;
  section: 'methodology' | 'announcement';
  title: string;
  description: string | null;
  blobId: string;
  mimeType: string;
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  title: string;
  description: string;
  published: boolean;
  publishedAt: string;
  createdAt: string;
  blobId: string;
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

export default function DocumentePubliceComponent() {
  const [isMounted, setIsMounted] = useState(false);

  // taburi
  const [tab, setTab] = useState<'methodology' | 'announcement'>('methodology');

  // lista pt tab curent
  const [docs, setDocs] = useState<PublicDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // count-uri pt taburi (incarcate la mount)
  const [methodologyCount, setMethodologyCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);

  // filtre
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');

  // paginare + sort
  const PAGE_SIZES = [10, 20, 30, 50];
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [page, setPage] = useState(1);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: 'createdAt',
    direction: 'desc',
  });

  // modal upload
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPublished, setUploadPublished] = useState(true);
  const [uploadSaving, setUploadSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // modal delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [docToDelete, setDocToDelete] = useState<Row | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 1) la mount: iau count-urile pt ambele sectiuni
  useEffect(() => {
    (async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          fetch('/api/admin/public-documents?section=methodology', { cache: 'no-store' }),
          fetch('/api/admin/public-documents?section=announcement', { cache: 'no-store' }),
        ]);

        const mData = mRes.ok ? await mRes.json() : [];
        const aData = aRes.ok ? await aRes.json() : [];

        setMethodologyCount(Array.isArray(mData) ? mData.length : 0);
        setAnnouncementCount(Array.isArray(aData) ? aData.length : 0);

        // cum tab-ul implicit e methodology, hai să setăm și lista de aici
        setDocs(
          (mData || []).map((r: any) => ({
            id: r.id,
            section: r.section,
            title: r.title,
            description: r.description,
            blobId: r.blobId ?? r.blob_id,
            mimeType: r.mimeType ?? r.mime_type ?? 'application/pdf',
            published: r.published,
            publishedAt: r.publishedAt ?? r.published_at ?? null,
            createdAt: r.createdAt ?? r.created_at,
          }))
        );
      } catch (e) {
        // dacă una pică, nu rupem pagina
        console.error(e);
      }
    })();
  }, []);

  // 2) la schimbare de tab: încarc lista doar pentru tab-ul activ
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/admin/public-documents?section=${tab}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error('Nu am putut incarca documentele.');
        }
        const data: any[] = await res.json();
        const mapped: PublicDocument[] = data.map((r) => ({
          id: r.id,
          section: r.section,
          title: r.title,
          description: r.description,
          blobId: r.blobId ?? r.blob_id,
          mimeType: r.mimeType ?? r.mime_type ?? 'application/pdf',
          published: r.published,
          publishedAt: r.publishedAt ?? r.published_at ?? null,
          createdAt: r.createdAt ?? r.created_at,
        }));
        setDocs(mapped);

        if (tab === 'methodology') setMethodologyCount(mapped.length);
        else setAnnouncementCount(mapped.length);
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || 'Eroare la incarcarea datelor.');
        setDocs([]);
        if (tab === 'methodology') setMethodologyCount(0);
        else setAnnouncementCount(0);
      } finally {
        setLoading(false);
      }
    })();
  }, [tab]);


  const base: Row[] = useMemo(() => {
    return docs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description ?? '',
      published: d.published,
      publishedAt: formatRoDate(d.publishedAt),
      createdAt: formatRoDate(d.createdAt),
      blobId: d.blobId,
    }));
  }, [docs]);

  const filtered: Row[] = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = base;

    if (q) {
      rows = rows.filter((r) =>
        [r.title, r.description, r.published ? 'publicat' : 'ascuns']
          .join(' ')
          .toLowerCase()
          .includes(q)
      );
    }

    if (statusFilter === 'published') {
      rows = rows.filter((r) => r.published);
    } else if (statusFilter === 'unpublished') {
      rows = rows.filter((r) => !r.published);
    }

    return rows;
  }, [base, search, statusFilter]);

  const sorted: Row[] = useMemo(() => {
    const data = sortBy(filtered, sortStatus.columnAccessor as keyof Row);
    return sortStatus.direction === 'desc' ? data.reverse() : data;
  }, [filtered, sortStatus]);

  useEffect(() => setPage(1), [search, statusFilter, tab, pageSize, sortStatus]);

  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pageRecords: Row[] = sorted.slice(from, to);

  // toggle publish
  const togglePublish = async (row: Row) => {
    try {
      const res = await fetch(`/api/admin/public-documents/${row.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !row.published }),
      });
      if (!res.ok) {
        throw new Error('Nu am putut actualiza statusul documentului.');
      }
      const updated = await res.json();
      setDocs((prev) =>
        prev.map((d) =>
          d.id === row.id
            ? {
                ...d,
                published: updated.published,
                publishedAt: updated.publishedAt ?? updated.published_at ?? null,
              }
            : d
        )
      );
      // count-ul rămâne același – nu e număr de publicate, e număr de documente pe secțiune
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Eroare la publicare/retragere.');
    }
  };

  // delete doc (deschide modal)
  const openDeleteModal = (row: Row) => {
    setDocToDelete(row);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!docToDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/public-documents/${docToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Nu am putut sterge documentul.');
      }
      setDocs((prev) => prev.filter((d) => d.id !== docToDelete.id));

      // actualizez count-ul pt tab-ul curent
      if (tab === 'methodology') {
        setMethodologyCount((c) => Math.max(0, c - 1));
      } else {
        setAnnouncementCount((c) => Math.max(0, c - 1));
      }

      setDeleteOpen(false);
      setDocToDelete(null);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Eroare la stergere.');
    } finally {
      setDeleting(false);
    }
  };

  // upload new doc
  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      setErrorMsg('Selecteaza un fisier PDF.');
      return;
    }
    setUploadSaving(true);
    setErrorMsg(null);
    try {
      // 1) upload fisier -> obtinem blob_id
      const form = new FormData();
      form.append('file', uploadFile);
      const blobRes = await fetch('/api/admin/document-blobs', {
        method: 'POST',
        body: form,
      });
      if (!blobRes.ok) {
        throw new Error('Nu am putut incarca fisierul.');
      }
      const blobData = await blobRes.json();
      const blobId = blobData.id || blobData.blobId;

      // 2) cream documentul public
      const createRes = await fetch('/api/admin/public-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section: tab,
          title: uploadTitle || uploadFile.name,
          description: uploadDescription || null,
          blob_id: blobId,
          published: uploadPublished,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => null);
        throw new Error(err?.error || 'Nu am putut salva documentul.');
      }
      const created = await createRes.json();

      const newDoc: PublicDocument = {
        id: created.id,
        section: created.section,
        title: created.title,
        description: created.description,
        blobId: created.blobId ?? created.blob_id,
        mimeType: created.mimeType ?? 'application/pdf',
        published: created.published,
        publishedAt: created.publishedAt ?? created.published_at ?? null,
        createdAt: created.createdAt ?? created.created_at,
      };

      setDocs((prev) => [newDoc, ...prev]);

      // update count pentru tab-ul curent
      if (tab === 'methodology') {
        setMethodologyCount((c) => c + 1);
      } else {
        setAnnouncementCount((c) => c + 1);
      }

      // reset modal
      setUploadOpen(false);
      setUploadTitle('');
      setUploadDescription('');
      setUploadFile(null);
      setUploadPublished(true);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Eroare la upload.');
    } finally {
      setUploadSaving(false);
    }
  };

  const pickFile = () => {
    fileInputRef.current?.click();
  };

  const columns = [
    {
      accessor: 'title',
      title: 'Titlu',
      sortable: true,
      width: 320,
      render: (row: Row) => (
        <Tippy
          content={
            <div>
              <div className="font-semibold">{row.title}</div>
              {row.description && (
                <div className="text-xs text-gray-200 dark:text-gray-300">{row.description}</div>
              )}
            </div>
          }
          placement="top-start"
          delay={[300, 0]}
        >
          <div className="max-w-[300px] truncate">
            <div className="font-medium text-gray-800 dark:text-gray-100 truncate">{row.title}</div>
            {row.description ? (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{row.description}</div>
            ) : null}
          </div>
        </Tippy>
      ),
    },
    {
      accessor: 'type',
      title: 'Tip',
      width: 80,
      render: () => <span className="badge bg-primary/10 text-primary">PDF</span>,
    },
    {
      accessor: 'published',
      title: 'Status',
      width: 120,
      sortable: true,
      render: (row: Row) =>
        row.published ? (
          <span className="badge bg-success/10 text-success">Publicat</span>
        ) : (
          <span className="badge bg-warning/10 text-warning">Ascuns</span>
        ),
    },
    {
      accessor: 'publishedAt',
      title: 'Data publicare',
      sortable: true,
      render: (row: Row) => row.publishedAt || '—',
    },
    {
      accessor: 'createdAt',
      title: 'Creat la',
      sortable: true,
      render: (row: Row) => row.createdAt || '—',
    },
    {
      accessor: 'actions',
      title: 'Actiuni',
      titleClassName: '!text-right',
      render: (row: Row) => (
        <div className="flex justify-end gap-2">
          <Tippy content={row.published ? 'Ascunde de pe site' : 'Publica pe site'}>
            <button
              className={`btn btn-sm ${
                row.published ? 'btn-outline-warning' : 'btn-outline-success'
              }`}
              onClick={() => togglePublish(row)}
            >
              {row.published ? 'Ascunde' : 'Publica'}
            </button>
          </Tippy>
          <Tippy content="Vezi / descarca">
            <a
              href={`/api/admin/public-documents/${row.id}/download`}
              className="btn btn-sm btn-outline-primary"
              target="_blank"
              rel="noreferrer"
            >
              <IconEye className="h-4 w-4" />
            </a>
          </Tippy>
          <Tippy content="Sterge">
            <button className="btn btn-sm btn-outline-danger" onClick={() => openDeleteModal(row)}>
              <IconTrash className="h-4 w-4" />
            </button>
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
          <h2 className="text-xl font-semibold">Documente publice</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestioneaza documentele PDF afisate in pagina publica.
          </p>
        </div>
      </div>

      {/* tabs */}
      <div>
        <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
          <li className="inline-block">
            <button
              type="button"
              onClick={() => {
                setTab('methodology');
                setSearch('');
                setStatusFilter('all');
              }}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                tab === 'methodology' ? '!border-primary text-primary' : ''
              }`}
            >
              Metodologii & documentatii
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                {methodologyCount}
              </span>
            </button>
          </li>
          <li className="inline-block">
            <button
              type="button"
              onClick={() => {
                setTab('announcement');
                setSearch('');
                setStatusFilter('all');
              }}
              className={`group flex gap-2 border-b border-transparent p-4 hover:border-success hover:text-success ${
                tab === 'announcement' ? '!border-success text-success' : ''
              }`}
            >
              Anunturi
              <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-success/10 px-2 text-xs font-medium text-success">
                {announcementCount}
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

      {/* filtre + buton upload */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {tab === 'methodology'
            ? 'Documente pentru sectiunea "Metodologii si documentatii".'
            : 'Documente pentru sectiunea "Anunturi".'}
        </div>
        <div className="ltr:ml-auto rtl:mr-auto flex flex-wrap items-center gap-3">
          <input
            type="text"
            className="form-input w-56"
            placeholder="Cauta dupa titlu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">Toate</option>
            <option value="published">Publicate</option>
            <option value="unpublished">Ascunse</option>
          </select>
          <button className="btn btn-primary" onClick={() => setUploadOpen(true)}>
            <IconPlus className="h-4 w-4" />
            <span className="ml-1">Incarca material</span>
          </button>
        </div>
      </div>

      {/* tabel */}
      <div className="datatables">
        {isMounted && pageRecords.length > 0 ? (
          <DataTable<Row>
            className="table-hover whitespace-nowrap"
            records={pageRecords}
            fetching={loading}
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
            minHeight={200}
            paginationText={({ from, to, totalRecords }) =>
              `Afisez ${from}-${to} din ${totalRecords} inregistrari`
            }
          />
        ) : (
          <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 rounded border border-dashed border-gray-200 bg-gray-50/30 dark:border-gray-700 dark:bg-[#1b2333]/40">
            <IconDatabase className="h-10 w-10 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {loading ? 'Se incarca...' : 'Nu exista documente incarcate.'}
            </span>
          </div>
        )}
      </div>

      {/* Modal upload – stil aerisit */}
      <Transition appear show={uploadOpen} as={Fragment}>
        <Dialog as="div" open={uploadOpen} onClose={() => (!uploadSaving ? setUploadOpen(false) : null)}>
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
                  className="panel my-10 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark shadow-xl bg-white dark:bg-[#0e1726]"
                >
                  {/* header */}
                  <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-4 dark:bg-[#121c2c]">
                    <h5 className="text-xl font-semibold">Incarca document</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => (!uploadSaving ? setUploadOpen(false) : null)}
                    >
                      <IconX />
                    </button>
                  </div>

                  {/* body */}
                  <div className="px-6 py-6 space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Titlu afisat</label>
                      <input
                        type="text"
                        className="form-input w-full"
                        placeholder="ex. Metodologie inscriere 2025"
                        value={uploadTitle}
                        onChange={(e) => setUploadTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Descriere (optional)</label>
                      <textarea
                        className="form-textarea w-full"
                        rows={3}
                        value={uploadDescription}
                        onChange={(e) => setUploadDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fisier PDF</label>
                      {!uploadFile ? (
                        <div className="rounded-lg border border-dashed border-white-light/60 p-4 text-center dark:border-white/10">
                          <p className="mb-3 text-sm text-white-dark">
                            Selecteaza un fisier. Numele fisierului va deveni numele documentului (daca nu completezi titlul).
                          </p>
                          <button type="button" className="btn btn-primary" onClick={pickFile}>
                            Alege fisier
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="application/pdf"
                            onChange={(e) => {
                              const f = e.target.files?.[0] || null;
                              setUploadFile(f);
                            }}
                          />
                        </div>
                      ) : (
                        <div className="rounded-lg border border-white-light/60 p-3 dark:border-white/10">
                          <div className="flex items-start gap-3">
                            <div className="grid h-10 w-10 shrink-0 place-content-center rounded bg-white-light/60 dark:bg-white/10">
                              <span className="text-xs font-semibold">
                                {(uploadFile.name.split('.').pop() || '').toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-sm font-medium" title={uploadFile.name}>
                                {uploadFile.name}
                              </div>
                              <div className="text-xs text-white-dark">
                                {(uploadFile.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            <button className="btn btn-outline-primary" onClick={() => setUploadFile(null)}>
                              Schimba
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        id="upload-published"
                        type="checkbox"
                        className="form-checkbox"
                        checked={uploadPublished}
                        onChange={(e) => setUploadPublished(e.target.checked)}
                      />
                      <label htmlFor="upload-published" className="text-sm">
                        Publica imediat
                      </label>
                    </div>
                  </div>

                  {/* footer */}
                  <div className="flex items-center justify-end gap-3 border-t border-white-light/10 px-6 py-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary px-5 py-2"
                      onClick={() => (!uploadSaving ? setUploadOpen(false) : null)}
                      disabled={uploadSaving}
                    >
                      Anuleaza
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary px-5 py-2"
                      onClick={handleUploadSubmit}
                      disabled={uploadSaving || !uploadFile}
                    >
                      {uploadSaving ? 'Se salveaza...' : 'Salveaza'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Modal stergere */}
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
                  className="panel my-10 w-full max-w-xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark shadow-xl bg-white dark:bg-[#0e1726]"
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
                      Documentul nu va mai fi afisat in pagina publica si nu va mai fi disponibil pentru descarcare. Esti sigur ca vrei sa continui?
                    </p>

                    {docToDelete && (
                      <p className="text-base text-gray-600 dark:text-gray-400">
                        Document: <span className="font-semibold text-gray-900 dark:text-gray-100">{docToDelete.title}</span>
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
