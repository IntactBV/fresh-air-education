'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TiptapImage from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { IconAlignLeft } from '@/components/icon/icon-align-left';
import { IconAlignCenter } from '@/components/icon/icon-align-center';
import { IconAlignRight } from '@/components/icon/icon-align-right';
import { IconAlignJustify } from '@/components/icon/icon-align-justify';
import { IconListBullets } from '@/components/icon/icon-list-bullets';
import { IconListNumbered } from '@/components/icon/icon-list-numbered';
import { IconQuote } from '@/components/icon/icon-quote';

type EditorPaginaPublicaProps = {
  apiPath: string;
  headerTitle: string;
  headerSubtitle?: string;
  fallbackTitle?: string;
  publishable?: boolean;
};

type ImageAlignment = 'inline' | 'left' | 'right' | 'center';

type PublicPageImage = {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  uploadedAt: string;
};

const CustomImage = TiptapImage.extend({
  draggable: true,
  selectable: true,

  addAttributes() {
    const parent = (this as any).parent?.() || {};
    return {
      ...parent,
      width: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute('data-width') || element.style.width || null,
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.width) return {};
          return {
            'data-width': attributes.width,
          };
        },
      },
      alignment: {
        default: 'inline',
        parseHTML: (element: HTMLElement) => {
          const fromData = element.getAttribute('data-alignment');
          if (fromData === 'left' || fromData === 'right' || fromData === 'center' || fromData === 'inline') {
            return fromData as ImageAlignment;
          }

          const floatVal =
            (element.style as any).float ||
            (element.style as any).cssFloat ||
            '';

          if (floatVal === 'left' || floatVal === 'right') {
            return floatVal as ImageAlignment;
          }

          const textAlign = element.style.textAlign;
          if (textAlign === 'center') {
            return 'center';
          }

          return 'inline';
        },
  renderHTML: (attributes: Record<string, any>) => {
    if (!attributes.alignment || attributes.alignment === 'inline') {
      return {};
    }
    return {
      'data-alignment': attributes.alignment,
    };
  },
},

    };
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const attrs: Record<string, any> = { ...HTMLAttributes };
    const alignment = (attrs['data-alignment'] as ImageAlignment | undefined) || 'inline';
    const widthAttr = attrs['data-width'] as string | undefined;

    delete attrs['data-alignment'];
    delete attrs['data-width'];

    const baseStyle = 'max-width:100%;height:auto;vertical-align:middle;';
    let extraStyle = '';

    if (alignment === 'left') {
      extraStyle = 'float:left;margin-right:0.75rem;margin-bottom:0.5rem;';
    } else if (alignment === 'right') {
      extraStyle = 'float:right;margin-left:0.75rem;margin-bottom:0.5rem;';
    } else if (alignment === 'center') {
      extraStyle =
        'display:block;margin-left:auto;margin-right:auto;margin-top:0.5rem;margin-bottom:0.5rem;';
    } else {
      // alignment inline: imaginea ramane block by default,
      // dar se comporta mai "compact"
      extraStyle = 'display:inline-block;margin-top:0.25rem;margin-bottom:0.25rem;';
    }

    if (widthAttr) {
      extraStyle += `width:${widthAttr};`;
    }

    const style = attrs.style
      ? `${attrs.style};${baseStyle}${extraStyle}`
      : baseStyle + extraStyle;

    return ['img', { ...attrs, style }];
  },
});

