import { create } from 'zustand'
import { chatStream } from '../services/api'

const STORAGE_KEY = 'cryptodesk.chats'
const SEEDED_FLAG = 'cryptodesk.seeded.v1'

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
}

function loadAllChats() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAllChats(chats) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(chats)) } catch {}
}

function deriveTitle(messages) {
  const firstUser = messages.find((m) => m.role === 'user')
  if (!firstUser) return 'New conversation'
  return firstUser.content.slice(0, 60) + (firstUser.content.length > 60 ? '…' : '')
}

function deriveTickers(messages, contextTicker) {
  const set = new Set()
  if (contextTicker) set.add(contextTicker)
  for (const m of messages) {
    const matches = (m.content || '').match(/\b(BTC|ETH|SOL|MSTR|COIN|MAG7|CPI|FOMC|NFP|LAYER1)\b/g) || []
    matches.forEach((t) => set.add(t))
  }
  return Array.from(set).slice(0, 4)
}

export const useChat = create((set, get) => ({
  // UI state
  open: false,
  streaming: false,

  // Active conversation
  conversationId: null,
  messages: [],          // [{role, content}]
  panelContext: null,    // current panelData from TerminalPage

  setPanelContext: (panelContext) => set({ panelContext }),

  openChat: ({ seed, conversationId } = {}) => {
    if (conversationId) {
      const found = loadAllChats().find((c) => c.id === conversationId)
      if (found) {
        return set({ open: true, conversationId, messages: found.messages || [] })
      }
    }
    if (seed) {
      return set({
        open: true,
        conversationId: null,
        messages: [{ role: 'assistant', content: seed }],
      })
    }
    set({ open: true })
  },

  close: () => set({ open: false }),

  newConversation: () => set({ conversationId: null, messages: [] }),

  send: async (text) => {
    const trimmed = text.trim()
    if (!trimmed) return

    const ctx = buildContextPayload(get().panelContext)
    const userMsg = { role: 'user', content: trimmed }
    const assistantMsg = { role: 'assistant', content: '' }
    set({ messages: [...get().messages, userMsg, assistantMsg], streaming: true })

    try {
      await chatStream(
        [...get().messages.slice(0, -1)],
        ctx,
        (chunk) => {
          const msgs = get().messages.slice()
          const last = msgs[msgs.length - 1]
          if (last && last.role === 'assistant') {
            msgs[msgs.length - 1] = { ...last, content: last.content + chunk }
            set({ messages: msgs })
          }
        }
      )
    } catch (err) {
      const msgs = get().messages.slice()
      const last = msgs[msgs.length - 1]
      if (last && last.role === 'assistant' && !last.content) {
        msgs[msgs.length - 1] = { ...last, content: `_[Error: ${String(err.message || err).slice(0, 120)}]_` }
        set({ messages: msgs })
      }
    } finally {
      set({ streaming: false })
      persistCurrent(get())
    }
  },
}))

// Public helpers — used by Research Lab
export function listConversations() {
  return loadAllChats().sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
}

export function deleteConversation(id) {
  saveAllChats(loadAllChats().filter((c) => c.id !== id))
}

export function seedConversationsIfEmpty(seedFn) {
  if (localStorage.getItem(SEEDED_FLAG)) return
  if (loadAllChats().length > 0) {
    localStorage.setItem(SEEDED_FLAG, '1')
    return
  }
  const seeds = seedFn()
  saveAllChats(seeds)
  localStorage.setItem(SEEDED_FLAG, '1')
}

// Private
function persistCurrent(state) {
  if (state.messages.length === 0) return
  const all = loadAllChats()
  const id = state.conversationId || uid()
  const ticker = state.panelContext?.ticker
  const updated = {
    id,
    title: deriveTitle(state.messages),
    tickers: deriveTickers(state.messages, ticker),
    lastMessageAt: Date.now(),
    messages: state.messages,
  }
  const existing = all.findIndex((c) => c.id === id)
  if (existing >= 0) all[existing] = updated
  else all.unshift(updated)
  saveAllChats(all.slice(0, 50))
  if (!state.conversationId) useChat.setState({ conversationId: id })
}

function buildContextPayload(panelData) {
  if (!panelData || panelData.type === 'idle') return null
  return {
    type: panelData.type,
    ticker: panelData.ticker,
    snapshot: panelData.snapshot || {},
    news: (panelData.news || []).slice(0, 5).map((n) => ({ id: n.id, title: n.title })),
  }
}
