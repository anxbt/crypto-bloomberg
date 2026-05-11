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

const TIME_RANGES = ['7D', '30D', '90D', '1Y']

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-[10px] font-mono">
      <div className="text-zinc-400 mb-1">{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          {p.dataKey === 'etfFlow' ? 'M' : ''}
          {p.dataKey === 'btcReaction' ? '%' : ''}
        </div>
      ))}
    </div>
  )
}

function CurrencyChart({ data, macroEvents }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#1c1c1c" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={2} />
        <YAxis yAxisId="price" orientation="right" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={40} />
        <YAxis yAxisId="flow" orientation="left" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="flow" dataKey="etfFlow" name="ETF Flow" fill="#3b82f6" opacity={0.35} radius={[1, 1, 0, 0]} />
        <Line yAxisId="price" type="monotone" dataKey="price" name="Price" stroke="#22c55e" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#22c55e' }} />
        {macroEvents && macroEvents.map((ev) => (
          <ReferenceLine
            key={ev.date}
            yAxisId="price"
            x={ev.date}
            stroke={ev.type === 'positive' ? '#22c55e' : '#f59e0b'}
            strokeDasharray="3 3"
            strokeWidth={1}
            label={{ value: ev.label, fill: ev.type === 'positive' ? '#22c55e' : '#f59e0b', fontSize: 9, fontFamily: 'monospace', position: 'insideTopLeft' }}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function MacroChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#1c1c1c" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} interval={1} />
        <YAxis yAxisId="delta" orientation="left" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
        <YAxis yAxisId="react" orientation="right" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine yAxisId="delta" y={0} stroke="#3f3f46" />
        <Bar yAxisId="delta" dataKey="btcReaction" name="BTC 24h Reaction" fill="#22c55e" radius={[1, 1, 0, 0]} />
        <Line yAxisId="react" type="monotone" dataKey="actual" name="Actual" stroke="#f59e0b" strokeWidth={1.5} dot={{ r: 2, fill: '#f59e0b' }} />
        <Line yAxisId="react" type="monotone" dataKey="forecast" name="Forecast" stroke="#52525b" strokeWidth={1} strokeDasharray="3 3" dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function StockChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#1c1c1c" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="price" orientation="right" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={40} />
        <YAxis yAxisId="btc" orientation="left" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} width={36} />
        <Tooltip content={<CustomTooltip />} />
        <Bar yAxisId="btc" dataKey="btcHoldings" name="BTC Holdings" fill="#f59e0b" opacity={0.3} radius={[1, 1, 0, 0]} />
        <Line yAxisId="price" type="monotone" dataKey="price" name="Stock Price" stroke="#a78bfa" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#a78bfa' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

function IndexChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="2 4" stroke="#1c1c1c" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
        <YAxis orientation="right" tick={{ fill: '#52525b', fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={40} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="price" name="Index Price" stroke="#38bdf8" strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: '#38bdf8' }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

const LEGENDS = {
  currency: [
    { color: '#22c55e', label: 'Price' },
    { color: '#3b82f6', label: 'ETF Net Flow' },
  ],
  macro: [
    { color: '#22c55e', label: 'BTC 24h Δ' },
    { color: '#f59e0b', label: 'Actual' },
    { color: '#52525b', label: 'Forecast', dash: true },
  ],
  stock: [
    { color: '#a78bfa', label: 'Stock Price' },
    { color: '#f59e0b', label: 'BTC Holdings' },
  ],
  index: [{ color: '#38bdf8', label: 'Index Price' }],
}

export default function ChartPanel({ data }) {
  const [range, setRange] = useState('30D')

  if (!data || data.type === 'idle') {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-2">
        <div className="text-zinc-700 text-xs font-mono">CHART & CONTEXT</div>
        <div className="text-zinc-600 text-[10px] font-mono">Search to load chart</div>
      </div>
    )
  }

  const chartTitle = {
    currency: `${data.ticker} / USD  ·  Price + ETF Net Flow`,
    macro: `${data.ticker}  ·  Historical Surprise vs BTC Reaction`,
    stock: `${data.ticker}  ·  Stock Price + BTC Treasury`,
    index: `${data.label}  ·  Index Performance`,
  }[data.type] || ''

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2.5 border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-green-400" />
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">Chart & Context</span>
        </div>
        <div className="flex gap-1.5">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1.5 text-[10px] font-mono rounded transition-colors active:scale-[0.97] ${
                range === r ? 'bg-zinc-700 text-zinc-200' : 'text-zinc-600 hover:text-zinc-400'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="px-3 py-2.5 flex items-center justify-between flex-shrink-0">
        <div className="text-xs font-mono text-zinc-500">{chartTitle}</div>
        <div className="flex gap-3">
          {(LEGENDS[data.type] || []).map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="w-3 h-px" style={{ background: l.dash ? 'none' : l.color, borderTop: l.dash ? `1px dashed ${l.color}` : undefined }} />
              <span className="text-[10px] font-mono text-zinc-600">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-2 pb-2 min-h-0">
        {data.type === 'currency' && <CurrencyChart data={data.klines} macroEvents={data.macroEvents} />}
        {data.type === 'macro' && <MacroChart data={data.history} />}
        {data.type === 'stock' && <StockChart data={data.klines} />}
        {data.type === 'index' && <IndexChart data={data.klines} />}
      </div>

      {data.type === 'macro' && data.snapshot && (
        <div className="mx-3 mb-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-500 flex-shrink-0">
          {data.snapshot.btcPattern}
        </div>
      )}

      {data.type === 'index' && data.snapshot && (
        <div className="px-3 pb-2 grid grid-cols-3 gap-2 flex-shrink-0">
          {[
            { label: '1M ROI', value: data.snapshot.roi1m },
            { label: '3M ROI', value: data.snapshot.roi3m },
            { label: '1Y ROI', value: data.snapshot.roi1y },
          ].map((s) => (
            <div key={s.label} className="px-2 py-2 bg-zinc-900 border border-zinc-800 rounded text-center">
              <div className="text-[10px] font-mono text-zinc-600">{s.label}</div>
              <div className={`text-sm font-mono tabular-nums ${s.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {s.value >= 0 ? '+' : ''}{s.value}%
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
