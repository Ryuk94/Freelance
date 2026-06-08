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

function CommsCard({ row, onLogCheck }) {
  const stale = !row.lastChecked || Date.now() - row.lastChecked > DAY_MS;
  const statusText = stale ? 'check overdue' : 'checked within 24h';

  return (
    <div className="relative overflow-hidden bg-neon-red px-4 py-4 text-black">
      <CardGlyph />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-black/70">[{row.platform.toUpperCase()}]</div>
          <div className="mt-2 text-sm font-bold uppercase tracking-[0.35em] text-black">{statusText}</div>
        </div>
        <div className="text-right text-[10px] uppercase tracking-[0.45em] text-black/70">{formatLastChecked(row.lastChecked)}</div>
      </div>

      <button
        type="button"
        onClick={() => onLogCheck(row.id)}
        className="mt-4 bg-black px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-neon-green transition hover:bg-neutral-950"
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
    <section className="bg-white/[0.03] p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ COMMS ]</div>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">Slacking Tracker</h2>
        </div>
      </div>

      {activeRows.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {activeRows.map((row) => (
            <CommsCard key={row.id} row={row} onLogCheck={handleLogCheck} />
          ))}
        </div>
      ) : (
        <div className="bg-black/40 px-4 py-4 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          no comms checks logged yet
        </div>
      )}
    </section>
  );
}
