import React, { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { useToast } from '../hooks/useToast';

function formatDate(value) {
  if (!value) {
    return 'unset';
  }

  return new Date(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function CalendarWidget({ clients }) {
  const events = useLiveQuery(() => db.events.filter((event) => !event.isDeleted).toArray(), []);
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [clientId, setClientId] = useState('global');
  const [allDay, setAllDay] = useState(true);

  const upcomingEvents = useMemo(() => {
    return [...(events ?? [])]
      .filter((event) => !event.isDeleted)
      .sort((a, b) => Number(a.date || 0) - Number(b.date || 0))
      .slice(0, 6);
  }, [events]);

  const handleAddEvent = async () => {
    const nextTitle = title.trim();
    const nextDate = date ? new Date(`${date}T12:00:00`).getTime() : Date.now();
    if (!nextTitle) {
      return;
    }

    const resolvedClientId = clientId === 'global' ? null : Number(clientId);
    const now = Date.now();

    try {
      await db.events.add({
        title: nextTitle,
        clientId: resolvedClientId,
        date: nextDate,
        allDay,
        updatedAt: now,
        isDeleted: false,
      });
      setTitle('');
      setDate('');
      setClientId('global');
      setAllDay(true);
      showToast('EVENT ADDED');
    } catch (error) {
      console.error('[FreelanceOS] Failed to add event', error);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      await db.events.update(eventId, { isDeleted: true, updatedAt: Date.now() });
      showToast('EVENT ARCHIVED', async () => {
        await db.events.update(eventId, { isDeleted: false, updatedAt: Date.now() });
      });
    } catch (error) {
      console.error('[FreelanceOS] Failed to delete event', error);
    }
  };

  return (
    <section className="space-y-4">
      <div className="grid gap-3 lg:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Client meeting"
            className="w-full rounded-xl border border-neutral-800 bg-black/35 px-3 py-3 text-xs text-[var(--app-text)] outline-none placeholder:text-neutral-600"
          />
        </label>
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Date</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-black/35 px-3 py-3 text-xs text-[var(--app-text)] outline-none"
          />
        </label>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <label className="space-y-2">
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-500">Client</span>
          <select
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            className="w-full rounded-xl border border-neutral-800 bg-black/35 px-3 py-3 text-xs text-[var(--app-text)] outline-none"
          >
            <option value="global">Global Event</option>
            {(clients ?? []).map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-end gap-2 rounded-xl border border-neutral-800 bg-black/35 px-3 py-3">
          <input
            type="checkbox"
            checked={allDay}
            onChange={(event) => setAllDay(event.target.checked)}
            className="h-4 w-4 accent-[#c4ff0e]"
          />
          <span className="text-[10px] uppercase tracking-[0.45em] text-neutral-400">All day</span>
        </label>
      </div>

      <button
        type="button"
        onClick={handleAddEvent}
        className="rounded-xl border border-neutral-700 bg-[#c4ff0e]/10 px-4 py-3 text-xs font-bold uppercase tracking-[0.55em] text-[#c4ff0e] transition hover:bg-[#c4ff0e]/20"
      >
        add event
      </button>

      <div className="space-y-2">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => {
            const client = (clients ?? []).find((item) => item.id === event.clientId);
            return (
              <div key={event.id} className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-black/35 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold uppercase tracking-[0.35em] text-[var(--app-text)]">{event.title}</div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
                    {client ? client.name : 'global'} / {formatDate(event.date)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteEvent(event.id)}
                  className="rounded-xl border border-neutral-800 bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.45em] text-[#f97316]"
                >
                  remove
                </button>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-black/25 px-4 py-4 text-[10px] uppercase tracking-[0.45em] text-neutral-500">
            no events scheduled
          </div>
        )}
      </div>
    </section>
  );
}
