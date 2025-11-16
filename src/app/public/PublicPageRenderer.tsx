'use client';

import { useEffect, useState } from 'react';

type PublicPage = {
  title: string | null;
  contentHtml: string | null;
  showTitlePublic: boolean;
};

export default function PublicPageRenderer({ slug }: { slug: string }) {
  const [data, setData] = useState<PublicPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPage = async () => {
      try {
        const res = await fetch(`/api/admin/public-pages/${slug}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('failed');
        const json = await res.json();
        setData({
          title: json.title,
          contentHtml: json.contentHtml,
          showTitlePublic: json.showTitlePublic ?? true,
        });
      } catch {
        setData({ title: null, contentHtml: null, showTitlePublic: true });
      } finally {
        setLoading(false);
      }
    };
    loadPage();
  }, [slug]);

  if (loading) {
    return <div className="text-slate-500 text-center py-20">Se incarca continutul...</div>;
  }

  if (!data?.contentHtml) {
    return (
      <div className="text-slate-500 py-20 text-center">
        Acest document nu este disponibil public inca.
      </div>
    );
  }

  return (
    <div>
      {data.showTitlePublic && data.title && (
        <h1 className="mb-8 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          {data.title}
        </h1>
      )}
      <article
        className="prose max-w-none prose-headings:scroll-mt-20 dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: data.contentHtml }}
      />
    </div>
  );
}
