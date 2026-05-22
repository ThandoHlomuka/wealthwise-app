const axios = require('axios');
const cheerio = require('cheerio');

const USER_AGENT = 'WealthWiseAI/1.0 (Financial Advisory Bot)';
const TIMEOUT = 8000;

// ─── Utility: parse RSS XML ──────────────────────────────────────────────────
function parseRSS(xml, sourceName) {
  const items = [];
  const $ = cheerio.load(xml, { xmlMode: true });
  $('item').each((i, el) => {
    if (i >= 5) return false;
    const title = $(el).find('title').text().trim();
    let desc = $(el).find('description').text().trim();
    desc = desc.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const link = $(el).find('link').text().trim();
    const pubDate = $(el).find('pubDate').text().trim();
    if (title) {
      items.push({ type: 'news', title, snippet: desc || title, url: link, date: pubDate, source: sourceName });
    }
  });
  return items;
}

// ─── 1. DuckDuckGo ───────────────────────────────────────────────────────────
async function searchDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const { data } = await axios.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': USER_AGENT } });
    const results = [];
    if (data.AbstractText) {
      results.push({ type: 'abstract', title: data.Heading || 'Summary', snippet: data.AbstractText, source: 'DuckDuckGo' });
    }
    if (data.RelatedTopics) {
      data.RelatedTopics.slice(0, 5).forEach(t => {
        if (t.Text) results.push({ type: 'related', title: t.FirstURL || '', snippet: t.Text, source: 'DuckDuckGo' });
        if (t.Topics) t.Topics.slice(0, 3).forEach(st => {
          if (st.Text) results.push({ type: 'related', title: st.FirstURL || '', snippet: st.Text, source: 'DuckDuckGo' });
        });
      });
    }
    if (data.Results) {
      data.Results.slice(0, 4).forEach(r => {
        results.push({ type: 'result', title: r.Title || '', snippet: r.Text || '', url: r.FirstURL || '', source: 'DuckDuckGo' });
      });
    }
    return results;
  } catch { return []; }
}

// ─── 2. Bing (HTML scrape) ───────────────────────────────────────────────────
async function searchBing(query) {
  try {
    const url = `https://www.bing.com/search?q=${encodeURIComponent(query + ' finance')}&count=10`;
    const { data } = await axios.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': USER_AGENT } });
    const $ = cheerio.load(data);
    const results = [];
    $('.b_algo').each((i, el) => {
      if (i >= 5) return false;
      const title = $(el).find('h2 a').text().trim();
      const snippet = $(el).find('.b_caption p').text().trim();
      const link = $(el).find('h2 a').attr('href') || '';
      if (title) results.push({ type: 'result', title, snippet: snippet || title, url: link, source: 'Bing' });
    });
    return results;
  } catch { return []; }
}

// ─── 3. Wikipedia ────────────────────────────────────────────────────────────
async function searchWikipedia(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': USER_AGENT } });
    if (data && data.extract) {
      return [{ type: 'wikipedia', title: data.title || query, snippet: data.extract, url: data.content_urls?.desktop?.page || '', source: 'Wikipedia' }];
    }
    return [];
  } catch {
    try {
      const url2 = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
      const { data } = await axios.get(url2, { timeout: TIMEOUT, headers: { 'User-Agent': USER_AGENT } });
      if (data?.query?.search) {
        return data.query.search.map(r => ({
          type: 'wikipedia', title: r.title, snippet: r.snippet.replace(/<[^>]+>/g, ''), source: 'Wikipedia'
        }));
      }
      return [];
    } catch { return []; }
  }
}

