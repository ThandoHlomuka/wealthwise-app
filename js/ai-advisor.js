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

  fmt(n) {
    if (Math.abs(n) >= 1000000) return (n / 1000000).toFixed(2) + 'M';
    if (Math.abs(n) >= 1000) return (n / 1000).toFixed(1) + 'k';
    return n.toFixed(0);
  }
};
