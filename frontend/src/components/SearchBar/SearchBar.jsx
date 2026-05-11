import React, { useState } from 'react'

export default function SearchBar({ onSearch }) {
  const [q, setQ] = useState('')

  function handleKey(e) {
    if (e.key === 'Enter') {
      onSearch && onSearch(q.trim())
    }
  }

  return (
    <div className="mb-4">
      <input
        aria-label="Search"
        placeholder="Search BTC, CPI, MSTR, MAG7... (press Enter)"
        className="w-full p-3 rounded-md bg-gray-900 border border-gray-700"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={handleKey}
      />
    </div>
  )
}
