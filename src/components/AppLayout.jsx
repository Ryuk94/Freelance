import React, { useEffect, useState } from 'react';

const LABELS = {
  dashboard: 'DASHBOARD',
  clients: 'CLIENT VAULT',
  leads: 'LEADS',
  receipts: 'RECEIPTS',
  financials: 'FINANCIALS',
};

const DOCK_STORAGE_KEY = 'freelanceos.quickDockUrls';
const QUOTES = [
  {
    text: 'Stay calibrated. Small actions compound into clean results.',
    source: 'Affirmation',
  },
  {
    text: 'When the signal is noisy, trust the next precise move.',
    source: 'Inspired by Neon Genesis Evangelion',
  },
  {
    text: 'You do not need perfect conditions to begin.',
    source: 'Affirmation',
  },
  {
    text: 'Even in the quiet spaces, momentum is still momentum.',
    source: 'Inspired by Monster',
  },
  {
    text: 'Protect your energy, then spend it with intent.',
    source: 'Inspired by Frieren',
  },
  {
    text: 'Hard days are part of the build. Keep shipping anyway.',
    source: 'Affirmation',
  },
];

function normalizeDockUrl(input) {
  const value = input.trim();
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    try {
      return new URL(`https://${value}`).toString();
    } catch {
      return null;
    }
  }
}

