import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Brain,
  Flame,
  Clock,
  CheckCircle2,
  Code2,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Zap,
  Play,
  Terminal,
  BookOpen,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { Card, CardHeader, Pill } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getMisconception, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'
import { useAuth } from '../context/AuthContext'
import { FLOW_STEPS } from '../components/Sidebar'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

const WEEKLY_ANALYTICS_DATA = [
  { name: 'Mon', theory: 2.2, practice: 3.5, coding: 4.1 },
  { name: 'Tue', theory: 1.8, practice: 4.0, coding: 3.8 },
  { name: 'Wed', theory: 3.0, practice: 2.5, coding: 5.2 },
  { name: 'Thu', theory: 1.5, practice: 3.8, coding: 4.6 },
  { name: 'Fri', theory: 2.8, practice: 4.2, coding: 5.0 },
  { name: 'Sat', theory: 3.5, practice: 5.1, coding: 6.2 },
  { name: 'Sun', theory: 2.0, practice: 3.2, coding: 4.4 },
]

const MONTHLY_ANALYTICS_DATA = [
  { name: 'Week 1', theory: 9.5, practice: 18.2, coding: 22.0 },
  { name: 'Week 2', theory: 12.0, practice: 21.5, coding: 28.4 },
  { name: 'Week 3', theory: 8.5, practice: 19.0, coding: 24.8 },
  { name: 'Week 4', theory: 11.2, practice: 24.1, coding: 31.0 },
]

const CONTINUE_COURSES = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    category: 'DSA',
    duration: '18h 40m',
    lessonsCompleted: '24/86',
    progress: 78,
    icon: Code2,
  },
  {
    id: 'python',
    title: 'Python for Systems & Algorithms',
    category: 'Programming',
    duration: '14h 15m',
    lessonsCompleted: '26/58',
    progress: 92,
    icon: Terminal,
  },
  {
    id: 'web-dev',
    title: 'Full-Stack Web Engineering',
    category: 'Web Dev',
    duration: '26h 00m',
    lessonsCompleted: '19/74',
    progress: 40,
    icon: BookOpen,
  },
]

const QUICK_PRACTICE_ITEMS = [
  {
    id: 'daily',
    title: 'Daily Challenge',
    desc: "Solve today's coding problem & maintain your streak.",
    cta: 'Solve Now →',
    path: '/coding-lab?problem=two-sum',
    icon: Zap,
    badge: 'Streak +1',
  },
  {
    id: 'dsa',
    title: 'DSA Practice',
    desc: 'Master two-pointers, arrays, and sliding window patterns.',
    cta: 'Practice →',
    path: '/coding-lab?tab=dsa',
    icon: Code2,
    badge: '180 Problems',
  },
  {
    id: 'playground',
    title: 'Code Playground',
    desc: 'Multi-language compiler: Python, C++, Java, JS, Go & more.',
    cta: 'Open Lab →',
    path: '/coding-lab',
    icon: Terminal,
    badge: 'Interactive',
  },
  {
    id: 'diagnostic',
    title: 'Topic Revision',
    desc: 'Target loop boundary invariants with AI Cognitive Analysis.',
    cta: 'Start Diagnosis →',
    path: '/diagnosis',
    icon: Brain,
    badge: 'AI Powered',
  },
]

const GROWTH_SKILLS = [
  { name: 'DSA & Algorithms', progress: 72, color: '#2563eb' },
  { name: 'Web Development', progress: 84, color: '#60a5fa' },
  { name: 'Core Programming', progress: 91, color: '#0f172a' },
  { name: 'Problem Solving & Logic', progress: 68, color: '#2563eb' },
]

