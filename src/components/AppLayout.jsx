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
    <footer className="mt-4 hidden border-t border-white/10 bg-black/70 px-4 py-3 sm:block sm:px-6">
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
    <svg width="40" height="40" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
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
  theme,
  mode,
  onThemeChange,
  onModeChange,
  onResetLocalData,
  canInstallApp,
  isAppInstalled,
  onInstallApp,
  updateAvailable,
  onRefreshApp,
  onDismissUpdate,
  notificationsEnabled,
  notificationsPermission,
  onEnableNotifications,
  onTestNotification,
  onToggleNotifications,
  children,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
      {theme === 'neonos' ? (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="neon-bg-grid" />
          <div className="neon-bg-orb neon-bg-orb-a" />
          <div className="neon-bg-orb neon-bg-orb-b" />
          <div className="neon-bg-scanlines" />
        </div>
      ) : null}
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[320px] shrink-0 flex-col gap-4 bg-[var(--panel-bg)] p-4 lg:flex">
          <div className="rounded-3xl bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)]">
            <LogoMark />
            <h1 className="mt-3 max-w-[10ch] font-serif text-[2.6rem] font-black leading-[0.9] tracking-[0.02em] text-neon-green">
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

          <div className="rounded-3xl bg-[var(--card-bg)] p-4 shadow-[var(--card-shadow)]">
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
          <header className="mb-4 rounded-3xl bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow)] lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <LogoMark />
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.55em] text-neutral-500">[ SYSTEM ]</div>
                  <h1 className="mt-1 truncate font-serif text-[2rem] font-black leading-[0.95] tracking-[0.02em] text-neon-green sm:text-[2.35rem]">
                    FreelanceOS
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSettingsOpen(true)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/85 text-sm font-bold text-white shadow-lg"
                  title="Settings"
                >
                  ⚙
                </button>
                <button
                  type="button"
                  onClick={onQuickAddOpen}
                  className="bg-neon-green px-3 py-2 text-[10px] font-bold uppercase tracking-[0.5em] text-black"
                >
                  + add
                </button>
              </div>
            </div>
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
                    'rounded-2xl px-3 py-3 text-[10px] font-bold uppercase tracking-[0.45em] transition',
                    active
                      ? 'bg-neon-green text-black'
                      : 'bg-[var(--card-bg)] text-[var(--muted-text)] hover:bg-[var(--card-hover)] hover:text-[var(--app-text)]',
                  ].join(' ')}
                >
                  {LABELS[item] ?? item}
                </button>
              );
            })}
          </nav>

          <main className="rounded-[2rem] bg-[var(--surface-bg)] p-4 pb-20 shadow-[var(--card-shadow)] sm:p-6 sm:pb-20">
            {updateAvailable ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-black">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.55em] text-black/60">[ UPDATE READY ]</div>
                  <div className="mt-1 text-sm font-bold uppercase tracking-[0.25em] text-black">A newer version is available.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onRefreshApp}
                    className="bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-neon-green transition hover:bg-neutral-950"
                  >
                    refresh
                  </button>
                  <button
                    type="button"
                    onClick={onDismissUpdate}
                    className="border border-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black transition hover:bg-black/5"
                  >
                    later
                  </button>
                </div>
              </div>
            ) : null}
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

      <button
        type="button"
        onClick={() => setSettingsOpen(true)}
        className="fixed bottom-5 left-5 z-40 hidden rounded-full border border-white/10 bg-black/70 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.45em] text-white shadow-lg transition hover:bg-black/85 hover:opacity-100 lg:block lg:bg-black/40 lg:opacity-40"
        title="Settings"
      >
        settings
      </button>

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-[var(--panel-bg)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ SETTINGS ]</div>
                <h2 className="mt-2 font-serif text-3xl text-[var(--app-text)]">System Menu</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-full bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.45em] text-[var(--muted-text)]"
              >
                close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <SettingsButton
                label="Reset Local Data"
                description="Clear all local records and restore an empty workspace."
                onClick={() => {
                  onResetLocalData();
                  setSettingsOpen(false);
                }}
              />
              <SettingsButton
                label={mode === 'light' ? 'Light Mode: On' : 'Light Mode: Off'}
                description="Switch the app between dark and light presentation."
                onClick={() => onModeChange(mode === 'light' ? 'dark' : 'light')}
              />
              <SettingsButton
                label={isAppInstalled ? 'App Installed' : canInstallApp ? 'Install App' : 'Install Not Ready'}
                description={
                  canInstallApp
                    ? 'Open the browser install dialogue to add FreelanceOS to your device.'
                    : isAppInstalled
                      ? 'FreelanceOS is already installed on this device.'
                      : 'Install becomes available once the browser exposes the app prompt.'
                }
                onClick={onInstallApp}
              />
              <SettingsButton
                label={notificationsEnabled ? `Notifications: ${notificationsPermission}` : 'Enable Notifications'}
                description="Receive deadline and follow-up nudges in Chrome."
                onClick={onEnableNotifications}
              />
              <SettingsButton
                label="Test Notification"
                description="Send a quick local notification to confirm Chrome support."
                onClick={onTestNotification}
              />
              <SettingsButton
                label={notificationsEnabled ? 'Pause NUDGES' : 'Resume NUDGES'}
                description="Temporarily mute or resume deadline reminders."
                onClick={onToggleNotifications}
              />

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-[10px] uppercase tracking-[0.55em] text-neutral-500">Theme</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <ThemeChoice
                    active={theme === 'neonos'}
                    title="NeonOS"
                    description="Current neon terminal look."
                    onClick={() => onThemeChange('neonos')}
                  />
                  <ThemeChoice
                    active={theme === 'boringos'}
                    title="BoringOS"
                    description="Rounded, clean, modern UI."
                    onClick={() => onThemeChange('boringos')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsButton({ label, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]"
    >
      <div className="text-sm font-bold text-[var(--app-text)]">{label}</div>
      <div className="mt-1 text-xs text-[var(--muted-text)]">{description}</div>
    </button>
  );
}

function ThemeChoice({ active, title, description, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-2xl border px-4 py-4 text-left transition',
        active ? 'border-neon-green bg-neon-green/10' : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]',
      ].join(' ')}
    >
      <div className="text-sm font-bold text-[var(--app-text)]">{title}</div>
      <div className="mt-1 text-xs text-[var(--muted-text)]">{description}</div>
    </button>
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
      className={`relative flex w-full flex-nowrap items-center justify-between gap-3 whitespace-nowrap rounded-2xl px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.35em] leading-none transition ${statusClass}`}
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

