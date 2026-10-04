import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  TerminalSquare,
  Code2,
  Zap,
  TrendingUp,
  Trophy,
  Users,
  Settings,
  User,
  Stethoscope,
  FlaskConical,
  GraduationCap,
  ShieldCheck,
  Fingerprint,
  History,
  ClipboardCheck,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useDemo } from '../context/DemoContext'
import { useAuth } from '../context/AuthContext'

export const ROUTE_TITLES = {
  '/dashboard': ['Dashboard', 'Student Overview'],
  '/courses': ['Courses', 'Explore & Continue'],
  '/coding-lab': ['Coding Lab', 'Interactive Practice'],
  '/diagnosis': ['AI Diagnosis', 'Cognitive Analysis'],
  '/diagnostic-test': ['Hypothesis Test', 'Confirm Misconception'],
  '/intervention': ['Adaptive Intervention', 'Personalized Teaching'],
  '/stress-test': ['Learning Stability Check', 'Proof of Concept Stability'],
  '/resolution': ['Resolution & Proof', 'Cognitive Shift Analysis'],
  '/misconceptions': ['Misconception Fingerprint', 'Concept Mastery Matrix'],
  '/interventions': ['Intervention Library', 'Evidence-Based Moves'],
  '/assessments': ['Assessments Bank', 'Cognitive Validation Items'],
  '/timeline': ['Learning Timeline', 'Progress Over Time'],
  '/settings': ['Settings', 'Platform Preferences'],
  '/profile': ['Student Profile', 'Academic & Skill Details'],
}

const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/courses', label: 'Courses', icon: BookOpen },
  { to: '/coding-lab', label: 'Coding Practice', icon: TerminalSquare },
  { to: '/coding-lab?tab=dsa', label: 'DSA', icon: Code2 },
  { to: '/coding-lab?tab=challenges', label: 'Challenges', icon: Zap },
  { to: '/dashboard#growth', label: 'Progress & Growth', icon: TrendingUp },
  { to: '/dashboard#achievements', label: 'Achievements', icon: Trophy },
  { to: '/dashboard#community', label: 'Community', icon: Users },
]

export const FLOW_STEPS = [
  { to: '/diagnosis', label: 'AI Diagnosis', icon: Stethoscope },
  { to: '/diagnostic-test', label: 'Hypothesis Test', icon: FlaskConical },
  { to: '/intervention', label: 'Intervention', icon: GraduationCap },
  { to: '/stress-test', label: 'Stability Check', icon: ShieldCheck },
  { to: '/resolution', label: 'Resolution', icon: Trophy },
  { to: '/misconceptions', label: 'Misconceptions', icon: Fingerprint },
  { to: '/timeline', label: 'Timeline', icon: History },
  { to: '/assessments', label: 'Assessments', icon: ClipboardCheck },
]

const FOOTER_NAV = [
  { to: '/settings', label: 'Settings', icon: Settings },
  { to: '/profile', label: 'Profile', icon: User },
]

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

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const { state, student } = useDemo()
  const { user, profile, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const reached = reachedIndex(state)

  const studentName = profile?.fullName || user?.name || student?.fullName || 'Student'
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside
        className={`sidebar ${isOpen ? 'open' : ''} ${collapsed ? 'collapsed' : ''}`}
        style={collapsed ? { width: 80 } : {}}
      >
        {/* Brand Header */}
        <div className="sidebar-header">
          <div
            className="brand-badge"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer', overflow: 'hidden' }}
          >
            <div className="brand-icon-box">
              <span style={{ fontSize: 17, letterSpacing: -1 }}>RE</span>
            </div>
            {!collapsed && (
              <div>
                <div className="brand-title">RE:LEARN</div>
                <div className="brand-tagline">Learn. Practice. Grow.</div>
              </div>
            )}
          </div>

          <button
            type="button"
            className="icon-btn hide-mobile"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ color: '#94a3b8', width: 28, height: 28 }}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Scrollable Navigation */}
        <div className="sidebar-scroll">
          <div className="sidebar-section-title">
            {!collapsed ? 'Main Navigation' : '•••'}
          </div>

          {MAIN_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon className="link-icon" size={18} strokeWidth={2} />
              {!collapsed && <span className="label">{label}</span>}
            </NavLink>
          ))}

          <div className="sidebar-section-title" style={{ marginTop: 12 }}>
            {!collapsed ? 'Cognitive AI Engine' : 'AI'}
          </div>

          {FLOW_STEPS.map(({ to, label, icon: Icon }, index) => {
            const done = index < reached
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onClose}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                title={collapsed ? label : undefined}
              >
                <Icon className="link-icon" size={18} strokeWidth={1.9} />
                {!collapsed && (
                  <>
                    <span className="label" style={{ flex: 1 }}>
                      {label}
                    </span>
                    {index < 5 && (
                      <span className={`sidebar-step-badge ${done ? 'done' : ''}`}>
                        {done ? '✓' : index + 1}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>

        {/* Footer: User & Settings */}
        <div className="sidebar-footer">
          {FOOTER_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              title={collapsed ? label : undefined}
              style={{ marginBottom: 4 }}
            >
              <Icon className="link-icon" size={17} />
              {!collapsed && <span className="label">{label}</span>}
            </NavLink>
          ))}

          <div className="divider" style={{ background: 'rgba(255,255,255,0.08)', margin: '10px 0' }} />

          <div className="user-mini-card">
            <div className="user-avatar-sm">{initials}</div>
            {!collapsed && (
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {studentName}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>
                  {state.resolutionStatus === 'stable' ? '🟢 Concept Stable' : 'Active Student'}
                </div>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                className="icon-btn"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                title="Log out"
                style={{ width: 30, height: 30, color: '#94a3b8' }}
              >
                <LogOut size={15} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
