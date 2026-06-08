import React from 'react';
import { useGamification } from '../hooks/useGamification';

export function XpLevelCard() {
  const { gamification } = useGamification();
  const currentXp = gamification.currentXp ?? 0;
  const currentLevel = gamification.currentLevel ?? 1;
  const xpProgress = Math.min(100, Math.max(0, currentXp));

  return (
    <section className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 text-[var(--app-text)] shadow-[var(--card-shadow)]">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ THE PULSE ]</div>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-[var(--app-text)]">XP / Level</h2>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Current</div>
          <div className="mt-2 font-mono text-4xl font-bold tracking-[0.24em] tabular-nums text-[#c4ff0e]">L{currentLevel}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-neutral-800 bg-black/35 p-4">
        <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          <span>experience</span>
          <span>{xpProgress}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden bg-black">
          <div className="h-full bg-[linear-gradient(90deg,#14b8a6,#2563eb)] transition-all duration-500 ease-out" style={{ width: `${xpProgress}%` }} />
        </div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          {xpProgress}/100 XP to next level
        </div>
      </div>
    </section>
  );
}
