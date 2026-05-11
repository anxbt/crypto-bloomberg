import React from 'react'

const fmt = (v, prefix = '') => v != null ? `${prefix}${typeof v === 'number' ? v.toLocaleString() : v}` : '—'

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-2">
      {children}
    </div>
  )
}

function StatRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
      <span className="text-xs font-mono text-zinc-500">{label}</span>
      <span className={`text-sm font-mono tabular-nums font-medium ${highlight || 'text-zinc-200'}`}>{value}</span>
    </div>
  )
}

function ScenarioCard({ scenario }) {
  const isBull = scenario.type === 'bull'
  return (
    <div className={`rounded border px-3 py-2.5 ${isBull ? 'border-green-800/60 bg-green-950/20' : 'border-red-800/60 bg-red-950/20'}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-mono font-semibold uppercase tracking-wider ${isBull ? 'text-green-400' : 'text-red-400'}`}>
          {scenario.title}
        </span>
        <span className={`text-xs font-mono tabular-nums ${isBull ? 'text-green-400' : 'text-red-400'}`}>
          {scenario.probability}%
        </span>
      </div>
      <div className={`text-lg font-mono tabular-nums font-semibold ${isBull ? 'text-green-300' : 'text-red-300'}`}>
        {scenario.target}
      </div>
      <p className="text-[11px] text-zinc-500 mt-1 leading-snug">{scenario.trigger}</p>
    </div>
  )
}

function AiBrief({ label, text }) {
  return (
    <div className="mx-0 mb-3 px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded">
      <SectionLabel>{label}</SectionLabel>
      <p className="text-xs text-zinc-400 leading-relaxed">{text}</p>
    </div>
  )
}

