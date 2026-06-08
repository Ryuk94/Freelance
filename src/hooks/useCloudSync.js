import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '../db';
import { hasSupabaseConfig, supabase } from '../lib/supabase';

const TABLES = ['leads', 'clients', 'financials', 'receipts', 'gamification'];
const FIVE_MINUTES = 5 * 60 * 1000;

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

function isDeleted(row) {
  return toTimestamp(row?.deletedAt) > 0;
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
      const remoteTimestamp = toTimestamp(remoteRow.updatedAt);
      const localTimestamp = toTimestamp(localRow?.updatedAt);
      const remoteDeleted = isDeleted(remoteRow);
      const localDeleted = isDeleted(localRow);

      if (remoteDeleted) {
        if (localRow && (!localDeleted || remoteTimestamp > localTimestamp)) {
          await db[table].delete(remoteRow.id);
        }
        continue;
      }

      if (!localRow || localDeleted || remoteTimestamp > localTimestamp) {
        rowsToPut.push(withUpdatedAt(remoteRow, remoteTimestamp || Date.now()));
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
      const payload = liveRows.map((row) => withUpdatedAt(row));
      const { error } = await supabase.from(table).upsert(payload, { onConflict: 'id' });
      if (error) {
        throw error;
      }
    }

    for (const row of deletedRows) {
      const { error } = await supabase.from(table).delete().eq('id', row.id);
      if (error) {
        throw error;
      }
    }
  }, []);

  const runSync = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
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
        await pushTable(table);
      }

      for (const table of TABLES) {
        await pullTable(table);
      }

      const syncedAt = Date.now();
      if (mountedRef.current) {
        setLastSynced(syncedAt);
        setStatus('idle');
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