const RECENT_ACTIVITIES = [
  {
    id: 1,
    title: 'Completed Arrays & Strings',
    time: '2 hours ago',
    type: 'success',
    detail: 'Passed all 14/14 automated test assertions',
  },
  {
    id: 2,
    title: 'Solved 5 DSA Problems',
    time: 'Yesterday',
    type: 'success',
    detail: 'Topics: Two Pointers, Hash Table lookups',
  },
  {
    id: 3,
    title: 'Completed JavaScript Functions',
    time: 'Yesterday',
    type: 'success',
    detail: 'Scored 100% on scope & closure checks',
  },
  {
    id: 4,
    title: 'Earned Problem Solver Badge',
    time: '2 days ago',
    type: 'award',
    detail: 'Passed 100 total programming challenges milestone',
  },
]

const ACHIEVEMENTS_DATA = [
  {
    id: 'prob-solver',
    name: 'Problem Solver',
    desc: '100 Problems Solved',
    unlocked: true,
    icon: Trophy,
    stat: '100/100',
  },
  {
    id: 'dsa-beg',
    name: 'DSA Beginner',
    desc: 'Completed DSA Basics',
    unlocked: true,
    icon: Code2,
    stat: 'Mastered',
  },
  {
    id: 'streak-7',
    name: '7 Day Streak',
    desc: '7 Consecutive Days',
    unlocked: true,
    icon: Flame,
    stat: '18 Days Active',
  },
  {
    id: 'fast-learner',
    name: 'Fast Learner',
    desc: 'Complete 10 Courses',
    unlocked: false,
    icon: Award,
    stat: '8/10 Done',
  },
]

