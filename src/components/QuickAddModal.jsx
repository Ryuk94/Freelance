import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';

function toOptionId(value) {
  return value == null ? '' : String(value);
}

export function QuickAddModal({ open, onClose }) {
  const activeClients = useLiveQuery(() => db.clients.where('status').equals('active').sortBy('name'), []) ?? [];
  const [mode, setMode] = useState('lead');
  const [leadCompanyName, setLeadCompanyName] = useState('');
  const [invoiceClientId, setInvoiceClientId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const leadInputRef = useRef(null);
  const clientSelectRef = useRef(null);
  const amountInputRef = useRef(null);

  const hasActiveClients = activeClients.length > 0;

  const activeClientOptions = useMemo(
    () => activeClients.map((client) => ({ id: toOptionId(client.id), name: client.name })),
    [activeClients],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    setMode('lead');
    setLeadCompanyName('');
    setInvoiceClientId('');
    setInvoiceAmount('');
  }, [open]);

  useEffect(() => {
    if (!open || mode !== 'invoice') {
      return;
    }

    if (!hasActiveClients) {
      setInvoiceClientId('');
      return;
    }

    setInvoiceClientId((current) => {
      if (current && activeClientOptions.some((client) => client.id === current)) {
        return current;
      }

      return activeClientOptions[0]?.id ?? '';
    });
  }, [activeClientOptions, hasActiveClients, mode, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTarget = mode === 'invoice' ? clientSelectRef.current ?? amountInputRef.current : leadInputRef.current;

    const frameId = window.requestAnimationFrame(() => {
      focusTarget?.focus?.();
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [mode, open]);

  const handleBackdropMouseDown = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const handleLeadSubmit = async (event) => {
    event.preventDefault();

    const companyName = leadCompanyName.trim();
    if (!companyName) {
      return;
    }

    const now = Date.now();

    try {
      await db.leads.add({
        companyName,
        status: 'hunting',
        xpRewarded: 20,
        createdAt: now,
        updatedAt: now,
      });
      setLeadCompanyName('');
      onClose();
    } catch (error) {
      console.error('[FreelanceOS] Failed to add lead', error);
    }
  };

  const handleInvoiceSubmit = async (event) => {
    event.preventDefault();

    const parsedAmount = Number(invoiceAmount);
    const selectedClientId = Number(invoiceClientId);

    if (!invoiceClientId || !Number.isFinite(parsedAmount) || parsedAmount <= 0 || !Number.isFinite(selectedClientId)) {
      return;
    }

    const now = Date.now();

    try {
      await db.financials.add({
        clientId: selectedClientId,
        type: 'invoice',
        amount: parsedAmount,
        status: 'sent',
        date: now,
        updatedAt: now,
      });
      setInvoiceAmount('');
      onClose();
    } catch (error) {
      console.error('[FreelanceOS] Failed to add invoice', error);
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/80 px-4 py-6 backdrop-blur-sm"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/70"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/5 px-5 py-5">
          <div>
            <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">Quick Add</div>
            <h2 id="quick-add-title" className="mt-2 text-2xl font-black tracking-tight text-neutral-100">
              Capture something new
            </h2>
            <p className="mt-2 text-sm text-neutral-400">Fast entry for the next lead or invoice. No extra clutter.</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-white/10 hover:text-white"
          >
            Esc
          </button>
        </div>

        <div className="px-5 pt-5">
          <div className="inline-flex rounded-full border border-white/10 bg-neutral-950 p-1">
            <button
              type="button"
              onClick={() => setMode('lead')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                mode === 'lead' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:text-white',
              ].join(' ')}
            >
              New Lead
            </button>
            <button
              type="button"
              onClick={() => setMode('invoice')}
              className={[
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                mode === 'invoice' ? 'bg-violet-500 text-white' : 'text-neutral-400 hover:text-white',
              ].join(' ')}
            >
              New Invoice
            </button>
          </div>
        </div>

        <div className="px-5 py-5">
          {mode === 'lead' ? (
            <form className="space-y-4" onSubmit={handleLeadSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-300">Company Name</span>
                <input
                  ref={leadInputRef}
                  value={leadCompanyName}
                  onChange={(event) => setLeadCompanyName(event.target.value)}
                  placeholder="North Star Studio"
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 p-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </label>

              <button
                type="submit"
                className="w-full rounded-lg bg-violet-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-violet-400"
              >
                Add Lead
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleInvoiceSubmit}>
              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-300">Client</span>
                <select
                  ref={clientSelectRef}
                  value={invoiceClientId}
                  onChange={(event) => setInvoiceClientId(event.target.value)}
                  disabled={!hasActiveClients}
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 p-3 text-white outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {hasActiveClients ? (
                    activeClientOptions.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))
                  ) : (
                    <option value="">No active clients</option>
                  )}
                </select>
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-neutral-300">Amount</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(event) => setInvoiceAmount(event.target.value)}
                  placeholder="850"
                  className="w-full rounded-lg border border-white/10 bg-neutral-900 p-3 text-white outline-none transition placeholder:text-neutral-600 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </label>

              <button
                type="submit"
                disabled={!hasActiveClients || !invoiceClientId || !invoiceAmount.trim()}
                className="w-full rounded-lg bg-emerald-400 px-4 py-3 text-sm font-black text-neutral-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-300"
              >
                Add Invoice
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
