'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {TextStyle} from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import {IconAlignLeft} from '@/components/icon/icon-align-left';
import {IconAlignCenter} from '@/components/icon/icon-align-center';
import {IconAlignRight} from '@/components/icon/icon-align-right';
import {IconAlignJustify} from '@/components/icon/icon-align-justify';
import {IconListBullets} from '@/components/icon/icon-list-bullets';
import {IconListNumbered} from '@/components/icon/icon-list-numbered';
import {IconQuote} from '@/components/icon/icon-quote';

type EditorPaginaPublicaProps = {
  apiPath: string;
  headerTitle: string;
  headerSubtitle?: string;
  fallbackTitle?: string;
  publishable?: boolean; // default true
};

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

  // metadate
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [updatedByName, setUpdatedByName] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      Image,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'min-h-[300px] prose dark:prose-invert max-w-none focus:outline-none',
      },
    },
    immediatelyRender: false,
  });

  // sincronizam dropdown-ul cu selectia din editor
  useEffect(() => {
    if (!editor) return;

    const updateHeadingState = () => {
      if (editor.isActive('heading', { level: 1 })) return setCurrentBlock('h1');
      if (editor.isActive('heading', { level: 2 })) return setCurrentBlock('h2');
      if (editor.isActive('heading', { level: 3 })) return setCurrentBlock('h3');
      if (editor.isActive('heading', { level: 4 })) return setCurrentBlock('h4');
      return setCurrentBlock('p');
    };

    editor.on('selectionUpdate', updateHeadingState);
    editor.on('transaction', updateHeadingState);
    updateHeadingState();

    return () => {
      editor.off('selectionUpdate', updateHeadingState);
      editor.off('transaction', updateHeadingState);
    };
  }, [editor]);

  // load din API
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

    return (
      <div className="mb-3 flex flex-wrap gap-2 rounded border border-white-light bg-white px-2 py-2 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
        {/* heading */}
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

        {/* B I U S */}
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
          className={`btn btn-sm ${isActive('underline') ? 'btn-primary' : 'btn-outline-primary'}`}
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

        {/* colors */}
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

        {/* align */}
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

        {/* lists */}
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

        {/* quote */}
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

        {/* link */}
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

        {/* image (doar URL acum) */}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('URL imagine:');
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          }}
          className="btn btn-sm btn-outline-primary"
          title="Insereaza imagine (URL)"
        >
          🖼
        </button>
      </div>
    );
  };

  return (
    <div className="panel mt-6">
      {/* HEADER */}
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

      {/* MESAGES */}
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

      {/* FORM */}
      <div className="space-y-5">
        {/* titlu */}
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

        {/* editor */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
            Continut articol
          </label>
          <div className={loading ? 'pointer-events-none opacity-60' : ''}>
            <Toolbar />
            <div className="rounded border border-white-light bg-white p-3 dark:border-[#1b2e4b] dark:bg-[#0e1726]">
              <EditorContent editor={editor} />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            Poti formata textul, adauga titluri, liste, citate, linkuri si imagini.
          </p>
        </div>
      </div>
    </div>
  );
}

