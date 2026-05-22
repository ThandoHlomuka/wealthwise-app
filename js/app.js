const App = {
  currentView: 'dashboard',
  profile: null,

  init() {
    const profile = Storage.getProfile();
    if (!profile.name || profile.name === 'User') {
      Storage.saveProfile(SEED.profile);
      SEED.accounts.forEach(a => Storage.saveAccount(a));
      SEED.transactions.forEach(t => Storage.saveTransaction(t));
      SEED.goals.forEach(g => Storage.saveGoal(g));
      SEED.budgets.forEach(b => Storage.saveBudget(b));
      Storage.set('holdings', SEED.holdings);

      this.profile = Storage.getProfile();
      if (!this.profile.onboardingDone) {
        this.showOnboarding();
        return;
      }
    } else {
      this.profile = profile;
    }

    this.render();
    this.startNetWorthTracking();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  showOnboarding() {
    const overlay = document.createElement('div');
    overlay.className = 'onboarding-overlay';
    overlay.id = 'onboarding-overlay';
    overlay.innerHTML = `
      <div class="card" style="max-width: 480px; margin: 2rem auto; padding: 2rem; text-align: center;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">✨</div>
        <h1>Welcome to WealthWise AI</h1>
        <p class="text-muted" style="margin: 1rem 0;">
          Your intelligent financial advisor. Track accounts, manage budgets,
          monitor investments, and get AI-powered insights.
        </p>
        <button class="btn btn-primary btn-block" onclick="App.completeOnboarding()">Get Started</button>
      </div>
    `;
    document.body.appendChild(overlay);
  },

  completeOnboarding() {
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) overlay.remove();
    this.profile.onboardingDone = true;
    Storage.saveProfile(this.profile);
    this.render();
    this.startNetWorthTracking();
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    this.currentView = hash;
    this.renderView();
    this.updateActiveTab();
  },

  updateActiveTab() {
    document.querySelectorAll('.bottom-tab').forEach(tab => {
      const v = tab.dataset.view;
      const subViews = ['portfolio', 'goals', 'budget', 'settings'];
      const isActive = v === this.currentView || (v === 'more' && subViews.includes(this.currentView));
      tab.classList.toggle('active', isActive);
    });
  },

  navigate(view) {
    window.location.hash = view;
  },

  render() {
    this.renderNav();
    this.renderBottomTabs();
    this.renderView();
  },

  renderNav() {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = `
      <div class="flex flex-between" style="align-items: center; padding: 0.75rem 1rem;">
        <div class="flex gap-1" style="align-items: center;">
          <span style="font-size: 1.5rem;">✨</span>
          <span style="font-weight: 700; font-size: 1.25rem;">WealthWise AI</span>
        </div>
        <span class="badge badge-primary" style="font-size: 0.65rem; padding: 0.2rem 0.5rem;">BETA</span>
      </div>
    `;
  },

  renderBottomTabs() {
    const tabs = [
      { view: 'dashboard', label: 'Dashboard', icon: '📊' },
      { view: 'accounts', label: 'Accounts', icon: '💳' },
      { view: 'transactions', label: 'Transactions', icon: '💸' },
      { view: 'advisor', label: 'Advisor', icon: '🤖' },
      { view: 'more', label: 'More', icon: '⚙️' },
    ];
    const container = document.createElement('div');
    container.className = 'bottom-tabs';
    container.innerHTML = tabs.map(t => `
      <button class="bottom-tab${t.view === 'dashboard' ? ' active' : ''}" data-view="${t.view}" onclick="App.navigate('${t.view}')">
        <span class="tab-icon">${t.icon}</span>
        <span>${t.label}</span>
      </button>
    `).join('');
    document.body.appendChild(container);
  },

  renderView() {
    const main = document.getElementById('main-content');
    if (!main) return;
    main.innerHTML = '';
    switch (this.currentView) {
      case 'dashboard': this.renderDashboard(main); break;
      case 'accounts': this.renderAccounts(main); break;
      case 'transactions': this.renderTransactions(main); break;
      case 'advisor': this.renderAdvisor(main); break;
      case 'portfolio': this.renderPortfolio(main); break;
      case 'goals': this.renderGoals(main); break;
      case 'budget': this.renderBudget(main); break;
      case 'settings': this.renderSettings(main); break;
      case 'more': this.renderMore(main); break;
      default: this.renderDashboard(main);
    }
  },

  // ----- DASHBOARD -----
  renderDashboard(main) {
    const accounts = Storage.getAccounts();
    const transactions = Storage.getTransactions();
    const netWorth = AIAdvisor.calcNetWorth(accounts);
    const monthlyIncome = AIAdvisor.calcMonthlyIncome(transactions);
    const monthlySpend = AIAdvisor.calcMonthlySpend(transactions);
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlySpend) / monthlyIncome * 100) : 0;
    const recent = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    const advisorData = AIAdvisor.getAdvice(this.profile, accounts, transactions);

    const totalAssets = accounts.filter(a => a.type !== 'loan' && a.type !== 'credit').reduce((s, a) => s + a.balance, 0);
    const totalLiabilities = accounts.filter(a => a.type === 'loan' || a.type === 'credit').reduce((s, a) => s + a.balance, 0);

    let advisorScore = 65;
    if (advisorData && advisorData.score) {
      advisorScore = advisorData.score.overall || 65;
    }

    main.innerHTML = `
      <div class="view-header">
        <h2>Dashboard</h2>
      </div>

      <div class="stat-row">
        <div class="stat-card">
          <span class="text-muted">Net Worth</span>
          <span style="font-size: 1.5rem; font-weight: 700;">${this.fmt(netWorth)}</span>
        </div>
        <div class="stat-card">
          <span class="text-muted">Income / Month</span>
          <span style="font-size: 1.25rem; font-weight: 600;" class="text-success">${this.fmt(monthlyIncome)}</span>
        </div>
        <div class="stat-card">
          <span class="text-muted">Spend / Month</span>
          <span style="font-size: 1.25rem; font-weight: 600;" class="text-danger">${this.fmt(monthlySpend)}</span>
        </div>
        <div class="stat-card">
          <span class="text-muted">Savings Rate</span>
          <span style="font-size: 1.25rem; font-weight: 600;" class="${savingsRate >= 20 ? 'text-success' : 'text-danger'}">${savingsRate.toFixed(1)}%</span>
        </div>
      </div>

      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <div class="flex flex-between" style="margin-bottom: 0.5rem;">
          <strong>Account Balances</strong>
          <span style="font-weight: 600;">${this.fmt(totalAssets)}</span>
        </div>
        ${accounts.length === 0 ? '<p class="text-muted">No accounts yet</p>' :
          accounts.map(a => `
            <div class="flex flex-between" style="padding: 0.35rem 0; font-size: 0.9rem;">
              <span>${this.getAccountIcon(a.type)} ${a.name}</span>
              <span style="font-weight: 500;">${this.fmt(a.balance)}</span>
            </div>
          `).join('')}
      </div>

      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong>Recent Transactions</strong>
        ${recent.length === 0 ? '<p class="text-muted mt-1">No transactions yet</p>' :
          recent.map(t => `
            <div class="flex flex-between" style="padding: 0.35rem 0; font-size: 0.9rem;">
              <span>${t.icon || '💳'} ${t.description || t.category}</span>
              <span class="${t.type === 'income' ? 'text-success' : 'text-danger'}">${t.type === 'income' ? '+' : '-'}${this.fmt(t.amount)}</span>
            </div>
          `).join('')}
      </div>

      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <div class="flex flex-between">
          <strong>Financial Health Score</strong>
          <span class="${advisorScore >= 70 ? 'text-success' : advisorScore >= 40 ? 'text-warning' : 'text-danger'}" style="font-weight: 700;">${advisorScore}/100</span>
        </div>
      </div>

      <div class="two-col" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        <button class="btn btn-primary" onclick="App.navigate('accounts')">Manage Accounts</button>
        <button class="btn btn-secondary" onclick="App.navigate('transactions')">View Transactions</button>
        <button class="btn btn-primary" onclick="App.navigate('advisor')">AI Advice</button>
        <button class="btn btn-secondary" onclick="App.navigate('goals')">Set Goals</button>
      </div>
    `;
  },

  // ----- ACCOUNTS -----
  renderAccounts(main) {
    const accounts = Storage.getAccounts();
    const grouped = { banking: [], savings: [], investment: [], crypto: [], property: [], loan: [], credit: [], retirement: [] };
    const order = ['banking', 'savings', 'investment', 'crypto', 'property', 'loan', 'credit', 'retirement'];
    const labels = { banking: 'Banking', savings: 'Savings', investment: 'Investments', crypto: 'Crypto', property: 'Property', loan: 'Loans', credit: 'Credit', retirement: 'Retirement' };

    accounts.forEach(a => {
      if (!grouped[a.type]) grouped[a.type] = [];
      grouped[a.type].push(a);
    });

    main.innerHTML = `
      <div class="view-header">
        <h2>Accounts</h2>
        <button class="btn btn-sm btn-primary" onclick="App.showAccountForm()">+ Add</button>
      </div>
      ${order.map(type => {
        const items = grouped[type] || [];
        if (items.length === 0) return '';
        return `
          <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
            <strong style="display: block; margin-bottom: 0.5rem;">${this.getAccountIcon(type)} ${labels[type]}</strong>
            ${items.map(a => `
              <div class="account-item" style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <div class="flex gap-1" style="align-items: center;">
                  <span class="account-icon ${type}">${this.getAccountIcon(type)}</span>
                  <div>
                    <div style="font-weight: 500;">${a.name}</div>
                    <small class="text-muted">${a.description || ''}</small>
                  </div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 600;">${this.fmt(a.balance)}</div>
                  <div>
                    <button class="btn btn-xs btn-outline" onclick="App.showAccountForm('${a.id}')">Edit</button>
                    <button class="btn btn-xs btn-danger" onclick="App.deleteAccount('${a.id}')">Del</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `;
      }).join('')}
      ${accounts.length === 0 ? '<div class="empty-state"><div class="empty-icon">💳</div><p>No accounts yet. Add your first account!</p></div>' : ''}
    `;
  },

  showAccountForm(accountId) {
    const account = accountId ? Storage.getAccounts().find(a => a.id === accountId) : null;
    const isEdit = !!account;
    const types = ['banking', 'savings', 'investment', 'crypto', 'property', 'loan', 'credit', 'retirement'];

    this.showModal(`
      <h3 style="margin-bottom: 1rem;">${isEdit ? 'Edit' : 'Add'} Account</h3>
      <form id="account-form" onsubmit="App.saveAccount(event)">
        <input type="hidden" name="id" value="${isEdit ? account.id : ''}">
        <div class="form-group">
          <label>Account Name</label>
          <input type="text" name="name" class="form-control" value="${isEdit ? account.name : ''}" required>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" class="form-control" required>
            ${types.map(t => `<option value="${t}"${isEdit && account.type === t ? ' selected' : ''}>${t.charAt(0).toUpperCase() + t.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label>Balance (ZAR)</label>
          <input type="number" name="balance" class="form-control" step="0.01" value="${isEdit ? account.balance : '0'}" required>
        </div>
        <div class="form-group">
          <label>Description (optional)</label>
          <input type="text" name="description" class="form-control" value="${isEdit ? (account.description || '') : ''}">
        </div>
        <div class="form-row" style="gap: 0.5rem; margin-top: 1rem;">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Account</button>
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        </div>
      </form>
    `);
  },

  saveAccount(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const id = fd.get('id') || 'acc_' + Date.now();
    const account = {
      id,
      name: fd.get('name'),
      type: fd.get('type'),
      balance: parseFloat(fd.get('balance')) || 0,
      description: fd.get('description') || '',
    };
    Storage.saveAccount(account);
    this.closeModal();
    this.renderView();
  },

  deleteAccount(id) {
    if (!confirm('Delete this account?')) return;
    Storage.deleteAccount(id);
    this.renderView();
  },

  // ----- TRANSACTIONS -----
  renderTransactions(main) {
    const transactions = Storage.getTransactions();
    const sorted = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date));
    const filterType = this._txFilter || 'all';

    const filtered = filterType === 'all' ? sorted : sorted.filter(t => t.type === filterType);

    main.innerHTML = `
      <div class="view-header">
        <h2>Transactions</h2>
        <button class="btn btn-sm btn-primary" onclick="App.showTransactionForm()">+ Add</button>
      </div>
      <div class="flex gap-1" style="margin-bottom: 0.75rem;">
        <button class="btn btn-xs ${filterType === 'all' ? 'btn-primary' : 'btn-outline'}" onclick="App.setTxFilter('all')">All</button>
        <button class="btn btn-xs ${filterType === 'income' ? 'btn-primary' : 'btn-outline'}" onclick="App.setTxFilter('income')">Income</button>
        <button class="btn btn-xs ${filterType === 'expense' ? 'btn-primary' : 'btn-outline'}" onclick="App.setTxFilter('expense')">Expenses</button>
      </div>
      ${filtered.length === 0 ? '<div class="empty-state"><div class="empty-icon">💸</div><p>No transactions found.</p></div>' :
        filtered.map(t => `
          <div class="tx-item" style="display: flex; align-items: center; padding: 0.6rem 1rem; background: white; border-radius: 0.5rem; margin-bottom: 0.4rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
            <span class="tx-icon" style="font-size: 1.25rem; margin-right: 0.75rem;">${t.icon || '💳'}</span>
            <div style="flex: 1;">
              <div style="font-weight: 500; font-size: 0.9rem;">${t.description || t.category}</div>
              <small class="text-muted">${new Date(t.date).toLocaleDateString()} · ${t.category}</small>
            </div>
            <div style="text-align: right;">
              <div style="font-weight: 600; font-size: 0.95rem;" class="${t.type === 'income' ? 'text-success' : 'text-danger'}">${t.type === 'income' ? '+' : '-'}${this.fmt(t.amount)}</div>
              <div>
                <button class="btn btn-xs btn-outline" onclick="App.showTransactionForm('${t.id}')">Edit</button>
                <button class="btn btn-xs btn-danger" onclick="App.deleteTransaction('${t.id}')">Del</button>
              </div>
            </div>
          </div>
        `).join('')}
    `;
  },

  setTxFilter(filter) {
    this._txFilter = filter;
    this.renderView();
  },

  showTransactionForm(txId) {
    const tx = txId ? Storage.getTransactions().find(t => t.id === txId) : null;
    const isEdit = !!tx;
    const today = new Date().toISOString().split('T')[0];
    const accounts = Storage.getAccounts();

    this.showModal(`
      <h3 style="margin-bottom: 1rem;">${isEdit ? 'Edit' : 'Add'} Transaction</h3>
      <form id="tx-form" onsubmit="App.saveTransaction(event)">
        <input type="hidden" name="id" value="${isEdit ? tx.id : ''}">
        <div class="form-group">
          <label>Date</label>
          <input type="date" name="date" class="form-control" value="${isEdit ? tx.date : today}" required>
        </div>
        <div class="form-group">
          <label>Type</label>
          <select name="type" class="form-control" required>
            <option value="income"${isEdit && tx.type === 'income' ? ' selected' : ''}>Income</option>
            <option value="expense"${isEdit && tx.type === 'expense' ? ' selected' : ''}>Expense</option>
          </select>
        </div>
        <div class="form-group">
          <label>Category</label>
          <input type="text" name="category" class="form-control" value="${isEdit ? tx.category : ''}" required>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" name="description" class="form-control" value="${isEdit ? tx.description : ''}">
        </div>
        <div class="form-group">
          <label>Amount (ZAR)</label>
          <input type="number" name="amount" class="form-control" step="0.01" value="${isEdit ? tx.amount : ''}" required>
        </div>
        <div class="form-group">
          <label>Icon</label>
          <input type="text" name="icon" class="form-control" value="${isEdit ? (tx.icon || '') : '💳'}" placeholder="💳 💰 🛒 🏠 🚗">
        </div>
        <div class="form-group">
          <label>Account</label>
          <select name="accountId" class="form-control">
            <option value="">None</option>
            ${accounts.map(a => `<option value="${a.id}"${isEdit && tx.accountId === a.id ? ' selected' : ''}>${a.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-row" style="gap: 0.5rem; margin-top: 1rem;">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Transaction</button>
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        </div>
      </form>
    `);
  },

  saveTransaction(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const id = fd.get('id') || 'tx_' + Date.now();
    const tx = {
      id,
      date: fd.get('date'),
      type: fd.get('type'),
      category: fd.get('category'),
      description: fd.get('description') || '',
      amount: parseFloat(fd.get('amount')) || 0,
      icon: fd.get('icon') || '💳',
      accountId: fd.get('accountId') || '',
    };
    Storage.saveTransaction(tx);
    this.closeModal();
    this.renderView();
  },

  deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    Storage.deleteTransaction(id);
    this.renderView();
  },

  // ----- ADVISOR -----
  renderAdvisor(main) {
    const accounts = Storage.getAccounts();
    const transactions = Storage.getTransactions();
    const advise = AIAdvisor.getAdvice(this.profile, accounts, transactions);
    const recommendations = AIAdvisor.getRecommendations(this.profile, accounts, transactions);
    const marketData = AIAdvisor.getMarketInsights();
    const netWorth = AIAdvisor.calcNetWorth(accounts);

    let score = 65;
    let insights = [];
    if (advise) {
      score = advise.score ? advise.score.overall : 65;
      insights = advise.insights || [];
    }

    const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    main.innerHTML = `
      <div class="view-header">
        <h2>AI Advisor</h2>
      </div>

      <div class="card" style="padding: 1.5rem; text-align: center; margin-bottom: 0.75rem;">
        <svg width="140" height="140" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" stroke-width="10"/>
          <circle cx="60" cy="60" r="54" fill="none" stroke="${scoreColor}" stroke-width="10"
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"
            transform="rotate(-90 60 60)" stroke-linecap="round"/>
          <text x="60" y="50" text-anchor="middle" font-size="28" font-weight="700" fill="${scoreColor}">${score}</text>
          <text x="60" y="72" text-anchor="middle" font-size="12" fill="#6b7280">/ 100</text>
        </svg>
        <h3 style="margin-top: 0.5rem;">Financial Health Score</h3>
        
      </div>

      ${insights.length > 0 ? `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <strong>AI Insights</strong>
          ${insights.map(a => `
            <div class="insight-card" style="padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6;">
              <div class="insight-header flex flex-between">
                <span>${a.icon || '💡'} ${a.title || 'Insight'}</span>
              </div>
              <p style="font-size: 0.85rem; color: #6b7280; margin: 0.25rem 0 0;">${a.message || ''}</p>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${recommendations && recommendations.length > 0 ? `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <strong>Recommendations</strong>
          ${recommendations.map(r => `
            <div style="padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem;">
              📌 <strong>${r.title || ''}</strong>
              ${r.allocation ? `<div style="font-size: 0.8rem; color: #6b7280;">Expected: ${r.expectedReturn || ''} · Risk: ${r.risk || ''}</div>` : ''}
              ${r.amount ? `<div style="font-size: 0.8rem; color: #6b7280;">Target: ${this.fmt(r.amount)} · Current: ${this.fmt(r.current || 0)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${marketData && marketData.markets && marketData.markets.length > 0 ? `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <strong>Market Insights</strong>
          ${marketData.markets.map(m => `
            <div class="market-row flex flex-between" style="padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.9rem;">
              <span>📊 ${m.name || m.symbol || ''}</span>
              <span class="${(m.change || 0) >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: 600;">
                ${(m.change || 0) >= 0 ? '+' : ''}${(m.changePercent || m.change || 0)}%
              </span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="card" style="padding: 1rem;">
        <div class="flex flex-between">
          <strong>Net Worth</strong>
          <span style="font-weight: 700; font-size: 1.1rem;">${this.fmt(netWorth)}</span>
        </div>
      </div>
    `;
  },

  // ----- PORTFOLIO -----
  renderPortfolio(main) {
    const holdings = this.getHoldings() || [];
    const performance = MarketData.getPortfolioPerformance ? MarketData.getPortfolioPerformance(holdings) : null;

    const totalValue = holdings.reduce((s, h) => s + (h.value || h.balance || 0), 0);
    const totalCost = holdings.reduce((s, h) => s + (h.costBasis || 0), 0);
    const totalReturn = totalValue - totalCost;
    const returnPct = totalCost > 0 ? (totalReturn / totalCost) * 100 : 0;

    const allocation = {};
    holdings.forEach(h => {
      const type = h.assetType || h.type || 'other';
      allocation[type] = (allocation[type] || 0) + (h.value || h.balance || 0);
    });
    const allocColors = { stocks: '#3b82f6', crypto: '#f59e0b', property: '#22c55e', cash: '#6b7280', bond: '#8b5cf6', other: '#ec4899' };
    const allocEntries = Object.entries(allocation).filter(([, v]) => v > 0).sort(([, a], [, b]) => b - a);

    main.innerHTML = `
      <div class="view-header">
        <h2>Portfolio</h2>
      </div>

      <div class="stat-row">
        <div class="stat-card">
          <span class="text-muted">Total Value</span>
          <span style="font-weight: 700;">${this.fmt(totalValue)}</span>
        </div>
        <div class="stat-card">
          <span class="text-muted">Total Return</span>
          <span style="font-weight: 600;" class="${totalReturn >= 0 ? 'text-success' : 'text-danger'}">${totalReturn >= 0 ? '+' : ''}${this.fmt(totalReturn)}</span>
        </div>
        <div class="stat-card">
          <span class="text-muted">Return %</span>
          <span style="font-weight: 600;" class="${returnPct >= 0 ? 'text-success' : 'text-danger'}">${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%</span>
        </div>
      </div>

      ${allocEntries.length > 0 ? `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <strong style="display: block; margin-bottom: 0.5rem;">Allocation</strong>
          <div class="allocation-bar" style="display: flex; height: 1.5rem; border-radius: 0.5rem; overflow: hidden; margin-bottom: 0.75rem;">
            ${allocEntries.map(([type, val]) => `
              <div class="allocation-seg" style="flex: ${val / totalValue}; background: ${allocColors[type] || allocColors.other}; min-width: 4px;" title="${type}: ${this.fmt(val)}"></div>
            `).join('')}
          </div>
          ${allocEntries.map(([type, val]) => `
            <div class="flex flex-between" style="font-size: 0.85rem; padding: 0.2rem 0;">
              <span><span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${allocColors[type] || allocColors.other};"></span> ${type.charAt(0).toUpperCase() + type.slice(1)}</span>
              <span>${this.fmt(val)} (${((val / totalValue) * 100).toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${performance ? `
        <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
          <strong>Performance</strong>
          <div style="padding: 0.5rem 0; font-size: 0.9rem;">
            ${performance.period ? `<div class="flex flex-between"><span>Period</span><span>${performance.period}</span></div>` : ''}
            ${performance.return ? `<div class="flex flex-between"><span>Return</span><span class="${performance.return >= 0 ? 'text-success' : 'text-danger'}">${performance.return >= 0 ? '+' : ''}${performance.return.toFixed(2)}%</span></div>` : ''}
            ${performance.sharpe ? `<div class="flex flex-between"><span>Sharpe Ratio</span><span>${performance.sharpe.toFixed(2)}</span></div>` : ''}
          </div>
        </div>
      ` : ''}

      <div class="card" style="padding: 1rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">Holdings</strong>
        ${holdings.length === 0 ? '<p class="text-muted">No holdings yet.</p>' :
          holdings.map(h => `
            <div class="holding-item flex flex-between" style="padding: 0.5rem 0; border-bottom: 1px solid #f3f4f6;">
              <div>
                <div style="font-weight: 500;">${h.symbol || h.name || 'Holding'}</div>
                <small class="text-muted">${h.shares || h.units || 0} shares${h.costBasis ? ` · Cost: ${this.fmt(h.costBasis)}` : ''}</small>
              </div>
              <div style="text-align: right;">
                <div style="font-weight: 600;">${this.fmt(h.value || h.balance || 0)}</div>
                ${h.returnPct !== undefined ? `<small class="${h.returnPct >= 0 ? 'text-success' : 'text-danger'}">${h.returnPct >= 0 ? '+' : ''}${h.returnPct}%</small>` : ''}
              </div>
            </div>
          `).join('')}
      </div>
    `;
  },

  // ----- GOALS -----
  renderGoals(main) {
    const goals = Storage.getGoals();

    main.innerHTML = `
      <div class="view-header">
        <h2>Goals</h2>
        <button class="btn btn-sm btn-primary" onclick="App.showGoalForm()">+ Add</button>
      </div>
      ${goals.length === 0 ? '<div class="empty-state"><div class="empty-icon">🎯</div><p>No goals yet. Set a financial goal!</p></div>' :
        goals.map(g => {
          const pct = g.target > 0 ? Math.min(100, (g.current / g.target) * 100) : 0;
          return `
            <div class="goal-card card" style="padding: 1rem; margin-bottom: 0.75rem;">
              <div class="flex flex-between">
                <div>
                  <strong>${g.icon || '🎯'} ${g.name}</strong>
                  <div style="font-size: 0.85rem; color: #6b7280;">${this.fmt(g.current)} / ${this.fmt(g.target)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700;">${pct.toFixed(0)}%</div>
                  <div>
                    <button class="btn btn-xs btn-outline" onclick="App.showGoalForm('${g.id}')">Edit</button>
                    <button class="btn btn-xs btn-danger" onclick="App.deleteGoal('${g.id}')">Del</button>
                  </div>
                </div>
              </div>
              <div class="goal-bar" style="margin-top: 0.5rem; height: 0.5rem; background: #e5e7eb; border-radius: 0.25rem; overflow: hidden;">
                <div class="goal-bar-fill" style="width: ${pct}%; height: 100%; background: ${pct >= 100 ? '#22c55e' : '#3b82f6'}; border-radius: 0.25rem; transition: width 0.3s;"></div>
              </div>
              ${g.targetDate ? `<small class="text-muted">Target: ${new Date(g.targetDate).toLocaleDateString()}</small>` : ''}
            </div>
          `;
        }).join('')}
    `;
  },

  showGoalForm(goalId) {
    const goal = goalId ? Storage.getGoals().find(g => g.id === goalId) : null;
    const isEdit = !!goal;

    this.showModal(`
      <h3 style="margin-bottom: 1rem;">${isEdit ? 'Edit' : 'Add'} Goal</h3>
      <form id="goal-form" onsubmit="App.saveGoal(event)">
        <input type="hidden" name="id" value="${isEdit ? goal.id : ''}">
        <div class="form-group">
          <label>Goal Name</label>
          <input type="text" name="name" class="form-control" value="${isEdit ? goal.name : ''}" required>
        </div>
        <div class="form-group">
          <label>Target Amount (ZAR)</label>
          <input type="number" name="target" class="form-control" step="0.01" value="${isEdit ? goal.target : ''}" required>
        </div>
        <div class="form-group">
          <label>Current Amount (ZAR)</label>
          <input type="number" name="current" class="form-control" step="0.01" value="${isEdit ? goal.current : '0'}">
        </div>
        <div class="form-group">
          <label>Target Date (optional)</label>
          <input type="date" name="targetDate" class="form-control" value="${isEdit && goal.targetDate ? goal.targetDate : ''}">
        </div>
        <div class="form-group">
          <label>Icon</label>
          <input type="text" name="icon" class="form-control" value="${isEdit ? (goal.icon || '🎯') : '🎯'}" placeholder="🎯 🏠 🚗 ✈️">
        </div>
        <div class="form-row" style="gap: 0.5rem; margin-top: 1rem;">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Goal</button>
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        </div>
      </form>
    `);
  },

  saveGoal(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const id = fd.get('id') || 'goal_' + Date.now();
    const goal = {
      id,
      name: fd.get('name'),
      target: parseFloat(fd.get('target')) || 0,
      current: parseFloat(fd.get('current')) || 0,
      targetDate: fd.get('targetDate') || '',
      icon: fd.get('icon') || '🎯',
    };
    Storage.saveGoal(goal);
    this.closeModal();
    this.renderView();
  },

  deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    Storage.deleteGoal(id);
    this.renderView();
  },

  // ----- BUDGET -----
  renderBudget(main) {
    const budgets = Storage.getBudgets();
    const transactions = Storage.getTransactions();
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    const monthlyTx = transactions.filter(t => t.date >= monthStart && t.type === 'expense');

    main.innerHTML = `
      <div class="view-header">
        <h2>Budget</h2>
        <button class="btn btn-sm btn-primary" onclick="App.showBudgetForm()">+ Add</button>
      </div>
      ${budgets.length === 0 ? '<div class="empty-state"><div class="empty-icon">📋</div><p>No budgets set. Create your first budget!</p></div>' :
        budgets.map(b => {
          const spent = monthlyTx.filter(t => t.category && t.category.toLowerCase() === b.category.toLowerCase()).reduce((s, t) => s + t.amount, 0);
          const pct = b.budgeted > 0 ? (spent / b.budgeted) * 100 : 0;
          const over = spent > b.budgeted;
          return `
            <div class="budget-item card" style="padding: 1rem; margin-bottom: 0.6rem;">
              <div class="flex flex-between">
                <div>
                  <strong>${b.icon || '📊'} ${b.category}</strong>
                  <div style="font-size: 0.85rem; color: #6b7280;">${this.fmt(spent)} / ${this.fmt(b.budgeted)}</div>
                </div>
                <div style="text-align: right;">
                  <div style="font-weight: 700;" class="${over ? 'text-danger' : 'text-success'}">${pct.toFixed(0)}%</div>
                  <div>
                    <button class="btn btn-xs btn-outline" onclick="App.showBudgetForm('${b.id}')">Edit</button>
                    <button class="btn btn-xs btn-danger" onclick="App.deleteBudget('${b.id}')">Del</button>
                  </div>
                </div>
              </div>
              <div class="goal-bar" style="margin-top: 0.4rem; height: 0.5rem; background: #e5e7eb; border-radius: 0.25rem; overflow: hidden;">
                <div class="goal-bar-fill" style="width: ${Math.min(100, pct)}%; height: 100%; background: ${over ? '#ef4444' : '#22c55e'}; border-radius: 0.25rem; transition: width 0.3s;"></div>
              </div>
              ${over ? `<small class="text-danger">⚠ Over budget by ${this.fmt(spent - b.budgeted)}</small>` : ''}
            </div>
          `;
        }).join('')}
    `;
  },

  showBudgetForm(budgetId) {
    const budget = budgetId ? Storage.getBudgets().find(b => b.id === budgetId) : null;
    const isEdit = !!budget;

    this.showModal(`
      <h3 style="margin-bottom: 1rem;">${isEdit ? 'Edit' : 'Add'} Budget</h3>
      <form id="budget-form" onsubmit="App.saveBudget(event)">
        <input type="hidden" name="id" value="${isEdit ? budget.id : ''}">
        <div class="form-group">
          <label>Category</label>
          <input type="text" name="category" class="form-control" value="${isEdit ? budget.category : ''}" required placeholder="e.g. Groceries, Transport">
        </div>
        <div class="form-group">
          <label>Budgeted Amount (ZAR/month)</label>
          <input type="number" name="budgeted" class="form-control" step="0.01" value="${isEdit ? budget.budgeted : ''}" required>
        </div>
        <div class="form-group">
          <label>Icon</label>
          <input type="text" name="icon" class="form-control" value="${isEdit ? (budget.icon || '📊') : '📊'}" placeholder="📊 🛒 🚗 🏠">
        </div>
        <div class="form-row" style="gap: 0.5rem; margin-top: 1rem;">
          <button type="submit" class="btn btn-primary">${isEdit ? 'Update' : 'Add'} Budget</button>
          <button type="button" class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
        </div>
      </form>
    `);
  },

  saveBudget(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const id = fd.get('id') || 'budget_' + Date.now();
    const budget = {
      id,
      category: fd.get('category'),
      budgeted: parseFloat(fd.get('budgeted')) || 0,
      icon: fd.get('icon') || '📊',
    };
    Storage.saveBudget(budget);
    this.closeModal();
    this.renderView();
  },

  deleteBudget(id) {
    if (!confirm('Delete this budget category?')) return;
    Storage.deleteBudget(id);
    this.renderView();
  },

  // ----- SETTINGS -----
  renderSettings(main) {
    const p = this.profile;

    main.innerHTML = `
      <div class="view-header">
        <h2>Settings</h2>
      </div>

      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong style="display: block; margin-bottom: 0.75rem;">Profile</strong>
        <form id="settings-form" onsubmit="App.saveSettings(event)">
          <div class="form-group">
            <label>Name</label>
            <input type="text" name="name" class="form-control" value="${p.name || ''}" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" class="form-control" value="${p.email || ''}">
          </div>
          <div class="form-group">
            <label>Risk Tolerance</label>
            <select name="riskTolerance" class="form-control">
              <option value="low"${p.riskTolerance === 'low' ? ' selected' : ''}>Low</option>
              <option value="medium"${p.riskTolerance === 'medium' || !p.riskTolerance ? ' selected' : ''}>Medium</option>
              <option value="high"${p.riskTolerance === 'high' ? ' selected' : ''}>High</option>
            </select>
          </div>
          <div class="form-group">
            <label>Currency</label>
            <select name="currency" class="form-control">
              <option value="ZAR" selected>ZAR (R)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Monthly Income (approximate)</label>
            <input type="number" name="monthlyIncome" class="form-control" step="0.01" value="${p.monthlyIncome || ''}">
          </div>
          <button type="submit" class="btn btn-primary btn-block">Save Settings</button>
        </form>
      </div>

      <div class="card" style="padding: 1rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">Data Management</strong>
        <p class="text-muted" style="font-size: 0.85rem; margin-bottom: 0.75rem;">Clear all data and start fresh. This cannot be undone.</p>
        <button class="btn btn-danger btn-block" onclick="App.resetAllData()">Reset All Data</button>
      </div>
    `;
  },

  saveSettings(e) {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    this.profile.name = fd.get('name');
    this.profile.email = fd.get('email');
    this.profile.riskTolerance = fd.get('riskTolerance');
    this.profile.currency = fd.get('currency');
    this.profile.monthlyIncome = parseFloat(fd.get('monthlyIncome')) || 0;
    Storage.saveProfile(this.profile);
    this.renderView();
  },

  resetAllData() {
    if (!confirm('Are you sure you want to delete ALL data? This cannot be undone.')) return;
    if (!confirm('Really delete everything?')) return;
    Storage.clearAll();
    this.profile = { name: 'User', onboardingDone: false };
    Storage.saveProfile(this.profile);
    this.currentView = 'dashboard';
    this.renderView();
    window.location.hash = '';
  },

  // ----- MORE (SUB-NAV) -----
  renderMore(main) {
    const items = [
      { view: 'portfolio', icon: '📈', label: 'Portfolio', desc: 'View your investment portfolio and allocation' },
      { view: 'goals', icon: '🎯', label: 'Goals', desc: 'Track your financial goals' },
      { view: 'budget', icon: '📋', label: 'Budget', desc: 'Manage your monthly budgets' },
      { view: 'settings', icon: '⚙️', label: 'Settings', desc: 'Profile, preferences, and data management' },
    ];

    main.innerHTML = `
      <div class="view-header">
        <h2>More</h2>
      </div>
      ${items.map(item => `
        <div class="card" style="padding: 1rem; margin-bottom: 0.6rem; cursor: pointer;" onclick="App.navigate('${item.view}')">
          <div class="flex gap-1" style="align-items: center;">
            <span style="font-size: 2rem;">${item.icon}</span>
            <div>
              <strong>${item.label}</strong>
              <div class="text-muted" style="font-size: 0.85rem;">${item.desc}</div>
            </div>
          </div>
        </div>
      `).join('')}
    `;
  },

  // ----- UTILITIES -----
  fmt(n) {
    if (n === undefined || n === null) return 'R0.00';
    const num = typeof n === 'string' ? parseFloat(n) : n;
    if (isNaN(num)) return 'R0.00';
    return 'R' + num.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },

  getAccountIcon(type) {
    const icons = {
      banking: '🏦',
      savings: '🏦',
      investment: '📈',
      crypto: '₿',
      property: '🏠',
      loan: '💰',
      credit: '💳',
      retirement: '👴',
    };
    return icons[type] || '💳';
  },

  getHoldings() {
    return Storage.get('holdings') || [];
  },

  showModal(html) {
    this.closeModal();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';
    overlay.innerHTML = `<div class="modal" style="overflow-y: auto;">${html}</div>`;
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeModal();
    });
    document.body.appendChild(overlay);
  },

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) overlay.remove();
  },

  startNetWorthTracking() {
    const today = new Date().toISOString().split('T')[0];
    const history = Storage.getNetWorthHistory() || [];
    const alreadyToday = history.some(h => h.date === today);
    if (!alreadyToday) {
      const accounts = Storage.getAccounts();
      const netWorth = AIAdvisor.calcNetWorth(accounts);
      Storage.saveNetWorthSnapshot({ date: today, value: netWorth });
    }
    setInterval(() => {
      const d = new Date().toISOString().split('T')[0];
      const h = Storage.getNetWorthHistory() || [];
      if (!h.some(entry => entry.date === d)) {
        const accts = Storage.getAccounts();
        const nw = AIAdvisor.calcNetWorth(accts);
        Storage.saveNetWorthSnapshot({ date: d, value: nw });
      }
    }, 3600000);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
