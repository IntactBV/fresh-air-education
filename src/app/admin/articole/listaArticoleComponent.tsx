'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import IconBellBing from '@/components/icon/icon-bell-bing';
import IconBook from '@/components/icon/icon-book';

type Article = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  category: 'Anunțuri' | 'Ghiduri';
};

const ARTICLES: Article[] = [
  {
    id: 'art-1',
    title: 'Program secretariat în sesiune',
    excerpt:
      'În perioada sesiunii, programul cu studenții se modifică. Iată intervalele complete.',
    author: 'Admin',
    publishedAt: '2025-10-04T09:30:00Z',
    category: 'Anunțuri',
  },
  {
    id: 'art-2',
    title: 'Întrerupere serviciu — 12 octombrie',
    excerpt:
      'Duminică, 12 octombrie, între 02:00–04:00, platforma va fi indisponibilă pentru mentenanță.',
    author: 'Admin',
    publishedAt: '2025-10-02T18:00:00Z',
    category: 'Anunțuri',
  },
  {
    id: 'art-3',
    title: 'Ghid: cum încarci materialele pentru curs',
    excerpt:
      'Pași rapizi pentru a publica fișierele de curs și a seta accesul pe serii.',
    author: 'Editor',
    publishedAt: '2025-09-28T12:00:00Z',
    category: 'Ghiduri',
  },
  {
    id: 'art-4',
    title: 'Ghid: cum îți actualizezi datele personale',
    excerpt:
      'Unde găsești „Datele mele” și cum modifici numărul de telefon, emailul sau parola.',
    author: 'Editor',
    publishedAt: '2025-09-26T08:15:00Z',
    category: 'Ghiduri',
  },
];

function formatDateRo(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ro-RO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ListaArticole() {
  const grouped = useMemo(() => {
    const byCat: Record<string, Article[]> = { Anunțuri: [], Ghiduri: [] };
    for (const a of ARTICLES) byCat[a.category].push(a);
    Object.keys(byCat).forEach((k) =>
      byCat[k].sort(
        (a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt)
      )
    );
    return byCat;
  }, []);

  return (
    <div className="space-y-8">
      {/* CARD: ANUNȚURI */}
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="p-6">
          {/* header categorie */}
          <div className="mb-6 flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <IconBellBing className="h-7 w-7 text-primary" />
            </div>
            <h2 className="ml-4 text-xl font-semibold text-primary">Anunțuri</h2>
          </div>

          {/* lista articole */}
          <div className="space-y-6">
            {grouped['Anunțuri'].map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row">
                <div className="ltr:mr-4 rtl:ml-4 flex justify-center sm:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                    <IconBellBing className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="mb-1 text-lg font-semibold text-primary">
                    {a.title}
                  </h3>
                  <p className="text-[0.95rem] leading-6 text-gray-700 dark:text-gray-300">
                    {a.excerpt}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Publicat pe {formatDateRo(a.publishedAt)} • de {a.author}
                  </div>
                  <div className="mt-3 flex justify-center sm:justify-end">
                    <Link
                      href={`/admin/articole/${a.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Vezi articol complet
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CARD: GHIDURI */}
      <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
        <div className="p-6">
          {/* header categorie */}
          <div className="mb-6 flex items-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <IconBook className="h-7 w-7 text-primary" />
            </div>
            <h2 className="ml-4 text-xl font-semibold text-primary">Ghiduri</h2>
          </div>

          {/* lista articole */}
          <div className="space-y-6">
            {grouped['Ghiduri'].map((a) => (
              <div key={a.id} className="flex flex-col sm:flex-row">
                <div className="ltr:mr-4 rtl:ml-4 flex justify-center sm:block">
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-primary/10">
                    <IconBook className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="mb-1 text-lg font-semibold text-primary">
                    {a.title}
                  </h3>
                  <p className="text-[0.95rem] leading-6 text-gray-700 dark:text-gray-300">
                    {a.excerpt}
                  </p>
                  <div className="mt-2 text-xs text-gray-500">
                    Publicat pe {formatDateRo(a.publishedAt)} • de {a.author}
                  </div>
                  <div className="mt-3 flex justify-center sm:justify-end">
                    <Link
                      href={`/admin/articole/${a.id}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      Vezi articol complet
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
