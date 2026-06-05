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
  if (Array.isArray(value.data?.data))  return value.data.data
  if (Array.isArray(value.data))        return value.data
  if (Array.isArray(value.result?.data)) return value.result.data
  if (Array.isArray(value.result?.list)) return value.result.list
  if (Array.isArray(value.result))       return value.result
  if (Array.isArray(value.items))        return value.items
  if (Array.isArray(value.list))         return value.list
  return []
}

// Maps any SoSoValue news item shape to the frontend's expected fields.
// category is forced to one of: news | research | kol | announcement
function normalizeNewsItem(item, idx) {
  const cat = String(item.category ?? item.categoryId ?? item.type ?? '').toLowerCase()
  let category = 'news'
  if (['research', 'analysis', 'report', '2', 'insight'].includes(cat)) category = 'research'
  else if (['kol', 'opinion', 'twitter', '3', 'social'].includes(cat)) category = 'kol'
  else if (['announcement', 'alert', 'project', '4', 'notice'].includes(cat)) category = 'announcement'

  const raw = String(item.sentiment ?? item.sentimentLabel ?? '').toLowerCase()
  const sentiment = ['positive', 'negative', 'neutral'].includes(raw) ? raw : 'neutral'

  return {
    id: item.id ?? item.newsId ?? item.news_id ?? idx,
    title: item.title ?? item.headline ?? item.content ?? '',
    source: item.source ?? item.sourceName ?? item.source_name ?? item.mediaName ?? '',
    time: item.time ?? item.publishTime ?? item.publish_time ?? item.createTime ?? item.date ?? '',
    sentiment,
    category,
    tags: item.tags ?? item.keywords ?? item.coins ?? [],
  }
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
      const raw = results
        .filter((r) => r.status === 'fulfilled')
        .flatMap((r) => extractItems(r.value))

      // Dedup by title, then normalize field names and category
      const seen = new Set()
      const items = raw
        .filter((n) => {
          const key = n.id ?? n.title ?? Math.random()
          return seen.has(key) ? false : seen.add(key)
        })
        .map(normalizeNewsItem)

      // If live API returned nothing parseable, fall back to mock so feed is never empty
      if (items.length === 0) return fallbackNews(keyword, category)
      return { items }
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

// ─── /api/etf/multi ──────────────────────────────────────────────────────────
// Fans out to per-ticker history endpoints (BlackRock IBIT, Fidelity FBTC, Grayscale GBTC).
// Returns: { tickers: [{ ticker, days: [{date, flow}] }], source }
router.get('/etf/multi', async (req, res) => {
  const tickers = (req.query.tickers || 'IBIT,FBTC,GBTC').split(',').map((t) => t.trim().toUpperCase()).slice(0, 6)
  const days = Math.min(Number(req.query.days) || 30, 90)
  const cacheKey = `etf:multi:${tickers.join(',')}:${days}`

  try {
    const data = await cached(cacheKey, TTL.ETF, async () => {
      if (!soso.hasKey()) return { tickers: tickers.map((t) => syntheticEtfRow(t, days)), source: 'mock' }

      const results = await Promise.allSettled(
        tickers.map((t) => soso.call(`/etfs/${t}/history`).catch(() => null))
      )
      const rows = results.map((r, i) => {
        const ticker = tickers[i]
        const raw = r.status === 'fulfilled' ? extractItems(r.value) : []
        const live = (raw || [])
          .slice(0, days)
          .map((item) => ({
            date: item.date ?? item.statisticDate ?? item.day ?? '',
            flow: Number(item.netInflow ?? item.netFlow ?? item.value ?? 0),
          }))
          .filter((d) => d.date)
        return live.length > 0 ? { ticker, days: live } : syntheticEtfRow(ticker, days)
      })
      const anyLive = rows.some((r) => r.days.length > 0 && !r.synthetic)
      return { tickers: rows, source: anyLive ? 'live' : 'mock' }
    })
    res.json(data)
  } catch {
    res.json({ tickers: tickers.map((t) => syntheticEtfRow(t, days)), source: 'mock' })
  }
})

function syntheticEtfRow(ticker, days) {
  // Deterministic synthetic flows based on ticker name + day index — varied but stable
  const seed = ticker.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const base = ticker === 'GBTC' ? -150 : ticker === 'IBIT' ? 380 : 180
  const variance = ticker === 'GBTC' ? 220 : ticker === 'IBIT' ? 320 : 200
  const today = new Date()
  const entries = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const date = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })
    const noise = Math.sin((seed + i) * 0.7) * variance
    const flow = Math.round(base + noise + Math.sin(i * 0.3) * 80)
    entries.push({ date, flow })
  }
  return { ticker, days: entries, synthetic: true }
}

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

      const rawSnap = snapshot.value?.data || snapshot.value
      const snap = normalizeSnap(rawSnap) ? {
        ...fallbackStock(ticker).snapshot,  // base with all required fields
        ...rawSnap,                          // overlay whatever live fields exist
        price: rawSnap?.price ?? rawSnap?.currentPrice ?? rawSnap?.last_price ?? fallbackStock(ticker).snapshot.price,
        change24h: rawSnap?.change24h ?? rawSnap?.change_24h ?? rawSnap?.changePercent24h ?? fallbackStock(ticker).snapshot.change24h,
      } : fallbackStock(ticker).snapshot

      return {
        snapshot: snap,
        klines: klines.value?.data || klines.value || fb.MSTR_KLINES,
        treasury: treasury.value?.data || [],
        ticker,
        source: normalizeSnap(rawSnap) ? 'live' : 'mock',
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

      const liveSnap = snapshot.value?.data || snapshot.value
      const validSnap = liveSnap && liveSnap.price != null ? liveSnap : null
      return {
        snapshot: validSnap || (INDEX_SNAPSHOTS[ticker] || INDEX_SNAPSHOTS.MAG7),
        klines: klines.value?.data || klines.value || fb.MAG7_KLINES,
        constituents: constituents.value?.data || constituents.value || fb.MAG7_CONSTITUENTS,
        ticker,
        source: validSnap ? 'live' : 'mock',
      }
    })
    res.json(data)
  } catch {
    res.json(fallbackIndex(ticker))
  }
})

