import React, { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Dashboard } from './components/Dashboard';
import { AppLayout } from './components/AppLayout';
import { ClientsView } from './components/ClientsView';
import { LeadsView } from './components/LeadsView';
import { FinancialsView } from './components/FinancialsView';
import { ReceiptsView } from './components/ReceiptsView';
import { QuickAddModal } from './components/QuickAddModal';
import { useCloudSync } from './hooks/useCloudSync';

const NAV_ITEMS = ['dashboard', 'clients', 'leads', 'receipts', 'financials'];
const TEST_DATA_WIPED_KEY = 'freelanceos.testDataWiped';
const THEME_STORAGE_KEY = 'freelanceos.theme';
const MODE_STORAGE_KEY = 'freelanceos.mode';

function getStoredSetting(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  return value ?? fallback;
}

function useWipeDemoDataOnce() {
  useEffect(() => {
    const alreadyWiped = window.localStorage.getItem(TEST_DATA_WIPED_KEY) === '1';
    if (alreadyWiped) {
      return;
    }

    window.localStorage.setItem(TEST_DATA_WIPED_KEY, '1');

    void db.transaction('rw', db.leads, db.clients, db.financials, db.gamification, db.receipts, db.commsTracker, async () => {
      await Promise.all([
        db.leads.clear(),
        db.clients.clear(),
        db.financials.clear(),
        db.gamification.clear(),
        db.receipts.clear(),
        db.commsTracker.clear(),
      ]);
    });
  }, []);
}

export function App() {
  const leads = useLiveQuery(() => db.leads.toArray(), []);
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const financials = useLiveQuery(() => db.financials.toArray(), []);
  const receipts = useLiveQuery(() => db.receipts.orderBy('date').reverse().toArray(), []);
  const { status: syncStatus, lastSynced, forceSync } = useCloudSync();
  useWipeDemoDataOnce();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredSetting(THEME_STORAGE_KEY, 'neonos'));
  const [mode, setMode] = useState(() => getStoredSetting(MODE_STORAGE_KEY, 'dark'));
  const resetLocalData = () => {
    window.localStorage.removeItem(TEST_DATA_WIPED_KEY);
    void db.transaction('rw', db.leads, db.clients, db.financials, db.gamification, db.receipts, db.commsTracker, async () => {
      await Promise.all([
        db.leads.clear(),
        db.clients.clear(),
        db.financials.clear(),
        db.gamification.clear(),
        db.receipts.clear(),
        db.commsTracker.clear(),
      ]);
    });
  };

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    window.localStorage.setItem(MODE_STORAGE_KEY, mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.mode = mode;
  }, [theme, mode]);

  useEffect(() => {
    if (activeView !== 'clients' || selectedClientId) {
      return;
    }

    const firstClient = clients?.find((client) => client.status === 'active') ?? clients?.[0];
    setSelectedClientId(firstClient?.id ?? null);
  }, [activeView, clients, selectedClientId]);

  const handleOpenClient = (clientId) => {
    setSelectedClientId(clientId);
    setActiveView('clients');
  };

  return (
    <>
      <AppLayout
        activeView={activeView}
        onViewChange={setActiveView}
        navItems={NAV_ITEMS}
        syncStatus={syncStatus}
        lastSynced={lastSynced}
        onForceSync={forceSync}
        onQuickAddOpen={() => setQuickAddOpen(true)}
        theme={theme}
        mode={mode}
        onThemeChange={setTheme}
        onModeChange={setMode}
        onResetLocalData={resetLocalData}
      >
        {activeView === 'dashboard' && (
          <Dashboard clients={clients ?? []} financials={financials ?? []} onOpenClient={handleOpenClient} />
        )}
        {activeView === 'clients' && (
          <ClientsView clients={clients ?? []} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} />
        )}
        {activeView === 'leads' && <LeadsView leads={leads ?? []} />}
        {activeView === 'receipts' && <ReceiptsView receipts={receipts ?? []} />}
        {activeView === 'financials' && <FinancialsView financials={financials ?? []} clients={clients ?? []} />}
      </AppLayout>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
