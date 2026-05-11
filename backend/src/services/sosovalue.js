const BASE_URL = process.env.SOSOVALUE_BASE_URL || 'https://open-api.sosovalue.com/v1'

async function call(path, params = {}) {
  const API_KEY = process.env.SOSOVALUE_API_KEY || ''
  if (!API_KEY) throw new Error('SOSOVALUE_API_KEY not set')

  const url = new URL(BASE_URL + path)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      'X-API-KEY': API_KEY,
      'Content-Type': 'application/json',
    },
    signal: AbortSignal.timeout(8000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`SoSoValue ${res.status}: ${text.slice(0, 200)}`)
  }

  return res.json()
}

module.exports = { call, hasKey: () => Boolean(process.env.SOSOVALUE_API_KEY) }
