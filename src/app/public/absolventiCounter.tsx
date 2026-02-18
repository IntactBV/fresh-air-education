import React from 'react';
import IconAward from '@/components/icon/icon-award';

type Props = {
  current: number;
  total: number;
  label?: string;
};

export default function AbsolventiCounter({
  current,
  total,
  label = 'Studenti inscrisi',
}: Props) {
  const pct =
    total > 0 ? Math.max(0, Math.min(100, (current / total) * 100)) : 0;

  return (
    <div
      className="
        inline-flex items-center gap-4
        rounded-2xl
        bg-white/10
        px-6 py-4
        backdrop-blur-md
        ring-1 ring-white/15
        dark:bg-black/25 dark:ring-white/10
      "
    >
      <div
        className="
          flex h-12 w-12 items-center justify-center
          rounded-full
          bg-gradient-to-r from-primary to-blue-500
          text-white shadow-md
        "
      >
        <IconAward className="h-6 w-6" />
      </div>

      <div className="min-w-[180px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/60">
              {label}
            </div>

            <div className="mt-1 text-2xl font-bold text-white tabular-nums leading-none">
              {current}
              <span className="mx-2 text-white/40">/</span>
              <span className="text-white/70">{total}</span>
            </div>
          </div>

          <div
            className="
              inline-flex items-center justify-center
              rounded-full
              px-2.5 py-1
              text-xs font-semibold
              text-primary/90
            "
          >
            {pct < 1 && pct > 0 ? '<1%' : `${Math.round(pct)}%`}
          </div>

        </div>

        <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
          <div
            className="h-1.5 rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
