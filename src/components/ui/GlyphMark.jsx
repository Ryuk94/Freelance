import React from 'react';

export function GlyphMark({ className = '', tone = 'neutral' }) {
  const toneClass = tone === 'light' ? 'text-white/65 border-white/30' : 'text-black/65 border-black/25';

  return (
    <div className={`pointer-events-none absolute bottom-2 right-3 flex items-end gap-1 ${className}`}>
      <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${toneClass}`}>
        <span className="block h-2 w-2 rounded-full bg-current" />
      </div>
      <div className="flex flex-col gap-[2px]">
        <span className={`h-[2px] w-5 ${tone === 'light' ? 'bg-white/65' : 'bg-black/65'}`} />
        <span className={`h-[2px] w-3 ${tone === 'light' ? 'bg-white/45' : 'bg-black/45'}`} />
      </div>
      <div className="flex flex-col gap-[2px] pb-[2px]">
        <span className={`h-1.5 w-1.5 rotate-45 border-r border-t ${toneClass}`} />
        <span className={`h-1.5 w-1.5 rotate-45 border-r border-t ${toneClass} opacity-70`} />
      </div>
    </div>
  );
}
