import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3 px-8">
          <div className="text-red-500 text-xs font-mono uppercase tracking-widest">Render Error</div>
          <div className="text-zinc-600 text-[10px] font-mono text-center leading-relaxed max-w-sm">
            {this.state.error.message}
          </div>
          <button
            onClick={() => this.setState({ error: null })}
            className="text-[9px] font-mono text-zinc-700 hover:text-zinc-500 border border-zinc-800 px-3 py-1 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
