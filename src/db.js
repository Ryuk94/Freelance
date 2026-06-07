import Dexie from 'dexie';

export const db = new Dexie('FreelanceOS');

db.version(1).stores({
  leads: '++id, companyName, status, xpRewarded, createdAt',
  clients: '++id, name, status, quickLinks, notes, createdAt',
  financials: '++id, clientId, type, amount, status, date',
  gamification: '++id, currentLevel, currentXp, dailyStreak'
});

export const LEAD_STATUSES = ['hunting', 'pitched', 'followed_up', 'interview'];
export const CLIENT_STATUSES = ['active', 'past'];
export const FINANCIAL_TYPES = ['invoice', 'goal'];
export const FINANCIAL_STATUSES = ['draft', 'sent', 'paid'];
