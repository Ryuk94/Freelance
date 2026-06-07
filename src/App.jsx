import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Dashboard } from './components/Dashboard';
import { AppLayout } from './components/AppLayout';
import { ClientsView } from './components/ClientsView';
import { LeadsView } from './components/LeadsView';
import { FinancialsView } from './components/FinancialsView';
import { FocusMode } from './components/FocusMode';
import { QuickAddModal } from './components/QuickAddModal';
import { demoClients, demoFinancials, demoLeads } from './lib/demoData';
import { useGamification } from './hooks/useGamification';
import { useCloudSync } from './hooks/useCloudSync';

const NAV_ITEMS = ['dashboard', 'clients', 'leads', 'financials'];

function useSeedDemoRecords(leads, clients, financials, enabled) {
  const seeded = useRef(false);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    if (seeded.current || leads === undefined || clients === undefined || financials === undefined) {
      return;
    }

    const isEmpty = leads.length === 0 && clients.length === 0 && financials.length === 0;
    if (!isEmpty) {
      seeded.current = true;
      return;
    }

    seeded.current = true;
    const timestamp = Date.now();
    void db.transaction('rw', db.leads, db.clients, db.financials, async () => {
      await db.leads.bulkAdd(demoLeads.map((lead) => ({ ...lead, updatedAt: timestamp })));
      await db.clients.bulkAdd(demoClients.map((client) => ({ ...client, updatedAt: timestamp })));
      await db.financials.bulkAdd(demoFinancials.map((item) => ({ ...item, updatedAt: timestamp })));
    });
  }, [clients, enabled, financials, leads]);
}

export function App() {
  const leads = useLiveQuery(() => db.leads.toArray(), []);
  const clients = useLiveQuery(() => db.clients.toArray(), []);
  const financials = useLiveQuery(() => db.financials.toArray(), []);
  const { addXp } = useGamification();
  const { status: syncStatus, lastSynced, forceSync, hasSupabaseConfig } = useCloudSync();

  useSeedDemoRecords(leads, clients, financials, !hasSupabaseConfig);

  const [activeView, setActiveView] = useState('dashboard');
  const [focusMode, setFocusMode] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const isShortcut = (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k';

      if (!isShortcut) {
        return;
      }

      event.preventDefault();
      setQuickAddOpen((current) => !current);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resolvedLeads = leads?.length ? leads : demoLeads;
  const resolvedClients = clients?.length ? clients : demoClients;
  const resolvedFinancials = financials?.length ? financials : demoFinancials;

  const focusTasks = useMemo(() => {
    const openInvoice = resolvedFinancials.find((item) => item.type === 'invoice' && item.status !== 'paid');
    if (openInvoice) {
      const client = resolvedClients.find((entry) => entry.id === openInvoice.clientId);
      return [
        {
          id: `invoice-${openInvoice.id}`,
          label: `Send invoice to ${client?.name ?? 'Client'}`,
          kind: 'invoice',
          clientId: openInvoice.clientId,
          financialId: openInvoice.id,
        },
      ].concat(
        resolvedLeads
          .filter((lead) => lead.status !== 'followed_up')
          .slice(0, 2)
          .map((lead) => ({
            id: `lead-${lead.id}`,
            label: `Follow up with ${lead.companyName}`,
            kind: 'lead',
            leadId: lead.id,
          })),
      );
    }

    return resolvedLeads
      .filter((lead) => lead.status !== 'followed_up')
      .slice(0, 3)
      .map((lead) => ({
        id: `lead-${lead.id}`,
        label: `Follow up with ${lead.companyName}`,
        kind: 'lead',
        leadId: lead.id,
      }));
  }, [resolvedClients, resolvedFinancials, resolvedLeads]);

  const currentFocusTask = focusTasks[focusIndex] ?? focusTasks[0] ?? null;

  useEffect(() => {
    if (activeView !== 'clients' || selectedClientId) {
      return;
    }

    const firstClient = resolvedClients.find((client) => client.status === 'active') ?? resolvedClients[0];
    setSelectedClientId(firstClient?.id ?? null);
  }, [activeView, resolvedClients, selectedClientId]);

  useEffect(() => {
    if (!focusMode) {
      setFocusIndex(0);
    }
  }, [focusMode]);

  const handleOpenClient = (clientId) => {
    setSelectedClientId(clientId);
    setActiveView('clients');
    setFocusMode(false);
  };

  const handleCompleteTask = async () => {
    if (!currentFocusTask) {
      setFocusMode(false);
      return;
    }

    if (currentFocusTask.kind === 'lead') {
      const lead = resolvedLeads.find((item) => item.id === currentFocusTask.leadId);
      if (lead) {
        await db.leads.update(lead.id, { status: 'followed_up', updatedAt: Date.now() });
        await addXp(lead.xpRewarded ?? 10);
      }
    }

    if (currentFocusTask.kind === 'invoice') {
      const item = resolvedFinancials.find((entry) => entry.id === currentFocusTask.financialId);
      if (item) {
        await db.financials.update(item.id, { status: 'paid', updatedAt: Date.now() });
        await addXp(20);
      }
    }

    setFocusIndex((value) => value + 1);
  };

  const handleSkipTask = () => {
    if (focusIndex + 1 >= focusTasks.length) {
      setFocusMode(false);
      return;
    }

    setFocusIndex((value) => value + 1);
  };

  const handleExitFocus = () => {
    setFocusMode(false);
    setFocusIndex(0);
  };

  return (
    <>
      {focusMode ? (
        <FocusMode task={currentFocusTask} onDone={handleCompleteTask} onSkip={handleSkipTask} onExit={handleExitFocus} />
      ) : (
        <AppLayout
          activeView={activeView}
          onViewChange={setActiveView}
          focusMode={focusMode}
          onFocusModeChange={setFocusMode}
          navItems={NAV_ITEMS}
          syncStatus={syncStatus}
          lastSynced={lastSynced}
          onForceSync={forceSync}
          onQuickAddOpen={() => setQuickAddOpen(true)}
        >
          {activeView === 'dashboard' && (
            <Dashboard
              clients={resolvedClients}
              financials={resolvedFinancials}
              onOpenClient={handleOpenClient}
              onToggleFocus={() => setFocusMode(true)}
            />
          )}
          {activeView === 'clients' && (
            <ClientsView clients={resolvedClients} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} />
          )}
          {activeView === 'leads' && <LeadsView leads={resolvedLeads} />}
          {activeView === 'financials' && <FinancialsView financials={resolvedFinancials} clients={resolvedClients} />}
        </AppLayout>
      )}

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