// Per-ticker snapshots so Market Intel's Sector Rotation card has data for all 6 SSIs.
const INDEX_SNAPSHOTS = {
  MAG7:   { price: 142.8, change24h: 1.45, aum: '4.8B',  constituents: 7,  roi1m: 18.4, roi3m: 31.2, roi1y: 147.8 },
  LAYER1: { price: 78.2,  change24h: 2.10, aum: '2.1B',  constituents: 8,  roi1m: 22.6, roi3m: 38.4, roi1y: 162.1 },
  DEFI:   { price: 54.6,  change24h: 0.82, aum: '1.4B',  constituents: 12, roi1m: 9.8,  roi3m: 18.1, roi1y: 74.5  },
  LAYER2: { price: 31.4,  change24h: -0.45,aum: '0.9B',  constituents: 6,  roi1m: -3.2, roi3m: 12.7, roi1y: 48.3  },
  MEME:   { price: 18.7,  change24h: 4.12, aum: '0.6B',  constituents: 10, roi1m: 41.5, roi3m: 88.2, roi1y: 312.4 },
  GAMERS: { price: 24.1,  change24h: -1.30,aum: '0.5B',  constituents: 9,  roi1m: -8.4, roi3m: -2.1, roi1y: 28.6  },
  WEB3:   { price: 36.9,  change24h: 0.95, aum: '0.8B',  constituents: 11, roi1m: 6.2,  roi3m: 14.8, roi1y: 52.1  },
}

