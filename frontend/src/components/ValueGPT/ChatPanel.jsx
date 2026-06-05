import React, { useEffect, useRef, useState } from 'react'
import { useChat } from '../../store/chat'
import MessageBubble from './MessageBubble'

const SLASH_COMMANDS = [
  { cmd: '/summary',  hint: 'Re-brief this asset',      expand: (_, ctx) => `Summarize ${ctx?.ticker || 'this asset'} in 3 sentences using only the data in view. Cite news if relevant.` },
  { cmd: '/scenario', hint: 'Bull or bear scenario',    expand: (arg, ctx) => `Run a ${arg || 'bull'} scenario for ${ctx?.ticker || 'this asset'}: target price, probability, and the single trigger that confirms it.` },
  { cmd: '/rebalance',hint: 'Portfolio rebalance ($N)', expand: (arg, ctx) => `Suggest a rebalance for a $${arg || '50000'} portfolio centered on ${ctx?.ticker || 'BTC'} given current Fair Value Delta and bull probabilities.` },
]

function maybeExpandSlash(input, ctx) {
  const m = input.match(/^(\/\w+)(?:\s+(.+))?$/)
  if (!m) return input
  const cmd = SLASH_COMMANDS.find((c) => c.cmd === m[1])
  return cmd ? cmd.expand((m[2] || '').trim(), ctx) : input
}

function PromptChip({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 px-3 py-1.5 rounded-full bg-surface-container-low/50 hover:bg-ai-glow/10 border border-border-subtle hover:border-ai-glow/30 font-mono text-[10px] text-text-dim hover:text-ai-glow uppercase tracking-wider transition-colors whitespace-nowrap"
    >
      {label}
    </button>
  )
}

export default function ChatPanel() {
  const open      = useChat((s) => s.open)
  const messages  = useChat((s) => s.messages)
  const streaming = useChat((s) => s.streaming)
  const panelCtx  = useChat((s) => s.panelContext)
  const close     = useChat((s) => s.close)
  const send      = useChat((s) => s.send)
  const newChat   = useChat((s) => s.newConversation)

  const [input, setInput] = useState('')
  const inputRef = useRef(null)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, streaming])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim() || streaming) return
    send(maybeExpandSlash(input, panelCtx))
    setInput('')
  }

  function quickSend(text) {
    if (streaming) return
    send(maybeExpandSlash(text, panelCtx))
  }

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-[480px] max-w-[92vw] z-50 flex flex-col bg-[#0a0b0e]/95 backdrop-blur-md border-l border-border-subtle shadow-2xl transition-transform duration-200 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="px-5 h-14 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div className="min-w-0">
              <p className="font-sans text-sm font-black text-on-surface tracking-tight leading-none">ValueGPT</p>
              <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] mt-0.5 truncate">
                {panelCtx?.ticker
                  ? `Context: ${panelCtx.ticker}${panelCtx.snapshot?.price ? ' · $' + Number(panelCtx.snapshot.price).toLocaleString() : ''}`
                  : 'No asset loaded'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={newChat}
              title="New conversation"
              className="p-1.5 text-text-dim hover:text-ai-glow hover:bg-white/[0.04] rounded-md transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add_circle</span>
            </button>
            <button
              onClick={close}
              title="Close (Esc)"
              className="p-1.5 text-text-dim hover:text-on-surface hover:bg-white/[0.04] rounded-md transition-colors"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
            </button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-6">
              <span className="material-symbols-outlined text-ai-glow/40 mb-3" style={{ fontSize: 40, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <p className="font-sans text-sm text-on-surface mb-1.5">Ask ValueGPT anything</p>
              <p className="font-mono text-[10px] text-text-dim/60 leading-relaxed max-w-[280px]">
                I see what you see on the terminal — prices, news, ETF flows, macro events. Cite news with [news:N].
              </p>
              <div className="mt-5 flex flex-col gap-2 w-full max-w-[300px]">
                <button onClick={() => quickSend('Why did this asset move today?')} className="px-3 py-2 rounded-lg bg-surface-container-low/40 hover:bg-ai-glow/10 border border-border-subtle hover:border-ai-glow/30 text-left font-sans text-[12px] text-text-dim hover:text-on-surface transition-colors">
                  Why did this asset move today?
                </button>
                <button onClick={() => quickSend('/summary')} className="px-3 py-2 rounded-lg bg-surface-container-low/40 hover:bg-ai-glow/10 border border-border-subtle hover:border-ai-glow/30 text-left font-sans text-[12px] text-text-dim hover:text-on-surface transition-colors">
                  /summary — re-brief this asset
                </button>
                <button onClick={() => quickSend('/scenario bull')} className="px-3 py-2 rounded-lg bg-surface-container-low/40 hover:bg-ai-glow/10 border border-border-subtle hover:border-ai-glow/30 text-left font-sans text-[12px] text-text-dim hover:text-on-surface transition-colors">
                  /scenario bull — what's the upside trigger?
                </button>
              </div>
            </div>
          ) : (
            (() => {
              const firstAssistantIdx = messages.findIndex((m) => m.role === 'assistant')
              return messages.map((m, i) => (
                <MessageBubble
                  key={i}
                  role={m.role}
                  content={m.content}
                  streaming={streaming && i === messages.length - 1 && m.role === 'assistant'}
                  editorial={i === firstAssistantIdx}
                />
              ))
            })()
          )}
        </div>

        {messages.length > 0 && (
          <div className="px-5 py-2 border-t border-border-subtle/50 flex gap-2 overflow-x-auto flex-shrink-0">
            {SLASH_COMMANDS.map((c) => (
              <PromptChip key={c.cmd} label={c.cmd} onClick={() => quickSend(c.cmd)} />
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-border-subtle flex-shrink-0">
          <div className="flex items-center gap-2 bg-surface-container-low/50 border border-border-subtle focus-within:border-ai-glow/40 rounded-lg px-3 py-2 transition-colors">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ValueGPT… (try /summary, /scenario, /rebalance)"
              className="flex-1 bg-transparent border-none focus:ring-0 font-sans text-[13px] text-on-surface placeholder:text-text-dim/40 outline-none"
              autoComplete="off"
              spellCheck={false}
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || streaming}
              className="flex-shrink-0 p-1.5 rounded-md bg-ai-glow text-on-primary disabled:bg-surface-container disabled:text-text-dim/40 transition-colors hover:opacity-90"
              title="Send"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>
                {streaming ? 'pending' : 'arrow_upward'}
              </span>
            </button>
          </div>
        </form>
      </aside>
    </>
  )
}
