'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import IconBook from '@/components/icon/icon-book';
import IconEdit from '@/components/icon/icon-edit';
import IconAward from '@/components/icon/icon-award';
import IconArchive from '@/components/icon/icon-archive';
import IconCalendar from '@/components/icon/icon-calendar';
import IconEye from '@/components/icon/icon-eye';
import IconDownload from '@/components/icon/icon-download';
import IconUpload from '@/components/icon/icon-upload';
import IconCircleCheck from '@faComponents/icon/icon-circle-check';
import IconInfoCircle from '@faComponents/icon/icon-info-circle';

type ApiDoc = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
  sizeBytes: number;
  status?: string;
  uploadedByRole?: string;
};

type TemplateDoc = {
  blobId: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

const ACCEPTED_MIMES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE = 10 * 1024 * 1024;

function formatDate(dt: string | null | undefined) {
  if (!dt) return '-';
  try {
    const d = new Date(dt);
    return d.toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dt;
  }
}

function buildTemplateUrl(blobId: string) {
  return `/api/edu/template-blobs/${blobId}`;
}

export default function DocumenteleMeleComponent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [studentCert, setStudentCert] = useState<ApiDoc | null>(null);
  const [declEvitareSigned, setDeclEvitareSigned] = useState<ApiDoc | null>(null);
  const [declEligibilitateSigned, setDeclEligibilitateSigned] = useState<ApiDoc | null>(null);
  const [finalCert, setFinalCert] = useState<ApiDoc | null>(null);

  const [declEvitareTemplate, setDeclEvitareTemplate] = useState<TemplateDoc | null>(null);
  const [declEligibilitateTemplate, setDeclEligibilitateTemplate] = useState<TemplateDoc | null>(null);

  const [uploading, setUploading] = useState<'student' | 'declEvitare' | 'declEligibilitate' | null>(null);

  const inputStudentRef = useRef<HTMLInputElement>(null);
  const inputDeclEvitareRef = useRef<HTMLInputElement>(null);
  const inputDeclEligibilitateRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/edu/my-documents', { cache: 'no-store' });
        if (!res.ok) throw new Error('Nu s-au putut incarca documentele.');
        const data = await res.json();

        if (data.adeverintaStudent) {
          setStudentCert({
            id: data.adeverintaStudent.id,
            name: data.adeverintaStudent.name,
            url: data.adeverintaStudent.url,
            uploadedAt: data.adeverintaStudent.uploadedAt,
            sizeBytes: data.adeverintaStudent.sizeBytes,
            status: data.adeverintaStudent.status,
            uploadedByRole: data.adeverintaStudent.uploadedByRole,
          });
        }

        if (data.declEvitareDublaFinantareSemnata) {
          setDeclEvitareSigned({
            id: data.declEvitareDublaFinantareSemnata.id,
            name: data.declEvitareDublaFinantareSemnata.name,
            url: data.declEvitareDublaFinantareSemnata.url,
            uploadedAt: data.declEvitareDublaFinantareSemnata.uploadedAt,
            sizeBytes: data.declEvitareDublaFinantareSemnata.sizeBytes,
            status: data.declEvitareDublaFinantareSemnata.status,
            uploadedByRole: data.declEvitareDublaFinantareSemnata.uploadedByRole,
          });
        }

        if (data.declEligibilitateMembruSemnata) {
          setDeclEligibilitateSigned({
            id: data.declEligibilitateMembruSemnata.id,
            name: data.declEligibilitateMembruSemnata.name,
            url: data.declEligibilitateMembruSemnata.url,
            uploadedAt: data.declEligibilitateMembruSemnata.uploadedAt,
            sizeBytes: data.declEligibilitateMembruSemnata.sizeBytes,
            status: data.declEligibilitateMembruSemnata.status,
            uploadedByRole: data.declEligibilitateMembruSemnata.uploadedByRole,
          });
        }

        if (data.adeverintaFinalizareStagiu) {
          setFinalCert({
            id: data.adeverintaFinalizareStagiu.id,
            name: data.adeverintaFinalizareStagiu.name,
            url: data.adeverintaFinalizareStagiu.url,
            uploadedAt: data.adeverintaFinalizareStagiu.uploadedAt,
            sizeBytes: data.adeverintaFinalizareStagiu.sizeBytes,
            status: data.adeverintaFinalizareStagiu.status,
            uploadedByRole: data.adeverintaFinalizareStagiu.uploadedByRole,
          });
        }

        if (data.declEvitareDublaFinantareTemplate) {
          setDeclEvitareTemplate({
            blobId: data.declEvitareDublaFinantareTemplate.blobId,
            name: data.declEvitareDublaFinantareTemplate.name,
            mimeType: data.declEvitareDublaFinantareTemplate.mimeType,
            sizeBytes: data.declEvitareDublaFinantareTemplate.sizeBytes,
            uploadedAt: data.declEvitareDublaFinantareTemplate.uploadedAt,
          });
        }

        if (data.declEligibilitateMembruTemplate) {
          setDeclEligibilitateTemplate({
            blobId: data.declEligibilitateMembruTemplate.blobId,
            name: data.declEligibilitateMembruTemplate.name,
            mimeType: data.declEligibilitateMembruTemplate.mimeType,
            sizeBytes: data.declEligibilitateMembruTemplate.sizeBytes,
            uploadedAt: data.declEligibilitateMembruTemplate.uploadedAt,
          });
        }

        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Eroare la incarcare.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function PanelHeader({
    icon,
    title,
    subtitle,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }) {
    return (
      <div className="flex items-center gap-3">
        <div className="shrink-0 inline-flex items-center justify-center h-11 w-11 rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h2 className="text-base font-semibold leading-tight">{title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
    );
  }

  function validateFile(file?: File): string | null {
    if (!file) return 'Nu s-a selectat niciun fisier.';
    if (!ACCEPTED_MIMES.includes(file.type)) return 'Format neacceptat. Incarca PDF, PNG sau JPG.';
    if (file.size > MAX_SIZE) return 'Fisierul depaseste limita de 10MB.';
    return null;
  }

  async function handleUpload(
    section: 'student' | 'declEvitare' | 'declEligibilitate',
    file?: File | null,
  ) {
    setError(null);
    const problem = validateFile(file ?? undefined);
    if (problem) {
      setError(problem);
      return;
    }
    try {
      if (!file) return;
      setUploading(section);

      const fd = new FormData();
      fd.append('file', file);

      const documentType =
        section === 'student'
          ? 'adeverinta_student'
          : section === 'declEvitare'
          ? 'declaratie_evitare_dubla_finantare_semnata'
          : 'declaratie_eligibilitate_membru_semnata';

      fd.append('document_type', documentType);

      const res = await fetch('/api/edu/my-documents/upload', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Upload esuat.');
      }
      const data = await res.json();
      const doc: ApiDoc = {
        id: data.id,
        name: data.name,
        url: data.url,
        uploadedAt: data.uploadedAt,
        sizeBytes: data.sizeBytes,
      };

      if (section === 'student') setStudentCert(doc);
      if (section === 'declEvitare') setDeclEvitareSigned(doc);
      if (section === 'declEligibilitate') setDeclEligibilitateSigned(doc);
    } catch (e: any) {
      setError(e?.message || 'Incarcarea a esuat.');
    } finally {
      setUploading(null);
    }
  }

  const lastUpdate = useMemo(() => {
    const dates = [
      studentCert?.uploadedAt,
      declEvitareSigned?.uploadedAt,
      declEligibilitateSigned?.uploadedAt,
      finalCert?.uploadedAt,
      declEvitareTemplate?.uploadedAt,
      declEligibilitateTemplate?.uploadedAt,
    ].filter(Boolean) as string[];
    if (!dates.length) return null;
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0];
  }, [
    studentCert,
    declEvitareSigned,
    declEligibilitateSigned,
    finalCert,
    declEvitareTemplate,
    declEligibilitateTemplate,
  ]);

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <IconArchive className="text-primary" />
          <div>
            <h1 className="text-xl font-semibold leading-tight">Documentele mele</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Incarca, vezi si descarca documentele pentru stagiul tau.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <IconCalendar />
          <span>Ultima actualizare: {lastUpdate ? formatDate(lastUpdate) : '-'}</span>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <div className="flex items-start gap-2">
            <span className="font-semibold">Eroare:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-sm text-slate-500 dark:text-slate-400">Se incarca documentele...</div>
      ) : (
        <>
          {/* 1. Adeverinta de student */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {studentCert ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Document incarcat"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Document lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconBook />}
                title="Adeverinta de student"
                subtitle="Document emis de facultate."
              />
            </div>
            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {studentCert ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  {studentCert.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nu exista un fisier incarcat.
                </div>
              )}

              <div className="flex justify-end">
                <button
                  className="btn btn-primary gap-1"
                  onClick={() => inputStudentRef.current?.click()}
                  disabled={uploading === 'student'}
                >
                  <IconUpload className="h-4 w-4" />
                  {uploading === 'student' ? 'Se incarca...' : 'Incarca adeverinta'}
                </button>
                <input
                  ref={inputStudentRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('student', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2. Declaratie evitare dubla finantare */}
          <div className="panel w-full relative">
            {/* status pe baza declaratiei semnate */}
            <div className="absolute right-4 top-4">
              {declEvitareSigned ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Declaratie semnata incarcata"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Declaratie lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconEdit />}
                title="Declaratie pe propria raspundere cu privire la evitarea dublei finantari"
                subtitle="Vizualizeaza sau descarca declaratia. Poti incarca si varianta semnata."
              />
            </div>
            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {declEvitareSigned ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  Declaratie semnata incarcata: {declEvitareSigned.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nu exista declaratie semnata incarcata.
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                {/* actiuni pentru sablon (template) */}
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEvitareTemplate
                      ? window.open(buildTemplateUrl(declEvitareTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEvitareTemplate}
                  title="Vezi declaratia tip"
                >
                  <IconEye className="h-3 w-3" /> Vezi
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEvitareTemplate
                      ? window.open(`${buildTemplateUrl(declEvitareTemplate.blobId)}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEvitareTemplate}
                  title="Descarca declaratia tip"
                >
                  <IconDownload className="h-3 w-3" /> Descarca
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                {/* upload varianta semnata */}
                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputDeclEvitareRef.current?.click()}
                  disabled={uploading === 'declEvitare'}
                  title="Incarca declaratia semnata"
                >
                  <IconUpload className="h-3 w-3" />
                  {uploading === 'declEvitare' ? 'Se incarca...' : 'Incarca declaratia semnata'}
                </button>

                <input
                  ref={inputDeclEvitareRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('declEvitare', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. Declaratie eligibilitate membru */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {declEligibilitateSigned ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Declaratie semnata incarcata"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Declaratie lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconEdit />}
                title="Declaratie pe propria raspundere privind eligibilitatea membrilor grupului tinta"
                subtitle="Vizualizeaza sau descarca declaratia. Poti incarca si varianta semnata."
              />
            </div>
            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {declEligibilitateSigned ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  Declaratie semnata incarcata: {declEligibilitateSigned.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nu exista declaratie semnata incarcata.
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                {/* sablon declaratie eligibilitate */}
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEligibilitateTemplate
                      ? window.open(buildTemplateUrl(declEligibilitateTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEligibilitateTemplate}
                  title="Vezi declaratia tip"
                >
                  <IconEye className="h-3 w-3" /> Vezi
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEligibilitateTemplate
                      ? window.open(
                          `${buildTemplateUrl(declEligibilitateTemplate.blobId)}?download=1`,
                          '_blank',
                          'noreferrer',
                        )
                      : undefined
                  }
                  disabled={!declEligibilitateTemplate}
                  title="Descarca declaratia tip"
                >
                  <IconDownload className="h-3 w-3" /> Descarca
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                {/* upload varianta semnata */}
                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputDeclEligibilitateRef.current?.click()}
                  disabled={uploading === 'declEligibilitate'}
                  title="Incarca declaratia semnata"
                >
                  <IconUpload className="h-3 w-3" />
                  {uploading === 'declEligibilitate' ? 'Se incarca...' : 'Incarca declaratia semnata'}
                </button>

                <input
                  ref={inputDeclEligibilitateRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('declEligibilitate', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4. Adeverinta de finalizare a stagiului */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {finalCert ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Adeverinta disponibila"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Adeverinta lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconAward />}
                title="Adeverinta de finalizare a stagiului"
                subtitle="Disponibila dupa validare."
              />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {finalCert ? (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-medium">{finalCert.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(finalCert.uploadedAt)}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nu exista o adeverinta de finalizare disponibila.
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    finalCert ? window.open(finalCert.url, '_blank', 'noreferrer') : undefined
                  }
                  disabled={!finalCert}
                  title="Vezi adeverinta"
                >
                  <IconEye className="h-3 w-3" /> Vezi
                </button>
                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    finalCert
                      ? window.open(`${finalCert.url}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!finalCert}
                  title="Descarca adeverinta"
                >
                  <IconDownload className="h-3 w-3" /> Descarca
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}





//           <div className="text-[11px] text-slate-500 dark:text-slate-400">
          //   <p className="mb-1">Nota:</p>
          //   <ul className="list-disc pl-5 space-y-1">
          //     <li>Formate acceptate: PDF, PNG, JPG. Dimensiune maxima: 10MB.</li>
          //     <li>Documentele incarcate de tine pot fi sterse doar daca au fost incarcate de tine.</li>
          //     <li>Daca datele sunt gresite, actualizeaza-le in pagina Datele mele.</li>
          //   </ul>
          // </div>