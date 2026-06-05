import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY  = 'cryptodesk.portfolio'
const SEEDED_FLAG  = 'cryptodesk.portfolio.seeded.v1'

const SEED = [
  { ticker: 'BTC',  qty: 0.336 },
  { ticker: 'MSTR', qty: 47    },
  { ticker: 'MAG7', qty: 175   },
  { ticker: 'ETH',  qty: 5.85  },
]

const SSI_LIST    = new Set(['MAG7', 'LAYER1', 'DEFI', 'LAYER2', 'WEB3', 'GAMERS', 'MEME'])
const STOCK_LIST  = new Set(['MSTR', 'COIN', 'MARA', 'RIOT', 'CLSK', 'HUT', 'SMLR'])

function classify(ticker) {
  const t = ticker.toUpperCase()
  if (SSI_LIST.has(t))   return { type: 'index',    url: `/api/index/${t}` }
  if (STOCK_LIST.has(t)) return { type: 'stock',    url: `/api/stock/${t}` }
  return { type: 'currency', url: `/api/currency/${t.toLowerCase()}` }
}

function loadHoldings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveHoldings(holdings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings)) } catch {}
}

export function usePortfolio() {
  const [holdings, setHoldings] = useState([])
  const [snapshots, setSnapshots] = useState({})
  const [loading, setLoading] = useState(true)

  // Seed-on-first-visit
  useEffect(() => {
    const existing = loadHoldings()
    if (!localStorage.getItem(SEEDED_FLAG) && (!existing || existing.length === 0)) {
      saveHoldings(SEED)
      localStorage.setItem(SEEDED_FLAG, '1')
      setHoldings(SEED)
    } else {
      setHoldings(existing || [])
    }
  }, [])

  // Fetch snapshots in parallel whenever holdings change
  useEffect(() => {
    if (holdings.length === 0) { setSnapshots({}); setLoading(false); return }
    let cancelled = false
    setLoading(true)
    Promise.allSettled(
      holdings.map(({ ticker }) => {
        const { type, url } = classify(ticker)
        return fetch(url).then((r) => r.ok ? r.json() : null).then((d) => ({ ticker, type, data: d }))
      })
    ).then((results) => {
      if (cancelled) return
      const map = {}
      for (const r of results) {
        if (r.status !== 'fulfilled' || !r.value?.data) continue
        const { ticker, type, data } = r.value
        const snap = data.snapshot || {}
        map[ticker] = {
          type,
          price: Number(snap.price ?? snap.currentPrice ?? 0),
          change24h: Number(snap.change24h ?? snap.changeRate ?? 0),
        }
      }
      setSnapshots(map)
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [holdings])

  const updateQty = useCallback((ticker, qty) => {
    setHoldings((prev) => {
      const next = prev.map((h) => h.ticker === ticker ? { ...h, qty: Number(qty) || 0 } : h)
      saveHoldings(next)
      return next
    })
  }, [])

  const addHolding = useCallback((ticker, qty) => {
    const t = (ticker || '').trim().toUpperCase()
    if (!t || !qty) return
    setHoldings((prev) => {
      if (prev.find((h) => h.ticker === t)) return prev
      const next = [...prev, { ticker: t, qty: Number(qty) }]
      saveHoldings(next)
      return next
    })
  }, [])

  const removeHolding = useCallback((ticker) => {
    setHoldings((prev) => {
      const next = prev.filter((h) => h.ticker !== ticker)
      saveHoldings(next)
      return next
    })
  }, [])

  const rows = holdings.map(({ ticker, qty }) => {
    const snap = snapshots[ticker]
    const price = snap?.price ?? 0
    const change24h = snap?.change24h ?? 0
    const value = qty * price
    const fvPct = change24h >= 0 ? -3.2 : 1.8
    const fvDelta = price ? Math.round(value * (Math.abs(fvPct) / 100)) * (fvPct < 0 ? -1 : 1) : null
    const bullPct = Math.round(change24h >= 0
      ? Math.min(75, 55 + Math.abs(change24h) * 3)
      : Math.max(25, 50 - Math.abs(change24h) * 3))
    const action = fvDelta == null
      ? 'Hold'
      : fvDelta < -value * 0.025 ? 'Add' : fvDelta > value * 0.025 ? 'Trim' : 'Hold'
    return { ticker, qty, type: snap?.type, price, change24h, value, fvDelta, fvPct, bullPct, action, missing: !snap }
  })

  const total = rows.reduce((a, r) => a + r.value, 0)
  const totalFvDelta = rows.reduce((a, r) => a + (r.fvDelta || 0), 0)
  const totalFvPct = total ? (totalFvDelta / total) * 100 : 0

  return {
    holdings,
    rows,
    total,
    totalFvDelta,
    totalFvPct,
    loading,
    updateQty,
    addHolding,
    removeHolding,
  }
}