// ─── 4. Yahoo Finance (real-time stock price) ────────────────────────────────
async function searchYahooFinance(ticker) {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1m`;
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT } });
    if (data?.chart?.result?.[0]) {
      const r = data.chart.result[0];
      const meta = r.meta;
      const quote = r.indicators?.quote?.[0];
      return {
        ticker: meta.symbol,
        price: meta.regularMarketPrice,
        prevClose: meta.previousClose || 0,
        change: meta.regularMarketPrice - (meta.previousClose || 0),
        changePercent: meta.previousClose ? ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100) : 0,
        high: quote?.high?.slice(-1)[0] || 0,
        low: quote?.low?.slice(-1)[0] || 0,
        volume: quote?.volume?.slice(-1)[0] || 0,
        source: 'Yahoo Finance'
      };
    }
    return null;
  } catch { return null; }
}

// ─── 5. CoinGecko (crypto, free, no API key) ─────────────────────────────────
async function searchCoinGecko(query) {
  try {
    const coinMap = {
      bitcoin: 'bitcoin', btc: 'bitcoin', ethereum: 'ethereum', eth: 'ethereum',
      solana: 'solana', sol: 'solana', cardano: 'cardano', ada: 'cardano',
      ripple: 'ripple', xrp: 'ripple', polkadot: 'polkadot', dot: 'polkadot',
      dogecoin: 'dogecoin', doge: 'dogecoin', avalanche: 'avalanche-2', avax: 'avalanche-2',
      chainlink: 'chainlink', link: 'chainlink', polygon: 'matic-network', matic: 'matic-network',
      litecoin: 'litecoin', ltc: 'litecoin'
    };
    const q = query.toLowerCase();
    let coinId = Object.entries(coinMap).find(([key]) => q.includes(key))?.[1];
    if (!coinId && (q.includes('crypto') || q.includes('coin') || q.includes('token'))) {
      coinId = 'bitcoin'; // default to BTC as market proxy
    }
    if (!coinId) return [];

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&community_data=false&developer_data=false`;
    const { data } = await axios.get(url, { timeout: TIMEOUT, headers: { 'User-Agent': USER_AGENT } });
    if (data?.market_data) {
      const m = data.market_data;
      return [{
        type: 'crypto',
        name: data.name,
        symbol: data.symbol?.toUpperCase(),
        price: m.current_price?.usd,
        priceChange24h: m.price_change_percentage_24h,
        priceChange7d: m.price_change_percentage_7d,
        marketCap: m.market_cap?.usd,
        volume24h: m.total_volume?.usd,
        high24h: m.high_24h?.usd,
        low24h: m.low_24h?.usd,
        circulatingSupply: m.circulating_supply,
        ath: m.ath?.usd,
        athDate: m.ath_date?.usd,
        description: data.description?.en?.substring(0, 500) || '',
        source: 'CoinGecko'
      }];
    }
    return [];
  } catch { return []; }
}

// ─── 6. World Bank API (economic indicators, free, no key) ───────────────────
async function searchWorldBank(query) {
  const q = query.toLowerCase();
  const indicators = {
    'gdp': { code: 'NY.GDP.MKTP.CD', label: 'GDP (current US$)', country: 'ZAF' },
    'gdp growth': { code: 'NY.GDP.MKTP.KD.ZG', label: 'GDP growth (annual %)', country: 'ZAF' },
    'inflation': { code: 'FP.CPI.TOTL.ZG', label: 'Inflation (annual %)', country: 'ZAF' },
    'unemployment': { code: 'SL.UEM.TOTL.ZS', label: 'Unemployment (% of total labor force)', country: 'ZAF' },
    'population': { code: 'SP.POP.TOTL', label: 'Population, total', country: 'ZAF' },
    'interest rate': { code: 'FR.INR.LEND', label: 'Lending interest rate (%)', country: 'ZAF' },
    'gini': { code: 'SI.POV.GINI', label: 'Gini index', country: 'ZAF' },
  };

  const match = Object.entries(indicators).find(([key]) => q.includes(key));
  if (!match) return [];

  const { code, label, country } = match[1];
  try {
    const url = `https://api.worldbank.org/v2/country/${country}/indicator/${code}?format=json&per_page=5`;
    const { data } = await axios.get(url, { timeout: TIMEOUT });
    if (Array.isArray(data) && data[1]) {
      return data[1].filter(r => r.value != null).map(r => ({
        type: 'economic_indicator',
        indicator: label,
        country: country === 'ZAF' ? 'South Africa' : country,
        value: r.value,
        year: r.date,
        source: 'World Bank'
      }));
    }
    return [];
  } catch { return []; }
}

