import React, { useEffect, useState } from 'react';
import { db } from '../db';

export function Scratchpad({ client }) {
  const [draft, setDraft] = useState(client?.notes ?? '');
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setDraft(client?.notes ?? '');
    setIsDirty(false);
  }, [client?.id]);

  useEffect(() => {
    if (!client?.id || !isDirty) {
      return;
    }

    const timerId = window.setTimeout(async () => {
      try {
        await db.clients.update(client.id, {
          notes: draft,
          updatedAt: Date.now(),
        });
        setIsDirty(false);
      } catch (error) {
        console.error('[FreelanceOS] Failed to autosave scratchpad', error);
      }
    }, 500);

    return () => window.clearTimeout(timerId);
  }, [client?.id, draft, isDirty]);

  if (!client) {
    return null;
  }

  return (
    <section className="space-y-3 border border-neutral-800 bg-black/35 p-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ SCRATCHPAD ]</div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">autosaves after a short pause</p>
      </div>

      <textarea
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setIsDirty(true);
        }}
        placeholder="CAPTURE NOTES, EDITS, DELIVERABLES, AND NEXT STEPS..."
        className="min-h-[420px] w-full border border-neutral-800 bg-transparent px-0 py-2 font-mono text-base leading-8 text-neon-green outline-none placeholder:text-neutral-600 focus:border-neon-green/30 focus:ring-0"
      />
    </section>
  );
}
