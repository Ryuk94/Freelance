import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useGamification } from '../hooks/useGamification';

export function HuntCard() {
  const leads = useLiveQuery(
    () => db.leads.where('status').equals('hunting').and((lead) => !lead.deletedAt).sortBy('createdAt'),
    [],
  );
  const { addXp } = useGamification();
  const [checkedIds, setCheckedIds] = useState([]);
  const timersRef = useRef(new Map());

  const huntQueue = useMemo(
    () => (leads ?? []).filter((lead) => lead.status === 'hunting' && !lead.deletedAt).slice(0, 3),
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
      await db.leads.update(lead.id, { status: 'followed_up', updatedAt: Date.now() });
      await addXp(20);
      setCheckedIds((current) => current.filter((id) => id !== lead.id));
    }, 500);

    timersRef.current.set(lead.id, timerId);
  };

  return (
    <section className="bg-white/[0.03] p-5">
      <div className="mb-4">
        <div className="text-[10px] uppercase tracking-[0.7em] text-neutral-500">[ THE HUNT ]</div>
        <h2 className="mt-2 font-serif text-3xl uppercase tracking-[0.08em] text-neon-green">Next Follow-Ups</h2>
      </div>

      <div className="space-y-2">
        {huntQueue.length === 0 ? (
          <div className="bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.45em] text-neutral-500">
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
                    ? 'bg-neon-green text-black'
                    : 'bg-white/[0.05] text-neutral-300 hover:bg-white/[0.1] hover:text-white',
                ].join(' ')}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  disabled={isChecked}
                  onChange={() => markDone(lead)}
                  className="h-5 w-5 rounded-none border border-neon-green/40 bg-black text-neon-green accent-neon-green"
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
