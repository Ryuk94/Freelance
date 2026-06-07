import React, { useMemo } from 'react';
import { Scratchpad } from './Scratchpad';
import { QuickLinks } from './QuickLinks';

function groupClients(clients) {
  return {
    active: clients.filter((client) => client.status === 'active'),
    past: clients.filter((client) => client.status === 'past'),
  };
}

function ClientListButton({ client, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(client.id)}
      className={[
        'w-full rounded-2xl border px-4 py-3 text-left transition',
        active ? 'border-violet-400/30 bg-violet-500/10' : 'border-white/5 bg-white/5 hover:bg-white/10',
      ].join(' ')}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="truncate font-semibold text-neutral-100">{client.name}</span>
        <span className="shrink-0 text-[10px] uppercase tracking-[0.3em] text-neutral-500">{client.status}</span>
      </div>
    </button>
  );
}

function ClientGroup({ title, clients, selectedClientId, onSelect }) {
  if (clients.length === 0) {
    return null;
  }

  return (
    <section className="space-y-3">
      <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">{title}</div>
      <div className="space-y-2">
        {clients.map((client) => (
          <ClientListButton key={client.id} client={client} active={client.id === selectedClientId} onSelect={onSelect} />
        ))}
      </div>
    </section>
  );
}

export function ClientsView({ clients, selectedClientId, onSelectClient }) {
  const groupedClients = useMemo(() => groupClients(clients), [clients]);
  const selectedClient =
    clients.find((client) => client.id === selectedClientId) ??
    groupedClients.active[0] ??
    groupedClients.past[0] ??
    clients[0] ??
    null;

  if (!selectedClient) {
    return (
      <section className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client Vault</div>
        <h2 className="mt-2 text-2xl font-black tracking-tight text-neutral-100">No clients yet</h2>
        <p className="mt-3 text-sm text-neutral-400">Add a client to begin building a vault.</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4 rounded-3xl border border-white/5 bg-neutral-900 p-5">
        <div>
          <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client List</div>
          <h2 className="mt-2 text-lg font-black tracking-tight text-neutral-100">Choose a vault</h2>
        </div>

        <ClientGroup
          title="Active"
          clients={groupedClients.active}
          selectedClientId={selectedClient.id}
          onSelect={onSelectClient}
        />

        <ClientGroup title="Past" clients={groupedClients.past} selectedClientId={selectedClient.id} onSelect={onSelectClient} />
      </aside>

      <section className="space-y-4 rounded-3xl border border-white/5 bg-neutral-900 p-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Client Vault</div>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-neutral-100">{selectedClient.name}</h1>
            <p className="mt-2 text-sm text-neutral-400">Status: {selectedClient.status}</p>
          </div>
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300">
            Auto-save on
          </span>
        </header>

        <QuickLinks client={selectedClient} />
        <Scratchpad client={selectedClient} />
      </section>
    </div>
  );
}
