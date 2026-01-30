import { type Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import IconArrowWaveLeftUp from '@/components/icon/icon-arrow-wave-left-up';
import PublicPageRenderer from './PublicPageRenderer';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'FRESH TECH - Tehnologii si educatie pentru studenti',
};

const Home = () => {
  return (
    <div>

      <div className="relative overflow-hidden rounded-t-md bg-primary-light bg-[url('/assets/images/knowledge/pattern.png')] bg-[length:620px_auto] md:bg-[length:720px_auto] bg-left-top bg-no-repeat px-5 py-16 md:py-20 dark:bg-black md:px-10">
      {/* decor subtil in dreapta jos */}
        <div
          className="
            absolute -bottom-4 -end-6 hidden
            text-[#DBE7FF] rtl:rotate-y-180 dark:text-[#1B2E4B]
            lg:block xl:end-0
            opacity-80 dark:opacity-[0.02]
          "
        >
          <svg
            width="375"
            height="185"
            viewBox="0 0 375 185"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-72 max-w-xs xl:w-full"
          >
            <defs>
              <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#DBE7FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <circle cx="80" cy="70" r="60" fill="url(#heroGrad)" />
            <rect x="120" y="35" width="150" height="18" rx="9" fill="#ffffff" fillOpacity="0.65" />
            <rect x="160" y="65" width="110" height="18" rx="9" fill="#ffffff" fillOpacity="0.4" />
          </svg>
        </div>

        {/* glow subtil jos-centru */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full  blur-3xl bg-white/10 dark:bg-slate-600/15" />

        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-10">
          {/* TITLU + text si sageata in stanga */}
          <div className="relative flex w-full justify-center mb-8">
            {/* FRESH TECH centrat real */}
            <span
              className="
                inline-block
                align-middle
                font-sans
                text-4xl sm:text-5xl md:text-6xl
                font-bold
                tracking-tight
                select-none
                text-zinc-800 dark:text-zinc-100
                text-center
              "
            >
              <span className="inline-block align-baseline text-5xl sm:text-6xl md:text-7xl leading-none">
                F
              </span>
              RESH{" "}
              <span className="inline-block align-baseline text-5xl sm:text-6xl md:text-7xl leading-none text-primary">
                T
              </span>
              <span className="text-primary">ECH</span>
            </span>

            <div className="pointer-events-none absolute left-0 top-[89%] hidden -translate-y-1/2 md:flex lg:left-8 xl:left-10">
              <div className="relative">
                <div
                  className="
                    inline-flex flex-col items-start
                    rounded-xl bg-white/85 px-4 py-2
                    text-[11px] font-medium leading-snug text-slate-700
                    shadow-sm ring-1 ring-white/60 backdrop-blur-sm
                    dark:bg-slate-900/80 dark:text-slate-100 dark:ring-slate-700/60
                  "
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500 dark:text-slate-300">
                    tehnologii si educatie
                  </span>

                  <span className="text-xs text-slate-600 dark:text-slate-200">
                    pentru studenti
                  </span>

                  <div className="mt-2 h-[2px] w-8 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-70" />
                </div>

                {/* sageata */}
                <div
                  className="
                    absolute
                    right-[-90px]
                    top-[55%] -translate-y-1/2
                    text-[#0E1726] dark:text-white
                  "
                >
                  <IconArrowWaveLeftUp className="w-12 md:w-16 xl:w-20 -rotate-6" />
                </div>
              </div>

            </div>
          </div>

          {/* TEXT + CTA-URI JOS, CENTRAT */}
          <div className="flex flex-col items-center text-center">
            <p className="mb-4 max-w-xl text-sm font-medium text-slate-800 dark:text-slate-100 md:text-base">
              Platforma de practica, proiecte reale si mentori din industrie pentru studentii pasionati de tehnologie.
              Alatura-te programului <span className="font-semibold text-primary">Fresh Tech</span> si construieste-ti portofoliul inca din facultate.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {/* CTA principal – Inscriere studenti */}
              <Link
                href="/public/formular-de-inscriere-studenti"
                className="group inline-flex h-11 items-center gap-2 rounded-full 
                          bg-gradient-to-r from-primary to-blue-500 px-6 text-sm font-semibold tracking-wide
                          text-white shadow-md transition-all duration-150 hover:brightness-110 active:scale-[0.99] 
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                aria-label="Inscriere Studenti"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-95" fill="currentColor" aria-hidden="true">
                  <path d="M12 3 1 8l11 5 8-3.636V15h2V8L12 3Zm0 13.343L6 13v3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V13l-6 3.343Z" />
                </svg>
                <span className="relative z-10">Inscriere studenti</span>
                <span
                  className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>

              {/* buton secundar – afla mai multe */}
              <Link
                href="#program-de-practica-section"
                className="inline-flex items-center text-xs font-medium text-slate-700 underline-offset-4 hover:text-primary hover:underline dark:text-slate-200"
              >
                Afla cum functioneaza programul de practica
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div
        id="program-de-practica-section"
        className="scroll-mt-24 lg:scroll-mt-28 w-full rounded-md border border-slate-200/50 bg-white px-16 py-12 shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
        <PublicPageRenderer slug="program-de-practica" />
      </div>

      {/* final CTA */}
      <div className="mt-16 flex flex-col items-center text-center">
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">
          Te-am convins?
        </h3>

        <p className="mt-2 mb-6 max-w-md text-sm text-slate-600 dark:text-slate-300">
          Inscrie-te acum in programul de practica si fa primul pas spre cariera ta.
        </p>

        <Link
          href="/public/formular-de-inscriere-studenti"
          className="group inline-flex h-11 items-center gap-2 rounded-full
                    bg-gradient-to-r from-primary to-blue-500 px-6 text-sm font-semibold tracking-wide
                    text-white shadow-md transition-all duration-150 hover:brightness-110 active:scale-[0.99]
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          aria-label="Inscriere Studenti"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 opacity-95" fill="currentColor" aria-hidden="true">
            <path d="M12 3 1 8l11 5 8-3.636V15h2V8L12 3Zm0 13.343L6 13v3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V13l-6 3.343Z" />
          </svg>
          <span className="relative z-10">Inscriere studenti</span>
          <span
            className="translate-x-0 transition-transform duration-200 group-hover:translate-x-1"
            aria-hidden="true"
          >
            →
          </span>
        </Link>
      </div>

      <div className="mt-10 flex flex-col-reverse items-center justify-between gap-5 rounded-md bg-gradient-to-tl from-[rgba(234,241,255,0.44)] to-[rgba(234,241,255,0.96)] px-6 py-2.5 dark:from-[rgba(14,23,38,0.44)] dark:to-[#0E1726] md:flex-row lg:mt-20 xl:px-16">
        {/* stânga: linkuri + susținut de */}
        <div className="flex-1 py-3.5">
          <h3 className="mb-4 text-xl font-bold dark:text-white md:text-2xl">Informatii utile</h3>

          <div className="grid grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-200">
            {/* coloana 1 */}
            <div className="flex flex-col gap-2">
              <Link href="/public/termeni-si-conditii" className="hover:text-primary">
                Termeni si conditii
              </Link>
              <Link href="/public/politica-de-confidentialitate" className="hover:text-primary">
                Politica de confidentialitate
              </Link>
              {/* <Link href="/public/intrebari-frecvente" className="hover:text-primary">
                Intrebari frecvente
              </Link> */}
            </div>

            {/* coloana 2 */}
            {/* <div className="flex flex-col gap-2">
              <Link href="/public/despre-program" className="hover:text-primary">
                Despre program
              </Link>
              <Link href="/public/contact" className="hover:text-primary">
                Contact
              </Link>
            </div> */}
          </div>

          <div className="mt-10 flex items-center gap-4">
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Proiect sustinut de:
            </span>

            <div className="flex items-center gap-2">
              <Link href="https://freshair.ro/" target="_blank" rel="noopener noreferrer">

                <div
                  className="
                    inline-flex items-center justify-center
                    bg-white/60 px-3 py-2 rounded-md
                    dark:bg-white/80 dark:px-3 dark:py-2
                    transition-all
                  "
                >
                  <Image
                    src="/assets/images/logo-fresh-air.png"
                    alt="Fresh Air"
                    width={500}
                    height={96}
                    className="h-12 w-auto object-contain"
                    priority
                  />

                </div>

              </Link>
            </div>
          </div>

        </div>

        <div className="w-52 max-w-xs hidden md:flex lg:w-full">
          <Image
            src="/assets/images/knowledge/find-solution.svg"
            alt="find-solution"
            width={400}
            height={300}
            className="w-full object-cover rtl:rotate-y-180 dark:brightness-[2.59] dark:grayscale-[83%]"
          />
        </div>
      </div>

    </div>
  );
};

export default Home;