export default function EditorPaginaPublica({
  apiPath,
  headerTitle,
  headerSubtitle = '',
  fallbackTitle = '',
  publishable = true,
}: EditorPaginaPublicaProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [currentBlock, setCurrentBlock] = useState<'p' | 'h1' | 'h2' | 'h3' | 'h4'>('p');

  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  const [imageSelected, setImageSelected] = useState(false);
  const [imageAlignment, setImageAlignment] = useState<ImageAlignment>('inline');

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageModalLoading, setImageModalLoading] = useState(false);
  const [imageModalError, setImageModalError] = useState<string | null>(null);
  const [pageImages, setPageImages] = useState<PublicPageImage[]>([]);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  const [showTitlePublic, setShowTitlePublic] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const pageSlug = useMemo(() => {
    const parts = apiPath.split('/');
    return parts[parts.length - 1] || null;
  }, [apiPath]);

  const openImageModal = async () => {
    if (!pageSlug) {
      setImageModalError('Slug indisponibil pentru pagina.');
      setImageModalOpen(true);
      return;
    }

    setImageModalOpen(true);
    setImageModalLoading(true);
    setImageModalError(null);

    try {
      const res = await fetch(`/api/admin/public-pages/images?slug=${encodeURIComponent(pageSlug)}`, {
        method: 'GET',
        cache: 'no-store',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Nu am putut incarca imaginile.');
      }

      const data = (await res.json()) as { images: PublicPageImage[] };
      setPageImages(data.images || []);
    } catch (e: any) {
      console.error(e);
      setImageModalError(e?.message || 'Eroare la incarcarea imaginilor.');
    } finally {
      setImageModalLoading(false);
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      CustomImage,
      TextAlign.configure({ types: ['heading', 'paragraph', 'image'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class:
          'page-editor-content min-h-[300px] prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;

    const updateHeadingState = () => {
      if (editor.isActive('heading', { level: 1 })) {
        setCurrentBlock('h1');
      } else if (editor.isActive('heading', { level: 2 })) {
        setCurrentBlock('h2');
      } else if (editor.isActive('heading', { level: 3 })) {
        setCurrentBlock('h3');
      } else if (editor.isActive('heading', { level: 4 })) {
        setCurrentBlock('h4');
      } else {
        setCurrentBlock('p');
      }

      const imgActive = editor.isActive('image');
      setImageSelected(imgActive);

      if (imgActive) {
        const attrs = editor.getAttributes('image') as { alignment?: ImageAlignment };
        setImageAlignment(attrs.alignment || 'inline');
      }
    };

    editor.on('selectionUpdate', updateHeadingState);
    editor.on('transaction', updateHeadingState);
    updateHeadingState();

    return () => {
      editor.off('selectionUpdate', updateHeadingState);
      editor.off('transaction', updateHeadingState);
    };
  }, [editor]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`${apiPath}?admin=true`, { cache: 'no-store' });
        if (!res.ok) throw new Error('Nu am putut incarca continutul.');

        const data = await res.json();

        setTitle(data.title ?? fallbackTitle ?? '');
        setIsPublished(Boolean(data.isPublished));
        setUpdatedAt(data.updatedAt ?? data.updated_at ?? null);
        setUpdatedByName(data.updatedByName ?? data.updated_by_name ?? null);
        setShowTitlePublic(
          data.showTitlePublic ??
          data.show_title_public ??
          true
        );

        if (editor && data.contentHtml) {
          editor.commands.setContent(data.contentHtml);
        }
      } catch (e: any) {
        console.error(e);
        setErrorMsg(e?.message || 'Eroare la incarcarea paginii.');
      } finally {
        setLoading(false);
      }
    })();
  }, [apiPath, editor, fallbackTitle]);

  const getContentHtml = () => (editor ? editor.getHTML() : '');

  const isValid =
    title.trim().length > 2 &&
    getContentHtml().replace(/<[^>]*>/g, '').trim().length > 5;

  const formatDate = (iso: string | null) => {
    if (!iso) return '';
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}.${mm}.${yyyy} ${hh}:${mi}`;
  };

  const handleUploadImage = async (file: File, options?: { insertIntoEditor?: boolean }) => {
    if (!editor) return;

    const insert = options?.insertIntoEditor ?? true;

    setErrorMsg(null);
    setSuccessMsg(null);
    setImageUploadLoading(true);

    const formData = new FormData();
    formData.append('file', file);
    if (pageSlug) formData.append('pageSlug', pageSlug);

    try {
      const res = await fetch('/api/admin/public-pages/upload-image', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Nu am putut incarca imaginea.');
      }

      const data = await res.json();

      const newImage: PublicPageImage = {
        id: data.id,
        url: data.url,
        filename: data.filename,
        mimeType: data.mimeType,
        byteSize: data.byteSize,
        uploadedAt: new Date().toISOString(),
      };

      setPageImages((prev) => [newImage, ...prev]);

      if (insert) {
        editor
          .chain()
          .focus()
          .setImage({
            src: data.url,
            alt: file.name,
          } as any)
          .updateAttributes('image', { alignment: 'inline' })
          .run();
      }
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Eroare la incarcarea imaginii.');
    } finally {
      setImageUploadLoading(false);
    }
  };

  const handleSave = async () => {
    if (!isValid) {
      setErrorMsg('Completeaza titlul si continutul paginii.');
      return;
    }
    setSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch(apiPath, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          contentHtml: getContentHtml(),
          isPublished,
          showTitlePublic
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error || 'Nu am putut salva pagina.');
      }
      const data = await res.json();
      setTitle(data.title ?? title);
      if (editor && data.contentHtml) {
        editor.commands.setContent(data.contentHtml);
      }
      setIsPublished(Boolean(data.isPublished));
      setUpdatedAt(data.updatedAt ?? data.updated_at ?? new Date().toISOString());
      setUpdatedByName(data.updatedByName ?? data.updated_by_name ?? null);
      setSuccessMsg('Pagina a fost salvata.');
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e?.message || 'Eroare la salvare.');
    } finally {
      setSaving(false);
    }
  };

  const Toolbar = () => {
    if (!editor) return null;

    const isActive = (name: string, attrs?: any) => editor.isActive(name, attrs);
    const isImageActive = imageSelected;

    const currentAlignment = imageAlignment;

    const updateImageAlignment = (alignment: ImageAlignment) => {
      if (!isImageActive) return;
      editor.chain().focus().updateAttributes('image', { alignment }).run();
    };

    const changeImageWidth = (delta: number) => {
      if (!isImageActive) return;
      const attrs = editor.getAttributes('image') as { width?: string };
      const current = attrs.width;
      let currentValue = 100;
      if (current && current.endsWith('%')) {
        const n = parseInt(current.replace('%', '').trim(), 10);
        if (!Number.isNaN(n)) currentValue = n;
      }
      let next = currentValue + delta;
      if (next < 10) next = 10;
      if (next > 200) next = 200;
      editor
        .chain()
        .focus()
        .updateAttributes('image', { width: `${next}%` })
        .run();
    };

    return (
      <div className="mb-3 flex flex-wrap gap-2 rounded border border-white-light bg-white px-2 py-2 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
        <select
          className="form-select w-36 text-sm"
          value={currentBlock}
          onChange={(e) => {
            const v = e.target.value as 'p' | 'h1' | 'h2' | 'h3' | 'h4';
            const chain = editor.chain().focus();
            if (v === 'p') chain.setParagraph().run();
            if (v === 'h1') chain.toggleHeading({ level: 1 }).run();
            if (v === 'h2') chain.toggleHeading({ level: 2 }).run();
            if (v === 'h3') chain.toggleHeading({ level: 3 }).run();
            if (v === 'h4') chain.toggleHeading({ level: 4 }).run();
            setCurrentBlock(v);
          }}
        >
          <option value="p">Paragraf</option>
          <option value="h1">Heading 1</option>
          <option value="h2">Heading 2</option>
          <option value="h3">Heading 3</option>
          <option value="h4">Heading 4</option>
        </select>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`btn btn-sm ${isActive('bold') ? 'btn-primary' : 'btn-outline-primary'}`}
          title="Bold"
        >
          <span className="font-semibold">B</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`btn btn-sm ${isActive('italic') ? 'btn-primary' : 'btn-outline-primary'}`}
          title="Italic"
        >
          <span className="italic">I</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`btn btn-sm ${
            isActive('underline') ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Underline"
        >
          <span className="underline">U</span>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`btn btn-sm ${isActive('strike') ? 'btn-primary' : 'btn-outline-primary'}`}
          title="Strike"
        >
          <span className="line-through">S</span>
        </button>

        <label className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-xs dark:bg-slate-800/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-300">Text</span>
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        <label className="flex items-center gap-1 rounded bg-slate-50 px-2 py-1 text-xs dark:bg-slate-800/40">
          <span className="text-[11px] text-slate-500 dark:text-slate-300">Fundal</span>
          <input
            type="color"
            onChange={(e) =>
              editor.chain().focus().setHighlight({ color: e.target.value }).run()
            }
            className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
          />
          <button
            type="button"
            onClick={() => editor.chain().focus().unsetHighlight().run()}
            className="rounded px-1 text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white"
            title="Fara fundal"
          >
            ✕
          </button>
        </label>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`btn btn-sm ${
            editor.isActive({ textAlign: 'left' }) ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Aliniere stanga"
        >
          <IconAlignLeft />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`btn btn-sm ${
            editor.isActive({ textAlign: 'center' }) ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Aliniere centru"
        >
          <IconAlignCenter />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`btn btn-sm ${
            editor.isActive({ textAlign: 'right' }) ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Aliniere dreapta"
        >
          <IconAlignRight />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`btn btn-sm ${
            editor.isActive({ textAlign: 'justify' }) ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Justify"
        >
          <IconAlignJustify />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`btn btn-sm ${
            isActive('bulletList') ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Lista cu puncte"
        >
          <IconListBullets />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`btn btn-sm ${
            isActive('orderedList') ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Lista numerotata"
        >
          <IconListNumbered />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`btn btn-sm ${
            isActive('blockquote') ? 'btn-primary' : 'btn-outline-primary'
          }`}
          title="Citat"
        >
          <IconQuote />
        </button>

        <button
          type="button"
          onClick={() => {
            const previousUrl = editor.getAttributes('link').href;
            const url = window.prompt('Introdu URL-ul', previousUrl || '');
            if (url === null) return;
            if (url === '') {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              return;
            }
            editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
          }}
          className={`btn btn-sm ${isActive('link') ? 'btn-primary' : 'btn-outline-primary'}`}
          title="Link"
        >
          🔗
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              void handleUploadImage(file);
            }
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
            }
          }}
        />

        <button
          type="button"
          onClick={() => openImageModal()}
          className="btn btn-sm btn-outline-primary"
          title="Adauga imagine"
        >
          🖼
        </button>

        <div className="ml-2 flex flex-wrap items-center gap-2 rounded bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/40">
          <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
            Imagine selectata:
          </span>

          {/* aliniere */}
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              className={`btn btn-sm ${
                !isImageActive
                  ? 'btn-outline-dark'
                  : currentAlignment === 'inline'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              disabled={!isImageActive}
              onClick={() => updateImageAlignment('inline')}
            >
              In linie cu textul
            </button>

            <button
              type="button"
              className={`btn btn-sm ${
                !isImageActive
                  ? 'btn-outline-dark'
                  : currentAlignment === 'left'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              disabled={!isImageActive}
              onClick={() => updateImageAlignment('left')}
            >
              Text in dreapta
            </button>

            <button
              type="button"
              className={`btn btn-sm ${
                !isImageActive
                  ? 'btn-outline-dark'
                  : currentAlignment === 'right'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              disabled={!isImageActive}
              onClick={() => updateImageAlignment('right')}
            >
              Text in stanga
            </button>

            <button
              type="button"
              className={`btn btn-sm ${
                !isImageActive
                  ? 'btn-outline-dark'
                  : currentAlignment === 'center'
                  ? 'btn-primary'
                  : 'btn-outline-primary'
              }`}
              disabled={!isImageActive}
              onClick={() => updateImageAlignment('center')}
            >
              Centrata
            </button>
          </div>

          <span className="mx-1 h-4 w-px bg-slate-300 dark:bg-slate-600" />

          {/* dimensiune */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Dimensiune:
            </span>
            <button
              type="button"
              className={`btn btn-sm ${
                isImageActive ? 'btn-outline-primary' : 'btn-outline-dark'
              }`}
              disabled={!isImageActive}
              onClick={() => changeImageWidth(-10)}
            >
              −
            </button>
            <button
              type="button"
              className={`btn btn-sm ${
                isImageActive ? 'btn-outline-primary' : 'btn-outline-dark'
              }`}
              disabled={!isImageActive}
              onClick={() => changeImageWidth(10)}
            >
              +
            </button>
          </div>
        </div>


      </div>
    );
  };

  return (
    <div className="panel mt-6">
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{headerTitle}</h2>
          {headerSubtitle ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">{headerSubtitle}</p>
          ) : null}
        </div>
        <div className="flex flex-col items-start gap-2 md:items-end">
          <div className="flex items-center gap-3">
            {publishable ? (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                />
                <span>Publica articolul</span>
              </label>
            ) : null}
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={showTitlePublic}
                onChange={(e) => setShowTitlePublic(e.target.checked)}
              />
              <span>Afiseaza titlul in pagina publica</span>
            </label>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Se salveaza...' : 'Salveaza'}
            </button>
          </div>
          {(updatedAt || updatedByName) && (
            <p className="text-right text-xs text-gray-400 dark:text-gray-500">
              Ultima modificare: {updatedAt ? formatDate(updatedAt) : '—'}
              {updatedByName ? ` · de ${updatedByName}` : ''}
            </p>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 rounded border border-danger/20 bg-danger/10 px-4 py-3 text-danger dark:border-danger/30 dark:bg-danger/15">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded border border-success/20 bg-success/10 px-4 py-3 text-success dark:border-success/30 dark:bg-success/15">
          {successMsg}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Titlu articol
          </label>
          <input
            type="text"
            className="form-input w-full"
            placeholder={fallbackTitle || headerTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={loading}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Continut articol
          </label>
          <div className={loading ? 'pointer-events-none opacity-60' : ''}>
            <Toolbar />
            <div className="rounded border border-white-light bg-white p-3 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
              <EditorContent editor={editor} />
              <style>{`
                .page-editor-content img.ProseMirror-selectednode {
                  outline: 2px solid #3b82f6;
                  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.4);
                  border-radius: 4px;
                }
              `}</style>
            </div>

            {imageModalOpen && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
              <div className="panel w-full max-w-5xl rounded-xl border-0 bg-white p-0 text-black shadow-2xl dark:bg-[#0e1726] dark:text-white-dark">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
                  <h3 className="text-base font-semibold">Imagini pentru pagina</h3>
                  <button
                    type="button"
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
                    onClick={() => setImageModalOpen(false)}
                  >
                    ✕
                  </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                  {imageModalError && (
                    <div className="rounded-md border border-danger/20 bg-danger/10 px-4 py-3 text-xs text-danger dark:border-danger/30 dark:bg-danger/15">
                      {imageModalError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Selecteaza o imagine existenta sau incarca una noua.
                    </p>
                    <div className="flex items-center gap-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            void handleUploadImage(f, { insertIntoEditor: false });
                          }
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={imageUploadLoading}
                      >
                        {imageUploadLoading ? 'Se incarca...' : 'Incarca imagine noua'}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-[520px] overflow-auto rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                    {imageModalLoading ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Se incarca imaginile...
                      </p>
                    ) : pageImages.length === 0 ? (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Nu exista inca imagini pentru aceasta pagina.
                      </p>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                        {pageImages.map((img) => (
                          <button
                            key={img.id}
                            type="button"
                            className="group flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-left text-xs hover:border-primary hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/40 dark:hover:border-primary/80"
                            onClick={() => {
                              if (!editor) return;
                              editor
                                .chain()
                                .focus()
                                .setImage({
                                  src: img.url,
                                  alt: img.filename,
                                } as any)
                                .updateAttributes('image', { alignment: 'inline' })
                                .run();
                              setImageModalOpen(false);
                            }}
                          >
                            <div className="flex-1 overflow-hidden bg-white dark:bg-slate-900">
                              <img
                                src={img.url}
                                alt={img.filename}
                                className="h-40 w-full object-contain transition-transform group-hover:scale-[1.03]"
                              />
                            </div>
                            <div className="border-t border-slate-200 px-3 py-2 text-[11px] leading-snug dark:border-slate-700">
                              <div className="truncate font-medium">{img.filename}</div>
                              <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                                {Math.round(img.byteSize / 1024)} kB
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 px-6 py-4 dark:border-slate-700">
                  <button
                    type="button"
                    className="btn btn-outline-dark"
                    onClick={() => setImageModalOpen(false)}
                  >
                    Inchide
                  </button>
                </div>
              </div>
            </div>
          )}

          </div>
          <p className="mt-2 text-xs text-gray-400">
            Poti formata textul, adauga titluri, liste, citate, linkuri si imagini.
          </p>
        </div>
      </div>
    </div>
  );
}
