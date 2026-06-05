import React, { useState } from 'react'
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useChat } from '../../store/chat'

const TIME_RANGES = ['7D', '30D', '90D', '1Y']

const ETF_XRAY = [
  { name: 'BlackRock IBIT', holdings: '287,412', delta: '+12,410', cost: '$64,210', sentiment: 'Accumulating', bull: true  },
  { name: 'Fidelity FBTC',  holdings: '158,202', delta: '+4,115',  cost: '$62,840', sentiment: 'Accumulating', bull: true  },
  { name: 'Grayscale GBTC', holdings: '298,110', delta: '-8,211',  cost: '$24,100', sentiment: 'Distributing',  bull: false },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bento-box rounded-lg px-3 py-2 font-mono text-[10px] shadow-xl">
      <p className="text-text-dim mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          {p.dataKey === 'etfFlow'     ? 'M' : ''}
          {p.dataKey === 'btcReaction' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

function CurrencyChart({ data, macroEvents }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 4" stroke="rgba(31,33,40,0.6)" vertical={false} />
        <XAxis dataKey="date"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={3} />
        <YAxis yAxisId="price" orientation="right" tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} width={42} />
        <YAxis yAxisId="flow"  orientation="left"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Bar  yAxisId="flow"  dataKey="etfFlow"   name="ETF Flow"      fill="#3576DF" opacity={0.45} radius={[2,2,0,0]} />
        <Line yAxisId="price" dataKey="price"     name="Price"         type="monotone" stroke="#dce2f7" strokeWidth={2}   dot={false} activeDot={{ r:3, fill:'#dce2f7' }} />
        <Line yAxisId="price" dataKey="fairValue" name="AI Fair Value" type="monotone" stroke="#00F59B" strokeWidth={1.5} strokeDasharray="6 4" dot={false} activeDot={{ r:3, fill:'#00F59B' }} />
        {macroEvents?.map((ev) => (
          <ReferenceLine key={ev.date} yAxisId="price" x={ev.date}
            stroke={ev.type === 'positive' ? '#00F59B' : '#ffd165'} strokeDasharray="3 3" strokeWidth={1}
            label={{ value: ev.label, fill: ev.type === 'positive' ? '#00F59B' : '#ffd165', fontSize: 8, fontFamily: 'JetBrains Mono', position: 'insideTopLeft' }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function MacroChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 4" stroke="rgba(31,33,40,0.6)" vertical={false} />
        <XAxis dataKey="date"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} interval={1} />
        <YAxis yAxisId="delta" orientation="left"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
        <YAxis yAxisId="react" orientation="right" tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine yAxisId="delta" y={0} stroke="#2e3544" />
        <Bar  yAxisId="delta" dataKey="btcReaction" name="BTC 24h Reaction" fill="#00F59B" opacity={0.6} radius={[2,2,0,0]} />
        <Line yAxisId="react" dataKey="actual"   name="Actual"   type="monotone" stroke="#ffd165" strokeWidth={1.5} dot={{ r:2.5, fill:'#ffd165' }} />
        <Line yAxisId="react" dataKey="forecast" name="Forecast" type="monotone" stroke="#3b4a3f" strokeWidth={1} strokeDasharray="4 4" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function StockChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 4" stroke="rgba(31,33,40,0.6)" vertical={false} />
        <XAxis dataKey="date"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="price" orientation="right" tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={42} />
        <YAxis yAxisId="btc"   orientation="left"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Bar  yAxisId="btc"   dataKey="btcHoldings" name="BTC Holdings" fill="#F7931A" opacity={0.35} radius={[2,2,0,0]} />
        <Line yAxisId="price" dataKey="price"        name="Stock Price"  type="monotone" stroke="#adc6ff" strokeWidth={2} dot={false} activeDot={{ r:3, fill:'#adc6ff' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function IndexChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 6, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="1 4" stroke="rgba(31,33,40,0.6)" vertical={false} />
        <XAxis dataKey="date"  tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
        <YAxis orientation="right" tick={{ fill: '#3d4e6a', fontSize: 9, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={42} />
        <Tooltip content={<CustomTooltip />} />
        <Line dataKey="price" name="Index Price" type="monotone" stroke="#3576DF" strokeWidth={2} dot={false} activeDot={{ r:3, fill:'#3576DF' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const LEGENDS = {
  currency: [
    { color: '#dce2f7', label: 'Spot Price',    dash: false },
    { color: '#00F59B', label: 'AI Fair Value', dash: true  },
    { color: '#3576DF', label: 'ETF Net Flow',  bar: true   },
  ],
  macro: [
    { color: '#00F59B', label: 'BTC 24h Δ', bar: true  },
    { color: '#ffd165', label: 'Actual',     dash: false },
    { color: '#3b4a3f', label: 'Forecast',   dash: true  },
  ],
  stock: [
    { color: '#adc6ff', label: 'Stock Price',  dash: false },
    { color: '#F7931A', label: 'BTC Holdings', bar: true   },
  ],
  index: [{ color: '#3576DF', label: 'Index Price', dash: false }],
}

export function InstitutionalXRay() {
  return (
    <div className="flex flex-col h-full bg-[#0d0e12]/20 overflow-hidden">
      <div className="p-inner-padding h-14 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
        <h4 className="font-label-xs text-label-xs uppercase tracking-[0.2em] text-text-dim">Institutional X-Ray</h4>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-ai-glow animate-pulse" />
          <span className="font-label-xs text-[10px] text-text-dim tracking-widest font-bold">LIVE HUD</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/20 border-b border-border-subtle font-label-xs text-[9px] text-text-dim uppercase tracking-[0.15em]">
              <th className="px-6 py-4 font-bold">Entity</th>
              <th className="px-6 py-4 font-bold text-right">Holdings (BTC)</th>
              <th className="px-6 py-4 font-bold text-right">7D Delta</th>
              <th className="px-6 py-4 font-bold text-right">Avg. Cost</th>
              <th className="px-6 py-4 font-bold text-center">Sentiment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/30 font-data-md">
            {ETF_XRAY.map((row) => (
              <tr key={row.name} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-5 font-headline-md text-sm tracking-tight text-on-surface">{row.name}</td>
                <td className="px-6 py-5 text-right font-medium text-on-surface tabular-nums">{row.holdings}</td>
                <td className={`px-6 py-5 text-right font-bold tabular-nums ${row.bull ? 'text-ai-glow' : 'text-error'}`}>{row.delta}</td>
                <td className="px-6 py-5 text-right text-text-dim/80 tabular-nums">{row.cost}</td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    row.bull
                      ? 'bg-ai-glow/10 text-ai-glow   border-ai-glow/20'
                      : 'bg-error/10   text-error      border-error/20'
                  }`}>
                    {row.sentiment}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ChartPanel({ data, hideXRay }) {
  const [range, setRange] = useState('30D')
  const openChat = useChat((s) => s.openChat)

  if (!data || data.type === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <span className="material-symbols-outlined text-border-subtle" style={{ fontSize: 36 }}>candlestick_chart</span>
        <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest">Chart & Context</p>
        <p className="font-sans text-xs text-text-dim/40">Search any asset to load chart</p>
      </div>
    )
  }

  const chartTitle = {
    currency: `${data.ticker} / USD  ·  Price + ETF Net Flow`,
    macro:    `${data.ticker}  ·  Historical Surprise vs BTC Reaction`,
    stock:    `${data.ticker}  ·  Stock Price + BTC Treasury`,
    index:    `${data.ticker}  ·  Index Performance`,
  }[data.type] || ''

  // Synthetic AI Fair Value line: 3.2% above spot as proxy for intrinsic value
  const chartData = data.type === 'currency' && data.klines
    ? data.klines.map((pt) => ({ ...pt, fairValue: pt.price ? Math.round(pt.price * 1.032) : undefined }))
    : data.klines

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-5 h-14 border-b border-border-subtle flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4 min-w-0">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim flex-shrink-0">Market Context</h3>
          {data.ticker && (
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-sans text-base font-black tracking-tight text-on-surface">{data.ticker} / USD</span>
              {data.type === 'currency' && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-glow animate-pulse" />
                  <span className="font-mono text-[10px] text-ai-glow font-bold hidden lg:block">Fair Value Active</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-1.5 flex-shrink-0">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 font-mono text-[10px] rounded-lg transition-colors ${
                range === r
                  ? 'bg-ai-glow/10 text-ai-glow border border-ai-glow/20 font-bold'
                  : 'text-text-dim hover:text-on-surface hover:bg-white/[0.04]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Chart title + legend */}
      <div className="px-5 py-2 flex items-center justify-between flex-shrink-0">
        <p className="font-mono text-[10px] text-text-dim truncate mr-4">{chartTitle}</p>
        <div className="flex gap-4 flex-shrink-0">
          {(LEGENDS[data.type] || []).map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              {l.bar
                ? <div className="w-3 h-3 rounded-sm" style={{ background: l.color, opacity: 0.7 }} />
                : <div className="w-4 h-px" style={{ background: l.dash ? 'none' : l.color, borderTop: l.dash ? `1.5px dashed ${l.color}` : undefined }} />
              }
              <span className="font-mono text-[9px] text-text-dim">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart + overlay */}
      <div className="flex-1 px-3 pb-2 min-h-0 relative">
        <div className="w-full h-full chart-grid-bg rounded-lg overflow-hidden relative">
          {/* Fair Value Ribbon Overlay */}
          {data.type === 'currency' && (
            <div className="absolute inset-0 flex flex-col justify-center pointer-events-none opacity-25 z-0">
              <div className="h-48 w-full bg-gradient-to-b from-transparent via-ai-glow to-transparent blur-[60px]" />
            </div>
          )}

          <div className="w-full h-full z-10 relative">
            {data.type === 'currency' && <CurrencyChart data={chartData}      macroEvents={data.macroEvents} />}
            {data.type === 'macro'    && <MacroChart    data={data.history}   />}
            {data.type === 'stock'    && <StockChart    data={data.klines}    />}
            {data.type === 'index'    && <IndexChart    data={data.klines}    />}
          </div>
        </div>

        {/* Premium Signal glassmorphism overlay — clickable, opens ValueGPT seeded with this brief */}
        {data.aibrief && (
          <button
            onClick={() => openChat({ seed: data.aibrief })}
            title="Open ValueGPT to explore this signal"
            className="group absolute top-8 right-12 w-64 bento-box p-5 rounded-xl ai-glow-border shadow-2xl z-20 text-left hover:scale-[1.02] hover:shadow-[0_0_24px_rgba(0,245,155,0.25)] transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-ai-glow text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                <p className="font-label-xs text-[9px] text-ai-glow uppercase font-black tracking-widest">Premium Signal</p>
              </div>
              <span className="material-symbols-outlined text-ai-glow/40 group-hover:text-ai-glow transition-colors" style={{ fontSize: 14 }}>arrow_outward</span>
            </div>
            <p className="font-body-md text-[14px] leading-snug text-on-surface line-clamp-3">{data.aibrief}</p>
            <p className="mt-2 font-mono text-[9px] text-ai-glow/60 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to ask ValueGPT →</p>
          </button>
        )}
      </div>

      {/* Macro pattern strip */}
      {data.type === 'macro' && data.snapshot?.btcPattern && (
        <div className="mx-4 mb-2 px-3 py-2 bg-surface-container/40 border border-border-subtle rounded-lg flex-shrink-0">
          <p className="font-mono text-[10px] text-text-dim">{data.snapshot.btcPattern}</p>
        </div>
      )}

      {/* Index ROI row */}
      {data.type === 'index' && data.snapshot && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-2 flex-shrink-0">
          {[
            { label: '1M ROI', value: data.snapshot.roi1m },
            { label: '3M ROI', value: data.snapshot.roi3m },
            { label: '1Y ROI', value: data.snapshot.roi1y },
          ].map((s) => (
            <div key={s.label} className="px-3 py-2 bg-surface-container/40 border border-border-subtle rounded-lg text-center">
              <p className="font-mono text-[9px] text-text-dim uppercase tracking-widest">{s.label}</p>
              <p className={`font-mono text-sm font-bold tabular-nums mt-0.5 ${s.value >= 0 ? 'text-ai-glow' : 'text-error'}`}>
                {s.value >= 0 ? '+' : ''}{s.value}%
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Institutional X-Ray (currency only) */}
      {data.type === 'currency' && !hideXRay && <InstitutionalXRay />}
    </div>
  )
}
