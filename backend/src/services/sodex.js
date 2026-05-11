const REST_BASE = 'https://mainnet-gw.sodex.dev/api/v1/spot/markets'

async function tickers() {
  const res = await fetch(`${REST_BASE}/tickers`, { signal: AbortSignal.timeout(5000) })
  if (!res.ok) throw new Error(`SoDEX ${res.status}`)
  return res.json()
}

module.exports = { tickers }
