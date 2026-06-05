import React, { useRef, useEffect } from 'react'
import MacroBadge from './MacroBadge'

const ASSET_TABS = ['BTC', 'ETH', 'SOL', 'CPI', 'MSTR', 'MAG7']

const CONTEXT_BADGE = {
  currency: { label: 'CRYPTO',    cls: 'text-ai-glow   border-ai-glow/30   bg-ai-glow/10'   },
  macro:    { label: 'MACRO',     cls: 'text-tertiary-container border-tertiary-container/30 bg-tertiary-container/10' },
  stock:    { label: 'STOCK',     cls: 'text-secondary border-secondary/30 bg-secondary/10' },
  index:    { label: 'SSI INDEX', cls: 'text-data-blue  border-data-blue/30  bg-data-blue/10'  },
}

export default function TopBar({ q, onQChange, onSearch, activeContext, activeTicker, loading, sidebarOpen, onSidebarToggle, onOpenChat }) {
  const inputRef = useRef(null)

  function handleKey(e) {
    if (e.key === 'Enter') onSearch(q.trim())
    if (e.key === 'Escape') inputRef.current?.blur()
  }

  // ⌘K → open ValueGPT chat. Search bar still works via click + type.
  useEffect(() => {
    function handleGlobal(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (onOpenChat) onOpenChat()
        else inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobal)
    return () => window.removeEventListener('keydown', handleGlobal)
  }, [onOpenChat])

  const ctx = CONTEXT_BADGE[activeContext?.type]

  return (
    <header className="h-14 pl-5 pr-8 flex justify-between items-center w-full z-50 sticky top-0 bg-[#08090a]/90 backdrop-blur-md border-b border-border-subtle flex-shrink-0">
      <div className="flex items-center gap-5">
        <button
          onClick={onSidebarToggle}
          aria-label={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="material-symbols-outlined text-text-dim hover:text-primary transition-colors text-[22px] flex items-center justify-center p-1.5 rounded-sm hover:bg-white/5 active:scale-[0.97]"
        >
          {sidebarOpen ? 'menu_open' : 'menu'}
        </button>
        <span className="font-display-lg text-xl font-black tracking-tighter text-on-surface select-none">CRYPTODESK</span>

        {/* ── Asset tabs ── */}
        <nav className="hidden md:flex items-center gap-5 flex-shrink-0 pl-4 ml-1 border-l border-border-subtle/40">
          {ASSET_TABS.map((tab) => {
            const isActive = activeTicker === tab
            return (
              <button
                key={tab}
                onClick={() => onSearch(tab)}
                className={`font-label-xs text-[10px] px-3 py-1.5 rounded-sm min-h-[28px] transition-all uppercase tracking-widest cursor-pointer ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-bold bg-primary/5'
                    : 'text-text-dim hover:text-on-surface hover:bg-white/[0.04]'
                }`}
              >
                {tab}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ── Search bar — constrained width so it doesn't dominate ── */}
      <div className="flex-1 max-w-md mx-8 relative">
        <div
          className="flex items-center bg-surface-container-low/50 px-4 h-8 border border-border-subtle rounded-lg hover:border-primary/30 focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/10 transition-all cursor-text"
          onClick={() => inputRef.current?.focus()}
        >
          {loading ? (
            <svg className="animate-spin w-3 h-3 text-ai-glow mr-3 flex-shrink-0" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <span className="font-label-xs text-label-xs text-primary mr-3 opacity-70 flex-shrink-0 select-none">/</span>
          )}
          <input
            ref={inputRef}
            aria-label="Search ValueGPT"
            placeholder="Ask ValueGPT anything..."
            className="bg-transparent border-none focus:ring-0 font-sans text-body-md w-full placeholder:text-text-dim/50 text-on-surface outline-none"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="off"
            spellCheck={false}
          />
          <span className="font-label-xs text-label-xs text-text-dim opacity-30 ml-2 flex-shrink-0 hidden lg:block select-none">⌘K</span>
        </div>
      </div>

      {/* ── Right controls ── */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <MacroBadge />
        {ctx && (
          <span className={`font-mono text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${ctx.cls}`}>
            {ctx.label}
          </span>
        )}
        <div className="flex items-center gap-1.5 pl-3 border-l border-border-subtle">
          <span className="w-1.5 h-1.5 rounded-full bg-ai-glow animate-pulse" />
          <span className="font-mono text-[10px] text-text-dim hidden xl:block">LIVE</span>
        </div>
        <button className="material-symbols-outlined text-text-dim hover:text-primary transition-colors text-xl p-1.5 rounded-md hover:bg-white/[0.04] min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer" aria-label="Notifications">notifications</button>
        <button className="material-symbols-outlined text-text-dim hover:text-primary transition-colors text-xl p-1.5 rounded-md hover:bg-white/[0.04] min-w-[32px] min-h-[32px] flex items-center justify-center cursor-pointer" aria-label="Layout">grid_view</button>
        <div className="w-8 h-8 rounded-full overflow-hidden border border-border-subtle hover:border-primary transition-colors cursor-pointer ml-1">
          <img
            alt="User Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSOaPit1ZGHNRB73WqbkSNT8xx3mcd-Kur63e3p3cL34m71VcDxI5ruTDKPUfKJ02XXAMZKTXFXHGymX4ZxXYj_U5gyx0wsCgN4PlSfww9taG6uDeJtD2bWjFysXtvtde3L3erO1dVe3khqvrXdSB1C1aBFdSqTJP2RNnOJ7dP-qBxUTWzvU78zGzySc3CxCDv6uM6xMnVLTn_1cQjjMnYs691QdVnPu83IzjV3rZ43FYvCcB73zA2viycXLwe43cmQNocjIVXtQJs"
          />
        </div>
      </div>
    </header>
  )
}
