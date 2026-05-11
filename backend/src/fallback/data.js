// Rich mock data returned when SOSOVALUE_API_KEY / OPENROUTER_API_KEY are not set.
// Shapes match what the frontend expects from each route.

const NEWS_ITEMS = [
  { id: 1, title: 'BlackRock IBIT sees $620M single-day ETF inflow — largest in 30 days', source: 'SoSoValue', time: '2h ago', sentiment: 'positive', category: 'news' },
  { id: 2, title: 'CPI came in at 3.4% YoY — 10bps below forecast, BTC surges 4% in 1h', source: 'CoinDesk', time: '4h ago', sentiment: 'positive', category: 'news' },
  { id: 3, title: 'MicroStrategy acquires 3,000 more BTC at $98,200 average — total 217K BTC', source: 'Reuters', time: '6h ago', sentiment: 'positive', category: 'news' },
  { id: 4, title: 'Fed holds rates at 5.25–5.50% — markets price 2 cuts in H2 2025', source: 'Bloomberg', time: '8h ago', sentiment: 'neutral', category: 'news' },
  { id: 5, title: 'Spot BTC ETF AUM crosses $127B — on pace for $150B by Q3', source: 'SoSoValue', time: '10h ago', sentiment: 'positive', category: 'research' },
  { id: 6, title: 'Ethereum ETFs record first positive 7-day net inflow streak since launch', source: 'TheBlock', time: '12h ago', sentiment: 'positive', category: 'news' },
  { id: 7, title: 'BTC ATH distance narrows to 3.8% — analysts target $112K by June', source: 'CryptoSlate', time: '14h ago', sentiment: 'positive', category: 'research' },
  { id: 8, title: 'COIN reports record Q1 revenue of $2.3B — crypto equities rally', source: 'CNBC', time: '16h ago', sentiment: 'positive', category: 'news' },
]

const MACRO_NEWS = [
  { id: 1, title: 'CPI March 2025: 3.4% actual vs 3.5% forecast — 10bps beat', source: 'BLS', time: '2h ago', sentiment: 'positive', category: 'news' },
  { id: 2, title: 'Core CPI ex-food energy: 3.8% — in line with expectations', source: 'Reuters', time: '3h ago', sentiment: 'neutral', category: 'news' },
  { id: 3, title: 'Fed officials signal patience; no rate cut before September 2025', source: 'WSJ', time: '5h ago', sentiment: 'neutral', category: 'news' },
  { id: 4, title: 'BTC jumps 4.2% in 1h post-CPI print — institutional buying confirmed', source: 'SoSoValue', time: '2h ago', sentiment: 'positive', category: 'news' },
]

const STOCK_NEWS = [
  { id: 1, title: 'MicroStrategy Q1 2025: Revenue $115M, BTC yield +13.7% YTD', source: 'SEC Filing', time: '3h ago', sentiment: 'positive', category: 'news' },
  { id: 2, title: 'MSTR acquires 3,000 BTC — raises $800M via ATM equity offering', source: 'Bloomberg', time: '6h ago', sentiment: 'positive', category: 'news' },
  { id: 3, title: 'Analyst: MSTR mNAV at 2.8x — discount to peers suggests accumulation zone', source: 'Bernstein', time: '8h ago', sentiment: 'neutral', category: 'research' },
  { id: 4, title: 'MSTR 30-day BTC correlation at 0.94 — highest since 2021', source: 'SoSoValue', time: '1d ago', sentiment: 'neutral', category: 'research' },
]

const INDEX_NEWS = [
  { id: 1, title: 'MAG7 Index up 18.4% in April — BTC and ETH lead constituent gains', source: 'SoSoValue', time: '2h ago', sentiment: 'positive', category: 'news' },
  { id: 2, title: 'SSI rebalancing: BNB weight increases 2.3% in May revision', source: 'SoSoValue', time: '1d ago', sentiment: 'neutral', category: 'research' },
  { id: 3, title: 'MAG7 vs S&P500: 3-month return spread widens to 28% in crypto favor', source: 'Bloomberg', time: '2d ago', sentiment: 'positive', category: 'research' },
]

const BTC_KLINES = [
  { date: 'Apr 25', price: 94200, etfFlow: 480 },
  { date: 'Apr 26', price: 95800, etfFlow: 620 },
  { date: 'Apr 27', price: 96100, etfFlow: -120 },
  { date: 'Apr 28', price: 98400, etfFlow: 890 },
  { date: 'Apr 29', price: 97200, etfFlow: 340 },
  { date: 'Apr 30', price: 99600, etfFlow: 1100 },
  { date: 'May 01', price: 101400, etfFlow: 760 },
  { date: 'May 02', price: 100200, etfFlow: -80 },
  { date: 'May 03', price: 102100, etfFlow: 920 },
  { date: 'May 04', price: 103800, etfFlow: 1340 },
  { date: 'May 05', price: 102600, etfFlow: -200 },
  { date: 'May 06', price: 101900, etfFlow: 410 },
  { date: 'May 07', price: 103200, etfFlow: 670 },
  { date: 'May 08', price: 104800, etfFlow: 580 },
  { date: 'May 09', price: 103600, etfFlow: -90 },
  { date: 'May 10', price: 104100, etfFlow: 620 },
  { date: 'May 11', price: 104100, etfFlow: 620 },
]

