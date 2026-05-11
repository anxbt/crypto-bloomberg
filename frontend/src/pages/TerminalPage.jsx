import React, { useState, useCallback, useEffect } from 'react'
import TopBar from '../components/TopBar/TopBar'
import ThreePanelShell from '../components/ThreePanelShell/ThreePanelShell'
import ErrorBoundary from '../components/ErrorBoundary'
import API from '../services/api'

export default function TerminalPage() {
  const [q, setQ] = useState('')
  const [panelData, setPanelData] = useState({ type: 'idle' })
  const [loading, setLoading] = useState(false)

  // Load BTC on mount as default context
  useEffect(() => {
    API.loadContext('currency', 'BTC').then(setPanelData).catch(() => {})
  }, [])

  const doSearch = useCallback(async (query) => {
    if (!query) return
    setLoading(true)
    setQ(query.toUpperCase())
    try {
      const { type, id } = await API.search(query)
      const data = await API.loadContext(type, id)
      setPanelData(data)
    } catch {
      // backend unreachable — keep current panel data
    } finally {
      setLoading(false)
    }
  }, [])

  const activeTicker = panelData?.ticker || ''

  return (
    <div className="h-dvh flex flex-col bg-zinc-950 text-white overflow-hidden">
      <TopBar
        q={q}
        onQChange={setQ}
        onSearch={doSearch}
        activeContext={panelData}
        activeTicker={activeTicker}
        loading={loading}
      />
      <ErrorBoundary>
        <ThreePanelShell data={panelData} loading={loading} />
      </ErrorBoundary>
    </div>
  )
}
