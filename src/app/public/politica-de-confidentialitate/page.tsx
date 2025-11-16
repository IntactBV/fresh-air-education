// src/app/public/termeni-si-conditii/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import PublicPageRenderer from '../PublicPageRenderer';

export const metadata: Metadata = {
  title: 'Politica de confidentialitate',
};

export default function Page() {
  return (
    <div>
      <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="/public" className="text-primary hover:underline">
            <IconHome className="h-4 w-4" />
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Politica de confidentialitate</span>
        </li>
      </ul>
      {/* <div className="w-full rounded-md border border-slate-200/50 bg-white px-10 py-12 shadow-sm dark:border-slate-700/40 dark:bg-slate-900"> */}

      <div className="w-full rounded-md border border-slate-200/50 bg-white px-16 py-12 shadow-sm dark:border-slate-700/40 dark:bg-slate-900">
        <PublicPageRenderer slug="politica-de-confidentialitate" />
      </div>
    </div>
  );
}
