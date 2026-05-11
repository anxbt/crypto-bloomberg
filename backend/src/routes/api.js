const express = require('express')
const router = express.Router()
const crypto = require('crypto')

const cache = require('../cache')
const soso = require('../services/sosovalue')
const binance = require('../services/binance')
const openrouter = require('../services/openrouter')
const sodex = require('../services/sodex')
const fb = require('../fallback/data')

const TTL = {
  NEWS: 2 * 60 * 1000,
  MACRO_HISTORY: 60 * 60 * 1000,
  MACRO_CALENDAR: 5 * 60 * 1000,
  ETF: 5 * 60 * 1000,
  CURRENCY: 30 * 1000,
  INDEX: 60 * 1000,
  STOCK: 5 * 60 * 1000,
  AI: 10 * 60 * 1000,
  SODEX: 5 * 1000,
}

function cached(key, ttl, fn) {
  const hit = cache.get(key)
  if (hit) return Promise.resolve(hit)
  return fn().then((data) => {
    cache.set(key, data, ttl)
    return data
  })
}

// Extracts an array from any SoSoValue response shape
function extractItems(value) {
  if (!value) return []
  if (Array.isArray(value.data?.items)) return value.data.items
  if (Array.isArray(value.data?.list))  return value.data.list
  if (Array.isArray(value.data))        return value.data
  if (Array.isArray(value.items))       return value.items
  if (Array.isArray(value.list))        return value.list
  return []
}

// Normalizes a raw SoSoValue market-snapshot to expected frontend field names.
// Returns null if the response doesn't contain a recognizable price field.
function normalizeSnap(raw) {
  if (!raw || typeof raw !== 'object') return null
  const price = raw.price ?? raw.currentPrice ?? raw.priceUsd ?? raw.last_price
  if (price == null) return null
  return {
    price,
    change24h:      raw.change24h ?? raw.change_24h ?? raw.changePercent24h ?? raw.price_change_percent_24h ?? 0,
    changeAmt:      raw.changeAmt ?? raw.changeAmount ?? raw.priceChange24h ?? raw.price_change_24h ?? null,
    high24h:        raw.high24h ?? raw.high_24h ?? raw.high ?? null,
    low24h:         raw.low24h  ?? raw.low_24h  ?? raw.low  ?? null,
    volume24h:      raw.volume24h ?? raw.volume_24h ?? raw.totalVolume ?? raw.volume ?? null,
    marketCap:      raw.marketCap ?? raw.market_cap ?? raw.marketCapUsd ?? null,
    dominance:      raw.dominance ?? raw.btcDominance ?? raw.btc_dominance ?? null,
    athDistance:    raw.athDistance ?? raw.ath_change_percentage ?? raw.ath_distance ?? null,
    etfAum:         raw.etfAum ?? raw.etf_aum ?? null,
    etfNetInflow7d: raw.etfNetInflow7d ?? raw.etf_net_inflow_7d ?? raw.etfNetFlow7d ?? null,
  }
}

// ─── /api/search ─────────────────────────────────────────────────────────────
router.get('/search', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase()
  if (!q) return res.json({ type: 'currency', id: 'btc' })

  const SSI = ['mag7', 'layer1', 'defi', 'layer2', 'web3', 'gamers', 'meme']
  const STOCKS = ['mstr', 'coin', 'mara', 'riot', 'clsk', 'hut', 'smlr']
  const MACRO = ['cpi', 'fomc', 'nfp', 'pce', 'gdp', 'ppi', 'jobs', 'nonfarm', 'payrolls', 'fed', 'inflation']

  if (SSI.includes(q)) return res.json({ type: 'index', id: q.toUpperCase() })
  if (STOCKS.includes(q)) return res.json({ type: 'stock', id: q.toUpperCase() })
  if (MACRO.some((k) => q.includes(k))) return res.json({ type: 'macro', id: q.toUpperCase() })
  return res.json({ type: 'currency', id: q.toUpperCase() })
})