const JOURNEY = [
  { label: 'Dashboard', done: true },
  { label: 'Coding Lab', stateKey: 'submitted' },
  { label: 'Diagnosis', stateKey: 'diagnosis' },
  { label: 'Hypothesis Test', stateKey: 'diagnosticResult' },
  { label: 'Intervention', stateKey: 'interventionCompleted' },
  { label: 'Stability Check', stateKey: 'stressTestProgress' },
  { label: 'Resolution', stateKey: 'resolutionStatus' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { student, summary, fingerprint, state, isResolved } = useDemo()
  const { user, profile } = useAuth()

  const [analyticsTimeframe, setAnalyticsTimeframe] = useState('weekly')

  const studentName = profile?.fullName || user?.name || student?.fullName || 'Student'
  const primaryMisconception = getMisconception(PRIMARY_MISCONCEPTION_ID)
  const confidence = state.diagnosisConfidence ?? 87

  const chartData = useMemo(() => {
    return analyticsTimeframe === 'weekly' ? WEEKLY_ANALYTICS_DATA : MONTHLY_ANALYTICS_DATA
  }, [analyticsTimeframe])

  const journeyDone = JOURNEY.filter((step) =>
    step.stateKey ? Boolean(state[step.stateKey]) : step.done,
  ).length

  return (
    <div className="stack gap-lg">
      {/* 1. Page Header (Section 7) */}
      <div className="row between center wrap" style={{ gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.03em' }}>
            {getGreeting()}, {studentName} 👋
          </h1>
          <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
            Continue your learning journey and keep growing.
          </p>
        </div>

        <div className="row center" style={{ gap: 12 }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/coding-lab')}
          >
            <Play size={16} />
            <span>Resume Practice</span>
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/courses')}
          >
            <BookOpen size={16} color="var(--primary)" />
            <span>Browse Courses</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Statistics (Section 7) */}
      <div className="grid cols-4">
        {/* Card 1: Learning Hours */}
        <div className="stat-card-clean">
          <div className="stat-header">
            <span className="stat-label">Learning Hours</span>
            <div className="stat-icon blue">
              <Clock size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">126h</div>
            <div style={{ marginTop: 8 }}>
              <span className="stat-trend up">
                <TrendingUp size={13} />
                +18% this month
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Problems Solved */}
        <div className="stat-card-clean">
          <div className="stat-header">
            <span className="stat-label">Problems Solved</span>
            <div className="stat-icon navy">
              <Code2 size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">247</div>
            <div style={{ marginTop: 8 }}>
              <span className="stat-trend up">
                <TrendingUp size={13} />
                +12 this week
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Courses Completed */}
        <div className="stat-card-clean">
          <div className="stat-header">
            <span className="stat-label">Courses Completed</span>
            <div className="stat-icon green">
              <BookOpen size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">8</div>
            <div style={{ marginTop: 8 }}>
              <span className="stat-trend neutral">
                2 in progress
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Current Streak */}
        <div className="stat-card-clean">
          <div className="stat-header">
            <span className="stat-label">Current Streak</span>
            <div className="stat-icon amber">
              <Flame size={20} />
            </div>
          </div>
          <div>
            <div className="stat-value">18 Days</div>
            <div style={{ marginTop: 8 }}>
              <span className="stat-trend up">
                <Zap size={13} />
                Personal best: 24d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Learning Analytics & Cognitive Diagnostic Row (Section 8) */}
      <div className="grid sidebar-split">
        {/* Large Learning Overview Card with Interactive Chart */}
        <div className="card">
          <div className="card-header" style={{ marginBottom: 16 }}>
            <div className="card-title-group">
              <div className="card-icon-badge">
                <TrendingUp size={20} />
              </div>
              <div>
                <h3 className="card-title">Learning Overview</h3>
                <div className="card-subtitle">
                  Weekly distribution of theory, practice, and coding lab hours
                </div>
              </div>
            </div>

            {/* Timeframe Filter Switcher */}
            <div
              style={{
                display: 'flex',
                background: 'var(--surface-alt)',
                padding: 4,
                borderRadius: 10,
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                onClick={() => setAnalyticsTimeframe('weekly')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: analyticsTimeframe === 'weekly' ? 700 : 500,
                  background: analyticsTimeframe === 'weekly' ? '#ffffff' : 'transparent',
                  color: analyticsTimeframe === 'weekly' ? 'var(--navy-900)' : 'var(--text-muted)',
                  boxShadow: analyticsTimeframe === 'weekly' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Weekly
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsTimeframe('monthly')}
                style={{
                  padding: '5px 12px',
                  borderRadius: 7,
                  fontSize: 12.5,
                  fontWeight: analyticsTimeframe === 'monthly' ? 700 : 500,
                  background: analyticsTimeframe === 'monthly' ? '#ffffff' : 'transparent',
                  color: analyticsTimeframe === 'monthly' ? 'var(--navy-900)' : 'var(--text-muted)',
                  boxShadow: analyticsTimeframe === 'monthly' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Quick Category Summary Badges */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              marginBottom: 16,
              padding: '12px 16px',
              borderRadius: 12,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Theory Hours
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
                {analyticsTimeframe === 'weekly' ? '16.8h' : '41.2h'}
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Practice Hours
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#60a5fa' }}>
                {analyticsTimeframe === 'weekly' ? '25.5h' : '82.8h'}
              </div>
            </div>
            <div style={{ width: 1, background: 'var(--border)' }} />
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                Coding Hours
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#2563eb' }}>
                {analyticsTimeframe === 'weekly' ? '33.3h' : '106.2h'}
              </div>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  unit="h"
                />
                <Tooltip
                  cursor={{ fill: 'rgba(37,99,235,0.04)' }}
                  contentStyle={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 8px 24px rgba(15,23,42,0.1)',
                    fontSize: 13,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Bar
                  dataKey="theory"
                  name="Theory"
                  fill="#0f172a"
                  radius={[5, 5, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="practice"
                  name="Practice"
                  fill="#60a5fa"
                  radius={[5, 5, 0, 0]}
                  barSize={12}
                />
                <Bar
                  dataKey="coding"
                  name="Coding"
                  fill="#2563eb"
                  radius={[5, 5, 0, 0]}
                  barSize={12}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cognitive AI Diagnosis Card */}
        <div className="card dark" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(37,99,235,0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#60a5fa',
                  }}
                >
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                    AI Cognitive Focus
                  </div>
                  <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                    Bayesian Knowledge Tracing
                  </div>
                </div>
              </div>
              <span className="pill blue" style={{ fontSize: 11 }}>
                {confidence}% Confidence
              </span>
            </div>

            {isResolved ? (
              <div className="stack gap-sm">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} color="#22c55e" />
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>
                    {primaryMisconception.name} Resolved
                  </span>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  Stability checks verified that loop boundary off-by-one errors are now eliminated.
                  Mastery probability reached 0.94.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 14 }}
                  onClick={() => navigate('/resolution')}
                >
                  View Stability Report
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="stack gap-sm">
                <div style={{ fontSize: 17, fontWeight: 700, color: '#ffffff' }}>
                  {primaryMisconception.name}
                </div>
                <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
                  The engine detected a tendency to treat the ending value of loops as inclusive
                  across Python & JS challenges.
                </p>
                <div
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    borderRadius: 12,
                    padding: '10px 14px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    marginTop: 4,
                  }}
                >
                  <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                    Bayes Factor Evidence
                  </div>
                  <div style={{ fontSize: 13, color: '#93c5fd', fontWeight: 600, marginTop: 2 }}>
                    BF₁₀ = 18.4 (Strong cognitive signature)
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  style={{ marginTop: 14 }}
                  onClick={() => navigate('/diagnosis')}
                >
                  Start Cognitive Diagnosis
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 14, marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Next Suggested Topic
              </span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>
                Zero-Index Invariant →
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Continue Learning (Section 9) */}
      <div>
        <div className="row between center" style={{ marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-900)' }}>
              Continue Learning
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Pick up where you left off in your enrolled courses
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/courses')}
            style={{ color: 'var(--primary)', fontWeight: 600 }}
          >
            All Courses <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid cols-3">
          {CONTINUE_COURSES.map((course) => {
            const Icon = course.icon
            return (
              <div key={course.id} className="course-card">
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 10,
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={19} />
                    </div>
                    <span className="pill blue" style={{ fontSize: 11 }}>
                      {course.category}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 4 }}>
                    {course.title}
                  </h3>

                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
                    <span>{course.duration}</span> • <span>{course.lessonsCompleted} lessons</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600 }}>
                    <span style={{ color: 'var(--text-muted)' }}>Progress</span>
                    <span style={{ color: 'var(--primary)' }}>{course.progress}% Complete</span>
                  </div>

                  <div className="course-progress-bar">
                    <div
                      className="course-progress-fill"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary btn-block btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    <span>Continue Learning</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Quick Practice Section (Section 10) */}
      <div>
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-900)' }}>
            Quick Practice
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            High-yield coding challenges and cognitive assessments
          </p>
        </div>

        <div className="grid cols-4">
          {QUICK_PRACTICE_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.id}
                className="card"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(item.path)}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: 'var(--primary-subtle)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={18} />
                    </div>
                    <span className="pill neutral" style={{ fontSize: 11 }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 6 }}>
                    {item.title}
                  </h3>

                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.45 }}>
                    {item.desc}
                  </p>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 12,
                    borderTop: '1px solid var(--border)',
                    fontSize: 13,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {item.cta}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 6. Growth Progress & Recent Activity (Sections 11 & 12) */}
      <div className="grid cols-2" id="growth">
        {/* Your Growth (Section 11) */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <Target size={19} />
              </div>
              <div>
                <h3 className="card-title">Your Growth</h3>
                <div className="card-subtitle">
                  Domain mastery updated in real-time across exercises
                </div>
              </div>
            </div>
          </div>

          <div className="stack gap-md">
            {GROWTH_SKILLS.map((skill) => (
              <div key={skill.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: 'var(--navy-900)' }}>{skill.name}</span>
                  <span style={{ color: 'var(--primary)' }}>{skill.progress}%</span>
                </div>
                <div style={{ height: 8, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${skill.progress}%`,
                      background: skill.color,
                      borderRadius: 9999,
                      transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: 20,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span style={{ fontSize: 12.5, color: 'var(--text-soft)' }}>
              Overall Cognitive Understanding: <strong>{summary?.overallUnderstanding || 84}%</strong>
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/misconceptions')}
              style={{ color: 'var(--primary)', fontWeight: 600 }}
            >
              Mastery Details →
            </button>
          </div>
        </div>

        {/* Recent Activity (Section 12) */}
        <div className="card">
          <div className="card-header">
            <div className="card-title-group">
              <div className="card-icon-badge">
                <Clock size={19} />
              </div>
              <div>
                <h3 className="card-title">Recent Activity</h3>
                <div className="card-subtitle">
                  Timeline of your latest submissions and milestones
                </div>
              </div>
            </div>
          </div>

          <div className="stack gap-md">
            {RECENT_ACTIVITIES.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: act.type === 'award' ? '#eff6ff' : '#f0fdf4',
                    color: act.type === 'award' ? '#2563eb' : '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                >
                  {act.type === 'award' ? <Trophy size={16} /> : <CheckCircle2 size={16} />}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--navy-900)' }}>
                      {act.title}
                    </div>
                    <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                      {act.time}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    {act.detail}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="btn btn-secondary btn-block btn-sm"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/timeline')}
          >
            View Full Learning History
          </button>
        </div>
      </div>

      {/* 7. Achievements Section (Section 13) */}
      <div id="achievements">
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy-900)' }}>
            Achievements
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Milestones earned through dedicated practice and concept mastery
          </p>
        </div>

        <div className="grid cols-4">
          {ACHIEVEMENTS_DATA.map((ach) => {
            const Icon = ach.icon
            return (
              <div
                key={ach.id}
                className="card"
                style={{
                  padding: 20,
                  opacity: ach.unlocked ? 1 : 0.72,
                  background: ach.unlocked ? '#ffffff' : 'var(--surface-alt)',
                  border: ach.unlocked ? '1px solid var(--border)' : '1px dashed var(--border-strong)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: ach.unlocked ? 'var(--primary-subtle)' : 'var(--surface)',
                      color: ach.unlocked ? 'var(--primary)' : 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>
                      {ach.name}
                    </div>
                    <span
                      className={`pill ${ach.unlocked ? 'blue' : 'neutral'}`}
                      style={{ fontSize: 10.5, padding: '2px 7px' }}
                    >
                      {ach.stat}
                    </span>
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                  {ach.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* 8. Diagnosis Cycle Stepper (Preserving existing prototype accessibility) */}
      <div className="card flat" style={{ background: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)' }}>
              AI Cognitive Diagnosis Pipeline
            </h3>
            <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
              Full Bayesian Knowledge Tracing & IRT 2PL lifecycle
            </p>
          </div>
          <span className="pill blue">
            {journeyDone} / {JOURNEY.length} Completed
          </span>
        </div>

        <div className="row wrap" style={{ gap: 8 }}>
          {JOURNEY.map((step) => {
            const done = step.stateKey ? Boolean(state[step.stateKey]) : step.done
            return (
              <span
                key={step.label}
                className={`stage ${done ? 'done' : ''}`}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  background: done ? 'var(--primary-subtle)' : 'var(--surface-alt)',
                  color: done ? 'var(--primary)' : 'var(--text-muted)',
                  border: done ? '1px solid var(--primary-border)' : '1px solid var(--border)',
                }}
              >
                <span style={{ marginRight: 6 }}>{done ? '✓' : '•'}</span>
                {step.label}
              </span>
            )
          })}
        </div>

        <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
          {FLOW_STEPS.map((step) => (
            <button
              key={step.to}
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate(step.to)}
            >
              {step.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
