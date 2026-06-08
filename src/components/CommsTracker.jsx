import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { GlyphMark } from './ui/GlyphMark';

const DEFAULT_PLATFORMS = ['Upwork', 'LinkedIn'];
const DAY_MS = 24 * 60 * 60 * 1000;

function buildDefaultRows() {
  return DEFAULT_PLATFORMS.map((platform, index) => ({
    id: index + 1,
    platform,
    lastChecked: 0,
    updatedAt: Date.now() + index,
  }));
}

function formatLastChecked(value) {
  if (!value) {
    return 'never';
  }

  return new Date(value).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function CardGlyph({ glyph = '[//]' }) {
  return <GlyphMark tone="dark" />;
}

function StatusModule({ value = '1', label = 'S' }) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center space-x-2 opacity-50">
      <div className="flex rounded-sm border border-neutral-700 text-[10px] font-mono tracking-widest text-neutral-400">
        <span className="border-r border-neutral-700 px-1.5 py-0.5">{label}</span>
        <span className="px-1.5 py-0.5 text-[#c4ff0e]">{value}</span>
      </div>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-neutral-500">
        <path d="M2 2h4v4H2z M10 2h4v4h-4z M2 10h4v4H2z M10 10h4v4h-4z" />
      </svg>
    </div>
  );
}

function CommsCard({ row, onLogCheck }) {
  const stale = !row.lastChecked || Date.now() - row.lastChecked > DAY_MS;
  const statusText = stale ? 'check overdue' : 'checked within 24h';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/80 px-4 py-4 text-[var(--app-text)] shadow-[var(--card-shadow)]">
      <CardGlyph />
      <StatusModule value={stale ? 'O' : '0'} label="C" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[{row.platform.toUpperCase()}]</div>
          <div className="mt-2 text-sm font-bold uppercase tracking-[0.35em] text-[var(--app-text)]">{statusText}</div>
        </div>
        <div className="text-right text-[10px] uppercase tracking-[0.45em] text-neutral-500">{formatLastChecked(row.lastChecked)}</div>
      </div>

      <button
        type="button"
        onClick={() => onLogCheck(row.id)}
        className="mt-4 rounded-xl border border-neutral-700 bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-[#c4ff0e] transition hover:bg-white/[0.06]"
      >
        log check
      </button>
    </div>
  );
}

export function CommsTracker() {
  const rows = useLiveQuery(() => db.commsTracker.filter((row) => !row.isDeleted).toArray(), []);

  const handleLogCheck = async (id) => {
    try {
      await db.commsTracker.update(id, {
        lastChecked: Date.now(),
        updatedAt: Date.now(),
        isDeleted: false,
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to log comms check', error);
    }
  };

  const activeRows = rows ?? [];

  return (
    <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-[var(--card-shadow)]">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ COMMS ]</div>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-[var(--app-text)]">Slacking Tracker</h2>
        </div>
      </div>

      {activeRows.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {activeRows.map((row) => (
            <CommsCard key={row.id} row={row} onLogCheck={handleLogCheck} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-neutral-800 bg-black/35 px-4 py-4 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          no comms checks logged yet
        </div>
      )}
    </section>
  );
}
