import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  ArrowLeft,
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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Pill } from '../../components/ui';

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginStudent, registerStudent, loginTeacher, isAuthenticated, isTeacher } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to={isTeacher ? '/teacher-dashboard' : '/dashboard'} replace />
  }

  // Views: 'select-role' | 'student-login' | 'student-register' | 'teacher-login'
  const [view, setView] = useState('select-role');

  // Form states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Student Login Form
  const [studentLoginForm, setStudentLoginForm] = useState({
    email: '',
    password: '',
  });

  // Teacher Login Form
  const [teacherLoginForm, setTeacherLoginForm] = useState({
    email: '',
    password: '',
  });

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
    skills: '',
  });

  // Handle Student Login
  async function handleStudentLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!studentLoginForm.email || !studentLoginForm.password) {
        throw new Error('Please fill in both email and password.');
      }
      await loginStudent(studentLoginForm);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Teacher Login
  async function handleTeacherLoginSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!teacherLoginForm.email || !teacherLoginForm.password) {
        throw new Error('Please enter your faculty email and password.');
      }
      await loginTeacher(teacherLoginForm);
      navigate('/teacher-dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid teacher credentials.');
    } finally {
      setLoading(false);
    }
  }

  // Handle Student Registration
  async function handleStudentRegisterSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validations
      if (!registerForm.fullName.trim()) throw new Error('Full name is required.');
      if (!registerForm.email.trim()) throw new Error('Email address is required.');
      if (!registerForm.password) throw new Error('Password is required.');
      if (registerForm.password.length < 6) throw new Error('Password must be at least 6 characters.');
      if (registerForm.password !== registerForm.confirmPassword) {
        throw new Error('Passwords do not match.');
      }
      if (!registerForm.mobile.trim()) throw new Error('Mobile number is required.');
      if (!registerForm.college.trim()) throw new Error('College / Institute name is required.');

      await registerStudent(registerForm);
      setSuccessMsg('Account created successfully! Redirecting to Student Dashboard...');
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 700);
    } catch (err) {
      setError(err.message || 'Registration failed. Please check the inputs.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(ellipse at top, #1e293b 0%, #0b1426 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 16px',
        color: '#f8fafc',
      }}
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '8px 18px',
            borderRadius: 30,
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>
            Re:Learn
          </span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>|</span>
          <span style={{ color: '#93c5fd', fontSize: 13, fontWeight: 600 }}>
            Coding Lab & Adaptive Learning
          </span>
        </div>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
          {view === 'select-role' && 'Welcome to Re:Learn Platform'}
          {view === 'student-login' && 'Student Login'}
          {view === 'student-register' && 'Student Registration'}
          {view === 'teacher-login' && 'Teacher Portal Login'}
        </h1>
        <p style={{ color: '#94a3b8', fontSize: 14.5, marginTop: 4, maxWidth: 540 }}>
          {view === 'select-role' && 'Select your role to access your personalized learning environment or faculty dashboard.'}
          {view === 'student-login' && 'Enter your student credentials to continue your coding journey and diagnosis.'}
          {view === 'student-register' && 'Create your student account to access Coding Lab, practice LeetCode challenges, and track mastery.'}
          {view === 'teacher-login' && 'Secure access for authorized educators to manage curriculum, questions, and view student progress.'}
        </p>
      </div>

      {/* VIEW 1: ROLE SELECTION SCREEN */}
      {view === 'select-role' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 22,
            width: '100%',
            maxWidth: 780,
          }}
        >
          {/* Option A: Student Portal */}
          <div
            className="card"
            style={{
              padding: '32px 28px',
              borderRadius: 20,
              background: '#0f172a',
              border: '1.5px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <GraduationCap size={32} />
              </div>

              <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, color: '#ffffff' }}>Student</h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#93c5fd',
                  }}
                >
                  Learning Portal
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
                Solve LeetCode-style algorithmic challenges in 12 languages, predict code outputs,
                run test cases, track your mastery, and receive personalized diagnosis.
              </p>

              <div className="stack" style={{ gap: 8, marginBottom: 26, fontSize: 13, color: '#cbd5e1' }}>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#60a5fa" />
                  <span>Interactive Coding Lab & Output Prediction</span>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#60a5fa" />
                  <span>Real-time code execution with test suites</span>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#60a5fa" />
                  <span>Cognitive misconception diagnosis & stability checks</span>
                </div>
              </div>
            </div>

            <div className="stack" style={{ gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-block btn-lg"
                onClick={() => {
                  setError('');
                  setView('student-login');
                }}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Student Login
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={() => {
                  setError('');
                  setView('student-register');
                }}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#f8fafc',
                  borderColor: 'rgba(255, 255, 255, 0.15)',
                }}
              >
                Register New Student
              </button>
            </div>
          </div>

          {/* Option B: Teacher Portal */}
          <div
            className="card"
            style={{
              padding: '32px 28px',
              borderRadius: 20,
              background: '#0f172a',
              border: '1.5px solid rgba(139, 92, 246, 0.3)',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(139, 92, 246, 0.15)',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}
              >
                <Briefcase size={30} />
              </div>

              <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                <h2 style={{ fontSize: 24, color: '#ffffff' }}>Teacher</h2>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'rgba(139, 92, 246, 0.2)',
                    color: '#c4b5fd',
                  }}
                >
                  Faculty Only
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, marginBottom: 22 }}>
                Full administrative access to manage Coding Lab questions, author test cases,
                publish challenges, inspect class submissions, and analyze misconception heatmaps.
              </p>

              <div className="stack" style={{ gap: 8, marginBottom: 26, fontSize: 13, color: '#cbd5e1' }}>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#a78bfa" />
                  <span>Author & edit Coding Lab problems & testcases</span>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#a78bfa" />
                  <span>Student roster monitoring & submission history</span>
                </div>
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#a78bfa" />
                  <span>Predefined faculty login • No public registration</span>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#94a3b8',
                  marginBottom: 14,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                🔒 Teacher accounts are provisioned by institution administration. Public registration is disabled.
              </div>

              <button
                type="button"
                className="btn btn-block btn-lg"
                onClick={() => {
                  setError('');
                  setView('teacher-login');
                }}
                style={{
                  borderRadius: 12,
                  fontWeight: 600,
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                Teacher Portal Login
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: STUDENT LOGIN */}
      {view === 'student-login' && (
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 440,
            padding: '32px 30px',
            borderRadius: 20,
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setView('select-role')}
            style={{ color: '#94a3b8', padding: '4px 8px', marginBottom: 16 }}
          >
            <ArrowLeft size={15} style={{ marginRight: 4 }} />
            Back to Role Selection
          </button>

          <form onSubmit={handleStudentLoginSubmit} className="stack gap">
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="field-label" style={{ color: '#cbd5e1', marginBottom: 6 }}>
                Student Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="email"
                  className="input"
                  required
                  placeholder="student@gmail.com"
                  value={studentLoginForm.email}
                  onChange={(e) =>
                    setStudentLoginForm({ ...studentLoginForm, email: e.target.value })
                  }
                  style={{
                    paddingLeft: 38,
                    background: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="field-label" style={{ color: '#cbd5e1', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  required
                  placeholder="Enter your password"
                  value={studentLoginForm.password}
                  onChange={(e) =>
                    setStudentLoginForm({ ...studentLoginForm, password: e.target.value })
                  }
                  style={{
                    paddingLeft: 38,
                    paddingRight: 38,
                    background: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: 12,
                color: '#93c5fd',
              }}
            >
              💡 Demo Student Account: <strong>student@gmail.com</strong> / <strong>student@1</strong>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: 6 }}
            >
              {loading ? 'Signing In...' : 'Sign In as Student'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 13, color: '#94a3b8' }}>
              Don't have a student account?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setView('student-register');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#60a5fa',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Register here
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: STUDENT REGISTRATION */}
      {view === 'student-register' && (
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 620,
            padding: '30px 32px',
            borderRadius: 20,
            background: '#0f172a',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
            maxHeight: '85vh',
            overflowY: 'auto',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setView('select-role')}
            style={{ color: '#94a3b8', padding: '4px 8px', marginBottom: 14 }}
          >
            <ArrowLeft size={15} style={{ marginRight: 4 }} />
            Back to Role Selection
          </button>

          <form onSubmit={handleStudentRegisterSubmit} className="stack gap">
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CheckCircle2 size={16} />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Section 1: Account Credentials */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 16 }}>
              <div className="strong" style={{ fontSize: 14, color: '#93c5fd', marginBottom: 12 }}>
                1. Account Credentials
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. John Doe"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    className="input"
                    required
                    placeholder="john.doe@university.edu"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Password (min. 6 chars) *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    required
                    placeholder="••••••••"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Confirm Password *
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="input"
                    required
                    placeholder="••••••••"
                    value={registerForm.confirmPassword}
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, confirmPassword: e.target.value })
                    }
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Academic Information */}
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: 16 }}>
              <div className="strong" style={{ fontSize: 14, color: '#93c5fd', marginBottom: 12 }}>
                2. Academic Information
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    className="input"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={registerForm.mobile}
                    onChange={(e) => setRegisterForm({ ...registerForm, mobile: e.target.value })}
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>

                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    College / Institute Name *
                  </label>
                  <input
                    type="text"
                    className="input"
                    required
                    placeholder="e.g. Stanford University"
                    value={registerForm.college}
                    onChange={(e) => setRegisterForm({ ...registerForm, college: e.target.value })}
                    style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Course / Degree *
                  </label>
                  <select
                    className="select"
                    value={registerForm.course}
                    onChange={(e) => setRegisterForm({ ...registerForm, course: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  >
                    <option value="B.Tech / B.E.">B.Tech / B.E.</option>
                    <option value="B.S. Computer Science">B.S. Computer Science</option>
                    <option value="M.Tech / M.S.">M.Tech / M.S.</option>
                    <option value="BCA">BCA</option>
                    <option value="MCA">MCA</option>
                    <option value="Diploma in Engineering">Diploma in Engineering</option>
                  </select>
                </div>

                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Branch / Major *
                  </label>
                  <select
                    className="select"
                    value={registerForm.branch}
                    onChange={(e) => setRegisterForm({ ...registerForm, branch: e.target.value })}
                    style={{
                      width: '100%',
                      background: '#1e293b',
                      borderColor: '#334155',
                      color: '#f8fafc',
                    }}
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Artificial Intelligence & ML">Artificial Intelligence & ML</option>
                    <option value="Electronics & Communication">Electronics & Communication</option>
                    <option value="Data Science & Engineering">Data Science & Engineering</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 10 }}>
                <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                  Current Year / Semester *
                </label>
                <select
                  className="select"
                  value={registerForm.yearSemester}
                  onChange={(e) => setRegisterForm({ ...registerForm, yearSemester: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                >
                  <option value="1st Year / 1st Semester">1st Year / 1st Semester</option>
                  <option value="1st Year / 2nd Semester">1st Year / 2nd Semester</option>
                  <option value="2nd Year / 3rd Semester">2nd Year / 3rd Semester</option>
                  <option value="2nd Year / 4th Semester">2nd Year / 4th Semester</option>
                  <option value="3rd Year / 5th Semester">3rd Year / 5th Semester</option>
                  <option value="3rd Year / 6th Semester">3rd Year / 6th Semester</option>
                  <option value="4th Year / 7th Semester">4th Year / 7th Semester</option>
                  <option value="4th Year / 8th Semester">4th Year / 8th Semester</option>
                </select>
              </div>
            </div>

            {/* Section 3: Skills & Interests */}
            <div>
              <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                Skills or Areas of Interest (Optional, comma-separated)
              </label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Python, C++, Dynamic Programming, Web Development"
                value={registerForm.skills}
                onChange={(e) => setRegisterForm({ ...registerForm, skills: e.target.value })}
                style={{ background: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
              style={{ marginTop: 10 }}
            >
              {loading ? 'Creating Student Account...' : 'Complete Registration & Enter Platform'}
            </button>

            <div style={{ textAlign: 'center', marginTop: 6, fontSize: 13, color: '#94a3b8' }}>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setView('student-login');
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#60a5fa',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                  textDecoration: 'underline',
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 4: TEACHER LOGIN (NO REGISTRATION) */}
      {view === 'teacher-login' && (
        <div
          className="card"
          style={{
            width: '100%',
            maxWidth: 440,
            padding: '32px 30px',
            borderRadius: 20,
            background: '#0f172a',
            border: '1.5px solid rgba(139, 92, 246, 0.4)',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
        >
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setView('select-role')}
            style={{ color: '#94a3b8', padding: '4px 8px', marginBottom: 16 }}
          >
            <ArrowLeft size={15} style={{ marginRight: 4 }} />
            Back to Role Selection
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(139, 92, 246, 0.12)',
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              color: '#c4b5fd',
              marginBottom: 16,
              border: '1px solid rgba(139, 92, 246, 0.25)',
            }}
          >
            <ShieldCheck size={16} />
            <span>Faculty Protected Portal • Elevated Permissions</span>
          </div>

          <form onSubmit={handleTeacherLoginSubmit} className="stack gap">
            {error && (
              <div
                style={{
                  background: '#fef2f2',
                  color: '#dc2626',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="field-label" style={{ color: '#cbd5e1', marginBottom: 6 }}>
                Faculty Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type="email"
                  className="input"
                  required
                  placeholder="teacher@gmail.com"
                  value={teacherLoginForm.email}
                  onChange={(e) =>
                    setTeacherLoginForm({ ...teacherLoginForm, email: e.target.value })
                  }
                  style={{
                    paddingLeft: 38,
                    background: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                />
              </div>
            </div>

            <div>
              <label className="field-label" style={{ color: '#cbd5e1', marginBottom: 6 }}>
                Teacher Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={16}
                  style={{
                    position: 'absolute',
                    left: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748b',
                  }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  required
                  placeholder="Enter teacher password"
                  value={teacherLoginForm.password}
                  onChange={(e) =>
                    setTeacherLoginForm({ ...teacherLoginForm, password: e.target.value })
                  }
                  style={{
                    paddingLeft: 38,
                    paddingRight: 38,
                    background: '#1e293b',
                    borderColor: '#334155',
                    color: '#f8fafc',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-lg btn-block"
              disabled={loading}
              style={{
                marginTop: 6,
                background: '#7c3aed',
                borderColor: '#7c3aed',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Teacher Dashboard'}
            </button>

            <p
              className="tiny muted"
              style={{ textAlign: 'center', margin: '8px 0 0', lineHeight: 1.4 }}
            >
              Notice: Teacher registration cannot be performed online. If you need faculty access,
              please contact your campus department administrator.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
