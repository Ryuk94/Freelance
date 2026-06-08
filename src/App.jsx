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
const THEME_STORAGE_KEY = 'freelanceos.theme';
const MODE_STORAGE_KEY = 'freelanceos.mode';
const NOTIFICATION_STORAGE_KEY = 'freelanceos.notificationsEnabled';
const NOTIFIED_ITEMS_STORAGE_KEY = 'freelanceos.notifiedItems';
const DB_BACKUP_STORAGE_KEY = 'freelanceos.dbBackup';
const DB_BACKUP_TABLES = ['leads', 'clients', 'financials', 'receipts', 'gamification', 'commsTracker'];

function getStoredSetting(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  return value ?? fallback;
}

function getStoredJson(key, fallback) {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function getStoredDbBackup() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(DB_BACKUP_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

function setStoredDbBackup(snapshot) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DB_BACKUP_STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // Best effort only.
  }
}

function isLoaded(rows) {
  return rows !== undefined;
}

function hasAnyRows(snapshot) {
  return DB_BACKUP_TABLES.some((table) => Array.isArray(snapshot?.[table]) && snapshot[table].length > 0);
}

function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia?.('(display-mode: standalone)')?.matches || window.navigator.standalone === true;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return { ok: false, reason: 'unavailable' };
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    return { ok: outcome === 'accepted', outcome };
  };

  return {
    canInstall: Boolean(deferredPrompt),
    isInstalled,
    promptInstall,
  };
}

function useReminderNotifications({ leads, financials }) {
  const [enabled, setEnabled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem(NOTIFICATION_STORAGE_KEY) === '1';
  });
  const [permission, setPermission] = useState(() => (typeof Notification !== 'undefined' ? Notification.permission : 'default'));
  const notifiedItemsRef = useState(() => new Set(getStoredJson(NOTIFIED_ITEMS_STORAGE_KEY, [])))[0];

  useEffect(() => {
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, enabled ? '1' : '0');
  }, [enabled]);

  useEffect(() => {
    window.localStorage.setItem(NOTIFIED_ITEMS_STORAGE_KEY, JSON.stringify(Array.from(notifiedItemsRef)));
  });

  useEffect(() => {
    if (typeof Notification === 'undefined') {
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if (typeof Notification === 'undefined') {
      return { ok: false, reason: 'unsupported' };
    }

    const nextPermission = await Notification.requestPermission();
    setPermission(nextPermission);
    const nextEnabled = nextPermission === 'granted';
    setEnabled(nextEnabled);
    return { ok: nextEnabled, permission: nextPermission };
  };

  const notify = async (title, body) => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker?.ready;
      if (registration?.showNotification) {
        await registration.showNotification(title, {
          body,
          icon: '/pwa.svg',
          badge: '/pwa.svg',
          tag: `freelanceos-${title}`,
        });
      } else {
        new Notification(title, {
          body,
          icon: '/pwa.svg',
          tag: `freelanceos-${title}`,
        });
      }

      return true;
    } catch (error) {
      console.error('[FreelanceOS] Notification failed', error);
      return false;
    }
  };

  useEffect(() => {
    if (!enabled || permission !== 'granted') {
      return;
    }

    const overdueLead = (leads ?? []).find((lead) => lead.status === 'hunting' && !lead.deletedAt && !notifiedItemsRef.has(`lead-${lead.id}`));
    const overdueInvoice = (financials ?? []).find(
      (entry) =>
        entry.type === 'invoice' &&
        entry.status !== 'paid' &&
        !entry.deletedAt &&
        !notifiedItemsRef.has(`invoice-${entry.id}`),
    );

    if (!overdueLead && !overdueInvoice) {
      return;
    }

    const timerId = window.setInterval(async () => {
      const nextLead = (leads ?? []).find((lead) => lead.status === 'hunting' && !lead.deletedAt && !notifiedItemsRef.has(`lead-${lead.id}`));
      if (nextLead) {
        notifiedItemsRef.add(`lead-${nextLead.id}`);
        await notify('Follow-up reminder', `${nextLead.companyName} is still waiting for a follow-up.`);
      }

      const nextInvoice = (financials ?? []).find(
        (entry) =>
          entry.type === 'invoice' &&
          entry.status !== 'paid' &&
          !entry.deletedAt &&
          !notifiedItemsRef.has(`invoice-${entry.id}`),
      );
      if (nextInvoice) {
        notifiedItemsRef.add(`invoice-${nextInvoice.id}`);
        await notify('Invoice reminder', `Invoice ${nextInvoice.id} is still open.`);
      }
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timerId);
  }, [enabled, financials, leads, notify, notifiedItemsRef, permission]);

  return {
    enabled,
    permission,
    requestPermission,
    setEnabled,
    notify,
  };
}

