import type { Metadata } from 'next';
import Link from 'next/link';
import IconHome from '@faComponents/icon/icon-home';
import EditorPaginaPublica from '@/components/custom/EditorPaginaPublica';

export const metadata: Metadata = {
  title: 'Politica de confidentialitate',
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
          <span>Politica de confidentialitate</span>
        </li>
      </ul>

      <EditorPaginaPublica
        apiPath="/api/admin/public-pages/politica-de-confidentialitate"
        headerTitle="Politica de confidentialitate"
        headerSubtitle="Editeaza si publica politica de confidentialitate."
        fallbackTitle="Politica de confidentialitate"
      />

    </div>
  );
}
