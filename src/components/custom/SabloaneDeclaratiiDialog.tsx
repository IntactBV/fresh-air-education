'use client';

import React, { useEffect, useRef, useState } from 'react';
import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';

import IconX from '@/components/icon/icon-x';
import IconEye from '@/components/icon/icon-eye';

type TemplateInfo = {
  exists: boolean;
  id?: string;
  documentType?: string;
  blobId?: string;
  filename?: string;
  mimeType?: string;
  byteSize?: number;
  uploadedAt?: string;
  createdBy?: string | null;
  createdByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const TEMPLATE_EVD = 'template_declaratie_evitare_dubla_finantare';
const TEMPLATE_ELIG = 'template_declaratie_eligibilitate_membru';

const API_URL = '/api/admin/acroform-templates';

export default function SabloaneDeclaratiiDialog({ isOpen, onClose }: Props) {
  const [error, setError] = useState<string | null>(null);

  const [templateEvd, setTemplateEvd] = useState<TemplateInfo | null>(null);
  const [templateElig, setTemplateElig] = useState<TemplateInfo | null>(null);

  const [loadingEvd, setLoadingEvd] = useState(false);
  const [loadingElig, setLoadingElig] = useState(false);

  const evdFileInputRef = useRef<HTMLInputElement | null>(null);
  const eligFileInputRef = useRef<HTMLInputElement | null>(null);

  const disabledAll = loadingEvd || loadingElig;

  const formatDateTime = (value?: string) => {
    if (!value) return null;
    try {
      return new Date(value).toLocaleString('ro-RO');
    } catch {
      return value;
    }
  };

  const fetchTemplate = async (type: string) => {
    const res = await fetch(`${API_URL}?type=${encodeURIComponent(type)}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      throw new Error('Nu s-a putut incarca sablonul.');
    }
    const data = (await res.json()) as { template: TemplateInfo };
    return data.template;
  };

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    (async () => {
      try {
        setError(null);
        setLoadingEvd(true);
        setLoadingElig(true);

        const [tplEvd, tplElig] = await Promise.allSettled([
          fetchTemplate(TEMPLATE_EVD),
          fetchTemplate(TEMPLATE_ELIG),
        ]);

        if (!mounted) return;

        if (tplEvd.status === 'fulfilled') {
          setTemplateEvd(tplEvd.value);
        } else {
          setTemplateEvd({ exists: false });
        }

        if (tplElig.status === 'fulfilled') {
          setTemplateElig(tplElig.value);
        } else {
          setTemplateElig({ exists: false });
        }
      } catch (e: any) {
        if (mounted) {
          setError(e?.message || 'Eroare neasteptata.');
        }
      } finally {
        if (mounted) {
          setLoadingEvd(false);
          setLoadingElig(false);
        }
      }
    })();

    return () => {
      mounted = false;
      setTemplateEvd(null);
      setTemplateElig(null);
      setError(null);
    };
  }, [isOpen]);

  const handleUploadTemplate = async (file: File, type: string) => {
    try {
      setError(null);
      if (type === TEMPLATE_EVD) setLoadingEvd(true);
      if (type === TEMPLATE_ELIG) setLoadingElig(true);

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}?type=${encodeURIComponent(type)}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let msg = 'Nu s-a putut salva sablonul.';
        try {
          const err = await res.json();
          if (err?.error) msg = err.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data = (await res.json()) as { template: TemplateInfo };

      if (type === TEMPLATE_EVD) {
        setTemplateEvd(data.template);
      } else {
        setTemplateElig(data.template);
      }
    } catch (e: any) {
      setError(e?.message || 'Eroare la upload sablon.');
    } finally {
      if (type === TEMPLATE_EVD) setLoadingEvd(false);
      if (type === TEMPLATE_ELIG) setLoadingElig(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/40"
        onClick={() => {
          if (!disabledAll) onClose();
        }}
      />
      {/* dialog */}
      <div className="relative z-10 flex max-h-[calc(100vh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-lg bg-white shadow-lg dark:bg-[#0e1726]">
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700/60">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sabloane declaratii
          </h2>
          <button
            type="button"
            className="text-slate-500 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white"
            onClick={() => (!disabledAll ? onClose() : null)}
          >
            <IconX />
          </button>
        </div>

        {/* error */}
        {error && (
          <div className="px-6 pt-3">
            <div className="rounded border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-100">
              {error}
            </div>
          </div>
        )}

        {/* body scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Sablon declaratie evitare dubla finantare */}
          <div className="panel p-4">
            <h3 className="mb-2 text-base font-semibold">Sablon declaratie evitare dubla finantare</h3>

            {loadingEvd ? (
              <div className="text-sm text-gray-500">Se incarca sablonul...</div>
            ) : templateEvd?.exists ? (
              <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                <div className="space-y-0.5">
                  <div className="font-medium">{templateEvd.filename}</div>
                  {templateEvd.blobId && (
                    <div className="text-xs text-gray-500">
                      Blob ID: <span className="font-mono">{templateEvd.blobId}</span>
                    </div>
                  )}
                  {templateEvd.uploadedAt && (
                    <div className="text-[11px] text-gray-400">
                      Ultima actualizare: {formatDateTime(templateEvd.uploadedAt)}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {templateEvd.blobId && (
                    <Tippy content="Vezi template PDF">
                      <a
                        href={`/api/admin/document-blobs/${templateEvd.blobId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-primary gap-1"
                      >
                        <IconEye className="h-3 w-3" /> Vezi
                      </a>
                    </Tippy>
                  )}

                  <input
                    ref={evdFileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadTemplate(f, TEMPLATE_EVD);
                      if (evdFileInputRef.current) evdFileInputRef.current.value = '';
                    }}
                  />

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-xs"
                    onClick={() => evdFileInputRef.current?.click()}
                    disabled={disabledAll}
                  >
                    Inlocuieste sablon
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-dashed border-white-light p-4 text-sm dark:border-[#1b2e4b]">
                <p className="mb-3">
                  Nu exista sablon incarcat pentru aceasta declaratie.
                </p>

                <input
                  ref={evdFileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadTemplate(f, TEMPLATE_EVD);
                    if (evdFileInputRef.current) evdFileInputRef.current.value = '';
                  }}
                />

                <button
                  type="button"
                  className="btn btn-outline-primary btn-xs"
                  onClick={() => evdFileInputRef.current?.click()}
                  disabled={disabledAll}
                >
                  Incarca sablon
                </button>
              </div>
            )}
          </div>

          {/* Sablon declaratie eligibilitate membru */}
          <div className="panel p-4">
            <h3 className="mb-2 text-base font-semibold">Sablon declaratie eligibilitate membru</h3>

            {loadingElig ? (
              <div className="text-sm text-gray-500">Se incarca sablonul...</div>
            ) : templateElig?.exists ? (
              <div className="flex items-center justify-between rounded border border-white-light p-2 text-sm dark:border-[#1b2e4b]">
                <div className="space-y-0.5">
                  <div className="font-medium">{templateElig.filename}</div>

                  {templateElig.blobId && (
                    <div className="text-xs text-gray-500">
                      Blob ID: <span className="font-mono">{templateElig.blobId}</span>
                    </div>
                  )}

                  {templateElig.uploadedAt && (
                    <div className="text-[11px] text-gray-400">
                      Ultima actualizare: {new Date(templateElig.uploadedAt).toLocaleString('ro-RO')}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {templateElig.blobId && (
                    <Tippy content="Vezi template PDF">
                      <a
                        href={`/api/admin/document-blobs/${templateElig.blobId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-primary gap-1"
                      >
                        <IconEye className="h-3 w-3" /> Vezi
                      </a>
                    </Tippy>
                  )}

                  {/* input ascuns pentru upload */}
                  <input
                    ref={eligFileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadTemplate(f, TEMPLATE_ELIG);
                      if (eligFileInputRef.current) eligFileInputRef.current.value = '';
                    }}
                  />

                  {/* buton stilizat */}
                  <button
                    type="button"
                    className="btn btn-outline-primary btn-xs"
                    onClick={() => eligFileInputRef.current?.click()}
                    disabled={disabledAll}
                  >
                    Inlocuieste sablon
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded border border-dashed border-white-light p-4 text-sm dark:border-[#1b2e4b]">
                <p className="mb-3">
                  Nu exista sablon incarcat pentru aceasta declaratie.
                </p>

                {/* input ascuns */}
                <input
                  ref={eligFileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadTemplate(f, TEMPLATE_ELIG);
                    if (eligFileInputRef.current) eligFileInputRef.current.value = '';
                  }}
                />

                {/* buton stylizat */}
                <button
                  type="button"
                  className="btn btn-outline-primary btn-xs"
                  onClick={() => eligFileInputRef.current?.click()}
                  disabled={disabledAll}
                >
                  Incarca sablon
                </button>
              </div>
            )}
          </div>

        </div>

        {/* footer simplu */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-6 py-4 text-xs text-slate-500 dark:border-slate-700/60 dark:text-slate-300">

          <span>Aceste sabloane sunt valabile pentru toti studentii.</span>

          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={onClose}
            disabled={disabledAll}
          >
            Inchide
          </button>
        </div>

      </div>
    </div>
  );
}
