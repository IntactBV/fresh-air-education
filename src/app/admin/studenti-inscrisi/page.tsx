import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import StudentiInscrisiComponent from './studentiInscrisiComponent';

export const metadata: Metadata = {
  title: 'Detalii student',
};

type Params = { studentId: string };

export default async function Page({ params }: { params: Params }) {
  const { studentId } = params;

  // TODO: fetch din API în loc de mock
  const student = {
    id: studentId,
    fullName: 'Popescu Andrei-Ionuț',
    email: 'andrei.popescu@student.univ.ro',
    cnp: '1234567890123',
    faculty: 'FMI — Universitatea București',
    program: 'Informatică',
    year: 'Anul 3',
    phone: '+40 712 345 678',
    address: 'Str. Exemplu 10, București',
    approvedAt: '2025-09-12T10:00:00.000Z',
    status: 'activ' as 'activ' | 'absolvent',
    // câmpuri suplimentare provenite din cererea în așteptare (exemplu):
    internshipPeriod: '01 iulie 2025 — 30 septembrie 2025',
    internshipCompany: 'Fresh Air Tech SRL',
    internshipMentor: 'Dragoș I.',
  };

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
            Studenti inscrisi
        </li>
      </ul>

      <StudentiInscrisiComponent />
    </div>
  );
}
