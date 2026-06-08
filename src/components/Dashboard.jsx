import React, { useEffect, useMemo, useState } from 'react';
import { CommsTracker } from './CommsTracker';
import { HuntCard } from './HuntCard';
import { GlyphMark } from './ui/GlyphMark';
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
  return <GlyphMark tone="dark" />;
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

const DASHBOARD_LAYOUT_STORAGE_KEY = 'freelanceos.dashboardWidgetOrder';
const DEFAULT_WIDGET_ORDER = ['welcome', 'burnRate', 'xp', 'clients', 'hunt', 'comms', 'money'];

function getStoredWidgetOrder() {
  if (typeof window === 'undefined') {
    return DEFAULT_WIDGET_ORDER;
  }

  try {
    const raw = window.localStorage.getItem(DASHBOARD_LAYOUT_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const filtered = Array.isArray(parsed) ? parsed.filter((id) => DEFAULT_WIDGET_ORDER.includes(id)) : [];
    const merged = [...filtered, ...DEFAULT_WIDGET_ORDER.filter((id) => !filtered.includes(id))];
    return merged.length === DEFAULT_WIDGET_ORDER.length ? merged : DEFAULT_WIDGET_ORDER;
  } catch {
    return DEFAULT_WIDGET_ORDER;
  }
}

function getTodayLabel() {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function buildTodaySummary({ activeClients, unpaidInvoices, unpaidAmount, burnRate }) {
  const clientWord = activeClients === 1 ? 'client' : 'clients';
  const invoiceWord = unpaidInvoices === 1 ? 'invoice' : 'invoices';

  if (activeClients === 0 && unpaidInvoices === 0) {
    return 'The board is quiet right now. Use today to add new leads, capture invoices, or polish your workspace.';
  }

  return `You have ${activeClients} active ${clientWord} and ${unpaidInvoices} open ${invoiceWord} worth ${formatCurrency(unpaidAmount)}. Focus on collecting what's due first, then work the hunt list. Current burn rate is ${burnRate}%.`;
}

function DashboardWidgetShell({ title, eyebrow, children, className = '', draggable = false, dragState = 'idle', dragHandleProps }) {
  const dragClasses =
    dragState === 'dragging'
      ? 'ring-2 ring-neon-green/70 opacity-70'
      : dragState === 'over'
        ? 'ring-2 ring-neon-green'
        : '';

  return (
    <section className={`relative ${dragClasses} ${className}`}>
      {draggable ? (
        <button
          type="button"
          {...dragHandleProps}
          className="absolute right-3 top-3 z-10 border border-black/20 bg-white/60 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.45em] text-black/70 backdrop-blur"
        >
          drag
        </button>
      ) : null}
      {children}
    </section>
  );
}

export function Dashboard({ clients, financials, onOpenClient }) {
  const [widgetOrder, setWidgetOrder] = useState(() => getStoredWidgetOrder());
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  const activeClients = clients.filter((client) => client.status === 'active');
  const unpaidInvoices = financials.filter((item) => item.type === 'invoice' && item.status !== 'paid');
  const totalInvoiceAmount = financials
    .filter((item) => item.type === 'invoice')
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const burnRate = totalInvoiceAmount > 0 ? Math.round((unpaidAmount / totalInvoiceAmount) * 100) : 0;
  const todayLabel = getTodayLabel();
  const welcomeSummary = buildTodaySummary({
    activeClients: activeClients.length,
    unpaidInvoices: unpaidInvoices.length,
    unpaidAmount,
    burnRate,
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(widgetOrder));
    } catch {
      // best effort only
    }
  }, [widgetOrder]);

  const moveWidget = (fromId, toId) => {
    if (fromId === toId) {
      return;
    }

    setWidgetOrder((current) => {
      const next = current.filter((id) => id !== fromId);
      const targetIndex = next.indexOf(toId);

      if (targetIndex < 0) {
        return current;
      }

      next.splice(targetIndex, 0, fromId);
      return next;
    });
  };

  const handleDragStart = (widgetId) => (event) => {
    setDraggingWidget(widgetId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', widgetId);
  };

  const handleDragEnd = () => {
    setDraggingWidget(null);
    setDragOverWidget(null);
  };

  const handleDropOn = (targetWidgetId) => (event) => {
    event.preventDefault();
    const sourceWidgetId = event.dataTransfer.getData('text/plain') || draggingWidget;
    setDraggingWidget(null);
    setDragOverWidget(null);
    if (sourceWidgetId) {
      moveWidget(sourceWidgetId, targetWidgetId);
    }
  };

  const renderWidget = (widgetId) => {
    switch (widgetId) {
      case 'welcome':
        return (
          <DashboardWidgetShell key="welcome" className="2xl:col-span-4" draggable dragHandleProps={{ onMouseDown: () => {} }}>
            <section className="relative overflow-hidden border border-white/10 bg-white/[0.04] p-5">
              <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ TODAY ]</div>
              <h2 className="mt-2 font-serif text-3xl font-black uppercase tracking-[0.06em] text-neon-green">{todayLabel}</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-neutral-200">{welcomeSummary}</p>
            </section>
          </DashboardWidgetShell>
        );
      case 'burnRate':
        return (
          <DashboardWidgetShell
            key="burnRate"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('burnRate'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('burnRate'),
            }}
          >
            <section className="relative overflow-hidden bg-neon-red p-5 text-black">
              <CardGlyph />
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.7em] text-black/70">[ THE PULSE ]</div>
                  <h2 className="mt-2 font-serif text-3xl font-black uppercase tracking-[0.08em] text-black">Burn Rate</h2>
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
          </DashboardWidgetShell>
        );
      case 'xp':
        return (
          <DashboardWidgetShell
            key="xp"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('xp'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('xp'),
            }}
          >
            <XpLevelCard />
          </DashboardWidgetShell>
        );
      case 'clients':
        return (
          <DashboardWidgetShell
            key="clients"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('clients'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('clients'),
            }}
          >
            <SectionShell eyebrow="[ ACTIVE CLIENTS ]" title="Vault Access">
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
          </DashboardWidgetShell>
        );
      case 'hunt':
        return (
          <DashboardWidgetShell
            key="hunt"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('hunt'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('hunt'),
            }}
          >
            <HuntCard />
          </DashboardWidgetShell>
        );
      case 'comms':
        return (
          <DashboardWidgetShell
            key="comms"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('comms'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('comms'),
            }}
          >
            <CommsTracker />
          </DashboardWidgetShell>
        );
      case 'money':
        return (
          <DashboardWidgetShell
            key="money"
            className="2xl:col-span-2"
            draggable
            dragHandleProps={{
              draggable: true,
              onDragStart: handleDragStart('money'),
              onDragEnd: handleDragEnd,
              onDragOver: (event) => event.preventDefault(),
              onDrop: handleDropOn('money'),
            }}
          >
            <MoneyCycler financials={financials} />
          </DashboardWidgetShell>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 2xl:grid-cols-4">
        {widgetOrder.map((widgetId) => {
          const node = renderWidget(widgetId);
          if (!node) {
            return null;
          }

          return (
            <div
              key={widgetId}
              onDragOver={(event) => {
                event.preventDefault();
                setDragOverWidget(widgetId);
              }}
              onDrop={handleDropOn(widgetId)}
              onDragEnter={(event) => {
                event.preventDefault();
                setDragOverWidget(widgetId);
              }}
              onDragLeave={() => {
                if (dragOverWidget === widgetId) {
                  setDragOverWidget(null);
                }
              }}
              className={dragOverWidget === widgetId ? 'outline outline-2 outline-neon-green' : ''}
            >
              {node}
            </div>
          );
        })}
      </div>
    </div>
  );
}
