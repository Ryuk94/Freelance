import React from 'react';
import { XpLevelCard } from './XpLevelCard';
import { HuntCard } from './HuntCard';
import { ProgressBar } from './ui/ProgressBar';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function SectionShell({ title, eyebrow, children }) {
  return (
    <section className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">{eyebrow}</div>
        <h2 className="mt-2 text-lg font-black tracking-tight text-neutral-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Dashboard({ clients, financials, onOpenClient, onToggleFocus }) {
  const activeClients = clients.filter((client) => client.status === 'active');
  const unpaidInvoices = financials.filter((item) => item.type === 'invoice' && item.status !== 'paid');
  const totalInvoiceAmount = financials.filter((item) => item.type === 'invoice').reduce((sum, item) => sum + item.amount, 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, item) => sum + item.amount, 0);
  const burnRate = totalInvoiceAmount > 0 ? Math.round((unpaidAmount / totalInvoiceAmount) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">The Pulse</div>
              <h2 className="mt-2 text-lg font-black tracking-tight">Burn Rate</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-400">Unpaid Invoices</div>
              <div className="text-2xl font-black text-emerald-400">{formatCurrency(unpaidAmount)}</div>
            </div>
          </div>
          <div className="mt-5">
            <ProgressBar value={burnRate} accent="emerald" label={`${burnRate}% of invoice value still open`} />
          </div>
        </div>

        <XpLevelCard />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionShell eyebrow="Active Clients" title="Vault Access">
          <div className="space-y-3">
            {activeClients.map((client) => (
              <button
                key={client.id}
                type="button"
                onClick={() => onOpenClient(client.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
              >
                <div>
                  <div className="font-semibold text-neutral-100">{client.name}</div>
                  <div className="text-sm text-neutral-400">{client.quickLinks?.length ?? 0} quick links</div>
                </div>
                <span className="text-neutral-500">Open</span>
              </button>
            ))}
          </div>
        </SectionShell>

        <HuntCard />

        <SectionShell eyebrow="Money" title="Open Invoices">
          <div className="flex items-center justify-between rounded-3xl border border-emerald-400/10 bg-emerald-400/5 px-4 py-5">
            <div>
              <div className="text-sm text-neutral-400">Unpaid invoices</div>
              <div className="mt-1 text-3xl font-black text-emerald-400">{unpaidInvoices.length}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-neutral-400">Value</div>
              <div className="mt-1 text-2xl font-black text-neutral-100">{formatCurrency(unpaidAmount)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleFocus}
            className="mt-4 w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
          >
            Enter Focus Mode
          </button>
        </SectionShell>
      </div>
    </div>
  );
}
