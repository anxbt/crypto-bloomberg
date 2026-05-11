// Mock data for CryptoDesk Wave 1 visualization

export const MOCK_CONTEXTS = {
  BTC: { type: 'currency', id: 'btc', label: 'Bitcoin', ticker: 'BTC' },
  ETH: { type: 'currency', id: 'eth', label: 'Ethereum', ticker: 'ETH' },
  SOL: { type: 'currency', id: 'sol', label: 'Solana', ticker: 'SOL' },
  CPI: { type: 'macro', id: 'cpi', label: 'CPI', ticker: 'CPI' },
  FOMC: { type: 'macro', id: 'fomc', label: 'FOMC', ticker: 'FOMC' },
  NFP: { type: 'macro', id: 'nfp', label: 'NFP', ticker: 'NFP' },
  MSTR: { type: 'stock', id: 'mstr', label: 'MicroStrategy', ticker: 'MSTR' },
  COIN: { type: 'stock', id: 'coin', label: 'Coinbase', ticker: 'COIN' },
  MARA: { type: 'stock', id: 'mara', label: 'Marathon Digital', ticker: 'MARA' },
  MAG7: { type: 'index', id: 'ssimag7', label: 'SSI MAG7', ticker: 'MAG7' },
  LAYER1: { type: 'index', id: 'ssilayer1', label: 'SSI Layer1', ticker: 'LAYER1' },
}

export const SEARCH_SUGGESTIONS = ['BTC', 'ETH', 'SOL', 'CPI', 'FOMC', 'MSTR', 'COIN', 'MAG7', 'LAYER1']

// ─── Currency Context: BTC ───────────────────────────────────────────────────

export const BTC_KLINES = [
  { date: 'Apr 25', price: 92400, etfFlow: 312 },
  { date: 'Apr 26', price: 93800, etfFlow: -89 },
  { date: 'Apr 27', price: 95100, etfFlow: 445 },
  { date: 'Apr 28', price: 94200, etfFlow: 210 },
  { date: 'Apr 29', price: 96700, etfFlow: 680 },
  { date: 'Apr 30', price: 97300, etfFlow: 320 },
  { date: 'May 1', price: 96100, etfFlow: -150 },
  { date: 'May 2', price: 98200, etfFlow: 520 },
  { date: 'May 3', price: 97400, etfFlow: 180 },
  { date: 'May 4', price: 99800, etfFlow: 890 },
  { date: 'May 5', price: 101200, etfFlow: 1200 },
  { date: 'May 6', price: 103400, etfFlow: 750 },
  { date: 'May 7', price: 102100, etfFlow: -220 },
  { date: 'May 8', price: 104600, etfFlow: 930 },
  { date: 'May 9', price: 103800, etfFlow: 410 },
  { date: 'May 10', price: 105200, etfFlow: 1100 },
  { date: 'May 11', price: 104100, etfFlow: 540 },
]

export const MACRO_EVENTS_ON_CHART = [
  { date: 'May 2', label: 'FOMC', type: 'neutral' },
  { date: 'May 10', label: 'CPI', type: 'positive' },
]

export const BTC_SNAPSHOT = {
  price: 104100,
  change24h: +2.34,
  changeAmt: +2384,
  high24h: 105600,
  low24h: 102800,
  volume24h: '28.4B',
  marketCap: '2.06T',
  ath: 108200,
  athDistance: -3.8,
  dominance: 54.2,
  etfAum: '118.4B',
  etfNetInflow7d: '+4.82B',
}