export function App() {
  const leads = useLiveQuery(() => db.leads.toArray(), []);
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const financials = useLiveQuery(() => db.financials.toArray(), []);
  const receipts = useLiveQuery(() => db.receipts.orderBy('date').reverse().toArray(), []);
  const gamificationRows = useLiveQuery(() => db.gamification.toArray(), []);
  const commsRows = useLiveQuery(() => db.commsTracker.toArray(), []);
  const { status: syncStatus, lastSynced, forceSync } = useCloudSync();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredSetting(THEME_STORAGE_KEY, 'neonos'));
  const [mode, setMode] = useState(() => getStoredSetting(MODE_STORAGE_KEY, 'dark'));
  const installPrompt = useInstallPrompt();
  const notifications = useReminderNotifications({ leads: leads ?? [], financials: financials ?? [] });
  const resetLocalData = () => {
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

  const visibleLeads = (leads ?? []).filter((lead) => !lead.deletedAt);
  const visibleClients = (clients ?? []).filter((client) => !client.deletedAt);
  const visibleFinancials = (financials ?? []).filter((entry) => !entry.deletedAt);
  const visibleReceipts = (receipts ?? []).filter((receipt) => !receipt.deletedAt);

  useEffect(() => {
    const allLoaded =
      isLoaded(leads) &&
      isLoaded(clients) &&
      isLoaded(financials) &&
      isLoaded(receipts) &&
      isLoaded(gamificationRows) &&
      isLoaded(commsRows);

    if (!allLoaded) {
      return;
    }

    const snapshot = {
      leads,
      clients,
      financials,
      receipts,
      gamification: gamificationRows,
      commsTracker: commsRows,
    };

    if (!hasAnyRows(snapshot)) {
      const backup = getStoredDbBackup();
      if (hasAnyRows(backup)) {
        void db.transaction('rw', db.leads, db.clients, db.financials, db.receipts, db.gamification, db.commsTracker, async () => {
          await Promise.all([
            db.leads.bulkPut(Array.isArray(backup?.leads) ? backup.leads : []),
            db.clients.bulkPut(Array.isArray(backup?.clients) ? backup.clients : []),
            db.financials.bulkPut(Array.isArray(backup?.financials) ? backup.financials : []),
            db.receipts.bulkPut(Array.isArray(backup?.receipts) ? backup.receipts : []),
            db.gamification.bulkPut(Array.isArray(backup?.gamification) ? backup.gamification : []),
            db.commsTracker.bulkPut(Array.isArray(backup?.commsTracker) ? backup.commsTracker : []),
          ]);
        });
        return;
      }
    }

    setStoredDbBackup(snapshot);
  }, [clients, commsRows, financials, gamificationRows, leads, receipts]);

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

    const firstClient = visibleClients.find((client) => client.status === 'active') ?? visibleClients[0];
    setSelectedClientId(firstClient?.id ?? null);
  }, [activeView, selectedClientId, visibleClients]);

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
        canInstallApp={installPrompt.canInstall}
        isAppInstalled={installPrompt.isInstalled}
        onInstallApp={installPrompt.promptInstall}
        notificationsEnabled={notifications.enabled}
        notificationsPermission={notifications.permission}
        onEnableNotifications={notifications.requestPermission}
        onTestNotification={() => notifications.notify('FreelanceOS test', 'Notifications are working on this device.')}
        onToggleNotifications={() => notifications.setEnabled((current) => !current)}
      >
        {activeView === 'dashboard' && (
          <Dashboard clients={visibleClients} financials={visibleFinancials} onOpenClient={handleOpenClient} />
        )}
        {activeView === 'clients' && (
          <ClientsView clients={visibleClients} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} />
        )}
        {activeView === 'leads' && <LeadsView leads={visibleLeads} />}
        {activeView === 'receipts' && <ReceiptsView receipts={visibleReceipts} />}
        {activeView === 'financials' && <FinancialsView financials={visibleFinancials} clients={visibleClients} />}
      </AppLayout>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
