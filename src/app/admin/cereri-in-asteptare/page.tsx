import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import CereriInAsteptareComponent from './cereriInAsteptareComponent';

export const metadata: Metadata = {
  title: 'Cereri de inscriere in asteptare',
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
          <span>Cereri de inscriere in asteptare</span>
        </li>
      </ul>

      <CereriInAsteptareComponent />
    </div>
  );
}
