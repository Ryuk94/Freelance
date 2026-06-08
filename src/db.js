import Dexie from 'dexie';

export const db = new Dexie('FreelanceOS');

db.version(1).stores({
  leads: '++id, companyName, status, xpRewarded, createdAt',
  clients: '++id, name, status, quickLinks, notes, createdAt',
  financials: '++id, clientId, type, amount, status, date',
  gamification: '++id, currentLevel, currentXp, dailyStreak'
});

db.version(2).stores({
  leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt',
  clients: '++id, name, status, quickLinks, notes, createdAt, updatedAt',
  financials: '++id, clientId, type, amount, status, date, updatedAt',
  gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt'
});

db.version(3)
  .stores({
    leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt',
    clients: '++id, name, status, quickLinks, notes, brandKits, createdAt, updatedAt',
    financials: '++id, clientId, type, amount, status, date, updatedAt',
    gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt',
    receipts: '++id, date, amount, vendor, notes, imageBase64, updatedAt',
    commsTracker: '++id, platform, lastChecked, updatedAt'
  })
  .upgrade(async (tx) => {
    await tx.table('clients').toCollection().modify((client) => {
      if (client.status === 'past') {
        client.status = 'archived';
      }

      if (!Array.isArray(client.brandKits)) {
        client.brandKits = [];
      }
    });
  });

db.version(5)
  .stores({
    leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt',
    clients: '++id, name, status, quickLinks, notes, brandKits, createdAt, updatedAt',
    financials: '++id, clientId, type, amount, status, date, updatedAt',
    gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt',
    receipts: '++id, date, amount, vendor, notes, imageBase64, updatedAt',
    commsTracker: '++id, platform, lastChecked, updatedAt'
  })
  .upgrade(async (tx) => {
    await tx.table('clients').toCollection().modify((client) => {
      if (client.status === 'past') {
        client.status = 'archived';
      }

      if (!Array.isArray(client.brandKits)) {
        client.brandKits = [];
      }
    });
  });

db.version(6)
  .stores({
    leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt, deletedAt',
    clients: '++id, name, status, quickLinks, notes, brandKits, createdAt, updatedAt, deletedAt',
    financials: '++id, clientId, type, amount, status, date, updatedAt, deletedAt',
    gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt',
    receipts: '++id, date, amount, vendor, notes, imageBase64, updatedAt, deletedAt',
    commsTracker: '++id, platform, lastChecked, updatedAt'
  });

db.version(7)
  .stores({
    leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt, isDeleted',
    clients: '++id, name, status, quickLinks, notes, brandKits, createdAt, updatedAt, isDeleted',
    financials: '++id, clientId, type, amount, status, date, updatedAt, isDeleted',
    gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt, isDeleted',
    receipts: '++id, date, amount, vendor, notes, imageBase64, updatedAt, isDeleted',
    commsTracker: '++id, platform, lastChecked, updatedAt, isDeleted',
    events: '++id, title, clientId, date, allDay, updatedAt, isDeleted'
  })
  .upgrade(async (tx) => {
    const tableNames = ['leads', 'clients', 'financials', 'gamification', 'receipts', 'commsTracker', 'events'];

    for (const tableName of tableNames) {
      await tx.table(tableName).toCollection().modify((row) => {
        if (row.isDeleted === undefined) {
          row.isDeleted = Boolean(row.deletedAt);
        }
        delete row.deletedAt;
      });
    }
  });

db.version(8)
  .stores({
    leads: '++id, companyName, status, xpRewarded, createdAt, updatedAt, isDeleted',
    clients: '++id, name, status, quickLinks, notes, brandKits, createdAt, updatedAt, isDeleted',
    financials: '++id, clientId, type, amount, status, date, updatedAt, isDeleted',
    gamification: '++id, currentLevel, currentXp, dailyStreak, updatedAt, isDeleted',
    receipts: '++id, date, amount, vendor, notes, imageBase64, updatedAt, isDeleted',
    commsTracker: '++id, platform, lastChecked, updatedAt, isDeleted',
    events: '++id, title, clientId, date, allDay, updatedAt, isDeleted'
  })
  .upgrade(async (tx) => {
    const tableNames = ['leads', 'clients', 'financials', 'gamification', 'receipts', 'commsTracker', 'events'];

    for (const tableName of tableNames) {
      await tx.table(tableName).toCollection().modify((row) => {
        if (row.isDeleted === undefined) {
          row.isDeleted = Boolean(row.deletedAt);
        }
        delete row.deletedAt;
      });
    }
  });

export const LEAD_STATUSES = ['hunting', 'pitched', 'followed_up', 'interview'];
export const CLIENT_STATUSES = ['active', 'archived'];
export const FINANCIAL_TYPES = ['invoice', 'goal'];
export const FINANCIAL_STATUSES = ['draft', 'sent', 'paid'];
