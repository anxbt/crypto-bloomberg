import React, { useEffect, useState } from 'react'

const EVENTS = ['CPI', 'FOMC', 'NFP']
const REFRESH_MS = 5 * 60 * 1000

async function fetchNextMacro() {
  const results = await Promise.allSettled(
    EVENTS.map((ev) => fetch(`/api/macro?event=${ev}`).then((r) => r.ok ? r.json() : null))
  )
  const candidates = results
    .map((r, i) => r.status === 'fulfilled' && r.value?.snapshot ? { event: EVENTS[i], ...r.value.snapshot } : null)
    .filter(Boolean)
    .filter((s) => typeof s.daysToNext === 'number')

  if (!candidates.length) return null
  candidates.sort((a, b) => a.daysToNext - b.daysToNext)
  return candidates[0]
}

export default function MacroBadge() {
  const [next, setNext] = useState(null)

  useEffect(() => {
    let cancelled = false
    function load() {
      fetchNextMacro().then((v) => { if (!cancelled) setNext(v) }).catch(() => {})
    }
    load()
    const t = setInterval(load, REFRESH_MS)
    return () => { cancelled = true; clearInterval(t) }
  }, [])

  if (!next) return null

  const urgent = next.daysToNext < 1
  const soon   = next.daysToNext <= 3
  const label  = next.daysToNext === 0 ? 'TODAY' : `${next.daysToNext}D`

  const cls = urgent
    ? 'text-error border-error/40 bg-error/10 animate-pulse'
    : soon
      ? 'text-tertiary-container border-tertiary-container/40 bg-tertiary-container/10'
      : 'text-text-dim border-border-subtle bg-surface-container-low/50'

  return (
    <div
      className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded border font-mono text-[10px] font-bold uppercase tracking-wider ${cls}`}
      title={`Next: ${next.event} on ${next.nextDate} (${next.daysToNext} days)`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>schedule</span>
      <span>{next.event}</span>
      <span className="opacity-70">·</span>
      <span className="tabular-nums">{label}</span>
    </div>
  )
}
