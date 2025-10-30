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

type StudentStatus = 'activ' | 'absolvent';

type Student = {
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
  copieBuletin?: string | null;
  institutie: string;
  facultate: string;
  specializare: string;
  ciclu: string;
  approvedAt: string;
  status: StudentStatus;
  // documente incarcate (optional)
  docAdeverintaStudent?: string | null;
  docDeclaratieSemnata?: string | null;
  docAdeverintaFinalizare?: string | null;
};

// endpoints backend (exemplu)
const API_BASE = '/api/students';

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

async function fetchStudentById(id: number): Promise<Student | null> {
  try {
    const res = await fetch(`${API_BASE}/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as Student;
  } catch {
    return null;
  }
}

async function markGraduate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/graduate`, { method: 'POST' });
  if (!res.ok) throw new Error('Nu s-a putut marca absolvent.');
}

async function sendFinalCertificate(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}/send-final-certificate`, { method: 'POST' });
  if (!res.ok) throw new Error('Nu s-a putut trimite adeverinta.');
}

// fallback local (mock)
const FAKE_DB: Student[] = [
  {
    id: 201,
    email: 'andrei.popescu@example.com',
    telefon: '+40 723 111 222',
    nume: 'Popescu',
    prenume: 'Andrei',
    gen: 'M',
    mediuResedinta: 'Urban',
    cnp: '1990101123456',
    judet: 'Bucuresti',
    localitate: 'Bucuresti',
    strada: 'Str. Exemplu 10',
    serieCI: 'B',
    numarCI: '123456',
    eliberatDe: 'SPCLEP Sector 1',
    dataEliberarii: '2022-06-15',
    copieBuletin: '/assets/samples/sample-ci.pdf',
    institutie: 'UB',
    facultate: 'FMI',
    specializare: 'Informatica',
    ciclu: 'Licenta',
    approvedAt: '2025-09-20T10:12:00Z',
    status: 'activ',
    docAdeverintaStudent: '/assets/samples/adeverinta-student.pdf',
    docDeclaratieSemnata: null,
    docAdeverintaFinalizare: null,
  },
];

export default function StudentDetaliiComponent() {
  const { studentId: idStr } = useParams<{ studentId: string }>();
  const router = useRouter();
  const id = Number(idStr);

  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [status, setStatus] = useState<StudentStatus>('activ');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);

      const fromApi = await fetchStudentById(id);
      const data = fromApi ?? FAKE_DB.find((s) => s.id === id) ?? null;

      if (!mounted) return;
      if (!data) {
        setStudent(null);
        setLoading(false);
        return;
      }
      setStudent(data);
      setStatus(data.status);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!Number.isFinite(id)) return notFound();
  if (!loading && !student) return notFound();

  const fileNameFromUrl = (url?: string | null) => {
    if (!url) return '';
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  };

  // actiuni (exemple)
  const handleMarkGraduate = async () => {
    if (!student) return;
    setError(null);
    const prev = status;
    setStatus('absolvent');
    try {
      await markGraduate(student.id);
    } catch (e: any) {
      setStatus(prev);
      setError(e?.message || 'Eroare la marcarea absolvent.');
    }
  };

  const handleSendFinalCertificate = async () => {
    if (!student) return;
    setError(null);
    try {
      await sendFinalCertificate(student.id);
    } catch (e: any) {
      setError(e?.message || 'Eroare la trimiterea adeverintei.');
    }
  };

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      {/* stanga - continut */}
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="px-4">
          <h1 className="text-xl font-semibold">
            {student ? `${student.prenume} ${student.nume}` : '—'}
          </h1>
        </div>

        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Se incarca…</div>
        ) : (
          student && (
            <div className="px-4 space-y-8">
              {/* 1) Contact & Identificare */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">1) Contact & Identificare</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="E-mail" value={student.email} />
                  <Row label="Telefon" value={student.telefon} />
                  <Row label="Prenume" value={student.prenume} />
                  <Row label="Nume" value={student.nume} />
                  <Row label="Gen" value={student.gen} />
                  <Row label="Mediu resedinta" value={student.mediuResedinta} />
                </div>
              </div>

              {/* 2) Date personale & adresa */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">2) Date personale & adresa</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="CNP" value={student.cnp} />
                  <Row label="Judet" value={student.judet} />
                  <Row label="Localitate" value={student.localitate} />
                  <Row label="Strada" value={student.strada} />
                </div>
              </div>

                {/* 3) Act de identitate */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">3) Act de identitate (CI)</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                    <Row label="Serie" value={student.serieCI} />
                    <Row label="Numar" value={student.numarCI} />
                    <Row label="Eliberat de" value={student.eliberatDe} />
                    <Row label="Data eliberarii" value={student.dataEliberarii} />

                    {/* Copia buletin */}
                    <div className="grid grid-cols-3 gap-3 py-2">
                    <div className="text-gray-500 dark:text-gray-400">Copia buletin</div>
                    <div className="col-span-2 flex flex-col gap-2">
                        {student.copieBuletin ? (
                        <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                            <span className="font-medium truncate">{fileNameFromUrl(student.copieBuletin)}</span>
                            <div className="flex gap-2">
                            <a href={student.copieBuletin} className="btn btn-xs btn-primary gap-1">
                                <IconEye className="h-3 w-3" /> Vezi
                            </a>
                            <a href={student.copieBuletin} download className="btn btn-xs btn-secondary gap-1">
                                <IconDownload className="h-3 w-3" /> Descarca
                            </a>
                            </div>
                        </div>
                        ) : (
                        <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>
                        )}
                    </div>
                    </div>
                </div>
            </div>


              {/* 4) Studiile */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">4) Studiile</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Institutie" value={student.institutie} />
                  <Row label="Facultate" value={student.facultate} />
                  <Row label="Specializare" value={student.specializare} />
                  <Row label="Ciclu" value={student.ciclu} />
                </div>
              </div>

              {/* 5) Documente incarcate */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">5) Documente incarcate</h2>

                {/* Adeverinta student */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Adeverinta student</div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {student.docAdeverintaStudent ? (
                      <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                        <span className="font-medium truncate">{fileNameFromUrl(student.docAdeverintaStudent)}</span>
                        <div className="flex gap-2">
                          <a href={student.docAdeverintaStudent} className="btn btn-xs btn-primary gap-1">
                            <IconEye className="h-3 w-3" /> Vezi
                          </a>
                          <a href={student.docAdeverintaStudent} download className="btn btn-xs btn-secondary gap-1">
                            <IconDownload className="h-3 w-3" /> Descarca
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>
                    )}
                  </div>
                </div>

                {/* Declaratie semnata */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Declaratie semnata</div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {student.docDeclaratieSemnata ? (
                      <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                        <span className="font-medium truncate">{fileNameFromUrl(student.docDeclaratieSemnata)}</span>
                        <div className="flex gap-2">
                          <a href={student.docDeclaratieSemnata} className="btn btn-xs btn-primary gap-1">
                            <IconEye className="h-3 w-3" /> Vezi
                          </a>
                          <a href={student.docDeclaratieSemnata} download className="btn btn-xs btn-secondary gap-1">
                            <IconDownload className="h-3 w-3" /> Descarca
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>
                    )}
                  </div>
                </div>

                {/* Adeverinta finalizare */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Adeverinta finalizare</div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {student.docAdeverintaFinalizare ? (
                      <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                        <span className="font-medium truncate">{fileNameFromUrl(student.docAdeverintaFinalizare)}</span>
                        <div className="flex gap-2">
                          <a href={student.docAdeverintaFinalizare} className="btn btn-xs btn-primary gap-1">
                            <IconEye className="h-3 w-3" /> Vezi
                          </a>
                          <a href={student.docAdeverintaFinalizare} download className="btn btn-xs btn-secondary gap-1">
                            <IconDownload className="h-3 w-3" /> Descarca
                          </a>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>
                    )}
                  </div>
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

      {/* dreapta - status + actiuni */}
      <div className="mt-6 w-full xl:mt-0 xl:w-96">
        <div className="panel mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Status student</h3>
            {student && (
              <span
                className={`badge ${
                  status === 'activ'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300'
                    : 'bg-info/10 text-info'
                }`}
              >
                {status === 'activ' ? 'Activ' : 'Absolvent'}
              </span>
            )}
          </div>

          {student && (
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex justify-between">
                <span>ID student:</span> <span className="font-medium">#{student.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Aprobat la:</span> <span className="font-medium">{formatRoDateTime(student.approvedAt)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="grid grid-cols-1 gap-3">
            <button
              type="button"
              className="btn btn-success w-full gap-2"
              onClick={handleMarkGraduate}
              disabled={status === 'absolvent' || loading || !student}
              title="Marcheaza studentul ca absolvent"
            >
              <IconChecks className="h-5 w-5" /> Marcheaza ca absolvent
            </button>

            <button
              type="button"
              className="btn btn-primary w-full"
              onClick={handleSendFinalCertificate}
              disabled={loading || !student}
              title="Trimite adeverinta de finalizare catre student"
            >
              Trimite adeverinta finalizare
            </button>

            <Link href="/admin/studenti-inscrisi" className="btn btn-outline-secondary w-full">
              Inapoi la lista
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
