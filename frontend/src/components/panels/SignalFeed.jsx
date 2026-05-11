import React, { useState } from 'react'

const CATEGORY_TABS = [
  { id: 'all', label: 'All' },
  { id: 'news', label: 'News' },
  { id: 'research', label: 'Research' },
  { id: 'kol', label: 'KOL' },
  { id: 'announcement', label: 'Alerts' },
]

const SENTIMENT_DOT = {
  positive: 'bg-green-400',
  negative: 'bg-red-400',
  neutral: 'bg-zinc-500',
}

function NewsItem({ item }) {
  return (
    <article className="px-3 py-2.5 border-b border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer group">
      <div className="flex items-start gap-2">
        <span className={`mt-1.5 size-1.5 rounded-full flex-shrink-0 ${SENTIMENT_DOT[item.sentiment] || 'bg-zinc-500'}`} />
        <div className="min-w-0">
          <p className="text-xs text-zinc-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-zinc-500 font-mono">{item.source}</span>
            <span className="text-[10px] text-zinc-600">·</span>
            <span className="text-[10px] text-zinc-600 font-mono">{item.time}</span>
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[9px] px-1 py-px rounded bg-zinc-800 text-zinc-500 font-mono uppercase tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

function MacroCountdown({ snapshot }) {
  return (
    <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
      <div className="flex justify-between items-center">
        <div>
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Next Release</div>
          <div className="text-xs text-zinc-200 font-mono mt-0.5">{snapshot.nextDate}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Days Away</div>
          <div className="text-lg font-mono text-amber-400 tabular-nums">{snapshot.daysToNext}d</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-zinc-800">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[9px] font-mono text-zinc-600 uppercase">Last Actual</div>
            <div className="text-sm font-mono text-green-400">{snapshot.lastActual}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-zinc-600 uppercase">Last Forecast</div>
            <div className="text-sm font-mono text-zinc-400">{snapshot.lastForecast}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ConstituentRow({ item }) {
  const isUp = item.change24h >= 0
  return (
    <div className="px-3 py-2 border-b border-zinc-800 hover:bg-zinc-900 transition-colors flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-zinc-200 w-10">{item.ticker}</span>
        <span className="text-[10px] text-zinc-500">{item.name}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-[10px] text-zinc-500 font-mono tabular-nums">{item.weight}%</div>
        <div className={`text-xs font-mono tabular-nums ${isUp ? 'text-green-400' : 'text-red-400'}`}>
          {isUp ? '+' : ''}{item.change24h.toFixed(2)}%
        </div>
      </div>
    </div>
  )
}

export default function SignalFeed({ data }) {
  const [activeTab, setActiveTab] = useState('all')

  if (!data || data.type === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="text-zinc-700 text-xs font-mono">SIGNAL FEED</div>
        <div className="text-zinc-600 text-[10px] font-mono">Search to load feed</div>
      </div>
    )
  }

  const news = data.news || []
  const filtered = activeTab === 'all' ? news : news.filter((n) => n.category === activeTab)

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Signal Feed</span>
        </div>
        <span className="text-xs font-mono text-zinc-600">{news.length} items</span>
      </div>

      {data.type === 'macro' && data.snapshot && (
        <MacroCountdown snapshot={data.snapshot} />
      )}

      {data.type !== 'index' && (
        <div className="flex border-b border-zinc-800 flex-shrink-0 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2.5 text-[11px] font-mono uppercase tracking-wide transition-colors flex-shrink-0 active:scale-[0.97] ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 -mb-px'
                  : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {data.type === 'index' && data.constituents ? (
          <>
            <div className="px-3 py-2 border-b border-zinc-800 bg-zinc-900/50">
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Constituents · {data.constituents.length} assets
              </span>
            </div>
            {data.constituents.map((c) => (
              <ConstituentRow key={c.ticker} item={c} />
            ))}
          </>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-zinc-700 text-[10px] font-mono">
            No items in this category
          </div>
        ) : (
          filtered.map((item) => <NewsItem key={item.id} item={item} />)
        )}
      </div>
    </div>
  )
}
