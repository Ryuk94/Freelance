import React from 'react';
import { db } from '../db';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function FinancialsView({ financials, clients }) {
  const handleDelete = async (entryId) => {
    try {
      await db.financials.update(entryId, {
        deletedAt: Date.now(),
        updatedAt: Date.now(),
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to delete financial entry', error);
    }
  };

  return (
    <section className="border border-neutral-800 bg-white/[0.03] p-5">
      <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ FINANCIALS ]</div>
      <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">Ledger</h2>
      <div className="mt-6 space-y-3">
        {financials.length > 0 ? (
          financials.map((entry) => {
            const client = clients.find((item) => item.id === entry.clientId);
            return (
              <div key={entry.id} className="flex items-center justify-between border border-neutral-800 bg-black/40 px-4 py-4">
                <div>
                  <div className="text-sm font-bold uppercase tracking-[0.35em] text-neon-green">{client?.name ?? 'UNLINKED CLIENT'}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                    {entry.type} / {entry.status}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-mono text-xl font-bold tracking-[0.2em] text-neon-green tabular-nums">{formatCurrency(entry.amount)}</div>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="bg-neon-red px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black transition hover:bg-neon-red/90"
                  >
                    remove
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="border border-dashed border-neutral-800 px-4 py-3 text-xs uppercase tracking-[0.45em] text-neutral-500">
            ledger empty
          </div>
        )}
      </div>
    </section>
  );
}
