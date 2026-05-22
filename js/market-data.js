const MarketData = {
  _prices: null,
  _news: null,
  _lastUpdate: null,

  _stocks: [
    { symbol: 'S&P 500', ticker: 'SPY', basePrice: 478.50, volatility: 0.02 },
    { symbol: 'NASDAQ', ticker: 'QQQ', basePrice: 398.20, volatility: 0.025 },
    { symbol: 'JSE Top 40', ticker: 'STX40', basePrice: 72450, volatility: 0.015 },
    { symbol: 'Bitcoin', ticker: 'BTC', basePrice: 67500, volatility: 0.04 },
    { symbol: 'Ethereum', ticker: 'ETH', basePrice: 3450, volatility: 0.045 },
    { symbol: 'Gold', ticker: 'XAU', basePrice: 2340, volatility: 0.008 },
    { symbol: 'USD/ZAR', ticker: 'USDZAR', basePrice: 18.65, volatility: 0.01 },
  ],

  _headlines: [
    { text: 'Fed signals potential rate cut in Q3, markets rally', sentiment: 'positive' },
    { text: 'SA inflation eases to 4.7%, boosting rate cut hopes', sentiment: 'positive' },
    { text: 'Global tech stocks surge on AI earnings optimism', sentiment: 'positive' },
    { text: 'Oil prices stabilize amid Middle East tensions', sentiment: 'neutral' },
    { text: 'Emerging markets see record foreign inflows in Q2', sentiment: 'positive' },
    { text: 'Gold hits new all-time high above $2,400', sentiment: 'positive' },
    { text: 'JSE All Share index reaches new record level', sentiment: 'positive' },
    { text: 'Cryptocurrency market cap surpasses $3 trillion', sentiment: 'positive' },
    { text: 'SA unemployment rate drops to 32.1%', sentiment: 'positive' },
    { text: 'Global recession fears subside as GDP data beats expectations', sentiment: 'positive' },
    { text: 'Property sector shows signs of recovery in major metros', sentiment: 'neutral' },
    { text: 'Retirement annuity contributions reach new highs in tax season', sentiment: 'neutral' },
  ],

  _generatePrice(base, vol) {
    const change = (Math.random() - 0.48) * 2 * vol * base;
    const newPrice = base + change;
    return { price: newPrice, change, changePercent: (change / base) * 100 };
  },

  getPrices() {
    return this._stocks.map(s => {
      const data = this._generatePrice(s.basePrice, s.volatility);
      return { ...s, ...data };
    });
  },

  getNews() {
    const count = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...this._headlines].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count).map(h => ({
      ...h,
      time: `${Math.floor(Math.random() * 12) + 1}h ago`,
      source: ['Reuters', 'Bloomberg', 'CNBC', 'Financial Times', 'Moneyweb'][Math.floor(Math.random() * 5)]
    }));
  },

  getPortfolioPerformance(holdings) {
    const prices = this.getPrices();
    let totalValue = 0;
    let totalCost = 0;
    const details = [];

    holdings.forEach(h => {
      const market = prices.find(p => p.symbol === h.symbol || p.ticker === h.symbol);
      if (market) {
        const value = h.units * market.price;
        const cost = h.units * (h.avgCost || 0);
        totalValue += value;
        totalCost += cost;
        details.push({ ...h, currentPrice: market.price, value, gain: value - cost, gainPercent: cost > 0 ? ((value - cost) / cost) * 100 : 0 });
      } else {
        details.push({ ...h, currentPrice: 0, value: 0, gain: 0, gainPercent: 0 });
      }
    });

    return { totalValue, totalCost, totalGain: totalValue - totalCost, totalGainPercent: totalCost > 0 ? ((totalValue - totalCost) / totalCost) * 100 : 0, details };
  }
};
