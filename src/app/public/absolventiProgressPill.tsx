import React from 'react';
import IconAward from '@/components/icon/icon-award';

type Props = {
  current: number;
  total: number;
  label?: string;
};

export default function AbsolventiProgressPill({
  current,
  total,
  label = 'Absolventi',
}: Props) {
  const pct =
    total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;

  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-white/60 bg-white/85 px-3 py-2 shadow-sm ring-1 ring-white/60 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/75 dark:ring-slate-700/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-primary to-blue-500 text-white shadow-sm">
        <IconAward className="h-5 w-5" />
      </div>

      <div className="min-w-[150px] sm:min-w-[170px]">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600 dark:text-slate-300">
            {label}
          </span>
          <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {current}
            <span className="mx-1 text-slate-400 dark:text-slate-500">/</span>
            {total}
          </span>
        </div>

        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200/80 dark:bg-slate-700/70">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-primary to-blue-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
