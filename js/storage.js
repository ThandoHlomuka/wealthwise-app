const Storage = {
  _prefix: 'ww_',

  _key(k) { return this._prefix + k; },

  get(key) {
    try { return JSON.parse(localStorage.getItem(this._key(key))); }
    catch { return null; }
  },

  set(key, value) {
    localStorage.setItem(this._key(key), JSON.stringify(value));
  },

  remove(key) {
    localStorage.removeItem(this._key(key));
  },

  getProfile() {
    return this.get('profile') || { name: 'User', currency: 'ZAR', riskTolerance: 'moderate', monthlyIncome: 0, monthlyExpenses: 0, savingsRate: 0 };
  },

  saveProfile(p) {
    this.set('profile', p);
  },

  getAccounts() {
    return this.get('accounts') || [];
  },

  saveAccount(account) {
    const list = this.getAccounts();
    const idx = list.findIndex(a => a.id === account.id);
    if (idx !== -1) list[idx] = account;
    else list.push(account);
    this.set('accounts', list);
  },

  deleteAccount(id) {
    this.set('accounts', this.getAccounts().filter(a => a.id !== id));
  },

  getTransactions() {
    return this.get('transactions') || [];
  },

  saveTransaction(t) {
    const list = this.getTransactions();
    const idx = list.findIndex(x => x.id === t.id);
    if (idx !== -1) list[idx] = t;
    else list.push(t);
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
    this.set('transactions', list);
  },

  deleteTransaction(id) {
    this.set('transactions', this.getTransactions().filter(t => t.id !== id));
  },

  getGoals() {
    return this.get('goals') || [];
  },

  saveGoal(g) {
    const list = this.getGoals();
    const idx = list.findIndex(x => x.id === g.id);
    if (idx !== -1) list[idx] = g;
    else list.push(g);
    this.set('goals', list);
  },

  deleteGoal(id) {
    this.set('goals', this.getGoals().filter(g => g.id !== id));
  },

  getBudgets() {
    return this.get('budgets') || [];
  },

  saveBudget(b) {
    const list = this.getBudgets();
    const idx = list.findIndex(x => x.id === b.id);
    if (idx !== -1) list[idx] = b;
    else list.push(b);
    this.set('budgets', list);
  },

  deleteBudget(id) {
    this.set('budgets', this.getBudgets().filter(b => b.id !== id));
  },

  getAdvisorLog() {
    return this.get('advisorLog') || [];
  },

  saveAdvisorLog(entry) {
    const list = this.getAdvisorLog();
    entry.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 4);
    entry.date = new Date().toISOString();
    list.unshift(entry);
    if (list.length > 100) list.length = 100;
    this.set('advisorLog', list);
  },

  getNetWorthHistory() {
    return this.get('netWorthHistory') || [];
  },

  saveNetWorthSnapshot(snapshot) {
    const list = this.getNetWorthHistory();
    list.push(snapshot);
    if (list.length > 365) list.shift();
    this.set('netWorthHistory', list);
  },

  clearAll() {
    Object.keys(localStorage).filter(k => k.startsWith(this._prefix)).forEach(k => localStorage.removeItem(k));
  }
};
