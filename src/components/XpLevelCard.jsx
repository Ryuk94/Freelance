import React from 'react';
import { ProgressBar } from './ui/ProgressBar';
import { useGamification } from '../hooks/useGamification';

export function XpLevelCard() {
  const { gamification } = useGamification();
  const currentXp = gamification.currentXp ?? 0;
  const currentLevel = gamification.currentLevel ?? 1;
  const xpProgress = Math.min(100, Math.max(0, currentXp));

  return (
    <div className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">The Pulse</div>
          <h2 className="mt-2 text-lg font-black tracking-tight">XP & Level</h2>
        </div>
        <div className="text-right">
          <div className="text-sm text-neutral-400">Level</div>
          <div className="text-2xl font-black text-violet-300">Lv {currentLevel}</div>
        </div>
      </div>
      <div className="mt-5">
        <ProgressBar
          value={xpProgress}
          accent="violet"
          label={`${xpProgress}/100 XP to the next level`}
        />
      </div>
    </div>
  );
}
