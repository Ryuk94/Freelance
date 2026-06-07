import React, { useMemo, useState } from 'react';
import { db } from '../db';
import { QuickLinks } from './QuickLinks';
import { Scratchpad } from './Scratchpad';

function normalizeStatus(client) {
  return client?.status === 'past' ? 'archived' : client?.status ?? 'active';
}

function groupClients(clients) {
  return {
    active: clients.filter((client) => normalizeStatus(client) === 'active'),
    archived: clients.filter((client) => normalizeStatus(client) === 'archived'),
  };
}

function CardGlyph({ glyph = '[//]' }) {
  return <span className="pointer-events-none absolute bottom-2 right-3 text-sm font-bold tracking-[0.2em] text-black/20">{glyph}</span>;
}

function ClientListButton({ client, active, onSelect }) {
  const status = normalizeStatus(client);
  const statusClass = active ? 'text-black/70' : 'text-neutral-500';

  return (
    <button
      type="button"
      onClick={() => onSelect(client.id)}
      className={[
        'w-full px-4 py-3 text-left transition',
        active ? 'bg-neon-green text-black' : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] hover:text-white',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate text-xs font-bold uppercase tracking-[0.35em]">{client.name}</span>
        <span className={`shrink-0 text-[10px] uppercase tracking-[0.45em] ${statusClass}`}>{status}</span>
      </div>
    </button>
  );
}

function ClientGroup({ title, clients, selectedClientId, onSelect }) {
  return (
    <section className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">{title}</div>
      <div className="space-y-2">
        {clients.length > 0 ? (
          clients.map((client) => (
            <ClientListButton
              key={client.id}
              client={client}
              active={client.id === selectedClientId}
              onSelect={onSelect}
            />
          ))
        ) : (
          <div className="bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.45em] text-neutral-500">none</div>
        )}
      </div>
    </section>
  );
}

function normalizeHex(hex) {
  const value = hex.toUpperCase();
  if (value.length === 4) {
    return `#${value.slice(1).split('').map((segment) => segment + segment).join('')}`;
  }

  return value;
}

function extractSwatches(text) {
  const matches = text.match(/#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})\b/g) ?? [];
  return Array.from(new Set(matches.map(normalizeHex)));
}

function BrandKitManager({ client, onCreated }) {
  const [rawGuidelines, setRawGuidelines] = useState('');
  const [tone, setTone] = useState('');
  const [typography, setTypography] = useState('');

  const brandKits = Array.isArray(client.brandKits) ? client.brandKits : [];

  const handleProcess = async () => {
    const swatches = extractSwatches(rawGuidelines);
    const now = Date.now();
    const nextKit = {
      id: now,
      name: `KIT ${brandKits.length + 1}`,
      tone: tone.trim(),
      typography: typography.trim(),
      swatches,
      sourceText: rawGuidelines.trim(),
      createdAt: now,
      updatedAt: now,
    };

    try {
      await db.clients.update(client.id, {
        brandKits: [...brandKits, nextKit],
        updatedAt: now,
      });
      setRawGuidelines('');
      setTone('');
      setTypography('');
      onCreated?.();
    } catch (error) {
      console.error('[FreelanceOS] Failed to create brand kit', error);
    }
  };

  return (
    <section className="space-y-4 bg-white/[0.04] p-4">
      <div>
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ BRAND KITS ]</div>
        <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">
          extract colors from pasted guideline text
        </p>
      </div>

      <div className="grid gap-3 xl:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Tone</span>
          <input
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            placeholder="e.g. clinical, cinematic, playful"
            className="w-full bg-black/70 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Typography</span>
          <input
            value={typography}
            onChange={(event) => setTypography(event.target.value)}
            placeholder="e.g. Inter / serif display"
            className="w-full bg-black/70 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600"
          />
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Auto-Extract</span>
        <textarea
          value={rawGuidelines}
          onChange={(event) => setRawGuidelines(event.target.value)}
          placeholder="Paste raw brand guidelines here. Hex colors will be extracted automatically."
          className="min-h-40 w-full bg-black/70 px-3 py-3 font-mono text-sm text-neon-green outline-none placeholder:text-neutral-600"
        />
      </label>

      <button
        type="button"
        onClick={handleProcess}
        className="bg-neon-green px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-black transition hover:bg-neon-green/90"
      >
        process
      </button>

      <div className="flex items-center justify-between gap-3 bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
        <span>saved kits</span>
        <span className="text-neon-green">{brandKits.length}</span>
      </div>
    </section>
  );
}

function BrandKitGallery({ client }) {
  const brandKits = Array.isArray(client.brandKits) ? client.brandKits : [];

  return (
    <section className="bg-white/[0.04] p-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ BRAND KITS ]</div>
          <div className="mt-2 text-xs uppercase tracking-[0.45em] text-neutral-500">{brandKits.length} saved kits</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {brandKits.length > 0 ? (
          brandKits.map((kit) => (
            <article key={kit.id} className="relative overflow-hidden bg-black/50 p-4">
              <CardGlyph glyph="+" />
              <div className="text-xs font-bold uppercase tracking-[0.35em] text-neon-green">{kit.name}</div>
              <div className="mt-2 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                {kit.tone || 'no tone'} / {kit.typography || 'no typography'}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {(kit.swatches ?? []).length > 0 ? (
                  kit.swatches.map((swatch) => (
                    <div
                      key={swatch}
                      className="h-8 w-8"
                      title={swatch}
                      style={{ backgroundColor: swatch }}
                    />
                  ))
                ) : (
                  <div className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">no colors captured</div>
                )}
              </div>
            </article>
          ))
        ) : (
          <div className="bg-black/40 px-4 py-3 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
            no brand kits extracted yet
          </div>
        )}
      </div>
    </section>
  );
}

