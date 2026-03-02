// src/app/edu/documentele-mele/documenteleMeleComponent.tsx
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
  const [extrasCont, setExtrasCont] = useState<ApiDoc | null>(null);
  const [conventieSemnata, setConventieSemnata] = useState<ApiDoc | null>(null);
  const [acordPrelucrareSemnat, setAcordPrelucrareSemnat] = useState<ApiDoc | null>(null);

  const [declEvitareSigned, setDeclEvitareSigned] = useState<ApiDoc | null>(null);
  const [declEligibilitateSigned, setDeclEligibilitateSigned] = useState<ApiDoc | null>(null);
  const [finalCert, setFinalCert] = useState<ApiDoc | null>(null);

  const [declEvitareTemplate, setDeclEvitareTemplate] = useState<TemplateDoc | null>(null);
  const [declEligibilitateTemplate, setDeclEligibilitateTemplate] = useState<TemplateDoc | null>(null);

  const [conventieTemplate, setConventieTemplate] = useState<TemplateDoc | null>(null);
  const [acordPrelucrareTemplate, setAcordPrelucrareTemplate] = useState<TemplateDoc | null>(null);

  const [uploading, setUploading] = useState<
    | 'student'
    | 'extrasCont'
    | 'conventieSemnata'
    | 'acordPrelucrareSemnat'
    | 'declEvitare'
    | 'declEligibilitate'
    | null
  >(null);

  const inputStudentRef = useRef<HTMLInputElement>(null);
  const inputExtrasContRef = useRef<HTMLInputElement>(null);
  const inputConventieRef = useRef<HTMLInputElement>(null);
  const inputAcordRef = useRef<HTMLInputElement>(null);
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
        } else {
          setStudentCert(null);
        }

        if (data.extrasCont) {
          setExtrasCont({
            id: data.extrasCont.id,
            name: data.extrasCont.name,
            url: data.extrasCont.url,
            uploadedAt: data.extrasCont.uploadedAt,
            sizeBytes: data.extrasCont.sizeBytes,
            status: data.extrasCont.status,
            uploadedByRole: data.extrasCont.uploadedByRole,
          });
        } else {
          setExtrasCont(null);
        }

        if (data.conventieSemnata) {
          setConventieSemnata({
            id: data.conventieSemnata.id,
            name: data.conventieSemnata.name,
            url: data.conventieSemnata.url,
            uploadedAt: data.conventieSemnata.uploadedAt,
            sizeBytes: data.conventieSemnata.sizeBytes,
            status: data.conventieSemnata.status,
            uploadedByRole: data.conventieSemnata.uploadedByRole,
          });
        } else {
          setConventieSemnata(null);
        }

        if (data.acordPrelucrareDatePersonaleSemnat) {
          setAcordPrelucrareSemnat({
            id: data.acordPrelucrareDatePersonaleSemnat.id,
            name: data.acordPrelucrareDatePersonaleSemnat.name,
            url: data.acordPrelucrareDatePersonaleSemnat.url,
            uploadedAt: data.acordPrelucrareDatePersonaleSemnat.uploadedAt,
            sizeBytes: data.acordPrelucrareDatePersonaleSemnat.sizeBytes,
            status: data.acordPrelucrareDatePersonaleSemnat.status,
            uploadedByRole: data.acordPrelucrareDatePersonaleSemnat.uploadedByRole,
          });
        } else {
          setAcordPrelucrareSemnat(null);
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
        } else {
          setDeclEvitareSigned(null);
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
        } else {
          setDeclEligibilitateSigned(null);
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
        } else {
          setFinalCert(null);
        }

        if (data.declEvitareDublaFinantareTemplate) {
          setDeclEvitareTemplate({
            blobId: data.declEvitareDublaFinantareTemplate.blobId,
            name: data.declEvitareDublaFinantareTemplate.name,
            mimeType: data.declEvitareDublaFinantareTemplate.mimeType,
            sizeBytes: data.declEvitareDublaFinantareTemplate.sizeBytes,
            uploadedAt: data.declEvitareDublaFinantareTemplate.uploadedAt,
          });
        } else {
          setDeclEvitareTemplate(null);
        }

        if (data.declEligibilitateMembruTemplate) {
          setDeclEligibilitateTemplate({
            blobId: data.declEligibilitateMembruTemplate.blobId,
            name: data.declEligibilitateMembruTemplate.name,
            mimeType: data.declEligibilitateMembruTemplate.mimeType,
            sizeBytes: data.declEligibilitateMembruTemplate.sizeBytes,
            uploadedAt: data.declEligibilitateMembruTemplate.uploadedAt,
          });
        } else {
          setDeclEligibilitateTemplate(null);
        }

        if (data.conventieCadruTemplate) {
          setConventieTemplate({
            blobId: data.conventieCadruTemplate.blobId,
            name: data.conventieCadruTemplate.name,
            mimeType: data.conventieCadruTemplate.mimeType,
            sizeBytes: data.conventieCadruTemplate.sizeBytes,
            uploadedAt: data.conventieCadruTemplate.uploadedAt,
          });
        } else {
          setConventieTemplate(null);
        }

        if (data.acordPrelucrareDatePersonaleTemplate) {
          setAcordPrelucrareTemplate({
            blobId: data.acordPrelucrareDatePersonaleTemplate.blobId,
            name: data.acordPrelucrareDatePersonaleTemplate.name,
            mimeType: data.acordPrelucrareDatePersonaleTemplate.mimeType,
            sizeBytes: data.acordPrelucrareDatePersonaleTemplate.sizeBytes,
            uploadedAt: data.acordPrelucrareDatePersonaleTemplate.uploadedAt,
          });
        } else {
          setAcordPrelucrareTemplate(null);
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
    section:
      | 'student'
      | 'extrasCont'
      | 'conventieSemnata'
      | 'acordPrelucrareSemnat'
      | 'declEvitare'
      | 'declEligibilitate',
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
          : section === 'extrasCont'
          ? 'extras_cont'
          : section === 'conventieSemnata'
          ? 'conventie_semnata'
          : section === 'acordPrelucrareSemnat'
          ? 'acord_prelucrare_date_personale_semnat'
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
        status: data.status,
        uploadedByRole: data.uploadedByRole,
      };

      if (section === 'student') setStudentCert(doc);
      if (section === 'extrasCont') setExtrasCont(doc);
      if (section === 'conventieSemnata') setConventieSemnata(doc);
      if (section === 'acordPrelucrareSemnat') setAcordPrelucrareSemnat(doc);
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
      extrasCont?.uploadedAt,
      conventieSemnata?.uploadedAt,
      acordPrelucrareSemnat?.uploadedAt,
      declEvitareSigned?.uploadedAt,
      declEligibilitateSigned?.uploadedAt,
      finalCert?.uploadedAt,
      declEvitareTemplate?.uploadedAt,
      declEligibilitateTemplate?.uploadedAt,
      conventieTemplate?.uploadedAt,
      acordPrelucrareTemplate?.uploadedAt,
    ].filter(Boolean) as string[];

    if (!dates.length) return null;
    dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    return dates[0];
  }, [
    studentCert,
    extrasCont,
    conventieSemnata,
    acordPrelucrareSemnat,
    declEvitareSigned,
    declEligibilitateSigned,
    finalCert,
    declEvitareTemplate,
    declEligibilitateTemplate,
    conventieTemplate,
    acordPrelucrareTemplate,
  ]);

  const summaryItems = useMemo(
    () => [
      { key: 'adeverinta_student', label: 'Adeverinta student', ok: !!studentCert },
      { key: 'extras_cont', label: 'Extras cont', ok: !!extrasCont },
      { key: 'conventie_semnata', label: 'Conventie semnata', ok: !!conventieSemnata },
      { key: 'acord_semnat', label: 'Acord prelucrare date personale semnat', ok: !!acordPrelucrareSemnat },
      { key: 'decl_evitare', label: 'Declaratie evitare dubla finantare semnata', ok: !!declEvitareSigned },
      { key: 'decl_elig', label: 'Declaratie eligibilitate membru semnata', ok: !!declEligibilitateSigned },
      { key: 'finalizare', label: 'Adeverinta finalizare stagiu', ok: !!finalCert },
    ],
    [
      studentCert,
      extrasCont,
      conventieSemnata,
      acordPrelucrareSemnat,
      declEvitareSigned,
      declEligibilitateSigned,
      finalCert,
    ],
  );

  const docsOk = summaryItems.filter((x) => x.ok).length;
  const docsTotal = summaryItems.length;
  const docsMissing = summaryItems.filter((x) => !x.ok).map((x) => x.label);
  const docsPct = docsTotal ? Math.round((docsOk / docsTotal) * 100) : 0;

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

      {!loading && (
        <div className="panel">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">
                Documente disponibile: {docsOk} / {docsTotal}
              </div>

              {docsMissing.length ? (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Lipsesc: {docsMissing.join(', ')}
                </div>
              ) : (
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Toate documentele sunt incarcate.
                </div>
              )}
            </div>

            <div className="shrink-0 text-right">
              <div className="text-sm font-semibold">{docsPct}%</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">complet</div>
            </div>
          </div>

          <div className="mt-3 h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${docsPct}%` }} />
          </div>
        </div>
      )}

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
              <PanelHeader icon={<IconBook />} title="Adeverinta de student" subtitle="Document emis de facultate." />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {studentCert ? (
                <div
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium truncate"
                  title={studentCert.name}
                >
                  {studentCert.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista un fisier incarcat.</div>
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

          {/* 2. Extras de cont */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {extrasCont ? (
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
              <PanelHeader icon={<IconBook />} title="Extras de cont" subtitle="Incarca extrasul de cont (IBAN vizibil)." />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {extrasCont ? (
                <div
                  className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm font-medium truncate"
                  title={extrasCont.name}
                >
                  {extrasCont.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista un fisier incarcat.</div>
              )}

              <div className="flex justify-end">
                <button
                  className="btn btn-primary gap-1"
                  onClick={() => inputExtrasContRef.current?.click()}
                  disabled={uploading === 'extrasCont'}
                >
                  <IconUpload className="h-4 w-4" />
                  {uploading === 'extrasCont' ? 'Se incarca...' : 'Incarca extras'}
                </button>

                <input
                  ref={inputExtrasContRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('extrasCont', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 3. Conventie cadru */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {conventieSemnata ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Conventie semnata incarcata"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Conventie semnata lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconEdit />}
                title="Conventie cadru"
                subtitle="Descarca modelul si incarca varianta semnata."
              />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {conventieSemnata ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  Conventie semnata incarcata: {conventieSemnata.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista conventie semnata incarcata.</div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    conventieTemplate
                      ? window.open(buildTemplateUrl(conventieTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!conventieTemplate}
                  title="Vezi model"
                >
                  <IconEye className="h-3 w-3" /> Vezi model
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    conventieTemplate
                      ? window.open(`${buildTemplateUrl(conventieTemplate.blobId)}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!conventieTemplate}
                  title="Descarca model"
                >
                  <IconDownload className="h-3 w-3" /> Descarca model
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputConventieRef.current?.click()}
                  disabled={uploading === 'conventieSemnata'}
                  title="Incarca conventia semnata"
                >
                  <IconUpload className="h-3 w-3" />
                  {uploading === 'conventieSemnata' ? 'Se incarca...' : 'Incarca conventia semnata'}
                </button>

                <input
                  ref={inputConventieRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('conventieSemnata', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4. Acord prelucrare date personale */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {acordPrelucrareSemnat ? (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success"
                  title="Acord semnat incarcat"
                >
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span
                  className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning"
                  title="Acord semnat lipsa"
                >
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader
                icon={<IconEdit />}
                title="Acord prelucrare date personale"
                subtitle="Descarca modelul si incarca varianta semnata."
              />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {acordPrelucrareSemnat ? (
                <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
                  Acord semnat incarcat: {acordPrelucrareSemnat.name}
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista acord semnat incarcat.</div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    acordPrelucrareTemplate
                      ? window.open(buildTemplateUrl(acordPrelucrareTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!acordPrelucrareTemplate}
                  title="Vezi model"
                >
                  <IconEye className="h-3 w-3" /> Vezi model
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    acordPrelucrareTemplate
                      ? window.open(`${buildTemplateUrl(acordPrelucrareTemplate.blobId)}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!acordPrelucrareTemplate}
                  title="Descarca model"
                >
                  <IconDownload className="h-3 w-3" /> Descarca model
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputAcordRef.current?.click()}
                  disabled={uploading === 'acordPrelucrareSemnat'}
                  title="Incarca acordul semnat"
                >
                  <IconUpload className="h-3 w-3" />
                  {uploading === 'acordPrelucrareSemnat' ? 'Se incarca...' : 'Incarca acord semnat'}
                </button>

                <input
                  ref={inputAcordRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    await handleUpload('acordPrelucrareSemnat', file || null);
                    e.currentTarget.value = '';
                  }}
                />
              </div>
            </div>
          </div>

          {/* 5. Declaratie evitare dubla finantare */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {declEvitareSigned ? (
                <span className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success">
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning">
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
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista declaratie semnata incarcata.</div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEvitareTemplate
                      ? window.open(buildTemplateUrl(declEvitareTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEvitareTemplate}
                >
                  <IconEye className="h-3 w-3" /> Vezi model
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEvitareTemplate
                      ? window.open(`${buildTemplateUrl(declEvitareTemplate.blobId)}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEvitareTemplate}
                >
                  <IconDownload className="h-3 w-3" /> Descarca model
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputDeclEvitareRef.current?.click()}
                  disabled={uploading === 'declEvitare'}
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

          {/* 6. Declaratie eligibilitate membru */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {declEligibilitateSigned ? (
                <span className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success">
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning">
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
                <div className="text-xs text-slate-500 dark:text-slate-400">Nu exista declaratie semnata incarcata.</div>
              )}

              <div className="flex flex-wrap gap-3 justify-end items-center">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEligibilitateTemplate
                      ? window.open(buildTemplateUrl(declEligibilitateTemplate.blobId), '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEligibilitateTemplate}
                >
                  <IconEye className="h-3 w-3" /> Vezi model
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() =>
                    declEligibilitateTemplate
                      ? window.open(`${buildTemplateUrl(declEligibilitateTemplate.blobId)}?download=1`, '_blank', 'noreferrer')
                      : undefined
                  }
                  disabled={!declEligibilitateTemplate}
                >
                  <IconDownload className="h-3 w-3" /> Descarca model
                </button>

                <span className="h-5 w-px bg-slate-200 dark:bg-slate-700" aria-hidden />

                <button
                  className="btn btn-xs btn-primary gap-1"
                  onClick={() => inputDeclEligibilitateRef.current?.click()}
                  disabled={uploading === 'declEligibilitate'}
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

          {/* 7. Adeverinta finalizare stagiu */}
          <div className="panel w-full relative">
            <div className="absolute right-4 top-4">
              {finalCert ? (
                <span className="inline-flex items-center justify-center rounded-full bg-success/10 p-1.5 text-success">
                  <IconCircleCheck className="h-4 w-4" />
                </span>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full bg-warning/10 p-1.5 text-warning">
                  <IconInfoCircle className="h-4 w-4" />
                </span>
              )}
            </div>

            <div className="panel-heading">
              <PanelHeader icon={<IconAward />} title="Adeverinta de finalizare a stagiului" subtitle="Disponibila dupa validare." />
            </div>

            <div className="panel-body flex flex-col gap-5 pt-2 md:pt-4">
              {finalCert ? (
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-sm font-medium">{finalCert.name}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{formatDate(finalCert.uploadedAt)}</div>
                </div>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Nu exista o adeverinta de finalizare disponibila.
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  className="btn btn-xs btn-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => (finalCert ? window.open(finalCert.url, '_blank', 'noreferrer') : undefined)}
                  disabled={!finalCert}
                >
                  <IconEye className="h-3 w-3" /> Vezi
                </button>

                <button
                  className="btn btn-xs btn-outline-primary gap-1 disabled:opacity-50 disabled:pointer-events-none"
                  onClick={() => (finalCert ? window.open(`${finalCert.url}?download=1`, '_blank', 'noreferrer') : undefined)}
                  disabled={!finalCert}
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