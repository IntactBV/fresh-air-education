import ComponentsPagesFaqWithTabs from '@faComponents/pages/components-pages-faq-with-tabs';
import { type Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import IconArrowWaveLeftUp from '@/components/icon/icon-arrow-wave-left-up';

export const metadata: Metadata = {
  title: 'Prima pagina',
};

const Home = () => {
  return (
    <div>
      <div className="relative rounded-t-md bg-primary-light bg-[url('/assets/images/knowledge/pattern.png')] bg-contain bg-left-top bg-no-repeat px-5 py-10 dark:bg-black md:px-10">
        <div className="absolute -bottom-1 -end-6 hidden text-[#DBE7FF] rtl:rotate-y-180 dark:text-[#1B2E4B] lg:block xl:end-0">
          {/* decor svg neschimbat */}
          <svg width="375" height="185" viewBox="0 0 375 185" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-72 max-w-xs xl:w-full">
            {/* ...svg paths... */}
          </svg>
        </div>

        <div className="relative">
          <div className="flex flex-col items-center justify-center sm:-ms-32 sm:flex-row xl:-ms-60">
            <div className="mb-2 flex gap-1 text-end text-base leading-5 sm:flex-col xl:text-xl">
              <span>Resurse de ajutor</span>
              <span>pentru studenți & profesori</span>
            </div>
            <div className="me-4 ms-2 hidden text-[#0E1726] rtl:rotate-y-180 dark:text-white sm:block">
              <IconArrowWaveLeftUp className="w-16 xl:w-28" />
            </div>
            <div className="mb-2 text-center text-2xl font-bold dark:text-white md:text-5xl">
              Centrul de Ajutor
            </div>
          </div>

          <p className="mb-9 text-center text-base font-semibold">
            Caută răspunsuri rapide la întrebări despre Fresh Air Education
          </p>

          <form action="" method="" className="mb-6">
            <div className="relative mx-auto max-w-[580px]">
              <input
                type="text"
                placeholder="Caută un răspuns"
                className="form-input py-3 ltr:pr-[100px] rtl:pl-[100px]"
              />
              <button type="button" className="btn btn-primary absolute top-1 shadow-none ltr:right-1 rtl:left-1">
                Caută
              </button>
            </div>
          </form>

          <div className="flex flex-wrap items-center justify-center gap-2 font-semibold text-[#2196F3] sm:gap-5">
            <div className="whitespace-nowrap font-medium text-black dark:text-white">Teme populare :</div>
            <div className="flex items-center justify-center gap-2 sm:gap-5">
              <Link href="#" className="duration-300 hover:underline">Cont & autentificare</Link>
              <Link href="#" className="duration-300 hover:underline">Acces la materiale</Link>
              <Link href="#" className="duration-300 hover:underline">Cursuri & orar</Link>
              <Link href="#" className="duration-300 hover:underline">Abonamente & plăți</Link>
            </div>
          </div>
        </div>
      </div>

      <ComponentsPagesFaqWithTabs />

      <div className="mt-10 flex flex-col-reverse items-center justify-between gap-5 rounded-md bg-gradient-to-tl from-[rgba(234,241,255,0.44)] to-[rgba(234,241,255,0.96)] px-6 py-2.5 dark:from-[rgba(14,23,38,0.44)] dark:to-[#0E1726] md:flex-row lg:mt-20 xl:px-16">
        <div className="flex-1 py-3.5 text-center md:text-start">
          <h3 className="mb-2 text-xl font-bold dark:text-white md:text-2xl">Nu ai găsit un răspuns?</h3>
          <div className="text-lg font-medium text-white-dark">
            Spune-ne cu ce te putem ajuta. Echipa noastră îți răspunde pentru înscriere, acces la materiale, cont și plăți. Lorem ipsum dolor sit amet...
          </div>
          <div className="mt-8 flex justify-center md:justify-start lg:mt-16">
            <button type="button" className="btn btn-primary">
              Deschide un tichet
            </button>
          </div>
        </div>
        <div className="w-52 max-w-xs lg:w-full">
          <img
            src="/assets/images/knowledge/find-solution.svg"
            alt="find-solution"
            className="w-full object-cover rtl:rotate-y-180 dark:brightness-[2.59] dark:grayscale-[83%]"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
