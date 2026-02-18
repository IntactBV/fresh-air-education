'use client';

import { useEffect, useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconChecks from '@/components/icon/icon-checks';
import IconAward from '@/components/icon/icon-award';
import IconX from '@/components/icon/icon-x';
import AcroFormDocumentDialog from '@/components/custom/AcroFormDocumentDialog';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import SabloaneDeclaratiiDialog from './SabloaneDeclaratiiDialog';
import IconClipboardText from '@faComponents/icon/icon-clipboard-text';

const MySwal = withReactContent(Swal);

type FetchStudentResponse = {
  student: {
    id: string;
    studentNo: number | null;
    applicationId: string;
    userId: string | null;
    email: string;
    telefon: string | null;
    nume: string;
    prenume: string;
    cnp: string | null;
    status: 'activ' | 'inactiv' | 'absolvent' | string;
    createdAt: string;
    updatedAt: string;
  };
  application: {
    id: string;
    applicationNo: number | null;
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
    dataEliberarii: string; // DATE in DB, vine ca string
    institutie: string;
    facultate: string;
    specializare: string;
    ciclu: string;
    status: string;
    createdAt: string;
    copieBuletin: { blobId: string; downloadUrl: string; filename: string | null } | null;
  };
  series: { id: string; name: string | null } | null;
  documents: Array<{
    id: string;
    type: string;
    blobId: string;
    filename: string;
    mimeType: string;
    uploadedAt: string;
    uploadedByRole: string;
    uploadedByUser: string | null;
    isVisibleToStudent: boolean;
    status: string;
    viewUrl: string;
    downloadUrl: string;
  }>;
};

function formatRoDateTime(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

function formatRoDate(iso: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function renderDocument(blobId: string | null, filename?: string | null, label?: string) {
  if (!blobId) {
    return <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>;
  }

  const viewUrl = `/api/admin/document-blobs/${blobId}`;
  const downloadUrl = `/api/admin/document-blobs/${blobId}/download`;

  const [baseName, extension] = (() => {
    if (!filename) return ['fisier', ''];
    const parts = filename.split('.');
    if (parts.length === 1) return [filename, ''];
    const ext = parts.pop();
    return [parts.join('.'), ext ? `.${ext}` : ''];
  })();

  const shortBase = baseName.length > 18 ? baseName.slice(0, 15).trimEnd() + '…' : baseName;

  return (
    <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
      <span className="font-medium truncate max-w-[180px]" title={filename || undefined}>
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
}


function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid grid-cols-3 gap-3 py-2">
      <div className="text-gray-500 dark:text-gray-400">{label}</div>
      <div className="col-span-2 font-medium break-words">{value || '—'}</div>
    </div>
  );
}

export default function StudentDetaliiComponent( { baseFolder }: { baseFolder: 'admin' | 'tutore' }) {
  const { studentId } = useParams<{ studentId: string }>();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [student, setStudent] = useState<FetchStudentResponse['student'] | null>(null);
  const [application, setApplication] = useState<FetchStudentResponse['application'] | null>(null);
  const [series, setSeries] = useState<FetchStudentResponse['series'] | null>(null);
  const [documents, setDocuments] = useState<FetchStudentResponse['documents']>([]);

  const [status, setStatus] = useState<'activ' | 'inactiv' | 'absolvent' | string>('activ');
  const [actionError, setActionError] = useState<string | null>(null);

  const [acroDialogOpen, setAcroDialogOpen] = useState(false);
  const [acroDialogDocType, setAcroDialogDocType] = useState<'adeverinta_finalizare_stagiu' | 'adeverinta_student' | 'declaratie_student'>('adeverinta_finalizare_stagiu');

  const [sabloaneDeclaratiiDialogOpen, setSabloaneDeclaratiiDialogOpen] = useState(false);

  const hasRequiredDocs = (() => {
    const types = documents.map((d) => d.type);

    const required = ['adeverinta_student', 'declaratie_evitare_dubla_finantare_semnata', 'declaratie_eligibilitate_membru_semnata', 'adeverinta_finalizare_stagiu'];
    return required.every((r) => types.includes(r));
  })();

  // studentul trebuie sa fie activ in DB (dupa translatare) SI sa aiba userId
  const canGraduate =
    student &&
    status === 'activ' &&
    !!student.userId &&
    hasRequiredDocs;

  // fetch la ruta noua
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/admin/students/${studentId}`, { cache: 'no-store' });
        if (!res.ok) {
          setFetchError('Nu am putut incarca datele studentului.');
          setLoading(false);
          return;
        }
        const data = (await res.json()) as FetchStudentResponse;
        if (!mounted) return;

        setStudent(data.student);
        setApplication(data.application);
        setSeries(data.series);
        setDocuments(data.documents);
        setStatus(data.student.status);
      } catch (e) {
        console.error(e);
        if (mounted) setFetchError('Eroare la comunicarea cu serverul.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [studentId]);

  if (!studentId) return notFound();
  if (!loading && !student) return notFound();

  // extragem documentele dupa tip
  const docAdeverintaStudent = documents.find((d) => d.type === 'adeverinta_student');
  const docDeclaratieEvitareDublaFinantareSemnata = documents.find((d) => d.type === 'declaratie_evitare_dubla_finantare_semnata');
  const docDeclaratieEligibilitateMembru = documents.find((d) => d.type === 'declaratie_eligibilitate_membru_semnata');
  const docAdeverintaFinalizare = documents.find((d) => d.type === 'adeverinta_finalizare_stagiu');

  const handleMarkGraduate = async () => {
    if (!student) return;
    setActionError(null);
    const prev = status;
    setStatus('absolvent'); // optimistic

    try {
      const res = await fetch(`/api/admin/students/${student.id}/graduate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setStatus(prev);
        setActionError(err?.error || 'Nu s-a putut marca absolvent.');
        return;
      }

    } catch (e: any) {
      setStatus(prev);
      setActionError(e?.message || 'Eroare la comunicarea cu serverul.');
    }
  };

  const handleSendFinalCertificate = async () => {
    if (!student) return;
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/send-final-certificate`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Nu s-a putut trimite adeverinta de finalizare.');
      }
    } catch (e: any) {
      setActionError(e?.message || 'Eroare la trimiterea adeverintei.');
    }
  };

  const renderStatusBadge = (st?: string | null) => {
    if (!st) return null;
    if (st === 'activ')
      return (
        <span className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
          Activ
        </span>
      );
    if (st === 'inactiv')
      return (
        <span className="badge bg-warning/10 text-warning">
          Inactiv
        </span>
      );
    if (st === 'absolvent')
      return (
        <span className="badge bg-info/10 text-info">
          Absolvent
        </span>
      );
    return <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700/40">{st}</span>;
  };

  const handleOpenFinalCertDialog = () => {
    setAcroDialogDocType('adeverinta_finalizare_stagiu');
    setAcroDialogOpen(true);
  };

  const handleOpenSabloaneDeclaratiiDialog = () => {
    setSabloaneDeclaratiiDialogOpen(true);
  };

  const showAssignedToast = () => {
    MySwal.fire({
      text: 'Documentul a fost asignat studentului. Studentul a primit un e-mail de notificare.',
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 4500,
      timerProgressBar: true,
      showCloseButton: true,
      icon: 'success',
      width: 480,
      customClass: {
        popup:
          'bg-primary text-white shadow-lg rounded-lg w-[480px] max-w-[480px] px-4 py-3',
        title:
          'text-[13px] leading-snug font-medium text-left',
        closeButton:
          'text-white text-xs hover:text-white/80 focus:outline-none',
        timerProgressBar: 'bg-white/60',
      },
    });
  };



  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      {/* stanga - continut */}
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="px-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">
              {application ? `${application.prenume} ${application.nume}` : '—'}
            </h1>
            {student?.studentNo && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                #Student {student.studentNo}
              </p>
            )}
          </div>
          {series && series.name ? (
            <span className="badge bg-primary/10 text-primary">{series.name}</span>
          ) : null}
        </div>

        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Se incarca…</div>
        ) : fetchError ? (
          <div className="mx-4 mb-4 flex items-center rounded bg-danger-light p-3.5 text-danger dark:bg-danger-dark-light">
            <span className="pr-2">
              <strong className="mr-1">Eroare:</strong> {fetchError}
            </span>
            <button
              type="button"
              className="ml-auto hover:opacity-80"
              onClick={() => setFetchError(null)}
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          application && (
            <div className="px-4 space-y-8">
              {/* 1) Contact & Identificare */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">Contact & identificare</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="E-mail" value={application.email} />
                  <Row label="Telefon" value={application.telefon} />
                  <Row label="Prenume" value={application.prenume} />
                  <Row label="Nume" value={application.nume} />
                  <Row label="Gen" value={application.gen} />
                  <Row label="Mediu resedinta" value={application.mediuResedinta} />
                </div>
              </div>

              {/* 2) Date personale & adresa */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">Date personale & adresa</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="CNP" value={application.cnp} />
                  <Row label="Judet" value={application.judet} />
                  <Row label="Localitate" value={application.localitate} />
                  <Row label="Strada" value={application.strada} />
                </div>
              </div>

              {/* 3) Act de identitate */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">Act de identitate (CI)</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Serie" value={application.serieCI} />
                  <Row label="Numar" value={application.numarCI} />
                  <Row label="Eliberat de" value={application.eliberatDe} />
                  <Row label="Data eliberarii" value={formatRoDate(application.dataEliberarii)} />

                  {/* Copie buletin din aplicatie */}
                  <div className="grid grid-cols-3 gap-3 py-2">
                    <div className="text-gray-500 dark:text-gray-400">Copia buletin (din cerere)</div>
                      <div className="col-span-2 flex flex-col gap-2">
                        {renderDocument(
                          application.copieBuletin?.blobId || null,
                          application.copieBuletin?.filename || undefined
                        )}
                      </div>
                  </div>
                </div>
              </div>

              {/* 4) Studiile */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">Studiile</h2>
                <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
                  <Row label="Institutie" value={application.institutie} />
                  <Row label="Facultate" value={application.facultate} />
                  <Row label="Specializare" value={application.specializare} />
                  <Row label="Ciclu" value={application.ciclu} />
                </div>
              </div>

              {/* 5) Documente din platforma */}
              <div className="panel p-4">
                <h2 className="mb-1 text-lg font-semibold">Documente incarcate</h2>

                {/* Adeverinta student */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Adeverinta student</div>
                    <div className="col-span-2 flex flex-col gap-2">
                      {renderDocument(docAdeverintaStudent?.blobId || null, docAdeverintaStudent?.filename)}
                    </div>

                </div>

                {/* Declaratie eligibilitate membru */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Declaratie eligibilitate membru</div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {renderDocument(docDeclaratieEligibilitateMembru?.blobId || null, docDeclaratieEligibilitateMembru?.filename)}
                  </div>

                </div>

                {/* Declaratie cu privire la evitarea dublei finantari */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Declaratie cu privire la evitarea dublei finantari</div>
                  <div className="col-span-2 flex flex-col gap-2">
                    {renderDocument(docDeclaratieEvitareDublaFinantareSemnata?.blobId || null, docDeclaratieEvitareDublaFinantareSemnata?.filename)}
                  </div>

                </div>

                {/* Adeverinta finalizare */}
                <div className="grid grid-cols-3 gap-3 py-2">
                  <div className="text-gray-500 dark:text-gray-400">Adeverinta finalizare</div>
                    <div className="col-span-2 flex flex-col gap-2">
                      {renderDocument(docAdeverintaFinalizare?.blobId || null, docAdeverintaFinalizare?.filename)}
                    </div>

                </div>
              </div>

              {actionError && (
                <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                  {actionError}
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
            {renderStatusBadge(status)}
          </div>

          {student && (
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <span>ID student</span>
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 break-all">
                  {student.id}
                </div>
              </div>

              <div className="flex justify-between">
                <span>Creat la:</span>
                <span className="font-medium">{formatRoDateTime(student.createdAt)}</span>
              </div>

              <div className="flex justify-between">
                <span>Cont asociat</span>
                {student.userId ? (
                  <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 break-all">
                    {student.userId}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">— niciun cont asociat —</span>
                )}
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
              disabled={!canGraduate || loading || !student}
              title={
                !canGraduate
                  ? 'Studentul trebuie sa fie activ, sa aiba cont si sa aiba toate documentele.'
                  : 'Marcheaza studentul ca absolvent'
              }
            >
              <IconChecks className="h-5 w-5" /> Marcheaza ca absolvent
            </button>

            {!canGraduate && (
              <p className="text-xs text-gray-400">
                Verifica statusul studentului si documentele obligatorii.
              </p>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 my-3"></div>

            <button
              type="button"
              className="btn btn-primary w-full gap-2"
              onClick={handleOpenFinalCertDialog}
              disabled={loading || !student}
              title="Trimite adeverinta de finalizare catre student"
            >
              <IconAward className="h-5 w-5" /> Genereaza adeverinta finalizare
            </button>

            <button
              type="button"
              className="btn btn-primary w-full gap-2"
              onClick={handleOpenSabloaneDeclaratiiDialog}
              disabled={loading || !student}
              title="Vezi sau inlocuiesti sabloanele pentru declaratii"
            >
              <IconClipboardText className="h-5 w-5" /> Sabloane implicite declaratii
            </button>

            <Link href={`/${baseFolder}/studenti-inscrisi`} className="btn btn-outline-secondary w-full">
              Inapoi la lista
            </Link>
          </div>
        </div>
      </div>

      {student && (
      <AcroFormDocumentDialog
        isOpen={acroDialogOpen}
        onClose={() => setAcroDialogOpen(false)}
        documentType={acroDialogDocType}
        student={{
          id: student.id,
          userId: student.userId,
          nume: student.nume,
          prenume: student.prenume,
          cnp: student.cnp,
          createdAt: student.createdAt,
          updatedAt: student.updatedAt,
        }}
        application={application ? {
          institutie: application.institutie,
          facultate: application.facultate,
          specializare: application.specializare,
          ciclu: application.ciclu,
          gen: application.gen,
          judet: application.judet,
          localitate: application.localitate,
          strada: application.strada,
          serieCI: application.serieCI,
          numarCI: application.numarCI,
          eliberatDe: application.eliberatDe,
          dataEliberarii: application.dataEliberarii,
          email: application.email,
          prenume: application.prenume,
          nume: application.nume,
          cnp: application.cnp,
        } : null}
        onAssigned={async () => {
          try {
            const res = await fetch(`/api/admin/students/${student.id}`, { cache: 'no-store' });
            if (res.ok) {
              const data = await res.json();
              setDocuments(data.documents);
            }
          } catch {
            // ignora erorile
          }

          // afiseaza toast
          showAssignedToast();
        }}
      />
      )}

      <SabloaneDeclaratiiDialog 
        isOpen={sabloaneDeclaratiiDialogOpen}
        onClose={() => setSabloaneDeclaratiiDialogOpen(false)}
      />

    </div>
  );
}
