import React from 'react';
import { db } from '../db';
import { useToast } from '../hooks/useToast';

export function LeadsView({ leads }) {
  const showToast = useToast();

  const handleDelete = async (leadId) => {
    try {
      const now = Date.now();
      await db.leads.update(leadId, {
        isDeleted: true,
        updatedAt: now,
      });
      showToast('LEAD ARCHIVED', async () => {
        await db.leads.update(leadId, {
          isDeleted: false,
          updatedAt: Date.now(),
        });
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to delete lead', error);
    }
  };

  return (
    <section className="border border-neutral-800 bg-white/[0.03] p-5">
      <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ LEADS ]</div>
      <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">Pipeline</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <div key={lead.id} className="border border-neutral-800 bg-black/40 p-4">
            <div className="text-sm font-bold uppercase tracking-[0.35em] text-neon-green">{lead.companyName}</div>
            <div className="mt-2 text-[10px] uppercase tracking-[0.45em] text-neutral-500">{lead.status}</div>
            <button
              type="button"
              onClick={() => handleDelete(lead.id)}
              className="mt-4 bg-neon-red px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black transition hover:bg-neon-red/90"
            >
              remove
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
