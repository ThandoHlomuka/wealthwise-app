const KNOWLEDGE = {
  // ──────────────────────── INVESTMENTS ────────────────────────
  investments: {
    summary: 'Investment is the act of allocating money into assets with the expectation of generating income or profit.',
    assetClasses: [
      { name: 'Equities (Stocks)', description: 'Shares in publicly traded companies. Higher risk, higher potential return over long term. Suitable for growth-focused investors with 5+ year horizons.', saSpecific: 'JSE listed shares like Naspers, FirstRand, Standard Bank. Dividends taxed at 20% for SA residents.' },
      { name: 'Bonds', description: 'Fixed-income securities where you lend money to government or corporates. Lower risk, predictable returns. SA government bonds (R186, R2035) offer ~11-12% yields.', taxInfo: 'Interest income taxed at marginal rate. No CGT on government bonds held to maturity.' },
      { name: 'ETFs (Exchange Traded Funds)', description: 'Baskets of securities tracking an index. Low-cost, diversified. Examples: Satrix 40, Sygnia Itrix, Coreshares. TER typically 0.2-0.6%.' },
      { name: 'Unit Trusts', description: 'Pooled investments managed by asset managers like Allan Gray, Coronation, Ninety One. Active management, higher fees (1-2%), potential outperformance.' },
      { name: 'Property', description: 'Direct property (buying real estate) or indirect (REITs on JSE like Growthpoint, Resilient, Equites). Rental yield 6-10% in SA.' },
      { name: 'Cryptocurrency', description: 'Digital assets like Bitcoin and Ethereum. Highly volatile, speculative. Only invest 5-10% of portfolio. SA has Luno, VALR exchanges. SARS requires crypto gains to be declared.' },
      { name: 'Commodities', description: 'Gold, platinum, silver, oil. Inflation hedge. Can invest via ETFs, futures, or physical. SA is major producer of gold and platinum.' },
      { name: 'Money Market', description: 'Short-term debt instruments. Very low risk, 6-8% returns in SA. Good for emergency funds and short-term savings.' },
    ],
    strategies: [
      { name: 'Dollar-Cost Averaging', description: 'Investing fixed amounts at regular intervals regardless of price. Reduces timing risk. Effective for long-term wealth building.' },
      { name: 'Value Investing', description: 'Buying undervalued stocks with strong fundamentals. Popularized by Warren Buffett. Look for low P/E, high dividend yield, strong cash flow.' },
      { name: 'Growth Investing', description: 'Investing in companies with high earnings growth potential. Higher risk, higher reward. Common in tech sector.' },
      { name: 'Dividend Investing', description: 'Focus on stocks that pay regular dividends. Provides passive income. SA has many dividend aristocrats like Shoprite, MTN, Standard Bank.' },
      { name: 'Index Investing', description: 'Passively tracking market indices. Low fees, diversified, consistently outperforms most active managers over 10+ years.' },
      { name: 'Factor Investing', description: 'Targeting specific drivers of returns: value, momentum, quality, size, low volatility. Implemented via smart-beta ETFs.' },
    ],
    rebalancing: 'Rebalance your portfolio annually or when any asset class drifts more than 5% from target. Sell overperformers, buy underperformers. Tax-efficient rebalancing: use new contributions and dividend reinvestments first.',
    saSpecific: {
      tfsa: 'Tax-Free Savings Account: Contribute up to R36,000/year (lifetime limit R500,000). No tax on interest, dividends, or capital gains. Ideal for long-term savings. Best filled with growth assets like equities/ETFs.',
      ra: 'Retirement Annuity: Contribute up to 27.5% of taxable income (max R350,000/year). Tax deductible. Can access from age 55. One-third can be taken as cash (taxed), two-thirds used to buy annuity.',
      tia: 'Tax-free investing: Beyond TFSA, use endowments or offshore structures for tax-efficient investing. Endowment: 30% of contributions go to life cover, 40% tax rate on investment returns inside the policy.'
    }
  },

  // ──────────────────────── TAX ────────────────────────
  tax: {
    summary: 'South African tax system for 2025/2026 tax year. Residents taxed on worldwide income, non-residents on SA-source income.',
    brackets: [
      { threshold: 0, rate: 0, notes: 'Tax rebate: R17,235 primary, R9,444 secondary (65+), R3,145 tertiary (75+)' },
      { threshold: 237100, rate: 18 },
      { threshold: 370500, rate: 26 },
      { threshold: 512800, rate: 31 },
      { threshold: 673000, rate: 36 },
      { threshold: 857900, rate: 39 },
      { threshold: 1817000, rate: 41, notes: 'Top marginal rate: 45% for income above R1,817,000' },
    ],
    deductions: [
      'Retirement fund contributions (RA, pension, provident): up to 27.5% of taxable income, max R350,000/year',
      'Medical aid tax credits: R364/month main member, R364 first dependent, R246 each additional dependent',
      'Medical expenses: Excess medical expenses beyond 7.5% of taxable income deductible',
      'Donations to PBOs: up to 10% of taxable income deductible',
      'Home office expenses: If you work from home more than 50% of the time',
      'Travel allowance: Business travel at SARS prescribed rates (R4.98/km for 2025)',
    ],
    cgt: 'Capital Gains Tax: Inclusion rates are 40% for individuals (effective max rate 18%), 80% for companies. Annual exclusion: R40,000 (individuals), R300,000 on primary residence. First R2m gain on primary residence is exempt for deceased estates.',
    dividends: 'Dividends Tax: 20% withholding tax on dividends paid by SA companies. No further tax on dividends in your hands if you're a natural person. Foreign dividends: first R100,000 exempt for SA residents.',
    tfsaRules: 'TFSA: Max R36,000/year contribution. Lifetime limit R500,000. Excess contributions taxed at 40%. No deductions for contributions, but all growth and withdrawals are tax-free. Can withdraw anytime without penalty (unlike RA).',
    tips: [
      'Max your TFSA every year before investing in taxable accounts',
      'Contribute to an RA before March to reduce taxable income',
      'Keep records of all medical expenses exceeding 7.5% of income',
      'Use your annual CGT exclusion (R40,000) by realizing gains each year',
      'Consider an endowment for high-income earners (30% tax rate inside policy)',
      'Donate appreciated shares instead of cash to avoid CGT and get a deduction',
      'Contribute to your spouse\'s retirement fund if they have low income',
    ]
  },

  // ──────────────────────── RETIREMENT ────────────────────────
  retirement: {
    summary: 'Retirement planning involves saving enough to maintain your lifestyle after you stop working. The 4% rule suggests you can withdraw 4% of your savings annually indefinitely.',
    saVehicles: [
      { name: 'Retirement Annuity', pros: 'Tax-deductible contributions, compound growth, protected from creditors', cons: 'Locked in until 55, must buy annuity with 2/3, limited fund choices' },
      { name: 'Pension/Provident Fund', pros: 'Employer contributions, tax-deductible, often has death/disability benefits', cons: 'Tied to employer, may have limited investment choices, rules depend on fund rules' },
      { name: 'Preservation Fund', pros: 'Keeps retirement savings intact when changing jobs, flexible investment choices', cons: 'One withdrawal allowed before retirement, limited to retirement fund transfers' },
      { name: 'Living Annuity', pros: 'Flexible income drawdown (2.5-17.5%), investment choice, capital can grow', cons: 'No guaranteed income, investment risk is yours, high fees can erode capital' },
      { name: 'Life Annuity', pros: 'Guaranteed income for life, no investment risk, spousal benefits', cons: 'No access to capital, inflation risk (unless escalating), no inheritance left' },
      { name: 'TFSA for Retirement', pros: 'Tax-free growth and withdrawals, flexible, no annuity requirement', cons: 'R500k lifetime limit may be insufficient for full retirement' },
    ],
    rules: [
      'Two-pot retirement system: Contributions split into savings (1/3) and retirement (2/3) pots from 2024',
      'Savings pot accessible before retirement (R30,000 minimum withdrawal)',
      'At retirement: up to 1/3 can be taken as cash (taxed at marginal rates), balance must buy annuity',
      'Retirement funds protected from creditors in bankruptcy (up to R300,000)',
      'Compulsory preservation: provident fund members preserving 2/3 from 2024 (for new contributions)',
    ],
    calc: 'Rule of thumb: Save 15% of pre-tax income from age 25 to retire at 65 at 75% income replacement. The younger you start, the less you need to save monthly due to compound interest.',
    saSpecific: 'SA retirement industry regulated by FSCA and governed by Pension Funds Act. Two-pot system effective 1 Sept 2024. Government is considering compulsory preservation for all retirement funds.'
  },

  // ──────────────────────── INSURANCE ────────────────────────
  insurance: {
    summary: 'Insurance protects you and your family against financial loss. Essential coverages in order of priority.',
    types: [
      { name: 'Life Insurance', description: 'Pays a lump sum to beneficiaries on death. Essential if you have dependents. Rule of thumb: cover 10-15x annual income.', saProviders: 'Old Mutual, Sanlam, Liberty, Discovery, Momentum' },
      { name: 'Disability Insurance', description: 'Replaces income if you cannot work due to illness/injury. Covers up to 75% of monthly income. More likely to be disabled than die during working years.' },
      { name: 'Income Protection', description: 'Pays monthly income if unable to work. Can cover temporary or permanent disability. Wait periods: 30 days to 6 months. Benefit periods: 6 months to age 65.' },
      { name: 'Critical Illness Cover', description: 'Lump sum payout on diagnosis of specified illnesses (cancer, heart attack, stroke). Helps cover treatment costs and lifestyle adjustments.' },
      { name: 'Medical Aid', description: 'Required for quality healthcare. SA has hospital plans (basic), comprehensive plans, and medical savings accounts. Gap cover recommended for hospital plans.' },
      { name: 'Short-term Insurance', description: 'Car insurance (comprehensive or third-party), household contents, building insurance. Often required by banks for bonds and vehicle finance.' },
      { name: 'Funeral Cover', description: 'Common in SA. Pays out on death for funeral expenses. Can be expensive relative to cover amount. Often includes family members.' },
    ],
    advice: [
      'Insurance should protect against catastrophic loss, not small expenses (self-insure small risks)',
      'Review insurance needs annually and after major life events (marriage, children, home purchase)',
      'Don\'t over-insure: expensive policies for low-probability events waste money',
      'Consider your medical aid gap cover if on a hospital plan',
      'Funeral cover is often overpriced; consider a small life insurance policy instead',
    ],
    taxInfo: 'Life insurance premiums are not tax-deductible. Payouts are generally tax-free. Disability and income protection premiums: tax-deductible if benefits are taxable.'
  },

  // ──────────────────────── DEBT ────────────────────────
  debt: {
    summary: 'Debt management is crucial for financial health. Not all debt is bad — good debt finances assets that appreciate, bad debt finances consumption.',
    types: [
      { name: 'Good Debt', examples: 'Mortgage/bond (property), student loans, business loans (for viable businesses)', notes: 'These finance assets that grow in value or increase earning potential.' },
      { name: 'Bad Debt', examples: 'Credit card balances, store cards, personal loans for consumption, payday loans', notes: 'High interest, finances depreciating items. Should be paid off as quickly as possible.' },
      { name: 'Neutral Debt', examples: 'Vehicle finance', notes: 'Car depreciates but enables work/life. Keep term short (5 years or less).' },
    ],
    strategies: [
      { name: 'Debt Snowball', description: 'Pay minimum on all debts, put extra money toward the SMALLEST debt first. Psychological wins keep you motivated. Best for those who need momentum.' },
      { name: 'Debt Avalanche', description: 'Pay minimum on all debts, put extra money toward the HIGHEST INTEREST debt first. Mathematically optimal — saves the most on interest.' },
      { name: 'Debt Consolidation', description: 'Combine multiple debts into one loan at lower interest. Simplifies payments. Risk: may extend repayment period and increase total interest.' },
      { name: 'Balance Transfer', description: 'Transfer credit card balance to a card with 0% introductory APR. Useful for paying down high-interest debt faster.' },
    ],
    saRates: 'Current indicative rates (2026): Credit cards 18-21%, Store cards 22-24%, Personal loans 14-20%, Home loans 11-13%, Vehicle finance 12-16%, Payday loans 30%+. Always check the NCR registered lender status.',
    advice: [
      'The 28/36 rule: housing costs <28% of gross income, total debt payments <36%',
      'Credit card: pay off in full every month to avoid interest (55-day interest-free period)',
      'Debt-to-income ratio: keep below 40% (excluding mortgage)',
      'If struggling, contact your bank for debt review or restructure (NCR registered)',
      'Debt review (debt counselling): legal process to restructure debt, protects you from creditors',
    ]
  },

  // ──────────────────────── ESTATE PLANNING ────────────────────────
  estate: {
    summary: 'Estate planning ensures your assets are distributed according to your wishes after death, minimizing taxes and legal complications.',
    elements: [
      { name: 'Will', description: 'Legal document stating how your assets should be distributed. Without a will (intestate), assets distributed according to Intestate Succession Act — may not match your wishes.' },
      { name: 'Trust', description: 'Inter vivos (living) trust or testamentary trust. Can protect assets, reduce estate duty, provide for minors. Costly to set up and maintain.' },
      { name: 'Beneficiary Nominations', description: 'On retirement funds and life insurance. These bypass your will and go directly to named beneficiaries. Should be kept up to date.' },
      { name: 'Power of Attorney', description: 'Authorizes someone to manage your affairs if you become incapacitated. Can be general (broad) or special (limited purpose).' },
      { name: 'Living Will', description: 'Records your wishes about life-prolonging medical treatment if you cannot communicate.' },
      { name: 'Offshore Assets', description: 'Must be declared. SA exchange control regulations apply. Non-residents may have different succession rules.' },
    ],
    estateDuty: 'Estate duty in SA: 20% on first R30M, 25% above R30M. First R3.5M abatement (R7M for married couples). Primary residence not exempt. Section 4A deduction for assets passing to surviving spouse (no estate duty).',
    executor: 'Executor fees in SA: maximum 3.5% of gross estate value plus 6% of income earned during administration. Can negotiate lower. Many choose family members or trust companies.',
    keyConsiderations: [
      'Review your will every 3 years and after major life events',
      'Marriage in community of property: all assets shared 50/50 — affects estate planning significantly',
      'Antenuptial contract: assets kept separate, more flexibility for estate planning',
      'For unmarried partners: no automatic inheritance rights — a will is essential',
      'Minor children: nominate guardians in your will',
    ]
  },

  // ──────────────────────── PROPERTY ────────────────────────
  property: {
    summary: 'Property is a major asset class in SA. Can provide rental income, capital appreciation, and inflation hedge.',
    buying: [
      'Determine budget: purchase price up to 3-4x gross annual income',
      'Deposit: minimum 5-10% for residential, investor loans often require 15-20%',
      'Bond costs: application fee (R5-7k), valuation fee (R2-5k), legal fees (R15-30k)',
      'Transfer duty: R0-R1.1M = 0%, R1.1M-R1.51M = 3%, sliding up to 13% above R11M',
      'Bond registration: 0.5-1% of bond amount',
    ],
    ownership: [
      'Rates and taxes: 0.5-1.5% of municipal value annually',
      'Levies (in complexes): R1,500-5,000+/month depending on estate',
      'Maintenance: budget 1% of property value annually',
      'Insurance: building insurance required (often included in levy in complexes)',
      'Rental income: taxable at marginal rate. Expenses deductible (rates, levies, maintenance, bond interest, agent fees)',
    ],
    investing: [
      'Gross rental yield: monthly rent × 12 / purchase price × 100. Target 8-12% in SA',
      'Net yield: after expenses, rates, levies, vacancies. Target 5-8%',
      'Capital growth: SA property historically 6-10% p.a. in good areas',
      'REITs: listed property on JSE. More liquid, lower entry cost. Current yields 8-12%',
      'Sectional title vs freehold: sectional has levies but less maintenance responsibility',
    ],
    tax: {
      transferDuty: '0% on first R1.1M, 3% on R1.1M-R1.51M, 6% on R1.51M-R2.12M, 8% on R2.12M-R2.72M, 11% on R2.72M-R11M, 13% above R11M (2025/26 rates)',
      cgt: 'Primary residence: first R2M gain exempt. Investment property: full CGT applies at 40% inclusion rate',
      vat: 'New commercial properties may attract VAT at 15% instead of transfer duty. Choose the cheaper option.',
      deductions: 'Bond interest, rates, maintenance, insurance, agent fees, legal costs, depreciation (for rental properties)'
    },
    saSpecific: 'Property transfer process: offer to purchase → bond approval → due diligence → signing → registration (typically 6-12 weeks). Conveyancing attorneys handle the legal transfer. ROE (Registration of Deeds) final step.'
  },

  // ──────────────────────── BUDGETING ────────────────────────
  budgeting: {
    summary: 'A budget is your financial roadmap. It tracks income, expenses, and savings to help you achieve financial goals.',
    methods: [
      { name: '50/30/20 Rule', description: '50% needs (housing, food, transport), 30% wants (entertainment, dining, travel), 20% savings and debt repayment.' },
      { name: 'Zero-Based Budget', description: 'Every rand is assigned a purpose. Income minus expenses equals zero. Requires detailed tracking but maximizes control.' },
      { name: 'Envelope System', description: 'Cash allocated to categories in envelopes. When envelope is empty, no more spending in that category. Good for overspenders.' },
      { name: 'Pay Yourself First', description: 'Save/invest first, then spend what remains. Automate savings on payday. Ensures you meet savings goals before lifestyle inflation.' },
    ],
    tools: 'Budgeting apps: 22Seven (now Old Mutual), YNAB (You Need A Budget), MoneyHub, spreadsheet tracking. Many SA banks offer built-in budgeting in their apps.',
    tips: [
      'Track every expense for 30 days to understand your spending patterns',
      'Review subscriptions monthly — cancel unused services',
      'Set up automatic savings transfers on payday',
      'Use the 24-hour rule for non-essential purchases over R500',
      'Plan meals and grocery shopping to reduce food waste and impulse buys',
      'Negotiate recurring bills (insurance, internet, phone) annually',
    ]
  },

  // ──────────────────────── EDUCATION FUNDING ────────────────────────
  education: {
    summary: 'Education costs in SA have been rising faster than inflation. Planning ahead is essential.',
    saCosts: 'University tuition: R40,000-80,000/year (public universities), R100,000-250,000 (private). School: R30,000-200,000+/year depending on school.',
    vehicles: [
      { name: 'Education Policy', description: 'Endowment policy maturing when child starts tertiary. Tax-efficient (30% rate inside policy). Contributions fixed, guaranteed maturity value.' },
      { name: 'Unit Trust Investment', description: 'Flexible, can choose risk level. No guarantees but potential for higher returns. Can access funds if needed (unlike education policy).' },
      { name: 'TFSA for Children', description: 'Open a TFSA in child\'s name (managed by parent). R36,000/year limit applies. Tax-free growth. Child gets full control at 18.' },
      { name: 'NSA (National Student Aid)', description: 'NSFAS for qualifying students from low-income families. Converted to bursary if student passes. Covers tuition, accommodation, living allowance.' },
    ],
    tips: [
      'Start saving early — compound interest is most powerful over long periods',
      'Consider that education inflation in SA is 5-8% above CPI',
      'An education policy guarantees funds at maturity regardless of market conditions',
      'For younger children (0-8 years), growth assets like equities suit longer time horizon',
      'For teens approaching university, shift to conservative assets to protect capital',
    ]
  },

  // ──────────────────────── OFFSHORE INVESTING ────────────────────────
  offshore: {
    summary: 'Offshore investing provides geographic diversification, access to global markets, and a hedge against ZAR weakness.',
    why: [
      'Diversification: SA is <1% of global market cap by some measures',
      'Currency hedge: ZAR has depreciated ~8-10% p.a. over long term against USD',
      'Access to global companies not listed in SA (Apple, Microsoft, Amazon, Google)',
      'Protection against SA-specific risks (political, economic, regulatory)',
    ],
    how: [
      'SA-linked offshore: buy global ETFs on JSE (Satrix MSCI World, Sygnia Global Equity) — no exchange control needed',
      'Direct offshore: transfer funds abroad via your bank (subject to exchange control — R1M single discretionary allowance, R10M foreign investment allowance per year)',
      'Offshore platform: use SA platforms like EasyEquities USD account, or international brokers like Interactive Brokers',
      'Offshore account: open bank account abroad (requires proof of residence, tax clearance for large amounts)',
    ],
    risks: [
      'Currency risk: ZAR strengthening reduces value of offshore investments in rand terms',
      'Political risk: some jurisdictions may have unstable laws or tax regimes',
      'Regulatory risk: SA exchange controls may change',
      'Tax complexity: foreign income, foreign assets need to be declared to SARS',
      'Platform risk: ensure offshore platforms are reputable and FSCA-approved',
    ],
    tax: 'Foreign assets above R500,000 must be declared. Foreign dividends: first R100,000 exemption. CGT on foreign assets at standard inclusion rates. Be aware of double taxation agreements between SA and other countries.'
  },

  // ──────────────────────── EMERGENCY FUND ────────────────────────
  emergency: {
    summary: 'An emergency fund is cash set aside for unexpected expenses — job loss, medical emergencies, car repairs, home maintenance.',
    recommendations: [
      '3-6 months of essential living expenses',
      'Keep in a separate, accessible savings account (not linked to your debit card)',
      'Use a high-interest savings account or money market fund',
      'Only use for genuine emergencies, not planned expenses',
      'Rebuild the fund after using it',
    ],
    saOptions: 'Best places for emergency fund in SA: Tymebank savings (up to 10%), Money market funds (7-9%), Fixed deposits (8-11% for 6-12 months), Bank savings accounts (2-6% generally lower)'
  },

  // ──────────────────────── FINANCIAL ADVISOR ────────────────────────
  advisor: {
    summary: 'A certified financial advisor helps you create a holistic financial plan. In SA, financial advisors must be FSCA-approved and meet Fit and Proper requirements.',
    types: [
      { name: 'Independent Financial Advisor (IFA)', description: 'Not tied to any product provider. Can recommend products from the whole market. Typically fee-based (advice fee + ongoing fee).' },
      { name: 'Tied Agent', description: 'Works for one company (e.g., Old Mutual, Sanlam). Can only recommend that company\'s products. May have lower upfront costs.' },
      { name: 'Multi-Tied', description: 'Works with a few selected providers. Wider choice than tied but not fully independent.' },
    ],
    fees: [
      'Initial advice fee: 0-3% of investment amount',
      'Ongoing advice fee: 0.5-1% of investment value per year',
      'Commission on insurance products: typically embedded in premiums',
      'Fee-only advisors: charge flat hourly rate or fixed project fee, rebate commissions',
    ],
    questions: [
      'Are you FSCA registered? (Check on FSCA website)',
      'What qualifications do you hold? (CFP, BCom, Postgraduate diploma)',
      'How are you remunerated? (Fees vs commission)',
      'What experience do you have with clients like me?',
      'Can you provide a detailed financial plan before I commit?',
    ],
    redFlags: [
      'Guarantees of unrealistic returns (e.g., "15% guaranteed") — no one can guarantee this',
      'Pressure to make immediate decisions',
      'Unwilling to provide full fee disclosure',
      'Recommending products without understanding your full financial picture',
      'Not FSCA registered — check on FSCA verify portal',
    ]
  },

  // ──────────────────────── BEHAVIORAL FINANCE ────────────────────────
  behavioral: {
    summary: 'Behavioral finance studies how psychological biases affect financial decisions. Understanding these biases can improve investment outcomes.',
    biases: [
      { name: 'Loss Aversion', description: 'Feeling losses twice as intensely as equivalent gains. Leads to holding losers too long and selling winners too early.' },
      { name: 'Confirmation Bias', description: 'Seeking information that confirms existing beliefs while ignoring contradictory evidence. Leads to overconfidence in poor investments.' },
      { name: 'Herding', description: 'Following the crowd into popular investments. Leads to buying high (FOMO) and selling low (panic selling).' },
      { name: 'Anchoring', description: 'Relying too heavily on first information received. E.g., fixating on a stock\'s all-time high when valuing it.' },
      { name: 'Recency Bias', description: 'Overweighting recent events when forecasting. Leads to chasing recent performance.' },
      { name: 'Overconfidence', description: 'Overestimating your knowledge and ability. Leads to excessive trading and under-diversification.' },
      { name: 'Status Quo Bias', description: 'Preferring things to stay the same. Leads to holding inappropriate investments or not starting at all.' },
    ],
    tips: [
      'Write down your investment strategy and stick to it during market turbulence',
      'Set automatic rebalancing to avoid emotional decisions',
      'Limit how often you check your portfolio (quarterly is enough)',
      'Remember that time in the market beats timing the market',
      'Diversify to protect against your own biases affecting any single investment',
    ]
  },

  // ──────────────────────── SA ECONOMY ────────────────────────
  saEconomy: {
    summary: 'South Africa has a GDP of approximately R7 trillion. Key sectors: finance, mining, manufacturing, retail, tourism.',
    keyIndicators: [
      'GDP growth: ~1-2% (2026 est.) — constrained by loadshedding, logistics, structural issues',
      'Inflation: 4.7% (2025) — within SARB target band (3-6%)',
      'Repo rate: 8.25% — SARB uses interest rates to control inflation',
      'Prime lending rate: 11.75% — key benchmark for loans and bonds',
      'Unemployment: 32.1% — one of highest in the world',
      'Rand/USD: ~R18-19/USD — highly volatile, sensitive to global and local events',
      'JSE All Share: ~80,000 points — about 55% financials, 35% resources, 10% industrials',
    ],
    currentEvents: [
      'Government of National Unity (GNU) formed June 2024',
      'Operation Vulindlela: structural reforms in energy, transport, water, digital',
      'Two-pot retirement system implemented September 2024',
      'Energy transition: renewable energy IPPs adding capacity to reduce loadshedding',
      'Inflation targeting continues to anchor expectations',
    ],
    glossary: [
      { term: 'SARB', definition: 'South African Reserve Bank — central bank, sets interest rates' },
      { term: 'FSCA', definition: 'Financial Sector Conduct Authority — regulates financial services' },
      { term: 'JSE', definition: 'Johannesburg Stock Exchange — Africa\'s largest stock exchange' },
      { term: 'NCR', definition: 'National Credit Regulator — oversees credit providers and debt counselling' },
      { term: 'CPI', definition: 'Consumer Price Index — measures inflation' },
      { term: 'GDP', definition: 'Gross Domestic Product — total value of goods and services produced' },
    ]
  },

  // ──────────────────────── FINANCIAL CALCULATORS ────────────────────────
  calculators: {
    compoundInterest: 'A = P(1 + r/n)^(nt). P=principal, r=annual rate, n=compounding frequency, t=years. The Rule of 72: years to double = 72/interest rate. At 10%, money doubles in ~7.2 years.',
    retirement: 'Target retirement savings = annual expenses / safe withdrawal rate (4%). Or target = annual expenses × 25. Example: need R500k/year in retirement? Save R12.5M.',
    affordability: 'Bond repayment calculator: monthly payment = P × (r(1+r)^n)/((1+r)^n-1). General rule: housing costs <30% of gross income.',
    emergencyFund: 'Essential monthly expenses × 6 = target emergency fund. Include: bond/rent, food, utilities, transport, insurance, medical, school fees, minimum debt payments.'
  }
};

module.exports = KNOWLEDGE;
