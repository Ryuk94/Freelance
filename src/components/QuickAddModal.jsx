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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 px-4 py-6"
      onMouseDown={handleBackdropMouseDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        className="w-full max-w-xl border border-neutral-800 bg-black/95 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-neutral-800 px-5 py-5">
          <div>
            <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ QUICK ADD ]</div>
            <h2 id="quick-add-title" className="mt-2 font-serif text-4xl uppercase tracking-[0.08em] text-neon-green">
              Capture
            </h2>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">fast entry for leads and invoices</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="border border-neon-red/30 bg-neon-red/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-neon-red transition hover:bg-neon-red hover:text-black"
          >
            esc
          </button>
        </div>

        <div className="px-5 pt-5">
          <div className="inline-flex border border-neutral-800 bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => setMode('lead')}
              className={[
                'px-4 py-2 text-xs font-bold uppercase tracking-[0.45em] transition',
                mode === 'lead' ? 'bg-neon-green text-black' : 'text-neutral-400 hover:text-neon-green',
              ].join(' ')}
            >
              New Lead
            </button>
            <button
              type="button"
              onClick={() => setMode('invoice')}
              className={[
                'px-4 py-2 text-xs font-bold uppercase tracking-[0.45em] transition',
                mode === 'invoice' ? 'bg-neon-green text-black' : 'text-neutral-400 hover:text-neon-green',
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
                <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Company Name</span>
                <input
                  ref={leadInputRef}
                  value={leadCompanyName}
                  onChange={(event) => setLeadCompanyName(event.target.value)}
                  placeholder="North Star Studio"
                  className="w-full border border-neutral-800 bg-black/60 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600 focus:border-neon-green"
                />
              </label>

              <button
                type="submit"
                className="w-full border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-neon-green transition hover:bg-neon-green hover:text-black"
              >
                add lead
              </button>
            </form>
          ) : (
            <form className="space-y-4" onSubmit={handleInvoiceSubmit}>
              <label className="block space-y-2">
                <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Client</span>
                <select
                  ref={clientSelectRef}
                  value={invoiceClientId}
                  onChange={(event) => setInvoiceClientId(event.target.value)}
                  disabled={!hasActiveClients}
                  className="w-full border border-neutral-800 bg-black/60 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none focus:border-neon-green disabled:cursor-not-allowed disabled:opacity-60"
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
                <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Amount</span>
                <input
                  ref={amountInputRef}
                  type="number"
                  min="0"
                  step="0.01"
                  value={invoiceAmount}
                  onChange={(event) => setInvoiceAmount(event.target.value)}
                  placeholder="850"
                  className="w-full border border-neutral-800 bg-black/60 px-3 py-3 text-xs uppercase tracking-[0.35em] text-neon-green outline-none placeholder:text-neutral-600 focus:border-neon-green"
                />
              </label>

              <button
                type="submit"
                disabled={!hasActiveClients || !invoiceClientId || !invoiceAmount.trim()}
                className="w-full border border-neon-green/30 bg-neon-green/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-neon-green transition hover:bg-neon-green hover:text-black disabled:cursor-not-allowed disabled:border-neutral-800 disabled:bg-black/35 disabled:text-neutral-500"
              >
                add invoice
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