const BTC_MACRO_EVENTS = [
  { date: 'Apr 10', label: 'CPI' },
  { date: 'Apr 30', label: 'FOMC' },
  { date: 'May 02', label: 'NFP' },
]

const BTC_SCENARIOS = [
  { type: 'bull', title: 'Bull Case', probability: 65, target: '$118,000', trigger: 'CPI beat + ETF inflow > $1B/day sustains above $105K breakout' },
  { type: 'bear', title: 'Bear Case', probability: 35, target: '$92,000', trigger: 'CPI miss > 0.2% or Fed hawkish surprise triggers profit-taking below $100K' },
]

const CPI_HISTORY = [
  { date: 'May 24', actual: 3.3, forecast: 3.4, btcReaction: 4.2 },
  { date: 'Jun 24', actual: 3.0, forecast: 3.1, btcReaction: 2.8 },
  { date: 'Jul 24', actual: 2.9, forecast: 3.0, btcReaction: 3.1 },
  { date: 'Aug 24', actual: 2.5, forecast: 2.6, btcReaction: -0.8 },
  { date: 'Sep 24', actual: 2.4, forecast: 2.3, btcReaction: -2.1 },
  { date: 'Oct 24', actual: 2.6, forecast: 2.5, btcReaction: -1.4 },
  { date: 'Nov 24', actual: 2.7, forecast: 2.7, btcReaction: 0.4 },
  { date: 'Dec 24', actual: 2.9, forecast: 2.8, btcReaction: -0.9 },
  { date: 'Jan 25', actual: 3.0, forecast: 2.9, btcReaction: -3.2 },
  { date: 'Feb 25', actual: 2.8, forecast: 3.0, btcReaction: 5.1 },
  { date: 'Mar 25', actual: 3.2, forecast: 3.3, btcReaction: 3.8 },
  { date: 'Apr 25', actual: 3.4, forecast: 3.5, btcReaction: 4.2 },
]

const MSTR_KLINES = [
  { date: 'Apr 25', price: 385.2, btcHoldings: 211000 },
  { date: 'Apr 26', price: 392.4, btcHoldings: 211000 },
  { date: 'Apr 27', price: 388.1, btcHoldings: 211000 },
  { date: 'Apr 28', price: 401.6, btcHoldings: 214400 },
  { date: 'Apr 29', price: 398.9, btcHoldings: 214400 },
  { date: 'Apr 30', price: 408.3, btcHoldings: 214400 },
  { date: 'May 01', price: 415.7, btcHoldings: 214400 },
  { date: 'May 02', price: 411.2, btcHoldings: 214400 },
  { date: 'May 03', price: 418.9, btcHoldings: 214400 },
  { date: 'May 04', price: 424.1, btcHoldings: 217400 },
  { date: 'May 05', price: 419.8, btcHoldings: 217400 },
  { date: 'May 06', price: 416.3, btcHoldings: 217400 },
  { date: 'May 07', price: 419.5, btcHoldings: 217400 },
  { date: 'May 08', price: 423.8, btcHoldings: 217400 },
  { date: 'May 09', price: 420.1, btcHoldings: 217400 },
  { date: 'May 10', price: 421.5, btcHoldings: 217400 },
  { date: 'May 11', price: 421.5, btcHoldings: 217400 },
]

const MAG7_KLINES = [
  { date: 'Apr 25', price: 121.4 },
  { date: 'Apr 26', price: 124.8 },
  { date: 'Apr 27', price: 123.2 },
  { date: 'Apr 28', price: 128.6 },
  { date: 'Apr 29', price: 127.1 },
  { date: 'Apr 30', price: 131.4 },
  { date: 'May 01', price: 133.9 },
  { date: 'May 02', price: 132.1 },
  { date: 'May 03', price: 135.8 },
  { date: 'May 04', price: 138.4 },
  { date: 'May 05', price: 137.2 },
  { date: 'May 06', price: 136.8 },
  { date: 'May 07', price: 138.9 },
  { date: 'May 08', price: 141.2 },
  { date: 'May 09', price: 140.6 },
  { date: 'May 10', price: 142.8 },
  { date: 'May 11', price: 142.8 },
]

const MAG7_CONSTITUENTS = [
  { ticker: 'BTC', name: 'Bitcoin', weight: 42.5, change24h: 2.34 },
  { ticker: 'ETH', name: 'Ethereum', weight: 24.3, change24h: 1.87 },
  { ticker: 'BNB', name: 'BNB', weight: 11.2, change24h: 0.95 },
  { ticker: 'SOL', name: 'Solana', weight: 10.8, change24h: 3.42 },
  { ticker: 'XRP', name: 'XRP', weight: 5.6, change24h: -0.28 },
  { ticker: 'ADA', name: 'Cardano', weight: 3.2, change24h: 1.15 },
  { ticker: 'AVAX', name: 'Avalanche', weight: 2.4, change24h: 2.67 },
]

module.exports = {
  NEWS_ITEMS,
  MACRO_NEWS,
  STOCK_NEWS,
  INDEX_NEWS,
  BTC_KLINES,
  BTC_MACRO_EVENTS,
  BTC_SCENARIOS,
  CPI_HISTORY,
  MSTR_KLINES,
  MAG7_KLINES,
  MAG7_CONSTITUENTS,
}
