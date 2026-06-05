import React, { useState } from 'react'
import { useChat } from '../store/chat'
import { usePortfolio } from '../hooks/usePortfolio'

function fmtMoney(v) {
  if (v == null || Number.isNaN(v)) return '—'
  if (Math.abs(v) >= 1000) return `$${(v / 1000).toFixed(2)}k`
  return `$${v.toFixed(2)}`
}

function fmtQty(v) {
  if (v == null) return '—'
  if (v >= 100) return v.toLocaleString(undefined, { maximumFractionDigits: 0 })
  if (v >= 1)   return v.toFixed(2)
  return v.toFixed(4)
}

function EditableQty({ value, onChange }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(String(value))

  function commit() {
    setEditing(false)
    const n = Number(draft)
    if (!Number.isNaN(n) && n >= 0 && n !== value) onChange(n)
    else setDraft(String(value))
  }

  if (editing) {
    return (
      <input
        type="number"
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) } }}
        className="w-20 bg-transparent border-b border-ai-glow/60 outline-none font-mono text-[11px] text-on-surface text-right tabular-nums"
      />
    )
  }
  return (
    <button onClick={() => { setDraft(String(value)); setEditing(true) }} className="font-mono text-[11px] text-on-surface text-right tabular-nums hover:text-ai-glow border-b border-transparent hover:border-ai-glow/40 transition-colors">
      {fmtQty(value)}
    </button>
  )
}