export const BTC_NEWS = [
  {
    id: 1,
    category: 'news',
    title: 'BlackRock IBIT sees record $1.2B single-day inflow as institutions accelerate BTC allocation',
    source: 'SoSoValue',
    time: '12m ago',
    sentiment: 'positive',
    tags: ['ETF', 'Institutional'],
  },
  {
    id: 2,
    category: 'research',
    title: 'On-chain analysis: Long-term holder supply at 6-month high — distribution cycle not yet begun',
    source: 'CryptoQuant',
    time: '34m ago',
    sentiment: 'positive',
    tags: ['On-chain', 'LTH'],
  },
  {
    id: 3,
    category: 'news',
    title: 'US CPI comes in at 3.1% vs 3.3% forecast — Bitcoin surges 4.2% in 1h following print',
    source: 'Reuters',
    time: '1h ago',
    sentiment: 'positive',
    tags: ['Macro', 'CPI'],
  },
  {
    id: 4,
    category: 'kol',
    title: '@woonomic: "Realized price for short-term holders just crossed $98K. This level is now support."',
    source: 'Twitter/X',
    time: '2h ago',
    sentiment: 'positive',
    tags: ['Analysis'],
  },
  {
    id: 5,
    category: 'news',
    title: 'MicroStrategy buys additional 11,000 BTC at average price $101,400 — total holdings now 225,000 BTC',
    source: 'SoSoValue',
    time: '3h ago',
    sentiment: 'positive',
    tags: ['Treasury', 'MSTR'],
  },
  {
    id: 6,
    category: 'research',
    title: 'Glassnode: Exchange reserves at 5-year low as accumulation trend persists across all cohorts',
    source: 'Glassnode',
    time: '4h ago',
    sentiment: 'positive',
    tags: ['On-chain'],
  },
  {
    id: 7,
    category: 'announcement',
    title: 'Franklin Templeton files for Bitcoin ETF options — SEC review period begins',
    source: 'SEC EDGAR',
    time: '5h ago',
    sentiment: 'neutral',
    tags: ['ETF', 'Regulatory'],
  },
  {
    id: 8,
    category: 'kol',
    title: '@RaoulGMI: "The macro setup for Q2 is historically bullish for risk assets. Liquidity cycle turning."',
    source: 'Twitter/X',
    time: '6h ago',
    sentiment: 'positive',
    tags: ['Macro'],
  },
]

export const BTC_AI_BRIEF =
  'BTC at $104,100 with ETF inflows accelerating (+$1.2B today). CPI beat at 3.1% vs 3.3% forecast confirms disinflationary trend — BTC averages +6.8% in 72h following CPI downside surprise. LTH supply at 6-month high with exchange reserves at 5-year low signals structural supply squeeze.'

export const BTC_SCENARIOS = [
  {
    type: 'bull',
    title: 'Bull Case',
    target: '$112,000',
    trigger: 'ETF inflows sustain >$800M/day + CPI trend continues',
    probability: 64,
  },
  {
    type: 'bear',
    title: 'Bear Case',
    target: '$96,500',
    trigger: 'FOMC hawkish surprise + ETF outflow rotation',
    probability: 36,
  },
]

// ─── Macro Context: CPI ──────────────────────────────────────────────────────

export const CPI_HISTORY = [
  { date: 'May 24', actual: 3.3, forecast: 3.4, btcReaction: -2.1 },
  { date: 'Jun 24', actual: 3.0, forecast: 3.1, btcReaction: +3.8 },
  { date: 'Jul 24', actual: 2.9, forecast: 3.0, btcReaction: +4.2 },
  { date: 'Aug 24', actual: 2.5, forecast: 2.6, btcReaction: +5.1 },
  { date: 'Sep 24', actual: 2.4, forecast: 2.5, btcReaction: +2.9 },
  { date: 'Oct 24', actual: 2.6, forecast: 2.5, btcReaction: -1.4 },
  { date: 'Nov 24', actual: 2.7, forecast: 2.7, btcReaction: +0.3 },
  { date: 'Dec 24', actual: 2.9, forecast: 2.8, btcReaction: -2.8 },
  { date: 'Jan 25', actual: 3.0, forecast: 2.9, btcReaction: -3.1 },
  { date: 'Feb 25', actual: 2.8, forecast: 2.9, btcReaction: +4.6 },
  { date: 'Mar 25', actual: 2.6, forecast: 2.8, btcReaction: +6.2 },
  { date: 'Apr 25', actual: 3.1, forecast: 3.3, btcReaction: +4.2 },
]

