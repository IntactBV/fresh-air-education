import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import StudentiInscrisiComponent from '@/components/custom/studentiInscrisiComponent';

export const metadata: Metadata = {
  title: 'Studenti inscrisi',
};

type Params = { studentId: string };

export default async function Page({ params }: { params: Params }) {
  return (
    <div>
      {/* breadcrumb */}
      <ul className="mb-6 flex space-x-2 rtl:space-x-reverse">
        <li>
          <Link href="/tutore" className="text-primary hover:underline">
            <IconHome className="h-4 w-4" />
          </Link>
        </li>
        <li className="before:content-['/'] ltr:before:mr-2 rtl:before:ml-2">
            Studenti inscrisi
        </li>
      </ul>

      <StudentiInscrisiComponent baseFolder="tutore" />
    </div>
  );
}
