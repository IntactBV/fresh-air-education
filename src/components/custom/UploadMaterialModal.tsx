'use client';

import React, { Fragment, useMemo, useRef, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import IconX from '@/components/icon/icon-x';
import IconFolder from '@/components/icon/icon-folder';
import IconFile from '@/components/icon/icon-file';
import IconLock from '@/components/icon/icon-lock';
import { AccessEditor, type AccessValue } from './AccessEditor';

export type UploadResult = {
  file: File;
  category: { kind: 'existing'; name: string } | { kind: 'new'; name: string };
  access: AccessValue; // aici o să avem deja id-uri reale la seriesIds / studentIds
};

export function UploadMaterialModal({
  open,
  categories,
  series,
  students,
  onClose,
  onConfirm,
}: {
  open: boolean;
  categories: string[];
  // luăm seriile exact cum vin din /api/admin/series
  series: Array<{ id: string; name: string }>;
  students: { id: string; label: string }[];
  onClose: () => void;
  onConfirm: (res: UploadResult) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const [catMode, setCatMode] = useState<'existing' | 'new'>('existing');
  const [existingCat, setExistingCat] = useState<string>('');
  const [newCat, setNewCat] = useState<string>('');

  // în AccessEditor noi afișăm nume/label, dar vrem să reținem ID-urile
  const [access, setAccess] = useState<AccessValue>({
    all: false,
    seriesIds: [],
    studentIds: [],
  });

  const canSubmit = useMemo(() => {
    if (!file) return false;
    if (catMode === 'existing') return !!existingCat;
    return newCat.trim().length > 0;
  }, [file, catMode, existingCat, newCat]);

  const displayCategory = useMemo(() => {
    if (catMode === 'existing') return existingCat || '(select category)';
    return newCat.trim() || '(new category)';
  }, [catMode, existingCat, newCat]);

  const pickFile = () => fileInputRef.current?.click();

  // pentru AccessEditor are nevoie de "series" ca string[], dar noi avem {id,name}
  const seriesAsLabels = useMemo(() => series.map((s) => ({ id: s.id, label: s.name })), [series]);

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" open={open} onClose={onClose}>
        {/* overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-[999] bg-[black]/60" />
        </Transition.Child>

        <div className="fixed inset-0 z-[999] overflow-y-auto">
          <div className="flex min-h-screen items-start justify-center px-4 py-8">
            {/* panel */}
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="panel w-full max-w-4xl overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                {/* header */}
                <div className="flex items-center justify-between bg-[#fbfbfb] px-5 py-3 dark:bg-[#121c2c]">
                  <h5 className="text-lg font-bold">Incarcare material</h5>
                  <button onClick={onClose} type="button" className="text-white-dark hover:text-dark">
                    <IconX />
                  </button>
                </div>

                {/* body */}
                <div className="p-5">
                  <Tab.Group>
                    <Tab.List className="mb-4 flex flex-wrap border-b border-white-light dark:border-[#191e3a]">
                      {/* Tab 1: File & Category */}
                      <Tab as={Fragment}>
                        {({ selected }) => (
                          <button
                            type="button"
                            className={`-mb-[1px] inline-flex items-center gap-2 border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black ${
                              selected
                                ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black'
                                : ''
                            }`}
                          >
                            <IconFile className="h-4 w-4" />
                            <span>Fisier & Categorie</span>
                          </button>
                        )}
                      </Tab>

                      {/* Tab 2: Access (disabled until file chosen) */}
                      <Tab as={Fragment} disabled={!file}>
                        {({ selected }) => (
                          <button
                            type="button"
                            disabled={!file}
                            className={`-mb-[1px] inline-flex items-center gap-2 border border-transparent p-3.5 py-2 hover:text-primary dark:hover:border-b-black ${
                              selected
                                ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black'
                                : ''
                            } ${!file ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            <IconLock className="h-4 w-4" />
                            <span>Acces</span>
                          </button>
                        )}
                      </Tab>
                    </Tab.List>

                    <Tab.Panels>
                      {/* TAB 1: Fisier & Categorie */}
                      <Tab.Panel>
                        <div className="grid gap-6 md:grid-cols-2">
                          {/* Uploader */}
                          <section className="space-y-2">
                            <div className="text-xs font-medium uppercase text-muted-foreground">Fisier</div>
                            {!file ? (
                              <div className="rounded-lg border border-dashed border-white-light/60 p-4 text-center dark:border-white/10">
                                <p className="mb-3 text-sm text-white-dark">
                                  Selecteaza un fisier. Numele fisierului va deveni numele documentului.
                                </p>
                                <button type="button" className="btn btn-primary" onClick={pickFile}>
                                  Alege fisier
                                </button>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0] || null;
                                    setFile(f);
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="rounded-lg border border-white-light/60 p-3 dark:border-white/10">
                                <div className="flex items-start gap-3">
                                  <div className="grid h-10 w-10 shrink-0 place-content-center rounded bg-white-light/60 dark:bg-white/10">
                                    <span className="text-xs font-semibold">
                                      {(file.name.split('.').pop() || '').toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-medium" title={file.name}>
                                      {file.name}
                                    </div>
                                    <div className="text-xs text-white-dark">
                                      {(file.size / 1024).toFixed(1)} KB
                                    </div>
                                  </div>
                                  <button className="btn btn-outline-primary" onClick={() => setFile(null)}>
                                    Schimba
                                  </button>
                                </div>
                              </div>
                            )}
                          </section>

                          {/* Categorie */}
                          <section className="space-y-3">
                            <div className="text-xs font-medium uppercase text-muted-foreground">Categorie</div>

                            <div className="flex flex-col gap-3">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="catMode"
                                  checked={catMode === 'existing'}
                                  onChange={() => setCatMode('existing')}
                                />
                                <span>Foloseste o categorie existenta</span>
                              </label>
                              <div
                                className={`flex items-center gap-2 ${
                                  catMode !== 'existing' ? 'opacity-50' : ''
                                }`}
                              >
                                <IconFolder className="h-4 w-4 text-primary" />
                                <select
                                  className="form-select w-full sm:w-72"
                                  disabled={catMode !== 'existing'}
                                  value={existingCat}
                                  onChange={(e) => setExistingCat(e.target.value)}
                                >
                                  <option value="">(fara categorie)</option>
                                  {categories.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>

                              <label className="mt-2 flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="catMode"
                                  checked={catMode === 'new'}
                                  onChange={() => setCatMode('new')}
                                />
                                <span>Creeaza categorie noua</span>
                              </label>
                              <div className={`flex items-center gap-2 ${catMode !== 'new' ? 'opacity-50' : ''}`}>
                                <IconFolder className="h-4 w-4 text-primary" />
                                <input
                                  className="form-input w-full sm:w-72"
                                  placeholder="Nume categorie (ex. Curs)"
                                  disabled={catMode !== 'new'}
                                  value={newCat}
                                  onChange={(e) => setNewCat(e.target.value)}
                                />
                              </div>
                            </div>
                          </section>
                        </div>
                      </Tab.Panel>

                      {/* TAB 2: Acces */}
                      <Tab.Panel>
                        <div className="mb-4 rounded-lg border border-white/20 p-3 dark:border-white/10">
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="inline-flex items-center gap-2">
                              <IconFile className="h-4 w-4 text-primary" />
                              <span className="max-w-[32ch] truncate font-medium" title={file?.name || ''}>
                                {file?.name || '(no file)'}
                              </span>
                            </div>
                            <span className="opacity-60">|</span>
                            <div className="inline-flex items-center gap-2">
                              <IconFolder className="h-4 w-4 text-primary" />
                              <span className="max-w-[24ch] truncate" title={displayCategory}>
                                {displayCategory}
                              </span>
                            </div>
                          </div>
                        </div>

                        <AccessEditor
                          value={access}
                          onChange={(val) => {
                            // pastram exact id-urile primite din AccessEditor
                            setAccess(val);
                          }}
                          // ii dam serii ca lista de optiuni
                          series={seriesAsLabels.map((s) => s.label)}
                          students={students}
                        />
                      </Tab.Panel>
                    </Tab.Panels>
                  </Tab.Group>
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 border-t border-white-light px-5 py-3 dark:border-white/10">
                  <button className="btn btn-outline-danger" onClick={onClose}>
                    Renunta
                  </button>
                  <button
                    className="btn btn-primary"
                    disabled={!canSubmit}
                    onClick={() => {
                      if (!file) return;
                      const category =
                        catMode === 'existing'
                          ? { kind: 'existing' as const, name: existingCat || 'Neclasificate' }
                          : { kind: 'new' as const, name: newCat.trim() || 'Neclasificate' };

                      // access este deja în formatul pe care îl așteaptă componenta părinte
                      onConfirm({ file, category, access });
                    }}
                  >
                    Incarca
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
