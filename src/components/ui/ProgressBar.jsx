import React from 'react';

const ACCENTS = {
  emerald: 'bg-emerald-400',
  violet: 'bg-violet-400',
};

export function ProgressBar({ value, label, accent = 'emerald' }) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-sm text-neutral-400">
        <span>{label}</span>
        <span className="font-semibold text-neutral-200">{width}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${ACCENTS[accent]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
