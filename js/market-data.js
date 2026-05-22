const MarketData = {
  _prices: null,
  _news: null,
  _lastUpdate: null,

  _stocks: [
    { symbol: 'S&P 500 ETF', ticker: 'SPY', basePrice: 478.50, volatility: 0.02, sector: 'Broad Market', currency: 'USD' },
    { symbol: 'NASDAQ ETF', ticker: 'QQQ', basePrice: 398.20, volatility: 0.025, sector: 'Technology', currency: 'USD' },
    { symbol: 'JSE Top 40 ETF', ticker: 'STX40', basePrice: 72450, volatility: 0.015, sector: 'Broad Market', currency: 'ZAR' },
    { symbol: 'Naspers', ticker: 'NPN', basePrice: 342000, volatility: 0.025, sector: 'Technology', currency: 'ZAR' },
    { symbol: 'Bitcoin', ticker: 'BTC', basePrice: 67500, volatility: 0.04, sector: 'Cryptocurrency', currency: 'USD' },
    { symbol: 'Ethereum', ticker: 'ETH', basePrice: 3450, volatility: 0.045, sector: 'Cryptocurrency', currency: 'USD' },
    { symbol: 'Gold', ticker: 'XAU', basePrice: 2340, volatility: 0.008, sector: 'Commodity', currency: 'USD' },
    { symbol: 'Platinum', ticker: 'XPT', basePrice: 985, volatility: 0.012, sector: 'Commodity', currency: 'USD' },
    { symbol: 'USD/ZAR', ticker: 'USDZAR', basePrice: 18.65, volatility: 0.01, sector: 'Forex', currency: 'ZAR' },
    { symbol: 'EUR/ZAR', ticker: 'EURZAR', basePrice: 20.22, volatility: 0.009, sector: 'Forex', currency: 'ZAR' },
    { symbol: 'Apple', ticker: 'AAPL', basePrice: 198.50, volatility: 0.018, sector: 'Technology', currency: 'USD' },
    { symbol: 'Microsoft', ticker: 'MSFT', basePrice: 425.30, volatility: 0.016, sector: 'Technology', currency: 'USD' },
    { symbol: 'Amazon', ticker: 'AMZN', basePrice: 182.10, volatility: 0.022, sector: 'Consumer', currency: 'USD' },
    { symbol: 'Tesla', ticker: 'TSLA', basePrice: 245.80, volatility: 0.035, sector: 'Automotive', currency: 'USD' },
    { symbol: 'FirstRand', ticker: 'FSR', basePrice: 6820, volatility: 0.015, sector: 'Banking', currency: 'ZAR' },
    { symbol: 'Standard Bank', ticker: 'SBK', basePrice: 21500, volatility: 0.014, sector: 'Banking', currency: 'ZAR' },
    { symbol: 'Shoprite', ticker: 'SHP', basePrice: 28900, volatility: 0.012, sector: 'Retail', currency: 'ZAR' },
    { symbol: 'BHP Group', ticker: 'BHP', basePrice: 52300, volatility: 0.018, sector: 'Mining', currency: 'ZAR' },
  ],

  _analystRatings: [
    { ticker: 'SPY', rating: 'Buy', targetPrice: 520, rationale: 'Broad market exposure with strong earnings growth across sectors. Low-cost diversification.' },
    { ticker: 'QQQ', rating: 'Buy', targetPrice: 440, rationale: 'Tech sector momentum continues with AI and cloud computing driving earnings.' },
    { ticker: 'STX40', rating: 'Buy', targetPrice: 78500, rationale: 'SA equities undervalued relative to emerging market peers. Strong dividend yields.' },
    { ticker: 'NPN', rating: 'Hold', targetPrice: 365000, rationale: 'Valuation reflects growth prospects. Wait for better entry point on pullbacks.' },
    { ticker: 'BTC', rating: 'Hold', targetPrice: 82000, rationale: 'Institutional adoption growing but regulatory uncertainty remains. Cautious buy on dips.' },
    { ticker: 'ETH', rating: 'Buy', targetPrice: 4800, rationale: 'Strong DeFi and smart contract ecosystem. Upgrade to proof-of-stake improves outlook.' },
    { ticker: 'XAU', rating: 'Buy', targetPrice: 2600, rationale: 'Central bank buying and geopolitical uncertainty support gold as a safe haven.' },
    { ticker: 'AAPL', rating: 'Buy', targetPrice: 230, rationale: 'Services revenue growing 15% YoY. Strong ecosystem lock-in and iPhone replacement cycle.' },
    { ticker: 'MSFT', rating: 'Buy', targetPrice: 480, rationale: 'Azure and AI Copilot driving enterprise growth. Strong cash flow generation.' },
    { ticker: 'AMZN', rating: 'Hold', targetPrice: 200, rationale: 'AWS growth stabilizing. Retail margins improving. Fairly valued at current levels.' },
    { ticker: 'TSLA', rating: 'Sell', targetPrice: 180, rationale: 'Overvalued relative to peers. Margin pressure from price cuts and increasing competition.' },
    { ticker: 'FSR', rating: 'Buy', targetPrice: 7800, rationale: 'Strong SA banking franchise with high ROE. Dividend yield attractive at current levels.' },
    { ticker: 'SBK', rating: 'Buy', targetPrice: 24500, rationale: 'Pan-African footprint provides diversification. Net interest margin expansion expected.' },
    { ticker: 'SHP', rating: 'Hold', targetPrice: 30500, rationale: 'Defensive retail play with strong market share. Valuation fair, hold for dividends.' },
    { ticker: 'BHP', rating: 'Buy', targetPrice: 58000, rationale: 'Commodity demand from energy transition. Strong balance sheet and dividend policy.' },
    { ticker: 'XPT', rating: 'Hold', targetPrice: 1100, rationale: 'Industrial demand recovering. Hydrogen economy a long-term catalyst but timing uncertain.' },
  ],

  _opportunities: [
    {
      id: 'opp1', title: 'SA Government Bonds (R2035)', type: 'fixed-income',
      expectedReturn: '11.5% p.a.', risk: 'Low-Medium', minInvestment: 1000,
      description: 'SA government bonds offering attractive real yields above inflation. Tax-efficient for retirement portfolios.',
      matchProfile: ['conservative', 'moderate'], icon: '📜'
    },
    {
      id: 'opp2', title: 'Satrix MSCI World ETF', type: 'etf',
      expectedReturn: '12-15% p.a.', risk: 'Medium', minInvestment: 500,
      description: 'Global equity exposure through a low-cost ETF. Rand hedge benefit when ZAR weakens.',
      matchProfile: ['moderate', 'aggressive'], icon: '🌍'
    },
    {
      id: 'opp3', title: 'Property Development Fund', type: 'real-estate',
      expectedReturn: '14-18% p.a.', risk: 'Medium-High', minInvestment: 50000,
      description: 'Pooled property development fund targeting mixed-use residential and commercial in Gauteng.',
      matchProfile: ['aggressive'], icon: '🏗️'
    },
    {
      id: 'opp4', title: 'Green Energy Bonds', type: 'fixed-income',
      expectedReturn: '9.5% p.a.', risk: 'Low', minInvestment: 5000,
      description: 'Green bonds financing renewable energy projects in SA. ESG-focused with government backing.',
      matchProfile: ['conservative', 'moderate'], icon: '🌱'
    },
    {
      id: 'opp5', title: 'Tech Startup Venture Fund', type: 'venture-capital',
      expectedReturn: '25-40% p.a.', risk: 'High', minInvestment: 100000,
      description: 'Early-stage SA tech startups. High risk/reward. 5-7 year lock-up period.',
      matchProfile: ['aggressive'], icon: '🚀'
    },
    {
      id: 'opp6', title: 'Dividend Aristocrats SA', type: 'equity',
      expectedReturn: '15-18% p.a.', risk: 'Medium', minInvestment: 2000,
      description: 'Basket of SA companies with 10+ years of consistent dividend growth. Reinvest dividends for compounding.',
      matchProfile: ['moderate'], icon: '💵'
    },
    {
      id: 'opp7', title: 'USD Fixed Deposit', type: 'fixed-income',
      expectedReturn: '5.5% p.a.', risk: 'Low', minInvestment: 5000,
      description: 'USD-denominated fixed deposit with major SA bank. Currency hedge and steady return.',
      matchProfile: ['conservative', 'moderate'], icon: '💲'
    },
    {
      id: 'opp8', title: 'Cryptocurrency Index Fund', type: 'crypto',
      expectedReturn: '20-35% p.a.', risk: 'High', minInvestment: 1000,
      description: 'Diversified crypto index tracking top 10 cryptocurrencies by market cap. Rebalanced monthly.',
      matchProfile: ['aggressive'], icon: '₿'
    },
  ],

  _headlines: [
    { text: 'Fed signals potential rate cut in Q3, markets rally', sentiment: 'positive', impact: 'high' },
    { text: 'SA inflation eases to 4.7%, boosting rate cut hopes', sentiment: 'positive', impact: 'high' },
    { text: 'Global tech stocks surge on AI earnings optimism', sentiment: 'positive', impact: 'medium' },
    { text: 'Oil prices stabilize amid Middle East tensions', sentiment: 'neutral', impact: 'medium' },
    { text: 'Emerging markets see record foreign inflows in Q2', sentiment: 'positive', impact: 'high' },
    { text: 'Gold hits new all-time high above $2,400', sentiment: 'positive', impact: 'high' },
    { text: 'JSE All Share index reaches new record level', sentiment: 'positive', impact: 'high' },
    { text: 'Cryptocurrency market cap surpasses $3 trillion', sentiment: 'positive', impact: 'medium' },
    { text: 'SA unemployment rate drops to 32.1% - lowest in 3 years', sentiment: 'positive', impact: 'medium' },
    { text: 'Global recession fears subside as GDP data beats expectations', sentiment: 'positive', impact: 'high' },
    { text: 'Property sector shows signs of recovery in major metros', sentiment: 'neutral', impact: 'medium' },
    { text: 'Retirement annuity contributions reach new highs in tax season', sentiment: 'neutral', impact: 'low' },
    { text: 'ESG investing attracts record capital inflows globally', sentiment: 'positive', impact: 'medium' },
    { text: 'SA Reserve Bank maintains repo rate at 8.25%', sentiment: 'neutral', impact: 'high' },
    { text: 'Artificial intelligence stocks lead market gains for 3rd consecutive quarter', sentiment: 'positive', impact: 'medium' },
  ],

  _generatePrice(base, vol) {
    const change = (Math.random() - 0.48) * 2 * vol * base;
    const newPrice = base + change;
    const dayHigh = base * (1 + vol * 1.5);
    const dayLow = base * (1 - vol * 1.5);
    return { price: newPrice, change, changePercent: (change / base) * 100, dayHigh, dayLow, volume: Math.floor(100000 + Math.random() * 5000000) };
  },

  getPrices() {
    this._prices = this._stocks.map(s => {
      const data = this._generatePrice(s.basePrice, s.volatility);
      const analyst = this._analystRatings.find(a => a.ticker === s.ticker);
      return { ...s, ...data, analystRating: analyst ? analyst.rating : 'Neutral', targetPrice: analyst ? analyst.targetPrice : null };
    });
    return this._prices;
  },

  getStockPicks() {
    if (!this._prices) this.getPrices();
    return this._prices.map(s => {
      const analyst = this._analystRatings.find(a => a.ticker === s.ticker);
      const momentum = s.changePercent > 0.5 ? 'positive' : s.changePercent < -0.5 ? 'negative' : 'neutral';
      return {
        ...s,
        analystRating: analyst ? analyst.rating : 'Neutral',
        targetPrice: analyst ? analyst.targetPrice : null,
        rationale: analyst ? analyst.rationale : '',
        momentum,
        recommendation: analyst ? analyst.rating : 'Hold',
        confidence: analyst ? (analyst.rating === 'Buy' ? 'High' : analyst.rating === 'Sell' ? 'High' : 'Medium') : 'Low'
      };
    });
  },

  getOpportunities() {
    return this._opportunities;
  },

  getMatchingOpportunities(profile) {
    const tolerance = profile.riskTolerance || 'moderate';
    return this._opportunities
      .filter(o => o.matchProfile.includes(tolerance))
      .map(o => ({ ...o, matchScore: Math.floor(70 + Math.random() * 30) }));
  },

  getNews() {
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...this._headlines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(h => ({
      ...h,
      time: `${Math.floor(Math.random() * 12) + 1}h ago`,
      source: ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Moneyweb', 'Fin24'][Math.floor(Math.random() * 6)]
    }));
  },

  getPortfolioPerformance(holdings) {
    if (!this._prices) this.getPrices();
    let totalValue = 0;
    let totalCost = 0;
    const details = [];

    holdings.forEach(h => {
      const market = this._prices.find(p => p.symbol === h.symbol || p.ticker === h.symbol || p.ticker === h.ticker);
      if (market) {
        const value = h.units * market.price;
        const cost = h.units * (h.avgCost || 0);
        const gain = value - cost;
        const gainPercent = cost > 0 ? (gain / cost) * 100 : 0;
        totalValue += value;
        totalCost += cost;
        details.push({ ...h, currentPrice: market.price, value, cost, gain, gainPercent, analystRating: market.analystRating, targetPrice: market.targetPrice });
      } else {
        details.push({ ...h, currentPrice: null, value: 0, cost: 0, gain: 0, gainPercent: 0, analystRating: 'N/A', targetPrice: null });
      }
    });

    return { totalValue, totalCost, totalGain: totalValue - totalCost, totalGainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0, details };
  },

  getTopMovers() {
    if (!this._prices) this.getPrices();
    const sorted = [...this._prices].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
    return { gainers: sorted.filter(s => s.changePercent > 0).slice(0, 3), losers: sorted.filter(s => s.changePercent < 0).slice(0, 3) };
  },

  getMarketSummary() {
    if (!this._prices) this.getPrices();
    const advancers = this._prices.filter(p => p.changePercent > 0).length;
    const decliners = this._prices.filter(p => p.changePercent < 0).length;
    const unchanged = this._prices.length - advancers - decliners;
    const avgChange = this._prices.reduce((s, p) => s + p.changePercent, 0) / this._prices.length;
    const totalVolume = this._prices.reduce((s, p) => s + (p.volume || 0), 0);
    return { advancers, decliners, unchanged, avgChange, totalVolume, totalAssets: this._prices.length };
  }
};