export function ClientsView({ clients, selectedClientId, onSelectClient }) {
  const groupedClients = useMemo(() => groupClients(clients), [clients]);
  const [showArchived, setShowArchived] = useState(false);

  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ??
    groupedClients.active[0] ??
    groupedClients.archived[0] ??
    clients[0] ??
    null;

  const handleArchive = async () => {
    if (!selectedClient) {
      return;
    }

    try {
      await db.clients.update(selectedClient.id, {
        status: 'archived',
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to archive client', error);
    }
  };

  if (!selectedClient) {
    return (
      <section className="bg-white/[0.03] p-5">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ CLIENT VAULT ]</div>
        <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">No clients yet</h2>
        <p className="mt-3 text-[11px] uppercase tracking-[0.3em] text-neutral-500">Add a client to begin building a vault.</p>
      </section>
    );
  }

  const normalizedStatus = normalizeStatus(selectedClient);

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4 bg-white/[0.03] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ CLIENTS ]</div>
            <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">Vault Index</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowArchived((current) => !current)}
            className="bg-white/[0.08] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-neutral-200 transition hover:bg-neon-red hover:text-black"
          >
            archived ({groupedClients.archived.length})
          </button>
        </div>

        <ClientGroup title="[ ACTIVE ]" clients={groupedClients.active} selectedClientId={selectedClient.id} onSelect={onSelectClient} />

        {showArchived ? (
          <ClientGroup title="[ ARCHIVED ]" clients={groupedClients.archived} selectedClientId={selectedClient.id} onSelect={onSelectClient} />
        ) : null}
      </aside>

      <section className="space-y-4 bg-white/[0.03] p-5">
        <header className="flex flex-wrap items-start justify-between gap-4 bg-black/35 p-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ CLIENT VAULT ]</div>
            <h1 className="mt-2 font-serif text-4xl uppercase tracking-[0.08em] text-neon-green">{selectedClient.name}</h1>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">status: {normalizedStatus}</p>
          </div>

          <div className="flex flex-col gap-2 sm:items-end">
            <span className="bg-neon-green px-4 py-2 text-[10px] uppercase tracking-[0.45em] text-black">
              auto-save on
            </span>
            <button
              type="button"
              onClick={handleArchive}
              disabled={normalizedStatus === 'archived'}
              className="bg-neon-red px-4 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black transition hover:bg-neon-red/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              archive
            </button>
          </div>
        </header>

        <QuickLinks client={selectedClient} />
        <Scratchpad client={selectedClient} />
        <BrandKitManager client={selectedClient} onCreated={() => onSelectClient(selectedClient.id)} />

        <BrandKitGallery client={selectedClient} />
      </section>
    </div>
  );
}
