import React, { useEffect, useMemo, useState } from 'react';

const LABELS = {
  dashboard: 'DASHBOARD',
  clients: 'CLIENT VAULT',
  leads: 'LEADS',
  receipts: 'RECEIPTS',
  financials: 'FINANCIALS',
};

const DOCK_STORAGE_KEY = 'freelanceos.quickDockUrls';
const QUOTES = [
  { text: 'Stay calibrated. Small actions compound into clean results.', source: 'Affirmation' },
  { text: 'When the signal is noisy, trust the next precise move.', source: 'Neon Genesis Evangelion' },
  { text: 'You do not need perfect conditions to begin.', source: 'Affirmation' },
  { text: 'Even in the quiet spaces, momentum is still momentum.', source: 'Monster' },
  { text: 'Protect your energy, then spend it with intent.', source: 'Frieren' },
  { text: 'Hard days are part of the build. Keep shipping anyway.', source: 'Affirmation' },
  { text: 'The board is never empty. It is simply waiting for a deliberate move.', source: 'Affirmation' },
  { text: 'Keep the surface calm and the system honest.', source: 'Affirmation' },
  { text: 'Good tooling disappears. Good habits remain.', source: 'Affirmation' },
  { text: 'Small fixes compound faster than big intentions.', source: 'Affirmation' },
];

function normalizeDockUrl(input) {
  const value = input.trim();
  if (!value) return null;
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
    if (typeof window === 'undefined') return [];
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
      // best effort
    }
  }, [urls]);

  return {
    urls,
    draft,
    setDraft,
    addUrl: () => {
      const normalized = normalizeDockUrl(draft);
      if (!normalized) return;
      setUrls((current) => (current.includes(normalized) ? current : [...current, normalized]));
      setDraft('');
    },
  };
}

