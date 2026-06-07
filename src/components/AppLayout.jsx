import React from 'react';

const LABELS = {
  dashboard: 'Dashboard',
  clients: 'Clients',
  leads: 'Leads',
  financials: 'Financials',
};

export function AppLayout({
  activeView,
  navItems,
  onViewChange,
  focusMode,
  onFocusModeChange,
  syncStatus,
  lastSynced,
  onForceSync,
  onQuickAddOpen,
  children,
}) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <aside className="hidden w-64 shrink-0 rounded-3xl border border-white/5 bg-neutral-900/80 p-4 shadow-2xl shadow-black/30 backdrop-blur lg:block">
          <div className="mb-8">
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">FreelanceOS</div>
            <h1 className="mt-2 text-2xl font-black tracking-tight">The Work OS</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const active = activeView === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onViewChange(item)}
                  className={[
                    'flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition',
                    active ? 'bg-white text-neutral-950' : 'bg-white/0 text-neutral-300 hover:bg-white/5 hover:text-white',
                  ].join(' ')}
                >
                  <span>{LABELS[item]}</span>
                  <span className={active ? 'text-neutral-500' : 'text-neutral-600'}>{'->'}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-8 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-200/70">Focus Mode</p>
            <button
              type="button"
              onClick={() => onFocusModeChange(!focusMode)}
              className="mt-3 w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
            >
              {focusMode ? 'Exit Focus Mode' : 'Enter Focus Mode'}
            </button>
          </div>

          <SyncIndicator status={syncStatus} lastSynced={lastSynced} onForceSync={onForceSync} />

          <div className="mt-4 rounded-3xl border border-violet-400/20 bg-violet-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.3em] text-violet-200/70">Quick Capture</p>
            <button
              type="button"
              onClick={onQuickAddOpen}
              className="mt-3 flex w-full items-center justify-between rounded-2xl bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
            >
              <span>Quick Add (+)</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-violet-100/80">Cmd+K</span>
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-4 flex items-center justify-between rounded-3xl border border-white/5 bg-neutral-900/80 px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur lg:hidden">
            <div>
              <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">FreelanceOS</div>
              <div className="text-sm font-bold text-neutral-100">{LABELS[activeView]}</div>
            </div>
            <button
              type="button"
              onClick={() => onFocusModeChange(!focusMode)}
              className="rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-200"
            >
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>
          </header>

          <nav className="mb-4 grid grid-cols-4 gap-2 lg:hidden">
            {navItems.map((item) => {
              const active = activeView === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onViewChange(item)}
                  className={[
                    'rounded-2xl px-3 py-3 text-xs font-semibold transition',
                    active ? 'bg-white text-neutral-950' : 'bg-white/5 text-neutral-300 hover:bg-white/10',
                  ].join(' ')}
                >
                  {LABELS[item]}
                </button>
              );
            })}
          </nav>

          <main className="rounded-[2rem] border border-white/5 bg-neutral-900/40 p-4 shadow-2xl shadow-black/20 sm:p-6">
            {children}
          </main>
        </div>
      </div>

      <button
        type="button"
        onClick={onQuickAddOpen}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-violet-500 px-5 py-4 text-sm font-bold text-white shadow-[0_0_28px_rgba(139,92,246,0.35)] transition hover:bg-violet-400 lg:hidden"
      >
        Quick Add (+)
      </button>
    </div>
  );
}

function SyncIndicator({ status, lastSynced, onForceSync }) {
  const statusLabel = {
    idle: 'Synced',
    syncing: 'Syncing',
    error: 'Sync error',
  }[status] ?? 'Synced';

  const statusDot =
    status === 'syncing' ? (
      <span className="h-3 w-3 animate-spin rounded-full border-2 border-neutral-200 border-t-transparent" />
    ) : (
      <span
        className={[
          'h-3 w-3 rounded-full',
          status === 'error'
            ? 'bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.35)]'
            : 'bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.35)]',
        ].join(' ')}
      />
    );

  const title = lastSynced
    ? `Last synced ${new Date(lastSynced).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : 'Force sync now';

  return (
    <button
      type="button"
      onClick={onForceSync}
      title={title}
      className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left transition hover:bg-white/10"
    >
      <span className="flex h-5 w-5 items-center justify-center">{statusDot}</span>
      <span className="min-w-0">
        <span className="block text-[10px] uppercase tracking-[0.35em] text-neutral-500">Cloud Sync</span>
        <span className="block text-sm font-semibold text-neutral-200">{statusLabel}</span>
      </span>
    </button>
  );
}
