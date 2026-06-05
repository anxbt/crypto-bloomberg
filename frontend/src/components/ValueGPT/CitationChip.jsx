import React from 'react'

export default function CitationChip({ id }) {
  function onClick(e) {
    e.preventDefault()
    window.dispatchEvent(new CustomEvent('cryptodesk:scroll-to-news', { detail: { id } }))
  }
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 mx-0.5 px-1.5 py-0.5 rounded-md bg-ai-glow/10 hover:bg-ai-glow/20 border border-ai-glow/25 hover:border-ai-glow/50 font-mono text-[10px] font-bold text-ai-glow tabular-nums transition-colors align-baseline"
      title={`Jump to news item #${id} in Signal Feed`}
    >
      <span className="material-symbols-outlined" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>article</span>
      {id}
    </button>
  )
}