// ─── /api/news ───────────────────────────────────────────────────────────────
router.get('/news', async (req, res) => {
  const { currency_id, keyword, category } = req.query
  const cacheKey = `news:${currency_id || ''}:${keyword || ''}:${category || ''}`

  try {
    const data = await cached(cacheKey, TTL.NEWS, async () => {
      if (!soso.hasKey()) return fallbackNews(keyword, category)

      const calls = [soso.call('/news/hot')]
      if (currency_id) calls.push(soso.call('/news', { currency_id }))
      if (keyword) calls.push(soso.call('/news/search', { keyword }))
      if (category) calls.push(soso.call('/news', { category }))

      const results = await Promise.allSettled(calls)
      const items = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => extractItems(r.value))

      // Dedup by title (id may be absent in SoSoValue responses)
      const seen = new Set()
      return { items: items.filter((n) => {
        const key = n.id ?? n.title ?? Math.random()
        return seen.has(key) ? false : seen.add(key)
      }) }
    })
    res.json(data)
  } catch {
    res.json(fallbackNews(keyword, category))
  }
})

function fallbackNews(keyword, category) {
  if (keyword && ['cpi', 'fomc', 'nfp'].some((k) => keyword.toLowerCase().includes(k))) {
    return { items: fb.MACRO_NEWS, source: 'mock' }
  }
  if (category === '13') return { items: fb.STOCK_NEWS, source: 'mock' }
  return { items: fb.NEWS_ITEMS, source: 'mock' }
}

// ─── /api/currency/:id ───────────────────────────────────────────────────────
router.get('/currency/:id', async (req, res) => {
  const id = req.params.id.toLowerCase()
  const cacheKey = `currency:${id}`

  try {
    const data = await cached(cacheKey, TTL.CURRENCY, async () => {
      if (!soso.hasKey()) return fallbackCurrency(id)

      const [snapshot, klines] = await Promise.allSettled([
        soso.call(`/currencies/${id}/market-snapshot`),
        soso.call(`/currencies/${id}/klines`, { interval: '1d', limit: 17 }),
      ])

      const rawSnap = snapshot.value?.data || snapshot.value
      const snap = normalizeSnap(rawSnap)
      if (!snap) return fallbackCurrency(id)  // unknown API format

      return {
        snapshot: snap,
        klines: extractItems(klines.value) || fb.BTC_KLINES,
        macroEvents: fb.BTC_MACRO_EVENTS,
        scenarios: fb.BTC_SCENARIOS,
        ticker: id.toUpperCase(),
        source: 'live',
      }
    })
    res.json(data)
  } catch {
    res.json(fallbackCurrency(id))
  }
})

function fallbackCurrency(id) {
  return {
    snapshot: {
      price: 104100,
      change24h: 2.34,
      changeAmt: 2385,
      high24h: 106200,
      low24h: 101800,
      volume24h: '4.2B',
      marketCap: '2.06T',
      dominance: 61.4,
      athDistance: -3.8,
      etfAum: '127.8B',
      etfNetInflow7d: '+$1.2B',
    },
    klines: fb.BTC_KLINES,
    macroEvents: fb.BTC_MACRO_EVENTS,
    scenarios: fb.BTC_SCENARIOS,
    ticker: id.toUpperCase(),
    source: 'mock',
  }
}

// ─── /api/etf ────────────────────────────────────────────────────────────────
router.get('/etf', async (req, res) => {
  const { type = 'BTC', region = 'US' } = req.query
  const cacheKey = `etf:${type}:${region}`

  try {
    const data = await cached(cacheKey, TTL.ETF, async () => {
      if (!soso.hasKey()) {
        return { history: fb.BTC_KLINES.map((k) => ({ date: k.date, netInflow: k.etfFlow })), source: 'mock' }
      }
      const [history, snapshot] = await Promise.allSettled([
        soso.call('/etfs/summary-history', { type, region }),
        soso.call('/etfs/market-snapshot', { type, region }),
      ])
      return { history: history.value?.data || [], snapshot: snapshot.value?.data || {}, source: 'live' }
    })
    res.json(data)
  } catch {
    res.json({ history: fb.BTC_KLINES.map((k) => ({ date: k.date, netInflow: k.etfFlow })), source: 'mock' })
  }
})

