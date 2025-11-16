'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountUp from 'react-countup';

// ICONS
import IconBook from '@/components/icon/icon-book';
import IconBell from '@/components/icon/icon-bell';
import IconBarChart from '@/components/icon/icon-bar-chart';
import IconArrowForward from '@faComponents/icon/icon-arrow-forward';
import IconBookmark from '@/components/icon/icon-bookmark';
import IconCalendar from '@/components/icon/icon-calendar';
import IconArrowWaveLeftUp from '@/components/icon/icon-arrow-wave-left-up';
import IconMenuDatatables from '@faComponents/icon/menu/icon-menu-datatables';

interface PanouPrincipalTutoreProps {
  userName?: string;

  enrolledStudentsCount?: number;
  materialsCount?: number; // va fi "Materiale studenti"

}

export default function PanouPrincipalTutoreComponent({
  userName = 'tutore@example.com',
  enrolledStudentsCount = 0,
  materialsCount = 0,
}: PanouPrincipalTutoreProps) {
  const [heroOpen] = useState(true);

  return (
    <div>
      {/* HERO */}
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
              Panou principal — Tutore
            </div>
          </div>

          <p className="mx-auto mb-6 max-w-2xl text-center text-sm font-semibold text-[#0E1726] dark:text-white-light">
            Gestioneaza studentii si lista de materiale dintr-un singur loc.
          </p>

          {/* SCURTATURI TUTORE */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#2196F3] sm:gap-4">
            <div className="whitespace-nowrap font-medium text-black dark:text-white">Scurtaturi:</div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/tutore/studenti-inscrisi"
                className="rounded-full bg-white px-3 py-1 text-sm text-success shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Studenti inscrisi
              </Link>
              <Link
                href="/tutore/materiale"
                className="rounded-full bg-white px-3 py-1 text-sm text-primary shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Materiale studenti
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* GRID Statistici */}
      <div className="pt-5">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Studenti inscrisi */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success dark:bg-success dark:text-success-light">
                  <IconBarChart />
                </span>
                Studenti inscrisi
              </h5>
              <Link href="/tutore/studenti-inscrisi" className="btn btn-success">
                Deschide <IconArrowForward className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-24 w-24 place-content-center rounded-full bg-gradient-to-r from-emerald-500/10 to-emerald-900/10 text-success dark:from-emerald-500/20 dark:to-emerald-900/20">
                <span className="text-4xl font-extrabold">
                  <CountUp start={0} end={enrolledStudentsCount} duration={1.1} />
                </span>
              </div>
              <div className="text-white-dark">
                <div className="font-medium">Total studenti activi/absolventi.</div>
                <div className="text-xs">Actualizat la reimprospatare.</div>
              </div>
            </div>
          </div>

          {/* Materiale studenti */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-primary-light text-primary dark:bg-primary dark:text-primary-light">
                  <IconMenuDatatables />
                </span>
                Materiale studenti
              </h5>
              <Link href="/tutore/materiale" className="btn btn-primary">
                Deschide <IconArrowForward className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-24 w-24 place-content-center rounded-full bg-gradient-to-r from-indigo-500/10 to-indigo-900/10 text-primary dark:from-indigo-500/20 dark:to-indigo-900/20">
                <span className="text-4xl font-extrabold">
                  <CountUp start={0} end={materialsCount} duration={1.1} />
                </span>
              </div>
              <div className="text-white-dark">
                <div className="font-medium">Fisiere si resurse incarcate.</div>
                <div className="text-xs">Administrabile din sectiunea Materiale.</div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
