const express = require('express');
const cors = require('cors');
const path = require('path');
const { webSearch, searchYahooFinance } = require('./web-search');
const KNOWLEDGE = require('./knowledge');

const app = express();
const PORT = 3456;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// ─── Financial Knowledge Base Lookup ──────────────────────────────────────
function searchKnowledgeBase(query) {
  const q = query.toLowerCase().trim();
  const results = [];

  const sections = [
    { key: 'investments', label: 'Investments', keywords: ['invest', 'stock', 'share', 'equity', 'etf', 'unit trust', 'bond', 'portfolio', 'diversify', 'asset class', 'jse', 'dividend', 'crypto', 'commodity', 'gold', 'property'] },
    { key: 'tax', label: 'Tax', keywords: ['tax', 'sars', 'cgt', 'capital gains', 'deduction', 'rebate', 'tfsa', 'retirement annuity', 'medical aid', 'donation', 'income tax', 'vat'] },
    { key: 'retirement', label: 'Retirement', keywords: ['retire', 'pension', 'annuity', 'ra', 'provident', 'preservation', 'living annuity', 'age', 'two-pot'] },
    { key: 'insurance', label: 'Insurance', keywords: ['insurance', 'life insurance', 'disability', 'medical aid', 'income protection', 'critical illness', 'funeral', 'cover'] },
    { key: 'debt', label: 'Debt', keywords: ['debt', 'loan', 'credit', 'bond', 'mortgage', 'interest', 'pay off', 'repay', 'consolidate', 'snowball', 'avalanche', 'ncr'] },
    { key: 'estate', label: 'Estate Planning', keywords: ['estate', 'will', 'trust', 'inheritance', 'executor', 'estate duty', 'beneficiary', 'guardian'] },
    { key: 'property', label: 'Property', keywords: ['property', 'real estate', 'house', 'home', 'rental', 'bond', 'transfer', 'reit', 'levy', 'rates'] },
    { key: 'budgeting', label: 'Budgeting', keywords: ['budget', 'spend', 'expense', 'save', 'envelope', 'track', 'money management', '50/30/20'] },
    { key: 'education', label: 'Education Funding', keywords: ['education', 'school', 'university', 'tertiary', 'student', 'nsfas', 'bursary', 'scholarship'] },
    { key: 'offshore', label: 'Offshore Investing', keywords: ['offshore', 'foreign', 'international', 'global', 'usd', 'dollar', 'exchange control', 'overseas', 'emerging market'] },
    { key: 'emergency', label: 'Emergency Fund', keywords: ['emergency', 'rainy day', 'safety net', 'unexpected', 'job loss'] },
    { key: 'advisor', label: 'Financial Advisor', keywords: ['advisor', 'financial planner', 'cfp', 'fsca', 'advice', 'broker', 'agent', 'commission'] },
    { key: 'behavioral', label: 'Behavioral Finance', keywords: ['behavioral', 'psychology', 'bias', 'emotion', 'loss aversion', 'overconfidence', 'herd', 'anchoring'] },
    { key: 'saEconomy', label: 'SA Economy', keywords: ['economy', 'gdp', 'inflation', 'repo rate', 'prime', 'rand', 'sarawg', 'gnu', 'loadshedding', 'eskom', 'moodys', 'fitch', 's&p'] },
    { key: 'calculators', label: 'Financial Calculators', keywords: ['calculator', 'compound', 'rule of 72', 'affordability', 'formula', 'how much', 'calculate'] },
  ];

  const matched = sections.filter(s => s.keywords.some(k => q.includes(k)));
  matched.forEach(m => {
    const data = KNOWLEDGE[m.key];
    if (data) {
      if (data.summary) results.push({ type: 'knowledge', section: m.label, content: data.summary, source: 'WealthWise Knowledge Base' });
      if (data.tips) results.push({ type: 'knowledge', section: m.label, content: data.tips.slice(0, 3).join('\n'), source: 'WealthWise Knowledge Base' });
      if (data.advice) results.push({ type: 'knowledge', section: m.label, content: data.advice.slice(0, 3).join('\n'), source: 'WealthWise Knowledge Base' });
      if (data.saSpecific) {
        const specifics = Object.values(data.saSpecific);
        if (specifics.length) results.push({ type: 'knowledge', section: m.label, content: specifics.slice(0, 2).join('\n\n'), source: 'WealthWise Knowledge Base' });
      }
    }
  });

  return results;
}

