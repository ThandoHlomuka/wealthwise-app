const SERVER_URL = 'http://localhost:3456';

const App = {
  currentView: 'dashboard',
  profile: null,

  init() {
    this.applyTheme();
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

  getTheme() {
    return localStorage.getItem('ww_theme') || 'light';
  },

  applyTheme() {
    const theme = this.getTheme();
    document.body.classList.toggle('dark', theme === 'dark');
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('ww_theme', next);
    this.applyTheme();
    this.renderNav();
    this.showToast(next === 'dark' ? '🌙' : '☀️', `${next === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
  },

  showToast(icon, message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span class="toast-icon">${icon}</span><span class="toast-msg">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
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
    const themeIcon = this.getTheme() === 'dark' ? '🌙' : '☀️';
    const nav = document.getElementById('main-nav');
    nav.innerHTML = `
      <div class="nav-inner">
        <div class="nav-brand" onclick="App.navigate('dashboard')">
          <span class="nav-logo">✨</span>
          <span class="nav-title">WealthWise AI</span>
        </div>
        <span class="badge badge-primary" style="font-size: 0.62rem; padding: 0.15rem 0.4rem;">BETA</span>
        <div class="nav-spacer"></div>
        <button class="theme-toggle" onclick="App.toggleTheme()" title="Toggle dark mode">${themeIcon}</button>
        <div class="nav-user">
          <span>${this.profile?.name || 'User'}</span>
          <div class="nav-avatar">${(this.profile?.name || 'U')[0]}</div>
        </div>
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
    const holdings = this.getHoldings() || [];
    const portfolioValue = holdings.reduce((s, h) => s + (h.value || h.balance || 0), 0);

    let advisorScore = 65;
    if (advisorData && advisorData.score) {
      advisorScore = advisorData.score.overall || 65;
    }

    const netWorthHistory = Storage.getNetWorthHistory() || [];

    main.innerHTML = `
      <div class="welcome-banner">
        <h2>👋 Welcome back, ${this.profile?.name || 'Thando'}</h2>
        <p>Here's your financial snapshot for today</p>
      </div>

      <div class="stat-row">
        <div class="stat-card accent-primary" id="stat-networth">
          <div class="stat-icon">💰</div>
          <div class="stat-label">Net Worth</div>
          <div class="stat-value" data-target="${netWorth}">R0</div>
          <div class="stat-change">Total assets minus liabilities</div>
        </div>
        <div class="stat-card accent-success" id="stat-income">
          <div class="stat-icon">📈</div>
          <div class="stat-label">Monthly Income</div>
          <div class="stat-value text-success" data-target="${monthlyIncome}">R0</div>
          <div class="stat-change positive">${this.fmt(monthlyIncome - monthlySpend)} available</div>
        </div>
        <div class="stat-card accent-danger" id="stat-spend">
          <div class="stat-icon">💸</div>
          <div class="stat-label">Monthly Spend</div>
          <div class="stat-value text-danger" data-target="${monthlySpend}">R0</div>
          <div class="stat-change ${savingsRate >= 20 ? 'positive' : 'negative'}">${savingsRate.toFixed(1)}% savings rate</div>
        </div>
        <div class="stat-card accent-warning" id="stat-portfolio">
          <div class="stat-icon">📊</div>
          <div class="stat-label">Portfolio</div>
          <div class="stat-value" data-target="${portfolioValue}">R0</div>
          <div class="stat-change">${holdings.length} holdings</div>
        </div>
      </div>

      ${netWorthHistory.length > 1 ? `
      <div class="card">
        <div class="card-header">
          <strong>📈 Net Worth History</strong>
          <span class="badge badge-info">${netWorthHistory.length} snapshots</span>
        </div>
        <div class="chart-container" id="networth-chart"></div>
      </div>` : ''}

      <div class="two-col">
        <div class="card">
          <strong style="display: block; margin-bottom: 0.75rem;">💳 Account Balances</strong>
          ${accounts.length === 0 ? '<p class="text-muted">No accounts yet</p>' :
            accounts.slice(0, 5).map(a => `
              <div class="flex flex-between" style="padding: 0.4rem 0; font-size: 0.85rem; border-bottom: 1px solid var(--border-light);">
                <span>${this.getAccountIcon(a.type)} ${a.name}</span>
                <span style="font-weight: 600;">${this.fmt(a.balance)}</span>
              </div>
            `).join('')}
          ${accounts.length > 5 ? `<div style="padding: 0.4rem 0; font-size: 0.8rem; color: var(--primary); cursor: pointer;" onclick="App.navigate('accounts')">+ ${accounts.length - 5} more accounts →</div>` : ''}
        </div>

        ${(() => {
          const cats = {};
          transactions.filter(t => t.type === 'expense').forEach(t => {
            cats[t.category] = (cats[t.category] || 0) + t.amount;
          });
          const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]).slice(0, 5);
          if (entries.length === 0) return '';
          return `
            <div class="card">
              <strong style="display: block; margin-bottom: 0.75rem;">📊 Spending by Category</strong>
              <div class="chart-container" id="spending-chart" style="height: 180px;"></div>
            </div>
          `;
        })()}
      </div>

      <div class="card">
        <div class="card-header">
          <strong>🔄 Monthly Income vs Expenses</strong>
        </div>
        <div class="chart-container" id="income-expense-chart"></div>
      </div>

      <div class="card">
        <div class="card-header">
          <strong>💡 Recent Transactions</strong>
          <span class="badge badge-primary">${transactions.length} total</span>
        </div>
        ${recent.length === 0 ? '<p class="text-muted">No transactions yet</p>' :
          recent.map(t => `
            <div class="flex flex-between" style="padding: 0.4rem 0; font-size: 0.85rem; border-bottom: 1px solid var(--border-light);">
              <span>${t.icon || '💳'} ${t.description || t.category}</span>
              <span class="${t.type === 'income' ? 'text-success' : 'text-danger'}" style="font-weight: 600;">${t.type === 'income' ? '+' : '-'}${this.fmt(t.amount)}</span>
            </div>
          `).join('')}
      </div>

      <div class="card">
        <div class="flex flex-between" style="margin-bottom: 0.5rem;">
          <strong>🏥 Financial Health Score</strong>
          <span class="${advisorScore >= 70 ? 'text-success' : advisorScore >= 40 ? 'text-warning' : 'text-danger'}" style="font-weight: 700; font-size: 1.1rem;">${advisorScore}/100</span>
        </div>
        <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
          <div style="width: ${advisorScore}%; height: 100%; background: ${advisorScore >= 70 ? 'var(--success)' : advisorScore >= 40 ? 'var(--warning)' : 'var(--danger)'}; border-radius: 4px; transition: width 1s;"></div>
        </div>
      </div>

      <div class="quick-actions">
        <button class="quick-action-btn" onclick="App.navigate('accounts')">💳 Accounts</button>
        <button class="quick-action-btn" onclick="App.navigate('transactions')">💸 Add Transaction</button>
        <button class="quick-action-btn" onclick="App.navigate('advisor')">🤖 AI Advice</button>
        <button class="quick-action-btn" onclick="App.navigate('goals')">🎯 Goals</button>
        <button class="quick-action-btn" onclick="App.navigate('budget')">📋 Budget</button>
        <button class="quick-action-btn" onclick="App.navigate('portfolio')">📊 Portfolio</button>
      </div>
    `;

    // Animate counters
    requestAnimationFrame(() => {
      document.querySelectorAll('.stat-value[data-target]').forEach(el => {
        this.animateCounter(el, parseFloat(el.dataset.target));
      });
    });

    // Render charts after DOM
    setTimeout(() => {
      this.renderNetWorthChart(document.getElementById('networth-chart'));
      this.renderSpendingChart(document.getElementById('spending-chart'));
      this.renderIncomeExpenseChart(document.getElementById('income-expense-chart'));
    }, 100);
  },

  animateCounter(el, target) {
    const duration = 1000;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = this.fmt(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
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
    const isNew = !fd.get('id');
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
    this.showToast(isNew ? '➕' : '✏️', isNew ? 'Account added' : 'Account updated', 'success');
  },

  deleteAccount(id) {
    if (!confirm('Delete this account?')) return;
    Storage.deleteAccount(id);
    this.renderView();
    this.showToast('🗑️', 'Account deleted', 'error');
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
    const isNew = !fd.get('id');
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
    this.showToast(isNew ? '💸' : '✏️', isNew ? 'Transaction added' : 'Transaction updated', 'success');
  },

  deleteTransaction(id) {
    if (!confirm('Delete this transaction?')) return;
    Storage.deleteTransaction(id);
    this.renderView();
    this.showToast('🗑️', 'Transaction deleted', 'error');
  },

  // ----- ADVISOR -----
  renderAdvisor(main) {
    const accounts = Storage.getAccounts();
    const transactions = Storage.getTransactions();
    const advise = AIAdvisor.getAdvice(this.profile, accounts, transactions);
    const marketData = AIAdvisor.getMarketInsights();
    const stockPicks = MarketData.getStockPicks();
    const opportunities = MarketData.getMatchingOpportunities(this.profile);
    const netWorth = AIAdvisor.calcNetWorth(accounts);
    const summary = MarketData.getMarketSummary();
    const movers = MarketData.getTopMovers();

    let score = 65;
    let insights = [];
    if (advise) {
      score = advise.score ? advise.score.overall : 65;
      insights = advise.insights || [];
    }

    const scoreColor = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;

    const buyPicks = stockPicks.filter(p => p.recommendation === 'Buy').slice(0, 4);
    const marketNews = marketData && marketData.news ? marketData.news.slice(0, 3) : [];

    main.innerHTML = `
      <div class="view-header">
        <h2>AI Advisor</h2>
      </div>

      <!-- Score Card -->
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

      <!-- Market Pulse -->
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <div class="flex flex-between" style="margin-bottom: 0.5rem;">
          <strong>📊 Market Pulse</strong>
          <span class="badge badge-info">${summary.advancers} A · ${summary.decliners} D</span>
        </div>
        <div class="two-col" style="gap: 0.5rem;">
          <div style="background: #e6f4ea; border-radius: 8px; padding: 0.6rem; text-align: center;">
            <div style="font-size: 0.7rem; color: #666;">Top Gainer</div>
            <div style="font-weight: 700; color: #0f9d58;">${movers.gainers[0] ? movers.gainers[0].ticker : 'N/A'}</div>
            <div style="font-size: 0.75rem; color: #0f9d58;">+${movers.gainers[0] ? movers.gainers[0].changePercent.toFixed(2) : 0}%</div>
          </div>
          <div style="background: #fce8e6; border-radius: 8px; padding: 0.6rem; text-align: center;">
            <div style="font-size: 0.7rem; color: #666;">Top Loser</div>
            <div style="font-weight: 700; color: #d93025;">${movers.losers[0] ? movers.losers[0].ticker : 'N/A'}</div>
            <div style="font-size: 0.75rem; color: #d93025;">${movers.losers[0] ? movers.losers[0].changePercent.toFixed(2) : 0}%</div>
          </div>
        </div>
      </div>

      <!-- Stock Picks -->
      ${buyPicks.length > 0 ? `
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">📈 Analyst Top Picks</strong>
        <div class="stock-picks-grid">
          ${buyPicks.map(p => {
            const upside = p.targetPrice ? (((p.targetPrice - p.price) / p.price) * 100).toFixed(1) : 'N/A';
            return `
            <div class="stock-pick-card" onclick="App.askAboutStock('${p.ticker}')">
              <div class="sp-header">
                <strong>${p.ticker}</strong>
                <span class="badge badge-success">${p.analystRating}</span>
              </div>
              <div style="font-size: 0.7rem; color: #666;">${p.symbol}</div>
              <div style="font-weight: 700; margin: 0.25rem 0;">R${p.price.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}</div>
              <div style="font-size: 0.7rem; color: #0f9d58;">Target: ${p.targetPrice ? 'R' + p.targetPrice.toLocaleString() : 'N/A'} (${upside}% upside)</div>
              <div style="font-size: 0.65rem; color: #999; margin-top: 0.2rem;">${p.sector}</div>
            </div>
          `}).join('')}
        </div>
        <div style="font-size: 0.7rem; color: #999; margin-top: 0.5rem;">💡 Click a pick to ask the chatbot about it</div>
      </div>` : ''}

      <!-- Opportunities -->
      ${opportunities.length > 0 ? `
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">💎 Opportunities for You</strong>
        ${opportunities.slice(0, 3).map(o => `
          <div class="opp-card" style="padding: 0.6rem 0; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-size: 1.5rem;">${o.icon}</span>
            <div style="flex: 1;">
              <div style="font-weight: 600; font-size: 0.85rem;">${o.title}</div>
              <div style="font-size: 0.75rem; color: #666;">${o.expectedReturn} · ${o.risk} · Min R${o.minInvestment.toLocaleString()}</div>
            </div>
            <span class="badge badge-primary" style="font-size: 0.65rem;">${o.matchScore}% match</span>
          </div>
        `).join('')}
        <div style="margin-top: 0.5rem;">
          <button class="btn btn-xs btn-outline" onclick="App.scrollToChat(); App.quickChat('What investment opportunities match my profile?')" style="width: 100%;">Ask about opportunities →</button>
        </div>
      </div>` : ''}

      <!-- AI Insights -->
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <div class="card-header">
          <strong>💡 AI Insights</strong>
        </div>
        <div style="font-size: 0.8rem; color: #666; margin-bottom: 0.5rem;">${insights.length} insights · Score ${score}/100</div>
        ${insights.slice(0, 4).map(a => `
          <div class="insight-card ${a.type}" style="margin-bottom: 0.4rem;">
            <div class="insight-header">
              <span class="insight-icon">${a.icon || '💡'}</span>
              <span class="insight-title">${a.title || 'Insight'}</span>
            </div>
            <div class="insight-message">${a.message || ''}</div>
          </div>
        `).join('')}
      </div>

      <!-- Market News -->
      ${marketNews.length > 0 ? `
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <strong style="display: block; margin-bottom: 0.5rem;">📰 Market News</strong>
        ${marketNews.map(n => `
          <div style="padding: 0.4rem 0; border-bottom: 1px solid #f3f4f6; font-size: 0.82rem;">
            <span>${n.sentiment === 'positive' ? '🟢' : n.sentiment === 'negative' ? '🔴' : '🟡'}</span>
            <span>${n.text}</span>
            <div style="font-size: 0.7rem; color: #999;">${n.source} · ${n.time}</div>
          </div>
        `).join('')}
      </div>` : ''}

      <!-- Net Worth -->
      <div class="card" style="padding: 1rem; margin-bottom: 0.75rem;">
        <div class="flex flex-between">
          <strong>Net Worth</strong>
          <span style="font-weight: 700; font-size: 1.1rem;">${this.fmt(netWorth)}</span>
        </div>
      </div>

      <!-- Server Status -->
      <div id="server-status" style="display: none; padding: 0.4rem 0.75rem; margin-bottom: 0.5rem; border-radius: 8px; font-size: 0.75rem; font-weight: 600;"></div>

      <!-- Chatbot Section -->
      <div class="card chat-card" style="padding: 0; overflow: hidden; margin-bottom: 0.75rem;">
        <div class="chat-header" style="padding: 0.75rem 1rem; background: var(--primary); color: white; display: flex; align-items: center; gap: 0.5rem;">
          <span style="font-size: 1.2rem;">🤖</span>
          <span style="font-weight: 600;">Ask Your Financial Advisor</span>
          <span id="server-dot" style="margin-left: auto; width: 8px; height: 8px; border-radius: 50%; background: #999;"></span>
        </div>
        <div class="chat-messages" id="chat-messages" style="height: 300px; overflow-y: auto; padding: 0.75rem; background: #fafafa;">
          <div class="chat-msg chat-msg-bot">
            <div class="chat-msg-content">
              👋 Hi ${this.profile.name || 'there'}! I'm your AI financial advisor. Ask me anything about your finances — try one of these:
              <div style="margin-top: 0.4rem; display: flex; flex-wrap: wrap; gap: 0.3rem;">
                <span class="chat-quick-btn" onclick="App.quickChat('How are my investments?')">📊 Investments</span>
                <span class="chat-quick-btn" onclick="App.quickChat('Where is my money going?')">💸 Spending</span>
                <span class="chat-quick-btn" onclick="App.quickChat('What stocks should I buy?')">📈 Stock picks</span>
                <span class="chat-quick-btn" onclick="App.quickChat('Do I have enough emergency savings?')">🛡️ Emergency</span>
              </div>
            </div>
          </div>
        </div>
        <div class="chat-input-bar" style="display: flex; border-top: 1px solid #e0e3e7; padding: 0.5rem;">
          <input type="text" id="chat-input" class="chat-input" placeholder="Ask anything about your finances..."
            style="flex: 1; border: none; padding: 0.6rem 0.75rem; font-size: 0.9rem; outline: none; border-radius: 8px; background: #f0f4f8;"
            onkeydown="if(event.key==='Enter') App.sendChat()">
          <button class="btn btn-primary btn-sm" onclick="App.sendChat()" style="margin-left: 0.5rem;">Send</button>
        </div>
      </div>
    `;

    this.checkServer().then(available => {
      const dot = document.getElementById('server-dot');
      const status = document.getElementById('server-status');
      if (dot) {
        dot.style.background = available ? '#22c55e' : '#ef4444';
        dot.title = available ? 'Server connected' : 'Server offline (using local AI)';
      }
      if (status) {
        if (!available) {
          status.style.display = 'block';
          status.className = 'server-status-bar offline';
          status.innerHTML = '<span class="status-dot offline"></span> AI server not connected. Using offline advisor mode. <a href="#" onclick="App.launchServerHelp(event)" style="color: inherit; font-weight: 700; text-decoration: underline;">Run server?</a>';
        } else {
          status.style.display = 'block';
          status.className = 'server-status-bar online';
          status.innerHTML = '<span class="status-dot online"></span> AI server connected — real-time web search active.';
          setTimeout(() => {
            if (status) status.style.display = 'none';
          }, 4000);
        }
      }
    });
  },

  scrollToChat() {
    const chat = document.getElementById('chat-messages');
    if (chat) chat.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  async getChatResponse(query) {
    const accounts = Storage.getAccounts();
    const transactions = Storage.getTransactions();
    const goals = Storage.getGoals();

    const userData = {
      profile: this.profile,
      monthlySpend: AIAdvisor.calcMonthlySpend(transactions),
      monthlyIncome: AIAdvisor.calcMonthlyIncome(transactions),
      netWorth: AIAdvisor.calcNetWorth(accounts),
      accountCount: accounts.length,
      goalCount: goals.length,
      holdingCount: (Storage.get('holdings') || []).length
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, userData }),
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res.ok) {
        const data = await res.json();
        return { response: data.response, source: 'server' };
      }
    } catch {}

    const localResponse = AIAdvisor.askChatbot(query, this.profile, accounts, transactions, goals);
    return { response: localResponse, source: 'local' };
  },

  _serverAvailable: false,

  async checkServer() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${SERVER_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: 'ping' }),
        signal: controller.signal
      });
      clearTimeout(timeout);
      this._serverAvailable = res.ok;
    } catch {
      this._serverAvailable = false;
    }
    return this._serverAvailable;
  },

  sendChat() {
    const input = document.getElementById('chat-input');
    if (!input) return;
    const query = input.value.trim();
    if (!query) return;
    input.value = '';
    this.addChatMessage('user', query);
    this.addChatMessage('bot', '<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><span style="width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;"></span> Consulting AI Advisor...</span>');

    this.getChatResponse(query).then(({ response, source }) => {
      const messages = document.getElementById('chat-messages');
      if (messages && messages.lastChild && messages.lastChild.querySelector('.chat-msg-content')?.textContent.includes('Consulting')) {
        messages.removeChild(messages.lastChild);
      }
      const suffix = source === 'local' ? '\n\n_💡 Offline mode (server not connected)_' : '';
      this.addChatMessage('bot', response + suffix);
    });
  },

  quickChat(query) {
    this.addChatMessage('user', query);
    this.addChatMessage('bot', '<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><span style="width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;"></span> Consulting AI Advisor...</span>');

    this.getChatResponse(query).then(({ response, source }) => {
      const messages = document.getElementById('chat-messages');
      if (messages && messages.lastChild && messages.lastChild.querySelector('.chat-msg-content')?.textContent.includes('Consulting')) {
        messages.removeChild(messages.lastChild);
      }
      const suffix = source === 'local' ? '\n\n_💡 Offline mode (server not connected)_' : '';
      this.addChatMessage('bot', response + suffix);
    });
  },

  askAboutStock(ticker) {
    const query = `Tell me about ${ticker} stock`;
    this.addChatMessage('user', query);
    this.addChatMessage('bot', '<span style="display: inline-flex; align-items: center; gap: 0.5rem;"><span style="width: 14px; height: 14px; border: 2px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;"></span> Consulting AI Advisor...</span>');

    this.getChatResponse(query).then(({ response, source }) => {
      const messages = document.getElementById('chat-messages');
      if (messages && messages.lastChild && messages.lastChild.querySelector('.chat-msg-content')?.textContent.includes('Consulting')) {
        messages.removeChild(messages.lastChild);
      }
      const suffix = source === 'local' ? '\n\n_💡 Offline mode (server not connected)_' : '';
      this.addChatMessage('bot', response + suffix);
    });
  },

  addChatMessage(type, text) {
    const container = document.getElementById('chat-messages');
    if (!container) return;
    const div = document.createElement('div');
    div.className = `chat-msg chat-msg-${type}`;
    const content = document.createElement('div');
    content.className = 'chat-msg-content';
    content.innerHTML = text.replace(/\n/g, '<br>');
    div.appendChild(content);
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
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
    const isNew = !fd.get('id');
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
    this.showToast(isNew ? '🎯' : '✏️', isNew ? 'Goal added' : 'Goal updated', 'success');
  },

  deleteGoal(id) {
    if (!confirm('Delete this goal?')) return;
    Storage.deleteGoal(id);
    this.renderView();
    this.showToast('🗑️', 'Goal deleted', 'error');
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
    const isNew = !fd.get('id');
    const budget = {
      id,
      category: fd.get('category'),
      budgeted: parseFloat(fd.get('budgeted')) || 0,
      icon: fd.get('icon') || '📊',
    };
    Storage.saveBudget(budget);
    this.closeModal();
    this.renderView();
    this.showToast(isNew ? '📋' : '✏️', isNew ? 'Budget added' : 'Budget updated', 'success');
  },

  deleteBudget(id) {
    if (!confirm('Delete this budget category?')) return;
    Storage.deleteBudget(id);
    this.renderView();
    this.showToast('🗑️', 'Budget deleted', 'error');
  },

  // ----- SETTINGS -----
  renderSettings(main) {
    const p = this.profile;
    const isDark = this.getTheme() === 'dark';

    main.innerHTML = `
      <div class="view-header">
        <h2>Settings</h2>
      </div>

      <div class="card">
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

      <div class="card">
        <strong style="display: block; margin-bottom: 0.75rem;">Appearance</strong>
        <div class="flex flex-between">
          <div>
            <div style="font-weight: 500;">Dark Mode</div>
            <div class="text-muted" style="font-size: 0.8rem;">Toggle between light and dark theme</div>
          </div>
          <label class="toggle">
            <input type="checkbox" ${isDark ? 'checked' : ''} onchange="App.toggleTheme()">
            <span class="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div class="card">
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
    this.renderNav();
    this.showToast('✅', 'Settings saved', 'success');
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

  // ----- SVG CHARTS -----
  renderNetWorthChart(container) {
    if (!container) return;
    const history = Storage.getNetWorthHistory() || [];
    if (history.length < 2) { container.innerHTML = '<p class="text-muted" style="padding: 1rem 0; text-align: center;">Need more snapshots for a chart</p>'; return; }

    const data = history.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    const w = 600;
    const h = 200;
    const pad = { top: 20, right: 20, bottom: 30, left: 60 };
    const iw = w - pad.left - pad.right;
    const ih = h - pad.top - pad.bottom;

    const values = data.map(d => d.value);
    const min = Math.min(...values) * 0.95;
    const max = Math.max(...values) * 1.05;
    const range = max - min || 1;

    const xScale = (i) => (i / (data.length - 1)) * iw;
    const yScale = (v) => ih - ((v - min) / range) * ih;

    const points = data.map((d, i) => `${xScale(i)},${yScale(d.value)}`).join(' ');
    const path = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)} ${yScale(d.value)}`).join(' ');
    const areaPath = `${path} L${xScale(data.length - 1)} ${ih} L${xScale(0)} ${ih} Z`;

    const labels = data.map((d, i) => {
      const date = new Date(d.date);
      return i % Math.ceil(data.length / 4) === 0 || i === data.length - 1
        ? `<text x="${xScale(i)}" y="${h - pad.bottom + 18}" text-anchor="middle" fill="var(--text-muted)" font-size="10" font-family="var(--font)">${date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}</text>`
        : '';
    }).join('');

    const gridLines = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const y = pad.top + ih * (1 - p);
      return `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" class="chart-grid"/>`;
    }).join('');

    const yLabels = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const val = min + range * p;
      const y = pad.top + ih * (1 - p);
      return `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="10" font-family="var(--font)">R${(val / 1000).toFixed(0)}k</text>`;
    }).join('');

    const dots = data.map((d, i) => {
      const isLast = i === data.length - 1;
      return `<circle cx="${xScale(i)}" cy="${yScale(d.value)}" r="${isLast ? 5 : 3}" class="chart-dot"
        onmouseenter="this.setAttribute('r', '6')" onmouseleave="this.setAttribute('r', '${isLast ? 5 : 3}')"
        title="${new Date(d.date).toLocaleDateString('en-ZA')}: ${this.fmt(d.value)}"/>`;
    }).join('');

    container.innerHTML = `
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--primary)" stop-opacity="0.3"/>
            <stop offset="100%" stop-color="var(--primary)" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <g transform="translate(${pad.left}, ${pad.top})">
          ${gridLines}
        </g>
        <g font-family="var(--font)">
          ${yLabels}
          ${labels}
        </g>
        <path d="${areaPath}" class="chart-area" style="fill: url(#areaGradient);"/>
        <path d="${path}" class="chart-line"/>
        ${dots}
      </svg>
    `;
  },

  renderSpendingChart(container) {
    if (!container) return;
    const transactions = Storage.getTransactions();
    const cats = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    const entries = Object.entries(cats).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) { container.innerHTML = '<p class="text-muted" style="padding: 1rem 0; text-align: center;">No expense data</p>'; return; }

    const total = entries.reduce((s, [, v]) => s + v, 0);
    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
    const r = 70;
    const cx = 100;
    const cy = 100;
    const circumference = 2 * Math.PI * r;

    let cumulative = 0;
    const segments = entries.slice(0, 6).map(([cat, val], i) => {
      const pct = val / total;
      const offset = circumference * (1 - cumulative - pct);
      const dashArray = circumference * pct;
      cumulative += pct;
      const color = colors[i % colors.length];
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="20"
        stroke-dasharray="${dashArray} ${circumference - dashArray}"
        stroke-dashoffset="${-circumference * (1 - cumulative + pct)}"
        transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"
        class="donut-segment"/>`;
    }).join('');

    const legend = entries.slice(0, 6).map(([cat, val], i) => {
      const pct = ((val / total) * 100).toFixed(1);
      return `<div class="legend-item"><div class="legend-color" style="background:${colors[i % colors.length]}"></div>${cat} (${pct}%)</div>`;
    }).join('');
    const remaining = entries.length > 6 ? `<div class="legend-item" style="color: var(--text-muted);">+${entries.length - 6} more</div>` : '';

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
        <svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          ${segments}
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" font-size="22" font-weight="800" fill="var(--text)">${this.fmt(total)}</text>
          <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="11" fill="var(--text-muted)">Total spent</text>
        </svg>
        <div class="chart-legend">${legend}${remaining}</div>
      </div>
    `;
  },

  renderIncomeExpenseChart(container) {
    if (!container) return;
    const transactions = Storage.getTransactions();
    const months = {};
    transactions.forEach(t => {
      const m = t.date ? t.date.substring(0, 7) : '';
      if (!m) return;
      if (!months[m]) months[m] = { income: 0, expense: 0 };
      months[m][t.type] += t.amount;
    });
    const entries = Object.entries(months).sort();
    if (entries.length === 0) { container.innerHTML = '<p class="text-muted" style="padding: 1rem 0; text-align: center;">No monthly data yet</p>'; return; }

    const w = 500;
    const h = 180;
    const pad = { top: 15, right: 15, bottom: 25, left: 50 };
    const iw = w - pad.left - pad.right;
    const ih = h - pad.top - pad.bottom;

    const allVals = entries.flatMap(([, d]) => [d.income, d.expense]);
    const maxVal = Math.max(...allVals) * 1.15 || 1;
    const barW = Math.min(iw / entries.length * 0.35, 24);
    const gap = iw / entries.length;

    const bars = entries.map(([month, d], i) => {
      const x = pad.left + i * gap + (gap - barW * 2) / 2;
      const incomeH = (d.income / maxVal) * ih;
      const expenseH = (d.expense / maxVal) * ih;
      const label = (() => {
        const [y, m] = month.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[parseInt(m) - 1]}`;
      })();
      return `
        <rect x="${x}" y="${pad.top + ih - incomeH}" width="${barW}" height="${incomeH}" rx="3" class="bar-rect" fill="var(--success)"
          title="Income: ${this.fmt(d.income)}"/>
        <rect x="${x + barW + 2}" y="${pad.top + ih - expenseH}" width="${barW}" height="${expenseH}" rx="3" class="bar-rect" fill="var(--danger)"
          title="Expenses: ${this.fmt(d.expense)}"/>
        <text x="${pad.left + i * gap + gap / 2}" y="${h - pad.bottom + 16}" text-anchor="middle" fill="var(--text-muted)" font-size="9" font-family="var(--font)">${label}</text>
      `;
    }).join('');

    const yGrid = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const y = pad.top + ih * (1 - p);
      return `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" class="chart-grid"/>`;
    }).join('');

    const yLabels = [0, 0.25, 0.5, 0.75, 1].map(p => {
      const val = maxVal * p;
      const y = pad.top + ih * (1 - p);
      return `<text x="${pad.left - 8}" y="${y + 4}" text-anchor="end" fill="var(--text-muted)" font-size="9" font-family="var(--font)">R${(val / 1000).toFixed(0)}k</text>`;
    }).join('');

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.5rem;">
        <div class="legend-item"><div class="legend-color" style="background:var(--success)"></div>Income</div>
        <div class="legend-item"><div class="legend-color" style="background:var(--danger)"></div>Expenses</div>
      </div>
      <svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
        ${yGrid}
        ${yLabels}
        ${bars}
      </svg>
    `;
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

  launchServerHelp(e) {
    if (e) e.preventDefault();
    this.showModal(`
      <h3>🚀 Launch AI Server</h3>
      <p class="text-muted" style="margin-bottom: 1rem;">The WealthWise AI server provides real-time web search, stock prices, crypto data, and financial news.</p>
      <div style="background: var(--bg); border-radius: var(--radius-xs); padding: 1rem; margin-bottom: 1rem; font-family: monospace; font-size: 0.85rem;">
        <strong>Step 1:</strong> Open PowerShell or CMD<br>
        <strong>Step 2:</strong> Run:<br>
        <code style="display: block; background: var(--border); padding: 0.5rem; border-radius: 4px; margin: 0.5rem 0;">cd "${SERVER_URL.replace('http://localhost:3456', '').replace('/api', '') || '.'}/server<br>node server.js</code>
        <strong>Step 3:</strong> Refresh this page after the server starts
      </div>
      <button class="btn btn-primary btn-block" onclick="App.closeModal(); App.checkServer().then(a => { if(a) location.reload(); else App.showToast('⚠️', 'Server not detected. Make sure it is running on port 3456', 'warning'); })">Check Again</button>
    `);
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
