'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import IconArrowForward from '@/components/icon/icon-arrow-forward';
import IconDatabase from '@/components/icon/icon-database';
import IconBook from '@faComponents/icon/icon-book';
import IconBell from '@faComponents/icon/icon-bell';

type PublicDoc = {
  id: string;
  title: string;
  description?: string | null;
  blobId: string;
  mimeType: string;
  publishedAt?: string | null;
};

export default function DocumentePubliceWidget() {
  const [methodologies, setMethodologies] = useState<PublicDoc[]>([]);
  const [announcements, setAnnouncements] = useState<PublicDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [mRes, aRes] = await Promise.all([
          fetch('/api/admin/public-documents/methodologies', { cache: 'no-store' }),
          fetch('/api/admin/public-documents/announcements', { cache: 'no-store' }),
        ]);

        const mData = mRes.ok ? await mRes.json() : [];
        const aData = aRes.ok ? await aRes.json() : [];

        setMethodologies(
          (mData || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            blobId: d.blobId ?? d.blob_id,
            mimeType: d.mimeType ?? d.mime_type ?? 'application/pdf',
            publishedAt: d.publishedAt ?? d.published_at ?? null,
          }))
        );
        setAnnouncements(
          (aData || []).map((d: any) => ({
            id: d.id,
            title: d.title,
            description: d.description,
            blobId: d.blobId ?? d.blob_id,
            mimeType: d.mimeType ?? d.mime_type ?? 'application/pdf',
            publishedAt: d.publishedAt ?? d.published_at ?? null,
          }))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderList = (items: PublicDoc[]) => {
    if (loading) {
      return (
        <div className="space-y-3 py-3">
          <div className="h-4 w-48 rounded bg-slate-200/70 dark:bg-slate-700/60" />
          <div className="h-4 w-56 rounded bg-slate-200/70 dark:bg-slate-700/60" />
          <div className="h-4 w-40 rounded bg-slate-200/70 dark:bg-slate-700/60" />
        </div>
      );
    }

    if (!items.length) {
      return (
        <div className="flex items-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
          <IconDatabase className="h-5 w-5" />
          <span>Nu exista documente in aceasta sectiune.</span>
        </div>
      );
    }

    return (
      <div className="space-y-1.5 py-3">
        {items.map((doc) => (
          <Link
            key={doc.id}
            href={`/api/admin/public-documents/${doc.id}/download`}
            target="_blank"
            className="group flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800/60 dark:hover:text-white"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="truncate">{doc.title}</span>
              <span className="inline-flex items-center rounded bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-50">
                pdf
              </span>
            </div>
            <IconArrowForward className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-slate-600 dark:group-hover:text-white" />
          </Link>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto px-5 py-10 md:px-0">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-semibold md:text-2xl">Resurse utile</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Metodologii si documentatii */}
        <div className="rounded-md border border-[#ebedf2] bg-white p-5 shadow-sm dark:border-[#191e3a] dark:bg-[#0e1726]">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
            <h3 className="text-[22px] px-2 font-bold leading-snug dark:text-slate-300 flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-info-light text-info dark:bg-info dark:text-info-light">
                  <IconBook />
                </span>
              Metodologii si documentatii
            </h3>
            <span className="badge bg-info/10 text-info px-3 py-1 text-[11px] font-semibold dark:bg-info/20">
              {methodologies.length} {methodologies.length === 1 ? 'document' : 'documente'}
            </span>
          </div>
          {renderList(methodologies)}
        </div>

        {/* Anunturi */}
        <div className="rounded-md border border-[#ebedf2] bg-white p-5 shadow-sm dark:border-[#191e3a] dark:bg-[#0e1726]">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
            <h3 className="text-[22px] px-2 font-bold leading-snug dark:text-slate-300 flex items-center gap-2">
              <span className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                <IconBell />
              </span>
              Anunturi
            </h3>
            <span className="badge bg-warning/10 text-warning px-3 py-1 text-[11px] font-semibold dark:bg-warning/20">
              {announcements.length} {announcements.length === 1 ? 'document' : 'documente'}
            </span>
          </div>
          {renderList(announcements)}
        </div>
      </div>
    </div>
  );
}