function AddRow({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [ticker, setTicker] = useState('')
  const [qty, setQty] = useState('')

  function submit() {
    if (!ticker || !qty) return
    onAdd(ticker, Number(qty))
    setTicker(''); setQty(''); setOpen(false)
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 border border-dashed border-border-subtle hover:border-ai-glow/40 rounded-lg font-mono text-[10px] text-text-dim hover:text-ai-glow uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
      >
        <span className="material-symbols-outlined" style={{ fontSize: 14 }}>add</span>
        Add holding
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border border-ai-glow/30 rounded-lg bg-ai-glow/5">
      <input
        value={ticker}
        onChange={(e) => setTicker(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Ticker (BTC, MSTR…)"
        autoFocus
        className="w-32 bg-transparent border-b border-border-subtle focus:border-ai-glow/50 outline-none font-mono text-[11px] text-on-surface uppercase tracking-wider py-1 transition-colors"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Quantity"
        step="0.001"
        min="0"
        className="w-24 bg-transparent border-b border-border-subtle focus:border-ai-glow/50 outline-none font-mono text-[11px] text-on-surface tabular-nums py-1 transition-colors"
      />
      <button onClick={submit} className="px-3 py-1 rounded-md bg-ai-glow text-on-primary font-mono text-[9px] font-black uppercase tracking-widest hover:opacity-90">Add</button>
      <button onClick={() => { setOpen(false); setTicker(''); setQty('') }} className="px-2 py-1 text-text-dim hover:text-on-surface">
        <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
      </button>
    </div>
  )
}

const ACTION_CLS = {
  Add:  'text-ai-glow border-ai-glow/30 bg-ai-glow/10',
  Trim: 'text-error border-error/30 bg-error/10',
  Hold: 'text-text-dim border-border-subtle bg-surface-container-low/30',
}

export default function PortfolioView() {
  const openChat = useChat((s) => s.openChat)
  const { rows, total, totalFvDelta, totalFvPct, loading, updateQty, addHolding, removeHolding } = usePortfolio()

  function askValueGptToRebalance() {
    const holdingsStr = rows.map((r) => `${r.ticker}: ${r.qty} ($${Math.round(r.value).toLocaleString()})`).join(', ')
    openChat({
      seed: `My current paper portfolio is: ${holdingsStr}. Total: $${Math.round(total).toLocaleString()}. Based on Fair Value Delta and bull probabilities, what specific rebalance would you suggest? Format as concrete % shifts.`,
    })
  }

  return (
    <div className="h-full w-full min-w-0 flex flex-col gap-8 overflow-y-auto pb-8">
      <header className="flex flex-col gap-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="font-mono text-[10px] text-ai-glow font-black tracking-[0.25em] uppercase">The Book</p>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-tertiary-container/15 text-tertiary-container border border-tertiary-container/30 uppercase tracking-wider font-black">Demo · Paper</span>
            </div>
            <h2 className="font-sans text-3xl lg:text-4xl font-black tracking-tighter text-on-surface leading-none">Portfolio</h2>
            <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mt-3">Per-holding Fair Value Delta · AI rebalance suggestions</p>
          </div>
          <button
            onClick={askValueGptToRebalance}
            disabled={rows.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-ai-glow text-on-primary font-mono text-[11px] font-black uppercase tracking-wider hover:opacity-90 active-nav-glow transition-opacity disabled:opacity-50 cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            Rebalance with AI
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bento-box rounded-xl p-6">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Total Value</p>
          <p className="font-sans text-3xl font-black tracking-tighter text-on-surface tabular-nums">${Math.round(total).toLocaleString()}</p>
        </div>
        <div className={`bento-box rounded-xl p-6 ${totalFvDelta < 0 ? 'border-ai-glow/30' : totalFvDelta > 0 ? 'border-error/30' : ''}`}>
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Fair Value Delta</p>
          <p className={`font-sans text-3xl font-black tracking-tighter tabular-nums ${totalFvDelta < 0 ? 'text-ai-glow' : totalFvDelta > 0 ? 'text-error' : 'text-on-surface'}`}>
            {totalFvDelta < 0 ? '-' : totalFvDelta > 0 ? '+' : ''}${Math.abs(totalFvDelta).toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-text-dim mt-2 uppercase tracking-wider">
            Portfolio is {Math.abs(totalFvPct).toFixed(1)}% {totalFvDelta < 0 ? 'undervalued' : totalFvDelta > 0 ? 'overvalued' : 'fairly valued'}
          </p>
        </div>
        <div className="bento-box rounded-xl p-6">
          <p className="font-mono text-[10px] text-text-dim uppercase tracking-widest mb-3">Holdings</p>
          <p className="font-sans text-3xl font-black tracking-tighter text-on-surface tabular-nums">{rows.length}</p>
          <p className="font-mono text-[10px] text-text-dim mt-2 uppercase tracking-wider">{rows.filter((r) => !r.missing).length} priced</p>
        </div>
      </div>

      <div className="bento-box rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="bg-black/20 border-b border-border-subtle/60 font-mono text-[10px] text-text-dim uppercase tracking-[0.12em]">
              <th className="px-5 py-4 text-left font-bold">Asset</th>
              <th className="px-5 py-4 text-right font-bold">Qty</th>
              <th className="px-5 py-4 text-right font-bold">Price</th>
              <th className="px-5 py-4 text-right font-bold">Value</th>
              <th className="px-5 py-4 text-right font-bold">FV Δ</th>
              <th className="px-5 py-4 text-right font-bold">Bull</th>
              <th className="px-5 py-4 text-center font-bold">Action</th>
              <th className="px-3 py-4 text-right font-bold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle/30">
            {loading && rows.length === 0 && (
              <tr><td colSpan={8} className="px-5 py-10 text-center font-mono text-[10px] text-text-dim/40 uppercase tracking-widest">Loading portfolio…</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.ticker} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-4 font-sans text-sm font-bold text-on-surface">
                  {r.ticker}
                  <span className="ml-2 font-mono text-[9px] text-text-dim/40 uppercase">{r.type}</span>
                </td>
                <td className="px-5 py-4 text-right"><EditableQty value={r.qty} onChange={(q) => updateQty(r.ticker, q)} /></td>
                <td className="px-5 py-4 font-mono text-[12px] text-text-dim text-right tabular-nums">{r.price ? fmtMoney(r.price) : '—'}</td>
                <td className="px-5 py-4 font-mono text-[12px] text-on-surface text-right tabular-nums font-bold">{r.value ? fmtMoney(r.value) : '—'}</td>
                <td className={`px-5 py-4 font-mono text-[12px] text-right tabular-nums font-bold ${
                  r.fvDelta == null ? 'text-text-dim/40' : r.fvDelta < 0 ? 'text-ai-glow' : 'text-error'
                }`}>
                  {r.fvDelta == null ? '—' : `${r.fvDelta < 0 ? '-' : '+'}$${Math.abs(r.fvDelta).toLocaleString()}`}
                </td>
                <td className="px-5 py-4 font-mono text-[12px] text-ai-glow text-right tabular-nums">{r.bullPct}%</td>
                <td className="px-5 py-4 text-center">
                  <span className={`font-mono text-[10px] px-3 py-1 rounded-full border font-black uppercase tracking-wider ${ACTION_CLS[r.action]}`}>
                    {r.action}
                  </span>
                </td>
                <td className="px-3 py-4 text-right">
                  <button onClick={() => removeHolding(r.ticker)} className="text-text-dim/40 hover:text-error transition-colors cursor-pointer" title="Remove holding">
                    <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      <AddRow onAdd={addHolding} />
    </div>
  )
}
