import React from 'react';

const ACCENTS = {
  emerald: 'bg-neon-green',
  warning: 'bg-neon-red',
};

export function ProgressBar({ value, label, accent = 'emerald' }) {
  const width = Math.min(100, Math.max(0, value));

  return (
    <div>
      <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.45em] text-neutral-400">
        <span>{label}</span>
        <span className="text-neon-green tabular-nums">{width}%</span>
      </div>
      <div className="mt-3 h-3 overflow-hidden border border-neutral-800 bg-black/60">
        <div
          className={`h-full transition-all duration-500 ease-out ${ACCENTS[accent] ?? ACCENTS.emerald}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}
