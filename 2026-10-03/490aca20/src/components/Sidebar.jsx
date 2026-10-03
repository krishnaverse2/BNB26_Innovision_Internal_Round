import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  TerminalSquare,
  Fingerprint,
  Lightbulb,
  ClipboardCheck,
  History,
  BarChart3,
  Settings,
  User,
  Stethoscope,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import { useDemo } from '../context/DemoContext'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/coding-lab', label: 'Coding Lab', icon: TerminalSquare },
  { to: '/misconceptions', label: 'Misconceptions', icon: Fingerprint },
  { to: '/interventions', label: 'Interventions', icon: Lightbulb },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck },
  { to: '/timeline', label: 'Learning Timeline', icon: History },
]

const FOOTER_NAV = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
]

// The diagnosis journey. Kept visible in the sidebar so every route in the
// demo is reachable and the presenter can jump to any step.
export const FLOW_STEPS = [
  { to: '/diagnosis', label: 'AI Diagnosis', icon: Stethoscope },
  { to: '/diagnostic-test', label: 'Hypothesis Test', icon: FlaskConical },
  { to: '/intervention', label: 'Intervention', icon: GraduationCap },
  { to: '/stress-test', label: 'Stability Check', icon: ShieldCheck },
  { to: '/resolution', label: 'Resolution', icon: Trophy },
]

export const ROUTE_TITLES = {
  '/dashboard': ['Dashboard', 'Student overview'],
  '/coding-lab': ['Coding Lab', 'Attempt a challenge'],
  '/diagnosis': ['AI Diagnosis', 'Why the answer differed'],
  '/diagnostic-test': ['Hypothesis Test', 'Confirm the misconception'],
  '/intervention': ['Adaptive Intervention', 'Personalized teaching'],
  '/stress-test': ['Learning Stability Check', 'Prove the concept is stable'],
  '/resolution': ['Resolution', 'Before and after'],
  '/misconceptions': ['Misconception Fingerprint', 'Concept analytics'],
  '/interventions': ['Intervention Library', 'Teaching moves by misconception'],
  '/assessments': ['Assessments', 'Question bank by evidence type'],
  '/timeline': ['Learning Timeline', 'Progress over time'],
  '/settings': ['Settings', 'Prototype preferences'],
  '/profile': ['Profile', 'Learner details'],
}

function reachedIndex(state) {
  if (state.resolutionStatus) return 5
  if (state.stage === 'stress-testing' || Object.keys(state.stressTestResults).length)
    return 3
  if (state.interventionCompleted) return 3
  if (state.diagnosticResult) return 2
  if (state.diagnosis) return 1
  if (state.submitted) return 0
  return -1
}

export default function Sidebar() {
  const { state, student } = useDemo()
  const { user, profile } = useAuth()
  const reached = reachedIndex(state)

  const studentName = profile?.fullName || user?.name || student.fullName
  const initials = studentName.slice(0, 2).toUpperCase()

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">🧠</div>
        <div>
          <div className="sidebar-logo-text">Re:Learn</div>
          <div className="sidebar-logo-sub">Adaptive Learning</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Learn</div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="icon" strokeWidth={1.9} />
            <span className="label">{label}</span>
          </NavLink>
        ))}

        <div className="sidebar-section-label">Diagnosis flow</div>
        {FLOW_STEPS.map(({ to, label, icon: Icon }, index) => {
          const done = index < reached
          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon className="icon" strokeWidth={1.9} />
              <span className="label">{label}</span>
              <span className={`sidebar-step-badge ${done ? 'done' : ''}`}>
                {done ? '✓' : index + 1}
              </span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-profile">
          <div className="avatar">{initials}</div>
          <div className="sidebar-profile-text">
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>{studentName}</div>
            <div style={{ fontSize: 11.5, color: '#93a1bd' }}>
              {state.resolutionStatus === 'stable' ? 'Concept stable' : 'Learning in progress'}
            </div>
          </div>
        </div>
        {FOOTER_NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="icon" strokeWidth={1.9} />
            <span className="label">{label}</span>
          </NavLink>
        ))}
      </div>
    </aside>
  )
}