function fallbackIndex(ticker) {
  return {
    snapshot: INDEX_SNAPSHOTS[ticker] || INDEX_SNAPSHOTS.MAG7,
    klines: fb.MAG7_KLINES,
    constituents: fb.MAG7_CONSTITUENTS,
    ticker,
    source: 'mock',
  }
}

// ─── /api/index/:ticker/rebalance ────────────────────────────────────────────
// Returns: { ticker, amount, rows: [{ticker, name, weight, price, targetUsd, targetQty}], source }
const FALLBACK_PRICES = {
  BTC: 104100, ETH: 3420, SOL: 178.5, BNB: 620, XRP: 0.52, ADA: 0.45, AVAX: 28.3,
  DOGE: 0.16, LINK: 14.2, MATIC: 0.71, DOT: 7.4, LTC: 92, TRX: 0.13,
}

router.get('/index/:ticker/rebalance', async (req, res) => {
  const ticker = req.params.ticker.toUpperCase()
  const amount = Math.max(0, Number(req.query.amount) || 0)
  if (amount === 0) return res.status(400).json({ error: 'amount must be > 0' })

  try {
    let constituents = []
    if (soso.hasKey()) {
      try {
        const r = await cached(`index:constituents:${ticker}`, TTL.INDEX, () =>
          soso.call(`/indices/${ticker}/constituents`)
        )
        constituents = extractItems(r) || []
      } catch {
        constituents = []
      }
    }
    if (constituents.length === 0) constituents = fb.MAG7_CONSTITUENTS

    const rows = await Promise.all(constituents.map(async (c) => {
      const tk = (c.ticker || c.symbol || '').toUpperCase()
      const weight = Number(c.weight) || 0
      let price = FALLBACK_PRICES[tk] ?? null

      if (soso.hasKey() && tk) {
        try {
          const snap = await cached(`price:${tk}`, TTL.CURRENCY, () =>
            soso.call(`/currencies/${tk.toLowerCase()}/market-snapshot`)
          )
          const livePrice = snap?.data?.price ?? snap?.price ?? snap?.data?.currentPrice
          if (livePrice) price = Number(livePrice)
        } catch {
          // keep fallback
        }
      }

      const targetUsd = (amount * weight) / 100
      const targetQty = price ? targetUsd / price : null
      return { ticker: tk, name: c.name || tk, weight, price, targetUsd, targetQty }
    }))

    res.json({
      ticker,
      amount,
      rows: rows.filter((r) => r.weight > 0).sort((a, b) => b.weight - a.weight),
      source: soso.hasKey() ? 'live' : 'mock',
    })
  } catch (err) {
    res.status(500).json({ error: String(err.message || err).slice(0, 200) })
  }
})

