import React from 'react'
import SignalFeed from '../panels/SignalFeed'
import ChartPanel from '../panels/ChartPanel'
import ActionLayer from '../panels/ActionLayer'

export default function ThreePanelShell({ data, loading }) {
  return (
    <div className={`flex-1 grid grid-cols-12 gap-px bg-zinc-800 min-h-0 transition-opacity duration-150 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
      {/* Panel A — Signal Feed */}
      <div className="col-span-3 bg-zinc-950 overflow-hidden flex flex-col">
        <SignalFeed data={data} />
      </div>

      {/* Panel B — Chart & Context */}
      <div className="col-span-6 bg-zinc-950 overflow-hidden flex flex-col border-x border-zinc-800">
        <ChartPanel data={data} />
      </div>

      {/* Panel C — Action Layer */}
      <div className="col-span-3 bg-zinc-950 overflow-y-auto flex flex-col">
        <ActionLayer data={data} />
      </div>
    </div>
  )
}
