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

type RequestStatus = 'pending' | 'approved' | 'rejected';

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
};

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

async function approveApplication(id: string): Promise<{ studentId?: string }> {
  const res = await fetch(`${API_BASE}/${id}/approve`, { method: 'POST' });
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
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<StudentApplication | null>(null);
  const [status, setStatus] = useState<RequestStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);

      const data = await fetchApplicationById(id);
      if (!mounted) return;
      if (!data) {
        setRequest(null);
        setLoading(false);
        return;
      }
      setRequest(data);
      setStatus(data.status);

      if (data.status === 'rejected' && data.admin_note) {
        setRejectReason(data.admin_note);
      }

      setLoading(false);
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

    try {
      await approveApplication(request.id);

      // update local UI
      setStatus('approved');
      setRequest((old) => (old ? { ...old, status: 'approved' } : old));

      // optional: daca era respinsa si avea motiv, il golim
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
            <div className="px-4 space-y-8">
              {/* Contact & Identificare */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">1) Contact & Identificare</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Email" value={request.email} />
                  <Row label="Telefon" value={request.telefon} />
                  <Row label="Prenume" value={request.prenume} />
                  <Row label="Nume" value={request.nume} />
                  <Row label="Gen" value={request.gen} />
                  <Row label="Mediu resedinta" value={request.mediu_resedinta} />
                </div>
              </div>

              {/* Date personale & adresa */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">2) Date personale & adresa</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="CNP" value={request.cnp} />
                  <Row label="Judet" value={request.judet} />
                  <Row label="Localitate" value={request.localitate} />
                  <Row label="Strada" value={request.strada} />
                </div>
              </div>

              {/* CI */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">3) Act de identitate (CI)</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Serie CI" value={request.serie_ci} />
                  <Row label="Numar CI" value={request.numar_ci} />
                  <Row label="Eliberat de" value={request.eliberat_de} />
                  <Row
                    label="Data eliberarii"
                    value={request.data_eliberarii ? formatRoDateTime(request.data_eliberarii) : ''}
                  />
                  <div className="grid grid-cols-3 gap-3 py-2">
                    <div className="text-gray-500 dark:text-gray-400">Copie buletin</div>
                    <div className="col-span-2 flex flex-col gap-2">
                      {renderCopieBuletin(request.copie_buletin_blob_id, request.copie_buletin_filename)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Studiile */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">4) Studiile</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Institutie" value={request.institutie} />
                  <Row label="Facultate" value={request.facultate} />
                  <Row label="Specializare" value={request.specializare} />
                  <Row label="Ciclu" value={request.ciclu} />
                </div>
              </div>

              {error && (
                <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                  {error}
                </div>
              )}
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
