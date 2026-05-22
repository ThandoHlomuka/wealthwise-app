const SEED = {
  profile: {
    name: 'Thando Hlomuka',
    currency: 'ZAR',
    riskTolerance: 'moderate',
    monthlyIncome: 85000,
    monthlyExpenses: 52000,
    savingsRate: 38,
    onboardingDone: false
  },

  accounts: [
    { id: 'a1', name: 'FNB Current Account', type: 'checking', balance: 45200, institution: 'FNB', color: '#1a73e8' },
    { id: 'a2', name: 'FNB Savings Account', type: 'savings', balance: 185000, institution: 'FNB', color: '#0f9d58', interestRate: 5.2 },
    { id: 'a3', name: 'EasyEquities TFSA', type: 'investment', balance: 340000, institution: 'EasyEquities', color: '#7c4dff' },
    { id: 'a4', name: 'Satrix ETF Portfolio', type: 'investment', balance: 280000, institution: 'Satrix', color: '#4285f4' },
    { id: 'a5', name: 'RA - Allan Gray', type: 'retirement', balance: 892000, institution: 'Allan Gray', color: '#f4b400' },
    { id: 'a6', name: 'Property - Flat', type: 'property', balance: 1500000, institution: 'Own property', color: '#d93025' },
    { id: 'a7', name: 'Luno BTC Wallet', type: 'crypto', balance: 125000, institution: 'Luno', color: '#f7931a' },
    { id: 'a8', name: 'Vehicle Finance', type: 'loan', balance: -245000, institution: 'WesBank', color: '#d93025', interestRate: 13.5 },
    { id: 'a9', name: 'Credit Card', type: 'credit', balance: -12500, institution: 'FNB', color: '#d93025', interestRate: 21.0 },
    { id: 'a10', name: 'Bond - Flat', type: 'loan', balance: -890000, institution: 'SA Home Loans', color: '#d93025', interestRate: 9.75 }
  ],

  transactions: (() => {
    const tx = [];
    const cats = {
      income: [{ cat: 'Salary', icon: '💰' }, { cat: 'Freelance', icon: '💻' }, { cat: 'Investment Income', icon: '📈' }, { cat: 'Rental Income', icon: '🏠' }],
      expense: [{ cat: 'Housing', icon: '🏠' }, { cat: 'Transport', icon: '🚗' }, { cat: 'Food', icon: '🛒' }, { cat: 'Utilities', icon: '💡' }, { cat: 'Insurance', icon: '🛡️' }, { cat: 'Entertainment', icon: '🎬' }, { cat: 'Health', icon: '🏥' }, { cat: 'Education', icon: '📚' }, { cat: 'Shopping', icon: '🛍️' }, { cat: 'Savings', icon: '🏦' }, { cat: 'Dining', icon: '🍽️' }, { cat: 'Subscriptions', icon: '📱' }]
    };
    const d = (daysAgo) => { const d2 = new Date(); d2.setDate(d2.getDate() - daysAgo); return d2.toISOString().split('T')[0]; };

    // Monthly salary
    for (let m = 0; m < 6; m++) {
      tx.push({ id: `ti${m}`, type: 'income', category: 'Salary', icon: '💰', amount: 85000, date: d(m * 30 + 25), description: 'Monthly salary - FNB', accountId: 'a1' });
    }

    // Investment income
    for (let m = 0; m < 3; m++) {
      tx.push({ id: `tdiv${m}`, type: 'income', category: 'Investment Income', icon: '📈', amount: 3200 + Math.random() * 500, date: d(m * 30 + 15), description: 'ETF Dividend payout', accountId: 'a4' });
    }

    // Regular expenses
    const expenseSchedule = [
      { cat: 'Housing', icon: '🏠', amount: 12500, desc: 'Bond payment', freq: 30 },
      { cat: 'Transport', icon: '🚗', amount: 3500, desc: 'Car payment', freq: 30 },
      { cat: 'Transport', icon: '🚗', amount: 1800, desc: 'Fuel', freq: 14 },
      { cat: 'Food', icon: '🛒', amount: 4200, desc: 'Weekly groceries', freq: 7 },
      { cat: 'Utilities', icon: '💡', amount: 1850, desc: 'Electricity & water', freq: 30 },
      { cat: 'Utilities', icon: '💡', amount: 650, desc: 'Internet & phone', freq: 30 },
      { cat: 'Insurance', icon: '🛡️', amount: 2800, desc: 'Life & car insurance', freq: 30 },
      { cat: 'Entertainment', icon: '🎬', amount: 1200, desc: 'Streaming & leisure', freq: 30 },
      { cat: 'Dining', icon: '🍽️', amount: 850, desc: 'Restaurant / takeout', freq: 14 },
      { cat: 'Savings', icon: '🏦', amount: 15000, desc: 'Monthly savings transfer', freq: 30 },
      { cat: 'Shopping', icon: '🛍️', amount: 2500, desc: 'Clothing & personal', freq: 45 },
      { cat: 'Health', icon: '🏥', amount: 1850, desc: 'Medical aid', freq: 30 },
    ];

    expenseSchedule.forEach((e, i) => {
      for (let occ = 0; occ < Math.min(6, Math.floor(180 / e.freq)); occ++) {
        const daysAgo = occ * e.freq + Math.floor(Math.random() * 3);
        if (daysAgo < 180) {
          const variance = 0.85 + Math.random() * 0.3;
          tx.push({
            id: `te${i}_${occ}`, type: 'expense', category: e.cat, icon: e.icon,
            amount: -(e.amount * variance), date: d(daysAgo),
            description: e.desc, accountId: 'a1'
          });
        }
      }
    });

    // One-off transactions
    const oneOffs = [
      { type: 'expense', cat: 'Education', icon: '📚', amount: -8500, date: d(45), desc: 'Online course subscription', accountId: 'a1' },
      { type: 'expense', cat: 'Health', icon: '🏥', amount: -1200, date: d(60), desc: 'GP visit', accountId: 'a1' },
      { type: 'income', cat: 'Freelance', icon: '💻', amount: 12500, date: d(20), desc: 'Consulting project', accountId: 'a1' },
      { type: 'expense', cat: 'Subscriptions', icon: '📱', amount: -599, date: d(5), desc: 'Netflix & Spotify', accountId: 'a1' },
      { type: 'expense', cat: 'Transport', icon: '🚗', amount: -3500, date: d(180), desc: 'Car service', accountId: 'a1' },
    ];
    oneOffs.forEach((o, i) => { tx.push({ id: `to${i}`, ...o }); });

    return tx.sort((a, b) => new Date(b.date) - new Date(a.date));
  })(),

  goals: [
    { id: 'g1', title: 'Emergency Fund', icon: '🛡️', target: 300000, current: 185000, deadline: '2026-12-31', category: 'savings', createdAt: '2026-01-01' },
    { id: 'g2', title: 'Kids Education Fund', icon: '📚', target: 500000, current: 180000, deadline: '2030-12-31', category: 'investment', createdAt: '2026-01-01' },
    { id: 'g3', title: 'Downsize Bond', icon: '🏠', target: 500000, current: 250000, deadline: '2027-06-30', category: 'savings', createdAt: '2026-01-01' },
    { id: 'g4', title: 'Retirement Top-up', icon: '👴', target: 2000000, current: 892000, deadline: '2045-12-31', category: 'retirement', createdAt: '2026-01-01' },
    { id: 'g5', title: 'Holiday Fund', icon: '✈️', target: 80000, current: 35000, deadline: '2026-12-31', category: 'savings', createdAt: '2026-06-01' },
  ],

  budgets: [
    { id: 'b1', category: 'Housing', icon: '🏠', budgeted: 12500, spent: 12500, period: 'monthly' },
    { id: 'b2', category: 'Transport', icon: '🚗', budgeted: 6000, spent: 5300, period: 'monthly' },
    { id: 'b3', category: 'Food', icon: '🛒', budgeted: 5000, spent: 4200, period: 'monthly' },
    { id: 'b4', category: 'Utilities', icon: '💡', budgeted: 3000, spent: 2500, period: 'monthly' },
    { id: 'b5', category: 'Insurance', icon: '🛡️', budgeted: 3000, spent: 2800, period: 'monthly' },
    { id: 'b6', category: 'Entertainment', icon: '🎬', budgeted: 2000, spent: 1200, period: 'monthly' },
    { id: 'b7', category: 'Dining', icon: '🍽️', budgeted: 2500, spent: 1700, period: 'monthly' },
    { id: 'b8', category: 'Shopping', icon: '🛍️', budgeted: 3000, spent: 2500, period: 'monthly' },
    { id: 'b9', category: 'Health', icon: '🏥', budgeted: 2000, spent: 1850, period: 'monthly' },
    { id: 'b10', category: 'Savings', icon: '🏦', budgeted: 20000, spent: 15000, period: 'monthly' },
  ],

  holdings: [
    { id: 'h1', symbol: 'S&P 500', ticker: 'SPY', units: 45, avgCost: 462.30, accountId: 'a4' },
    { id: 'h2', symbol: 'NASDAQ', ticker: 'QQQ', units: 30, avgCost: 385.80, accountId: 'a4' },
    { id: 'h3', symbol: 'Bitcoin', ticker: 'BTC', units: 0.85, avgCost: 58200, accountId: 'a7' },
    { id: 'h4', symbol: 'Ethereum', ticker: 'ETH', units: 8.5, avgCost: 2800, accountId: 'a7' },
    { id: 'h5', symbol: 'Gold', ticker: 'XAU', units: 10, avgCost: 2250, accountId: 'a3' },
  ]
};