function QuickDock() {
  const { urls, draft, setDraft, addUrl } = useDockUrls();

  return (
    <section className="rounded-2xl border border-neutral-800 bg-[var(--card-bg)] p-3 shadow-[var(--card-shadow)]">
      <div className="text-[10px] uppercase tracking-[0.55em] text-neutral-500">[ QUICK DOCK ]</div>
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
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-800 bg-black/45 opacity-75 grayscale transition hover:opacity-100 hover:grayscale-0"
              >
                <img src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`} alt={host} className="h-6 w-6" />
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
          className="min-w-0 flex-1 rounded-xl border border-neutral-800 bg-black/45 px-3 py-2 text-xs text-[#c4ff0e] outline-none placeholder:text-neutral-600"
        />
        <button
          type="button"
          onClick={addUrl}
          className="rounded-xl border border-neutral-700 bg-white/[0.03] px-3 py-2 text-xs font-bold uppercase tracking-[0.35em] text-[#c4ff0e] transition hover:bg-white/[0.06]"
        >
          +
        </button>
      </div>
    </section>
  );
}

function useRotatingQuote() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (QUOTES.length <= 1) return undefined;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % QUOTES.length), 15000);
    return () => window.clearInterval(timer);
  }, []);

  return QUOTES[index] ?? QUOTES[0];
}

function QuoteBar() {
  const quote = useRotatingQuote();
  if (!quote) return null;
  return (
    <footer className="mt-4 hidden rounded-2xl border border-neutral-800 bg-[var(--card-bg)] px-4 py-3 sm:block">
      <div className="flex flex-col gap-1 text-[11px] leading-relaxed text-neutral-300 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="max-w-4xl">
          <span className="mr-2 text-[#c4ff0e]">/</span>
          {quote.text}
        </p>
        <p className="shrink-0 uppercase tracking-[0.35em] text-neutral-500">{quote.source}</p>
      </div>
    </footer>
  );
}

function LogoMark() {
  return (
    <svg width="34" height="34" viewBox="0 0 40 40" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="text-white">
      <rect x="5" y="5" width="10" height="30" />
      <rect x="18" y="5" width="15" height="9" />
      <rect x="18" y="17" width="9" height="7" />
    </svg>
  );
}

function CommandButton({ onOpenMenu }) {
  return (
    <button
      type="button"
      onClick={onOpenMenu}
      className="group flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c4ff0e] text-black shadow-[0_14px_24px_rgba(0,0,0,0.45)] transition hover:scale-[1.02]"
      aria-label="Open commands"
    >
      <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
        <path d="M3 3h7v7H3zM12 3h7v7h-7zM3 12h7v7H3zM12 12h7v7h-7z" />
      </svg>
    </button>
  );
}

function CommandMenu({
  open,
  onClose,
  onAdd,
  onLog,
  onReset,
  theme,
  onThemeChange,
  onOpenSettings,
  onEnableNotifications,
  onTestNotification,
  onToggleNotifications,
  onInstallApp,
  canInstallApp,
  isAppInstalled,
  notificationsEnabled,
  notificationsPermission,
}) {
  if (!open) return null;
  return (
    <div className="pointer-events-none fixed inset-0 z-50">
      <div className="absolute bottom-6 left-6 h-[33rem] w-[33rem]">
        <div className="command-orb command-orb-open" />
        <button
          type="button"
          onClick={onClose}
          className="pointer-events-auto absolute bottom-0 left-0 flex h-14 w-14 items-center justify-center rounded-full border border-[#c4ff0e] bg-[#c4ff0e] text-black shadow-[0_18px_38px_rgba(0,0,0,0.45)]"
          aria-label="Close commands"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="currentColor">
            <path d="M3 3h16v16H3z" />
          </svg>
        </button>
        <div className="command-row command-row-top">
          <div className="command-node command-node-a">
            <button type="button" onClick={() => { onAdd?.(); onClose?.(); }} className="pointer-events-auto command-pill">add</button>
          </div>
          <div className="command-node command-node-b">
            <button type="button" onClick={() => { onLog?.(); onClose?.(); }} className="pointer-events-auto command-pill">log</button>
          </div>
          <div className="command-node command-node-c">
            <button type="button" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')} className="pointer-events-auto command-pill">{theme === 'light' ? 'dark' : 'light'}</button>
          </div>
          <div className="command-node command-node-d">
            <button type="button" onClick={() => { onOpenSettings?.(); onClose?.(); }} className="pointer-events-auto command-pill">settings</button>
          </div>
        </div>
        <div className="command-row command-row-bottom">
          <div className="command-node command-node-e">
            <button type="button" onClick={() => { onReset?.(); onClose?.(); }} className="pointer-events-auto command-pill">reset</button>
          </div>
          <div className="command-node command-node-f">
            <button type="button" onClick={() => { onToggleNotifications?.(); onClose?.(); }} className="pointer-events-auto command-pill">{notificationsEnabled ? 'nudge off' : 'nudge on'}</button>
          </div>
          <div className="command-node command-node-g">
            <button type="button" onClick={() => { onTestNotification?.(); onClose?.(); }} className="pointer-events-auto command-pill">test</button>
          </div>
          <div className="command-node command-node-h">
            <button type="button" onClick={() => { onInstallApp?.(); onClose?.(); }} className="pointer-events-auto command-pill">{isAppInstalled ? 'installed' : canInstallApp ? 'install' : 'not ready'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SyncIndicator({ status, lastSynced, onForceSync }) {
  const statusLabel = { idle: 'SYNCED', syncing: 'SYNCING', error: 'ERROR' }[status] ?? 'SYNCED';
  const label = lastSynced ? new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'never';
  return (
    <button
      type="button"
      onClick={onForceSync}
      className="flex w-full items-center justify-between rounded-2xl border border-neutral-800 bg-white/[0.03] px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.35em] text-[var(--app-text)] transition hover:bg-white/[0.06]"
      title={`Last synced ${label}`}
    >
      <span className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${status === 'error' ? 'bg-[#f97316]' : 'bg-[#c4ff0e]'}`} />
        <span>CLOUD</span>
      </span>
      <span className="text-[10px] tracking-[0.45em] text-neutral-500">{statusLabel}</span>
    </button>
  );
}

