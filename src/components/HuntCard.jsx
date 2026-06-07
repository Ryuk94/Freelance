import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useGamification } from '../hooks/useGamification';

export function HuntCard() {
  const leads = useLiveQuery(() => db.leads.where('status').equals('hunting').sortBy('createdAt'), []);
  const { addXp } = useGamification();
  const [checkedIds, setCheckedIds] = useState([]);
  const timersRef = useRef(new Map());

  const huntQueue = useMemo(() => (leads ?? []).slice(0, 3), [leads]);

  useEffect(() => {
    setCheckedIds((current) => current.filter((id) => huntQueue.some((lead) => lead.id === id)));
  }, [huntQueue]);

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      timersRef.current.clear();
    };
  }, []);

  const markDone = (lead) => {
    if (checkedIds.includes(lead.id) || timersRef.current.has(lead.id)) {
      return;
    }

    setCheckedIds((current) => [...current, lead.id]);

    const timerId = window.setTimeout(async () => {
      timersRef.current.delete(lead.id);
      await db.leads.update(lead.id, { status: 'pitched', updatedAt: Date.now() });
      await addXp(20);
      setCheckedIds((current) => current.filter((id) => id !== lead.id));
    }, 500);

    timersRef.current.set(lead.id, timerId);
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-neutral-900 p-5">
      <div className="mb-4">
        <div className="text-xs uppercase tracking-[0.35em] text-neutral-500">The Hunt</div>
        <h2 className="mt-2 text-lg font-black tracking-tight text-neutral-100">Next Follow-Ups</h2>
      </div>

      <div className="space-y-3">
        {huntQueue.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 px-4 py-3 text-sm text-neutral-400">
            No leads in the hunt right now.
          </div>
        ) : (
          huntQueue.map((lead) => {
            const isChecked = checkedIds.includes(lead.id);

            return (
              <label
                key={lead.id}
                className={[
                  'flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition',
                  isChecked ? 'border-emerald-400/20 bg-emerald-400/10' : 'border-white/5 bg-white/5 hover:bg-white/10',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isChecked}
                  onChange={() => markDone(lead)}
                  className="h-5 w-5 rounded border-white/20 bg-neutral-950 text-emerald-400"
                />
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-100">{lead.companyName}</div>
                  <div className="text-sm text-neutral-400">{isChecked ? 'Claiming XP...' : 'Mark done for XP'}</div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
