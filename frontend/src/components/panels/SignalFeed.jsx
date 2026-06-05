import React, { useState, useEffect, useRef } from 'react'

const TABS = [
  { id: 'all',          label: 'All'    },
  { id: 'news',         label: 'News'   },
  { id: 'kol',          label: 'KOL'    },
  { id: 'announcement', label: 'Alerts' },
]

function signalMeta(item) {
  const tags  = item.tags  || []
  const cat   = item.category  || ''
  const sent  = item.sentiment || ''
  const title = (item.title    || '').toLowerCase()

  if (cat === 'kol')          return { label: 'Analyst View',   cls: 'text-secondary' }
  if (cat === 'research')     return { label: 'Research Note',  cls: 'text-tertiary-container' }
  if (cat === 'announcement') return { label: 'Alert',          cls: 'text-data-orange' }

  const hasETF   = tags.includes('ETF')    || title.includes('etf')     || title.includes('inflow') || title.includes('aum')
  const hasMacro = tags.includes('macro')  || title.includes('cpi')     || title.includes('fomc')   || title.includes('nfp') || title.includes('inflation')
  const hasWhale = title.includes('whale') || title.includes('acquir')  || title.includes('accumul') || title.includes('purchase')

  if (hasETF)   return sent === 'negative' ? { label: 'ETF Outflow',    cls: 'text-error'              } : { label: 'ETF Inflow',       cls: 'text-ai-glow' }
  if (hasMacro) return { label: 'Macro Signal',   cls: 'text-tertiary-container' }
  if (hasWhale) return { label: 'Whale Activity', cls: 'text-ai-glow' }

  if (sent === 'positive') return { label: 'Bullish Signal', cls: 'text-ai-glow' }
  if (sent === 'negative') return { label: 'Bearish Signal', cls: 'text-error'   }
  return { label: 'Market Update', cls: 'text-text-dim' }
}

function NewsItem({ item }) {
  const sig = signalMeta(item)
  return (
    <article data-news-id={item.id} className="p-inner-padding border-b border-border-subtle/50 hover:bg-white/[0.02] transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-2 py-0.5">
        <span className={`font-label-xs text-[9px] uppercase tracking-wider font-black ${sig.cls}`}>
          {sig.label}
        </span>
        <span className="font-label-xs text-[9px] text-text-dim flex-shrink-0 ml-2">{item.time}</span>
      </div>
      <h4 className="font-headline-md text-sm leading-relaxed text-on-surface group-hover:text-primary transition-colors tracking-tight line-clamp-2 py-1">
        {item.title}
      </h4>
      <p className="font-label-xs text-[9px] text-text-dim/60 mt-3 uppercase tracking-widest opacity-60 py-0.5">
        {item.source}
        {item.tags?.length ? ` · ${item.tags.slice(0, 2).join(' · ')}` : ''}
      </p>
    </article>
  )
}

function MacroCountdown({ snapshot }) {
  return (
    <div className="p-inner-padding border-b border-border-subtle bg-surface-container-low/30">
      <div className="flex justify-between items-center py-1">
        <div>
          <p className="font-label-xs text-[9px] text-text-dim uppercase tracking-widest mb-1.5">Next Release</p>
          <p className="font-sans text-sm font-semibold text-on-surface leading-normal">{snapshot.nextDate}</p>
        </div>
        <div className="text-right">
          <p className="font-label-xs text-[9px] text-text-dim uppercase tracking-widest mb-1.5">Countdown</p>
          <p className="font-data-md text-2xl font-bold text-tertiary-container tabular-nums leading-none">{snapshot.daysToNext}d</p>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-border-subtle/50 grid grid-cols-2 gap-3 py-1">
        <div>
          <p className="font-label-xs text-[9px] text-text-dim uppercase tracking-widest mb-1">Last Actual</p>
          <p className="font-data-md text-base font-bold text-ai-glow mt-0.5">{snapshot.lastActual}</p>
        </div>
        <div>
          <p className="font-label-xs text-[9px] text-text-dim uppercase tracking-widest mb-1">Forecast</p>
          <p className="font-data-md text-base font-bold text-on-surface mt-0.5">{snapshot.lastForecast}</p>
        </div>
      </div>
    </div>
  )
}

