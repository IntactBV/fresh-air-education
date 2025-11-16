import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import EditorPaginaPublica from '@/components/custom/EditorPaginaPublica';

export const metadata: Metadata = {
  title: 'Termeni si conditii',
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
          <span>Termeni si conditii</span>
        </li>
      </ul>

      <EditorPaginaPublica
        apiPath="/api/admin/public-pages/termeni-si-conditii"
        headerTitle="Termeni si conditii"
        headerSubtitle="Editeaza si publica termenii si conditiile."
        fallbackTitle="Termeni si conditii"
      />

    </div>
  );
}
