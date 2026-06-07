import React, { useMemo, useState } from 'react';
import { CommsTracker } from './CommsTracker';
import { HuntCard } from './HuntCard';
import { ProgressBar } from './ui/ProgressBar';
import { XpLevelCard } from './XpLevelCard';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function shiftMonth(date, delta) {
  const next = new Date(date);
  next.setDate(1);
  next.setMonth(next.getMonth() + delta);
  return next;
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function CardGlyph({ glyph = '[//]' }) {
  return <span className="pointer-events-none absolute bottom-2 right-3 text-sm font-bold tracking-[0.2em] text-black/25">{glyph}</span>;
}

function MoneyCycler({ financials }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString('en-GB', {
        month: 'long',
        year: 'numeric',
      }).toUpperCase(),
    [currentMonth],
  );

  const monthStats = useMemo(() => {
    const key = getMonthKey(currentMonth);
    const invoices = financials.filter((entry) => {
      if (entry.type !== 'invoice') {
        return false;
      }

      const entryMonth = getMonthKey(new Date(entry.date));
      return entryMonth === key && (entry.status === 'sent' || entry.status === 'draft');
    });

    const expectedEarnings = invoices.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

    return {
      invoices,
      expectedEarnings,
    };
  }, [currentMonth, financials]);

  return (
    <section className="relative overflow-hidden bg-neon-green p-5 text-black">
      <CardGlyph />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-black/70">[ MONEY ]</div>
          <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-black">Expected Earnings</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentMonth((current) => shiftMonth(current, -1))}
            className="bg-black px-3 py-2 text-xs font-bold uppercase tracking-[0.5em] text-neon-green transition hover:bg-neutral-950"
          >
            &lt;
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth((current) => shiftMonth(current, 1))}
            className="bg-black px-3 py-2 text-xs font-bold uppercase tracking-[0.5em] text-neon-green transition hover:bg-neutral-950"
          >
            &gt;
          </button>
        </div>
      </div>

      <div className="mt-5 bg-black/80 px-4 py-5 text-neon-green">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neon-green/70">{monthLabel}</div>
        <div className="mt-3 font-mono text-5xl font-bold leading-none tracking-[0.24em] tabular-nums sm:text-6xl">
          {formatCurrency(monthStats.expectedEarnings)}
        </div>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.45em] text-neon-green/70">
          <span>{monthStats.invoices.length} invoices</span>
          <span>draft + sent</span>
        </div>
      </div>
    </section>
  );
}

function SectionShell({ title, eyebrow, children, className = '' }) {
  return (
    <section className={`bg-white/[0.03] p-5 ${className}`}>
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">{eyebrow}</div>
        <h2 className="mt-2 font-serif text-2xl uppercase tracking-[0.08em] text-neon-green">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function Dashboard({ clients, financials, onOpenClient }) {
  const activeClients = clients.filter((client) => client.status === 'active');
  const unpaidInvoices = financials.filter((item) => item.type === 'invoice' && item.status !== 'paid');
  const totalInvoiceAmount = financials
    .filter((item) => item.type === 'invoice')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const burnRate = totalInvoiceAmount > 0 ? Math.round((unpaidAmount / totalInvoiceAmount) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 2xl:grid-cols-4">
        <section className="relative overflow-hidden bg-neon-red p-5 text-black 2xl:col-span-2">
          <CardGlyph />
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase tracking-[0.7em] text-black/70">[ THE PULSE ]</div>
              <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-black">Burn Rate</h2>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.45em] text-black/70">Unpaid</div>
              <div className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] tabular-nums text-black">
                {formatCurrency(unpaidAmount)}
              </div>
            </div>
          </div>
          <div className="mt-5 bg-black/80 p-4">
            <ProgressBar value={burnRate} accent="warning" label={`${burnRate}% of invoice value still open`} />
          </div>
        </section>

        <div className="2xl:col-span-2">
          <XpLevelCard />
        </div>

        <SectionShell eyebrow="[ ACTIVE CLIENTS ]" title="Vault Access" className="2xl:col-span-2">
          <div className="space-y-2">
            {activeClients.length > 0 ? (
              activeClients.map((client) => (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => onOpenClient(client.id)}
                  className="flex w-full items-center justify-between bg-white/[0.05] px-4 py-3 text-left transition hover:bg-neon-green hover:text-black"
                >
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.35em] text-neutral-100">{client.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                      {client.quickLinks?.length ?? 0} quick links
                    </div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">open</span>
                </button>
              ))
            ) : (
              <div className="bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.45em] text-neutral-500">
                no active clients
              </div>
            )}
          </div>
        </SectionShell>

        <section className="2xl:col-span-2">
          <HuntCard />
        </section>

        <section className="2xl:col-span-2">
          <CommsTracker />
        </section>

        <section className="2xl:col-span-2">
          <MoneyCycler financials={financials} />
        </section>
      </div>
    </div>
  );
}
