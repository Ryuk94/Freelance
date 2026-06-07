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
    if (!client?.id) {
      return;
    }

    if (!isDirty) {
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
    <section className="space-y-3">
      <div>
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Scratchpad</div>
        <p className="mt-2 text-sm text-neutral-400">Auto-saves after a short pause. No save button, no pressure.</p>
      </div>

      <textarea
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          setIsDirty(true);
        }}
        placeholder="Capture notes, edits, deliverables, and next steps..."
        className="min-h-[420px] w-full rounded-3xl border border-transparent bg-transparent px-0 py-2 text-[15px] leading-7 text-neutral-100 outline-none placeholder:text-neutral-600 focus:border-transparent focus:ring-0"
      />
    </section>
  );
}
