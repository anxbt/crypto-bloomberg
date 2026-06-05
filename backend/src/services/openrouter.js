const ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

function headers() {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ''}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://cryptodesk.vercel.app',
    'X-Title': 'CryptoDesk',
  }
}

// One-shot brief used by /api/ai/brief
async function brief(prompt) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 120,
      temperature: 0.4,
    }),
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || ''
}

// Streaming chat used by /api/ai/chat — invokes onChunk(text) per delta.
async function briefStream(messages, onChunk, { temperature = 0.5, maxTokens = 400 } = {}) {
  if (!process.env.OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not set')

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: maxTokens,
      temperature,
      stream: true,
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data:')) continue

      const payload = trimmed.slice(5).trim()
      if (payload === '[DONE]') return

      try {
        const obj = JSON.parse(payload)
        const delta = obj.choices?.[0]?.delta?.content
        if (delta) onChunk(delta)
      } catch {
        // keep-alive comments etc — ignore
      }
    }
  }
}

module.exports = {
  brief,
  briefStream,
  hasKey: () => Boolean(process.env.OPENROUTER_API_KEY),
}