// ─── 7. Google News RSS (general + SA) ────────────────────────────────────────
async function searchGoogleNews(query) {
  try {
    const urls = [
      `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' finance')}&hl=en-US&gl=US`,
      `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' South Africa finance')}&hl=en-ZA&gl=ZA`,
    ];
    const results = [];
    for (const url of urls) {
      try {
        const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
        results.push(...parseRSS(data, url.includes('gl=ZA') ? 'Google News SA' : 'Google News'));
      } catch { /* skip */ }
    }
    // deduplicate by title
    const seen = new Set();
    return results.filter(r => {
      const key = r.title.toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 6);
  } catch { return []; }
}

// ─── 8. Reuters RSS ──────────────────────────────────────────────────────────
async function searchReuters() {
  try {
    const urls = [
      'https://www.reutersagency.com/feed/',
      'https://www.reuters.com/tools/rss',
    ];
    for (const url of urls) {
      try {
        const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
        const items = parseRSS(data, 'Reuters');
        if (items.length > 0) return items;
      } catch { /* try next */ }
    }
    return [];
  } catch { return []; }
}

// ─── 9. CNBC RSS ─────────────────────────────────────────────────────────────
async function searchCNBC() {
  try {
    const url = 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=100003114';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'CNBC');
  } catch { return []; }
}

// ─── 10. MarketWatch RSS ──────────────────────────────────────────────────────
async function searchMarketWatch() {
  try {
    const url = 'https://feeds.marketwatch.com/marketwatch/topstories';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'MarketWatch');
  } catch { return []; }
}

// ─── 11. Bloomberg RSS ────────────────────────────────────────────────────────
async function searchBloomberg() {
  try {
    const url = 'https://www.bloomberg.com/feed/podcasts/market-wrap';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'Bloomberg');
  } catch { return []; }
}

// ─── 12. Financial Times RSS ───────────────────────────────────────────────────
async function searchFT() {
  try {
    const url = 'https://www.ft.com/rss/home';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'Financial Times');
  } catch { return []; }
}

// ─── 13. Fin24 (SA financial news) RSS ────────────────────────────────────────
async function searchFin24() {
  try {
    const urls = [
      'https://www.fin24.com/rss',
      'https://www.fin24.com/markets/rss',
    ];
    for (const url of urls) {
      try {
        const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
        const items = parseRSS(data, 'Fin24');
        if (items.length > 0) return items;
      } catch { /* try next */ }
    }
    return [];
  } catch { return []; }
}

// ─── 14. Moneyweb (SA financial news) RSS ─────────────────────────────────────
async function searchMoneyweb() {
  try {
    const url = 'https://www.moneyweb.co.za/feed/';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'Moneyweb');
  } catch { return []; }
}

// ─── 15. BusinessDay (SA financial news) RSS ──────────────────────────────────
async function searchBusinessDay() {
  try {
    const url = 'https://www.businesslive.co.za/bd/rss/';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'BusinessDay');
  } catch { return []; }
}

// ─── 16. Investing.com RSS ────────────────────────────────────────────────────
async function searchInvestingCom() {
  try {
    const url = 'https://www.investing.com/rss/news.rss';
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    return parseRSS(data, 'Investing.com');
  } catch { return []; }
}

