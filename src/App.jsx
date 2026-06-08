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
import { ToastProvider } from './components/ToastContext';
import { useCloudSync } from './hooks/useCloudSync';

const NAV_ITEMS = ['dashboard', 'clients', 'leads', 'receipts', 'financials'];
const THEME_STORAGE_KEY = 'freelanceos.theme';
const MODE_STORAGE_KEY = 'freelanceos.mode';
const NOTIFICATION_STORAGE_KEY = 'freelanceos.notificationsEnabled';
const NOTIFIED_ITEMS_STORAGE_KEY = 'freelanceos.notifiedItems';
const APP_BASE_URL = import.meta.env.BASE_URL || '/';

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

function useServiceWorkerUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return undefined;
    }

    let registration;
    let refreshing = false;

    const handleControllerChange = () => {
      if (refreshing) {
        return;
      }

      window.location.reload();
    };

    const watchForWaitingWorker = (reg) => {
      registration = reg;

      if (reg.waiting) {
        setUpdateAvailable(true);
      }

      reg.addEventListener('updatefound', () => {
        const installingWorker = reg.installing;
        if (!installingWorker) {
          return;
        }

        installingWorker.addEventListener('statechange', () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setUpdateAvailable(true);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) {
        return;
      }

      watchForWaitingWorker(reg);
      void reg.update();
    });

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    const intervalId = window.setInterval(() => {
      void registration?.update?.();
    }, 30 * 1000);

    const handleRefreshRequest = () => {
      refreshing = true;
      window.location.reload();
    };

    window.addEventListener('app-update-refresh', handleRefreshRequest);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('app-update-refresh', handleRefreshRequest);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  return {
    updateAvailable,
    dismissUpdate: () => setUpdateAvailable(false),
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
          icon: `${APP_BASE_URL}pwa.svg`,
          badge: `${APP_BASE_URL}pwa.svg`,
          tag: `freelanceos-${title}`,
        });
      } else {
        new Notification(title, {
          body,
          icon: `${APP_BASE_URL}pwa.svg`,
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

    const overdueLead = (leads ?? []).find((lead) => lead.status === 'hunting' && !lead.isDeleted && !notifiedItemsRef.has(`lead-${lead.id}`));
    const overdueInvoice = (financials ?? []).find(
      (entry) =>
        entry.type === 'invoice' &&
        entry.status !== 'paid' &&
        !entry.isDeleted &&
        !notifiedItemsRef.has(`invoice-${entry.id}`),
    );

    if (!overdueLead && !overdueInvoice) {
      return;
    }

    const timerId = window.setInterval(async () => {
      const nextLead = (leads ?? []).find((lead) => lead.status === 'hunting' && !lead.isDeleted && !notifiedItemsRef.has(`lead-${lead.id}`));
      if (nextLead) {
        notifiedItemsRef.add(`lead-${nextLead.id}`);
        await notify('Follow-up reminder', `${nextLead.companyName} is still waiting for a follow-up.`);
      }

      const nextInvoice = (financials ?? []).find(
        (entry) =>
          entry.type === 'invoice' &&
          entry.status !== 'paid' &&
          !entry.isDeleted &&
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
  const leads = useLiveQuery(() => db.leads.filter((lead) => !lead.isDeleted).toArray(), []);
  const clients = useLiveQuery(() => db.clients.filter((client) => !client.isDeleted).toArray(), []);
  const financials = useLiveQuery(() => db.financials.filter((entry) => !entry.isDeleted).toArray(), []);
  const receipts = useLiveQuery(() => db.receipts.filter((receipt) => !receipt.isDeleted).toArray(), []);
  const { status: syncStatus, lastSynced, forceSync } = useCloudSync();

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [theme, setTheme] = useState(() => getStoredSetting(THEME_STORAGE_KEY, 'neonos'));
  const [mode, setMode] = useState(() => getStoredSetting(MODE_STORAGE_KEY, 'dark'));
  const installPrompt = useInstallPrompt();
  const swUpdate = useServiceWorkerUpdate();
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

    const firstClient = (clients ?? []).find((client) => client.status === 'active') ?? (clients ?? [])[0];
    setSelectedClientId(firstClient?.id ?? null);
  }, [activeView, clients, selectedClientId]);

  const handleOpenClient = (clientId) => {
    setSelectedClientId(clientId);
    setActiveView('clients');
  };

  return (
    <>
      <ToastProvider>
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
          updateAvailable={swUpdate.updateAvailable}
          onRefreshApp={() => window.dispatchEvent(new Event('app-update-refresh'))}
          onDismissUpdate={swUpdate.dismissUpdate}
          notificationsEnabled={notifications.enabled}
          notificationsPermission={notifications.permission}
          onEnableNotifications={notifications.requestPermission}
          onTestNotification={() => notifications.notify('FreelanceOS test', 'Notifications are working on this device.')}
          onToggleNotifications={() => notifications.setEnabled((current) => !current)}
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
      </ToastProvider>
    </>
  );
}
