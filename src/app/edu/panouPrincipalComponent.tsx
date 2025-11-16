'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CountUp from 'react-countup';
import IconBook from '@/components/icon/icon-book';
import IconBell from '@/components/icon/icon-bell';
import IconArrowForward from '@faComponents/icon/icon-arrow-forward';
import IconBookmark from '@/components/icon/icon-bookmark';
import IconArrowWaveLeftUp from '@/components/icon/icon-arrow-wave-left-up';
import IconMenuDatatables from '@faComponents/icon/menu/icon-menu-datatables';
import IconDatabase from '@/components/icon/icon-database';

type PublicDoc = {
  id: string;
  title: string;
  description?: string | null;
  blobId: string;
  mimeType: string;
  publishedAt?: string | null;
  createdAt?: string | null;
};

type PanouPrincipalResponse = {
  currentUserName: string | null;
  materialsCount: number;
  announcements: PublicDoc[];
  methodologies: PublicDoc[];
};

export default function PanouPrincipalComponent() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<PanouPrincipalResponse | null>(null);
  const [activeFaq, setActiveFaq] = useState<string>('1');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/edu/dashboard', { cache: 'no-store' });
        if (!res.ok) throw new Error('Nu am putut incarca datele.');
        const json: PanouPrincipalResponse = await res.json();
        setData(json);
        setErr(null);
      } catch (e: any) {
        setErr(e?.message || 'Eroare la incarcare.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleFaq = (val: string) => {
    setActiveFaq((old) => (old === val ? '' : val));
  };

  const userName = data?.currentUserName || 'utilizator';

  const renderPublicDocList = (items: PublicDoc[], emptyText: string) => {
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
        <div className="flex items-center gap-2 py-3 text-sm text-slate-500 dark:text-slate-400">
          <IconDatabase className="h-5 w-5" />
          <span>{emptyText}</span>
        </div>
      );
    }
    return (
      <div className="space-y-1.5 py-2">
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
    <div>
      {/* header albastru */}
      <div className="relative rounded-t-md bg-primary-light bg-[url('/assets/images/knowledge/pattern.png')] bg-contain bg-left-top bg-no-repeat px-5 py-8 dark:bg-black md:px-10">
        <div className="absolute -bottom-1 -end-6 hidden text-[#DBE7FF] rtl:rotate-y-180 dark:text-[#1B2E4B] lg:block xl:end-0">
          <svg width="375" height="185" viewBox="0 0 375 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-72 max-w-xs xl:w-full">
            <rect width="375" height="185" fill="currentColor" className="opacity-0" />
          </svg>
        </div>
        <div className="relative">
          <div className="flex flex-col items-center justify-center sm:-ms-24 sm:flex-row xl:-ms-48">
            <div className="mb-2 flex gap-1 text-end text-base leading-5 sm:flex-col xl:text-xl dark:text-white">
              <span>Bine ai venit,</span>
              <span className="font-bold text-primary">{userName}</span>
            </div>
            <div className="me-4 ms-2 hidden text-[#0E1726] rtl:rotate-y-180 dark:text-white sm:block">
              <IconArrowWaveLeftUp className="w-16 xl:w-28" />
            </div>
            <div className="mb-2 text-center text-2xl font-bold text-[#0E1726] dark:text-white md:text-4xl">
              Panou principal
            </div>
          </div>
          <p className="mx-auto mb-6 max-w-2xl text-center text-sm font-semibold text-[#0E1726] dark:text-white-light">
            Acceseaza rapid resursele si noutatile. Cauta, invata, descarca.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#2196F3] sm:gap-4">
            <div className="whitespace-nowrap font-medium text-black dark:text-white">Scurtaturi:</div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/edu/materiale"
                className="rounded-full bg-white px-3 py-1 text-sm text-primary shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Materiale
              </Link>
              <Link
                href="/edu/datele-mele"
                className="rounded-full bg-white px-3 py-1 text-sm text-info shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Datele mele
              </Link>
              <Link
                href="/edu/documentele-mele"
                className="rounded-full bg-white px-3 py-1 text-sm text-warning shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Documentele mele
              </Link>
              <Link
                href="/edu/contul-meu"
                className="rounded-full bg-white px-3 py-1 text-sm text-success shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Contul meu
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* grid carduri */}
      <div className="pt-5">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* 1. card materiale */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-primary-light text-primary dark:bg-primary dark:text-primary-light">
                  <IconMenuDatatables />
                </span>
                Materiale disponibile
              </h5>
              <Link href="/edu/materiale" className="btn btn-primary">
                Deschide <IconArrowForward className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="grid h-24 w-24 place-content-center rounded-full bg-gradient-to-r from-[#4361ee]/15 to-[#160f6b]/15 text-primary dark:from-[#4361ee]/25 dark:to-[#160f6b]/25">
                  <span className="text-4xl font-extrabold">
                    {loading ? (
                      '0'
                    ) : (
                      <CountUp start={0} end={data?.materialsCount ?? 0} duration={1.1} />
                    )}
                  </span>
                </div>
                <div className="text-white-dark">
                  <div className="font-medium">Total resurse disponibile in contul tau.</div>
                  <div className="text-xs">Acces pe baza seriei sau a accesului direct.</div>
                </div>
              </div>
            </div>
            {err && <div className="mt-3 text-sm text-danger">{err}</div>}
          </div>

          {/* 2. card linkuri utile */}
          <div className="panel">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light flex items-center gap-2">
              <span className="grid h-9 w-9 place-content-center rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                <IconBookmark />
              </span>
              Linkuri utile
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li>
                <Link
                  href="/edu/materiale"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Materiale de curs</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/edu/datele-mele"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Date personale</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/edu/documentele-mele"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Documente personale</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/edu/contul-meu"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Contul meu</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* linia a doua: anunturi + metodologii */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* anunturi */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                  <IconBell />
                </span>
                Anunturi
              </h5>
              <span className="badge bg-warning/10 text-warning px-3 py-1 text-[11px] font-semibold dark:bg-warning/20">
                {(data?.announcements?.length ?? 0)} {(data?.announcements?.length ?? 0) === 1 ? 'document' : 'documente'}
              </span>
            </div>
            {renderPublicDocList(data?.announcements || [], 'Nu exista anunturi.')}
          </div>

          {/* metodologii */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-info-light text-info dark:bg-info dark:text-info-light">
                  <IconBook />
                </span>
                Metodologii si documentatii
              </h5>
              <span className="badge bg-info/10 text-info px-3 py-1 text-[11px] font-semibold dark:bg-info/20">
                {(data?.methodologies?.length ?? 0)} {(data?.methodologies?.length ?? 0) === 1 ? 'document' : 'documente'}
              </span>
            </div>
            {renderPublicDocList(data?.methodologies || [], 'Nu exista metodologii.')}
          </div>
        </div>

      </div>
    </div>
  );
}
