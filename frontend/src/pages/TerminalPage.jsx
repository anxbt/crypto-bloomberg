import React, { useState, useCallback, useEffect } from 'react'
import TopBar from '../components/TopBar/TopBar'
import ThreePanelShell from '../components/ThreePanelShell/ThreePanelShell'
import Sidebar from '../components/Sidebar/Sidebar'
import ErrorBoundary from '../components/ErrorBoundary'
import ChatPanel from '../components/ValueGPT/ChatPanel'
import MarketIntelView from '../views/MarketIntelView'
import ResearchLabView from '../views/ResearchLabView'
import PortfolioView from '../views/PortfolioView'
import { useChat } from '../store/chat'
import API from '../services/api'

export default function TerminalPage() {
  const [q, setQ] = useState('')
  const [panelData, setPanelData] = useState({ type: 'idle' })
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('terminal')
  const setPanelContext = useChat((s) => s.setPanelContext)
  const openChat = useChat((s) => s.openChat)

  useEffect(() => {
    API.loadContext('currency', 'BTC').then(setPanelData).catch(() => {})
  }, [])

  // Keep chat store in sync with currently-loaded asset
  useEffect(() => {
    setPanelContext(panelData)
  }, [panelData, setPanelContext])

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
  const handleOpenChat = useCallback(() => openChat(), [openChat])

  return (
    <div className="h-dvh flex flex-col bg-background text-on-surface overflow-hidden terminal-bg relative">
      <TopBar
        q={q}
        onQChange={setQ}
        onSearch={doSearch}
        activeContext={panelData}
        activeTicker={activeTicker}
        loading={loading}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onOpenChat={handleOpenChat}
      />
      <div className="flex-1 flex min-w-0 overflow-hidden relative z-10">
        <Sidebar
          onSearch={doSearch}
          open={sidebarOpen}
          onOpenChat={handleOpenChat}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        <main
          className="flex-1 px-8 pt-6 pb-8 overflow-hidden flex flex-col min-w-0 transition-[margin] duration-300"
          style={{ marginLeft: sidebarOpen ? 240 : 0 }}
        >
          <ErrorBoundary>
            {activeView === 'terminal'  && <ThreePanelShell data={panelData} loading={loading} />}
            {activeView === 'intel'     && <MarketIntelView />}
            {activeView === 'research'  && <ResearchLabView />}
            {activeView === 'portfolio' && <PortfolioView />}
          </ErrorBoundary>
        </main>
      </div>

      <ChatPanel />

      {/* Background Visuals */}
      <div className="fixed inset-0 pointer-events-none opacity-10 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-transparent to-primary/5"></div>
        <img
          className="w-full h-full object-cover mix-blend-overlay grayscale contrast-125"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDus1nb9VTSpMgTYK3eC7-gDet98XqB_Gx9wI_wdxlsgdT3b6TvfjhGgjNJsj5Ec1B22n8q6Q5jMAiWyWCPIpQpx9BUbAVZmQWaTngd9-yfvtjr8BwD2tq9e1vyQLdVJOx8nJUffQ3QVAlARAd07g1SdNmv5NjjzkWrMEfI6offSUEPdSiJ-X0mIB-zOE4wwgR00mZMSZ7ObpDTrzB0lDTIbXJHIX2XWDkmSIHJjUYTxWKFAJp6MKvrA4K0TXJ4SAtt9Oxz8CPRRIHM"
          alt="Premium Terminal Grid Visual"
        />
      </div>
    </div>
  )
}
