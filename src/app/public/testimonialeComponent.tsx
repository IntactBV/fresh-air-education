'use client';

import React, { useMemo, useRef } from 'react';

type Testimonial = {
  id: string;
  text: string;
  name: string;
  university: string;
};

export default function TestimonialeComponent() {
  const testimonials: Testimonial[] = useMemo(
    () => [
      {
        id: 't1',
        text:
          'Ati reușit să nu uitați cui va adresați. Multe persoane printre care mentori, traineri si foarte multi profesori, uită faptul că nu se adresează unor persoane cu același nivel de studii pe un anumit subiect, folosesc aceiași termeni "greoi", dar nu comunica pe înțelesul audienței. Da, e fain sa fim doctori într-un anumit domeniu, dar nu putem sa discutam la fel cu orice grup de oameni.',
        name: 'Maria',
        university: 'Universitatea de Vest Timișoara',
      },
      {
        id: 't2',
        text:
          'Experiența practicii a fost una foarte plăcută și utilă. Deși a existat mereu un cadru serios atunci când a fost nevoie, atmosfera a rămas prietenoasă și relaxată.',
        name: 'Mihai',
        university: 'Universitatea Petrol si Gaze Ploiești',
      },
      {
        id: 't3',
        text:
          'Practica a fost super dinamică și chiar interesantă. Atmosfera a fost mereu cozy și prietenoasă, ceea ce ne-a făcut să ne simțim confortabil să punem întrebări.',
        name: 'Laurentiu',
        university: 'Universitatea Politehnica București',
      },
      {
        id: 't4',
        text:
          'Mi-au plăcut mult activitățile practice, mai ales comunicatul de presă și proiectul final. Tot ce am făcut a fost relevant.',
        name: 'Nicoleta',
        university: 'Universitatea de Vest Timișoara',
      },
    ],
    []
  );

  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollOneCard = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;

    const card = el.querySelector<HTMLElement>('[data-card]');
    if (!card) return;

    el.scrollBy({
      left: dir * (card.offsetWidth + 16),
      behavior: 'smooth',
    });
  };

  return (
    <section className="mt-16">
      {/* CONTAINER ALBASTRU */}
      <div className="rounded-l border border-slate-200/60 bg-gradient-to-tl from-[rgba(234,241,255,0.44)] to-[rgba(234,241,255,0.96)] px-6 py-8 shadow-sm dark:border-slate-700/50 dark:from-[rgba(14,23,38,0.44)] dark:to-[#0E1726] md:px-10">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 md:text-xl">
            Testimoniale
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => scrollOneCard(-1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
            >
              ←
            </button>
            <button
              onClick={() => scrollOneCard(1)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow ring-1 ring-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700"
            >
              →
            </button>
          </div>
        </div>

        {/* SCROLLER */}
        <div
          ref={scrollerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {testimonials.map((t) => (
            <article
              key={t.id}
              data-card
              className="flex-shrink-0 snap-start w-[85%] sm:w-[60%] lg:w-[calc((100%-32px)/3)]"
            >
              {/* CARD ALB */}
              <div className="relative h-full rounded-l border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                {/* ICONITA DREAPTA SUS */}
                <div className="absolute right-4 top-4 text-primary/80 dark:text-primary/70">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.17 6A5.17 5.17 0 0 0 2 11.17V20h8v-8.83A5.17 5.17 0 0 0 4.83 6H7.17Zm12 0A5.17 5.17 0 0 0 14 11.17V20h8v-8.83A5.17 5.17 0 0 0 16.83 6h2.34Z" />
                  </svg>
                </div>

                {/* HEADER */}
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-sm">
                    <span className="text-sm font-bold">
                      {t.name.slice(0, 1).toUpperCase()}
                    </span>
                  </div>

                  <div className="leading-tight">
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t.name}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      {t.university}
                    </div>
                  </div>
                </div>

                {/* TEXT */}
                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {t.text}
                </p>

                {/* ACCENT JOS */}
                <div className="mt-4 h-[2px] w-10 rounded-full bg-gradient-to-r from-primary to-blue-500 opacity-70" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
