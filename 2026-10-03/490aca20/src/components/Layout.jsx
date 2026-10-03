import { Outlet, useLocation } from 'react-router-dom'
import { RotateCcw, Sparkles } from 'lucide-react'
import Sidebar, { ROUTE_TITLES } from './Sidebar'
import { Pill } from './ui'
import { useDemo } from '../context/DemoContext'
import { aiServiceMeta } from '../services/aiService'

function DemoStatus() {
  const { state } = useDemo()

  if (state.resolutionStatus === 'stable') {
    return <Pill tone="stable">🟢 Misconception resolved</Pill>
  }
  if (state.resolutionStatus === 'developing') {
    return <Pill tone="developing">🟡 Still developing</Pill>
  }
  if (state.stage === 'not-started') return <Pill tone="neutral">Demo not started</Pill>

  const labels = {
    submitted: 'Answer submitted',
    diagnosed: 'Diagnosis ready',
    verified: 'Hypothesis tested',
    intervened: 'Intervention viewed',
    'stress-testing': 'Stability check running',
    resolved: 'Resolved',
  }
  return <Pill tone="violet">{labels[state.stage] || state.stage}</Pill>
}

export default function Layout() {
  const { pathname } = useLocation()
  const { resetDemo } = useDemo()
  const [title, crumb] = ROUTE_TITLES[pathname] || ['Re:Learn', 'Prototype']

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main">
        <header className="topbar">
          <div>
            <div className="topbar-title">{title}</div>
            <div className="topbar-crumb">{crumb}</div>
          </div>
          <div className="topbar-spacer" />
          <DemoStatus />
          <span className="pill dark" style={{ background: 'var(--navy-800)' }}>
            <Sparkles size={13} />
            {aiServiceMeta.engine}
          </span>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={resetDemo}
            title="Reset the demo back to the starting state"
          >
            <RotateCcw size={15} />
            <span className="label">Reset demo</span>
          </button>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