// ─── /api/macro ──────────────────────────────────────────────────────────────
router.get('/macro', async (req, res) => {
  const event = (req.query.event || 'CPI').toUpperCase()
  const cacheKey = `macro:${event}`

  try {
    const data = await cached(cacheKey, TTL.MACRO_CALENDAR, async () => {
      if (!soso.hasKey()) return fallbackMacro(event)

      const [events, history, btcKlines] = await Promise.allSettled([
        soso.call('/macro/events'),
        soso.call(`/macro/events/${encodeURIComponent(event)}/history`),
        binance.klines('BTCUSDT', '1h', 24),
      ])

      const calendar = events.value?.data || events.value || []
      const eventRecord = calendar.find((e) => e.name?.toUpperCase().includes(event)) || {}

      return {
        snapshot: {
          event: eventRecord.name || event,
          lastActual: eventRecord.lastActual || '3.4%',
          lastForecast: eventRecord.lastForecast || '3.5%',
          lastDate: eventRecord.lastDate || 'Apr 10',
          nextDate: eventRecord.nextDate || 'May 15',
          daysToNext: eventRecord.daysToNext ?? 4,
        },
        history: history.value?.data || history.value || fb.CPI_HISTORY,
        btcKlines: btcKlines.value || [],
        source: 'live',
      }
    })
    res.json(data)
  } catch {
    res.json(fallbackMacro(event))
  }
})

function fallbackMacro(event) {
  const MAP = {
    CPI: { event: 'CPI (YoY)', lastActual: '3.4%', lastForecast: '3.5%', lastDate: 'Apr 10', nextDate: 'May 15', daysToNext: 4 },
    FOMC: { event: 'FOMC Rate Decision', lastActual: '5.25–5.50%', lastForecast: '5.25–5.50%', lastDate: 'May 1', nextDate: 'Jun 12', daysToNext: 32 },
    NFP: { event: 'Nonfarm Payrolls', lastActual: '303K', lastForecast: '214K', lastDate: 'Apr 5', nextDate: 'May 3', daysToNext: 0 },
  }
  return { snapshot: MAP[event] || MAP.CPI, history: fb.CPI_HISTORY, btcKlines: [], source: 'mock' }
}

// ─── /api/stock/:ticker ──────────────────────────────────────────────────────
router.get('/stock/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const cacheKey = `stock:${ticker}`

  try {
    const data = await cached(cacheKey, TTL.STOCK, async () => {
      if (!soso.hasKey()) return fallbackStock(ticker)

      const [snapshot, klines, treasury] = await Promise.allSettled([
        soso.call(`/crypto-stocks/${ticker}/market-snapshot`),
        soso.call(`/crypto-stocks/${ticker}/klines`, { interval: '1d', limit: 17 }),
        soso.call(`/btc-treasuries/${ticker}/purchase-history`),
      ])

      return {
        snapshot: snapshot.value?.data || snapshot.value,
        klines: klines.value?.data || klines.value || fb.MSTR_KLINES,
        treasury: treasury.value?.data || [],
        ticker,
        source: 'live',
      }
    })
    res.json(data)
  } catch {
    res.json(fallbackStock(ticker))
  }
})

function fallbackStock(ticker) {
  return {
    snapshot: {
      price: 421.5,
      change24h: 1.8,
      btcHoldings: 217400,
      avgCostBasis: 35000,
      unrealizedGain: '+$14.9B',
      treasuryValue: '22.6B',
      marketCap: '82B',
      peRatio: 'N/A',
      pbRatio: '12.4x',
      mNAV: '+2.8x',
    },
    klines: fb.MSTR_KLINES,
    treasury: [],
    ticker,
    source: 'mock',
  }
}

// ─── /api/index/:ticker ──────────────────────────────────────────────────────
router.get('/index/:ticker', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const cacheKey = `index:${ticker}`

  try {
    const data = await cached(cacheKey, TTL.INDEX, async () => {
      if (!soso.hasKey()) return fallbackIndex(ticker)

      const [snapshot, klines, constituents] = await Promise.allSettled([
        soso.call(`/indices/${ticker}/market-snapshot`),
        soso.call(`/indices/${ticker}/klines`, { interval: '1d', limit: 17 }),
        soso.call(`/indices/${ticker}/constituents`),
      ])

      return {
        snapshot: snapshot.value?.data || snapshot.value,
        klines: klines.value?.data || klines.value || fb.MAG7_KLINES,
        constituents: constituents.value?.data || constituents.value || fb.MAG7_CONSTITUENTS,
        ticker,
        source: 'live',
      }
    })
    res.json(data)
  } catch {
    res.json(fallbackIndex(ticker))
  }
})

