import React from 'react'
import { SEARCH_SUGGESTIONS } from '../../data/mockData'

const CONTEXT_COLORS = {
  currency: 'text-green-400 bg-green-950/40 border-green-900/50',
  macro: 'text-amber-400 bg-amber-950/40 border-amber-900/50',
  stock: 'text-purple-400 bg-purple-950/40 border-purple-900/50',
  index: 'text-blue-400 bg-blue-950/40 border-blue-900/50',
}

const CONTEXT_LABELS = {
  currency: 'CRYPTO',
  macro: 'MACRO EVENT',
  stock: 'CRYPTO STOCK',
  index: 'SSI INDEX',
}

export default function TopBar({ q, onQChange, onSearch, activeContext, activeTicker, loading }) {
  function handleKey(e) {
    if (e.key === 'Enter') onSearch(q.trim())
  }

  const contextType = activeContext?.type
  const contextColor = CONTEXT_COLORS[contextType] || ''
  const contextLabel = CONTEXT_LABELS[contextType] || ''

  return (
    <header className="border-b border-zinc-800 bg-zinc-950 flex-shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-sm bg-blue-500" />
            <span className="text-sm font-mono font-semibold text-white tracking-tight">CRYPTODESK</span>
          </div>
          <span className="text-[10px] font-mono text-zinc-600 border-l border-zinc-800 pl-3">
            The Crypto Bloomberg Terminal · Built on SoSoValue
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-600">LIVE</span>
          </div>

          {contextType && (
            <div className={`px-2 py-0.5 rounded border text-[9px] font-mono font-semibold ${contextColor}`}>
              {contextLabel}
            </div>
          )}

          <div className="text-[9px] font-mono text-zinc-700 tabular-nums">
            {new Date().toUTCString().slice(17, 25)} UTC
          </div>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-3">
        <div className="flex-1 relative">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 text-[11px] font-mono pointer-events-none select-none w-6 text-center">
            {loading
              ? <svg className="animate-spin size-3 text-blue-500 mx-auto" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>
              : '>_'
            }
          </div>
          <input
            aria-label="Search CryptoDesk"
            placeholder="Search: BTC · CPI · MSTR · MAG7 · FOMC · SOL → press Enter"
            className="w-full bg-zinc-900 border border-zinc-800 rounded text-sm font-mono text-zinc-200 placeholder:text-zinc-600 pl-11 pr-3 py-3 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700/30 transition-colors"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <button
          onClick={() => onSearch(q.trim())}
          className="px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-mono uppercase tracking-wider transition-colors flex-shrink-0 active:scale-[0.97]"
        >
          Search
        </button>

        <div className="flex gap-2 flex-shrink-0 pl-1 border-l border-zinc-800">
          {SEARCH_SUGGESTIONS.slice(0, 6).map((s) => (
            <button
              key={s}
              onClick={() => onSearch(s)}
              className={`px-2.5 py-1.5 rounded border text-[9px] font-mono tracking-wide transition-colors active:scale-[0.97] ${
                activeTicker === s
                  ? 'border-blue-600 bg-blue-900/30 text-blue-300'
                  : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
