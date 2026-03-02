// src/components/custom/studentDetaliiComponent.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
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
import IconMenuTodo from '@faComponents/icon/menu/icon-menu-todo';
import IconBook from '@/components/icon/icon-book';
import IconEdit from '@/components/icon/icon-edit';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

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
    dataEliberarii: string;
    institutie: string;
    facultate: string;
    specializare: string;
    ciclu: string;
    status: string;
    createdAt: string;
    copieBuletin: { blobId: string; downloadUrl: string; filename: string | null } | null;
  };
  series: { id: string; name: string | null } | null;
  tutor: { id: string; name: string; email: string; label: string } | null;
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
  applicationDocuments: Array<{
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
  homework: Array<{
    id: string;
    blobId: string;
    filename: string;
    mimeType: string;
    byteSize: number;
    uploadedAt: string;
    viewUrl: string;
    downloadUrl: string;
  }>;
};

type TabKey = 'personal' | 'documents' | 'homework';

type SerieOption = { id: string; name: string };
type TutorOption = { id: string; name: string };

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

function shortFilename(filename?: string | null, maxBase = 18) {
  if (!filename) return { short: 'fisier', extension: '' };

  const parts = filename.split('.');
  if (parts.length === 1) return { short: filename, extension: '' };

  const ext = parts.pop() || '';
  const base = parts.join('.');
  const shortBase = base.length > maxBase ? base.slice(0, maxBase - 3).trimEnd() + '...' : base;
  return { short: shortBase, extension: ext ? `.${ext}` : '' };
}

