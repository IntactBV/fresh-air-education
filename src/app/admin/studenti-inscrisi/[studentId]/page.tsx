import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import StudentDetaliiComponent from '@/components/custom/studentDetaliiComponent';

export const metadata: Metadata = {
  title: 'Detalii student',
};

export default function Page() {
  return (
    <div>
      {/* breadcrumb */}
      <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="/admin" className="text-primary hover:underline">
            <IconHome className="h-4 w-4" />
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <Link href="/admin/studenti-inscrisi" className="text-primary hover:underline">
            Studenti inscrisi
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Detalii</span>
        </li>
      </ul>

      <StudentDetaliiComponent baseFolder="admin" />
    </div>
  );
}