export function AppLayout({
  activeView,
  navItems,
  onViewChange,
  syncStatus,
  lastSynced,
  onForceSync,
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
  onLogOpen,
  children,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commandsOpen, setCommandsOpen] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="relative mx-auto flex min-h-screen max-w-[1600px] gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-[320px] shrink-0 flex-col gap-4 bg-[var(--panel-bg)] p-4 lg:flex">
          <div className="rounded-xl border border-neutral-800 bg-[var(--card-bg)] p-3 shadow-[var(--card-shadow)]">
            <LogoMark />
            <h1 className="font-display mt-2 max-w-[11ch] text-[2.3rem] font-black leading-[0.82] tracking-[0.01em] normal-case text-[#c4ff0e]">
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
                    'flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.45em] transition',
                    active
                      ? 'border-neutral-700 bg-white/[0.06] text-[var(--app-text)]'
                      : 'border-neutral-800 bg-white/[0.03] text-neutral-300 hover:bg-white/[0.06] hover:text-[var(--app-text)]',
                  ].join(' ')}
                >
                  <span>{LABELS[item] ?? item}</span>
                  <span className="text-neutral-500">[{String(active ? 'on' : 'off').toUpperCase()}]</span>
                </button>
              );
            })}
          </nav>

          <SyncIndicator status={syncStatus} lastSynced={lastSynced} onForceSync={onForceSync} />
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 rounded-2xl border border-neutral-800 bg-[var(--card-bg)] px-4 py-4 shadow-[var(--card-shadow)] lg:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <LogoMark />
                <div className="min-w-0">
                  <div className="text-[9px] uppercase tracking-[0.55em] text-neutral-500">[ SYSTEM ]</div>
                  <h1 className="font-display mt-1 truncate text-[2rem] font-black leading-[0.95] tracking-[0.02em] normal-case text-[#c4ff0e] sm:text-[2.35rem]">
                    FreelanceOS
                  </h1>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCommandsOpen((current) => !current)}
                className="rounded-2xl bg-[#c4ff0e] px-3 py-2 text-xs font-black uppercase tracking-[0.45em] text-black"
              >
                menu
              </button>
            </div>
            <div className="mt-3">
              <SyncIndicator status={syncStatus} lastSynced={lastSynced} onForceSync={onForceSync} />
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
                      ? 'bg-[#c4ff0e] text-black'
                      : 'bg-[var(--card-bg)] text-[var(--muted-text)] hover:bg-[var(--card-hover)] hover:text-[var(--app-text)]',
                  ].join(' ')}
                >
                  {LABELS[item] ?? item}
                </button>
              );
            })}
          </nav>

          <main className="rounded-2xl bg-[var(--surface-bg)] p-4 pb-20 shadow-[var(--card-shadow)] sm:p-6 sm:pb-20">
            {updateAvailable ? (
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f97316]/30 bg-[#f97316]/10 px-4 py-3 text-black">
                <div className="min-w-0">
                  <div className="text-[10px] uppercase tracking-[0.55em] text-black/60">[ UPDATE READY ]</div>
                  <div className="mt-1 text-sm font-bold uppercase tracking-[0.25em] text-black">A newer version is available.</div>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={onRefreshApp} className="rounded-xl bg-black px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-[#f97316]">
                    refresh
                  </button>
                  <button type="button" onClick={onDismissUpdate} className="rounded-xl border border-black/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black">
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

      <div className="fixed bottom-6 left-6 z-40">
        <CommandButton onOpenMenu={() => setCommandsOpen((current) => !current)} />
      </div>

      <CommandMenu
        open={commandsOpen}
        onClose={() => setCommandsOpen(false)}
        onAdd={onLogOpen}
        onLog={onLogOpen}
        onReset={onResetLocalData}
        theme={theme}
        onThemeChange={onThemeChange}
        onOpenSettings={() => setSettingsOpen(true)}
        onEnableNotifications={onEnableNotifications}
        onTestNotification={onTestNotification}
        onToggleNotifications={onToggleNotifications}
        onInstallApp={onInstallApp}
        canInstallApp={canInstallApp}
        isAppInstalled={isAppInstalled}
        notificationsEnabled={notificationsEnabled}
        notificationsPermission={notificationsPermission}
      />

      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-[var(--panel-bg)] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ SETTINGS ]</div>
                <h2 className="mt-2 font-serif text-3xl text-[var(--app-text)]">System Menu</h2>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="rounded-xl bg-white/5 px-3 py-2 text-[10px] uppercase tracking-[0.45em] text-[var(--muted-text)]"
              >
                close
              </button>
            </div>

            <div className="mt-5 space-y-3">
              <SettingsButton label="Reset Local Data" description="Clear all local records and restore an empty workspace." onClick={() => { onResetLocalData(); setSettingsOpen(false); }} />
              <SettingsButton label={mode === 'light' ? 'Light Mode: On' : 'Light Mode: Off'} description="Switch the app between dark and light presentation." onClick={() => onModeChange(mode === 'light' ? 'dark' : 'light')} />
              <SettingsButton label={isAppInstalled ? 'App Installed' : canInstallApp ? 'Install App' : 'Install Not Ready'} description={canInstallApp ? 'Open the browser install dialogue to add FreelanceOS to your device.' : isAppInstalled ? 'FreelanceOS is already installed on this device.' : 'Install becomes available once the browser exposes the app prompt.'} onClick={onInstallApp} />
              <SettingsButton label={notificationsEnabled ? `Notifications: ${notificationsPermission}` : 'Enable Notifications'} description="Receive deadline and follow-up nudges in Chrome." onClick={onEnableNotifications} />
              <SettingsButton label="Test Notification" description="Send a quick local notification to confirm Chrome support." onClick={onTestNotification} />
              <SettingsButton label={notificationsEnabled ? 'Pause NUDGES' : 'Resume NUDGES'} description="Temporarily mute or resume deadline reminders." onClick={onToggleNotifications} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettingsButton({ label, description, onClick }) {
  return (
    <button type="button" onClick={onClick} className="w-full rounded-2xl border border-neutral-800 bg-white/[0.04] px-4 py-4 text-left transition hover:bg-white/[0.08]">
      <div className="text-sm font-bold text-[var(--app-text)]">{label}</div>
      <div className="mt-1 text-xs text-[var(--muted-text)]">{description}</div>
    </button>
  );
}
