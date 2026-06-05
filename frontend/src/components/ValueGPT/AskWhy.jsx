import React from 'react'
import { useChat } from '../../store/chat'

// Wraps any inline text (typically a % change) so clicking it asks ValueGPT to explain.
// Stays inline — preserves the original visual; only reveals a sparkle on hover.
export default function AskWhy({ children, prompt, className = '' }) {
  const openChat = useChat((s) => s.openChat)
  const send     = useChat((s) => s.send)

  function fire(e) {
    e.preventDefault()
    e.stopPropagation()
    openChat()
    // Defer to next tick so the panel mounts before send() reads state
    setTimeout(() => send(prompt), 0)
  }

  function onKey(e) {
    if (e.key === 'Enter' || e.key === ' ') fire(e)
  }

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={fire}
      onKeyDown={onKey}
      title="Ask ValueGPT why →"
      className={`group cursor-pointer inline-flex items-baseline gap-0.5 hover:brightness-110 transition-[filter] ${className}`}
    >
      {children}
      <span
        aria-hidden
        className="material-symbols-outlined text-ai-glow opacity-0 group-hover:opacity-70 transition-opacity flex-shrink-0"
        style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}
      >
        auto_awesome
      </span>
    </span>
  )
}
