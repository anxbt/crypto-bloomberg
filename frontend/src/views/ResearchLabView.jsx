import React, { useEffect, useState } from 'react'
import { useChat, listConversations, deleteConversation, seedConversationsIfEmpty } from '../store/chat'
import { buildSeedChats } from '../data/seedChats'

function relativeTime(ms) {
  const diff = Date.now() - ms
  const min = 60 * 1000, hour = 60 * min, day = 24 * hour
  if (diff < min)    return 'just now'
  if (diff < hour)   return `${Math.floor(diff / min)}m ago`
  if (diff < day)    return `${Math.floor(diff / hour)}h ago`
  if (diff < 7*day)  return `${Math.floor(diff / day)}d ago`
  return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const SCENARIO_CARDS = [
  { ticker: 'BTC',  bull: { target: '$118,000', prob: 65, trigger: 'CPI beat + ETF inflow > $1B/day sustains above $105K' }, bear: { target: '$92,000',  prob: 35, trigger: 'CPI miss > 0.2% or Fed hawkish surprise triggers profit-taking below $100K' } },
  { ticker: 'MSTR', bull: { target: '$525',     prob: 60, trigger: 'mNAV expansion + BTC > $110K sustains ATM flywheel' },     bear: { target: '$340',     prob: 40, trigger: 'mNAV compresses below 2.4x as institutional pure-play access broadens' } },
  { ticker: 'SOL',  bull: { target: '$280',     prob: 58, trigger: 'Spot ETF approval + revenue from Firedancer activation' },  bear: { target: '$120',     prob: 42, trigger: 'Validator outage or memecoin volume collapse drops on-chain fees' } },
]

function ConversationCard({ chat, onOpen, onDelete }) {
  return (
    <div className="bento-box rounded-xl p-4 hover:border-ai-glow/40 hover:bg-white/[0.02] transition-colors group relative">
      <button onClick={onOpen} className="w-full text-left">
        <div className="flex items-start justify-between mb-2 gap-2">
          <p className="font-sans text-sm font-bold text-on-surface leading-snug line-clamp-2 flex-1">{chat.title}</p>
          <span className="material-symbols-outlined text-text-dim/40 group-hover:text-ai-glow flex-shrink-0 transition-colors" style={{ fontSize: 14 }}>arrow_outward</span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-3">
          <div className="flex flex-wrap gap-1 min-w-0">
            {(chat.tickers || []).slice(0, 3).map((t) => (
              <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-ai-glow/10 text-ai-glow font-bold uppercase tracking-wider">{t}</span>
            ))}
          </div>
          <span className="font-mono text-[9px] text-text-dim/60 uppercase tracking-wider flex-shrink-0">{relativeTime(chat.lastMessageAt)}</span>
        </div>
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); onDelete() }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-text-dim/40 hover:text-error"
        title="Delete conversation"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
      </button>
    </div>
  )
}

function ScenarioCard({ ticker, bull, bear }) {
  const openChat = useChat((s) => s.openChat)
  return (
    <div className="bento-box rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-sans text-lg font-black tracking-tight text-on-surface">{ticker}</span>
        <button
          onClick={() => openChat({ seed: `Run a fresh bull and bear scenario for ${ticker} using the current snapshot. Compare against my prior thinking: bull target ${bull.target} @ ${bull.prob}%, bear target ${bear.target} @ ${bear.prob}%.` })}
          className="font-mono text-[9px] text-ai-glow hover:text-on-surface uppercase tracking-widest flex items-center gap-1"
        >
          Run live
          <span className="material-symbols-outlined" style={{ fontSize: 11 }}>refresh</span>
        </button>
      </div>
      <div className="space-y-3">
        <div className="p-4 rounded-xl bg-ai-glow/5 border border-ai-glow/20">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-[10px] text-ai-glow font-black tracking-wider uppercase">Bull · {bull.prob}%</span>
            <span className="font-mono text-base text-ai-glow font-black tabular-nums">{bull.target}</span>
          </div>
          <p className="font-sans text-[12px] text-text-dim leading-relaxed">{bull.trigger}</p>
        </div>
        <div className="p-4 rounded-xl bg-error/5 border border-error/20">
          <div className="flex items-baseline justify-between mb-2">
            <span className="font-mono text-[10px] text-error font-black tracking-wider uppercase">Bear · {bear.prob}%</span>
            <span className="font-mono text-base text-error font-black tabular-nums">{bear.target}</span>
          </div>
          <p className="font-sans text-[12px] text-text-dim leading-relaxed">{bear.trigger}</p>
        </div>
      </div>
    </div>
  )
}

