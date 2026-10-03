import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  Bell,
  Sparkles,
  RotateCcw,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown,
  CheckCircle2,
  BookOpen,
  Code2,
  Terminal,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useDemo } from '../context/DemoContext'
import { aiServiceMeta } from '../services/aiService'
import { ROUTE_TITLES } from './Sidebar'

export default function Navbar({ onToggleSidebar, sidebarOpen }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user, profile, logout } = useAuth()
  const { state, resetDemo, student } = useDemo()

  const [searchQuery, setSearchQuery] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const searchInputRef = useRef(null)

  const studentName = profile?.fullName || user?.name || student?.fullName || 'Student'
  const studentEmail = profile?.email || user?.email || 'student@relearn.edu'
  const initials = studentName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const [pageTitle, pageCrumb] = ROUTE_TITLES[pathname] || ['Dashboard', 'Learning Portal']

  // Handle Ctrl+K shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(true)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const sampleNotifications = [
    {
      id: 1,
      title: 'Daily Challenge Unlocked',
      desc: 'Two Sum II - Array is Sorted is today’s problem',
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'AI Diagnostic Report Ready',
      desc: 'Loop boundary misconception model calibrated (BF10: 18.4)',
      time: '1h ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Achievement Unlocked 🏆',
      desc: '7-Day Learning Streak maintained',
      time: 'Yesterday',
      unread: false,
    },
  ]

  const quickSearchItems = [
    { title: 'DSA: Two Pointer Technique', category: 'Coding Lab', path: '/coding-lab' },
    { title: 'Python Loop Boundaries', category: 'AI Diagnosis', path: '/diagnosis' },
    { title: 'Data Structures & Algorithms Fundamentals', category: 'Courses', path: '/courses' },
    { title: 'Learning Stability Check', category: 'Assessment', path: '/stress-test' },
    { title: 'Misconception Fingerprint', category: 'Analytics', path: '/misconceptions' },
    { title: 'Full Stack Web Development', category: 'Courses', path: '/courses' },
  ]

  const filteredSearch = searchQuery.trim()
    ? quickSearchItems.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.category.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : quickSearchItems

  return (
    <>
      <header className="topbar">
        {/* Left Section: Mobile Toggle, Breadcrumb & Search */}
        <div className="topbar-left">
          <button
            type="button"
            className="icon-btn mobile-menu-btn"
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              RE:LEARN / <span style={{ color: 'var(--primary)' }}>{pageCrumb}</span>
            </div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--navy-900)', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {pageTitle}
            </h1>
          </div>

          <div
            className="search-bar hide-mobile"
            onClick={() => setShowSearchModal(true)}
            style={{ cursor: 'pointer', marginLeft: 16 }}
          >
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              readOnly
              placeholder="Search courses, problems, topics..."
              value=""
              style={{ cursor: 'pointer' }}
            />
            <span className="kbd-shortcut">Ctrl + K</span>
          </div>
        </div>

        {/* Right Section: Actions & Profile */}
        <div className="topbar-right">
          {/* AI Engine Status Pill */}
          <div
            className="pill dark"
            style={{
              background: 'var(--navy-900)',
              color: '#ffffff',
              border: '1px solid rgba(255,255,255,0.12)',
              padding: '6px 12px',
              fontSize: 12,
              fontWeight: 600,
            }}
            title="Bayesian Knowledge Tracing & IRT 2PL Active"
          >
            <Sparkles size={13} color="var(--primary-light)" />
            <span>{aiServiceMeta.engine}</span>
          </div>

          {/* Mobile Search Button */}
          <button
            type="button"
            className="icon-btn show-mobile-only"
            onClick={() => setShowSearchModal(true)}
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          {/* Reset Demo button */}
          <button
            type="button"
            className="btn btn-ghost btn-sm hide-mobile"
            onClick={resetDemo}
            title="Reset cognitive state to initial demo configuration"
            style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'var(--surface)' }}
          >
            <RotateCcw size={14} />
            <span>Reset Demo</span>
          </button>

          {/* Notification Bell */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                setShowNotifications(!showNotifications)
                setShowUserMenu(false)
              }}
              aria-label="Notifications"
            >
              <Bell size={18} />
              <span className="notif-badge" />
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: 320,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 16,
                  zIndex: 60,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--navy-900)' }}>
                    Notifications
                  </div>
                  <span className="pill blue" style={{ fontSize: 11, padding: '2px 8px' }}>
                    2 new
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {sampleNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 10,
                        background: notif.unread ? 'var(--primary-subtle)' : 'var(--surface-alt)',
                        border: notif.unread ? '1px solid var(--primary-border)' : '1px solid transparent',
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-900)' }}>
                        {notif.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {notif.desc}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-subtle)', marginTop: 4 }}>
                        {notif.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile User Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => {
                setShowUserMenu(!showUserMenu)
                setShowNotifications(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '4px 8px 4px 4px',
                borderRadius: 24,
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--primary) 100%)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {initials}
              </div>
              <div className="hide-mobile" style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--navy-900)' }}>
                  {studentName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" />
            </button>

            {showUserMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '115%',
                  right: 0,
                  width: 230,
                  background: '#ffffff',
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: 8,
                  zIndex: 60,
                }}
              >
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy-900)' }}>
                    {studentName}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    {studentEmail}
                  </div>
                </div>
                <div style={{ padding: '6px 0' }}>
                  <button
                    type="button"
                    className="sidebar-link"
                    style={{ width: '100%', color: 'var(--text)', padding: '8px 12px' }}
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/profile')
                    }}
                  >
                    <User size={15} color="var(--primary)" />
                    <span>My Profile</span>
                  </button>
                  <button
                    type="button"
                    className="sidebar-link"
                    style={{ width: '100%', color: 'var(--text)', padding: '8px 12px' }}
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/settings')
                    }}
                  >
                    <Settings size={15} color="var(--text-muted)" />
                    <span>Settings</span>
                  </button>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 6 }}>
                  <button
                    type="button"
                    className="sidebar-link"
                    style={{ width: '100%', color: 'var(--danger)', padding: '8px 12px' }}
                    onClick={() => {
                      setShowUserMenu(false)
                      logout()
                      navigate('/login')
                    }}
                  >
                    <LogOut size={15} color="var(--danger)" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal (Ctrl + K) */}
      {showSearchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            paddingTop: '10vh',
            zIndex: 100,
          }}
          onClick={() => setShowSearchModal(false)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 580,
              background: '#ffffff',
              borderRadius: 20,
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '16px 20px',
                borderBottom: '1px solid var(--border)',
                background: 'var(--surface)',
              }}
            >
              <Search size={20} color="var(--primary)" />
              <input
                autoFocus
                type="text"
                placeholder="Search courses, problems, topics, diagnostic tests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: 'var(--navy-900)',
                  width: '100%',
                  background: 'transparent',
                }}
              />
              <span className="kbd-shortcut">ESC</span>
            </div>

            <div style={{ maxHeight: 360, overflowY: 'auto', padding: '12px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', padding: '6px 10px' }}>
                Recommended & Fast Jump
              </div>
              {filteredSearch.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setShowSearchModal(false)
                    navigate(item.path)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: 12,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--primary-subtle)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: 'var(--surface-alt)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                      }}
                    >
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-900)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                        {item.category}
                      </div>
                    </div>
                  </div>
                  <span className="pill blue" style={{ fontSize: 11 }}>
                    Jump →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
