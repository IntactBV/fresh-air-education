'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import 'quill/dist/quill.snow.css';

type Category = { id: string; name: string; slug: string };

type QuillEditorProps = {
  value: string;
  onChange: (html: string) => void;
  modules?: any;
  placeholder?: string;
};

function QuillEditor({ value, onChange, modules, placeholder }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const quillRef = useRef<any>(null);
  const initialValueRef = useRef<string>(value);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { default: Quill } = await import('quill'); // dinamic, doar client
      if (!mounted || !editorRef.current) return;

      // init Quill
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: modules ?? {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
          ],
        },
        placeholder,
      });

      // setează conținutul inițial
      if (initialValueRef.current) {
        quillRef.current.root.innerHTML = initialValueRef.current;
      }

      // listener schimbări
      quillRef.current.on('text-change', () => {
        const html = quillRef.current.root.innerHTML;
        onChange(html);
      });
    })();

    return () => {
      mounted = false;
      // Quill nu are un destroy public, dar dereferențiem ca să eliberăm GC
      quillRef.current = null;
    };
  }, [modules, onChange, placeholder]);

  // dacă value se schimbă din exterior, sincronizează (evită loop)
  useEffect(() => {
    const q = quillRef.current;
    if (q && value !== q.root.innerHTML) {
      const sel = q.getSelection();
      q.root.innerHTML = value || '';
      if (sel) q.setSelection(sel); // păstrează poziția cursorului
    }
  }, [value]);

  return (
    <div className="[&_.ql-toolbar]:rounded-t [&_.ql-toolbar]:border [&_.ql-toolbar]:border-white-light [&_.ql-toolbar]:dark:border-[#1b2e4b] [&_.ql-container]:border [&_.ql-container]:border-white-light [&_.ql-container]:dark:border-[#1b2e4b] [&_.ql-container]:rounded-b">
      <div ref={editorRef} />
    </div>
  );
}

// --- Date mock pentru categorii ---
const initialCategories: Category[] = [
  { id: 'cat-1', name: 'Anunțuri', slug: 'anunturi' },
  { id: 'cat-2', name: 'Ghiduri', slug: 'ghiduri' },
];

export default function AdaugaArticol() {
  // form state
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState<string>(''); // HTML
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [categoryId, setCategoryId] = useState<string>('');
  const [creatingCat, setCreatingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const isValid = useMemo(
    () =>
      title.trim().length > 2 &&
      content.replace(/<[^>]*>/g, '').trim().length > 8 &&
      (!!categoryId || (creatingCat && newCatName.trim().length > 1)),
    [title, content, categoryId, creatingCat, newCatName]
  );

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link'],
        ['clean'],
      ],
    }),
    []
  );

  function slugify(s: string) {
    return s.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  }

  function handleCreateCategory() {
    const name = newCatName.trim();
    if (!name) return;
    const slug = slugify(name);
    const exists = categories.find((c) => c.slug === slug);
    if (exists) {
      setCategoryId(exists.id);
      setCreatingCat(false);
      setNewCatName('');
      return;
    }
    const newCat = { id: `cat-${Date.now()}`, name, slug };
    setCategories([newCat, ...categories]);
    setCategoryId(newCat.id);
    setCreatingCat(false);
    setNewCatName('');
  }

  function handlePublish() {
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const payload = {
      id: `art-${Date.now()}`,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content, // HTML din Quill
      author: 'Admin',
      publishedAt: new Date().toISOString(),
      categoryId: selectedCategory?.id ?? null,
      categoryName: selectedCategory?.name ?? null,
      status: 'published' as const,
    };
    alert(`Publicare articol (mock):\n${JSON.stringify(payload, null, 2)}`);
    setTitle('');
    setExcerpt('');
    setContent('');
  }

  return (
    <div className="w-full rounded border border-white-light bg-white shadow-[4px_6px_10px_-3px_#bfc9d4] dark:border-[#1b2e4b] dark:bg-[#191e3a] dark:shadow-none">
      <div className="p-6 space-y-6">
        {/* Titlu */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Titlu
          </label>
          <input
            type="text"
            className="form-input w-full"
            placeholder="ex: Anunț important pentru studenți"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {title.trim().length > 0 && title.trim().length <= 2 && (
            <p className="mt-1 text-xs text-red-500">
              Titlul trebuie să aibă cel puțin 3 caractere.
            </p>
          )}
        </div>

        {/* Rezumat */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Rezumat (opțional)
          </label>
          <textarea
            className="form-textarea w-full"
            rows={3}
            placeholder="Scurt rezumat pentru listare..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>

        {/* Categorie + creare nouă */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
              Categorie
            </label>
            <select
              className="form-select w-full"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={creatingCat}
            >
              <option value="">— selectează —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            {!creatingCat ? (
              <button
                type="button"
                className="btn btn-outline-primary w-full sm:w-auto"
                onClick={() => setCreatingCat(true)}
              >
                Creează categorie nouă
              </button>
            ) : (
              <>
                <div className="flex-1">
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    Nume categorie nouă
                  </label>
                  <input
                    type="text"
                    className="form-input w-full"
                    placeholder="ex: Evenimente"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                  />
                </div>
                <div className="pb-0.5 flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleCreateCategory}
                    disabled={newCatName.trim().length < 2}
                  >
                    Adaugă
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => {
                      setCreatingCat(false);
                      setNewCatName('');
                    }}
                  >
                    Anulează
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Editor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Conținut articol
          </label>
          <QuillEditor
            value={content}
            onChange={setContent}
            modules={modules}
            placeholder="Scrie conținutul articolului aici..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handlePublish}
            disabled={!isValid}
            title={!isValid ? 'Completează titlul, conținutul și categoria.' : 'Publică articol'}
          >
            Publică articol
          </button>
        </div>
      </div>
    </div>
  );
}
