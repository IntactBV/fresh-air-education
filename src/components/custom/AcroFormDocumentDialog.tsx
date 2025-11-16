'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconX from '@/components/icon/icon-x';
import IconEye from '@faComponents/icon/icon-eye';
import IconDownload from '@faComponents/icon/icon-download';
import IconChecks from '@/components/icon/icon-checks';

type DocumentType =
  | 'adeverinta_finalizare_stagiu'
  | 'adeverinta_student'
  | 'declaratie_student';

const getTemplateTypeForDocumentType = (docType: DocumentType) => {
  switch (docType) {
    case 'adeverinta_finalizare_stagiu':
      return 'template_acroform_adeverinta_finalizare';
    // case 'adeverinta_student':
    //   return 'template_acroform_adeverinta_student';
    // case 'declaratie_student':
    //   return 'template_acroform_declaratie_student';
    default:
      return 'template_acroform_adeverinta_finalizare';
  }
};

type StudentLite = {
  id: string;
  userId: string | null;
  nume: string;
  prenume: string;
  cnp: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApplicationLite = {
  institutie: string;
  facultate: string;
  specializare: string;
  ciclu: string;
  gen: string;
  judet: string;
  localitate: string;
  strada: string;
  serieCI: string;
  numarCI: string;
  eliberatDe: string;
  dataEliberarii: string;
  email: string;
  prenume: string;
  nume: string;
  cnp: string;
};

type TemplateInfo = {
  exists: boolean;
  blobId?: string;
  filename?: string;
  uploadedAt?: string;
};

type AcroField = {
  name: string;
  type: 'text' | 'date' | 'number' | 'textarea' | 'unknown';
  readOnly?: boolean;
  // optional default value provided by backend, if any
  defaultValue?: string;
};

type GeneratePreviewResponse = {
  blobId: string;
  viewUrl: string;
  downloadUrl: string;
  filename: string;
};

type PreviewState = {
  blob: Blob;
  url: string;
  filename: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;

  // what kind of doc we are preparing
  documentType: DocumentType;

  // student/application data for auto-fill
  student: StudentLite;
  application: ApplicationLite | null;

  // called after assigning the generated (or signed) doc to student
  onAssigned?: () => void;
};

export default function AcroFormDocumentDialog({
  isOpen,
  onClose,
  documentType,
  student,
  application,
  onAssigned,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [template, setTemplate] = useState<TemplateInfo | null>(null);
  const [fields, setFields] = useState<AcroField[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [signedUploadLoading, setSignedUploadLoading] = useState(false);
  const [signedFile, setSignedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const signedFileInputRef = useRef<HTMLInputElement | null>(null);

  // derive a friendly title per doc type
  const title = useMemo(() => {
    switch (documentType) {
      case 'adeverinta_finalizare_stagiu':
        return 'Adeverinta de finalizare';
      case 'adeverinta_student':
        return 'Adeverinta student';
      case 'declaratie_student':
        return 'Declaratie student';
      default:
        return 'Document AcroForm';
    }
  }, [documentType]);

  // initial auto-map suggestion
  const autoFillCandidate = useMemo(() => {
    const fullName = `${application?.prenume || student?.prenume || ''} ${application?.nume || student?.nume || ''}`.trim();
    const cnp = application?.cnp || student?.cnp || '';
    return {
      student_full_name: fullName,
      student_first_name: application?.prenume || student?.prenume || '',
      student_last_name: application?.nume || student?.nume || '',
      cnp,
      institutie: application?.institutie || '',
      facultate: application?.facultate || '',
      specializare: application?.specializare || '',
      ciclu: application?.ciclu || '',
      judet: application?.judet || '',
      localitate: application?.localitate || '',
      strada: application?.strada || '',
      email: application?.email || '',
      serieCI: application?.serieCI || '',
      numarCI: application?.numarCI || '',
      eliberatDe: application?.eliberatDe || '',
      dataEliberarii: application?.dataEliberarii || '',
    };
  }, [application, student]);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    (async () => {
      try {
        setError(null);
        setTemplateLoading(true);

        const templateType = getTemplateTypeForDocumentType(documentType);

        // GET template meta
        const tRes = await fetch(
          `/api/admin/acroform-templates?type=${encodeURIComponent(templateType)}`,
          { cache: 'no-store' }
        );
        if (!tRes.ok) throw new Error('Nu am putut verifica template-ul.');
        const tData = (await tRes.json()) as { template: TemplateInfo };
        if (!mounted) return;
        setTemplate(tData.template);

        // If template exists, fetch fields definition
        if (tData.template?.exists) {
          const fRes = await fetch(
            `/api/admin/acroform-templates/fields?type=${encodeURIComponent(templateType)}`,
            { cache: 'no-store' }
          );
          if (!fRes.ok) throw new Error('Nu am putut incarca campurile formularului.');
          const fData = (await fRes.json()) as {
            fields: AcroField[];
            initialValues?: Record<string, string>;
          };
          if (!mounted) return;

          setFields(fData.fields || []);

          const next: Record<string, string> = { ...(fData.initialValues || {}) };
          const todayIso = new Date().toISOString().slice(0, 10);

          for (const fld of fData.fields) {
            const name = fld.name;

            if (templateType === 'template_acroform_adeverinta_finalizare') {
              if (name === 'student_full_name' && !next[name]) {
                next[name] = autoFillCandidate.student_full_name;
              }
              if (name === 'universitate' && !next[name]) {
                next[name] = autoFillCandidate.institutie;
              }
              if (name === 'facultate' && !next[name]) {
                next[name] = autoFillCandidate.facultate;
              }
              if (name === 'specializare' && !next[name]) {
                next[name] = autoFillCandidate.specializare;
              }
              if (name === 'adeverinta_date' && !next[name]) {
                next[name] = todayIso;
              }

              // enhance: for other document types, extend mapping here with more fields from student and application
            }

            if (!next[name] && typeof fld.defaultValue === 'string' && fld.defaultValue.length > 0) {
              next[name] = fld.defaultValue;
            }
          }

          setValues(next);
        } else {
          setFields([]);
          setValues({});
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || 'Eroare neasteptata.');
      } finally {
        if (mounted) setTemplateLoading(false);
      }
    })();

    return () => {
      mounted = false;
      setPreview(null);
      setSignedFile(null);
    };
  }, [isOpen, documentType, autoFillCandidate]);

  const handleUploadTemplate = async (file: File) => {
    try {
      setError(null);
      setLoading(true);

      const formData = new FormData();
      formData.append('file', file);

      const templateType = getTemplateTypeForDocumentType(documentType);

      // upload template
      const res = await fetch(
        `/api/admin/acroform-templates?type=${encodeURIComponent(templateType)}`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!res.ok) throw new Error('Nu am putut salva template-ul.');
      const data = (await res.json()) as { template: TemplateInfo };
      setTemplate(data.template);

      // fetch fields for the uploaded template
      const fRes = await fetch(
        `/api/admin/acroform-templates/fields?type=${encodeURIComponent(templateType)}`,
        { cache: 'no-store' }
      );
      if (!fRes.ok) throw new Error('Nu am putut incarca campurile.');
      const fData = (await fRes.json()) as {
        fields: AcroField[];
        initialValues?: Record<string, string>;
      };

      setFields(fData.fields || []);
      setValues(fData.initialValues || {});
      setPreview(null);
    } catch (e: any) {
      setError(e?.message || 'Eroare la upload template.');
    } finally {
      setLoading(false);
    }
  };

  const areAllFieldsFilled = () => {
    if (!fields || fields.length === 0) return false;
    for (const f of fields) {
      const v = values[f.name];
      if (v === undefined || v === '') {
        return false;
      }
    }
    return true;
  };

  const handleGeneratePreview = async () => {
    try {
      setError(null);

      if (!areAllFieldsFilled()) {
        setError('Toate campurile sunt obligatorii.');
        return;
      }

      setLoading(true);

      const res = await fetch(
        `/api/admin/acroform-templates/generate-preview?type=${documentType}&studentId=${student.id}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fields: values }),
        }
      );

      if (!res.ok) {
        let message = 'Nu s-a putut genera PDF-ul.';
        try {
          const err = await res.json();
          if (err?.error) message = err.error;
        } catch {
          // ignore
        }
        throw new Error(message);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename = `${documentType}_preview_${student.id}.pdf`;

      setPreview((prev) => {
        if (prev?.url) {
          URL.revokeObjectURL(prev.url);
        }
        return { blob, url, filename };
      });
    } catch (e: any) {
      setError(e?.message || 'Eroare la generarea PDF-ului.');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignToStudent = async () => {
    if (!preview && !signedFile) {
      setError('Genereaza un PDF sau incarca varianta semnata.');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      let res: Response;

      if (signedFile) {
        // varianta semnata – trimitem fisierul direct la /assign
        const formData = new FormData();
        formData.append('source', 'signed');
        formData.append('studentId', student.id);
        formData.append('documentType', documentType);
        formData.append('file', signedFile);

        res = await fetch(`/api/admin/acroform-templates/assign`, {
          method: 'POST',
          body: formData,
        });
      } else {
        // varianta generata – comportament identic cu ce aveai
        const body: any = {
          studentId: student.id,
          documentType,
          source: 'generated',
          fields: values,
        };

        res = await fetch(`/api/admin/acroform-templates/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
      }

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Nu s-a putut asigna documentul.');
      }

      if (onAssigned) onAssigned();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Eroare la asignare document.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSigned = async (file: File) => {
    try {
      setError(null);
      setSignedUploadLoading(true);
      // nu mai trimitem nimic la backend aici, doar tinem fisierul in memorie
      setSignedFile(file);
    } catch (e: any) {
      setError(e?.message || 'Eroare la upload varianta semnata.');
    } finally {
      setSignedUploadLoading(false);
    }
  };

  const disabledAll = loading || templateLoading;
  const templateViewUrl = template?.blobId
    ? `/api/admin/document-blobs/${template.blobId}`
    : null;

  const assignLabel = signedFile
    ? 'Asigneaza studentului (varianta semnata)'
    : 'Asigneaza studentului (varianta nesemnata)';


  return (
    <div className={`${isOpen ? 'fixed' : 'hidden'} inset-0 z-50 flex items-center justify-center px-3`}>
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => (!disabledAll ? onClose() : null)}
      />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-lg border-0 text-black shadow-xl dark:text-white-dark bg-white dark:bg-[#0e1726] flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between bg-[#fbfbfb] px-6 py-6 dark:bg-[#121c2c] border-b border-white-light dark:border-[#1b2e4b]">
          <h5 className="text-base font-semibold">
            {title} — generare document pentru student: {student.prenume} {student.nume}
          </h5>
          <button
            type="button"
            className="text-white-dark hover:text-dark"
            onClick={() => (!disabledAll ? onClose() : null)}
            title="Inchide"
          >
            <IconX />
          </button>
        </div>

        {/* eroare globala (server / assign / preview) */}
        {error && (
          <div className="mx-6 mt-3 rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* body scrollabil */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Template section */}
          <div className="panel p-4">
            <h3 className="text-base font-semibold mb-2">Sablon adeverinta</h3>

            {templateLoading ? (
              <div className="text-sm text-gray-500">Se incarca template-ul…</div>
            ) : template?.exists ? (
              <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                <div className="space-y-0.5">
                  <div className="font-medium">{template.filename}</div>
                  {template.blobId && (
                    <div className="text-xs text-gray-500">
                      Blob ID: <span className="font-mono">{template.blobId}</span>
                    </div>
                  )}
                  {template.uploadedAt && (
                    <div className="text-[11px] text-gray-400">
                      Ultima actualizare: {new Date(template.uploadedAt).toLocaleString('ro-RO')}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {template.blobId && (
                    <Tippy content="Vezi template PDF">
                      <a
                        href={`/api/admin/document-blobs/${template.blobId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-primary gap-1"
                      >
                        <IconEye className="h-3 w-3" /> Vezi
                      </a>
                    </Tippy>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadTemplate(f);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-xs"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabledAll}
                    title="Incarca alt template (suprascrie)"
                  >
                    Inlocuieste template
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-dashed border-white-light p-4 text-sm dark:border-[#1b2e4b]">
                <p className="mb-3">
                  Nu exista template incarcat pentru acest tip de document. Incarca un PDF AcroForm care contine campurile necesare.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadTemplate(f);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                />
              </div>
            )}
          </div>

          {/* Fields editor */}
          <div className="panel p-4">
            <h3 className="text-base font-semibold mb-2">Completeaza toate campurile</h3>
            {!template?.exists ? (
              <p className="text-sm text-gray-500">Incarca mai intai un sablon de tipul AcroForm PDF.</p>
            ) : fields.length === 0 ? (
              <p className="text-sm text-gray-500">Nu s-au gasit campuri in acest template.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {fields.map((f) => {
                    const v = values[f.name] ?? '';
                    const common = {
                      id: `fld_${f.name}`,
                      disabled: disabledAll || f.readOnly || !!signedFile,
                      value: v,
                      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                        setValues((prev) => ({ ...prev, [f.name]: e.target.value })),
                    };
                    return (
                      <div key={f.name} className="flex flex-col gap-1">
                        <label htmlFor={`fld_${f.name}`} className="text-xs text-gray-600 dark:text-gray-300">
                          {f.name} {f.readOnly ? '(read-only)' : ''}
                        </label>

                        {f.type === 'textarea' ? (
                          <textarea
                            {...(common as any)}
                            className="form-textarea text-sm"
                            rows={3}
                            placeholder={f.name}
                            required
                          />
                        ) : f.type === 'date' ? (
                          <input
                            {...(common as any)}
                            type="date"
                            className="form-input text-sm"
                            placeholder={f.name}
                            required
                          />
                        ) : (
                          <input
                            {...(common as any)}
                            type={f.type === 'number' ? 'number' : 'text'}
                            className="form-input text-sm"
                            placeholder={f.name}
                            required
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-500">
                    Toate campurile sunt obligatorii.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleGeneratePreview}
                      disabled={disabledAll || !template?.exists || fields.length === 0}
                      title="Genereaza un PDF de previzualizare"
                    >
                      Genereaza preview
                    </button>

                    {preview && (
                      <>
                        <Tippy content="Vezi PDF">
                          <a
                            href={preview.url}
                            className="btn btn-outline-primary btn-xs gap-1"
                            target="_blank"
                            rel="noreferrer"
                          >
                            <IconEye className="h-3 w-3" /> Vezi
                          </a>
                        </Tippy>
                        <Tippy content="Descarca PDF">
                          <a
                            href={preview.url}
                            download={preview.filename}
                            className="btn btn-outline-secondary btn-xs gap-1"
                          >
                            <IconDownload className="h-3 w-3" /> Descarca
                          </a>
                        </Tippy>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Signed variant upload */}
          <div className="panel p-4">
            <h3 className="text-base font-semibold mb-2">(Optional) incarca varianta semnata</h3>

            <input
              ref={signedFileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  void handleUploadSigned(f);
                }
                if (signedFileInputRef.current) {
                  signedFileInputRef.current.value = '';
                }
              }}
            />

            <div className="rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b] space-y-3">
              {signedFile ? (
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-medium">{signedFile.name}</div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-300">
                      Aceasta varianta semnata va fi asignata studentului.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-primary whitespace-nowrap px-3"
                      onClick={() => {
                        if (signedFileInputRef.current) {
                          signedFileInputRef.current.value = '';
                          signedFileInputRef.current.click();
                        }
                      }}
                      disabled={signedUploadLoading || disabledAll}
                      title="Incarca un alt PDF semnat"
                    >
                      Inlocuieste
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <span className="text-gray-500 text-xs md:text-sm">
                    Nu exista o varianta semnata incarcata.
                  </span>
                  <div>
                    <button
                      type="button"
                      className="btn btn-outline-primary whitespace-nowrap px-3"
                      onClick={() => {
                        if (signedFileInputRef.current) {
                          signedFileInputRef.current.value = '';
                          signedFileInputRef.current.click();
                        }
                      }}
                      disabled={signedUploadLoading || disabledAll}
                    >
                      {signedUploadLoading ? 'Se incarca…' : 'Incarca PDF semnat'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>


        </div>

        {/* footer */}
        <div className="flex items-center justify-between gap-3 border-t border-white-light px-6 py-6 text-xs dark:border-[#1b2e4b]">
          <div className="text-gray-500 dark:text-gray-400">
            {signedFile
              ? 'La salvare se va asigna studentului varianta semnata.'
              : 'La salvare se va asigna studentului varianta nesemnata generata mai sus.'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={onClose}
              disabled={disabledAll}
            >
              Renunta
            </button>

            <button
              type="button"
              className="btn btn-success gap-1"
              onClick={handleAssignToStudent}
              disabled={disabledAll || (!preview && !signedFile)}
              title="Asigneaza documentul studentului"
            >
              <IconChecks className="h-4 w-4" /> {assignLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

}