function fallbackIndex(ticker) {
  return {
    snapshot: { price: 142.8, change24h: 1.45, aum: '4.8B', constituents: 7, roi1m: 18.4, roi3m: 31.2, roi1y: 147.8 },
    klines: fb.MAG7_KLINES,
    constituents: fb.MAG7_CONSTITUENTS,
    ticker,
    source: 'mock',
  }
}

// ─── /api/ai/brief ───────────────────────────────────────────────────────────
router.post('/ai/brief', async (req, res) => {
  const { context, ticker, data } = req.body || {}
  if (!context || !ticker) return res.status(400).json({ error: 'context and ticker required' })

  const promptHash = crypto.createHash('md5').update(JSON.stringify({ context, ticker })).digest('hex')
  const cacheKey = `ai:${promptHash}`

  try {
    const result = await cached(cacheKey, TTL.AI, async () => {
      if (!openrouter.hasKey()) return { brief: fallbackBrief(context, ticker), source: 'mock' }
      const prompt = buildPrompt(context, ticker, data)
      const text = await openrouter.brief(prompt)
      return { brief: text, source: 'live' }
    })
    res.json(result)
  } catch {
    res.json({ brief: fallbackBrief(context, ticker), source: 'mock' })
  }
})

function buildPrompt(context, ticker, data) {
  const PROMPTS = {
    currency: `You are a professional crypto analyst. Write a 2-sentence market brief for ${ticker} for a Bloomberg-style terminal. Be direct and data-driven. Max 60 words.`,
    macro: `You are a macro analyst. Write a 2-sentence brief about ${ticker} macro event impact on Bitcoin. Include historical pattern and likely BTC reaction. Max 60 words.`,
    stock: `You are a crypto equity analyst. Write a 2-sentence brief on ${ticker} BTC treasury strategy. Mention treasury size and mNAV premium. Max 60 words.`,
    index: `You are a quant analyst. Write a 2-sentence brief on the ${ticker} SSI index rebalancing signal. Mention top performers and weight shifts. Max 60 words.`,
  }
  return PROMPTS[context] || `Write a 2-sentence financial brief for ${ticker}.`
}

function fallbackBrief(context, ticker) {
  const BRIEFS = {
    currency: `${ticker} consolidating near ATH with ETF inflows averaging $620M/day this week. Spot demand outpacing supply; on-chain accumulation at $100K–$104K range suggests institutional floor building.`,
    macro: `Last 8 times ${ticker} beat forecast by >0.1%, BTC averaged +3.4% in 24h — pattern holds 75% of the time. Next release creates asymmetric upside if actual comes in below forecast.`,
    stock: `${ticker} treasury strategy yields +13.7% BTC YTD — outperforming direct spot by 4.1pp via leveraged ATM issuance. mNAV premium at 2.8x reflects scarcity value; accumulate on dips to 2.4x.`,
    index: `${ticker} April performance +18.4% — BTC and SOL led with constituent weights shifting toward Layer 1 assets. Rebalancing signal: reduce BNB 0.8pp, add SOL 0.5pp to match current market cap weights.`,
  }
  return BRIEFS[context] || `${ticker} showing strong momentum. Monitor for key level breaks.`
}

// ─── /api/sodex/ticker ───────────────────────────────────────────────────────
router.get('/sodex/ticker', async (req, res) => {
  try {
    const data = await cached('sodex:tickers', TTL.SODEX, () => sodex.tickers())
    res.json(data)
  } catch {
    res.json({
      code: 0,
      data: [
        { symbol: 'BTCUSDT', lastPx: '104100.00', changePct: 2.34, change: '2385.00' },
        { symbol: 'ETHUSDT', lastPx: '3420.00', changePct: 1.87, change: '62.80' },
        { symbol: 'SOLUSDT', lastPx: '178.50', changePct: 3.42, change: '5.90' },
      ],
      source: 'mock',
    })
  }
})

module.exports = router
