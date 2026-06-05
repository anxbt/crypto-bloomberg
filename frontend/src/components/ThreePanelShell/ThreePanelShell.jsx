import React from 'react'
import SignalFeed from '../panels/SignalFeed'
import ChartPanel, { InstitutionalXRay } from '../panels/ChartPanel'
import ActionLayer from '../panels/ActionLayer'

export default function ThreePanelShell({ data, loading }) {
  const isCurrency = data?.type === 'currency'

  return (
    <div className={`flex-1 grid grid-cols-12 gap-6 min-h-0 transition-opacity duration-150 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
      {/* Panel A — Signal Feed */}
      <div className="col-span-12 xl:col-span-3 bento-box rounded-none h-[calc(100vh-140px)] flex flex-col bg-[#0d0e12]/40 overflow-hidden">
        <SignalFeed data={data} />
      </div>

      {/* Panel B — Chart & Context */}
      <div className="col-span-12 xl:col-span-6 flex flex-col gap-6 overflow-hidden min-h-0">
        {/* Top: Chart Card */}
        <div className="bento-box rounded-none flex flex-col h-[520px] relative overflow-hidden flex-shrink-0">
          <ChartPanel data={data} hideXRay={true} />
        </div>
        {/* Bottom: Institutional X-Ray HUD (only for currency) */}
        {isCurrency && (
          <div className="bento-box rounded-none flex flex-col flex-1 overflow-hidden min-h-0">
            <InstitutionalXRay />
          </div>
        )}
      </div>

      {/* Panel C — Action Layer */}
      <div className="col-span-12 xl:col-span-3 overflow-y-auto custom-scrollbar flex flex-col min-w-0">
        <ActionLayer data={data} />
      </div>
    </div>
  )
}
