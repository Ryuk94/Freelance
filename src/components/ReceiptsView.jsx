import React, { useMemo, useState } from 'react';
import { db } from '../db';
import { useToast } from '../hooks/useToast';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ReceiptsView({ receipts }) {
  const showToast = useToast();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [amount, setAmount] = useState('');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const totals = useMemo(() => {
    const sum = receipts.reduce((acc, receipt) => acc + Number(receipt.amount || 0), 0);
    return {
      count: receipts.length,
      sum,
    };
  }, [receipts]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!vendor.trim() || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const timestamp = new Date(`${date}T12:00:00`).getTime() || Date.now();
    let imageBase64 = '';

    if (imageFile) {
      try {
        imageBase64 = await fileToBase64(imageFile);
      } catch (error) {
        console.error('[FreelanceOS] Failed to encode receipt image', error);
      }
    }

    try {
      await db.receipts.add({
        date: timestamp,
        amount: parsedAmount,
        vendor: vendor.trim(),
        notes: notes.trim(),
        imageBase64,
        updatedAt: Date.now(),
      });
      setAmount('');
      setVendor('');
      setNotes('');
      setImageFile(null);
      setDate(new Date().toISOString().slice(0, 10));
    } catch (error) {
      console.error('[FreelanceOS] Failed to add receipt', error);
    }
  };

  const handleDelete = async (receiptId) => {
    try {
      const now = Date.now();
      await db.receipts.update(receiptId, {
        isDeleted: true,
        updatedAt: now,
      });
      showToast('RECEIPT ARCHIVED', async () => {
        await db.receipts.update(receiptId, {
          isDeleted: false,
          updatedAt: Date.now(),
        });
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to delete receipt', error);
    }
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-[var(--card-shadow)]">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ RECEIPTS ]</div>
        <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-[var(--app-text)]">Vault Intake</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-neutral-800 bg-black/35 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">count</div>
            <div className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] text-neon-green tabular-nums">{totals.count}</div>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-black/35 px-4 py-3">
            <div className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">total</div>
            <div className="mt-2 font-mono text-3xl font-bold tracking-[0.2em] text-neon-green tabular-nums">{formatCurrency(totals.sum)}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 shadow-[var(--card-shadow)]">
        <div className="mb-4 text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ ADD RECEIPT ]</div>
        <form className="grid gap-3 lg:grid-cols-2" onSubmit={handleSubmit}>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.45em] text-neutral-500">Date</span>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="w-full rounded-xl border border-neutral-800 bg-black/45 px-3 py-3 text-xs uppercase tracking-[0.35em] text-[#c4ff0e] outline-none focus:border-teal-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.45em] text-neutral-500">Amount</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="85"
              className="w-full rounded-xl border border-neutral-800 bg-black/45 px-3 py-3 text-xs uppercase tracking-[0.35em] text-[#c4ff0e] outline-none focus:border-teal-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.45em] text-neutral-500">Vendor</span>
            <input
              type="text"
              value={vendor}
              onChange={(event) => setVendor(event.target.value)}
              placeholder="Adobe"
              className="w-full rounded-xl border border-neutral-800 bg-black/45 px-3 py-3 text-xs uppercase tracking-[0.35em] text-[#c4ff0e] outline-none focus:border-teal-500"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-[0.45em] text-neutral-500">Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-neutral-800 bg-black/45 px-3 py-2 text-xs uppercase tracking-[0.35em] text-neutral-400 file:mr-3 file:border-0 file:bg-gradient-to-r file:from-teal-500 file:to-blue-600 file:px-3 file:py-2 file:text-xs file:font-bold file:uppercase file:tracking-[0.35em] file:text-black"
            />
          </label>
          <label className="space-y-2 lg:col-span-2">
            <span className="text-xs uppercase tracking-[0.45em] text-neutral-500">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Meal receipt, subscription, transport..."
              className="min-h-28 w-full rounded-xl border border-neutral-800 bg-black/45 px-3 py-3 font-mono text-sm text-[#c4ff0e] outline-none placeholder:text-neutral-600 focus:border-teal-500"
            />
          </label>
          <button
            type="submit"
            className="lg:col-span-2 rounded-xl border border-neutral-700 bg-white/[0.03] px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-[#c4ff0e] transition hover:bg-white/[0.06]"
          >
            save receipt
          </button>
        </form>
      </section>

      <section className="grid gap-3 xl:grid-cols-2">
        {receipts.length > 0 ? (
          receipts.map((receipt) => (
            <article key={receipt.id} className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/70 p-4 shadow-[var(--card-shadow)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">
                    {new Date(receipt.date).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: '2-digit',
                      year: 'numeric',
                    }).toUpperCase()}
                  </div>
                  <h3 className="mt-2 text-sm font-bold uppercase tracking-[0.35em] text-neon-green">{receipt.vendor}</h3>
                </div>
                <div className="font-mono text-xl font-bold tracking-[0.2em] text-[#c4ff0e] tabular-nums">{formatCurrency(receipt.amount)}</div>
              </div>
              {receipt.notes ? <p className="mt-3 text-xs uppercase tracking-[0.3em] text-neutral-500">{receipt.notes}</p> : null}
              {receipt.imageBase64 ? (
                <img
                  src={receipt.imageBase64}
                  alt={receipt.vendor}
                  className="mt-4 max-h-48 w-full rounded-xl border border-neutral-800 object-cover"
                />
              ) : null}
              <button
                type="button"
                onClick={() => handleDelete(receipt.id)}
                className="mt-4 rounded-xl border border-neutral-700 bg-[#f97316] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-black transition hover:bg-[#ea580c]"
              >
                remove
              </button>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 px-4 py-6 text-xs uppercase tracking-[0.45em] text-neutral-500">
            no receipts logged
          </div>
        )}
      </section>
    </div>
  );
}
