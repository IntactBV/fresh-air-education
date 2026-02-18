import { type Metadata } from 'next';
import React from 'react';
import { headers } from 'next/headers';
import Link from 'next/link';
import PublicPageRenderer from './PublicPageRenderer';
import TestimonialeComponent from './testimonialeComponent';
import Image from 'next/image';
import AbsolventiCounter from './absolventiCounter';

export const metadata: Metadata = {
  title: 'FRESH TECH - Tehnologii si educatie pentru studenti',
};

async function getGraduatesCount() {
  try {
    const h = await headers();

    const proto = h.get('x-forwarded-proto') ?? 'http';
    const host = h.get('x-forwarded-host') ?? h.get('host');
    const origin = host ? `${proto}://${host}` : '';

    const res = await fetch(`${origin}/api/public/graduates-count`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return 0;

    const data: { graduatesCount?: number } = await res.json();
    return Number(data.graduatesCount ?? 0);
  } catch {
    return 0;
  }
}

const Home = async () => {
  const graduatesCount = await getGraduatesCount();

  return (
    <div>

      <div className="relative overflow-hidden rounded-t-md px-5 py-14 md:py-20 md:px-10">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/assets/images/fresh-air-cover-hero.jpg')" }}
          aria-hidden="true"
        />

        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-black/55 via-black/10 to-black/45
            md:from-black/45 md:via-black/5 md:to-black/40
            dark:from-black/70 dark:via-black/25 dark:to-black/70
          "
          aria-hidden="true"
        />

        <div
          className="
            absolute -bottom-6 -end-6 hidden
            z-0
            text-white
            rtl:rotate-y-180
            lg:block xl:end-0
            opacity-15 dark:opacity-[0.03]
          "
          aria-hidden="true"
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

        <div
          className="
            absolute bottom-3 right-4
            z-10
            text-[10px]
            text-white/40
            hover:text-white/70
            transition
          "
        >
          <a
            href="https://www.freepik.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline-offset-2 hover:underline"
          >
            Image by Freepik
          </a>
        </div>


        <div
          className="pointer-events-none absolute bottom-0 left-1/2 z-0 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl bg-white/10 dark:bg-slate-600/15"
          aria-hidden="true"
        />

        <div className="relative z-10 mx-auto grid max-w-6xl items-start gap-8 md:grid-cols-12">
          <div className="md:col-span-5">
            <div className="rounded-2xl bg-white/12 p-8 shadow-sm ring-1 ring-white/20 backdrop-blur-md dark:bg-black/20 dark:ring-white/10 md:max-w-[560px]">
              <span
                className="
                  inline-block select-none
                  font-sans font-bold tracking-tight
                  text-white
                  text-4xl sm:text-5xl md:text-6xl
                  leading-none
                "
              >
                <span className="text-white">FRESH</span>{" "}
                <span className="text-primary">TECH</span>
              </span>

              <p className="mt-5 max-w-md text-sm font-medium text-white/90 md:text-base">
                Platforma de practica, proiecte reale si mentori din industrie pentru studentii pasionati de tehnologie.
                Alatura-te programului <span className="font-semibold text-white">Fresh Tech</span> si construieste-ti portofoliul inca din facultate.
              </p>

            <div className="mt-7 grid grid-cols-1 gap-3 lg:grid-cols-2">
              <Link
                href="/public/formular-de-inscriere-studenti"
                className="
                  inline-flex h-11 w-full items-center justify-center gap-2 rounded-full
                  bg-white px-6 text-sm font-semibold text-slate-900
                  shadow-md transition hover:bg-white/90 active:scale-[0.99]
                  focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50
                "
                aria-label="Inscriere studenti"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 3 1 8l11 5 8-3.636V15h2V8L12 3Zm0 13.343L6 13v3.5c0 1.657 2.686 3 6 3s6-1.343 6-3V13l-6 3.343Z" />
                </svg>
                <span>Inscriere studenti</span>
              </Link>

              <Link
                href="#program-de-practica-section"
                className="
                  inline-flex h-11 w-full items-center justify-center
                  rounded-full px-5 text-sm font-semibold
                  text-white/90 ring-1 ring-white/25
                  hover:bg-white/10 hover:text-white
                  transition
                "
              >
                Afla cum functioneaza
              </Link>

            </div>


            </div>
          </div>

          <div className="hidden md:col-span-4 md:block" />

          <div className="hidden md:col-span-3 md:block">
            <div className="flex justify-end pt-2">
              <AbsolventiCounter current={graduatesCount} total={252} />
            </div>
          </div>
        </div>
      </div>

      <div
        id="program-de-practica-section"
        className="scroll-mt-24 lg:scroll-mt-28 w-full rounded-md border border-slate-200/50 bg-white px-16 py-12 shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
        <PublicPageRenderer slug="program-de-practica" />
      </div>

      <TestimonialeComponent />

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
                    px-3 py-2 rounded-md
                    dark:bg-white/70 dark:px-3 dark:py-2
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