function CurrencyAction({ data }) {
  const snap = data.snapshot || {}
  const price = snap.price ?? snap.currentPrice ?? snap.lastPrice ?? 0
  const change24h = snap.change24h ?? snap.changeRate ?? snap.priceChange ?? 0
  const isUp = change24h >= 0
  const changeAmt = snap.changeAmt ?? snap.changeAmount ?? null

  return (
    <div className="flex flex-col">
      {/* Live price hero */}
      <div className="px-3 py-3 border-b border-zinc-800">
        <SectionLabel>{data.ticker} / USD · SoDEX Live</SectionLabel>
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-mono tabular-nums text-white">${price.toLocaleString()}</span>
          <span className={`text-base font-mono tabular-nums font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{change24h}%
          </span>
        </div>
        <div className={`text-xs font-mono tabular-nums mt-0.5 ${isUp ? 'text-green-500' : 'text-red-500'}`}>
          {changeAmt != null ? `${isUp ? '+' : ''}$${changeAmt.toLocaleString()} today` : ''}
        </div>
      </div>

      {/* Stats */}
      <div className="px-3 py-2">
        <StatRow label="24h High" value={fmt(snap.high24h, '$')} />
        <StatRow label="24h Low" value={fmt(snap.low24h, '$')} />
        <StatRow label="Volume 24h" value={fmt(snap.volume24h, '$')} />
        <StatRow label="Market Cap" value={fmt(snap.marketCap, '$')} />
        <StatRow label="BTC Dominance" value={snap.dominance != null ? `${snap.dominance}%` : '—'} />
        <StatRow label="ATH Distance" value={snap.athDistance != null ? `${snap.athDistance}%` : '—'} highlight="text-amber-400" />
        <StatRow label="ETF AUM" value={fmt(snap.etfAum, '$')} />
        <StatRow label="ETF 7d Flow" value={snap.etfNetInflow7d ?? '—'} highlight="text-blue-400" />
      </div>

      {/* AI Brief */}
      {data.aibrief && (
        <div className="px-3">
          <AiBrief label="AI · Market Brief" text={data.aibrief} />
        </div>
      )}

      {/* Scenarios */}
      {data.scenarios && (
        <div className="px-3 mb-3 grid grid-cols-1 gap-2">
          {data.scenarios.map((s) => <ScenarioCard key={s.type} scenario={s} />)}
        </div>
      )}

      <div className="px-3 pb-3">
        <button
          disabled
          className="w-full py-3 rounded bg-blue-600/20 border border-blue-700/40 text-blue-400 text-xs font-mono uppercase tracking-widest opacity-50 cursor-not-allowed"
        >
          Trade on SoDEX — Wave 2
        </button>
      </div>
    </div>
  )
}

function MacroAction({ data }) {
  const snap = data.snapshot || {}
  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 border-b border-zinc-800">
        <SectionLabel>{snap.event}</SectionLabel>
        <div className="text-2xl font-mono text-amber-400 tabular-nums">{snap.lastActual}</div>
        <div className="text-xs font-mono text-zinc-500 mt-1">
          vs {snap.lastForecast} forecast · {snap.lastDate}
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="px-2 py-2.5 bg-green-950/30 border border-green-900/40 rounded text-center">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">Beat scenario</div>
            <div className="text-base font-mono text-green-400 tabular-nums font-semibold">+3.8% avg</div>
            <div className="text-[11px] font-mono text-zinc-600 mt-0.5">BTC 24h</div>
          </div>
          <div className="px-2 py-2.5 bg-red-950/30 border border-red-900/40 rounded text-center">
            <div className="text-[11px] font-mono text-zinc-500 mb-1">Miss scenario</div>
            <div className="text-base font-mono text-red-400 tabular-nums font-semibold">-2.4% avg</div>
            <div className="text-[11px] font-mono text-zinc-600 mt-0.5">BTC 24h</div>
          </div>
        </div>

        <div className="px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded mb-3">
          <SectionLabel>Next Release</SectionLabel>
          <div className="text-sm font-mono text-zinc-200">{snap.nextDate}</div>
          <div className="text-xs font-mono text-zinc-500 mt-0.5">{snap.daysToNext} days away</div>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          disabled
          className="w-full py-3 rounded bg-blue-600/20 border border-blue-700/40 text-blue-400 text-xs font-mono uppercase tracking-widest opacity-50 cursor-not-allowed"
        >
          Set Alert — Wave 2
        </button>
      </div>
    </div>
  )
}

function StockAction({ data }) {
  const snap = data.snapshot || {}
  const change24h = snap.change24h ?? snap.changeRate ?? 0
  const isUp = change24h >= 0

  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 border-b border-zinc-800">
        <SectionLabel>{data.ticker} · NYSE</SectionLabel>
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-mono tabular-nums text-white">${snap.price?.toFixed(2)}</span>
          <span className={`text-base font-mono tabular-nums font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{change24h}%
          </span>
        </div>
      </div>

      <div className="px-3 py-2">
        <div className="mb-1 mt-1">
          <SectionLabel>BTC Treasury</SectionLabel>
        </div>
        <StatRow label="Holdings" value={`${snap.btcHoldings?.toLocaleString()} BTC`} highlight="text-amber-400" />
        <StatRow label="Avg Cost" value={`$${snap.avgCostBasis?.toLocaleString()}`} />
        <StatRow label="Unrealized Gain" value={snap.unrealizedGain} highlight="text-green-400" />
        <StatRow label="Treasury Value" value={`$${snap.treasuryValue}`} />

        <div className="mb-1 mt-3">
          <SectionLabel>Valuation</SectionLabel>
        </div>
        <StatRow label="Market Cap" value={`$${snap.marketCap}`} />
        <StatRow label="P/E Ratio" value={snap.peRatio} />
        <StatRow label="P/B Ratio" value={snap.pbRatio} />
        <StatRow label="mNAV Premium" value={snap.mNAV} highlight="text-purple-400" />

        {data.aibrief && (
          <div className="mt-3">
            <AiBrief label="AI · Treasury Brief" text={data.aibrief} />
          </div>
        )}
      </div>

      <div className="px-3 pb-3">
        <button
          disabled
          className="w-full py-3 rounded bg-blue-600/20 border border-blue-700/40 text-blue-400 text-xs font-mono uppercase tracking-widest opacity-50 cursor-not-allowed"
        >
          Trade on SoDEX — Wave 2
        </button>
      </div>
    </div>
  )
}

function IndexAction({ data }) {
  const snap = data.snapshot || {}
  const change24h = snap.change24h ?? snap.changeRate ?? 0
  const isUp = change24h >= 0

  return (
    <div className="flex flex-col">
      <div className="px-3 py-3 border-b border-zinc-800">
        <SectionLabel>{data.ticker} · SSI Index</SectionLabel>
        <div className="flex items-baseline gap-2.5">
          <span className="text-3xl font-mono tabular-nums text-white">${snap.price?.toFixed(2)}</span>
          <span className={`text-base font-mono tabular-nums font-medium ${isUp ? 'text-green-400' : 'text-red-400'}`}>
            {isUp ? '+' : ''}{change24h}%
          </span>
        </div>
        <div className="text-xs font-mono text-zinc-500 mt-1">
          AUM ${snap.aum} · {snap.constituents} assets
        </div>
      </div>

      <div className="px-3 py-2">
        <StatRow label="1M Return" value={`+${snap.roi1m}%`} highlight="text-green-400" />
        <StatRow label="3M Return" value={`+${snap.roi3m}%`} highlight="text-green-400" />
        <StatRow label="1Y Return" value={`+${snap.roi1y}%`} highlight="text-green-400" />

        {data.aibrief && (
          <div className="mt-3">
            <AiBrief label="AI · Rebalancing Signal" text={data.aibrief} />
          </div>
        )}

        <div className="px-3 py-2.5 bg-zinc-900/50 border border-zinc-800 rounded">
          <SectionLabel>Rebalancing Calculator</SectionLabel>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Enter portfolio size → see exact trades to match this index. Wave 2.
          </p>
        </div>
      </div>

      <div className="px-3 pb-3 mt-2">
        <button
          disabled
          className="w-full py-3 rounded bg-blue-600/20 border border-blue-700/40 text-blue-400 text-xs font-mono uppercase tracking-widest opacity-50 cursor-not-allowed"
        >
          Execute Rebalance — Wave 2
        </button>
      </div>
    </div>
  )
}

export default function ActionLayer({ data }) {
  if (!data || data.type === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="text-zinc-600 text-xs font-mono">ACTION LAYER</div>
        <div className="text-zinc-700 text-[11px] font-mono">Search to load signals</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center gap-2 flex-shrink-0">
        <div className="size-1.5 rounded-full bg-purple-400" />
        <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Action Layer</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {data.type === 'currency' && <CurrencyAction data={data} />}
        {data.type === 'macro' && <MacroAction data={data} />}
        {data.type === 'stock' && <StockAction data={data} />}
        {data.type === 'index' && <IndexAction data={data} />}
      </div>
    </div>
  )
}
