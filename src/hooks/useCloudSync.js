import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../db';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const TABLES = ['leads', 'clients', 'financials', 'receipts', 'gamification', 'commsTracker', 'events'];
const FIVE_MINUTES = 5 * 60 * 1000;
const LOCAL_RESET_FLAG = 'freelanceos.suppressAutoCloudRestore';

function toTimestamp(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const numeric = Number(value);
    if (Number.isFinite(numeric)) {
      return numeric;
    }

    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function withUpdatedAt(row, fallbackTimestamp = Date.now()) {
  return {
    ...row,
    updatedAt: toTimestamp(row.updatedAt) || fallbackTimestamp,
  };
}

function stripLegacyTombstoneFields(row) {
  const { deletedAt, ...rest } = row ?? {};
  return rest;
}

function isDeleted(row) {
  return Boolean(row?.isDeleted) || toTimestamp(row?.deletedAt) > 0;
}

function isNewer(remoteRow, localRow) {
  const remoteTimestamp = toTimestamp(remoteRow?.updatedAt) || 0;
  const localTimestamp = toTimestamp(localRow?.updatedAt) || 0;
  return remoteTimestamp >= localTimestamp;
}

export function useCloudSync() {
  const [status, setStatus] = useState('idle');
  const [lastSynced, setLastSynced] = useState(null);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const setSafeStatus = useCallback((nextStatus) => {
    if (mountedRef.current) {
      setStatus(nextStatus);
    }
  }, []);

  const pullTable = useCallback(async (table) => {
    const { data, error } = await supabase.from(table).select('*');
    if (error) {
      throw error;
    }

    const remoteRows = Array.isArray(data) ? data : [];
    const localRows = await db[table].toArray();
    const localById = new Map(localRows.map((row) => [row.id, row]));
    const rowsToPut = [];

    for (const remoteRow of remoteRows) {
      const localRow = localById.get(remoteRow.id);
      const remoteDeleted = isDeleted(remoteRow);

      if (remoteDeleted) {
        if (localRow && isNewer(remoteRow, localRow)) {
          await db[table].delete(remoteRow.id);
        }
        continue;
      }

      if (!localRow) {
        rowsToPut.push(withUpdatedAt(remoteRow, Date.now()));
        continue;
      }

      if (isDeleted(localRow)) {
        if (isNewer(remoteRow, localRow)) {
          rowsToPut.push(withUpdatedAt(remoteRow, Date.now()));
        }
        continue;
      }

      if (isNewer(remoteRow, localRow)) {
        rowsToPut.push(withUpdatedAt(remoteRow, Date.now()));
      }
    }

    if (rowsToPut.length > 0) {
      await db[table].bulkPut(rowsToPut);
    }
  }, []);

  const pushTable = useCallback(async (table) => {
    const localRows = await db[table].toArray();
    if (localRows.length === 0) {
      return;
    }

    const deletedRows = localRows.filter(isDeleted);
    const liveRows = localRows.filter((row) => !isDeleted(row));

    if (liveRows.length > 0) {
      const payload = liveRows.map((row) => ({
        ...stripLegacyTombstoneFields(withUpdatedAt(row)),
        isDeleted: false,
      }));
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
      if (error) {
        throw error;
      }
    }

    for (const row of deletedRows) {
      const { error } = await supabase.from(table).upsert(
        {
          ...stripLegacyTombstoneFields(withUpdatedAt(row)),
          isDeleted: true,
        },
        { onConflict: 'id' },
      );
      if (error) {
        throw error;
      }
    }
  }, []);

  const runSync = useCallback(async ({ force = false } = {}) => {
    if (!hasSupabaseConfig || !supabase) {
      return { ok: false, skipped: true };
    }

    if (!force && typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_RESET_FLAG) === '1') {
      return { ok: false, skipped: true };
    }

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return { ok: false, skipped: true };
    }

    if (inFlightRef.current) {
      return { ok: false, skipped: true };
    }

    inFlightRef.current = true;
    setSafeStatus('syncing');

    try {
      for (const table of TABLES) {
        await pullTable(table);
      }

      for (const table of TABLES) {
        await pushTable(table);
      }

      const syncedAt = Date.now();
      if (mountedRef.current) {
        setLastSynced(syncedAt);
        setStatus('idle');
      }

      if (typeof window !== 'undefined' && window.localStorage.getItem(LOCAL_RESET_FLAG) === '1') {
        window.localStorage.removeItem(LOCAL_RESET_FLAG);
      }

      return { ok: true, syncedAt };
    } catch (error) {
      console.error('[FreelanceOS] Cloud sync failed', error);
      setSafeStatus('error');
      return { ok: false, error };
    } finally {
      inFlightRef.current = false;
    }
  }, [pullTable, pushTable, setSafeStatus]);

  useEffect(() => {
    void runSync();

    const intervalId = window.setInterval(() => {
      void runSync();
    }, FIVE_MINUTES);

    return () => window.clearInterval(intervalId);
  }, [runSync]);

  return {
    status,
    lastSynced,
    forceSync: runSync,
    hasSupabaseConfig,
  };
}
