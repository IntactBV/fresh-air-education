import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import PanouPrincipalAdminComponent from './panouPrincipalAdminComponent';

import { auth } from '@/utils/auth';
import { headers as getHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Panou principal',
};

export const dynamic = 'force-dynamic';

export default async function Page() {
  const hdrs = await getHeaders();

  const session = await auth.api.getSession({
    headers: hdrs,
  });

  if (!session) {
    redirect('/autentificare');
  }

  // construim URL absolut pentru API
  const host = hdrs.get('host');
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  const apiUrl = `${protocol}://${host}/api/admin/dashboard`;

  // chemam API-ul si propagam cookie-ul, ca sa poata ruta sa citeasca sesiunea
  const res = await fetch(apiUrl, {
    cache: 'no-store',
    headers: {
      cookie: hdrs.get('cookie') ?? '',
    },
  });

  let data: any = {};
  if (res.ok) {
    data = await res.json();
  }

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
          <span>Panou principal</span>
        </li>
      </ul>

      <PanouPrincipalAdminComponent
        // daca API-ul nu a reusit sa ia numele, il luam din session
        userName={data.currentUserName ?? session.user?.name ?? 'admin'}
        pendingRequestsCount={data.pendingRequestsCount ?? 0}
        enrolledStudentsCount={data.enrolledStudentsCount ?? 0}
        materialsCount={data.studentMaterialsCount ?? 0}
        articlesCount={data.publicDocumentsCount ?? 0}
        announcements={data.announcements ?? []}
        staticArticles={data.staticArticles ?? []}
      />
    </div>
  );
}
