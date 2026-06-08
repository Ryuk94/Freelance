import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

function normalizeQuickLink(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ClientVault({ client }) {
  const currentClient =
    useLiveQuery(
      () => (client?.id ? db.clients.get(client.id).then((row) => (row?.isDeleted ? null : row)) : Promise.resolve(client)),
      [client?.id],
    ) ?? client;

  if (!currentClient) {
    return (
      <section className="border border-neutral-800 bg-white/[0.03] p-5">
        <div className="text-sm text-neutral-400">No client selected.</div>
      </section>
    );
  }

  const quickLinks = Array.isArray(currentClient.quickLinks) ? currentClient.quickLinks : [];

  const handleNotesChange = (event) => {
    const nextNotes = event.target.value;
    void db.clients.update(currentClient.id, { notes: nextNotes, updatedAt: Date.now() });
  };

  return (
    <section className="border border-neutral-800 bg-white/[0.03] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client Master Vault</div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-100">{currentClient.name}</h2>
          <p className="mt-2 text-sm text-neutral-400">Status: {currentClient.status}</p>
        </div>
        <span className="border border-neon-green/20 bg-neon-green/10 px-4 py-2 text-sm font-semibold text-neon-green">
          Live Notes Enabled
        </span>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Quick Links</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {quickLinks.length > 0 ? (
            quickLinks.map((url) => (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                className="border border-neutral-800 bg-black/40 px-4 py-3 text-sm font-semibold text-neutral-100 transition hover:border-neon-green hover:bg-neon-green/10"
              >
                {normalizeQuickLink(url)}
              </a>
            ))
          ) : (
            <div className="border border-dashed border-neutral-800 bg-black/40 px-4 py-3 text-sm text-neutral-400">
              No quick links yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">The Sandbox</div>
        <textarea
          value={currentClient.notes ?? ''}
          onChange={handleNotesChange}
          className="mt-3 min-h-[320px] w-full border border-neutral-800 bg-black/60 p-4 text-sm leading-6 text-neutral-100 outline-none transition placeholder:text-neutral-600 focus:border-neon-green"
          placeholder="Capture everything: session recap, links, next steps, delivery notes."
        />
      </div>
    </section>
  );
}