export const CPI_SNAPSHOT = {
  event: 'US CPI (YoY)',
  lastActual: '3.1%',
  lastForecast: '3.3%',
  lastDate: 'May 10, 2025',
  nextDate: 'Jun 11, 2025',
  daysToNext: 31,
  btcPattern: 'Beat (8/12): avg +3.8% in 24h. Miss (4/12): avg -2.4% in 24h.',
}

export const CPI_NEWS = [
  {
    id: 1,
    category: 'news',
    title: 'April CPI 3.1% vs 3.3% est — third consecutive downside surprise signals disinflation regime',
    source: 'Reuters',
    time: '1h ago',
    sentiment: 'positive',
    tags: ['CPI', 'Macro'],
  },
  {
    id: 2,
    category: 'research',
    title: 'Fed Watch: Odds of June rate cut jump to 68% following cooler-than-expected CPI print',
    source: 'CME FedWatch',
    time: '2h ago',
    sentiment: 'positive',
    tags: ['Fed', 'Rate Cut'],
  },
  {
    id: 3,
    category: 'kol',
    title: '@MacroAlf: "This CPI print changes everything. Fed is on track for 2 cuts in 2025."',
    source: 'Twitter/X',
    time: '3h ago',
    sentiment: 'positive',
    tags: ['Analysis'],
  },
  {
    id: 4,
    category: 'news',
    title: 'BTC surges 4.2% in 1 hour following CPI miss — pattern consistent with last 3 downside surprises',
    source: 'CoinDesk',
    time: '1h ago',
    sentiment: 'positive',
    tags: ['BTC', 'Reaction'],
  },
]

// ─── Stock Context: MSTR ─────────────────────────────────────────────────────

export const MSTR_KLINES = [
  { date: 'May 5', price: 328, btcHoldings: 214400 },
  { date: 'May 6', price: 341, btcHoldings: 214400 },
  { date: 'May 7', price: 338, btcHoldings: 214400 },
  { date: 'May 8', price: 355, btcHoldings: 225400 },
  { date: 'May 9', price: 362, btcHoldings: 225400 },
  { date: 'May 10', price: 371, btcHoldings: 225400 },
  { date: 'May 11', price: 368, btcHoldings: 225400 },
]

export const MSTR_SNAPSHOT = {
  price: 368.40,
  change24h: -0.70,
  btcHoldings: 225400,
  avgCostBasis: 62200,
  unrealizedGain: '+67.3%',
  treasuryValue: '23.48B',
  marketCap: '71.2B',
  peRatio: 142,
  pbRatio: 18.4,
  mNAV: '3.04x',
}

export const MSTR_NEWS = [
  {
    id: 1,
    category: 'news',
    title: 'MicroStrategy purchases 11,000 BTC at $101,400 avg — 8th purchase in 2025, total now 225,400 BTC',
    source: 'SoSoValue',
    time: '3h ago',
    sentiment: 'positive',
    tags: ['Treasury', 'BTC'],
  },
  {
    id: 2,
    category: 'research',
    title: 'MicroStrategy mNAV premium compresses to 3.04x — still 40% above the 3-year historical average',
    source: 'BitMEX Research',
    time: '5h ago',
    sentiment: 'neutral',
    tags: ['Valuation', 'mNAV'],
  },
  {
    id: 3,
    category: 'news',
    title: 'MSTR added to S&P 500 watchlist — inclusion would trigger $2.4B in passive fund buying',
    source: 'Bloomberg',
    time: '8h ago',
    sentiment: 'positive',
    tags: ['S&P500', 'Passive'],
  },
]

export const MSTR_AI_BRIEF =
  'MSTR holds 225,400 BTC at avg cost $62,200. At BTC $104,100, the treasury carries a 67.3% unrealized gain worth $23.5B. mNAV premium of 3.04x is elevated vs historical 2.2x avg — dilution risk rises if premium compresses. BTC-MSTR 30d correlation: 0.94.'

// ─── Index Context: MAG7 ─────────────────────────────────────────────────────

