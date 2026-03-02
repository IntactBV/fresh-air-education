// src/app/admin/cereri-in-asteptare/[id]/cerereDetaliiComponent.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconX from '@/components/icon/icon-x';
import IconChecks from '@/components/icon/icon-checks';
import IconBook from '@/components/icon/icon-book';
import IconEdit from '@/components/icon/icon-edit';

type RequestStatus = 'pending' | 'approved' | 'rejected';

type TabKey = 'personal' | 'documents';

type ApplicationDoc = {
  id: string;
  type: string;
  blobId: string;
  filename: string | null;
  viewUrl: string;
  downloadUrl: string;
  uploadedAt?: string | null;
};

type StudentApplication = {
  id: string;
  application_no: number | null;
  email: string;
  telefon: string | null;
  nume: string;
  prenume: string;
  gen: string | null;
  mediu_resedinta: string | null;
  cnp: string | null;
  judet: string | null;
  localitate: string | null;
  strada: string | null;
  serie_ci: string | null;
  numar_ci: string | null;
  eliberat_de: string | null;
  data_eliberarii: string | null;
  copie_buletin_blob_id: string | null;
  copie_buletin_filename: string | null;
  institutie: string | null;
  facultate: string | null;
  specializare: string | null;
  ciclu: string | null;
  status: RequestStatus;
  admin_note: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  student_id?: string | null;
  serie_id?: string | null;
  serie_name?: string | null;
  tutor_user_id?: string | null;
  documents?: ApplicationDoc[];
};

type Serie = { id: string; name: string };
type Tutor = { id: string; name: string };

const API_BASE = '/api/admin/student-applications';

function formatRoDateTime(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2">
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="col-span-2 font-medium break-words">{value || '—'}</div>
    </div>
  );
}

async function fetchApplicationById(id: string): Promise<StudentApplication | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as StudentApplication;
  } catch {
    return null;
  }
}

// async function approveApplication(id: string): Promise<{ studentId?: string }> {
//   const res = await fetch(`${API_BASE}/${id}/approve`, { method: 'POST' });
//   if (!res.ok) throw new Error('Nu s-a putut aproba cererea.');
//   try {
//     return await res.json();
//   } catch {
//     return {};
//   }
// }