function getDockHost(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function useDockUrls() {
  const [urls, setUrls] = useState(() => {
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(DOCK_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      window.localStorage.setItem(DOCK_STORAGE_KEY, JSON.stringify(urls));
    } catch {
      // localStorage is best-effort only.
    }
  }, [urls]);

  const addUrl = () => {
    const normalized = normalizeDockUrl(draft);
    if (!normalized) {
      return;
    }

    setUrls((current) => (current.includes(normalized) ? current : [...current, normalized]));
    setDraft('');
  };

  return { urls, draft, setDraft, addUrl };
}

function QuickDock() {
  const { urls, draft, setDraft, addUrl } = useDockUrls();

  return (
    <section className="bg-white/[0.04] p-3">
        <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.55em] text-neutral-400">[ QUICK DOCK ]</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {urls.length > 0 ? (
          urls.map((url) => {
            const host = getDockHost(url);
            return (
              <a
                key={url}
                href={url}
                target="_blank"
                rel="noreferrer"
                title={host}
                className="flex h-10 w-10 items-center justify-center bg-black/55 opacity-55 grayscale transition hover:bg-white/10 hover:opacity-100 hover:grayscale-0"
              >
                <img
                  src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`}
                  alt={host}
                  className="h-6 w-6"
                />
              </a>
            );
          })
        ) : (
          <div className="px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">add urls below</div>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://..."
          className="min-w-0 flex-1 bg-black/70 px-3 py-2 text-xs text-neon-green outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={addUrl}
          className="bg-neon-green px-3 py-2 text-xs font-bold uppercase tracking-[0.35em] text-black transition hover:bg-neon-green/90"
        >
          +
        </button>
      </div>
    </section>
  );
}

function useRotatingQuote() {
  const quotes = QUOTES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (quotes.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % quotes.length);
    }, 18000);

    return () => window.clearInterval(timer);
  }, [quotes.length]);

  return quotes[index] ?? quotes[0];
}

function QuoteBar() {
  const quote = useRotatingQuote();

  if (!quote) {
    return null;
  }

  return (
    <footer className="mt-4 border-t border-white/10 bg-black/70 px-4 py-3 sm:px-6">
      <div className="flex flex-col gap-1 text-[11px] leading-relaxed text-neutral-300 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="max-w-4xl">
          <span className="mr-2 text-neon-green">/</span>
          {quote.text}
        </p>
        <p className="shrink-0 uppercase tracking-[0.35em] text-neutral-500">{quote.source}</p>
      </div>
    </footer>
  );
}

function LogoMark() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="mb-2 text-[#c4ff0e]">
      <rect x="4" y="4" width="12" height="32" />
      <rect x="20" y="4" width="16" height="10" />
      <rect x="20" y="18" width="10" height="8" />
    </svg>
  );
}

export function AppLayout({
  activeView,
  navItems,
  onViewChange,
  syncStatus,
  lastSynced,
  onForceSync,
  onQuickAddOpen,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-neutral-100">
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[320px] shrink-0 flex-col gap-4 bg-black/90 p-4 lg:flex">
          <div className="bg-white/[0.04] p-4">
            <LogoMark />
            <h1 className="mt-3 font-serif text-5xl leading-[0.92] tracking-[0.08em] text-neon-green">
              FreelanceOS
            </h1>
          </div>

          <QuickDock />

          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = activeView === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onViewChange(item)}
                  className={[
                    'flex w-full items-center justify-between px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.45em] transition',
                    active
                      ? 'bg-neon-green text-black'
                      : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08] hover:text-white',
                  ].join(' ')}
                >
                  <span>{LABELS[item] ?? item}</span>
                  <span className={active ? 'text-black/70' : 'text-neutral-500'}>[{String(active ? 'on' : 'off').toUpperCase()}]</span>
                </button>
              );
            })}
          </nav>

          <div className="bg-white/[0.04] p-4">
            <p className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ QUICK ADD ]</p>
            <button
              type="button"
              onClick={onQuickAddOpen}
              className="mt-3 w-full bg-neon-green px-4 py-3 text-xs font-bold uppercase tracking-[0.5em] text-black transition hover:bg-neon-green/90"
            >
              log capture
            </button>
          </div>

          <SyncIndicator status={syncStatus} lastSynced={lastSynced} onForceSync={onForceSync} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between bg-white/[0.04] px-4 py-3 lg:hidden">
            <div>
              <div className="mt-1 text-xs uppercase tracking-[0.45em] text-neon-green">{LABELS[activeView] ?? activeView}</div>
            </div>
            <button
              type="button"
              onClick={onQuickAddOpen}
              className="bg-neon-green px-3 py-2 text-[10px] font-bold uppercase tracking-[0.5em] text-black"
            >
              + add
            </button>
          </header>

          <nav className="mb-4 grid grid-cols-2 gap-2 lg:hidden sm:grid-cols-3">
            {navItems.map((item) => {
              const active = activeView === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onViewChange(item)}
                  className={[
                    'px-3 py-3 text-[10px] font-bold uppercase tracking-[0.45em] transition',
                    active
                      ? 'bg-neon-green text-black'
                      : 'bg-white/[0.04] text-neutral-300 hover:bg-white/[0.08]',
                  ].join(' ')}
                >
                  {LABELS[item] ?? item}
                </button>
              );
            })}
          </nav>

          <main className="bg-white/[0.02] p-4 sm:p-6">
            {children}
          </main>

          <QuoteBar />
        </div>
      </div>

      <button
        type="button"
        onClick={onQuickAddOpen}
        className="fixed bottom-5 right-5 z-40 bg-neon-green px-4 py-3 text-[10px] font-bold uppercase tracking-[0.6em] text-black transition hover:bg-neon-green/90"
      >
        quick add
      </button>
    </div>
  );
}

function SyncIndicator({ status, lastSynced, onForceSync }) {
  const statusLabel = {
    idle: 'SYNCED',
    syncing: 'SYNCING',
    error: 'ERROR',
  }[status] ?? 'SYNCED';

  const statusClass =
    status === 'error'
      ? 'bg-neon-red text-black'
      : status === 'syncing'
        ? 'bg-neon-green text-black'
        : 'bg-white/[0.04] text-neutral-300';

  const dot =
    status === 'syncing' ? (
      <span className="h-3 w-3 animate-spin border-2 border-current border-t-transparent" />
    ) : (
      <span className="h-3 w-3 bg-current" />
    );

  const label = lastSynced
    ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : 'never';

  return (
    <button
      type="button"
      onClick={onForceSync}
      className={`relative flex w-full flex-nowrap items-center justify-between gap-3 whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.35em] leading-none transition ${statusClass}`}
      title={`Last synced ${label}`}
    >
      <span className="flex min-w-0 items-center gap-3 whitespace-nowrap">
        <span className="flex h-5 w-5 items-center justify-center">{dot}</span>
        <span>CLOUD</span>
      </span>
      <span className="shrink-0 whitespace-nowrap text-[10px] tracking-[0.45em]">{statusLabel}</span>
    </button>
  );
}
