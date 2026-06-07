import React from 'react';

export function LeadsView({ leads }) {
  return (
    <section className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
      <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Leads</div>
      <h2 className="mt-2 text-2xl font-black tracking-tight">Pipeline</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <div key={lead.id} className="rounded-3xl border border-white/5 bg-white/5 p-4">
            <div className="font-semibold text-neutral-100">{lead.companyName}</div>
            <div className="mt-1 text-sm text-neutral-400">{lead.status}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
