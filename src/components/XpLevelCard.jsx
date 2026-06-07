import React from 'react';
import { useGamification } from '../hooks/useGamification';

function CardGlyph({ glyph = '[//]' }) {
  return <span className="pointer-events-none absolute bottom-2 right-3 text-sm font-bold tracking-[0.2em] text-black/25">{glyph}</span>;
}

export function XpLevelCard() {
  const { gamification } = useGamification();
  const currentXp = gamification.currentXp ?? 0;
  const currentLevel = gamification.currentLevel ?? 1;
  const xpProgress = Math.min(100, Math.max(0, currentXp));

  return (
    <section className="relative overflow-hidden bg-neon-green p-5 text-black">
      <CardGlyph />
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-black/70">[ THE PULSE ]</div>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-black">XP / Level</h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.45em] text-black/70">Current</div>
          <div className="mt-2 font-mono text-4xl font-bold tracking-[0.24em] tabular-nums text-black">L{currentLevel}</div>
        </div>
      </div>

      <div className="mt-5 bg-black/80 p-4 text-neon-green">
        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.45em] text-neon-green/70">
          <span>experience</span>
          <span>{xpProgress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden bg-black">
          <div className="h-full bg-neon-green transition-all duration-500 ease-out" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.45em] text-neon-green/70">
          {xpProgress}/100 XP to next level
        </div>
      </div>
    </section>
  );
}
