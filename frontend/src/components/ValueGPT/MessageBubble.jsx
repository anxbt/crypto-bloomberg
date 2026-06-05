import React from 'react'
import CitationChip from './CitationChip'

const CITATION_RE = /\[news:(\d+)\]/g

function tokenize(text) {
  const out = []
  let lastIdx = 0
  let m
  CITATION_RE.lastIndex = 0
  while ((m = CITATION_RE.exec(text)) !== null) {
    if (m.index > lastIdx) out.push(text.slice(lastIdx, m.index))
    out.push({ citation: parseInt(m[1], 10) })
    lastIdx = m.index + m[0].length
  }
  if (lastIdx < text.length) out.push(text.slice(lastIdx))
  return out
}

export default function MessageBubble({ role, content, streaming, editorial }) {
  const isUser = role === 'user'
  const tokens = tokenize(content || '')

  // Editorial = first assistant reply in a conversation. Pull-quote treatment.
  if (editorial && !isUser) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[95%] pl-5 pr-2 py-1 border-l-2 border-ai-glow/40">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 13, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-mono text-[9px] text-ai-glow uppercase tracking-[0.25em] font-black">ValueGPT · Lead</span>
          </div>
          <div className="font-sans text-[16px] leading-relaxed whitespace-pre-wrap break-words italic text-on-surface font-medium">
            {tokens.map((tok, i) =>
              typeof tok === 'string'
                ? <span key={i}>{tok}</span>
                : <CitationChip key={i} id={tok.citation} />
            )}
            {streaming && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-ai-glow align-text-bottom animate-pulse" />
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[88%] rounded-xl px-3.5 py-2.5 ${
          isUser
            ? 'bg-primary-container/15 border border-primary-container/25 text-on-surface'
            : 'bg-surface-container/40 border border-border-subtle text-on-surface'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-ai-glow" style={{ fontSize: 12, fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-mono text-[9px] text-ai-glow uppercase tracking-widest font-black">ValueGPT</span>
          </div>
        )}
        <div className="font-sans text-[13px] leading-relaxed whitespace-pre-wrap break-words">
          {tokens.map((tok, i) =>
            typeof tok === 'string'
              ? <span key={i}>{tok}</span>
              : <CitationChip key={i} id={tok.citation} />
          )}
          {streaming && !isUser && (
            <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-ai-glow align-text-bottom animate-pulse" />
          )}
        </div>
      </div>
    </div>
  )
}
