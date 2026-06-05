import React, { useEffect, useState } from 'react'
import EtfHeatmap from '../components/markets/EtfHeatmap'
import { useChat } from '../store/chat'
import AskWhy from '../components/ValueGPT/AskWhy'

const SSI_TICKERS = ['MAG7', 'LAYER1', 'DEFI', 'LAYER2', 'MEME', 'GAMERS']
const MACRO_EVENTS = ['CPI', 'FOMC', 'NFP', 'PCE']

function todayLine() {
  const d = new Date()
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toUpperCase()
}

// ─── MORNING BRIEF — editorial centerpiece ───────────────────────────────────
function MorningBrief() {
  const openChat = useChat((s) => s.openChat)
  const setPanelContext = useChat((s) => s.setPanelContext)
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Use BTC as the market bellwether for the morning brief
    fetch('/api/currency/btc')
      .then((r) => r.json())
      .then(async (currency) => {
        const news = await fetch('/api/news?currency_id=btc').then((r) => r.json()).catch(() => ({ items: [] }))
        const briefRes = await fetch('/api/ai/brief', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            context: 'currency',
            ticker: 'BTC',
            data: { snapshot: currency.snapshot, news: (news.items || []).slice(0, 3).map((n) => ({ id: n.id, title: n.title })) },
          }),
        }).then((r) => r.json())
        setBrief({ text: briefRes.brief || '', snapshot: currency.snapshot, news: news.items || [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function openDeepDive() {
    if (brief) {
      setPanelContext({
        type: 'currency',
        ticker: 'BTC',
        snapshot: brief.snapshot,
        news: brief.news,
      })
    }
    openChat({ seed: "Take the morning brief and go deeper: what's the one trade idea that follows from this setup, and what would invalidate it?" })
  }

  return (
    <article className="bento-box rounded-xl p-8 lg:p-10 col-span-12 lg:col-span-8 relative overflow-hidden">
      {/* Background ai-glow flare */}
      <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-[0.06] blur-3xl bg-ai-glow pointer-events-none" />

      <header className="flex items-center justify-between mb-6 pb-4 border-b border-border-subtle/40">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-ai-glow font-black tracking-[0.25em] uppercase">Morning Brief</span>
          <span className="font-mono text-[10px] text-text-dim/60 tracking-widest">·</span>
          <span className="font-mono text-[10px] text-text-dim tracking-[0.2em] uppercase">{todayLine()}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          <span className="font-mono text-[9px] text-ai-glow font-bold tracking-widest uppercase">by ValueGPT</span>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center gap-2 py-12 px-2">
          <span className="material-symbols-outlined text-ai-glow/40 animate-pulse" style={{ fontSize: 20 }}>auto_awesome</span>
          <span className="font-mono text-[11px] text-text-dim/60 uppercase tracking-widest">Reading the tape…</span>
        </div>
      ) : (
        <>
          <p className="font-sans text-[22px] lg:text-[26px] leading-snug text-on-surface font-medium italic tracking-tight mb-6">
            <span className="text-ai-glow text-[34px] lg:text-[40px] font-black leading-none mr-1.5 align-baseline">"</span>
            {brief?.text || 'BTC consolidates near ATH as institutional ETF demand holds the structural floor.'}
            <span className="text-ai-glow text-[34px] lg:text-[40px] font-black leading-none ml-1 align-baseline">"</span>
          </p>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2 pt-2 pb-5 border-t border-border-subtle/30">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">BTC</span>
              <span className="font-mono text-base font-black text-on-surface tabular-nums">${brief?.snapshot?.price?.toLocaleString() ?? '—'}</span>
              <span className={`font-mono text-sm font-bold tabular-nums ${(brief?.snapshot?.change24h ?? 0) >= 0 ? 'text-ai-glow' : 'text-error'}`}>
                {(brief?.snapshot?.change24h ?? 0) >= 0 ? '+' : ''}{brief?.snapshot?.change24h ?? 0}%
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">ETF 7D</span>
              <span className="font-mono text-base font-black text-data-blue tabular-nums">{brief?.snapshot?.etfNetInflow7d ?? '—'}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[9px] text-text-dim uppercase tracking-widest">Dominance</span>
              <span className="font-mono text-base font-black text-on-surface tabular-nums">{brief?.snapshot?.dominance ?? '—'}%</span>
            </div>
          </div>

          <button
            onClick={openDeepDive}
            className="group inline-flex items-center gap-2 mt-4 px-4 py-2.5 rounded-lg bg-ai-glow/10 hover:bg-ai-glow/15 border border-ai-glow/30 hover:border-ai-glow/50 font-mono text-[10px] text-ai-glow font-black uppercase tracking-widest transition-colors"
          >
            Read deeper with ValueGPT
            <span className="material-symbols-outlined group-hover:translate-x-0.5 transition-transform" style={{ fontSize: 14 }}>arrow_forward</span>
          </button>
        </>
      )}
    </article>
  )
}

