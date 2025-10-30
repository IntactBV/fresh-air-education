'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CountUp from 'react-countup';
import AnimateHeight from 'react-animate-height';

// ICONS
import IconBook from '@/components/icon/icon-book';
import IconBell from '@/components/icon/icon-bell';
import IconBarChart from '@/components/icon/icon-bar-chart';
import IconArrowForward from '@faComponents/icon/icon-arrow-forward';
import IconBookmark from '@/components/icon/icon-bookmark';
import IconCalendar from '@/components/icon/icon-calendar';
import IconArrowWaveLeftUp from '@/components/icon/icon-arrow-wave-left-up';
import IconMenuDatatables from '@faComponents/icon/menu/icon-menu-datatables';

interface PanouPrincipalAdminProps {
  userName?: string;

  // statistici
  pendingRequestsCount?: number;   // cereri în așteptare
  enrolledStudentsCount?: number;  // studenți înscriși
  materialsCount?: number;         // materiale încărcate
  articlesCount?: number;          // articole publicate

  announcements?: Array<{
    id: string | number;
    title: string;
    date?: string;
    content: string;
    ctaLabel?: string;
    ctaHref?: string;
    badge?: 'Info' | 'Important' | 'Nou';
  }>;
}

export default function PanouPrincipalAdminComponent({
  userName = 'admin@example.com',
  pendingRequestsCount = 5,
  enrolledStudentsCount = 128,
  materialsCount = 27,
  articlesCount = 12,
  announcements = [
    {
      id: 'a1',
      title: 'Program secretariat actualizat',
      date: '2025-10-01',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere, arcu vitae posuere ultricies, lorem mi interdum orci, ac pulvinar lorem sem et nisi.',
      ctaLabel: 'Vezi detalii',
      ctaHref: '/admin/anunturi',
      badge: 'Important',
    },
    {
      id: 'a2',
      title: 'Înscriere la workshop-ul de toamnă',
      date: '2025-10-07',
      content:
        'Nulla facilisi. Cras a nibh eros. Integer interdum lorem a justo tempus, vel lacinia urna dapibus. Phasellus vulputate metus ac libero volutpat.',
      badge: 'Nou',
    },
  ],
}: PanouPrincipalAdminProps) {
  const [heroOpen, setHeroOpen] = useState(true);

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
              Panou principal — Admin
            </div>
          </div>

          <p className="mx-auto mb-6 max-w-2xl text-center text-sm font-semibold text-[#0E1726] dark:text-white-light">
            Gestionează cererile, utilizatorii și conținutul platformei dintr-un singur loc.
          </p>

          {/* SCURTĂTURI ADMIN */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#2196F3] sm:gap-4">
            <div className="whitespace-nowrap font-medium text-black dark:text-white">Scurtături:</div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Link
                href="/admin/cereri-in-asteptare"
                className="rounded-full bg-white px-3 py-1 text-sm text-danger shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Cereri în așteptare
              </Link>
              <Link
                href="/admin/studenti-inscrisi"
                className="rounded-full bg-white px-3 py-1 text-sm text-success shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Studenți înscriși
              </Link>
              <Link
                href="/admin/materiale"
                className="rounded-full bg-white px-3 py-1 text-sm text-primary shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Materiale
              </Link>
              <Link
                href="/admin/articole"
                className="rounded-full bg-white px-3 py-1 text-sm text-warning shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white"
              >
                Articole
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* GRID Statistici (înlocuiește FAQ) */}
      <div className="pt-5">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* KPI: Cereri în așteptare */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-danger-light text-danger dark:bg-danger dark:text-danger-light">
                  <IconBell />
                </span>
                Cereri în așteptare
              </h5>
              <Link href="/admin/cereri-in-asteptare" className="btn btn-danger">
                Gestionează <IconArrowForward className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-24 w-24 place-content-center rounded-full bg-gradient-to-r from-red-500/10 to-red-900/10 text-danger dark:from-red-500/20 dark:to-red-900/20">
                <span className="text-4xl font-extrabold">
                  <CountUp start={0} end={pendingRequestsCount} duration={1.1} />
                </span>
              </div>
              <div className="text-white-dark">
                <div className="font-medium">Înscrieri care așteaptă aprobare.</div>
                <div className="text-xs">Verifică și aprobă / respinge cererile.</div>
              </div>
            </div>
          </div>

          {/* KPI: Studenți înscriși */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-success-light text-success dark:bg-success dark:text-success-light">
                  <IconBarChart />
                </span>
                Studenți înscriși
              </h5>
              <Link href="/admin/studenti-inscrisi" className="btn btn-success">
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
                <div className="font-medium">Total utilizatori activi (studenți).</div>
                <div className="text-xs">Actualizat la reîmprospătarea paginii.</div>
              </div>
            </div>
          </div>

          {/* KPI: Materiale */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-primary-light text-primary dark:bg-primary dark:text-primary-light">
                  <IconMenuDatatables />
                </span>
                Materiale
              </h5>
              <Link href="/admin/materiale" className="btn btn-primary">
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
                <div className="font-medium">Fișiere și resurse încărcate.</div>
                <div className="text-xs">Administrabile din secțiunea Materiale.</div>
              </div>
            </div>
          </div>

          {/* KPI: Articole */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                  <IconBook />
                </span>
                Articole
              </h5>
              <Link href="/admin/articole" className="btn btn-warning">
                Deschide <IconArrowForward className="ml-2 h-4 w-4" />
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid h-24 w-24 place-content-center rounded-full bg-gradient-to-r from-amber-500/10 to-amber-900/10 text-warning dark:from-amber-500/20 dark:to-amber-900/20">
                <span className="text-4xl font-extrabold">
                  <CountUp start={0} end={articlesCount} duration={1.1} />
                </span>
              </div>
              <div className="text-white-dark">
                <div className="font-medium">Postări publicate în secțiunea articole.</div>
                <div className="text-xs">Editează / adaugă din modulul Articole.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Anunțuri + Linkuri utile */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Anunțuri */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                  <IconBell />
                </span>
                Anunțuri
              </h5>
              <Link href="/admin/anunturi" className="text-primary hover:underline">Vezi toate</Link>
            </div>
            <div className="space-y-4">
              {announcements.map((a) => (
                <article
                  key={a.id}
                  className="rounded-lg border border-white-light p-4 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),0px_12px_24px_-4px_rgba(145,158,171,0.12)] dark:border-[#1B2E4B] dark:bg-black"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        {a.badge === 'Important' && (
                          <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger dark:bg-danger dark:text-danger-light">
                            Important
                          </span>
                        )}
                        {a.badge === 'Nou' && (
                          <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success dark:bg-success dark:text-success-light">
                            Nou
                          </span>
                        )}
                        {a.badge === 'Info' && (
                          <span className="rounded-full bg-info-light px-2 py-0.5 text-xs font-semibold text-info dark:bg-info dark:text-info-light">
                            Info
                          </span>
                        )}
                      </div>
                      <h6 className="font-semibold dark:text-white">{a.title}</h6>
                    </div>
                    {a.date && (
                      <span className="flex items-center gap-1 text-xs text-white-dark">
                        <IconCalendar className="h-4 w-4" /> {a.date}
                      </span>
                    )}
                  </div>
                  <p className="text-[13px] leading-relaxed text-white-dark">{a.content}</p>
                  {a.ctaHref && (
                    <div className="mt-3">
                      <Link href={a.ctaHref} className="btn btn-sm btn-outline-primary">
                        {a.ctaLabel || 'Detalii'}
                      </Link>
                    </div>
                  )}
                </article>
              ))}
              {announcements.length === 0 && (
                <div className="text-sm text-white-dark">Momentan nu există anunțuri.</div>
              )}
            </div>
          </div>

          {/* Linkuri utile (admin) */}
          <div className="panel">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light flex items-center gap-2">
              <span className="grid h-9 w-9 place-content-center rounded-full bg-info-light text-info dark:bg-info dark:text-info-light">
                <IconBookmark />
              </span>
              Linkuri utile
            </h5>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <li>
                <Link
                  href="/admin/cereri-in-asteptare"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Cereri în așteptare</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/studenti-inscrisi"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Studenți înscriși</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/materiale"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Materiale</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/articole"
                  className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10"
                >
                  <span className="text-sm font-medium">Articole</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-2 flex flex-col-reverse items-center justify-between gap-5 rounded-md bg-gradient-to-tl from-[rgba(234,241,255,0.44)] to-[rgba(234,241,255,0.96)] px-6 py-3 dark:from-[rgba(14,23,38,0.44)] dark:to-[#0E1726] md:flex-row xl:px-10">
          <div className="flex-1 py-2 text-center md:text-start">
            <h3 className="mb-1 text-xl font-bold dark:text-white md:text-2xl">Ai nevoie de ajutor?</h3>
            <div className="text-sm font-medium text-white-dark md:text-base">
              Vezi documentația de administrare sau scrie echipei de suport.
            </div>
            <div className="mt-4 flex justify-center md:justify-start lg:mt-6">
              <Link href="/admin/suport" className="btn btn-primary">
                Contactează suportul
              </Link>
            </div>
          </div>
          <div className="w-52 max-w-xs lg:w-72">
            <img
              src="/assets/images/knowledge/find-solution.svg"
              alt="help"
              className="w-full object-cover rtl:rotate-y-180 dark:brightness-[2.0] dark:grayscale-[60%]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