function BacktestCard() {
  const openChat = useChat((s) => s.openChat)
  return (
    <div className="bento-box rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">Macro Backtest</h4>
          <p className="font-mono text-[10px] text-text-dim/50 mt-0.5">Historical pattern → BTC reaction</p>
        </div>
        <span className="material-symbols-outlined text-ai-glow/40" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>history</span>
      </div>
      <p className="font-sans text-[14px] leading-relaxed text-on-surface mb-3">
        Last 8 times <span className="text-ai-glow font-bold">CPI printed ≥0.1% below forecast</span>, BTC averaged{' '}
        <span className="text-ai-glow font-black tabular-nums">+3.4% in 24h</span> (pattern holds 75% of the time).
      </p>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-ai-glow/5 border border-ai-glow/20 rounded-xl p-4 text-center">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-1">Hit Rate</p>
          <p className="font-mono text-2xl font-black text-ai-glow tabular-nums">75%</p>
        </div>
        <div className="bg-surface-container/40 border border-border-subtle rounded-xl p-4 text-center">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-1">Avg 24h</p>
          <p className="font-mono text-2xl font-black text-on-surface tabular-nums">+3.4%</p>
        </div>
        <div className="bg-surface-container/40 border border-border-subtle rounded-xl p-4 text-center">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-wider mb-1">Sample</p>
          <p className="font-mono text-2xl font-black text-text-dim tabular-nums">8</p>
        </div>
      </div>
      <button
        onClick={() => openChat({ seed: "Run a fresh backtest on CPI surprises vs BTC's 24h move. What's the current setup telling us about the next CPI print?" })}
        className="w-full px-4 py-2.5 min-h-[40px] rounded-lg bg-surface-container-low/50 hover:bg-ai-glow/10 border border-border-subtle hover:border-ai-glow/30 font-mono text-[10px] text-text-dim hover:text-ai-glow uppercase tracking-widest transition-colors cursor-pointer"
      >
        Ask ValueGPT to extend the backtest →
      </button>
    </div>
  )
}

export default function ResearchLabView() {
  const openChat = useChat((s) => s.openChat)
  const [conversations, setConversations] = useState([])

  useEffect(() => {
    seedConversationsIfEmpty(buildSeedChats)
    setConversations(listConversations())
  }, [])

  function handleOpen(id) { openChat({ conversationId: id }) }
  function handleDelete(id) {
    deleteConversation(id)
    setConversations(listConversations())
  }

  return (
    <div className="h-full w-full min-w-0 flex flex-col gap-8 overflow-y-auto pb-8">
      <header className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] text-ai-glow font-black tracking-[0.25em] uppercase mb-2">The Lab</p>
          <h2 className="font-sans text-3xl lg:text-4xl font-black tracking-tighter text-on-surface leading-none">Research Lab</h2>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mt-3">Conversations · Scenarios · Backtests</p>
        </div>
        <button
          onClick={() => { useChat.getState().newConversation(); openChat() }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ai-glow text-on-primary font-mono text-[11px] font-black uppercase tracking-wider hover:opacity-90 active-nav-glow transition-opacity self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          New Analysis
        </button>
      </header>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">Saved Conversations</h4>
          <span className="font-mono text-[9px] text-text-dim/50 uppercase tracking-wider">{conversations.length} total</span>
        </div>
        {conversations.length === 0 ? (
          <div className="bento-box rounded-xl p-8 text-center">
            <p className="font-mono text-[10px] text-text-dim/50 uppercase tracking-widest">No saved conversations yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            {conversations.map((c) => (
              <ConversationCard key={c.id} chat={c} onOpen={() => handleOpen(c.id)} onDelete={() => handleDelete(c.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">Scenario Library</h4>
          <span className="font-mono text-[9px] text-text-dim/50 uppercase tracking-wider">Bull / Bear · core assets</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5">
          {SCENARIO_CARDS.map((s) => <ScenarioCard key={s.ticker} {...s} />)}
        </div>
      </section>

      <BacktestCard />
    </div>
  )
}