// ─── MACRO CLOCK — masthead sidecar ──────────────────────────────────────────
function MacroClock() {
  const [events, setEvents] = useState([])

  useEffect(() => {
    Promise.allSettled(
      MACRO_EVENTS.map((ev) => fetch(`/api/macro?event=${ev}`).then((r) => r.ok ? r.json() : null))
    ).then((results) => {
      const rows = results
        .map((r, i) => r.status === 'fulfilled' && r.value?.snapshot ? { event: MACRO_EVENTS[i], ...r.value.snapshot } : null)
        .filter(Boolean)
        .sort((a, b) => (a.daysToNext ?? 99) - (b.daysToNext ?? 99))
      setEvents(rows)
    })
  }, [])

  return (
    <aside className="bento-box rounded-xl p-6 lg:p-7 col-span-12 lg:col-span-4 flex flex-col">
      <header className="flex items-center justify-between mb-5 pb-4 border-b border-border-subtle/40">
        <span className="font-mono text-[10px] text-text-dim font-black tracking-[0.25em] uppercase">Macro Clock</span>
        <span className="material-symbols-outlined text-text-dim/40" style={{ fontSize: 14, fontVariationSettings: "'FILL' 1" }}>schedule</span>
      </header>

      {events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center font-mono text-[10px] text-text-dim/40 uppercase tracking-widest py-8">Loading…</div>
      ) : (
        <ul className="space-y-4 flex-1">
          {events.map((e) => {
            const urgent = e.daysToNext < 1
            const soon = e.daysToNext <= 3
            return (
              <li key={e.event} className="flex items-baseline justify-between gap-3 group">
                <div className="min-w-0">
                  <p className={`font-sans text-base font-bold tracking-tight ${urgent ? 'text-error' : 'text-on-surface'}`}>{e.event}</p>
                  <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mt-0.5">{e.nextDate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-mono text-2xl font-black tabular-nums leading-none ${urgent ? 'text-error animate-pulse' : soon ? 'text-tertiary-container' : 'text-text-dim'}`}>
                    {e.daysToNext === 0 ? '0' : e.daysToNext}<span className="text-[10px] ml-0.5 font-bold uppercase">d</span>
                  </p>
                  <p className="font-mono text-[8px] text-text-dim/50 mt-1 uppercase tracking-wider">
                    {e.lastActual ? `was ${e.lastActual}` : ''}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

// ─── SECTOR CARD ─────────────────────────────────────────────────────────────
function SectorCard({ ticker, snapshot }) {
  const change = snapshot?.change24h ?? snapshot?.roi1m ?? 0
  const isUp = change >= 0
  return (
    <div className="bento-box rounded-xl p-5 hover:border-ai-glow/40 transition-colors group">
      <div className="flex items-baseline justify-between mb-3">
        <span className="font-sans text-lg font-black tracking-tight text-on-surface">{ticker}</span>
        <AskWhy prompt={`The ${ticker} SSI sector index is ${Number(change).toFixed(2)}% over the last period. What's driving this — which constituent(s), and what's the macro setup behind it?`}>
          <span className={`font-mono text-sm font-black tabular-nums ${isUp ? 'text-ai-glow' : 'text-error'}`}>
            {isUp ? '+' : ''}{Number(change).toFixed(2)}%
          </span>
        </AskWhy>
      </div>
      <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-4">
        {snapshot?.aum ? `AUM $${snapshot.aum}` : '—'}
      </p>
      <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-subtle/30">
        {[['roi1m', '1M'], ['roi3m', '3M'], ['roi1y', '1Y']].map(([k, label]) => {
          const v = snapshot?.[k]
          return (
            <div key={k}>
              <p className="font-mono text-[8px] text-text-dim/50 uppercase">{label}</p>
              <p className={`font-mono text-xs font-bold tabular-nums mt-1 ${v == null ? 'text-text-dim/40' : v >= 0 ? 'text-ai-glow' : 'text-error'}`}>
                {v == null ? '—' : `${v >= 0 ? '+' : ''}${v}%`}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectorRotation() {
  const [sectors, setSectors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.allSettled(
      SSI_TICKERS.map((t) => fetch(`/api/index/${t}`).then((r) => r.ok ? r.json() : null))
    ).then((results) => {
      const rows = results
        .map((r, i) => r.status === 'fulfilled' && r.value?.snapshot ? { ticker: SSI_TICKERS[i], snapshot: r.value.snapshot } : null)
        .filter(Boolean)
        .sort((a, b) => (b.snapshot?.roi1m ?? 0) - (a.snapshot?.roi1m ?? 0))
      setSectors(rows)
      setLoading(false)
    })
  }, [])

  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h4 className="font-sans text-lg font-black tracking-tight text-on-surface">Sector Rotation</h4>
          <p className="font-mono text-[9px] text-text-dim/60 uppercase tracking-widest mt-1">SSI indices · ranked by 1M return</p>
        </div>
        <span className="font-mono text-[9px] text-text-dim/40 uppercase tracking-wider">{sectors.length} sectors</span>
      </div>
      {loading ? (
        <div className="h-32 flex items-center justify-center font-mono text-[10px] text-text-dim/40 uppercase tracking-widest">Loading sectors…</div>
      ) : sectors.length === 0 ? (
        <div className="h-32 flex items-center justify-center font-mono text-[10px] text-text-dim/40 uppercase tracking-widest">No sector data available</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 xl:grid-cols-3 gap-4">
          {sectors.map((s) => <SectorCard key={s.ticker} {...s} />)}
        </div>
      )}
    </section>
  )
}

export default function MarketIntelView() {
  const openChat = useChat((s) => s.openChat)

  return (
    <div className="h-full w-full min-w-0 flex flex-col gap-8 overflow-y-auto pb-8">
      {/* Page chrome */}
      <header className="flex flex-col sm:flex-row sm:items-end gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] text-ai-glow font-black tracking-[0.25em] uppercase mb-2">The Desk</p>
          <h2 className="font-sans text-3xl lg:text-4xl font-black tracking-tighter text-on-surface leading-none">Market Intel</h2>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mt-3">Cross-asset rotation · ETF flows · macro proximity</p>
        </div>
        <button
          onClick={() => openChat({ seed: "Looking at sector rotation, ETF flows, and the macro calendar — what's the single most important signal today, and which asset would you focus on?" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ai-glow text-on-primary font-mono text-[11px] font-black uppercase tracking-wider hover:opacity-90 active-nav-glow transition-opacity self-start sm:self-auto cursor-pointer"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
          Ask ValueGPT
        </button>
      </header>

      {/* Masthead — asymmetric 8/4 split */}
      <div className="grid grid-cols-12 gap-6">
        <MorningBrief />
        <MacroClock />
      </div>

      {/* ETF heatmap — full width strip */}
      <EtfHeatmap />

      {/* Sector grid — 2/3/6 column responsive */}
      <SectorRotation />
    </div>
  )
}