function renderBlobFile(viewUrl: string | null, downloadUrl: string | null, filename?: string | null) {
  if (!viewUrl || !downloadUrl) {
    return <span className="text-sm text-gray-500">Nu exista fisier incarcat.</span>;
  }

  const { short, extension } = shortFilename(filename);

  return (
    <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
      <span className="font-medium truncate max-w-[180px]" title={filename || undefined}>
        {short}
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

export default function StudentDetaliiComponent({ baseFolder }: { baseFolder: 'admin' | 'tutore' }) {
  const { studentId } = useParams<{ studentId: string }>();

  const [tab, setTab] = useState<TabKey>('personal');

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [student, setStudent] = useState<FetchStudentResponse['student'] | null>(null);
  const [application, setApplication] = useState<FetchStudentResponse['application'] | null>(null);
  const [series, setSeries] = useState<FetchStudentResponse['series'] | null>(null);
  const [tutor, setTutor] = useState<FetchStudentResponse['tutor'] | null>(null);

  const [documents, setDocuments] = useState<FetchStudentResponse['documents']>([]);
  const [homework, setHomework] = useState<FetchStudentResponse['homework']>([]);

  const [status, setStatus] = useState<'activ' | 'inactiv' | 'absolvent' | string>('activ');
  const [actionError, setActionError] = useState<string | null>(null);

  const [acroDialogOpen, setAcroDialogOpen] = useState(false);
  const [acroDialogDocType, setAcroDialogDocType] = useState<
    'adeverinta_finalizare_stagiu' | 'adeverinta_student' | 'declaratie_student'
  >('adeverinta_finalizare_stagiu');

  const [sabloaneDeclaratiiDialogOpen, setSabloaneDeclaratiiDialogOpen] = useState(false);

  const [seriesOptions, setSeriesOptions] = useState<SerieOption[]>([]);
  const [tutorOptions, setTutorOptions] = useState<TutorOption[]>([]);
  const [seriesLoading, setSeriesLoading] = useState(true);
  const [tutorsLoading, setTutorsLoading] = useState(true);

  const [assignSerieOpen, setAssignSerieOpen] = useState(false);
  const [assignSerieId, setAssignSerieId] = useState<string>(''); // '' = fara serie
  const [assignSerieSaving, setAssignSerieSaving] = useState(false);

  const [assignTutorOpen, setAssignTutorOpen] = useState(false);
  const [assignTutorId, setAssignTutorId] = useState<string>(''); // '' = fara tutore
  const [assignTutorSaving, setAssignTutorSaving] = useState(false);

  const [applicationDocuments, setApplicationDocuments] =
  useState<FetchStudentResponse['applicationDocuments']>([]);

  const refetchStudent = async () => {
    const res = await fetch(`/api/admin/students/${studentId}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Nu am putut incarca datele studentului.');
    return (await res.json()) as FetchStudentResponse;
  };

  const homeworkLastUpload = useMemo(() => {
    if (!homework.length) return null;
    const dates = homework.map((h) => h.uploadedAt).filter(Boolean) as string[];
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0] ?? null;
  }, [homework]);


  const REQUIRED_APP_DOC_TYPES = [
    'adeverinta_student',
    'conventie_semnata',
    'extras_cont',
    'acord_prelucrare_date_personale_semnat',
  ] as const;

  const REQUIRED_STUDENT_DOC_TYPES = [
    'declaratie_evitare_dubla_finantare_semnata',
    'declaratie_eligibilitate_membru_semnata',
    'adeverinta_finalizare_stagiu',
  ] as const;

  const documentsCount =
    REQUIRED_APP_DOC_TYPES.reduce(
      (acc, t) => acc + (applicationDocuments.some((d) => d.type === t) ? 1 : 0),
      0
    ) +
    REQUIRED_STUDENT_DOC_TYPES.reduce(
      (acc, t) => acc + (documents.some((d) => d.type === t) ? 1 : 0),
      0
    );

  const homeworkCount = homework.length;

  const hasRequiredDocs = (() => {
    const appTypes = new Set(applicationDocuments.map((d) => d.type));
    const studentTypes = new Set(documents.map((d) => d.type));

    return (
      REQUIRED_APP_DOC_TYPES.every((t) => appTypes.has(t)) &&
      REQUIRED_STUDENT_DOC_TYPES.every((t) => studentTypes.has(t))
    );
  })();

  const canGraduate = student && status === 'activ' && !!student.userId && hasRequiredDocs;

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
        setTutor(data.tutor ?? null);
        setDocuments(data.documents ?? []);
        setApplicationDocuments(data.applicationDocuments ?? []);
        setHomework(data.homework ?? []);
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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch('/api/admin/series', { cache: 'no-store' });
        const data: any[] = await res.json();
        if (!mounted) return;
        setSeriesOptions(data.map((s) => ({ id: s.id, name: s.name })));
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setSeriesLoading(false);
      }
    })();

    (async () => {
      try {
        const res = await fetch('/api/admin/tutors', { cache: 'no-store' });
        const data: any[] = await res.json();
        if (!mounted) return;
        setTutorOptions(
          data.map((u) => ({
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

    return () => {
      mounted = false;
    };
  }, []);

  const openAssignSerie = () => {
    setAssignSerieId(series?.id ?? ''); // '' = fara serie
    setAssignSerieOpen(true);
  };

  const openAssignTutor = () => {
    setAssignTutorId(tutor?.id ?? ''); // '' = fara tutore
    setAssignTutorOpen(true);
  };

  const saveAssignSerie = async () => {
    if (!student) return;
    setActionError(null);
    setAssignSerieSaving(true);

    try {
      const res = await fetch('/api/admin/students/assign-series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: [student.id],
          seriesId: assignSerieId ? assignSerieId : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setActionError(err?.error?.message || 'Nu am putut asigna/deasigna seria.');
        return;
      }

      setAssignSerieOpen(false);

      const data = await refetchStudent();
      setStudent(data.student);
      setApplication(data.application);
      setSeries(data.series);
      setTutor(data.tutor ?? null);
      setDocuments(data.documents ?? []);
      setApplicationDocuments(data.applicationDocuments ?? []);
      setHomework(data.homework ?? []);
      setStatus(data.student.status);
    } catch (e: any) {
      console.error(e);
      setActionError(e?.message || 'Eroare la comunicarea cu serverul.');
    } finally {
      setAssignSerieSaving(false);
    }
  };

  const saveAssignTutor = async () => {
    if (!student) return;
    setActionError(null);
    setAssignTutorSaving(true);

    try {
      const res = await fetch('/api/admin/students/assign-tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentIds: [student.id],
          tutorUserId: assignTutorId ? assignTutorId : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        setActionError(err?.error?.message || 'Nu am putut asigna/deasigna tutorele.');
        return;
      }

      setAssignTutorOpen(false);

      const data = await refetchStudent();
      setStudent(data.student);
      setApplication(data.application);
      setSeries(data.series);
      setTutor(data.tutor ?? null);
      setDocuments(data.documents ?? []);
      setApplicationDocuments(data.applicationDocuments ?? []);
      setHomework(data.homework ?? []);
      setStatus(data.student.status);
    } catch (e: any) {
      console.error(e);
      setActionError(e?.message || 'Eroare la comunicarea cu serverul.');
    } finally {
      setAssignTutorSaving(false);
    }
  };

  if (!studentId) return notFound();
  if (!loading && !student) return notFound();

  const docAdeverintaStudent = applicationDocuments.find((d) => d.type === 'adeverinta_student');
  const docConventieSemnata = applicationDocuments.find((d) => d.type === 'conventie_semnata');
  const docExtrasCont = applicationDocuments.find((d) => d.type === 'extras_cont');
  const docAcordPrelucrareDatePersonaleSemnat = applicationDocuments.find(
    (d) => d.type === 'acord_prelucrare_date_personale_semnat',
  );
  const docDeclaratieEvitareDublaFinantareSemnata = documents.find(
    (d) => d.type === 'declaratie_evitare_dubla_finantare_semnata',
  );
  const docDeclaratieEligibilitateMembru = documents.find(
    (d) => d.type === 'declaratie_eligibilitate_membru_semnata',
  );
  const docAdeverintaFinalizare = documents.find((d) => d.type === 'adeverinta_finalizare_stagiu');

  const handleMarkGraduate = async () => {
    if (!student) return;
    setActionError(null);
    const prev = status;
    setStatus('absolvent');

    try {
      const res = await fetch(`/api/admin/students/${student.id}/graduate`, { method: 'POST' });
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
        popup: 'bg-primary text-white shadow-lg rounded-lg w-[480px] max-w-[480px] px-4 py-3',
        title: 'text-[13px] leading-snug font-medium text-left',
        closeButton: 'text-white text-xs hover:text-white/80 focus:outline-none',
        timerProgressBar: 'bg-white/60',
      },
    });
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
      return <span className="badge bg-warning/10 text-warning">Inactiv</span>;
    if (st === 'absolvent')
      return <span className="badge bg-info/10 text-info">Absolvent</span>;
    return <span className="badge bg-gray-100 text-gray-700 dark:bg-gray-700/40">{st}</span>;
  };

  const PersonalTab = () => (
    <div className="space-y-8">
      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Contact si identificare</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="E-mail" value={application?.email} />
          <Row label="Telefon" value={application?.telefon} />
          <Row label="Prenume" value={application?.prenume} />
          <Row label="Nume" value={application?.nume} />
          <Row label="Gen" value={application?.gen} />
          <Row label="Mediu resedinta" value={application?.mediuResedinta} />
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Date personale si adresa</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="CNP" value={application?.cnp} />
          <Row label="Judet" value={application?.judet} />
          <Row label="Localitate" value={application?.localitate} />
          <Row label="Strada" value={application?.strada} />
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Act de identitate (CI)</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="Serie" value={application?.serieCI} />
          <Row label="Numar" value={application?.numarCI} />
          <Row label="Eliberat de" value={application?.eliberatDe} />
          <Row label="Data eliberarii" value={application ? formatRoDate(application.dataEliberarii) : ''} />

          <div className="grid grid-cols-3 gap-3 py-2">
            <div className="text-gray-500 dark:text-gray-400">Copia buletin (din cerere)</div>
            <div className="col-span-2 flex flex-col gap-2">
              {renderBlobFile(
                application?.copieBuletin?.blobId ? `/api/admin/document-blobs/${application.copieBuletin.blobId}` : null,
                application?.copieBuletin?.blobId
                  ? `/api/admin/document-blobs/${application.copieBuletin.blobId}/download`
                  : null,
                application?.copieBuletin?.filename || undefined,
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Studiile</h2>
        <div className="divide-y divide-white-light/70 dark:divide-[#1b2e4b]">
          <Row label="Institutie" value={application?.institutie} />
          <Row label="Facultate" value={application?.facultate} />
          <Row label="Specializare" value={application?.specializare} />
          <Row label="Anul" value={application?.ciclu} />
        </div>
      </div>
    </div>
  );

  const DocumentsTab = () => (
    <div className="space-y-8">
      <div className="panel p-4">
        <h2 className="mb-1 text-lg font-semibold">Documente incarcate</h2>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Adeverinta student</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docAdeverintaStudent?.viewUrl || null,
              docAdeverintaStudent?.downloadUrl || null,
              docAdeverintaStudent?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Conventie semnata</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docConventieSemnata?.viewUrl || null,
              docConventieSemnata?.downloadUrl || null,
              docConventieSemnata?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Extras de cont</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docExtrasCont?.viewUrl || null,
              docExtrasCont?.downloadUrl || null,
              docExtrasCont?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Acord prelucrare date personale (GDPR)</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docAcordPrelucrareDatePersonaleSemnat?.viewUrl || null,
              docAcordPrelucrareDatePersonaleSemnat?.downloadUrl || null,
              docAcordPrelucrareDatePersonaleSemnat?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Declaratie eligibilitate membru</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docDeclaratieEligibilitateMembru?.viewUrl || null,
              docDeclaratieEligibilitateMembru?.downloadUrl || null,
              docDeclaratieEligibilitateMembru?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Declaratie evitare dubla finantare</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docDeclaratieEvitareDublaFinantareSemnata?.viewUrl || null,
              docDeclaratieEvitareDublaFinantareSemnata?.downloadUrl || null,
              docDeclaratieEvitareDublaFinantareSemnata?.filename,
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 py-2">
          <div className="text-gray-500 dark:text-gray-400">Adeverinta finalizare</div>
          <div className="col-span-2 flex flex-col gap-2">
            {renderBlobFile(
              docAdeverintaFinalizare?.viewUrl || null,
              docAdeverintaFinalizare?.downloadUrl || null,
              docAdeverintaFinalizare?.filename,
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const HomeworkTab = () => (
    <div className="space-y-8">
      <div className="panel p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-semibold">Teme incarcate</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {homeworkLastUpload ? `Ultima incarcare: ${formatRoDateTime(homeworkLastUpload)}` : '-'}
            </p>
          </div>
          <span className="badge bg-primary/10 text-primary">{homeworkCount}</span>
        </div>

        <div className="mt-4 space-y-2">
          {homework.length === 0 ? (
            <div className="text-sm text-gray-500">Nu exista fisiere incarcate.</div>
          ) : (
            homework.map((h) => (
              <div key={h.id}>
                {renderBlobFile(h.viewUrl, h.downloadUrl, h.filename)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-2.5 xl:flex-row">
      <div className="panel flex-1 px-0 py-6 ltr:xl:mr-6 rtl:xl:ml-6">
        <div className="px-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">{application ? `${application.prenume} ${application.nume}` : '—'}</h1>
            {student?.studentNo && (
              <p className="text-xs text-gray-500 dark:text-gray-400">#Student {student.studentNo}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {series && series.name ? (
              <span className="badge bg-primary/10 text-primary">{series.name}</span>
            ) : null}

            {tutor && tutor.label ? (
              <span className="badge bg-success/10 text-success">{tutor.label}</span>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">— fara tutore —</span>
            )}
          </div>
        </div>

        <hr className="my-6 border-white-light dark:border-[#1b2e4b]" />

        {loading ? (
          <div className="px-4 py-8 text-sm text-gray-500">Se incarca…</div>
        ) : fetchError ? (
          <div className="mx-4 mb-4 flex items-center rounded bg-danger-light p-3.5 text-danger dark:bg-danger-dark-light">
            <span className="pr-2">
              <strong className="mr-1">Eroare:</strong> {fetchError}
            </span>
            <button type="button" className="ml-auto hover:opacity-80" onClick={() => setFetchError(null)}>
              <IconX className="h-4 w-4" />
            </button>
          </div>
        ) : (
          application && (
            <div className="px-4">
              <div>
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

                  <li className="inline-block">
                    <button
                      type="button"
                      onClick={() => setTab('homework')}
                      className={`group flex gap-2 border-b border-transparent p-4 hover:border-primary hover:text-primary ${
                        tab === 'homework' ? '!border-primary text-primary' : ''
                      }`}
                    >
                      <IconMenuTodo className="h-4 w-4 shrink-0 group-hover:!text-primary" />
                      Teme
                      <span className="flex h-5 min-w-[22px] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-medium text-primary">
                        {homeworkCount}
                      </span>
                    </button>
                  </li>
                </ul>
              </div>

              <div className="space-y-8">
                {tab === 'personal' ? <PersonalTab /> : null}
                {tab === 'documents' ? <DocumentsTab /> : null}
                {tab === 'homework' ? <HomeworkTab /> : null}

                {actionError && (
                  <div className="rounded border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
                    {actionError}
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div className="mt-6 w-full xl:mt-0 xl:w-96">
        <div className="panel mb-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-base font-semibold">Status student</h3>
            {renderStatusBadge(status)}
          </div>

        {student && (
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300">
            <div className="space-y-2">

              <div className="flex items-center gap-3">
                  <span className="shrink-0 text-gray-600 dark:text-gray-300">
                    Serie
                  </span>

                  <div className="flex-1 min-w-0 text-right pr-2">
                    {series?.name ? (
                      <span
                        className="block font-medium truncate"
                        title={series.name ?? undefined}
                      >
                        {series.name}
                      </span>
                    ) : (
                      <span className="block text-xs text-gray-400 italic">
                        Fara serie
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-90"
                    onClick={openAssignSerie}
                    disabled={loading || !student || seriesLoading}
                    title="Editeaza seria"
                  >
                    <IconEdit className="h-4 w-4" />
                  </button>
              </div>


              <div className="flex items-center gap-3">
                <span className="shrink-0 text-gray-600 dark:text-gray-300">
                  Tutore
                </span>

                <div className="flex-1 min-w-0 text-right pr-2">
                  {tutor?.label ? (
                    <span
                      className="block font-medium truncate"
                      title={tutor.label}
                    >
                      {tutor.label}
                    </span>
                  ) : (
                    <span className="block text-xs text-gray-400 italic">
                      Fara tutore
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 opacity-90"
                  onClick={openAssignTutor}
                  disabled={loading || !student || tutorsLoading}
                  title="Editeaza tutorele"
                >
                  <IconEdit className="h-4 w-4" />
                </button>
              </div>

              <div className="flex justify-between gap-3">
                <span>Creat la</span>
                <span className="font-medium">{formatRoDateTime(student.createdAt)}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700" />

            <div className="space-y-2">
              <div>
                <span className="block">Cont asociat</span>
                {student.userId ? (
                  <div className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 break-all">
                    {student.userId}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">— niciun cont asociat —</span>
                )}
              </div>

              <div>
                <span className="block">ID student</span>
                <div className="mt-1 font-mono text-xs bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 break-all">
                  {student.id}
                </div>
              </div>
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
              <p className="text-xs text-gray-400">Verifica statusul studentului si documentele obligatorii.</p>
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
          application={
            application
              ? {
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
                }
              : null
          }
          onAssigned={async () => {
            try {
              const res = await fetch(`/api/admin/students/${student.id}`, { cache: 'no-store' });
              if (res.ok) {
                const data = await res.json();
                setDocuments(data.documents ?? []);
                setApplicationDocuments(data.applicationDocuments ?? []);
                setHomework(data.homework ?? []);
                setTutor(data.tutor ?? null);
              }
            } catch {
              // ignore
            }
            showAssignedToast();
          }}
        />
      )}

      <SabloaneDeclaratiiDialog isOpen={sabloaneDeclaratiiDialogOpen} onClose={() => setSabloaneDeclaratiiDialogOpen(false)} />

      <Transition appear show={assignSerieOpen} as={Fragment}>
        <Dialog as="div" open={assignSerieOpen} onClose={() => setAssignSerieOpen(false)}>
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
                    <h5 className="text-lg font-semibold">Asigneaza serie</h5>
                    <button type="button" className="text-white-dark hover:text-dark" onClick={() => setAssignSerieOpen(false)}>
                      <IconX />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <label className="text-sm">Alege seria</label>
                    <select
                      className="form-select w-full"
                      value={assignSerieId}
                      onChange={(e) => setAssignSerieId(e.target.value)}
                      disabled={seriesLoading || assignSerieSaving}
                    >
                      <option value="">Fara serie</option>
                      {seriesOptions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-6 flex justify-end gap-2">
                      <button className="btn btn-outline-secondary" onClick={() => setAssignSerieOpen(false)} disabled={assignSerieSaving}>
                        Anuleaza
                      </button>
                      <button className="btn btn-primary" onClick={saveAssignSerie} disabled={!student || assignSerieSaving}>
                        {assignSerieSaving ? 'Se salveaza…' : 'Salveaza'}
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={assignTutorOpen} as={Fragment}>
        <Dialog as="div" open={assignTutorOpen} onClose={() => setAssignTutorOpen(false)}>
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
                    <h5 className="text-lg font-semibold">Asigneaza tutore</h5>
                    <button
                      type="button"
                      className="text-white-dark hover:text-dark"
                      onClick={() => setAssignTutorOpen(false)}
                    >
                      <IconX />
                    </button>
                  </div>

                  <div className="p-5 space-y-3">
                    <label className="text-sm">Alege tutorele</label>
                    <select
                      className="form-select w-full"
                      value={assignTutorId}
                      onChange={(e) => setAssignTutorId(e.target.value)}
                      disabled={tutorsLoading || assignTutorSaving}
                    >
                      <option value="">Fara tutore</option>
                      {tutorOptions.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>

                    <div className="mt-6 flex justify-end gap-2">
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => setAssignTutorOpen(false)}
                        disabled={assignTutorSaving}
                      >
                        Anuleaza
                      </button>
                      <button
                        className="btn btn-success"
                        onClick={saveAssignTutor}
                        disabled={!student || assignTutorSaving}
                      >
                        {assignTutorSaving ? 'Se salveaza…' : 'Salveaza'}
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
