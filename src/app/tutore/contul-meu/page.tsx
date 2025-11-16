import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import ContulMeuComponent from '@/app/edu/contul-meu/contulMeuComponent';
import { auth } from "@/utils/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: 'Contul meu',
};

export default async function Page() {
    const session = await auth.api.getSession({
      headers: await headers()
    })
  const user = session?.user
    ? {
        ...session.user,
        role: typeof session.user.role === 'string' ? session.user.role : '',
      }
    : {
        name: '',
        email: '',
        role: '',
        id: '',
      };

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
          <span>Contul meu</span>
        </li>
      </ul>

      <ContulMeuComponent user={user} />
    </div>
  );
}
