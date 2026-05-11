const BASE = 'https://api.binance.com/api/v3'

async function klines(symbol = 'BTCUSDT', interval = '1h', limit = 24) {
  const url = `${BASE}/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Binance ${res.status}`)
  const raw = await res.json()
  // raw: [openTime, open, high, low, close, volume, ...]
  return raw.map((c) => ({
    time: c[0],
    open: parseFloat(c[1]),
    high: parseFloat(c[2]),
    low: parseFloat(c[3]),
    close: parseFloat(c[4]),
    volume: parseFloat(c[5]),
  }))
}

module.exports = { klines }
