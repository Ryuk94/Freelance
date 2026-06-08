import React, { useEffect, useMemo, useState } from 'react';
import { CommsTracker } from './CommsTracker';
import { CalendarWidget } from './CalendarWidget';
import { HuntCard } from './HuntCard';
import { ProgressBar } from './ui/ProgressBar';
import { XpLevelCard } from './XpLevelCard';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(amount);
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

function StatusGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="text-neutral-500">
      <path d="M2 2h4v4H2zM10 2h4v4h-4zM2 10h4v4H2zM10 10h4v4h-4z" />
    </svg>
  );
}

function StatusModule({ value = '1', label = 'S' }) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-50">
      <div className="flex rounded-sm border border-neutral-700 text-[10px] font-mono tracking-widest text-neutral-400">
        <span className="border-r border-neutral-700 px-1.5 py-0.5">{label}</span>
        <span className="px-1.5 py-0.5 text-[#c4ff0e]">{value}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
  className = '',
  selected = false,
  onClick,
  onDoubleClick,
  onDragStart,
  onDragEnter,
  onDragOver,
  onDrop,
  draggable = true,
  span = 'col-span-2',
}) {
  return (
    <article
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={[
        'relative min-w-0 rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 shadow-[var(--card-shadow)] transition',
        selected ? 'ring-1 ring-[#14b8a6]/60' : '',
        span,
        className,
      ].join(' ')}
    >
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">{eyebrow}</div>
        <h2 className="mt-2 font-serif text-2xl uppercase tracking-[0.08em] text-[var(--app-text)]">{title}</h2>
      </div>
      {children}
    </article>
  );
}

function MoneyCycler({ financials }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const monthLabel = useMemo(() => currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }).toUpperCase(), [currentMonth]);
  const monthStats = useMemo(() => {
    const key = getMonthKey(currentMonth);
    const invoices = financials.filter((entry) => entry.type === 'invoice' && getMonthKey(new Date(entry.date)) === key && (entry.status === 'sent' || entry.status === 'draft'));
    return { invoices, expectedEarnings: invoices.reduce((sum, entry) => sum + Number(entry.amount || 0), 0) };
  }, [currentMonth, financials]);

  return (
    <div className="relative">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ MONEY ]</div>
          <div className="mt-2 text-sm uppercase tracking-[0.35em] text-neutral-400">Expected Earnings</div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setCurrentMonth((current) => shiftMonth(current, -1))} className="rounded-xl border border-neutral-700 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.45em] text-[#c4ff0e]">&lt;</button>
          <button type="button" onClick={() => setCurrentMonth((current) => shiftMonth(current, 1))} className="rounded-xl border border-neutral-700 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.45em] text-[#c4ff0e]">&gt;</button>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-neutral-800 bg-black/35 px-4 py-5">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">{monthLabel}</div>
        <div className="mt-3 font-mono text-5xl font-bold leading-none tracking-[0.24em] tabular-nums text-[#c4ff0e]">{formatCurrency(monthStats.expectedEarnings)}</div>
        <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.45em] text-neutral-500">
          <span>{monthStats.invoices.length} invoices</span>
          <span>draft + sent</span>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_WIDGET_ORDER = ['welcome', 'burnRate', 'xp', 'clients', 'hunt', 'comms', 'calendar', 'money'];
const DEFAULT_WIDGETS = {
  welcome: true,
  burnRate: true,
  xp: true,
  clients: true,
  hunt: true,
  comms: true,
  calendar: true,
  money: true,
};
const DASHBOARD_LAYOUT_STORAGE_KEY = 'freelanceos.dashboardWidgetOrder';
const DASHBOARD_SPAN_STORAGE_KEY = 'freelanceos.dashboardWidgetSpans';
const DASHBOARD_WIDGET_VISIBILITY_KEY = 'freelanceos.dashboardWidgetVisibility';

