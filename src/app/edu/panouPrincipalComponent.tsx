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

interface PanouPrincipalProps {
  userName?: string;
  materialsCount?: number;
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

export default function PanouPrincipalComponent({
  userName = 'ion.popescu@gmail.com',
  materialsCount = 27,
  announcements = [
    {
      id: 'a1',
      title: 'Program secretariat actualizat',
      date: '2025-10-01',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere, arcu vitae posuere ultricies, lorem mi interdum orci, ac pulvinar lorem sem et nisi.',
      ctaLabel: 'Vezi detalii',
      ctaHref: '/edu/anunturi',
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
}: PanouPrincipalProps) {
  const [activeFaq, setActiveFaq] = useState<string>('1');
  const toggleFaq = (value: string) => setActiveFaq((old) => (old === value ? '' : value));

  return (
    <div>
      {/* HERO cu pattern, headline */}
      <div className="relative rounded-t-md bg-primary-light bg-[url('/assets/images/knowledge/pattern.png')] bg-contain bg-left-top bg-no-repeat px-5 py-8 dark:bg-black md:px-10">
        <div className="absolute -bottom-1 -end-6 hidden text-[#DBE7FF] rtl:rotate-y-180 dark:text-[#1B2E4B] lg:block xl:end-0">
          {/* ornament SVG (decor) */}
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
            Descoperă rapid resursele și noutățile. Caută, întreabă, învață.
          </p>
          {/* topic tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#2196F3] sm:gap-4">
            <div className="whitespace-nowrap font-medium text-black dark:text-white">Scurtături:</div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <Link href="/edu/materiale" className="rounded-full bg-white px-3 py-1 text-sm text-primary shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white">
                Materiale
              </Link>
              <Link href="/edu/datele-mele" className="rounded-full bg-white px-3 py-1 text-sm text-info shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white">
                Datele mele
              </Link>
              <Link href="/edu/documentele-mele" className="rounded-full bg-white px-3 py-1 text-sm text-warning shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white">
                Documentele mele
              </Link>
              <Link href="/edu/contul-meu" className="rounded-full bg-white px-3 py-1 text-sm text-success shadow-sm duration-300 hover:underline dark:bg-[#0E1726] dark:text-white">
                Contul meu
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* GRID 2 coloane */}
      <div className="pt-5">
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* KPI Materiale */}
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
                    <CountUp start={0} end={materialsCount} duration={1.1} />
                  </span>
                </div>
                <div className="text-white-dark">
                  <div className="font-medium">Total resurse disponibile în contul tău.</div>
                  <div className="text-xs">Actualizat automat la fiecare refresh al paginii.</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="panel">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light flex items-center gap-2">
              <span className="grid h-9 w-9 place-content-center rounded-full bg-info-light text-info dark:bg-info dark:text-info-light">
                <IconBookmark />
              </span>
              Întrebări frecvente
            </h5>

            <div className="space-y-2 font-semibold">
              {/* Item 1 */}
              <div className="rounded-lg border border-white-light dark:border-white/10">
                <button
                  type="button"
                  className={`w-full p-4 flex items-center text-white-dark dark:bg-[#1b2e4b] ${activeFaq === '1' ? '!text-primary' : ''}`}
                  onClick={() => toggleFaq('1')}
                >
                  <IconBook className="mr-2 h-4 w-4" /> Cum accesez materialele de curs?
                  <IconArrowForward className={`ml-auto h-4 w-4 transition-transform ${activeFaq === '1' ? 'rotate-180' : ''}`} />
                </button>
                <AnimateHeight duration={300} height={activeFaq === '1' ? 'auto' : 0}>
                  <div className="border-t border-white-light p-4 text-[13px] text-white-dark dark:border-white/10">
                    <p className="mb-2">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ut enim ad minim veniam.</p>
                    <Link href="/edu/materiale" className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                      Mergi la Materiale <IconArrowForward className="h-4 w-4" />
                    </Link>
                  </div>
                </AnimateHeight>
              </div>

              {/* Item 2 */}
              <div className="rounded-lg border border-white-light dark:border-white/10">
                <button
                  type="button"
                  className={`w-full p-4 flex items-center text-white-dark dark:bg-[#1b2e4b] ${activeFaq === '2' ? '!text-primary' : ''}`}
                  onClick={() => toggleFaq('2')}
                >
                  <IconCalendar className="mr-2 h-4 w-4" /> Cum aflu programul activităților?
                  <IconArrowForward className={`ml-auto h-4 w-4 transition-transform ${activeFaq === '2' ? 'rotate-180' : ''}`} />
                </button>
                <AnimateHeight duration={300} height={activeFaq === '2' ? 'auto' : 0}>
                  <div className="border-t border-white-light p-4 text-[13px] text-white-dark dark:border-white/10">
                    <ul className="list-disc space-y-1 pl-5">
                      <li>Calendarul cursurilor este actualizat săptămânal.</li>
                      <li>Verifică secțiunea <Link href="/edu/calendar" className="text-primary hover:underline">Calendar</Link>.</li>
                      <li>Activează notificările pentru noutăți.</li>
                    </ul>
                  </div>
                </AnimateHeight>
              </div>

              {/* Item 3 */}
              <div className="rounded-lg border border-white-light dark:border-white/10">
                <button
                  type="button"
                  className={`w-full p-4 flex items-center text-white-dark dark:bg-[#1b2e4b] ${activeFaq === '3' ? '!text-primary' : ''}`}
                  onClick={() => toggleFaq('3')}
                >
                  <IconBarChart className="mr-2 h-4 w-4" /> Cum urmăresc progresul?
                  <IconArrowForward className={`ml-auto h-4 w-4 transition-transform ${activeFaq === '3' ? 'rotate-180' : ''}`} />
                </button>
                <AnimateHeight duration={300} height={activeFaq === '3' ? 'auto' : 0}>
                  <div className="border-t border-white-light p-4 text-[13px] text-white-dark dark:border-white/10">
                    <p>Anim pariatur cliche reprehenderit. Raw denim aesthetic synth nesciunt.</p>
                    <button type="button" className="btn btn-primary mt-3">Vezi progres</button>
                  </div>
                </AnimateHeight>
              </div>
            </div>
          </div>
        </div>

        {/* a doua linie: Anunțuri + Linkuri utile */}
        <div className="mb-6 grid gap-6 lg:grid-cols-2">
          {/* Anunțuri */}
          <div className="panel">
            <div className="mb-5 flex items-center justify-between">
              <h5 className="text-lg font-semibold dark:text-white-light flex items-center gap-2">
                <span className="grid h-9 w-9 place-content-center rounded-full bg-warning-light text-warning dark:bg-warning dark:text-warning-light">
                  <IconBell />
                </span>
                Anunțuri
              </h5>
              <Link href="/edu/anunturi" className="text-primary hover:underline">Vezi toate</Link>
            </div>
            <div className="space-y-4">
              {announcements.map((a) => (
                <article key={a.id} className="rounded-lg border border-white-light p-4 shadow-[0px_0px_2px_0px_rgba(145,158,171,0.20),0px_12px_24px_-4px_rgba(145,158,171,0.12)] dark:border-[#1B2E4B] dark:bg-black">
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        {a.badge === 'Important' && (
                          <span className="rounded-full bg-danger-light px-2 py-0.5 text-xs font-semibold text-danger dark:bg-danger dark:text-danger-light">Important</span>
                        )}
                        {a.badge === 'Nou' && (
                          <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-semibold text-success dark:bg-success dark:text-success-light">Nou</span>
                        )}
                        {a.badge === 'Info' && (
                          <span className="rounded-full bg-info-light px-2 py-0.5 text-xs font-semibold text-info dark:bg-info dark:text-info-light">Info</span>
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
                  <p className="text-[13px] text-white-dark leading-relaxed">{a.content}</p>
                  {a.ctaHref && (
                    <div className="mt-3">
                      <Link href={a.ctaHref} className="btn btn-sm btn-outline-primary">{a.ctaLabel || 'Detalii'}</Link>
                    </div>
                  )}
                </article>
              ))}
              {announcements.length === 0 && <div className="text-sm text-white-dark">Momentan nu există anunțuri.</div>}
            </div>
          </div>

          {/* Linkuri utile */}
          <div className="panel">
            <h5 className="mb-5 text-lg font-semibold dark:text-white-light flex items-center gap-2">
              <span className="grid h-9 w-9 place-content-center rounded-full bg-secondary-light text-secondary dark:bg-secondary dark:text-secondary-light">
                <IconBookmark />
              </span>
              Linkuri utile
            </h5>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <li>
                <Link href="/edu/materiale" className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10">
                  <span className="text-sm font-medium">Materiale de curs</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/edu/documente" className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10">
                  <span className="text-sm font-medium">Documente & descărcări</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/edu/calendar" className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10">
                  <span className="text-sm font-medium">Calendar & program</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link href="/edu/faq" className="group flex items-center justify-between rounded-lg border border-white-light p-4 hover:border-primary dark:border-white/10">
                  <span className="text-sm font-medium">FAQ complet</span>
                  <IconArrowForward className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Gradient CTA strip */}
        <div className="mt-2 flex flex-col-reverse items-center justify-between gap-5 rounded-md bg-gradient-to-tl from-[rgba(234,241,255,0.44)] to-[rgba(234,241,255,0.96)] px-6 py-3 dark:from-[rgba(14,23,38,0.44)] dark:to-[#0E1726] md:flex-row xl:px-10">
          <div className="flex-1 py-2 text-center md:text-start">
            <h3 className="mb-1 text-xl font-bold dark:text-white md:text-2xl">Ai întrebări?</h3>
            <div className="text-sm font-medium text-white-dark md:text-base">Găsești răspunsuri în FAQ sau scrie-ne direct. Suntem aici să te ajutăm.</div>
            <div className="mt-4 flex justify-center md:justify-start lg:mt-6">
              <Link href="/edu/suport" className="btn btn-primary">Contactează suportul</Link>
            </div>
          </div>
          <div className="w-52 max-w-xs lg:w-72">
            <img src="/assets/images/knowledge/find-solution.svg" alt="help" className="w-full object-cover rtl:rotate-y-180 dark:brightness-[2.2] dark:grayscale-[60%]" />
          </div>
        </div>
      </div>
    </div>
  );
}
