export const demoClients = [
  {
    id: 1,
    name: 'North Star Studio',
    status: 'active',
    quickLinks: ['https://frame.io', 'https://drive.google.com', 'https://www.figma.com'],
    notes: 'Kickoff complete. Awaiting brand guidelines and final footage.',
    createdAt: Date.now(),
  },
  {
    id: 2,
    name: 'Bright Harbor Co.',
    status: 'active',
    quickLinks: ['https://drive.google.com'],
    notes: 'Motion references and transcript cleanup are in progress.',
    createdAt: Date.now(),
  },
];

export const demoLeads = [
  { id: 1, companyName: 'Stone & Thread', status: 'pitched', xpRewarded: 20, createdAt: Date.now() },
  { id: 2, companyName: 'Cobalt Bloom', status: 'followed_up', xpRewarded: 15, createdAt: Date.now() },
  { id: 3, companyName: 'Lunar Finch', status: 'hunting', xpRewarded: 10, createdAt: Date.now() },
];

export const demoFinancials = [
  { id: 1, clientId: 1, type: 'invoice', amount: 1450, status: 'sent', date: Date.now() },
  { id: 2, clientId: 2, type: 'invoice', amount: 850, status: 'draft', date: Date.now() },
  { id: 3, clientId: 1, type: 'goal', amount: 3000, status: 'paid', date: Date.now() },
];

export const demoGamification = { id: 1, currentLevel: 4, currentXp: 68, dailyStreak: 6 };
