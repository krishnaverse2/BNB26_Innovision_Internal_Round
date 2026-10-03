import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Phone,
  School,
  BookOpen,
  Code2,
  ShieldCheck,
  AlertCircle,
  Brain,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import RealCodingUI from '../../components/auth/RealCodingUI'
import MagicalCoderCartoon from '../../components/auth/MagicalCoderCartoon'

export default function AuthPage() {
  const navigate = useNavigate()
  const { loginStudent, registerStudent, loginTeacher, isAuthenticated, isTeacher, user } = useAuth()

  // Active Role: 'student' | 'teacher'
  const [role, setRole] = useState('student')
  // Active Student Mode: 'login' | 'register'
  const [studentMode, setStudentMode] = useState('login')

  // Magical Cartoon Mascot reaction state
  const [mascotState, setMascotState] = useState('idle')

  // Form states
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Student Login Form
  const [studentLoginForm, setStudentLoginForm] = useState({
    email: 'student@gmail.com',
    password: 'student@1',
  })

  // Teacher Login Form
  const [teacherLoginForm, setTeacherLoginForm] = useState({
    email: 'teacher@gmail.com',
    password: 'teacher@1',
  })

  // Student Register Form
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    college: '',
    course: 'B.Tech / B.E.',
    branch: 'Computer Science & Engineering',
    yearSemester: '3rd Year / 5th Semester',
    skills: 'DSA, Python, React',
  })

  // Handle Student Login
  async function handleStudentLoginSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!studentLoginForm.email || !studentLoginForm.password) {
        throw new Error('Please fill in both email and password.')
      }
      await loginStudent(studentLoginForm)
      setSuccessMsg("Welcome back to RE:LEARN! Loading your student dashboard...")
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 600)
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Teacher Login
  async function handleTeacherLoginSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!teacherLoginForm.email || !teacherLoginForm.password) {
        throw new Error('Please enter your faculty email and password.')
      }
      await loginTeacher(teacherLoginForm)
      setSuccessMsg('Welcome Professor! Accessing Faculty Telemetry Portal...')
      setTimeout(() => {
        navigate('/teacher-dashboard', { replace: true })
      }, 600)
    } catch (err) {
      setError(err.message || 'Invalid teacher credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Handle Student Registration
  async function handleStudentRegisterSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!registerForm.fullName.trim()) throw new Error('Full name is required.')
      if (!registerForm.email.trim()) throw new Error('Email address is required.')
      if (!registerForm.password) throw new Error('Password is required.')
      if (registerForm.password.length < 6)
        throw new Error('Password must be at least 6 characters.')
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Passwords do not match.')
      }
      if (!registerForm.mobile.trim()) throw new Error('Mobile number is required.')
      if (!registerForm.college.trim()) throw new Error('College / Institute name is required.')

      await registerStudent(registerForm)
      setSuccessMsg('Account created successfully! Loading your dashboard...')
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 600)
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the inputs.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        maxWidth: '100%',
        overflow: 'hidden',
        display: 'flex',
        background: '#f8fafc',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Background subtle geometric code decoration */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(#e2e8f0 1px, transparent 1px), radial-gradient(#eff6ff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
          backgroundPosition: '0 0, 14px 14px',
          opacity: 0.55,
          zIndex: 0,
        }}
      />

      {/* LEFT COLUMN: Real Developer IDE & Terminal Workspace (Desktop) */}
      <div
        className="hide-mobile"
        style={{
          flex: '1 1 52%',
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #070c18 0%, #0f172a 45%, #1e293b 100%)',
          color: '#ffffff',
          padding: 'clamp(18px, 2.8vh, 30px) clamp(22px, 3vw, 40px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid rgba(255,255,255,0.08)',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        {/* Glow backdrop */}
        <div
          style={{
            position: 'absolute',
            top: '-15%',
            left: '-15%',
            width: '460px',
            height: '460px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, transparent 70%)',
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Top Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
              }}
            >
              RE
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                RE:LEARN
              </div>
              <div style={{ fontSize: 12, color: '#93c5fd', fontWeight: 500, letterSpacing: '0.04em' }}>
                Learn. Practice. Grow.
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'clamp(8px, 1.6vh, 16px)' }}>
            <span
              className="pill blue"
              style={{
                background: 'rgba(37,99,235,0.22)',
                color: '#93c5fd',
                border: '1px solid rgba(147,197,253,0.3)',
                fontSize: 11.5,
                padding: '3px 8px',
              }}
            >
              <Sparkles size={12} />
              AI Cognitive Diagnostics & Coding Environment
            </span>

            <h1
              style={{
                fontSize: 'clamp(20px, 2.2vw, 26px)',
                fontWeight: 800,
                lineHeight: 1.25,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                marginTop: 8,
                marginBottom: 4,
              }}
            >
              Understand Concepts, <br />
              <span style={{ color: '#60a5fa' }}>Not Just Answers.</span>
            </h1>

            <p style={{ fontSize: 12.5, color: '#94a3b8', lineHeight: 1.45, maxWidth: 500 }}>
              Live interactive developer platform with Bayesian Knowledge Tracing, real-time AST
              boundary telemetry, and automated test execution.
            </p>
          </div>
        </div>

        {/* Center: Animated Magical Cartoon & Real Developer IDE Workspace */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            padding: '2px 0',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 4,
            minHeight: 0,
          }}
        >
          <MagicalCoderCartoon state={mascotState} />
          <RealCodingUI />
        </div>

        {/* Bottom Feature Badges */}
        <div
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 10,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 12,
            padding: '8px 14px',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>⚡ BKT Prior Engine</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>Calibrated BF₁₀ = 18.4</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>💻 Multi-Language AST</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>Python, C++, Java, JS, Go</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>🎯 Stability Proof</div>
            <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 1 }}>Near & far transfer checks</div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Medium-Sized, Balanced Authentication Card */}
      <div
        style={{
          flex: '1 1 48%',
          height: '100vh',
          maxHeight: '100vh',
          overflowY: role === 'student' && studentMode === 'register' ? 'auto' : 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'clamp(14px, 2.5vh, 28px) clamp(20px, 3vw, 40px)',
          boxSizing: 'border-box',
          width: '100%',
          zIndex: 1,
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Mobile Brand Banner */}
          <div
            className="show-mobile-only"
            style={{ textAlign: 'center', marginBottom: 16, display: 'none' }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                RE
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)' }}>
                RE:LEARN
              </div>
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Learn. Practice. Grow.</div>

            {/* Mobile Animated Magic Cartoon */}
            <div style={{ marginTop: 2 }}>
              <MagicalCoderCartoon state={mascotState} />
            </div>
          </div>

          {/* Role Switcher (Student vs Faculty) */}
          <div
            style={{
              display: 'flex',
              background: '#ffffff',
              borderRadius: 12,
              padding: 4,
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)',
              marginBottom: 'clamp(12px, 1.8vh, 18px)',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setRole('student')
                setError('')
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: role === 'student' ? 700 : 500,
                background: role === 'student' ? 'var(--navy-900)' : 'transparent',
                color: role === 'student' ? '#ffffff' : 'var(--text-soft)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('teacher')
                setError('')
              }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 9,
                fontSize: 13,
                fontWeight: role === 'teacher' ? 700 : 500,
                background: role === 'teacher' ? 'var(--navy-900)' : 'transparent',
                color: role === 'teacher' ? '#ffffff' : 'var(--text-soft)',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              <Briefcase size={16} />
              <span>Faculty Portal</span>
            </button>
          </div>

          {/* Form Card (Medium, Comfortable Size) */}
          <div
            className="card"
            style={{
              padding: 'clamp(20px, 2.8vh, 28px) clamp(22px, 2.6vw, 30px)',
              borderRadius: 20,
              boxShadow: '0 8px 30px rgba(15,23,42,0.07)',
              border: '1px solid var(--border)',
              background: '#ffffff',
            }}
          >
            {/* Card Header */}
            <div style={{ marginBottom: 'clamp(12px, 1.8vh, 18px)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2
                  style={{
                    fontSize: 'clamp(19px, 2.2vw, 23px)',
                    fontWeight: 800,
                    color: 'var(--navy-900)',
                    letterSpacing: '-0.025em',
                  }}
                >
                  {role === 'student'
                    ? studentMode === 'login'
                      ? 'Welcome Back'
                      : 'Create Student Account'
                    : 'Faculty Portal Sign In'}
                </h2>
                {role === 'student' && (
                  <span className="pill blue" style={{ fontSize: 11, padding: '3px 8px' }}>
                    {studentMode === 'login' ? 'Login' : 'Register'}
                  </span>
                )}
                {role === 'teacher' && (
                  <span className="pill navy" style={{ fontSize: 11, padding: '3px 8px' }}>
                    Faculty
                  </span>
                )}
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                {role === 'student'
                  ? studentMode === 'login'
                    ? 'Continue your learning journey and solve coding problems.'
                    : 'Fill in your academic profile to unlock personalized adaptive learning.'
                  : 'Enter faculty credentials to manage student telemetry & assignments.'}
              </p>
            </div>

            {/* Active Session Indicator (if already signed in) */}
            {isAuthenticated && user && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 11px',
                  borderRadius: 10,
                  background: 'rgba(37, 99, 235, 0.08)',
                  border: '1px solid rgba(37, 99, 235, 0.22)',
                  color: 'var(--navy-900)',
                  fontSize: 12,
                  marginBottom: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <CheckCircle2 size={14} color="var(--primary)" style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Signed in: <strong>{user?.name || user?.email}</strong> ({isTeacher ? 'Faculty' : 'Student'})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(isTeacher ? '/teacher-dashboard' : '/dashboard', { replace: true })}
                  style={{
                    background: 'var(--primary)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 6,
                    padding: '3px 8px',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    flexShrink: 0,
                    marginLeft: 6,
                  }}
                >
                  Dashboard <ArrowRight size={11} />
                </button>
              </div>
            )}

            {/* Error & Success Messages */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: 12.5,
                  marginBottom: 14,
                  wordBreak: 'break-word',
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '9px 12px',
                  borderRadius: 10,
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  color: '#16a34a',
                  fontSize: 12.5,
                  marginBottom: 14,
                  wordBreak: 'break-word',
                }}
              >
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* 1. STUDENT LOGIN FORM */}
            {role === 'student' && studentMode === 'login' && (
              <form onSubmit={handleStudentLoginSubmit} className="stack gap-sm">
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-soft)',
                      marginBottom: 5,
                      display: 'block',
                    }}
                  >
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="student@gmail.com"
                      value={studentLoginForm.email}
                      onFocus={() => setMascotState('focus-email')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) =>
                        setStudentLoginForm({ ...studentLoginForm, email: e.target.value })
                      }
                      className="input"
                      style={{ paddingLeft: 40, padding: '10px 14px 10px 40px', fontSize: 13.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 5,
                    }}
                  >
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>
                      Password
                    </label>
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault()
                        alert('Default demo student credentials: student@gmail.com / student@1')
                      }}
                      style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={studentLoginForm.password}
                      onFocus={() => setMascotState('focus-password')}
                      onBlur={() => setMascotState('idle')}
                      onChange={(e) => {
                        setStudentLoginForm({ ...studentLoginForm, password: e.target.value })
                        if (mascotState !== 'typing-password') {
                          setMascotState('typing-password')
                        }
                      }}
                      className="input"
                      style={{ paddingLeft: 40, paddingRight: 40, padding: '10px 40px 10px 40px', fontSize: 13.5 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 2,
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      fontSize: 12.5,
                      color: 'var(--text-soft)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ accentColor: 'var(--primary)', borderRadius: 4 }}
                    />
                    Remember me
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  onMouseEnter={() => setMascotState('hover-submit')}
                  onMouseLeave={() => setMascotState('idle')}
                  className="btn btn-primary btn-block"
                  style={{
                    marginTop: 4,
                    padding: '11px 18px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Demo Quick Fill Button */}
                <div
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    border: '1px solid var(--border)',
                    marginTop: 2,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    Demo Student: <strong>student@gmail.com</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStudentLoginForm({ email: 'student@gmail.com', password: 'student@1' })
                    }}
                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Auto-Fill
                  </button>
                </div>

                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 6,
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                  }}
                >
                  Don’t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('register')
                      setError('')
                    }}
                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Register here
                  </button>
                </div>
              </form>
            )}

            {/* 2. STUDENT REGISTER FORM */}
            {role === 'student' && studentMode === 'register' && (
              <form
                onSubmit={handleStudentRegisterSubmit}
                className="stack gap-xs"
                style={{ maxHeight: 'calc(100vh - 180px)', overflowY: 'auto', paddingRight: 4 }}
              >
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-soft)',
                      marginBottom: 2,
                      display: 'block',
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    className="input"
                    style={{ padding: '7px 11px', fontSize: 12.5 }}
                  />
                </div>

                <div className="grid cols-2" style={{ gap: 8 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="alex@college.edu"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 9876543210"
                      value={registerForm.mobile}
                      onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div className="grid cols-2" style={{ gap: 8 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Confirm *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Repeat password"
                      value={registerForm.confirmPassword}
                      onChange={(e) =>
                        setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                      }
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-soft)',
                      marginBottom: 2,
                      display: 'block',
                    }}
                  >
                    College / Institute *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Institute of Engineering & Technology"
                    value={registerForm.college}
                    onChange={(e) => setRegisterForm({ ...registerForm, college: e.target.value })}
                    className="input"
                    style={{ padding: '7px 11px', fontSize: 12.5 }}
                  />
                </div>

                <div className="grid cols-2" style={{ gap: 8 }}>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Degree
                    </label>
                    <input
                      type="text"
                      value={registerForm.course}
                      onChange={(e) => setRegisterForm({ ...registerForm, course: e.target.value })}
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-soft)',
                        marginBottom: 2,
                        display: 'block',
                      }}
                    >
                      Branch
                    </label>
                    <input
                      type="text"
                      value={registerForm.branch}
                      onChange={(e) => setRegisterForm({ ...registerForm, branch: e.target.value })}
                      className="input"
                      style={{ padding: '7px 11px', fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-soft)',
                      marginBottom: 2,
                      display: 'block',
                    }}
                  >
                    Year / Semester
                  </label>
                  <input
                    type="text"
                    value={registerForm.yearSemester}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, yearSemester: e.target.value })
                    }
                    className="input"
                    style={{ padding: '7px 11px', fontSize: 12.5 }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 6, padding: '9px 16px', fontSize: 13.5 }}
                >
                  {loading ? 'Creating Account...' : 'Complete Registration'}
                  {!loading && <ArrowRight size={15} />}
                </button>

                <div
                  style={{
                    textAlign: 'center',
                    marginTop: 4,
                    fontSize: 12,
                    color: 'var(--text-muted)',
                  }}
                >
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setStudentMode('login')
                      setError('')
                    }}
                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* 3. TEACHER LOGIN FORM */}
            {role === 'teacher' && (
              <form onSubmit={handleTeacherLoginSubmit} className="stack gap-sm">
                <div>
                  <label
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--text-soft)',
                      marginBottom: 5,
                      display: 'block',
                    }}
                  >
                    Faculty Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="teacher@gmail.com"
                      value={teacherLoginForm.email}
                      onChange={(e) =>
                        setTeacherLoginForm({ ...teacherLoginForm, email: e.target.value })
                      }
                      className="input"
                      style={{ paddingLeft: 40, padding: '10px 14px 10px 40px', fontSize: 13.5 }}
                    />
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 5,
                    }}
                  >
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-soft)' }}>
                      Faculty Password
                    </label>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <Lock
                      size={16}
                      color="var(--text-muted)"
                      style={{
                        position: 'absolute',
                        left: 14,
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={teacherLoginForm.password}
                      onChange={(e) =>
                        setTeacherLoginForm({ ...teacherLoginForm, password: e.target.value })
                      }
                      className="input"
                      style={{ paddingLeft: 40, paddingRight: 40, padding: '10px 40px 10px 40px', fontSize: 13.5 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    borderRadius: 9,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <ShieldCheck
                    size={14}
                    color="var(--primary)"
                    style={{ display: 'inline', marginRight: 6 }}
                  />
                  Faculty accounts are provisioned by institution administrators.
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-block"
                  style={{
                    marginTop: 4,
                    padding: '11px 18px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
                  {!loading && <ArrowRight size={16} />}
                </button>

                {/* Demo Quick Fill Button */}
                <div
                  style={{
                    background: 'var(--surface-alt)',
                    borderRadius: 10,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    border: '1px solid var(--border)',
                    marginTop: 2,
                  }}
                >
                  <span style={{ color: 'var(--text-muted)' }}>
                    Demo Faculty: <strong>teacher@gmail.com</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setTeacherLoginForm({ email: 'teacher@gmail.com', password: 'teacher@1' })
                    }}
                    style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Auto-Fill
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
