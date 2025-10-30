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

type PendingRequest = {
  id: number;
  email: string;
  telefon: string;
  nume: string;
  prenume: string;
  gen: string;
  mediuResedinta: string;
  cnp: string;
  judet: string;
  localitate: string;
  strada: string;
  serieCI: string;
  numarCI: string;
  eliberatDe: string;
  dataEliberarii: string;
  copieBuletin: string | null;
  institutie: string;
  facultate: string;
  specializare: string;
  ciclu: string;
  createdAt: string;
  status: RequestStatus;
};

// endpoints backend
const API_BASE = '/api/requests';

function formatRoDateTime(iso: string) {
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

async function fetchRequestById(id: number): Promise<PendingRequest | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as PendingRequest;
  } catch {
    return null;
  }
}

async function approveRequest(id: number): Promise<{ studentId?: number }> {
  const res = await fetch(`${API_BASE}/${id}/approve`, { method: 'POST' });
  if (!res.ok) throw new Error('Nu s-a putut aproba cererea.');
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function rejectRequest(id: number, reason?: string): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: reason ? JSON.stringify({ reason }) : undefined,
  });
  if (!res.ok) throw new Error('Nu s-a putut respinge cererea.');
}

// fallback local
const FAKE_DB: PendingRequest[] = [
  {
    id: 101,
    email: 'ana.ionescu@example.com',
    telefon: '+40 723 111 222',
    nume: 'Ionescu',
    prenume: 'Ana',
    gen: 'F',
    mediuResedinta: 'Urban',
    cnp: '2980101123456',
    judet: 'Cluj',
    localitate: 'Cluj-Napoca',
    strada: 'Str. Memorandumului 12',
    serieCI: 'CJ',
    numarCI: '123456',
    eliberatDe: 'SPCLEP Cluj-Napoca',
    dataEliberarii: '2022-06-15',
    copieBuletin: '/assets/samples/sample-ci.pdf',
    institutie: 'UBB',
    facultate: 'Matematică și Informatică',
    specializare: 'Informatică',
    ciclu: 'Licență',
    createdAt: '2025-09-25T10:22:00Z',
    status: 'pending',
  },
];

export default function CerereDetaliiComponent() {
  const { id: idStr } = useParams<{ id: string }>();
  const router = useRouter();
  const id = Number(idStr);

  const [loading, setLoading] = useState(true);
  const [request, setRequest] = useState<PendingRequest | null>(null);
  const [status, setStatus] = useState<RequestStatus>('pending');
  const [error, setError] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);

      const fromApi = await fetchRequestById(id);
      const data = fromApi ?? FAKE_DB.find((r) => r.id === id) ?? null;

      if (!mounted) return;
      if (!data) {
        setRequest(null);
        setLoading(false);
        return;
      }
      setRequest(data);
      setStatus(data.status);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!Number.isFinite(id)) return notFound();
  if (!loading && !request) return notFound();

  const fileNameFromUrl = (url?: string | null) => {
    if (!url) return '';
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  };

  // acțiuni
  const handleApprove = async () => {
    if (!request) return;
    setError(null);
    const prev = status;
    setStatus('approved');
    try {
      const res = await approveRequest(request.id);
      if (res?.studentId) {
        router.push(`/admin/studenti/${res.studentId}`);
        return;
      }
    } catch (e: any) {
      setStatus(prev);
      setError(e?.message || 'Eroare la aprobare.');
    }
  };

  const handleReject = async () => {
    if (!request) return;
    setError(null);
    const prev = status;
    setStatus('rejected');
    try {
      await rejectRequest(request.id, rejectReason);
    } catch (e: any) {
      setStatus(prev);
      setError(e?.message || 'Eroare la respingere.');
    }
  };

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      {/* stânga - conținut */}
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="px-4">
          <h1 className="text-xl font-semibold">
            {request ? `${request.prenume} ${request.nume}` : '—'}
          </h1>
        </div>

        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Se încarcă…</div>
        ) : (
          request && (
            <div className="px-4 space-y-8">
              {/* 1) Contact & Identificare */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">1) Contact &amp; Identificare</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="E-mail" value={request.email} />
                  <Row label="Telefon" value={request.telefon} />
                  <Row label="Prenume" value={request.prenume} />
                  <Row label="Nume" value={request.nume} />
                  <Row label="Gen" value={request.gen} />
                  <Row label="Mediu reședință" value={request.mediuResedinta} />
                </div>
              </div>

              {/* 2) Date personale & adresă */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">2) Date personale &amp; adresă</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="CNP" value={request.cnp} />
                  <Row label="Județ" value={request.judet} />
                  <Row label="Localitate" value={request.localitate} />
                  <Row label="Stradă" value={request.strada} />
                </div>
              </div>

              {/* 3) Act de identitate */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">3) Act de identitate (CI)</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Serie" value={request.serieCI} />
                  <Row label="Număr" value={request.numarCI} />
                  <Row label="Eliberat de" value={request.eliberatDe} />
                  <Row label="Data eliberării" value={request.dataEliberarii} />
                  <div className="grid grid-cols-3 gap-3 py-2">
                    <div className="text-gray-500 dark:text-gray-400">Copia buletin</div>
                    <div className="col-span-2 flex flex-col gap-2">
                      {request.copieBuletin ? (
                        <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                          <span className="font-medium truncate">{fileNameFromUrl(request.copieBuletin)}</span>
                          <div className="flex gap-2">
                            <a href={request.copieBuletin} className="btn btn-xs btn-primary gap-1">
                              <IconEye className="h-3 w-3" /> Vezi
                            </a>
                            <a href={request.copieBuletin} download className="btn btn-xs btn-secondary gap-1">
                              <IconDownload className="h-3 w-3" /> Descarcă
                            </a>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Niciun fișier încărcat.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4) Studiile */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">4) Studiile</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Instituție" value={request.institutie} />
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

      {/* dreapta - acțiuni */}
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
                <span>ID cerere:</span> <span className="font-medium">#{request.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Creată la:</span> <span className="font-medium">{formatRoDateTime(request.createdAt)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              className="btn btn-success w-full gap-2"
              onClick={handleApprove}
              disabled={status === 'approved' || loading || !request}
              title="Aprobarea va crea un student în tabela 'studenti'"
            >
              <IconChecks className="h-5 w-5" /> Aprobă cererea
            </button>

            <div className="space-y-2">
              <textarea
                className="form-textarea"
                placeholder="Motiv respingere (opțional)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-danger w-full gap-2"
                onClick={handleReject}
                disabled={status === 'rejected' || loading || !request}
              >
                <IconX className="h-5 w-5" /> Respinge cererea
              </button>
            </div>

            <Link href="/admin/cereri-in-asteptare" className="btn btn-outline-secondary w-full">
              Înapoi la listă
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
