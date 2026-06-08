import React from 'react';

export function GlyphMark({ className = '', tone = 'neutral' }) {
  return (
    <span
      className={`pointer-events-none absolute bottom-2 right-3 text-sm font-bold tracking-[0.2em] ${
        tone === 'light' ? 'text-white/25' : 'text-black/25'
      } ${className}`}
    >
      [//]
    </span>
  );
}
