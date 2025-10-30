'use client';

import React, { Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import IconX from '@/components/icon/icon-x';
import IconFolder from '@/components/icon/icon-folder';
import IconFile from '@/components/icon/icon-file';
import { AccessEditor, type AccessValue } from './AccessEditor';

export function ManageAccessModal({
  open,
  onClose,
  fileName,
  categoryName,
  series,
  students,
  value,
  onChange,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  fileName: string;
  categoryName: string;
  series: string[]; // codes
  students: { id: string; label: string }[];
  value: AccessValue;
  onChange: (v: AccessValue) => void;
  onSave: () => void;
}) {
  const banner = useMemo(
    () => (
      <div className="mb-4 rounded-lg border border-white/20 p-3 dark:border-white/10">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="inline-flex items-center gap-2">
            <IconFile className="h-4 w-4 text-primary" />
            <span className="font-medium truncate max-w-[32ch]" title={fileName}>
              {fileName}
            </span>
          </div>
          <span className="opacity-60">|</span>
          <div className="inline-flex items-center gap-2">
            <IconFolder className="h-4 w-4 text-primary" />
            <span className="truncate max-w-[24ch]" title={categoryName}>
              {categoryName}
            </span>
          </div>
        </div>
      </div>
    ),
    [fileName, categoryName]
  );

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
          <div className="fixed inset-0 bg-[black]/60 z-[999]" />
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
                  <h5 className="text-lg font-bold">Configureaza acces</h5>
                  <button onClick={onClose} type="button" className="text-white-dark hover:text-dark">
                    <IconX />
                  </button>
                </div>

                {/* body */}
                <div className="p-5">
                  {banner}
                  <AccessEditor
                    value={value}
                    onChange={onChange}
                    series={series}
                    students={students}
                  />
                </div>

                {/* footer */}
                <div className="flex items-center justify-end gap-2 border-t border-white-light px-5 py-3 dark:border-white/10">
                  <button className="btn btn-outline-danger" onClick={onClose}>Renunta</button>
                  <button className="btn btn-primary" onClick={onSave}>Salveaza</button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