export const MAG7_KLINES = [
  { date: 'May 5', price: 142.30 },
  { date: 'May 6', price: 145.80 },
  { date: 'May 7', price: 144.20 },
  { date: 'May 8', price: 148.90 },
  { date: 'May 9', price: 151.40 },
  { date: 'May 10', price: 153.60 },
  { date: 'May 11', price: 152.10 },
]

export const MAG7_CONSTITUENTS = [
  { ticker: 'BTC', weight: 35.2, change24h: +2.34, name: 'Bitcoin' },
  { ticker: 'ETH', weight: 22.1, change24h: +1.87, name: 'Ethereum' },
  { ticker: 'SOL', weight: 14.8, change24h: +3.12, name: 'Solana' },
  { ticker: 'BNB', weight: 10.3, change24h: +0.94, name: 'BNB' },
  { ticker: 'XRP', weight: 8.6, change24h: -0.43, name: 'XRP' },
  { ticker: 'ADA', weight: 5.2, change24h: +1.23, name: 'Cardano' },
  { ticker: 'AVAX', weight: 3.8, change24h: +2.01, name: 'Avalanche' },
]

export const MAG7_SNAPSHOT = {
  price: 152.10,
  change24h: +0.99,
  roi1m: +18.4,
  roi3m: +42.7,
  roi1y: +128.3,
  aum: '2.18T',
  constituents: 7,
}

export const MAG7_AI_BRIEF =
  'SSI MAG7 +0.99% today with BTC (+2.34%) and SOL (+3.12%) leading. The index returned 42.7% over 3 months, outperforming S&P 500 by 38.2pp. Top rebalancing opportunity: SOL is 0.8pp overweight vs target — trim SOL, add XRP to realign with target weights.'

// ─── Context resolver ────────────────────────────────────────────────────────

export function getMockDataForContext(context) {
  if (!context) return { type: 'idle' }

  switch (context.type) {
    case 'currency':
      return {
        type: 'currency',
        id: context.id,
        ticker: context.ticker || context.id.toUpperCase(),
        label: context.label || context.id.toUpperCase(),
        snapshot: BTC_SNAPSHOT,
        klines: BTC_KLINES,
        news: BTC_NEWS,
        aibrief: BTC_AI_BRIEF,
        scenarios: BTC_SCENARIOS,
        macroEvents: MACRO_EVENTS_ON_CHART,
      }
    case 'macro':
      return {
        type: 'macro',
        id: context.id,
        ticker: context.ticker || context.id.toUpperCase(),
        label: context.label || context.id.toUpperCase(),
        snapshot: CPI_SNAPSHOT,
        history: CPI_HISTORY,
        news: CPI_NEWS,
      }
    case 'stock':
      return {
        type: 'stock',
        id: context.id,
        ticker: context.ticker || context.id.toUpperCase(),
        label: context.label || context.id.toUpperCase(),
        snapshot: MSTR_SNAPSHOT,
        klines: MSTR_KLINES,
        news: MSTR_NEWS,
        aibrief: MSTR_AI_BRIEF,
      }
    case 'index':
      return {
        type: 'index',
        id: context.id,
        ticker: context.ticker || context.id.toUpperCase(),
        label: context.label || context.id.toUpperCase(),
        snapshot: MAG7_SNAPSHOT,
        klines: MAG7_KLINES,
        constituents: MAG7_CONSTITUENTS,
        aibrief: MAG7_AI_BRIEF,
      }
    default:
      return { type: 'idle' }
  }
}

export function resolveQuery(query) {
  const q = query.trim().toUpperCase()
  if (MOCK_CONTEXTS[q]) return MOCK_CONTEXTS[q]
  if (q === 'BITCOIN') return MOCK_CONTEXTS.BTC
  if (q === 'ETHEREUM') return MOCK_CONTEXTS.ETH
  if (q === 'SOLANA') return MOCK_CONTEXTS.SOL
  if (q === 'MICROSTRATEGY') return MOCK_CONTEXTS.MSTR
  return { type: 'currency', id: q.toLowerCase(), label: q, ticker: q }
}
