import { useCallback, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { db } from '../db';

const DEFAULT_GAMIFICATION = {
  id: 1,
  currentLevel: 1,
  currentXp: 0,
  dailyStreak: 0,
};

function createDefaultGamification() {
  return {
    ...DEFAULT_GAMIFICATION,
    updatedAt: Date.now(),
    isDeleted: false,
  };
}

function fireConfetti() {
  confetti({
    particleCount: 26,
    spread: 58,
    startVelocity: 28,
    scalar: 0.9,
    origin: { x: 0.92, y: 0.92 },
    colors: ['#34d399', '#a78bfa', '#f5f5f5'],
  });

  window.setTimeout(() => {
    confetti({
      particleCount: 12,
      spread: 42,
      startVelocity: 18,
      scalar: 0.75,
      origin: { x: 0.84, y: 0.88 },
      colors: ['#34d399', '#c4b5fd', '#e5e7eb'],
    });
  }, 80);
}

export function useGamification() {
  const gamificationRows = useLiveQuery(() => db.gamification.filter((row) => !row.isDeleted).toArray(), []);
  const gamification = gamificationRows?.[0] ?? null;

  useEffect(() => {
    if (gamificationRows === undefined) {
      return;
    }

    if (gamificationRows.length === 0) {
      void db.gamification.put(createDefaultGamification());
    }
  }, [gamificationRows]);

  const addXp = useCallback(async (amount) => {
    const current = (await db.gamification.get(1)) ?? createDefaultGamification();
    const totalXp = current.currentXp + amount;
    const levelGain = Math.floor(totalXp / 100);
    const nextXp = totalXp % 100;
    const nextLevel = current.currentLevel + levelGain;

    await db.gamification.put({
      id: 1,
      currentLevel: nextLevel,
      currentXp: nextXp,
      dailyStreak: current.dailyStreak ?? 0,
      updatedAt: Date.now(),
      isDeleted: false,
    });

    fireConfetti();

    return {
      currentLevel: nextLevel,
      currentXp: nextXp,
      levelGain,
    };
  }, []);

  return {
    gamification: gamification ?? DEFAULT_GAMIFICATION,
    addXp,
  };
}