function getStoredJson(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredWidgetOrder() {
  const parsed = getStoredJson(DASHBOARD_LAYOUT_STORAGE_KEY, DEFAULT_WIDGET_ORDER);
  const filtered = Array.isArray(parsed) ? parsed.filter((id) => DEFAULT_WIDGET_ORDER.includes(id)) : [];
  const merged = [...filtered, ...DEFAULT_WIDGET_ORDER.filter((id) => !filtered.includes(id))];
  return merged.length === DEFAULT_WIDGET_ORDER.length ? merged : DEFAULT_WIDGET_ORDER;
}

function getStoredWidgetSpans() {
  return getStoredJson(DASHBOARD_SPAN_STORAGE_KEY, {});
}

function getStoredWidgetVisibility() {
  const parsed = getStoredJson(DASHBOARD_WIDGET_VISIBILITY_KEY, DEFAULT_WIDGETS);
  return { ...DEFAULT_WIDGETS, ...(parsed && typeof parsed === 'object' ? parsed : {}) };
}

export function Dashboard({ clients, financials, onOpenClient }) {
  const [widgetOrder, setWidgetOrder] = useState(() => getStoredWidgetOrder());
  const [widgetSpans, setWidgetSpans] = useState(() => getStoredWidgetSpans());
  const [widgetVisibility, setWidgetVisibility] = useState(() => getStoredWidgetVisibility());
  const [selectedWidget, setSelectedWidget] = useState('welcome');
  const [draggingWidget, setDraggingWidget] = useState(null);
  const [dragOverWidget, setDragOverWidget] = useState(null);
  const activeClients = clients.filter((client) => client.status === 'active');
  const unpaidInvoices = financials.filter((item) => item.type === 'invoice' && item.status !== 'paid');
  const totalInvoiceAmount = financials.filter((item) => item.type === 'invoice').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const unpaidAmount = unpaidInvoices.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const burnRate = totalInvoiceAmount > 0 ? Math.round((unpaidAmount / totalInvoiceAmount) * 100) : 0;
  const todayLabel = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    try {
      window.localStorage.setItem(DASHBOARD_LAYOUT_STORAGE_KEY, JSON.stringify(widgetOrder));
      window.localStorage.setItem(DASHBOARD_SPAN_STORAGE_KEY, JSON.stringify(widgetSpans));
      window.localStorage.setItem(DASHBOARD_WIDGET_VISIBILITY_KEY, JSON.stringify(widgetVisibility));
    } catch {}
  }, [widgetOrder, widgetSpans, widgetVisibility]);

  const moveWidget = (fromId, toId) => {
    if (fromId === toId) return;
    setWidgetOrder((current) => {
      const next = current.filter((id) => id !== fromId);
      const targetIndex = next.indexOf(toId);
      if (targetIndex < 0) return current;
      next.splice(targetIndex, 0, fromId);
      return next;
    });
  };

  const toggleSpan = (widgetId) => {
    setWidgetSpans((current) => ({
      ...current,
      [widgetId]: current[widgetId] === 'col-span-2' ? 'col-span-4' : 'col-span-2',
    }));
  };

  const toggleWidgetVisibility = (widgetId) => {
    setWidgetVisibility((current) => ({
      ...current,
      [widgetId]: !current[widgetId],
    }));
  };

  const handleDrop = (targetId) => (event) => {
    event.preventDefault();
    const sourceId = event.dataTransfer.getData('text/plain') || draggingWidget;
    setDraggingWidget(null);
    setDragOverWidget(null);
    if (sourceId) moveWidget(sourceId, targetId);
  };

  const renderWidget = (widgetId) => {
    const span = widgetSpans[widgetId] ?? (widgetId === 'welcome' ? 'col-span-4' : 'col-span-2');
    const selected = selectedWidget === widgetId;
    const common = {
      selected,
      span,
      onClick: () => setSelectedWidget(widgetId),
      onDoubleClick: () => toggleSpan(widgetId),
      onDragStart: (event) => {
        setDraggingWidget(widgetId);
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/plain', widgetId);
      },
      onDragOver: (event) => {
        event.preventDefault();
        setDragOverWidget(widgetId);
        if (draggingWidget && draggingWidget !== widgetId) {
          moveWidget(draggingWidget, widgetId);
        }
      },
      onDragEnter: () => {
        if (draggingWidget && draggingWidget !== widgetId) {
          moveWidget(draggingWidget, widgetId);
        }
      },
      onDrop: handleDrop(widgetId),
      className: dragOverWidget === widgetId ? 'ring-2 ring-[#14b8a6]/70' : '',
    };

    switch (widgetId) {
      case 'welcome':
        return (
          <Panel key={widgetId} title="Today" eyebrow="[ TODAY ]" {...common} draggable>
            <div className="space-y-3">
              <p className="max-w-4xl text-sm leading-7 text-neutral-300">
                {activeClients.length === 0 && unpaidInvoices.length === 0
                  ? 'The board is quiet right now. Use today to add new leads, capture invoices, or polish your workspace.'
                  : `You have ${activeClients.length} active clients and ${unpaidInvoices.length} open invoices worth ${formatCurrency(unpaidAmount)}. Current burn rate is ${burnRate}%.`}
              </p>
              <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                <span className="rounded-full border border-neutral-800 bg-white/[0.03] px-3 py-2">double click to resize</span>
                <span className="rounded-full border border-neutral-800 bg-white/[0.03] px-3 py-2">drag in real time</span>
              </div>
            </div>
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'burnRate':
        return (
          <Panel key={widgetId} title="Burn Rate" eyebrow="[ THE PULSE ]" {...common} draggable>
            <div className="flex items-end justify-between gap-4">
              <div className="text-sm uppercase tracking-[0.35em] text-neutral-400">Unpaid</div>
              <div className="font-mono text-3xl font-bold tracking-[0.2em] tabular-nums text-[#c4ff0e]">{formatCurrency(unpaidAmount)}</div>
            </div>
            <div className="mt-4 rounded-2xl border border-neutral-800 bg-black/35 p-4">
              <ProgressBar value={burnRate} accent="warning" label={`${burnRate}% still open`} />
            </div>
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'xp':
        return (
          <Panel key={widgetId} title="XP / Level" eyebrow="[ THE PULSE ]" {...common} draggable>
            <XpLevelCard />
          </Panel>
        );
      case 'clients':
        return (
          <Panel key={widgetId} title="Vault Access" eyebrow="[ ACTIVE CLIENTS ]" {...common} draggable>
            <div className="space-y-2">
              {activeClients.length > 0 ? activeClients.map((client) => (
                <button key={client.id} type="button" onClick={() => onOpenClient(client.id)} className="flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-white/[0.03] px-4 py-3 text-left transition hover:bg-white/[0.06]">
                  <div>
                    <div className="text-sm font-bold uppercase tracking-[0.35em] text-[var(--app-text)]">{client.name}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-[0.45em] text-neutral-500">{client.quickLinks?.length ?? 0} quick links</div>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">open</span>
                </button>
              )) : <div className="rounded-xl border border-dashed border-neutral-800 px-4 py-3 text-xs uppercase tracking-[0.45em] text-neutral-500">no active clients</div>}
            </div>
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'hunt':
        return (
          <Panel key={widgetId} title="Next Follow-Ups" eyebrow="[ THE HUNT ]" {...common} draggable>
            <HuntCard />
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'comms':
        return (
          <Panel key={widgetId} title="Slacking Tracker" eyebrow="[ COMMS ]" {...common} draggable>
            <CommsTracker />
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'money':
        return (
          <Panel key={widgetId} title="Expected Earnings" eyebrow="[ MONEY ]" {...common} draggable>
            <MoneyCycler financials={financials} />
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      case 'calendar':
        return (
          <Panel key={widgetId} title="Calendar" eyebrow="[ EVENTS ]" {...common} draggable>
            <CalendarWidget clients={clients} />
            {selected && <div className="absolute bottom-4 right-4 opacity-60"><StatusGlyph /></div>}
          </Panel>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-neutral-800 bg-[var(--card-bg)] p-3">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ WIDGET BOARD ]</div>
        <div className="flex flex-wrap items-center gap-2">
          {widgetOrder.map((widgetId) => (
            <button
              key={widgetId}
              type="button"
              onClick={() => setSelectedWidget(widgetId)}
              className={`rounded-xl border px-3 py-2 text-[10px] uppercase tracking-[0.45em] ${
                selectedWidget === widgetId ? 'border-[#14b8a6] bg-[#14b8a6]/10 text-[var(--app-text)]' : 'border-neutral-800 bg-black/35 text-neutral-400'
              }`}
            >
              {widgetId}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 2xl:grid-cols-4">
        {widgetOrder
          .filter((widgetId) => widgetVisibility[widgetId] !== false)
          .map((widgetId) => (
            <div
              key={widgetId}
              className={widgetSpans[widgetId] ?? (widgetId === 'welcome' ? 'col-span-4' : 'col-span-2')}
              onDragEnter={() => setDragOverWidget(widgetId)}
              onDragLeave={() => dragOverWidget === widgetId && setDragOverWidget(null)}
            >
              {renderWidget(widgetId)}
            </div>
          ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-neutral-800 bg-[var(--card-bg)] p-3">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ TOOLS ]</div>
        {widgetOrder.map((widgetId) => (
          <button
            key={`${widgetId}-toggle`}
            type="button"
            onClick={() => toggleWidgetVisibility(widgetId)}
            className={`rounded-xl border px-3 py-2 text-[10px] uppercase tracking-[0.45em] ${
              widgetVisibility[widgetId] === false ? 'border-neutral-700 bg-black/45 text-neutral-500' : 'border-neutral-800 bg-white/[0.04] text-[var(--app-text)]'
            }`}
          >
            {widgetVisibility[widgetId] === false ? `add ${widgetId}` : `remove ${widgetId}`}
          </button>
        ))}
      </div>
    </div>
  );
}
