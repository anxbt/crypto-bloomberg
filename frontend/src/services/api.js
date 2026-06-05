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

// Helper: fetch AI brief AFTER main data is available, so the prompt has live numbers.
async function fetchBrief(context, ticker, snapshot, news) {
  try {
    const r = await post('/api/ai/brief', {
      context,
      ticker,
      data: {
        snapshot,
        news: (news || []).slice(0, 3).map((n) => ({ id: n.id, title: n.title })),
      },
    })
    return r?.brief || ''
  } catch {
    return ''
  }
}

async function loadCurrency(id) {
  const ticker = id.toUpperCase()
  const [main, newsData] = await Promise.allSettled([
    get(`/api/currency/${id.toLowerCase()}`),
    get(`/api/news?currency_id=${id.toLowerCase()}`),
  ])
  const m = main.value || {}
  const news = newsData.value?.items || []
  const aibrief = await fetchBrief('currency', ticker, m.snapshot, news)

  return {
    type: 'currency',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    macroEvents: m.macroEvents || [],
    scenarios: m.scenarios || [],
    news,
    aibrief,
  }
}

async function loadMacro(id) {
  const ticker = id.toUpperCase()
  const [main, newsData] = await Promise.allSettled([
    get(`/api/macro?event=${encodeURIComponent(ticker)}`),
    get(`/api/news?keyword=${encodeURIComponent(ticker)}`),
  ])
  const m = main.value || {}
  const news = newsData.value?.items || []
  const aibrief = await fetchBrief('macro', ticker, m.snapshot, news)

  return {
    type: 'macro',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    history: m.history || [],
    btcKlines: m.btcKlines || [],
    news,
    aibrief,
  }
}

async function loadStock(id) {
  const ticker = id.toUpperCase()
  const [main, newsData] = await Promise.allSettled([
    get(`/api/stock/${ticker}`),
    get(`/api/news?keyword=${encodeURIComponent(ticker)}`),
  ])
  const m = main.value || {}
  const news = newsData.value?.items || []
  const aibrief = await fetchBrief('stock', ticker, m.snapshot, news)

  return {
    type: 'stock',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    treasury: m.treasury || [],
    news,
    aibrief,
  }
}

async function loadIndex(id) {
  const ticker = id.toUpperCase()
  const [main, newsData] = await Promise.allSettled([
    get(`/api/index/${ticker}`),
    get('/api/news'),
  ])
  const m = main.value || {}
  const news = newsData.value?.items || []
  const aibrief = await fetchBrief('index', ticker, m.snapshot, news)

  return {
    type: 'index',
    id: id.toLowerCase(),
    ticker,
    snapshot: m.snapshot || {},
    klines: m.klines || [],
    constituents: m.constituents || [],
    news,
    aibrief,
  }
}

// Streaming chat — POSTs to /api/ai/chat (SSE), invokes onChunk(text) per delta.
export async function chatStream(messages, context, onChunk) {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, context }),
  })

  if (!res.ok || !res.body) {
    const text = await res.text().catch(() => '')
    throw new Error(`chat ${res.status}: ${text.slice(0, 200)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const events = buffer.split('\n\n')
    buffer = events.pop() || ''

    for (const block of events) {
      const lines = block.split('\n')
      let eventType = 'message'
      let dataLine = ''
      for (const ln of lines) {
        if (ln.startsWith('event:')) eventType = ln.slice(6).trim()
        else if (ln.startsWith('data:')) dataLine = ln.slice(5).trim()
      }
      if (!dataLine) continue

      try {
        const obj = JSON.parse(dataLine)
        if (eventType === 'chunk' && obj.content) onChunk(obj.content)
        else if (eventType === 'error') throw new Error(obj.message || 'stream error')
      } catch (err) {
        if (eventType === 'error') throw err
      }
    }
  }
}

const API = { search, loadContext, chatStream }
export default API
