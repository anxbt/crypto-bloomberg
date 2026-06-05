import React, { useEffect, useState } from 'react'

function flowColor(flow, max) {
  if (!max || flow === 0) return 'rgba(31,33,40,0.5)'
  const intensity = Math.min(1, Math.abs(flow) / max)
  if (flow > 0) return `rgba(0, 245, 155, ${intensity * 0.75})`
  return `rgba(255, 180, 171, ${intensity * 0.75})`
}

export default function EtfHeatmap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/etf/multi?tickers=IBIT,FBTC,GBTC&days=30')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bento-box rounded-xl p-5 h-32 flex items-center justify-center">
        <span className="font-mono text-[10px] text-text-dim/40 uppercase tracking-widest">Loading ETF flows…</span>
      </div>
    )
  }
  if (!data?.tickers?.length) {
    return (
      <div className="bento-box rounded-xl p-5 h-32 flex items-center justify-center">
        <span className="font-mono text-[10px] text-text-dim/40 uppercase tracking-widest">No ETF flow data</span>
      </div>
    )
  }

  const max = Math.max(...data.tickers.flatMap((t) => t.days.map((d) => Math.abs(d.flow))))
  const sample = data.tickers[0].days
  const labelEvery = Math.max(1, Math.floor(sample.length / 6))

  return (
    <div className="bento-box rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-dim">ETF Inflow Heatmap</h4>
          <p className="font-mono text-[9px] text-text-dim/50 mt-1 uppercase tracking-wider">30-day net flow · {data.source === 'live' ? 'live' : 'synthetic'}</p>
        </div>
        <div className="flex items-center gap-3 font-mono text-[9px] text-text-dim uppercase">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,245,155,0.75)' }} />Inflow</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(255,180,171,0.75)' }} />Outflow</span>
        </div>
      </div>

      <div className="space-y-1.5">
        {data.tickers.map((row) => {
          const total = row.days.reduce((a, b) => a + b.flow, 0)
          return (
            <div key={row.ticker} className="flex items-center gap-2">
              <div className="w-12 flex-shrink-0">
                <span className="font-mono text-[11px] font-bold text-on-surface">{row.ticker}</span>
              </div>
              <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${row.days.length}, minmax(0, 1fr))` }}>
                {row.days.map((d, i) => (
                  <div
                    key={i}
                    className="h-6 rounded-sm border border-border-subtle/30"
                    style={{ background: flowColor(d.flow, max) }}
                    title={`${row.ticker} · ${d.date}: ${d.flow >= 0 ? '+' : ''}$${d.flow.toLocaleString()}M`}
                  />
                ))}
              </div>
              <div className="w-16 flex-shrink-0 text-right">
                <span className={`font-mono text-[10px] font-bold tabular-nums ${total >= 0 ? 'text-ai-glow' : 'text-error'}`}>
                  {total >= 0 ? '+' : ''}${(total / 1000).toFixed(1)}B
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="w-12 flex-shrink-0" />
        <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${sample.length}, minmax(0, 1fr))` }}>
          {sample.map((d, i) => (
            <span key={i} className="font-mono text-[8px] text-text-dim/40 text-center truncate">
              {i % labelEvery === 0 ? d.date : ''}
            </span>
          ))}
        </div>
        <div className="w-16 flex-shrink-0" />
      </div>
    </div>
  )
}
