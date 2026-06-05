import React, { useState } from 'react'

function fmtMoney(v) {
  if (v == null) return '—'
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(1)}k`
  return `$${v.toFixed(2)}`
}

function fmtQty(v) {
  if (v == null) return '—'
  if (v >= 100) return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (v >= 1)   return v.toFixed(2)
  return v.toFixed(4)
}

export default function RebalanceTable({ ticker = 'MAG7' }) {
  const [amount, setAmount] = useState(50000)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  async function compute() {
    if (!amount || amount <= 0) return
    setLoading(true)
    try {
      const res = await fetch(`/api/index/${ticker}/rebalance?amount=${amount}`)
      const json = await res.json()
      setData(json)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) { if (e.key === 'Enter') compute() }

  return (
    <div className="bg-surface-container/30 border border-border-subtle rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border-subtle/50 flex items-center justify-between">
        <div>
          <p className="font-mono text-[9px] text-text-dim uppercase tracking-[0.2em] font-bold">Rebalancing Calculator</p>
          <p className="font-mono text-[9px] text-text-dim/50 mt-0.5">Enter portfolio size → see exact trades</p>
        </div>
        <span className="material-symbols-outlined text-ai-glow/40" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>calculate</span>
      </div>

      <div className="px-4 py-3 flex items-center gap-2 border-b border-border-subtle/50">
        <span className="font-mono text-sm text-text-dim flex-shrink-0">$</span>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          onKeyDown={handleKey}
          placeholder="50000"
          min="100"
          step="1000"
          className="flex-1 bg-transparent border-b border-border-subtle focus:border-ai-glow/50 outline-none font-mono text-sm text-on-surface tabular-nums py-1 transition-colors"
        />
        <button
          onClick={compute}
          disabled={loading || !amount}
          className="px-3 py-1.5 rounded-md bg-ai-glow text-on-primary font-mono text-[10px] font-black uppercase tracking-widest hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? '…' : 'Compute'}
        </button>
      </div>

      {data?.rows?.length > 0 && (
        <div className="px-2 py-2 max-h-64 overflow-y-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="font-mono text-[8px] text-text-dim/60 uppercase tracking-wider">
                <th className="px-2 py-1.5 text-left">Asset</th>
                <th className="px-2 py-1.5 text-right">Weight</th>
                <th className="px-2 py-1.5 text-right">$ Target</th>
                <th className="px-2 py-1.5 text-right">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/20">
              {data.rows.map((r) => (
                <tr key={r.ticker} className="hover:bg-white/[0.02]">
                  <td className="px-2 py-2 font-mono text-[11px] font-bold text-on-surface">{r.ticker}</td>
                  <td className="px-2 py-2 font-mono text-[10px] text-text-dim text-right tabular-nums">{r.weight.toFixed(1)}%</td>
                  <td className="px-2 py-2 font-mono text-[10px] text-ai-glow text-right tabular-nums font-bold">{fmtMoney(r.targetUsd)}</td>
                  <td className="px-2 py-2 font-mono text-[10px] text-on-surface text-right tabular-nums">{fmtQty(r.targetQty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="px-2 pt-2 font-mono text-[9px] text-text-dim/50 uppercase tracking-wider">
            Total: ${data.amount.toLocaleString()} · {data.source === 'live' ? 'Live prices' : 'Mock prices'}
          </p>
        </div>
      )}

      {data?.rows?.length === 0 && (
        <div className="px-4 py-4 font-mono text-[10px] text-text-dim/50 uppercase tracking-wider text-center">
          No constituents available
        </div>
      )}
    </div>
  )
}
