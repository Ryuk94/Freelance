import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useGamification } from '../hooks/useGamification';

export function HuntCard({ selected = false }) {
  const leads = useLiveQuery(
    () => db.leads.where('status').equals('hunting').filter((lead) => !lead.isDeleted).sortBy('createdAt'),
    [],
  );
  const { addXp } = useGamification();
  const [checkedIds, setCheckedIds] = useState([]);
  const timersRef = useRef(new Map());

  const huntQueue = useMemo(
    () => (leads ?? []).filter((lead) => lead.status === 'hunting' && !lead.isDeleted).slice(0, 3),
    [leads],
  );

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
      await db.leads.update(lead.id, { status: 'followed_up', updatedAt: Date.now(), isDeleted: false });
      await addXp(20);
      setCheckedIds((current) => current.filter((id) => id !== lead.id));
    }, 500);

    timersRef.current.set(lead.id, timerId);
  };

  return (
    <section className={`h-full rounded-xl border p-5 ${selected ? '!border-[#c4ff0e] !bg-[#c4ff0e] !text-black' : 'border-neutral-800 bg-white/[0.03]'}`}>
      <div className="mb-4 relative">
        <div className={`text-[10px] uppercase tracking-[0.7em] ${selected ? '!text-black/60' : 'text-neutral-500'}`}>[ THE HUNT ]</div>
        <h2 className={`mt-2 font-serif text-3xl font-black uppercase tracking-[0.08em] ${selected ? '!text-black' : 'text-[#c4ff0e]'}`}>Next Follow-Ups</h2>
      </div>

      <div className="space-y-2">
        {huntQueue.length === 0 ? (
            <div className={`px-4 py-3 text-xs uppercase tracking-[0.45em] ${selected ? 'border border-black/20 bg-black text-black/70' : 'bg-black/40 text-neutral-500'}`}>
              queue empty
            </div>
        ) : (
          huntQueue.map((lead) => {
            const isChecked = checkedIds.includes(lead.id);

            return (
              <label
                key={lead.id}
                className={[
                  'flex cursor-pointer items-center gap-3 px-4 py-3 transition',
                  isChecked
                    ? '!bg-[#c4ff0e] !text-black'
                    : selected
                      ? 'bg-black text-black/75 hover:bg-black/80 hover:text-[#c4ff0e]'
                      : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] hover:text-white',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isChecked}
                  onChange={() => markDone(lead)}
                  className={`h-5 w-5 rounded-none border ${selected ? 'border-black/30 bg-black text-[#c4ff0e] accent-[#c4ff0e]' : 'border-[#c4ff0e]/40 bg-black text-[#c4ff0e] accent-[#c4ff0e]'}`}
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold uppercase tracking-[0.35em] text-inherit">
                    {lead.companyName}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                    {isChecked ? 'logging follow-up' : 'mark done for xp'}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </section>
  );
}
