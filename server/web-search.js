const axios = require('axios');

const USER_AGENT = 'WealthWiseAI/1.0 (Financial Advisory Bot)';

async function searchDuckDuckGo(query) {
  try {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1`;
    const { data } = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': USER_AGENT } });

    const results = [];
    if (data.AbstractText) {
      results.push({ type: 'abstract', title: data.Heading || 'Summary', snippet: data.AbstractText, source: 'DuckDuckGo' });
    }
    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      data.RelatedTopics.slice(0, 5).forEach(t => {
        if (t.Text) results.push({ type: 'related', title: t.FirstURL || '', snippet: t.Text, source: 'DuckDuckGo' });
        if (t.Topics) t.Topics.slice(0, 3).forEach(st => {
          if (st.Text) results.push({ type: 'related', title: st.FirstURL || '', snippet: st.Text, source: 'DuckDuckGo' });
        });
      });
    }
    if (data.Results && data.Results.length > 0) {
      data.Results.slice(0, 4).forEach(r => {
        results.push({ type: 'result', title: r.Title || '', snippet: r.Text || '', url: r.FirstURL || '', source: 'DuckDuckGo' });
      });
    }
    return results;
  } catch (e) {
    console.warn('DuckDuckGo search failed:', e.message);
    return [];
  }
}

async function searchWikipedia(query) {
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;
    const { data } = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': USER_AGENT } });
    if (data && data.extract) {
      return [{ type: 'wikipedia', title: data.title || query, snippet: data.extract, url: data.content_urls?.desktop?.page || '', source: 'Wikipedia' }];
    }
    return [];
  } catch {
    try {
      const url2 = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&srlimit=3`;
      const { data } = await axios.get(url2, { timeout: 8000, headers: { 'User-Agent': USER_AGENT } });
      if (data?.query?.search) {
        return data.query.search.map(r => ({
          type: 'wikipedia', title: r.title, snippet: r.snippet.replace(/<[^>]+>/g, ''), source: 'Wikipedia'
        }));
      }
      return [];
    } catch {
      return [];
    }
  }
}

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
  } catch (e) {
    return null;
  }
}

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
  } catch {
    return null;
  }
}

async function searchSAFinNews(query) {
  try {
    const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query + ' South Africa finance')}&hl=en-ZA&gl=ZA`;
    const { data } = await axios.get(url, { timeout: 6000, headers: { 'User-Agent': USER_AGENT }, responseType: 'text' });
    const items = [];
    const titleMatch = data.match(/<title>(.*?)<\/title>/g);
    const linkMatch = data.match(/<link>(.*?)<\/link>/g);
    if (titleMatch && linkMatch) {
      for (let i = 1; i < Math.min(titleMatch.length, 8); i++) {
        const title = titleMatch[i].replace('<title>', '').replace('</title>', '');
        const link = linkMatch[i] ? linkMatch[i].replace('<link>', '').replace('</link>', '') : '';
        if (title && !title.includes('Google News')) {
          items.push({ type: 'news', title, snippet: title, url: link, source: 'Google News SA' });
        }
      }
    }
    return items.slice(0, 5);
  } catch (e) {
    return [];
  }
}

async function webSearch(query) {
  const results = [];

  const [ddg, wiki, news] = await Promise.all([
    searchDuckDuckGo(query),
    searchWikipedia(query),
    searchSAFinNews(query)
  ]);

  results.push(...ddg, ...wiki, ...news);

  const tickerMatch = query.match(/\b[A-Z]{2,5}\b/g);
  if (tickerMatch) {
    for (const t of tickerMatch.slice(0, 3)) {
      const yahoo = await searchYahooFinance(t);
      if (yahoo) {
        results.unshift({ type: 'stock_price', ...yahoo });
      }
    }
  }

  if (query.toLowerCase().includes('fear') || query.toLowerCase().includes('greed') || query.toLowerCase().includes('sentiment')) {
    const fg = await searchFearGreedIndex();
    if (fg) results.unshift({ type: 'fear_greed', ...fg });
  }

  return results;
}

module.exports = { webSearch, searchYahooFinance };
