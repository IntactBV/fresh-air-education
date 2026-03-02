// src/components/master-header.tsx
'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';

export const MasterHeader = () => {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--master-header-h', `${Math.ceil(h)}px`);
    };

    setVar();

    const ro = new ResizeObserver(() => setVar());
    ro.observe(el);

    window.addEventListener('resize', setVar);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="master-header"
    >
      <div className="mx-auto max-w-screen-xl px-4 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          {/* Left */}
          <div className="flex items-center gap-3 md:gap-4">
            <Image
              src="/assets/images/eu-flag.png"
              alt="Drapelul Uniunii Europene"
              width={96}
              height={64}
              priority
            />
            <h3 className="text-base font-bold leading-tight md:text-2xl">
              Cofinanțat de
              <br className="hidden sm:block" />
              Uniunea Europeană
            </h3>
          </div>

          {/* Right */}
          <div className="flex items-center justify-between gap-3 md:justify-end md:gap-4">
            <h3 className="text-xs leading-tight sm:text-sm md:text-base md:text-right">
              <strong>FRESH TECH - Tehnologii și educație pentru studenți</strong>
              <br />
              Cod SMIS: <b>317582</b>
              <br />
              Denumirea beneficiarului: <b>Fresh Air SRL</b>
            </h3>

            <Image
              src="/assets/images/guvern-ro.svg"
              alt="Guvernul României"
              width={80}
              height={80}
              priority
            />

          </div>
        </div>
      </div>
    </header>
  );
};
