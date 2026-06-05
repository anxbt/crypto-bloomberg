import React from 'react'

const NAV_ITEMS = [
  { key: 'terminal',  icon: 'dashboard',              label: 'Terminal'    },
  { key: 'intel',     icon: 'analytics',              label: 'Market Intel' },
  { key: 'research',  icon: 'science',                label: 'Research Lab' },
  { key: 'portfolio', icon: 'account_balance_wallet', label: 'Portfolio'   },
]

const FOOTER_ITEMS = [
  { icon: 'description',   label: 'Docs'    },
  { icon: 'support_agent', label: 'Support' },
]

export default function Sidebar({ onSearch, open, onOpenChat, activeView = 'terminal', onViewChange }) {

  return (
    <aside className={`fixed left-0 top-14 h-[calc(100vh-56px)] w-60 bg-[#0d0e12]/75 backdrop-blur-xl border-r border-border-subtle/50 flex flex-col hidden lg:flex overflow-hidden z-50 transition-all duration-300 ${
      open ? 'translate-x-0 opacity-100' : 'translate-x-[-100%] opacity-0 pointer-events-none'
    }`}>
      <div className="p-6 flex flex-col flex-1">
        {/* ── Logo ── */}
        <div className="flex items-center gap-3 mb-6 px-2">
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-container text-on-primary rounded-md active-nav-glow">
            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: "'FILL' 1" }}>
              bolt
            </span>
          </div>
          <div className="hidden lg:block flex-1">
            <h2 className="font-display-lg text-lg font-black text-on-surface tracking-tight leading-none">VALUEGPT</h2>
            <p className="mt-1 font-mono text-[9px] text-primary/50 uppercase tracking-[0.14em] font-medium select-none leading-none">
              Terminal Edge
            </p>
          </div>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 space-y-2">
          {NAV_ITEMS.map(({ key, icon, label }) => {
            const isActive = activeView === key
            return (
              <button
                key={key}
                onClick={() => onViewChange?.(key)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg min-h-[44px] transition-all text-left cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary active-nav-glow font-bold'
                    : 'text-text-dim hover:text-on-surface hover:bg-white/[0.04]'
                }`}
              >
                <span
                  className="material-symbols-outlined flex-shrink-0"
                  style={{ fontSize: 20, fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {icon}
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest font-bold hidden lg:block whitespace-nowrap">
                  {label}
                </span>
              </button>
            )
          })}

          {/* ── New Analysis CTA — opens ValueGPT ── */}
          <div className="pt-4">
            <button
              onClick={() => (onOpenChat ? onOpenChat() : onSearch?.('BTC'))}
              className="w-full bg-ai-glow text-on-primary font-label-xs text-[11px] font-black py-2.5 min-h-[44px] rounded-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 uppercase tracking-widest active-nav-glow cursor-pointer"
            >
              <span className="material-symbols-outlined flex-shrink-0 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
              <span className="hidden lg:block">New Analysis</span>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Footer ── */}
      <div className="p-6 border-t border-border-subtle/50 space-y-2">
        {FOOTER_ITEMS.map(({ icon, label }) => (
          <button
            key={label}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg min-h-[44px] text-text-dim hover:text-on-surface hover:bg-white/[0.04] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 18 }}>{icon}</span>
            <span className="font-mono text-[11px] uppercase tracking-widest hidden lg:block">{label}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