// ─── 17. Fear & Greed Index ───────────────────────────────────────────────────
async function searchFearGreedIndex() {
  try {
    const { data } = await axios.get('https://api.alternative.me/fng/?limit=1&format=json', { timeout: 5000 });
    if (data?.data?.[0]) {
      return {
        value: parseInt(data.data[0].value),
        classification: data.data[0].value_classification,
        timestamp: data.data[0].timestamp,
        source: 'Alternative.me'
      };
    }
    return null;
  } catch { return null; }
}

// ─── 18. Yahoo Finance Search (query-based ticker search) ─────────────────────
async function searchYahooFinanceQuery(query) {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=3`;
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT } });
    const results = [];
    if (data?.quotes) {
      data.quotes.filter(q => q.symbol && q.shortname).slice(0, 3).forEach(q => {
        results.push({
          type: 'ticker_search',
          ticker: q.symbol,
          name: q.shortname,
          exchange: q.exchange || '',
          sector: q.sector || '',
          source: 'Yahoo Finance Search'
        });
      });
    }
    if (data?.news) {
      data.news.slice(0, 3).forEach(n => {
        results.push({ type: 'news', title: n.title, snippet: n.summary || n.title, url: n.link, publisher: n.publisher || '', source: 'Yahoo Finance News' });
      });
    }
    return results;
  } catch { return []; }
}

// ─── Main webSearch orchestrator ─────────────────────────────────────────────
async function webSearch(query) {
  const results = [];
  const q = query.toLowerCase();

  // Determine which searches to run based on query context
  const searches = [searchDuckDuckGo(query), searchBing(query), searchWikipedia(query)];

  // Always search news
  searches.push(searchGoogleNews(query));
  searches.push(searchReuters());
  searches.push(searchCNBC());
  searches.push(searchMarketWatch());
  searches.push(searchBloomberg());
  searches.push(searchFT());
  searches.push(searchFin24());
  searches.push(searchMoneyweb());
  searches.push(searchBusinessDay());
  searches.push(searchInvestingCom());

  // Crypto queries
  const cryptoKeywords = ['bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'cryptocurrency', 'solana', 'cardano', 'altcoin', 'blockchain', 'defi'];
  if (cryptoKeywords.some(k => q.includes(k))) {
    searches.push(searchCoinGecko(query));
  }

  // Economic indicator queries
  const econKeywords = ['gdp', 'inflation', 'unemployment', 'poverty', 'gini', 'interest rate', 'economic'];
  if (econKeywords.some(k => q.includes(k))) {
    searches.push(searchWorldBank(query));
  }

  // Stock/financial search queries
  const stockKeywords = ['stock', 'share', 'market', 'company', 'invest', 'trade', 'finance', 'nasdaq', 'jse', 'nyse'];
  if (stockKeywords.some(k => q.includes(k))) {
    searches.push(searchYahooFinanceQuery(query));
  }

  // Extract tickers from query
  const tickerMatch = q.match(/\b[A-Z]{2,5}\b/g);
  if (tickerMatch) {
    for (const t of tickerMatch.slice(0, 3)) {
      searches.push(searchYahooFinance(t));
    }
  }

  // Market sentiment
  if (q.includes('fear') || q.includes('greed') || q.includes('sentiment') || q.includes('market mood')) {
    searches.push(Promise.resolve(searchFearGreedIndex().then(r => r ? [{ type: 'fear_greed', ...r }] : [])));
  }

  // Wait for all searches
  const settled = await Promise.allSettled(searches);
  settled.forEach(s => {
    if (s.status === 'fulfilled' && Array.isArray(s.value)) {
      results.push(...s.value);
    } else if (s.status === 'fulfilled' && s.value && s.value.ticker) {
      results.push({ type: 'stock_price', ...s.value });
    } else if (s.status === 'fulfilled' && s.value && s.value.value !== undefined && s.value.classification !== undefined) {
      results.push({ type: 'fear_greed', ...s.value });
    }
  });

  return results;
}

module.exports = { webSearch, searchYahooFinance };