// ─── Format chatbot response ──────────────────────────────────────────────
function formatResponse(userQuery, knowledgeResults, webResults, userData) {
  const q = userQuery.toLowerCase().trim();
  let response = '';
  let usedKnowledge = false;
  let usedWeb = false;

  // 1. Use knowledge base results
  if (knowledgeResults.length > 0) {
    usedKnowledge = true;
    const section = knowledgeResults[0].section;
    const content = knowledgeResults.map(k => k.content).filter(Boolean).join('\n\n');

    switch (section) {
      case 'Investments': {
        response += `📈 **Investment Insights**\n\n`;
        response += content + '\n\n';

        if (q.includes('stock') || q.includes('buy') || q.includes('recommend')) {
          response += `**Analyst Guidelines**:\n`;
          response += `• For growth: focus on quality companies with ROE >15% and earnings growth >10%\n`;
          response += `• For value: look for P/E < 15, P/B < 1.5, dividend yield > 3%\n`;
          response += `• For income: prioritize dividend aristocrats with 5+ years of consistent growth\n`;
        }

        if (q.includes('etf') || q.includes('index')) {
          response += `\n**Popular ETFs on JSE**:\n`;
          response += `• Satrix 40 (STX40) — tracks JSE Top 40, TER 0.33%\n`;
          response += `• Sygnia Itrix SWIX 40 (SYG40) — tracks SWIX 40, TER 0.20%\n`;
          response += `• Satrix MSCI World (STXWDM) — global equities, TER 0.55%\n`;
          response += `• Coreshares Total World (COREWX) — global equities, TER 0.23%\n`;
        }

        if (q.includes('dividend')) {
          response += `\n**SA Dividend Stocks**: Shoprite, Standard Bank, FirstRand, MTN, Vodacom, Mr Price, RMI Holdings — typical yields 3-7%.\n`;
        }

        if (q.includes('property') || q.includes('reit')) {
          response += `\n**SA REITs**: Growthpoint (GRT), Resilient (RES), Equites (EQU), Nepi Rockcastle (NRP), Lighthouse Capital (LTE) — yields typically 8-12%.\n`;
        }
        break;
      }
      case 'Tax': {
        response += `📋 **Tax Guidance**\n\n`;
        response += content + '\n\n';

        if (userData?.profile?.monthlyIncome) {
          const annual = userData.profile.monthlyIncome * 12;
          response += `Based on your income level:\n`;
          if (annual <= 237100) response += `• You're in the 18% bracket. Your tax rebate of R17,235 covers most of your tax.\n`;
          else if (annual <= 370500) response += `• You're in the 26% bracket. Max your TFSA and consider RA contributions.\n`;
          else if (annual <= 512800) response += `• You're in the 31% bracket. RA contributions are highly beneficial for tax savings.\n`;
          else if (annual <= 673000) response += `• You're in the 36% bracket. RA, TFSA, and medical aid credits all valuable.\n`;
          else if (annual <= 857900) response += `• You're in the 39% bracket. Aggressive retirement funding recommended (up to R350k/year).\n`;
          else if (annual <= 1817000) response += `• You're in the 41% bracket. Consider endowments and trust structures for tax efficiency.\n`;
          else response += `• You're in the 45% top bracket. Comprehensive tax planning essential — consult a specialist.\n`;
        }

        response += `\n**Key Dates**: Tax year runs 1 Mar - 28 Feb. Filing season Jul-Oct (eFiling usually opens July, auto-assessments Aug). Provisional taxpayers: two provisional payments + third top-up.\n`;
        break;
      }
      case 'Retirement': {
        response += `👴 **Retirement Planning**\n\n`;
        response += content + '\n\n';
        response += `**Two-Pot System (from Sep 2024)**:\n• Savings pot: 1/3 of contributions — accessible once per year (min R30k)\n• Retirement pot: 2/3 of contributions — preserved until 55\n• Vested pot: pre-2024 contributions — subject to old rules\n\n`;
        response += `**How much to save?**\n• Age 25-35: 15% of income\n• Age 35-45: 20% of income\n• Age 45-55: 25-30% of income\n• Age 55-65: 30-35% of income\n`;
        break;
      }
      case 'Insurance': {
        response += `🛡️ **Insurance Guide**\n\n`;
        response += content + '\n\n';
        response += `**How much cover do you need?**\n`;
        if (userData?.profile?.monthlyIncome) {
          const annual = userData.profile.monthlyIncome;
          response += `• Life insurance: R${(annual * 12 * 12).toLocaleString()} - R${(annual * 12 * 15).toLocaleString()} (10-15x annual income)\n`;
          response += `• Income protection: R${(annual * 0.75).toLocaleString()}/month (75% of income)\n`;
        } else {
          response += `• Life: 10-15x annual income\n• Disability: 75% of monthly income\n• Medical aid: comprehensive or hospital plan + gap cover\n`;
        }
        break;
      }
      case 'Debt': {
        response += `💳 **Debt Management**\n\n`;
        response += content + '\n\n';
        response += `**Current SA interest rates (2026)**:\n• Home loans: 11.5-12.5%\n• Credit cards: 18-21%\n• Personal loans: 14-20%\n• Store cards: 22-24%\n• Payday loans: 30%+\n\n`;
        response += `**Which debt to pay first?** Always target the highest interest rate (avalanche method saves the most). If you need motivation, start with the smallest balance (snowball method).\n`;
        break;
      }
      case 'Estate Planning': {
        response += `📜 **Estate Planning**\n\n`;
        response += content + '\n\n';
        response += `**Do you need a will?**\nIf you have any assets or dependents — YES. Without a will, the Intestate Succession Act determines distribution, which may not match your wishes and can cause family disputes.\n\n`;
        response += `**Cost**: A simple will from a bank costs R500-1,500. Attorney-drafted will costs R2,000-5,000. Trusts cost R10,000-30,000+ to set up.\n`;
        break;
      }
      case 'Property': {
        response += `🏠 **Property Guide**\n\n`;
        response += content + '\n\n';
        if (q.includes('buy') || q.includes('bond') || q.includes('mortgage')) {
          const price = (userData?.profile?.monthlyIncome || 40000) * 12 * 3;
          response += `**Affordability check**: Based on typical income, you might afford a property of approximately R${(price).toLocaleString()}. Get a pre-approval from your bank before house-hunting.\n\n`;
          response += `**Bond costs to budget for**:\n• Application fee: R5,000-7,000\n• Valuation fee: R2,000-5,000\n• Legal fees: R15,000-30,000\n• Transfer duty: 0-13% depending on price\n`;
        }
        break;
      }
      case 'Budgeting': {
        response += `📊 **Budgeting Guide**\n\n`;
        response += content + '\n\n';
        if (userData?.profile?.monthlyIncome) {
          const i = userData.profile.monthlyIncome;
          response += `Based on your income of R${i.toLocaleString()}/month:\n`;
          response += `• Needs (50%): R${(i * 0.5).toLocaleString()}/month — housing, food, transport, insurance\n`;
          response += `• Wants (30%): R${(i * 0.3).toLocaleString()}/month — entertainment, dining, travel, shopping\n`;
          response += `• Savings (20%): R${(i * 0.2).toLocaleString()}/month — investments, debt repayment, emergency fund\n`;
        }
        break;
      }
      case 'Education Funding': {
        response += `📚 **Education Planning**\n\n`;
        response += content + '\n\n';
        response += `**Estimated future costs** (assuming 8% education inflation):\n`;
        response += `• School (Grade 1-12): R50k-R200k/year now, could be R220k-R900k in 18 years\n`;
        response += `• University: R60k-R250k/year now, could be R260k-R1.1M in 18 years\n`;
        response += `Start early — even R500/month invested at 10% grows to R300k+ in 18 years.\n`;
        break;
      }
      case 'Offshore Investing': {
        response += `🌍 **Offshore Investing**\n\n`;
        response += content + '\n\n';
        response += `**Exchange Control Limits (SA)**:\n• Single Discretionary Allowance: R1M/year (no tax clearance needed)\n• Foreign Investment Allowance: R10M/year (requires tax clearance from SARS)\n• Amounts above R10M: apply to SARB for approval\n\n`;
        response += `**Ways to invest offshore from SA**:\n1. JSE-listed global ETFs (no exchange control)\n2. EasyEquities USD account (use SDA)\n3. Direct offshore broker (Interactive Brokers, Saxo Bank)\n4. Offshore bank account (requires tax clearance)\n`;
        break;
      }
      case 'Emergency Fund': {
        response += `🛡️ **Emergency Fund**\n\n`;
        response += content + '\n\n';
        if (userData?.profile?.monthlyIncome) {
          const expenses = userData.monthlySpend || (userData.profile.monthlyIncome * 0.6);
          response += `Your estimated monthly expenses: R${expenses.toLocaleString()}\n`;
          response += `• 3 months: R${(expenses * 3).toLocaleString()}\n`;
          response += `• 6 months: R${(expenses * 6).toLocaleString()}\n`;
        }
        response += `\n**Where to keep it**: High-interest savings account (Tymebank, Money market fund) — NOT in your main bank account to avoid temptation.\n`;
        break;
      }
      case 'Financial Advisor': {
        response += `👔 **Choosing a Financial Advisor**\n\n`;
        response += content + '\n\n';
        response += `**Verification**: Check FSCA registration at https://www.fsca.co.za/ (search by name or FSP number). Confirm they hold a CFP® or equivalent qualification.\n`;
        break;
      }
      case 'Behavioral Finance': {
        response += `🧠 **Behavioral Finance**\n\n`;
        response += content + '\n\n';
        response += `**The best investors** are not the smartest — they have the best emotional control. Create a plan and stick to it. Automate decisions where possible to remove emotion from the equation.\n`;
        break;
      }
      case 'SA Economy': {
        response += `🇿🇦 **SA Economy Overview**\n\n`;
        response += content + '\n\n';
        response += `**Impact on your finances**:\n• High inflation → your savings lose purchasing power → invest in growth assets\n• High repo rate → expensive debt → prioritize debt repayment\n• Weak rand → good for offshore investments in ZAR terms\n• Loadshedding → consider solar investment, backup power for home office\n`;
        break;
      }
      case 'Financial Calculators': {
        response += `🧮 **Financial Calculators**\n\n`;
        response += content + '\n\n';
        if (q.includes('compound')) {
          response += `**Compound Interest Example**:\nInvest R10,000 at 10%/year for 20 years → R67,274 (no further contributions)\nInvest R1,000/month at 10%/year for 20 years → R763,010\nStart 10 years later at same rate → R266,963 (less than half!)\n`;
        }
        if (q.includes('retire') || q.includes('pension')) {
          response += `**Retirement Calculation**:\nIf you need R30,000/month in today's money, at 6% inflation that's R97,000/month in 20 years. You'd need a capital of ~R29M to sustain that for 30 years.\n`;
        }
        break;
      }
      default: {
        response += `📘 **${section}**\n\n${content}\n`;
      }
    }
  }

  // 2. Add web search results for current/recent data
  if (webResults.length > 0) {
    usedWeb = true;
    const stockPrices = webResults.filter(r => r.type === 'stock_price');
    const newsItems = webResults.filter(r => r.type === 'news');
    const fg = webResults.find(r => r.type === 'fear_greed');

    if (stockPrices.length > 0 && (q.includes('price') || q.includes('ticker') || q.includes('stock') || q.includes('share') || stockPrices.some(s => q.includes(s.ticker?.toLowerCase())) || q.includes('market'))) {
      response += (response ? '\n\n' : '') + `📊 **Real-Time Market Data**\n`;
      stockPrices.forEach(s => {
        const emoji = s.change >= 0 ? '🟢' : '🔴';
        response += `\n${emoji} **${s.ticker}**: $${s.price?.toFixed(2) || 'N/A'} | ${s.change >= 0 ? '+' : ''}${s.change?.toFixed(2) || 0} (${s.changePercent >= 0 ? '+' : ''}${s.changePercent?.toFixed(2) || 0}%)`;
        if (s.high) response += `\n   Day range: $${s.low?.toFixed(2)} - $${s.high?.toFixed(2)}`;
        if (s.volume) response += `\n   Volume: ${s.volume?.toLocaleString()}`;
      });
    }

    if (newsItems.length > 0 && (q.includes('news') || q.includes('market') || q.includes('current') || q.includes('latest'))) {
      response += (response ? '\n\n' : '') + `📰 **Latest Financial News**\n`;
      newsItems.slice(0, 4).forEach(n => {
        response += `\n• ${n.title}`;
      });
    }

    if (fg && (q.includes('fear') || q.includes('greed') || q.includes('sentiment') || q.includes('market mood'))) {
      const emoji = fg.value >= 50 ? '🟢' : '🔴';
      response += (response ? '\n\n' : '') + `${emoji} **Fear & Greed Index**: ${fg.value}/100 — ${fg.classification}`;
    }

    if (webResults.filter(r => r.type === 'abstract' || r.type === 'related' || r.type === 'result').length > 0 && !usedKnowledge) {
      response += (response ? '\n\n' : '') + `🌐 **From the Web**\n`;
      webResults.filter(r => r.type === 'abstract' || r.type === 'related').slice(0, 3).forEach(r => {
        response += `\n• ${r.snippet?.substring(0, 300)}${r.snippet?.length > 300 ? '...' : ''}`;
      });
    }
  }

  // 3. If neither knowledge nor web returned useful info, give a general response
  if (!usedKnowledge && !usedWeb) {
    response = `I searched my knowledge base and the web for "${userQuery}" but didn't find specific financial information on that topic. Here's what I can help with:\n\n`;
    response += `• **Investments**: Stocks, ETFs, bonds, property, crypto, diversification\n`;
    response += `• **Tax**: SA tax brackets, deductions, TFSA, RA, CGT, filings\n`;
    response += `• **Retirement**: RA, living annuities, two-pot system, planning calc\n`;
    response += `• **Debt**: Management strategies, consolidation, snowball vs avalanche\n`;
    response += `• **Insurance**: Life, disability, income protection, medical aid\n`;
    response += `• **Property**: Buying, bonds, transfer costs, rental yield, REITs\n`;
    response += `• **Budgeting**: Methods, tools, savings strategies\n`;
    response += `• **Offshore**: Exchange control, global investing, forex\n`;
    response += `• **Emergency fund**: How much, where to keep it\n`;
    response += `• **Estate planning**: Wills, trusts, estate duty\n\n`;
    response += `Try asking with more detail like "Tell me about SA tax brackets" or "How much life insurance do I need?"`;
  }

  response += `\n\n_🤖 Powered by WealthWise AI · Data sourced from knowledge base and public web_`;

  return response;
}