// ─── /api/ai/brief ───────────────────────────────────────────────────────────
router.post('/ai/brief', async (req, res) => {
  const { context, ticker, data } = req.body || {}
  if (!context || !ticker) return res.status(400).json({ error: 'context and ticker required' })

  // Cache by ticker + rounded price so we regenerate when price moves materially.
  const priceBucket = Math.round((data?.snapshot?.price ?? 0) / 100)
  const promptHash = crypto.createHash('md5').update(JSON.stringify({ context, ticker, priceBucket })).digest('hex')
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
  const snap = data?.snapshot || {}
  const newsLines = (data?.news || [])
    .slice(0, 3)
    .map((n) => `  - ${n.title}`)
    .join('\n')
  const priceLine = snap.price != null
    ? `Current price: $${Number(snap.price).toLocaleString()} (${snap.change24h != null ? (snap.change24h >= 0 ? '+' : '') + snap.change24h + '%' : '—'} 24h)`
    : ''

  const dataBlock = [
    priceLine,
    snap.marketCap ? `Market Cap: ${snap.marketCap}` : '',
    snap.etfNetInflow7d ? `ETF 7d Net Flow: ${snap.etfNetInflow7d}` : '',
    newsLines ? `Recent news:\n${newsLines}` : '',
  ].filter(Boolean).join('\n')

  const ROLES = {
    currency: 'You are a professional crypto analyst writing for a Bloomberg-style terminal.',
    macro:    'You are a macro analyst writing about how this event impacts Bitcoin.',
    stock:    'You are a crypto equity analyst writing about BTC treasury strategy.',
    index:    'You are a quant analyst writing about SSI index rebalancing signals.',
  }

  return `${ROLES[context] || 'You are a financial analyst.'}

Write a tight 2-sentence brief for ${ticker}. Use ONLY the numbers in the DATA block below — do not invent prices, percentages, or flows. If a number isn't in DATA, do not state it. Max 60 words.

DATA:
${dataBlock || '(no live data — write a generic 1-sentence note)'}`
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

// ─── /api/ai/chat (SSE) ──────────────────────────────────────────────────────
router.post('/ai/chat', async (req, res) => {
  const { messages, context } = req.body || {}
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array required' })
  }

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const send = (event, data) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
  }

  const fullMessages = [
    { role: 'system', content: buildChatSystemPrompt(context) },
    ...messages.filter((m) => m && m.role !== 'system' && typeof m.content === 'string'),
  ]

  if (!openrouter.hasKey()) {
    send('chunk', { content: fallbackChat(context) })
    send('done', { source: 'mock' })
    return res.end()
  }

  try {
    await openrouter.briefStream(fullMessages, (chunk) => send('chunk', { content: chunk }))
    send('done', { source: 'live' })
  } catch (err) {
    send('chunk', { content: '\n\n_[connection lost — try again]_' })
    send('error', { message: String(err.message || err).slice(0, 200) })
  } finally {
    res.end()
  }
})

function buildChatSystemPrompt(context = {}) {
  const ctx = context || {}
  const snap = ctx.snapshot || {}
  const newsLines = (ctx.news || [])
    .slice(0, 5)
    .map((n, i) => `  [news:${n.id ?? i + 1}] ${n.title}`)
    .join('\n')

  const priceLine = snap.price != null
    ? `$${typeof snap.price === 'number' ? snap.price.toLocaleString() : snap.price} (${snap.change24h != null ? (snap.change24h >= 0 ? '+' : '') + snap.change24h + '%' : '—'} 24h)`
    : '—'

  return `You are ValueGPT, a sharp, data-driven crypto analyst embedded in CryptoDesk — a Bloomberg-style terminal for institutional crypto research.

CURRENT CONTEXT (the user is looking at this asset — use these numbers, do not fabricate):
- Asset: ${ctx.ticker || 'BTC'} (${ctx.type || 'currency'})
- Price: ${priceLine}
- 24h High/Low: ${snap.high24h != null ? '$' + snap.high24h : '—'} / ${snap.low24h != null ? '$' + snap.low24h : '—'}
- Market Cap: ${snap.marketCap ?? '—'}
- ETF 7d Net Flow: ${snap.etfNetInflow7d ?? '—'}
- Dominance: ${snap.dominance != null ? snap.dominance + '%' : '—'}
${newsLines ? '\nRecent news in the feed:\n' + newsLines : ''}

RULES:
- Keep responses tight: 2–4 sentences unless the user asks for depth.
- When you reference a news item, cite it inline as [news:N] using the exact ID from the list above — do NOT invent IDs.
- Never fabricate prices, percentages, or flow numbers — use only the context above, or say "I don't have that data in view."
- Frame tactical commentary as observation + implication. This is research, not financial advice.`
}

function fallbackChat(context = {}) {
  const ticker = context?.ticker || 'BTC'
  return `${ticker} is consolidating with ETF inflows continuing to support spot demand [news:1]. AI Fair Value sits ~3% above current, suggesting the institutional floor is firming. (Streaming AI unavailable — showing canned fallback.)`
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
