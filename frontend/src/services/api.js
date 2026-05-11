async function get(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

async function post(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`${res.status} ${path}`)
  return res.json()
}

// Resolves a raw query string to { type, id }
async function search(q) {
  return get(`/api/search?q=${encodeURIComponent(q)}`)
}

// Returns the full panelData shape consumed by all three panels
async function loadContext(type, id) {
  switch (type) {
    case 'currency': return loadCurrency(id)
    case 'macro':    return loadMacro(id)
    case 'stock':    return loadStock(id)
    case 'index':    return loadIndex(id)
    default:         return { type: 'idle' }
  }
}

async function loadCurrency(id) {
  const ticker = id.toUpperCase()
  const [main, newsData, briefData] = await Promise.allSettled([
    get(`/api/currency/${id.toLowerCase()}`),
    get(`/api/news?currency_id=${id.toLowerCase()}`),
    post('/api/ai/brief', { context: 'currency', ticker }),
  ])

  const m = main.value || {}
  return {
    type: 'currency',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    macroEvents: m.macroEvents || [],
    scenarios: m.scenarios || [],
    news: newsData.value?.items || [],
    aibrief: briefData.value?.brief || '',
  }
}

async function loadMacro(id) {
  const ticker = id.toUpperCase()
  const [main, newsData] = await Promise.allSettled([
    get(`/api/macro?event=${encodeURIComponent(ticker)}`),
    get(`/api/news?keyword=${encodeURIComponent(ticker)}`),
  ])

  const m = main.value || {}
  return {
    type: 'macro',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    history: m.history || [],
    btcKlines: m.btcKlines || [],
    news: newsData.value?.items || [],
  }
}

async function loadStock(id) {
  const ticker = id.toUpperCase()
  const [main, newsData, briefData] = await Promise.allSettled([
    get(`/api/stock/${ticker}`),
    get(`/api/news?keyword=${encodeURIComponent(ticker)}`),
    post('/api/ai/brief', { context: 'stock', ticker }),
  ])

  const m = main.value || {}
  return {
    type: 'stock',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    treasury: m.treasury || [],
    news: newsData.value?.items || [],
    aibrief: briefData.value?.brief || '',
  }
}

async function loadIndex(id) {
  const ticker = id.toUpperCase()
  const [main, newsData, briefData] = await Promise.allSettled([
    get(`/api/index/${ticker}`),
    get('/api/news'),
    post('/api/ai/brief', { context: 'index', ticker }),
  ])

  const m = main.value || {}
  return {
    type: 'index',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    constituents: m.constituents || [],
    news: newsData.value?.items || [],
    aibrief: briefData.value?.brief || '',
  }
}

const API = { search, loadContext }
export default API