// ─── /api/chat endpoint ──────────────────────────────────────────────────────
app.post('/api/chat', async (req, res) => {
  const { query, userData } = req.body;

  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    return res.status(400).json({ error: 'Query is required' });
  }

  const trimmed = query.trim();

  try {
    const [knowledgeResults, webResults] = await Promise.all([
      Promise.resolve(searchKnowledgeBase(trimmed)),
      webSearch(trimmed)
    ]);

    const response = formatResponse(trimmed, knowledgeResults, webResults, userData || {});

    res.json({
      response,
      sources: {
        knowledge: knowledgeResults.length > 0,
        web: webResults.length > 0,
        knowledgeCount: knowledgeResults.length,
        webCount: webResults.length
      }
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error processing your request' });
  }
});

// ─── /api/stock/:ticker endpoint ─────────────────────────────────────────────
app.get('/api/stock/:ticker', async (req, res) => {
  const { ticker } = req.params;
  if (!ticker || ticker.length > 10) {
    return res.status(400).json({ error: 'Invalid ticker' });
  }
  try {
    const data = await searchYahooFinance(ticker.toUpperCase());
    if (data) {
      res.json(data);
    } else {
      res.json({ error: `Could not fetch data for ${ticker}` });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ✨ WealthWise AI Server running on http://localhost:${PORT}`);
  console.log(`  📡 API: POST http://localhost:${PORT}/api/chat`);
  console.log(`  📈 API: GET  http://localhost:${PORT}/api/stock/:ticker\n`);
});
