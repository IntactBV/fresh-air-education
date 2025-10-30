import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@/components/icon/icon-home';
import CerereDetaliiComponent from './cerereDetaliiComponent';

export const metadata: Metadata = {
  title: 'Detalii cerere de înscriere',
};

export default async function Page() {
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
          <Link href="/admin/cereri-in-asteptare" className="text-primary hover:underline">
            Cereri de inscriere in asteptare
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
          <span>Detalii cerere</span>
        </li>
      </ul>

      <CerereDetaliiComponent />
    </div>
  );
}