function ConstituentRow({ item }) {
  const isUp = item.change24h >= 0
  return (
    <div className="p-inner-padding border-b border-border-subtle/60 hover:bg-white/[0.02] transition-colors flex items-center justify-between py-5.5">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-data-lg text-sm font-bold text-on-surface w-12 flex-shrink-0">{item.ticker}</span>
        <span className="font-sans text-xs text-text-dim truncate py-0.5">{item.name}</span>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0 ml-2">
        <span className="font-data-md text-[10px] text-text-dim tabular-nums py-0.5">{item.weight}%</span>
        <span className={`font-data-md text-xs font-bold tabular-nums py-0.5 ${isUp ? 'text-ai-glow' : 'text-error'}`}>
          {isUp ? '+' : ''}{item.change24h.toFixed(2)}%
        </span>
      </div>
    </div>
  )
}

export default function SignalFeed({ data }) {
  const [activeTab, setActiveTab] = useState('all')
  const scrollContainerRef = useRef(null)

  // Listen for citation clicks from ValueGPT → scroll + highlight the news item
  useEffect(() => {
    function handleScroll(e) {
      const id = e.detail?.id
      if (id == null) return
      const el = document.querySelector(`[data-news-id="${id}"]`)
      if (!el) return
      // Make sure the news tab is active so the item is visible
      setActiveTab('all')
      requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.classList.add('ring-2', 'ring-ai-glow/60')
        setTimeout(() => el.classList.remove('ring-2', 'ring-ai-glow/60'), 1800)
      })
    }
    window.addEventListener('cryptodesk:scroll-to-news', handleScroll)
    return () => window.removeEventListener('cryptodesk:scroll-to-news', handleScroll)
  }, [])

  if (!data || data.type === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3 px-6 text-center">
        <span className="material-symbols-outlined text-border-subtle" style={{ fontSize: 36 }}>trending_up</span>
        <p className="font-label-xs text-[10px] text-text-dim uppercase tracking-widest">Signal Feed</p>
        <p className="font-sans text-xs text-text-dim/40">Search any asset to load live signals</p>
      </div>
    )
  }

  const news     = data.news || []
  const filtered = activeTab === 'all' ? news : news.filter((n) => n.category === activeTab)

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-inner-padding border-b border-border-subtle flex items-center justify-between flex-shrink-0 h-14">
        <h3 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Signal Feed</h3>
        <span className="font-data-md text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
          {news.length} LIVE
        </span>
      </div>

      {/* Macro countdown */}
      {data.type === 'macro' && data.snapshot && <MacroCountdown snapshot={data.snapshot} />}

      {/* Tabs */}
      {data.type !== 'index' && (
        <div className="flex bg-black/15 border-b border-border-subtle flex-shrink-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors border-r border-border-subtle last:border-r-0 ${
                activeTab === tab.id
                  ? 'text-ai-glow bg-ai-glow/5 font-bold'
                  : 'text-text-dim hover:bg-white/[0.03] hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="flex-1 overflow-y-auto">
        {data.type === 'index' && data.constituents ? (
          <>
            <div className="px-5 py-2.5 border-b border-border-subtle bg-surface-container-low/20">
              <span className="font-mono text-[10px] text-text-dim uppercase tracking-widest">
                Constituents · {data.constituents.length} assets
              </span>
            </div>
            {data.constituents.map((c) => (
              <ConstituentRow key={c.ticker} item={c} />
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24">
            <span className="font-mono text-[10px] text-text-dim/40">No items in this category</span>
          </div>
        ) : (
          filtered.map((item) => <NewsItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
