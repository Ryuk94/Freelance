import React from 'react';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinancialsView({ financials, clients }) {
  return (
    <section className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
      <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Financials</div>
      <h2 className="mt-2 text-2xl font-black tracking-tight">Invoices & Goals</h2>
      <div className="mt-6 space-y-3">
        {financials.map((entry) => {
          const client = clients.find((item) => item.id === entry.clientId);
          return (
            <div key={entry.id} className="flex items-center justify-between rounded-3xl border border-white/5 bg-white/5 p-4">
              <div>
                <div className="font-semibold text-neutral-100">{client?.name ?? 'Unlinked client'}</div>
                <div className="text-sm text-neutral-400">
                  {entry.type} - {entry.status}
                </div>
              </div>
              <div className="text-lg font-black text-emerald-400">{formatCurrency(entry.amount)}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
