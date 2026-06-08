import React from 'react';
import { useGamification } from '../hooks/useGamification';

export function XpLevelCard({ selected = false }) {
  const { gamification } = useGamification();
  const currentXp = gamification.currentXp ?? 0;
  const currentLevel = gamification.currentLevel ?? 1;
  const xpProgress = Math.min(100, Math.max(0, currentXp));

  return (
    <section className={`relative overflow-hidden rounded-xl border p-5 shadow-[var(--card-shadow)] ${selected ? 'border-black/20 bg-black text-[#c4ff0e]' : 'border-neutral-800 bg-neutral-900/80 text-[var(--app-text)]'}`}>
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className={`text-[10px] uppercase tracking-[0.7em] ${selected ? 'text-black/60' : 'text-neutral-500'}`}>[ THE PULSE ]</div>
          <h2 className={`mt-2 font-serif text-3xl uppercase tracking-[0.08em] ${selected ? 'text-[#c4ff0e]' : 'text-[var(--app-text)]'}`}>XP / Level</h2>
        </div>
        <div className="text-right">
          <div className={`text-[10px] uppercase tracking-[0.45em] ${selected ? 'text-black/60' : 'text-neutral-500'}`}>Current</div>
          <div className="mt-2 font-mono text-4xl font-bold tracking-[0.24em] tabular-nums text-[#c4ff0e]">L{currentLevel}</div>
        </div>
      </div>

      <div className={`mt-5 rounded-xl border p-4 ${selected ? 'border-black/20 bg-black' : 'border-neutral-800 bg-black/35'}`}>
        <div className={`flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.45em] ${selected ? 'text-black/60' : 'text-neutral-500'}`}>
          <span>experience</span>
          <span>{xpProgress}%</span>
        </div>
        <div className={`mt-3 h-3 overflow-hidden ${selected ? 'bg-black' : 'bg-black'}`}>
          <div className={`h-full transition-all duration-500 ease-out ${selected ? 'bg-[#c4ff0e]' : 'bg-[linear-gradient(90deg,#c4ff0e,#f97316)]'}`} style={{ width: `${xpProgress}%` }} />
        </div>
        <div className={`mt-3 text-[10px] uppercase tracking-[0.45em] ${selected ? 'text-black/60' : 'text-neutral-500'}`}>
          {xpProgress}/100 XP to next level
        </div>
      </div>
    </section>
  );
}