async function approveApplication(
  id: string,
  payload: { serieId: string | null; tutorUserId: string | null }
): Promise<{ studentId?: string }> {
  const res = await fetch(`${API_BASE}/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Nu s-a putut aproba cererea.');
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function rejectApplication(id: string, reason?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
  if (!res.ok) throw new Error('Nu s-a putut respinge cererea.');
}

export default function CerereDetaliiComponent() {
  const { id } = useParams<{ id: string }>();
  const [tab, setTab] = useState<TabKey>('personal');
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<StudentApplication | null>(null);
  const [status, setStatus] = useState<RequestStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [series, setSeries] = useState<Serie[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);

  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [tutorsLoading, setTutorsLoading] = useState(true);

  const [assignSerieId, setAssignSerieId] = useState<string>(''); 
  const [assignTutorId, setAssignTutorId] = useState<string>(''); 

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        // 1) load cererea
        const data = await fetchApplicationById(id);
        if (!mounted) return;

        if (!data) {
          setRequest(null);
          setLoading(false);
          return;
        }

        setRequest(data);
        setAssignSerieId(data.serie_id ?? '');
        setAssignTutorId(data.tutor_user_id ?? '');
        setStatus(data.status);

        if (data.status === 'rejected' && data.admin_note) {
          setRejectReason(data.admin_note);
        }

        // 2) load series
        (async () => {
          try {
            const res = await fetch('/api/admin/series', { cache: 'no-store' });
            const list: any[] = await res.json();
            if (!mounted) return;
            setSeries(list.map((s) => ({ id: s.id, name: s.name })));
          } catch (e) {
            console.error(e);
          } finally {
            if (mounted) setSeriesLoading(false);
          }
        })();

        // 3) load tutors
        (async () => {
          try {
            const res = await fetch('/api/admin/tutors', { cache: 'no-store' });
            const list: any[] = await res.json();
            if (!mounted) return;
            setTutors(
              list.map((u) => ({
                id: u.id,
                name: (u.name || u.email || '').toString(),
              }))
            );
          } catch (e) {
            console.error(e);
          } finally {
            if (mounted) setTutorsLoading(false);
          }
        })();

        setLoading(false);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError('Eroare la incarcarea cererii.');
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (!id) return notFound();
  if (!loading && !request) return notFound();

  // actiuni approve / reject
  const handleApprove = async () => {
    if (!request) return;
    setError(null);

    const serieId = assignSerieId || null;
    const tutorUserId = assignTutorId || null;

    try {
      await approveApplication(request.id, { serieId, tutorUserId });

      setStatus('approved');
      setRequest((old) => (old ? { ...old, status: 'approved' } : old));
      setRejectReason('');
    } catch (e: any) {
      setError(e?.message || 'Eroare la aprobare.');
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setError(null);

    const prevStatus = status;
    const prevRequest = request;

    setStatus('rejected');
    setRequest((old) => (old ? { ...old, status: 'rejected', admin_note: rejectReason } : old));

    try {
      await rejectApplication(request.id, rejectReason);
      // la succes, ne asiguram ca avem motivul in request
      setRequest((old) => (old ? { ...old, status: 'rejected', admin_note: rejectReason } : old));
    } catch (e: any) {
      // rollback UI
      setStatus(prevStatus);
      setRequest(prevRequest);
      setError(e?.message || 'Eroare la respingere.');
    }
  };


  // helper pentru link de download blob
  const renderCopieBuletin = (blobId: string | null, filename?: string | null) => {
    if (!blobId) {
      return <span className="text-sm text-gray-500">Niciun fisier incarcat.</span>;
    }

    const viewUrl = `/api/admin/document-blobs/${blobId}`;
    const downloadUrl = `/api/admin/document-blobs/${blobId}/download`;

    // extragem numele + extensia
    const [baseName, extension] = (() => {
      if (!filename) return ['fisier', ''];
      const parts = filename.split('.');
      if (parts.length === 1) return [filename, ''];
      const ext = parts.pop();
      return [parts.join('.'), ext ? `.${ext}` : ''];
    })();

    // trunchiem doar numele principal (nu si extensia)
    const shortBase =
      baseName.length > 18 ? baseName.slice(0, 15).trimEnd() + '…' : baseName;

    return (
      <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
        <span
          className="font-medium truncate max-w-[180px]"
          title={filename || undefined}
        >
          {shortBase}
          <span className="opacity-70">{extension}</span>
        </span>
        <div className="flex gap-2">
          <Tippy content="Vezi">
            <a href={viewUrl} className="btn btn-xs btn-primary gap-1" target="_blank" rel="noreferrer">
              <IconEye className="h-3 w-3" /> Vezi
            </a>
          </Tippy>
          <Tippy content="Descarca">
            <a href={downloadUrl} download className="btn btn-xs btn-secondary gap-1">
              <IconDownload className="h-3 w-3" /> Descarca
            </a>
          </Tippy>
        </div>
      </div>
    );
  };

  const renderDocRow = (label: string, doc?: ApplicationDoc | null) => {
    if (!doc?.blobId) {
      return (
        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">{label}</div>
          <div className="col-span-2">
            <span className="text-sm text-gray-500">Niciun fisier incarcat.</span>
          </div>
        </div>
      );
    }

    const filename = doc.filename || 'fisier';
    const parts = filename.split('.');
    const ext = parts.length > 1 ? `.${parts.pop()}` : '';
    const base = parts.join('.');
    const shortBase = base.length > 18 ? base.slice(0, 15).trimEnd() + '…' : base;

    return (
      <div className="grid grid-cols-3 gap-3 py-2">
        <div className="text-gray-500 dark:text-gray-400">{label}</div>
        <div className="col-span-2">
          <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
            <span className="font-medium truncate max-w-[180px]" title={filename}>
              {shortBase}
              <span className="opacity-70">{ext}</span>
            </span>
            <div className="flex gap-2">
              <Tippy content="Vezi">
                <a
                  href={doc.viewUrl}
                  className="btn btn-xs btn-primary gap-1"
                  target="_blank"
                  rel="noreferrer"
                >
                  <IconEye className="h-3 w-3" /> Vezi
                </a>
              </Tippy>
              <Tippy content="Descarca">
                <a href={doc.downloadUrl} download className="btn btn-xs btn-secondary gap-1">
                  <IconDownload className="h-3 w-3" /> Descarca
                </a>
              </Tippy>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const docs = request?.documents ?? [];

  const docAdeverintaStudent = docs.find((d) => d.type === 'adeverinta_student') ?? null;
  const docConventieSemnata = docs.find((d) => d.type === 'conventie_semnata') ?? null;
  const docExtrasCont = docs.find((d) => d.type === 'extras_cont') ?? null;

  const documentsCount =
    (docAdeverintaStudent ? 1 : 0) + (docConventieSemnata ? 1 : 0) + (docExtrasCont ? 1 : 0);

  const PersonalTab = () => (
    <div className="space-y-8">
      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Contact & Identificare</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="Email" value={request?.email} />
          <Row label="Telefon" value={request?.telefon} />
          <Row label="Prenume" value={request?.prenume} />
          <Row label="Nume" value={request?.nume} />
          <Row label="Gen" value={request?.gen} />
          <Row label="Mediu resedinta" value={request?.mediu_resedinta} />
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Date personale & adresa</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="CNP" value={request?.cnp} />
          <Row label="Judet" value={request?.judet} />
          <Row label="Localitate" value={request?.localitate} />
          <Row label="Strada" value={request?.strada} />
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Act de identitate (CI)</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="Serie CI" value={request?.serie_ci} />
          <Row label="Numar CI" value={request?.numar_ci} />
          <Row label="Eliberat de" value={request?.eliberat_de} />
          <Row
            label="Data eliberarii"
            value={request?.data_eliberarii ? formatRoDateTime(request.data_eliberarii) : ''}
          />

          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="text-gray-500 dark:text-gray-400">Copie buletin</div>
            <div className="col-span-2 flex flex-col gap-2">
              {renderCopieBuletin(request?.copie_buletin_blob_id ?? null, request?.copie_buletin_filename)}
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Studiile</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="Institutie" value={request?.institutie} />
          <Row label="Facultate" value={request?.facultate} />
          <Row label="Specializare" value={request?.specializare} />
          <Row label="Anul" value={request?.ciclu} />
        </div>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-8">
      <div className="panel p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Documente din cerere</h2>
          <span className="badge bg-primary/10 text-primary">{documentsCount}</span>
        </div>

        <div className="mt-3 divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          {renderDocRow('Adeverinta student', docAdeverintaStudent)}
          {renderDocRow('Conventie-cadru semnata', docConventieSemnata)}
          {renderDocRow('Extras de cont', docExtrasCont)}
        </div>
      </div>

      {documentsCount === 0 ? (
        <div className="text-sm text-gray-500">
          Nu exista documente suplimentare incarcate in cerere.
        </div>
      ) : null}
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      {/* left */}
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="px-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              {request ? `${request.prenume} ${request.nume}` : '—'}
            </h1>
            {request?.application_no ? (
              <p className="text-sm text-gray-400">Cerere #{request.application_no}</p>
            ) : null}
          </div>
          <Link href="/admin/cereri-in-asteptare" className="btn btn-outline-secondary">
            Inapoi la lista
          </Link>
        </div>

        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Se incarca...</div>
        ) : (
          request && (
            <div className="px-4">
              <ul className="mb-5 overflow-y-auto whitespace-nowrap border-b border-[#ebedf2] font-semibold dark:border-[#191e3a] sm:flex">
                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('personal')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'personal' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconBook className="h-4 w-4 shrink-0 group-hover:!text-primary" />
                    Date student
                  </button>
                </li>

                <li className="inline-block">
                  <button
                    type="button"
                    onClick={() => setTab('documents')}
                    className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                      tab === 'documents' ? '!border-primary text-primary' : ''
                    }`}
                  >
                    <IconEdit className="h-4 w-4 shrink-0 group-hover:!text-primary" />
                    Documente
                    <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                      {documentsCount}
                    </span>
                  </button>
                </li>
              </ul>

              <div className="space-y-8">
                {tab === 'personal' ? <PersonalTab /> : null}
                {tab === 'documents' ? <DocumentsTab /> : null}

                {error && (
                  <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                    {error}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {/* right */}
      <div className="mt-6 w-full xl:mt-0 xl:w-96">
        <div className="panel mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Stare cerere</h3>
            {request && (
              <span
                className={`badge ${
                  status === 'pending'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
                    : status === 'approved'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300'
                }`}
              >
                {status === 'pending' ? 'Pending' : status === 'approved' ? 'Aprobat' : 'Respins'}
              </span>
            )}
          </div>

          {request && (
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>Numar cerere:</span>{' '}
                <span className="font-medium">
                  {request.application_no ? `#${request.application_no}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Creat la:</span>{' '}
                <span className="font-medium">{formatRoDateTime(request.created_at)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="panel mb-5">
          <h3 className="mb-3 text-base font-semibold">Asignari</h3>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Serie</label>
              <select
                className="form-select w-full"
                value={assignSerieId}
                onChange={(e) => setAssignSerieId(e.target.value)}
                disabled={seriesLoading || status === 'approved'}
              >
                <option value="">Fara serie</option>
                {series.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">Tutore</label>
              <select
                className="form-select w-full"
                value={assignTutorId}
                onChange={(e) => setAssignTutorId(e.target.value)}
                disabled={tutorsLoading || status === 'approved'}
              >
                <option value="">Fara tutore</option>
                {tutors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Aceste asignari se aplica in momentul aprobarii cererii.
            </p>
          </div>
        </div>

          {/* actiuni */}
        <div className="panel">
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              className="btn btn-success w-full gap-2"
              onClick={handleApprove}
              disabled={status === 'approved' || loading || !request}
              title="Aprobarea va crea un student"
            >
              <IconChecks className="h-5 w-5" /> Aproba cererea
            </button>

            <div className="space-y-2">
              <textarea
                className="form-textarea"
                placeholder="Motiv respingere (optional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-danger w-full gap-2"
                onClick={handleReject}
                disabled={
                  loading ||
                  !request ||
                  status === 'approved' ||
                  (status === 'rejected' && rejectReason.trim() === (request.admin_note || '').trim())
                }
              >
                <IconX className="h-5 w-5" /> Respinge cererea
              </button>
            </div>


            <Link href="/admin/cereri-in-asteptare" className="btn btn-outline-secondary w-full">
              Inapoi la lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
