const AIAdvisor = {
  getAdvice(profile, accounts, transactions, goals) {
    const insights = [];
    const netWorth = this.calcNetWorth(accounts);
    const monthlyIncome = this.calcMonthlyIncome(transactions);
    const monthlySpend = this.calcMonthlySpend(transactions);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpend) / monthlyIncome * 100) : 0;
    const allocation = this.calcAllocation(accounts);

    const score = { overall: 0, maxScore: 100 };
    let points = 50;

    if (netWorth.total <= 0) {
      insights.push({ type: 'critical', icon: '🚨', title: 'Negative Net Worth', message: 'Your liabilities exceed your assets. Focus on paying down high-interest debt first before investing.', action: 'Create a debt repayment plan' });
      points -= 15;
    } else if (netWorth.total < 10000) {
      insights.push({ type: 'warning', icon: '⚠️', title: 'Building Phase', message: `Your net worth is R${this.fmt(netWorth.total)}. Focus on building an emergency fund of 3-6 months of expenses.`, action: 'Set up automatic savings' });
      points += 5;
    } else if (netWorth.total < 100000) {
      insights.push({ type: 'info', icon: '📈', title: 'Growth Stage', message: `Solid foundation at R${this.fmt(netWorth.total)}. Consider diversifying into low-cost index funds for long-term growth.`, action: 'Review investment options' });
      points += 15;
    } else {
      insights.push({ type: 'success', icon: '🌟', title: 'Strong Position', message: `Excellent net worth of R${this.fmt(netWorth.total)}. Focus on tax-efficient investing and wealth preservation.`, action: 'Optimize tax strategy' });
      points += 25;
    }

    if (savingsRate < 0) {
      insights.push({ type: 'critical', icon: '📉', title: 'Overspending', message: `You're spending R${this.fmt(monthlySpend - monthlyIncome)} more than you earn monthly. Review your expenses urgently.`, action: 'Create a budget now' });
      points -= 20;
    } else if (savingsRate < 10) {
      insights.push({ type: 'warning', icon: '💰', title: 'Low Savings Rate', message: `You save ${savingsRate.toFixed(1)}% of income. Aim for at least 20% to build wealth effectively.`, action: 'Increase savings by 5%' });
      points += 5;
    } else if (savingsRate < 20) {
      insights.push({ type: 'info', icon: '👍', title: 'Good Savings Habit', message: `Saving ${savingsRate.toFixed(1)}% of income is solid. Push toward 20-30% for accelerated wealth building.`, action: 'Boost savings rate' });
      points += 15;
    } else {
      insights.push({ type: 'success', icon: '🏆', title: 'Excellent Saver', message: `Saving ${savingsRate.toFixed(1)}% — you're on track for financial independence!`, action: 'Explore investment options' });
      points += 25;
    }

    const hasEmergencyFund = accounts.some(a => a.type === 'savings' && a.balance >= monthlySpend * 3);
    if (!hasEmergencyFund) {
      insights.push({ type: 'warning', icon: '🛡️', title: 'No Emergency Fund', message: `Build an emergency fund of 3-6 months expenses (R${this.fmt(monthlySpend * 3)}) in a high-yield savings account.`, action: 'Start emergency fund' });
      points -= 5;
    } else {
      insights.push({ type: 'success', icon: '✅', title: 'Emergency Fund Ready', message: 'You have adequate emergency savings. Well done!' });
      points += 10;
    }

    const invested = allocation.invested || 0;
    const investRatio = netWorth.total > 0 ? (invested / netWorth.total) * 100 : 0;
    if (investRatio < 20 && netWorth.total > 50000) {
      insights.push({ type: 'info', icon: '📊', title: 'Under-Invested', message: `Only ${investRatio.toFixed(0)}% of your net worth is invested. Consider increasing exposure to growth assets.`, action: 'Review portfolio' });
    } else if (investRatio >= 40) {
      insights.push({ type: 'success', icon: '📊', title: 'Well Invested', message: `${investRatio.toFixed(0)}% of assets working for you — great allocation for growth.` });
    }

    if (goals && goals.length > 0) {
      const onTrack = goals.filter(g => {
        if (g.target <= 0) return true;
        const progress = (g.current || 0) / g.target;
        if (!g.deadline) return progress >= 1;
        const totalDays = (new Date(g.deadline) - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        const elapsedDays = (new Date() - new Date(g.createdAt)) / (1000 * 60 * 60 * 24);
        const expectedProgress = totalDays > 0 ? Math.min(elapsedDays / totalDays, 1) : 1;
        return progress >= expectedProgress;
      }).length;
      const offTrack = goals.length - onTrack;
      if (offTrack > 0) {
        insights.push({ type: 'warning', icon: '🎯', title: `${offTrack} Goal${offTrack > 1 ? 's' : ''} Off Track`, message: 'Review your goals and adjust your savings strategy to get back on track.', action: 'Review goals' });
      } else {
        insights.push({ type: 'success', icon: '🎯', title: 'All Goals On Track', message: 'You\'re meeting all your financial goals. Consider setting new targets!' });
      }
    }

    const diversityScore = this.calcDiversityScore(accounts);
    if (diversityScore < 3 && netWorth.total > 50000) {
      insights.push({ type: 'info', icon: '🧩', title: 'Low Diversification', message: `Your assets are concentrated in ${diversityScore} type${diversityScore === 1 ? '' : 's'}. Consider spreading across more asset classes.`, action: 'Diversify portfolio' });
    }

    const advices = this.getTimeBasedAdvice();
    insights.push(...advices);

    score.overall = Math.max(0, Math.min(100, points));

    return { insights, score, netWorth, savingsRate, allocation, diversityScore: this.calcDiversityScore(accounts) };
  },

  getRecommendations(profile, accounts, transactions) {
    const recs = [];
    const monthlyIncome = this.calcMonthlyIncome(transactions);
    const monthlySpend = this.calcMonthlySpend(transactions);
    const netWorth = this.calcNetWorth(accounts);

    if (profile.riskTolerance === 'conservative') {
      recs.push({ title: 'Conservative Portfolio', allocation: { bonds: 60, stocks: 20, cash: 15, crypto: 5 }, expectedReturn: '7-9% annually', risk: 'Low' });
    } else if (profile.riskTolerance === 'moderate') {
      recs.push({ title: 'Balanced Growth Portfolio', allocation: { stocks: 55, bonds: 25, cash: 10, crypto: 10 }, expectedReturn: '10-14% annually', risk: 'Moderate' });
    } else {
      recs.push({ title: 'Aggressive Growth Portfolio', allocation: { stocks: 70, bonds: 10, cash: 5, crypto: 15 }, expectedReturn: '14-20% annually', risk: 'High' });
    }

    if (netWorth.total > 0) {
      const targetEmergency = monthlySpend * 6;
      recs.push({
        title: 'Emergency Fund Target',
        amount: targetEmergency,
        current: accounts.filter(a => a.type === 'savings').reduce((s, a) => s + (a.balance || 0), 0),
        priority: 'High'
      });
    }

    return recs;
  },

  getMarketInsights() {
    const markets = MarketData.getPrices();
    const news = MarketData.getNews();
    return { markets, news };
  },

  calcNetWorth(accounts) {
    const assets = accounts.filter(a => a.type !== 'loan' && a.type !== 'credit').reduce((s, a) => s + (a.balance || 0), 0);
    const liabilities = accounts.filter(a => a.type === 'loan' || a.type === 'credit').reduce((s, a) => s + (a.balance || 0), 0);
    return { assets, liabilities, total: assets - liabilities };
  },

  calcMonthlyIncome(transactions) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return transactions.filter(t => t.type === 'income' && new Date(t.date) >= firstDay).reduce((s, t) => s + (t.amount || 0), 0);
  },

  calcMonthlySpend(transactions) {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return Math.abs(transactions.filter(t => t.type === 'expense' && new Date(t.date) >= firstDay).reduce((s, t) => s + (t.amount || 0), 0));
  },

  calcAllocation(accounts) {
    const alloc = { cash: 0, invested: 0, property: 0, other: 0 };
    accounts.forEach(a => {
      if (a.type === 'savings' || a.type === 'checking') alloc.cash += a.balance || 0;
      else if (a.type === 'investment' || a.type === 'retirement' || a.type === 'crypto') alloc.invested += a.balance || 0;
      else if (a.type === 'property') alloc.property += a.balance || 0;
      else alloc.other += a.balance || 0;
    });
    return alloc;
  },

  calcDiversityScore(accounts) {
    return new Set(accounts.map(a => a.type)).size;
  },

  getTimeBasedAdvice() {
    const h = new Date().getHours();
    const day = new Date().getDay();
    const advices = [];
    if (day === 1) {
      advices.push({ type: 'tip', icon: '📋', title: 'Monday Financial Check', message: 'Start the week by reviewing your budget and tracking weekend spending.' });
    }
    if (day === 5) {
      advices.push({ type: 'tip', icon: '📊', title: 'Weekly Review', message: 'Review your weekly spending. Check if you\'re on track with your budget categories.' });
    }
    if (h >= 20 || h <= 6) {
      advices.push({ type: 'tip', icon: '🧘', title: 'Evening Reflection', message: 'Good time to review today\'s transactions and plan tomorrow\'s spending.' });
    }
    if (new Date().getDate() <= 3) {
      advices.push({ type: 'tip', icon: '📆', title: 'New Month Planning', message: 'Set your monthly budget and review last month\'s performance.' });
    }
    return advices;
  },

  // ==================== CHATBOT ENGINE ====================

  askChatbot(query, profile, accounts, transactions, goals) {
    const q = query.toLowerCase().trim();
    const netWorth = this.calcNetWorth(accounts);
    const monthlyIncome = this.calcMonthlyIncome(transactions);
    const monthlySpend = this.calcMonthlySpend(transactions);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpend) / monthlyIncome * 100) : 0;

    // Detect intent using keyword matching
    if (this._match(q, ['portfolio', 'investment', 'invest', 'holding', 'stock', 'share', 'etf', 'how are my investments'])) {
      return this._answerPortfolio(profile, accounts, transactions);
    }
    if (this._match(q, ['spend', 'spending', 'expense', 'overspend', 'where is my money going', 'budget', 'category'])) {
      return this._answerSpending(transactions, monthlyIncome, monthlySpend, savingsRate);
    }
    if (this._match(q, ['save', 'saving', 'savings', 'save more', 'how can i save', 'increase savings'])) {
      return this._answerSavings(profile, accounts, transactions, monthlyIncome, monthlySpend, savingsRate);
    }
    if (this._match(q, ['buy', 'stock pick', 'what to buy', 'recommend', 'should i invest', 'where to invest'])) {
      return this._answerStockPicks(profile);
    }
    if (this._match(q, ['goal', 'goal tracking', 'am i on track', 'target', 'retirement', 'financial goal'])) {
      return this._answerGoals(goals, profile);
    }
    if (this._match(q, ['budget', 'over budget', 'budget category', 'housing', 'food', 'transport', 'groceries'])) {
      return this._answerBudget(transactions);
    }
    if (this._match(q, ['market', 'market data', 'stock market', 'jse', 'sp500', 'how is the market'])) {
      return this._answerMarket();
    }
    if (this._match(q, ['opportunity', 'opportunities', 'investment opportunity', 'deal', 'offer'])) {
      return this._answerOpportunities(profile);
    }
    if (this._match(q, ['emergency', 'emergency fund', 'rainy day', 'safety net'])) {
      return this._answerEmergency(accounts, monthlySpend);
    }
    if (this._match(q, ['debt', 'loan', 'owe', 'pay off', 'credit card', 'bond', 'repay', 'liability'])) {
      return this._answerDebt(accounts);
    }
    if (this._match(q, ['salary', 'income', 'earn', 'pay', 'job', 'raise', 'side hustle'])) {
      return this._answerIncome(profile, transactions, monthlyIncome, savingsRate);
    }
    if (this._match(q, ['net worth', 'networth', 'worth', 'wealth', 'asset'])) {
      return this._answerNetWorth(accounts, netWorth);
    }
    if (this._match(q, ['risk', 'risk tolerance', 'aggressive', 'conservative', 'moderate'])) {
      return this._answerRisk(profile, accounts);
    }
    if (this._match(q, ['tax', 'tax season', 'tax return', 'tax refund', 'sars', 'tax saving'])) {
      return this._answerTax(profile);
    }
    if (this._match(q, ['retire', 'retirement', 'pension', 'ra', 'annuity', 'living annuity'])) {
      return this._answerRetirement(accounts, profile);
    }
    if (this._match(q, ['property', 'real estate', 'house', 'home', 'bond', 'rental', 'flat'])) {
      return this._answerProperty(accounts);
    }
    if (this._match(q, ['crypto', 'cryptocurrency', 'bitcoin', 'btc', 'eth', 'ethereum', 'blockchain'])) {
      return this._answerCrypto(accounts);
    }
    if (this._match(q, ['hello', 'hi', 'hey', 'help', 'what can you do', 'how are you'])) {
      return this._answerGreeting(profile);
    }

    return this._answerGeneric(query, profile, netWorth, monthlyIncome, monthlySpend, savingsRate);
  },

  _match(query, keywords) {
    return keywords.some(k => query.includes(k));
  },

  _getSpendingByCategory(transactions) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthly = transactions.filter(t => t.type === 'expense' && t.date >= monthStart);
    const byCat = {};
    monthly.forEach(t => {
      const cat = t.category || 'Other';
      byCat[cat] = (byCat[cat] || 0) + t.amount;
    });
    return byCat;
  },

  _answerPortfolio(profile, accounts, transactions) {
    const netWorth = this.calcNetWorth(accounts);
    const holdings = Storage.get('holdings') || [];
    const performance = MarketData.getPortfolioPerformance(holdings);
    const allocation = this.calcAllocation(accounts);

    let msg = `📊 **Portfolio Analysis**\n\n`;
    msg += `Your total portfolio value is approximately **R${this.fmt(netWorth.total)}** across **${accounts.length} accounts**.\n\n`;

    if (holdings.length > 0 && performance) {
      msg += `**Investment Holdings**: ${holdings.length} positions\n`;
      msg += `Current value: **R${this.fmt(performance.totalValue)}**\n`;
      msg += `Total return: **${performance.totalGainPercent >= 0 ? '+' : ''}${performance.totalGainPercent.toFixed(2)}%** (${performance.totalGain >= 0 ? 'profit' : 'loss'} of **R${this.fmt(Math.abs(performance.totalGain))}**)\n\n`;

      performance.details.forEach(d => {
        const emoji = d.gainPercent >= 0 ? '🟢' : '🔴';
        msg += `${emoji} **${d.symbol}**: R${this.fmt(d.value)} (${d.gainPercent >= 0 ? '+' : ''}${d.gainPercent.toFixed(1)}%)\n`;
      });
    } else {
      msg += `You don't have any investment holdings tracked yet. Consider starting with low-cost ETFs.\n`;
    }

    msg += `\n**Allocation**: Cash ${this.fmt(allocation.cash)} | Invested ${this.fmt(allocation.invested)} | Property ${this.fmt(allocation.property)}\n`;

    if (profile.riskTolerance === 'aggressive') {
      msg += `\n💡 Since you're aggressive, consider increasing equity exposure through global ETFs for better long-term growth.`;
    } else if (profile.riskTolerance === 'conservative') {
      msg += `\n💡 Your conservative profile suggests focusing on bonds and dividend stocks for steady income.`;
    } else {
      msg += `\n💡 A balanced approach works well. Consider rebalancing annually to maintain your target allocation.`;
    }

    return msg;
  },

  _answerSpending(transactions, monthlyIncome, monthlySpend, savingsRate) {
    const byCat = this._getSpendingByCategory(transactions);
    const totalSpent = Object.values(byCat).reduce((s, v) => s + v, 0);

    let msg = `💸 **Spending Analysis**\n\n`;
    msg += `This month you've spent **R${this.fmt(totalSpent)}** across **${Object.keys(byCat).length} categories**.\n\n`;

    if (totalSpent > 0) {
      msg += `**Breakdown**:\n`;
      Object.entries(byCat).sort(([, a], [, b]) => b - a).forEach(([cat, amt]) => {
        const pct = (amt / totalSpent) * 100;
        const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(Math.max(0, 20 - Math.round(pct / 5)));
        msg += `${bar} **${cat}**: R${this.fmt(amt)} (${pct.toFixed(1)}%)\n`;
      });
    }

    msg += `\n**Monthly**: Income **R${this.fmt(monthlyIncome)}** | Spend **R${this.fmt(monthlySpend)}** | Save **${savingsRate.toFixed(1)}%**\n`;

    const topCat = Object.entries(byCat).sort(([, a], [, b]) => b - a)[0];
    if (topCat) {
      msg += `\n💡 Your biggest expense category is **${topCat[0]}** at **R${this.fmt(topCat[1])}**. `;
      if (topCat[0] === 'Housing' || topCat[0] === 'Bond') {
        msg += 'This is normal — housing should be 25-35% of income.';
      } else if (topCat[0] === 'Food' || topCat[0] === 'Groceries') {
        msg += 'Try meal planning and bulk buying to reduce food costs by 10-15%.';
      } else if (topCat[0] === 'Transport') {
        msg += 'Consider carpooling, public transport, or fuel-efficient routes to cut costs.';
      } else if (topCat[0] === 'Dining' || topCat[0] === 'Entertainment') {
        msg += 'This is a flexible expense — cutting it by 20% could boost your savings significantly.';
      }
    }

    if (savingsRate < 10) {
      msg += `\n\n⚠️ **Warning**: Your savings rate of ${savingsRate.toFixed(1)}% is below the recommended 20%. Review discretionary spending to find savings opportunities.`;
    }

    return msg;
  },

  _answerSavings(profile, accounts, transactions, monthlyIncome, monthlySpend, savingsRate) {
    let msg = `💰 **Savings Advice**\n\n`;
    const potentialSave = monthlySpend * 0.15;
    const extraToSave = monthlyIncome * 0.2 - (monthlyIncome - monthlySpend);

    msg += `Your current savings rate: **${savingsRate.toFixed(1)}%**\n`;
    msg += `Target savings rate: **20%** (recommended minimum)\n\n`;

    if (savingsRate < 20) {
      msg += `To reach 20%, you need to save an additional **R${this.fmt(extraToSave)}** per month.\n\n`;
      msg += `**Ways to save more**:\n`;
      msg += `1️⃣ **Track every expense** for 30 days — identify where money is leaking\n`;
      msg += `2️⃣ **Automate savings** — set up an auto-transfer on payday before you can spend it\n`;
      msg += `3️⃣ **The 24-hour rule** — wait 24 hours before non-essential purchases over R500\n`;
      msg += `4️⃣ **Review subscriptions** — cancel unused streaming, gym, or app subscriptions\n`;
      msg += `5️⃣ **Cook more** — reducing takeout by 2x/week saves ~R1,500/month\n`;
      msg += `6️⃣ **Negotiate bills** — call insurance, internet, and phone providers for better rates\n\n`;

      if (potentialSave > 500) {
        msg += `💡 **Quick win**: Cutting discretionary spending by 15% could save **R${this.fmt(potentialSave)}/month** — that's **R${this.fmt(potentialSave * 12)}/year**!`;
      }
    } else if (savingsRate >= 30) {
      msg += `🌟 **Excellent!** You're saving well above the recommended rate. Consider investing your surplus for long-term growth.`;
    } else {
      msg += `✅ You're meeting the minimum savings target. To accelerate wealth building, try to push toward 30%.`;
    }

    return msg;
  },

  _answerStockPicks(profile) {
    const picks = MarketData.getStockPicks();
    const buys = picks.filter(p => p.recommendation === 'Buy').slice(0, 5);
    const holds = picks.filter(p => p.recommendation === 'Hold').slice(0, 3);
    const sells = picks.filter(p => p.recommendation === 'Sell').slice(0, 3);

    let msg = `📈 **Stock Recommendations**\n\n`;

    if (buys.length > 0) {
      msg += `**🟢 Top Buys**:\n`;
      buys.forEach(b => {
        const upside = b.targetPrice ? (((b.targetPrice - b.price) / b.price) * 100).toFixed(1) : 'N/A';
        msg += `• **${b.symbol}** (${b.ticker}) — R${this.fmt(b.price)} | Target: ${b.targetPrice ? 'R' + b.price.toLocaleString() : 'N/A'} | Upside: ${upside}%\n`;
        msg += `  ${b.rationale}\n`;
      });
    }

    if (holds.length > 0) {
      msg += `\n**🟡 Holds**:\n`;
      holds.forEach(b => {
        msg += `• **${b.symbol}** — ${b.rationale}\n`;
      });
    }

    if (sells.length > 0) {
      msg += `\n**🔴 Sells/Reduce**:\n`;
      sells.forEach(b => {
        msg += `• **${b.symbol}** — ${b.rationale}\n`;
      });
    }

    msg += `\n💡 **Based on your risk profile**: ${profile.riskTolerance || 'moderate'}\n`;
    if (profile.riskTolerance === 'aggressive') {
      msg += `Consider focusing on growth stocks and emerging market ETFs for higher potential returns.`;
    } else if (profile.riskTolerance === 'conservative') {
      msg += `Focus on blue-chip dividend stocks, bonds, and precious metals for capital preservation.`;
    } else {
      msg += `A mix of growth ETFs and dividend stocks provides balanced risk/reward.`;
    }

    return msg;
  },

  _answerGoals(goals, profile) {
    if (!goals || goals.length === 0) {
      return `🎯 **Goals**\n\nYou haven't set any financial goals yet. Goals help you stay motivated and track progress.\n\n💡 Try setting goals like:\n• Emergency fund (3-6 months expenses)\n• Retirement savings target\n• Kids' education fund\n• Debt-free target date\n• Holiday or major purchase fund\n\nHead to the Goals section to get started!`;
    }

    let msg = `🎯 **Goal Tracking**\n\nYou have **${goals.length} goal${goals.length > 1 ? 's' : ''}** set up.\n\n`;

    const onTrack = goals.filter(g => {
      if (g.target <= 0) return true;
      const progress = (g.current || 0) / g.target;
      if (!g.deadline) return progress >= 1;
      const totalDays = (new Date(g.deadline) - new Date(g.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
      const elapsedDays = (new Date() - new Date(g.createdAt || Date.now())) / (1000 * 60 * 60 * 24);
      const expectedProgress = totalDays > 0 ? Math.min(elapsedDays / totalDays, 1) : 1;
      return progress >= expectedProgress;
    }).length;

    goals.forEach(g => {
      const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
      const bar = '█'.repeat(Math.round(pct / 5)) + '░'.repeat(Math.max(0, 20 - Math.round(pct / 5)));
      const status = pct >= 100 ? '✅' : pct >= 50 ? '🟡' : '🔴';
      msg += `${status} **${g.name}**: ${pct.toFixed(0)}% — R${this.fmt(g.current)} / R${this.fmt(g.target)}\n${bar}\n`;
      if (g.deadline) msg += `   Target: ${new Date(g.deadline).toLocaleDateString()}\n`;
    });

    msg += `\n${onTrack}/${goals.length} goals on track. `;
    if (onTrack === goals.length) {
      msg += `🌟 Great job staying on track!`;
    } else {
      msg += `Review your off-track goals and consider adjusting contributions or timelines.`;
    }

    return msg;
  },

  _answerBudget(transactions) {
    const budgets = Storage.getBudgets() || [];
    if (budgets.length === 0) {
      return `📋 **Budget**\n\nYou haven't set up any budget categories yet. Budgets help you control spending and reach your savings goals faster.\n\n💡 Head to the Budget section to create your first budget category (e.g., Groceries, Transport, Dining).`;
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const monthlyTx = transactions.filter(t => t.date >= monthStart && t.type === 'expense');

    let msg = `📋 **Budget Report**\n\n`;
    let overBudget = 0;
    let totalSaved = 0;

    budgets.forEach(b => {
      const spent = monthlyTx.filter(t => t.category && t.category.toLowerCase() === b.category.toLowerCase()).reduce((s, t) => s + t.amount, 0);
      const pct = b.budgeted > 0 ? (spent / b.budgeted) * 100 : 0;
      const isOver = spent > b.budgeted;
      const bar = '█'.repeat(Math.round(Math.min(pct, 100) / 5)) + '░'.repeat(Math.max(0, 20 - Math.round(Math.min(pct, 100) / 5)));
      const emoji = isOver ? '🔴' : '🟢';

      msg += `${emoji} **${b.category}**: R${this.fmt(spent)} / R${this.fmt(b.budgeted)} (${pct.toFixed(0)}%)\n${bar}\n`;
      if (isOver) {
        msg += `   ⚠️ Over by R${this.fmt(spent - b.budgeted)}\n`;
        overBudget++;
      } else {
        totalSaved += b.budgeted - spent;
      }
    });

    if (overBudget > 0) {
      msg += `\n⚠️ **${overBudget} categor${overBudget > 1 ? 'ies' : 'y'} over budget**. Review spending in these areas.`;
    }
    if (totalSaved > 0) {
      msg += `\n✅ **R${this.fmt(totalSaved)} under budget** across categories — well done!`;
    }

    return msg;
  },

  _answerMarket() {
    const summary = MarketData.getMarketSummary();
    const movers = MarketData.getTopMovers();
    const prices = MarketData.getPrices();
    const news = MarketData.getNews();

    let msg = `📊 **Market Overview**\n\n`;

    msg += `**Market Breadth**: ${summary.advancers} advancers · ${summary.decliners} decliners · ${summary.unchanged} unchanged\n`;
    msg += `**Average Change**: ${summary.avgChange >= 0 ? '+' : ''}${summary.avgChange.toFixed(2)}%\n\n`;

    msg += `**Top Gainers 📈**:\n`;
    movers.gainers.forEach(g => {
      msg += `• **${g.symbol}** (${g.ticker}): +${g.changePercent.toFixed(2)}% to R${this.fmt(g.price)}\n`;
    });

    msg += `\n**Top Losers 📉**:\n`;
    movers.losers.forEach(g => {
      msg += `• **${g.symbol}** (${g.ticker}): ${g.changePercent.toFixed(2)}% to R${this.fmt(g.price)}\n`;
    });

    msg += `\n**Latest News**:\n`;
    news.slice(0, 3).forEach(n => {
      const icon = n.sentiment === 'positive' ? '🟢' : n.sentiment === 'negative' ? '🔴' : '🟡';
      msg += `${icon} ${n.text} (${n.source}, ${n.time})\n`;
    });

    return msg;
  },

  _answerOpportunities(profile) {
    const opps = MarketData.getMatchingOpportunities(profile);

    let msg = `💎 **Investment Opportunities**\n\n`;
    msg += `Based on your **${profile.riskTolerance || 'moderate'}** risk profile, here are matching opportunities:\n\n`;

    opps.slice(0, 5).forEach(o => {
      const stars = '⭐'.repeat(Math.round(o.matchScore / 20));
      msg += `${o.icon} **${o.title}** ${stars}\n`;
      msg += `   Expected: ${o.expectedReturn} | Risk: ${o.risk} | Min: R${o.minInvestment.toLocaleString()}\n`;
      msg += `   ${o.description}\n\n`;
    });

    msg += `💡 These opportunities are matched to your risk profile. Always diversify and consult a certified financial advisor before investing.`;

    return msg;
  },

  _answerEmergency(accounts, monthlySpend) {
    const emergencyCash = accounts.filter(a => a.type === 'savings' || a.type === 'checking').reduce((s, a) => s + (a.balance || 0), 0);
    const targetMonths = 6;
    const target = monthlySpend * targetMonths;
    const monthsCovered = monthlySpend > 0 ? (emergencyCash / monthlySpend) : 0;

    let msg = `🛡️ **Emergency Fund Analysis**\n\n`;
    msg += `Current liquid savings: **R${this.fmt(emergencyCash)}**\n`;
    msg += `Monthly expenses: **R${this.fmt(monthlySpend)}**\n`;
    msg += `Emergency fund covers: **${monthsCovered.toFixed(1)} months**\n`;
    msg += `Recommended: **${targetMonths} months** (R${this.fmt(target)})\n\n`;

    if (monthsCovered >= 6) {
      msg += `✅ **Excellent!** Your emergency fund covers ${monthsCovered.toFixed(1)} months of expenses. Consider investing excess savings for growth.`;
    } else if (monthsCovered >= 3) {
      msg += `✅ **Adequate.** You have ${monthsCovered.toFixed(1)} months covered. Top up to reach 6 months for extra security.`;
      const shortfall = target - emergencyCash;
      if (shortfall > 0) msg += `\n\n📌 Shortfall: **R${this.fmt(shortfall)}** — aim to save this over the next ${Math.ceil(shortfall / (monthlySpend * 0.2))} months.`;
    } else if (monthsCovered > 0) {
      msg += `⚠️ **Below recommended.** You only have ${monthsCovered.toFixed(1)} months of expenses saved.`;
      msg += `\n\n📌 **Priority**: Build your emergency fund to at least 3 months (R${this.fmt(monthlySpend * 3)}) before focusing on investments.`;
      const monthlyExtra = (monthlySpend * 0.15);
      msg += `\n💡 Saving an extra **R${this.fmt(monthlyExtra)}/month** gets you there in ~${Math.ceil((monthlySpend * 3 - emergencyCash) / monthlyExtra)} months.`;
    } else {
      msg += `🚨 **No emergency fund!** This is your #1 financial priority. Save 3-6 months of expenses in an accessible savings account.`;
    }

    return msg;
  },

  _answerDebt(accounts) {
    const loans = accounts.filter(a => a.type === 'loan' || a.type === 'credit');
    if (loans.length === 0) {
      return `✅ **Debt Status**\n\nYou have no outstanding loans or credit balances tracked. Great work staying debt-free! If you have debt not tracked here, consider adding it for a complete picture.`;
    }

    let msg = `💳 **Debt Analysis**\n\n`;
    let totalDebt = 0;
    let totalInterest = 0;

    loans.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0));
    loans.forEach(l => {
      const balance = Math.abs(l.balance || 0);
      totalDebt += balance;
      totalInterest += l.interestRate || 0;
      const urgency = (l.interestRate || 0) >= 15 ? '🔴' : (l.interestRate || 0) >= 10 ? '🟡' : '🟢';
      msg += `${urgency} **${l.name}**: R${this.fmt(balance)} @ ${l.interestRate || '?'}% interest\n`;
    });

    msg += `\n**Total debt**: **R${this.fmt(totalDebt)}**\n`;
    const highInterest = loans.filter(l => (l.interestRate || 0) >= 15);
    if (highInterest.length > 0) {
      msg += `\n🚨 **Priority**: Pay off high-interest debt first (${highInterest.map(l => l.name).join(', ')}). These cost you the most in interest.`;
      const totalHigh = highInterest.reduce((s, l) => s + Math.abs(l.balance || 0), 0);
      msg += `\n📌 Total high-interest: **R${this.fmt(totalHigh)}**`;
      msg += `\n💡 **Snowball method**: Pay minimum on all debts, put extra money toward the highest interest rate first.`;
    } else {
      msg += `\n✅ Your interest rates are manageable. Focus on paying down debt while still investing for growth.`;
    }

    return msg;
  },

  _answerIncome(profile, transactions, monthlyIncome, savingsRate) {
    let msg = `💼 **Income Analysis**\n\n`;
    const incomeSources = transactions.filter(t => t.type === 'income');
    const bySource = {};
    incomeSources.forEach(t => {
      const s = t.category || 'Other Income';
      bySource[s] = (bySource[s] || 0) + t.amount;
    });

    msg += `Monthly income: **R${this.fmt(monthlyIncome)}**\n\n`;

    if (Object.keys(bySource).length > 0) {
      msg += `**Income Sources**:\n`;
      Object.entries(bySource).sort(([, a], [, b]) => b - a).forEach(([cat, amt]) => {
        msg += `• ${cat}: R${this.fmt(amt)}\n`;
      });
    }

    msg += `\n💡 **Diversification**: Having multiple income streams reduces financial risk.`;
    if (Object.keys(bySource).length < 2) {
      msg += ` Consider developing a side hustle or freelance income.`;
    }
    msg += `\n\n📌 Your savings rate of **${savingsRate.toFixed(1)}%** means you keep R${this.fmt(monthlyIncome * savingsRate / 100)} of each month's income.`;

    return msg;
  },

  _answerNetWorth(accounts, netWorth) {
    let msg = `🏦 **Net Worth Statement**\n\n`;
    msg += `**Total Assets**: R${this.fmt(netWorth.assets)}\n`;
    msg += `**Total Liabilities**: R${this.fmt(netWorth.liabilities)}\n`;
    msg += `**Net Worth**: **R${this.fmt(netWorth.total)}**\n\n`;

    const assetsByType = {};
    accounts.forEach(a => {
      if (a.type !== 'loan' && a.type !== 'credit') {
        assetsByType[a.type] = (assetsByType[a.type] || 0) + (a.balance || 0);
      }
    });

    msg += `**Asset Breakdown**:\n`;
    Object.entries(assetsByType).sort(([, a], [, b]) => b - a).forEach(([type, val]) => {
      const pct = netWorth.assets > 0 ? (val / netWorth.assets) * 100 : 0;
      const icon = { banking: '🏦', savings: '💰', investment: '📈', property: '🏠', crypto: '₿', retirement: '👴' }[type] || '📊';
      msg += `${icon} ${type}: R${this.fmt(val)} (${pct.toFixed(1)}%)\n`;
    });

    const loanAccounts = accounts.filter(a => a.type === 'loan' || a.type === 'credit');
    if (loanAccounts.length > 0) {
      msg += `\n**Liabilities**:\n`;
      loanAccounts.forEach(l => msg += `• ${l.name}: R${this.fmt(Math.abs(l.balance || 0))}\n`);
    }

    if (netWorth.total > 1000000) {
      msg += `\n🌟 **You're a millionaire!** Focus on wealth preservation and tax-efficient investing.`;
    } else if (netWorth.total > 0) {
      msg += `\n📈 Positive net worth is a great start. Keep building assets and reducing liabilities.`;
    } else {
      msg += `\n📉 Negative net worth — focus on debt repayment as your top priority.`;
    }

    return msg;
  },

  _answerRisk(profile, accounts) {
    const allocation = this.calcAllocation(accounts);
    const divScore = this.calcDiversityScore(accounts);

    let msg = `🎲 **Risk Profile Analysis**\n\n`;
    msg += `Your risk tolerance: **${(profile.riskTolerance || 'moderate').charAt(0).toUpperCase() + (profile.riskTolerance || 'moderate').slice(1)}**\n\n`;

    const invested_pct = (allocation.invested + allocation.property) / Math.max(1, (allocation.cash + allocation.invested + allocation.property + allocation.other)) * 100;
    msg += `**Current Allocation**:\n`;
    msg += `• Cash: ${((allocation.cash / Math.max(1, (allocation.cash + allocation.invested + allocation.property + allocation.other))) * 100).toFixed(0)}%\n`;
    msg += `• Investments: ${((allocation.invested / Math.max(1, (allocation.cash + allocation.invested + allocation.property + allocation.other))) * 100).toFixed(0)}%\n`;
    msg += `• Property: ${((allocation.property / Math.max(1, (allocation.cash + allocation.invested + allocation.property + allocation.other))) * 100).toFixed(0)}%\n`;
    msg += `• Diversity Score: ${divScore}/8 asset types\n\n`;

    if (profile.riskTolerance === 'aggressive') {
      msg += `**Recommended**: 70% equities/stocks, 15% crypto/alternatives, 10% bonds, 5% cash\n`;
      if (invested_pct < 60) msg += `⚠️ Your allocation is too conservative for your risk profile. Increase equity exposure.`;
    } else if (profile.riskTolerance === 'conservative') {
      msg += `**Recommended**: 50% bonds, 25% equities, 15% cash, 10% property\n`;
      if (invested_pct > 50) msg += `⚠️ Your allocation may be too aggressive for your stated risk tolerance. Consider rebalancing toward bonds and cash.`;
    } else {
      msg += `**Recommended**: 50% equities, 25% bonds, 15% property, 10% cash\n`;
    }

    return msg;
  },

  _answerTax(profile) {
    let msg = `📋 **Tax Optimisation Tips**\n\n`;

    msg += `**Retirement Annuity**: Contribute up to 27.5% of your taxable income (max R350,000/year) — tax deductible.\n`;
    msg += `**Tax-Free Savings Account (TFSA)**: Max R36,000/year contribution (lifetime limit R500,000) — no tax on growth or withdrawals.\n`;
    msg += `**Medical Aid**: Tax credits for medical aid contributions and qualifying medical expenses.\n`;
    msg += `**Capital Gains**: First R40,000 of capital gain is tax-free each year (R300,000 on primary residence).\n\n`;

    if (profile.monthlyIncome && profile.monthlyIncome > 50000) {
      const annual = profile.monthlyIncome * 12;
      const maxRA = Math.min(annual * 0.275, 350000);
      msg += `💡 Based on your income of R${this.fmt(annual)}/year, you could contribute up to **R${this.fmt(maxRA)}** to a Retirement Annuity and deduct it from taxable income.\n\n`;
    }

    msg += `📌 **Tip**: Max out your TFSA every year before investing in taxable accounts. The tax-free growth compounds enormously over time.`;

    return msg;
  },

  _answerRetirement(accounts, profile) {
    const retirementAccounts = accounts.filter(a => a.type === 'retirement');
    const retirementTotal = retirementAccounts.reduce((s, a) => s + (a.balance || 0), 0);
    const age = profile.age || 35;
    const retireAge = 65;
    const yearsToRetire = retireAge - age;
    const monthlyIncome = profile.monthlyIncome || 0;
    const targetIncome = monthlyIncome * 0.75;
    const targetRetirement = targetIncome * 12 * 25;

    let msg = `👴 **Retirement Planning**\n\n`;
    msg += `Current age: **${age}** | Retirement age: **${retireAge}** | Years to go: **${yearsToRetire}**\n\n`;

    if (retirementAccounts.length > 0) {
      msg += `**Retirement savings**: R${this.fmt(retirementTotal)}\n`;
      retirementAccounts.forEach(a => msg += `• ${a.name}: R${this.fmt(a.balance)}\n`);
    } else {
      msg += `No retirement accounts tracked yet.\n`;
    }

    msg += `\n**Estimated need**: R${this.fmt(targetRetirement)} (to generate R${this.fmt(targetIncome)}/month in retirement)\n\n`;

    const monthlyNeeded = (targetRetirement - retirementTotal) / (yearsToRetire * 12) || 0;
    msg += `📌 You'd need to save approximately **R${this.fmt(monthlyNeeded)}/month** to reach your retirement goal.\n`;
    msg += `💡 The power of compound interest means starting early and being consistent matters more than the amount.\n\n`;
    msg += `**Tax-efficient options**:\n`;
    msg += `1. Retirement Annuity (tax-deductible contributions)\n`;
    msg += `2. Employer pension/provident fund (if available)\n`;
    msg += `3. TFSA for supplementary retirement savings`;

    return msg;
  },

  _answerProperty(accounts) {
    const properties = accounts.filter(a => a.type === 'property');
    const propertyLoans = accounts.filter(a => a.type === 'loan' && (a.name || '').toLowerCase().includes('bond'));

    let msg = `🏠 **Property Analysis**\n\n`;

    if (properties.length > 0) {
      const totalValue = properties.reduce((s, a) => s + (a.balance || 0), 0);
      const totalBonds = propertyLoans.reduce((s, a) => s + Math.abs(a.balance || 0), 0);
      const equity = totalValue - totalBonds;

      msg += `**Properties**: ${properties.length}\n`;
      msg += `Total value: **R${this.fmt(totalValue)}**\n`;
      msg += `Outstanding bonds: **R${this.fmt(totalBonds)}**\n`;
      msg += `Equity: **R${this.fmt(equity)}** (${totalValue > 0 ? ((equity / totalValue) * 100).toFixed(0) : 0}%)\n\n`;

      properties.forEach(p => msg += `• ${p.name}: R${this.fmt(p.balance)}\n`);
    } else {
      msg += `No property assets tracked. Property can be a good inflation hedge and diversification tool.\n\n`;
    }

    const bondRate = propertyLoans.length > 0 ? propertyLoans[0].interestRate : 11.75;
    msg += `\n💡 Current prime lending rate: ~${bondRate}%. If your bond rate is above prime, consider shopping around for a better rate or negotiating with your bank.`;

    return msg;
  },

  _answerCrypto(accounts) {
    const crypto = accounts.filter(a => a.type === 'crypto');

    let msg = `₿ **Crypto Analysis**\n\n`;

    if (crypto.length > 0) {
      const totalCrypto = crypto.reduce((s, a) => s + (a.balance || 0), 0);
      msg += `You have **${crypto.length} crypto asset${crypto.length > 1 ? 's' : ''}** worth **R${this.fmt(totalCrypto)}**\n\n`;
      crypto.forEach(c => msg += `• ${c.name}: R${this.fmt(c.balance)}\n`);

      msg += `\n💡 Crypto should typically be 5-15% of your total portfolio given its volatility. `;
      msg += `Consider taking profits if your allocation exceeds your target.`;
    } else {
      msg += `You don't have any crypto assets tracked.\n\n`;
      msg += `💡 Crypto can be a small portfolio allocation (5-10%) for diversification, but it's highly volatile. `;
      msg += `Start with established coins like Bitcoin and Ethereum, and only invest what you can afford to lose.`;
    }

    const prices = MarketData.getPrices();
    const btc = prices.find(p => p.ticker === 'BTC');
    const eth = prices.find(p => p.ticker === 'ETH');
    if (btc && eth) {
      msg += `\n\n**Current prices**: BTC R${this.fmt(btc.price)} (${btc.changePercent >= 0 ? '+' : ''}${btc.changePercent.toFixed(2)}%) | ETH R${this.fmt(eth.price)} (${eth.changePercent >= 0 ? '+' : ''}${eth.changePercent.toFixed(2)}%)`;
    }

    return msg;
  },

  _answerGreeting(profile) {
    const h = new Date().getHours();
    const timeGreeting = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';

    return `👋 Good ${timeGreeting}, ${profile.name || 'there'}!\n\nI'm your **WealthWise AI** financial advisor. I can help you with:\n\n` +
      `📊 **"How are my investments?"** — Portfolio & holdings analysis\n` +
      `💸 **"Where is my money going?"** — Spending breakdown\n` +
      `💰 **"How can I save more?"** — Savings strategies\n` +
      `📈 **"What stocks should I buy?"** — Stock recommendations\n` +
      `📋 **"Am I over budget?"** — Budget tracking\n` +
      `🎯 **"Am I on track for my goals?"** — Goal progress\n` +
      `🛡️ **"Do I have enough emergency savings?"** — Emergency fund check\n` +
      `💳 **"How should I pay off debt?"** — Debt analysis\n` +
      `💎 **"What investment opportunities suit me?"** — Matched opportunities\n\n` +
      `Just ask me anything about your finances! 🚀`;
  },

  _answerGeneric(query, profile, netWorth, monthlyIncome, monthlySpend, savingsRate) {
    return `🤔 I understand you're asking about: "${query}"\n\n` +
      `I can help with specific financial topics. Here's a quick summary of your finances:\n\n` +
      `• **Net Worth**: R${this.fmt(netWorth.total)}\n` +
      `• **Monthly Income**: R${this.fmt(monthlyIncome)}\n` +
      `• **Monthly Spending**: R${this.fmt(monthlySpend)}\n` +
      `• **Savings Rate**: ${savingsRate.toFixed(1)}%\n\n` +
      `Try asking me something like:\n` +
      `• "How are my investments doing?"\n` +
      `• "Where am I overspending?"\n` +
      `• "What stocks should I buy?"\n` +
      `• "Do I have enough emergency savings?"\n` +
      `• "Am I on track for retirement?"\n` +
      `• "What investment opportunities match my profile?"`;
  },

  fmt(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toFixed(0);
  }
};
