import React, { useEffect, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './db';
import { Dashboard } from './components/Dashboard';
import { AppLayout } from './components/AppLayout';
import { ClientsView } from './components/ClientsView';
import { LeadsView } from './components/LeadsView';
import { FinancialsView } from './components/FinancialsView';
import { ReceiptsView } from './components/ReceiptsView';
import { QuickAddModal } from './components/QuickAddModal';
import { demoClients, demoFinancials, demoLeads } from './lib/demoData';
import { useCloudSync } from './hooks/useCloudSync';

const NAV_ITEMS = ['dashboard', 'clients', 'leads', 'receipts', 'financials'];

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
  const receipts = useLiveQuery(() => db.receipts.orderBy('date').reverse().toArray(), []);
  const { status: syncStatus, lastSynced, forceSync, hasSupabaseConfig } = useCloudSync();

  useSeedDemoRecords(leads, clients, financials, !hasSupabaseConfig);

  const [activeView, setActiveView] = useState('dashboard');
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const resolvedLeads = leads?.length ? leads : demoLeads;
  const resolvedClients = clients?.length ? clients : demoClients;
  const resolvedFinancials = financials?.length ? financials : demoFinancials;

  useEffect(() => {
    if (activeView !== 'clients' || selectedClientId) {
      return;
    }

    const firstClient = resolvedClients.find((client) => client.status === 'active') ?? resolvedClients[0];
    setSelectedClientId(firstClient?.id ?? null);
  }, [activeView, resolvedClients, selectedClientId]);

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
      >
        {activeView === 'dashboard' && (
          <Dashboard clients={resolvedClients} financials={resolvedFinancials} onOpenClient={handleOpenClient} />
        )}
        {activeView === 'clients' && (
          <ClientsView clients={resolvedClients} selectedClientId={selectedClientId} onSelectClient={setSelectedClientId} />
        )}
        {activeView === 'leads' && <LeadsView leads={resolvedLeads} />}
        {activeView === 'receipts' && <ReceiptsView receipts={receipts ?? []} />}
        {activeView === 'financials' && <FinancialsView financials={resolvedFinancials} clients={resolvedClients} />}
      </AppLayout>

      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
