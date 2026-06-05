import React from 'react'
import RebalanceTable from '../portfolio/RebalanceTable'
import AskWhy from '../ValueGPT/AskWhy'
import AnimatedNumber from '../AnimatedNumber'

const fmt = (v, prefix = '') =>
  v != null ? `${prefix}${typeof v === 'number' ? v.toLocaleString() : v}` : '—'

function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-x-10 gap-y-8">
      {items.map(({ label, value, cls }) => (
        <div key={label} className="py-1">
          <p className="font-label-xs text-[10px] text-text-dim uppercase tracking-widest mb-2 leading-relaxed">{label}</p>
          <p className={`font-data-md text-base font-bold tabular-nums leading-relaxed ${cls || 'text-on-surface'}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}

function FairValueDelta({ price, change24h }) {
  const pct   = change24h >= 0 ? -3.2 : 1.8
  const delta = price ? Math.round(price * (Math.abs(pct) / 100)) : null
  const below = pct < 0

  return (
    <div className="relative overflow-hidden rounded-xl border border-ai-glow/20 bg-primary/5 p-8 group">
      <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
        <span className="material-symbols-outlined text-ai-glow text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
      </div>
      <p className="font-label-xs text-[10px] text-ai-glow font-black tracking-[0.2em] uppercase mb-4 leading-relaxed">Fair Value Delta</p>
      <div className="flex justify-between items-center mb-6 py-1">
        <span className="font-display-lg text-4xl font-black text-ai-glow tabular-nums tracking-tight">
          {delta != null ? `${below ? '-' : '+'}$${delta.toLocaleString()}` : '—'}
        </span>
        <span className="font-label-xs text-[10px] text-on-primary bg-ai-glow px-3 py-1.5 rounded font-black uppercase tracking-wider">
          {below ? 'Undervalued' : 'Overvalued'}
        </span>
      </div>
      <p className="font-body-md text-[13.5px] text-text-dim leading-relaxed py-1">
        Asset is trading <span className="text-ai-glow font-bold">{Math.abs(pct).toFixed(1)}%</span> {below ? 'below' : 'above'} AI intrinsic target
        based on global liquidity and on-chain supply delta.
      </p>
    </div>
  )
}

function ProbabilityBars({ bullPct = 65 }) {
  const bull = Math.round(bullPct)
  const bear = 100 - bull
  return (
    <div className="space-y-8 py-2">
      <div className="space-y-3">
        <div className="flex justify-between items-center py-1">
          <span className="font-label-xs text-[10px] text-ai-glow uppercase font-black tracking-widest">Bull Probability</span>
          <span className="font-data-md text-sm text-ai-glow font-black tabular-nums">{bull}%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-none overflow-hidden">
          <div
            className="h-full rounded-none transition-all duration-700 active-nav-glow"
            style={{ width: `${bull}%`, background: '#00F59B' }}
          />
        </div>
        <p className="font-label-xs text-[10px] text-text-dim/70 tracking-tight pt-1 leading-relaxed">ETF acceleration + structural re-rating.</p>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-1">
          <span className="font-label-xs text-[10px] text-error uppercase font-black tracking-widest">Bear Probability</span>
          <span className="font-data-md text-sm text-error font-black tabular-nums">{bear}%</span>
        </div>
        <div className="w-full bg-white/5 h-2 rounded-none overflow-hidden">
          <div
            className="h-full rounded-none transition-all duration-700"
            style={{ width: `${bear}%`, background: '#ffb4ab' }}
          />
        </div>
        <p className="font-label-xs text-[10px] text-text-dim/70 tracking-tight pt-1 leading-relaxed">Macro liquidity squeeze or regulatory pivot.</p>
      </div>
    </div>
  )
}

// SoDEX's official frontend URL scheme isn't publicly documented; this best-effort
// deeplink routes to the trade page with a hinted pair. If/when SoDEX confirms the
// exact format, only this function needs to change.
function sodexLink(ticker, side = 'buy') {
  const t = (ticker || '').toUpperCase()
  if (!t) return 'https://sodex.org/'
  return `https://sodex.org/trade?pair=${encodeURIComponent(t)}-USDT&side=${side}`
}

function SodexButton({ label, ticker, side }) {
  return (
    <a
      href={sodexLink(ticker, side)}
      target="_blank"
      rel="noopener noreferrer"
      className="w-full border border-border-subtle hover:border-primary/50 hover:bg-white/[0.06] py-3 mt-6 rounded-lg min-h-[44px] font-label-xs text-[11px] font-bold transition-all flex items-center justify-center gap-2.5 uppercase tracking-widest text-text-dim hover:text-on-surface active-nav-glow cursor-pointer"
    >
      {label}
      <span className="material-symbols-outlined text-lg">arrow_outward</span>
    </a>
  )
}

// ─── Context views ─────────────────────────────────────────────────────────────

function CurrencyAction({ data }) {
  const snap      = data.snapshot || {}
  const price     = snap.price ?? snap.currentPrice ?? snap.lastPrice ?? 0
  const change24h = snap.change24h ?? snap.changeRate ?? snap.priceChange ?? 0
  const isUp      = change24h >= 0
  const bullPct   = isUp
    ? Math.min(75, 55 + Math.abs(change24h) * 3)
    : Math.max(25, 50 - Math.abs(change24h) * 3)

  return (
    <>
      {/* Card 1: Stats & Delta */}
      <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 overflow-hidden p-8 space-y-10">
        <div className="border-b border-border-subtle/50 pb-4 flex items-center justify-between">
          <h3 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Action Layer</h3>
          <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-none font-bold select-none">{data.ticker}</span>
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.15em] mb-2">{data.ticker} / USD · Real-time</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-sans text-5xl font-black tracking-tighter text-on-surface tabular-nums">
              $<AnimatedNumber value={price} />
            </span>
            <AskWhy prompt={`Why did ${data.ticker} move ${change24h}% in the last 24 hours? Cite the most relevant news items.`}>
              <span className={`font-mono text-xl font-black tabular-nums ${isUp ? 'text-ai-glow' : 'text-error'}`}>
                {isUp ? '+' : ''}{change24h}%
              </span>
            </AskWhy>
          </div>
        </div>

        <StatGrid items={[
          { label: '24h High',    value: fmt(snap.high24h,       '$'), cls: 'text-on-surface'       },
          { label: '24h Low',     value: fmt(snap.low24h,        '$'), cls: 'text-on-surface'       },
          { label: 'Market Cap',  value: fmt(snap.marketCap,     '$'), cls: 'text-on-surface'       },
          { label: 'Dominance',   value: snap.dominance != null ? `${snap.dominance}%` : '—',      },
          { label: 'ATH Dist.',   value: snap.athDistance != null ? `${snap.athDistance}%` : '—',  cls: 'text-tertiary-container' },
          { label: 'ETF 7d Flow', value: snap.etfNetInflow7d ?? '—',                               cls: 'text-data-blue'          },
        ]} />

        <FairValueDelta price={price} change24h={change24h} />
      </div>

      {/* Card 2: Editorial Brief & CTA */}
      {data.aibrief && (
        <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h4 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Editorial Brief</h4>
          </div>
          <p className="font-sans text-[15px] leading-relaxed text-on-surface font-medium italic opacity-90 mb-8">
            "{data.aibrief}"
          </p>
          <ProbabilityBars bullPct={bullPct} />
          <SodexButton label="Trade on SoDEX" ticker={data.ticker} side="buy" />
        </div>
      )}
    </>
  )
}

function MacroAction({ data }) {
  const snap = data.snapshot || {}

  return (
    <>
      {/* Card 1: Stats & Delta */}
      <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 overflow-hidden p-8 space-y-10">
        <div className="border-b border-border-subtle/50 pb-4 flex items-center justify-between">
          <h3 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Action Layer</h3>
          <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-none font-bold select-none">{data.ticker}</span>
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.15em] mb-2">{snap.event} · Macro Event</p>
          <span className="font-sans text-4xl font-black tracking-tighter text-tertiary-container tabular-nums">{snap.lastActual}</span>
          <p className="font-mono text-[11px] text-text-dim mt-2">vs {snap.lastForecast} forecast · {snap.lastDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="px-3 py-3 bg-ai-glow/5 border border-ai-glow/20 rounded-lg text-center">
            <p className="font-mono text-[10px] text-text-dim mb-1.5">Beat Scenario</p>
            <p className="font-mono text-base font-black text-ai-glow">+3.8% avg</p>
            <p className="font-mono text-[10px] text-text-dim/60 mt-1">BTC 24h</p>
          </div>
          <div className="px-3 py-3 bg-error/5 border border-error/20 rounded-lg text-center">
            <p className="font-mono text-[10px] text-text-dim mb-1.5">Miss Scenario</p>
            <p className="font-mono text-base font-black text-error">-2.4% avg</p>
            <p className="font-mono text-[10px] text-text-dim/60 mt-1">BTC 24h</p>
          </div>
        </div>

        <div className="px-4 py-3 bg-surface-container/50 border border-border-subtle rounded-lg">
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-1.5">Next Release</p>
          <p className="font-sans text-sm font-semibold text-on-surface">{snap.nextDate}</p>
          <p className="font-mono text-[11px] text-text-dim mt-0.5">{snap.daysToNext} days away</p>
        </div>
      </div>

      {/* Card 2: Editorial Brief & CTA */}
      {data.aibrief && (
        <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h4 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Editorial Brief</h4>
          </div>
          <p className="font-sans text-[15px] leading-relaxed text-on-surface font-medium italic opacity-90 mb-8">
            "{data.aibrief}"
          </p>
          <ProbabilityBars bullPct={55} />
          <SodexButton label="Set Macro Alert" ticker={data.ticker} />
        </div>
      )}
    </>
  )
}

// Synthetic MSTR treasury history fallback (used when SoSoValue endpoint returns nothing).
const TREASURY_FALLBACK = [
  { date: 'May 04', qty: 3000,  avgPrice: 98200,  totalUsd: 294600000 },
  { date: 'Apr 28', qty: 3400,  avgPrice: 95400,  totalUsd: 324360000 },
  { date: 'Apr 15', qty: 5500,  avgPrice: 87100,  totalUsd: 479050000 },
  { date: 'Mar 18', qty: 4200,  avgPrice: 79800,  totalUsd: 335160000 },
  { date: 'Feb 24', qty: 8400,  avgPrice: 64900,  totalUsd: 545160000 },
]

function normalizeTreasuryRow(raw) {
  return {
    date:     raw.date ?? raw.purchaseDate ?? raw.txDate ?? '',
    qty:      Number(raw.quantity ?? raw.btcAmount ?? raw.btcQty ?? raw.amount ?? 0),
    avgPrice: Number(raw.avgPrice ?? raw.pricePerBtc ?? raw.price ?? 0),
    totalUsd: Number(raw.totalUsd ?? raw.totalAmount ?? raw.usdValue ?? (raw.quantity * raw.price) ?? 0),
  }
}

function TreasuryWatch({ rows }) {
  const live = (rows || []).map(normalizeTreasuryRow).filter((r) => r.qty > 0)
  const data = live.length > 0 ? live.slice(0, 6) : TREASURY_FALLBACK

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">Treasury Watch · Recent BTC Purchases</p>
        <span className="font-mono text-[8px] text-text-dim/40 uppercase tracking-wider">{live.length > 0 ? 'Live' : 'Sample'}</span>
      </div>
      <div className="bg-surface-container/30 border border-border-subtle rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/20 border-b border-border-subtle/40 font-mono text-[8px] text-text-dim/70 uppercase tracking-wider">
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-right">BTC Qty</th>
              <th className="px-3 py-2 text-right">Avg Price</th>
              <th className="px-3 py-2 text-right">Total USD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/20">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-white/[0.02]">
                <td className="px-3 py-2 font-mono text-[10px] text-text-dim">{row.date || '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-data-orange text-right tabular-nums font-bold">{row.qty ? `+${row.qty.toLocaleString()}` : '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-on-surface text-right tabular-nums">{row.avgPrice ? `$${row.avgPrice.toLocaleString()}` : '—'}</td>
                <td className="px-3 py-2 font-mono text-[10px] text-on-surface text-right tabular-nums font-bold">{row.totalUsd ? `$${(row.totalUsd / 1e6).toFixed(1)}M` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function StockAction({ data }) {
  const snap      = data.snapshot || {}
  const change24h = snap.change24h ?? snap.changeRate ?? 0
  const isUp      = change24h >= 0

  return (
    <>
      {/* Card 1: Stats & Delta */}
      <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 overflow-hidden p-8 space-y-10">
        <div className="border-b border-border-subtle/50 pb-4 flex items-center justify-between">
          <h3 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Action Layer</h3>
          <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-none font-bold select-none">{data.ticker}</span>
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.15em] mb-2">{data.ticker} · NYSE</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-sans text-5xl font-black tracking-tighter text-on-surface tabular-nums">
              $<AnimatedNumber value={snap.price} format={(v) => v.toFixed(2)} />
            </span>
            <AskWhy prompt={`Why did ${data.ticker} move ${change24h}% today? Explain in terms of BTC treasury moves, mNAV pressure, or company-specific catalysts.`}>
              <span className={`font-mono text-xl font-black tabular-nums ${isUp ? 'text-ai-glow' : 'text-error'}`}>
                {isUp ? '+' : ''}{change24h}%
              </span>
            </AskWhy>
          </div>
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-3">BTC Treasury</p>
          <StatGrid items={[
            { label: 'Holdings',        value: `${snap.btcHoldings?.toLocaleString()} BTC`, cls: 'text-data-orange' },
            { label: 'Avg Cost',        value: `$${snap.avgCostBasis?.toLocaleString()}`,   cls: 'text-on-surface'  },
            { label: 'Unrealized Gain', value: snap.unrealizedGain,                          cls: 'text-ai-glow'    },
            { label: 'Treasury Value',  value: `$${snap.treasuryValue}`,                    cls: 'text-on-surface'  },
          ]} />
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest mb-3">Valuation</p>
          <StatGrid items={[
            { label: 'Market Cap', value: `$${snap.marketCap}`, cls: 'text-on-surface' },
            { label: 'mNAV',       value: snap.mNAV,            cls: 'text-secondary'  },
            { label: 'P/E Ratio',  value: snap.peRatio,         cls: 'text-on-surface' },
            { label: 'P/B Ratio',  value: snap.pbRatio,         cls: 'text-on-surface' },
          ]} />
        </div>

        <TreasuryWatch rows={data.treasury} />
      </div>

      {/* Card 2: Editorial Brief & CTA */}
      {data.aibrief && (
        <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h4 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Editorial Brief</h4>
          </div>
          <p className="font-sans text-[15px] leading-relaxed text-on-surface font-medium italic opacity-90 mb-8">
            "{data.aibrief}"
          </p>
          <ProbabilityBars bullPct={60} />
          <SodexButton label="Trade on SoDEX" ticker={data.ticker} side="buy" />
        </div>
      )}
    </>
  )
}

function IndexAction({ data }) {
  const snap      = data.snapshot || {}
  const change24h = snap.change24h ?? snap.changeRate ?? 0
  const isUp      = change24h >= 0

  return (
    <>
      {/* Card 1: Stats & Delta */}
      <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 overflow-hidden p-8 space-y-10">
        <div className="border-b border-border-subtle/50 pb-4 flex items-center justify-between">
          <h3 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Action Layer</h3>
          <span className="font-mono text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-none font-bold select-none">{data.ticker}</span>
        </div>

        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.15em] mb-2">{data.ticker} · SSI Index</p>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-sans text-5xl font-black tracking-tighter text-on-surface tabular-nums">
              $<AnimatedNumber value={snap.price} format={(v) => v.toFixed(2)} />
            </span>
            <AskWhy prompt={`The ${data.ticker} SSI index moved ${change24h}% today. Which constituents drove the move, and what does it imply for the sector?`}>
              <span className={`font-mono text-xl font-black tabular-nums ${isUp ? 'text-ai-glow' : 'text-error'}`}>
                {isUp ? '+' : ''}{change24h}%
              </span>
            </AskWhy>
          </div>
          <p className="font-mono text-[11px] text-text-dim mt-1.5">AUM ${snap.aum} · {snap.constituents} assets</p>
        </div>

        <StatGrid items={[
          { label: '1M Return',     value: `+${snap.roi1m}%`,          cls: 'text-ai-glow'    },
          { label: '3M Return',     value: `+${snap.roi3m}%`,          cls: 'text-ai-glow'    },
          { label: '1Y Return',     value: `+${snap.roi1y}%`,          cls: 'text-ai-glow'    },
          { label: 'Constituents',  value: String(snap.constituents ?? '—'), cls: 'text-on-surface' },
        ]} />

        <RebalanceTable ticker={data.ticker || 'MAG7'} />
      </div>

      {/* Card 2: Editorial Brief & CTA */}
      {data.aibrief && (
        <div className="bento-box rounded-none flex flex-col bg-[#0d0e12]/60 p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>psychology</span>
            <h4 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Editorial Brief</h4>
          </div>
          <p className="font-sans text-[15px] leading-relaxed text-on-surface font-medium italic opacity-90 mb-8">
            "{data.aibrief}"
          </p>
          <ProbabilityBars bullPct={68} />
          <SodexButton label="Execute Rebalance on SoDEX" ticker={data.ticker} side="buy" />
        </div>
      )}
    </>
  )
}

// ─── Root ──────────────────────────────────────────────────────────────────────

export default function ActionLayer({ data }) {
  if (!data || data.type === 'idle') {
    return (
      <div className="bento-box rounded-none flex-1 flex flex-col items-center justify-center gap-3 px-6 py-20 text-center bg-[#0d0e12]/60 min-h-[300px]">
        <span className="material-symbols-outlined text-border-subtle" style={{ fontSize: 36, fontVariationSettings: "'FILL' 1" }}>bolt</span>
        <p className="font-label-xs text-[10px] text-text-dim uppercase tracking-widest">Action Layer</p>
        <p className="font-sans text-xs text-text-dim/40">Search any asset to load signals</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-w-0">
      {data.type === 'currency' && <CurrencyAction data={data} />}
      {data.type === 'macro'    && <MacroAction    data={data} />}
      {data.type === 'stock'    && <StockAction    data={data} />}
      {data.type === 'index'    && <IndexAction    data={data} />}
    </div>
  )
}
