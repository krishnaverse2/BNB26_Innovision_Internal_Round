import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  Lock,
  Unlock,
  PlayCircle,
  Award,
  ArrowRight,
  Clock,
  Code2,
  ChevronRight,
  TrendingUp,
  Brain,
  CheckCircle,
  FileQuestion,
  BarChart3,
  Sparkles,
  Layers,
} from 'lucide-react'
import { Card, CardHeader, Pill } from '../components/ui'
import { getCourseDetail } from '../services/courseApi'

export default function CourseDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getCourseDetail(courseId || 'dsa')
        setCourse(data)
      } catch (err) {
        setError(err.message || 'Failed to load course details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div
          className="spin"
          style={{
            width: 36,
            height: 36,
            border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 16px',
          }}
        />
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Loading course curriculum & roadmap...</div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <Card style={{ maxWidth: 500, margin: '0 auto', padding: 32 }}>
          <BookOpen size={42} color="var(--danger)" style={{ margin: '0 auto 12px' }} />
          <h2 style={{ fontSize: 20, color: 'var(--navy-900)' }}>Course Not Found</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 14 }}>
            {error || 'The requested course does not exist.'}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 20 }}
            onClick={() => navigate('/courses')}
          >
            Back to All Courses
          </button>
        </Card>
      </div>
    )
  }

  const currentModule = course.modules?.find((m) => m.status === 'current') || course.modules?.[0]
  const currentStepOrder = currentModule?.order || 1

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 20,
        }}
      >
        <Link to="/courses" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Courses
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>{course.title}</span>
      </div>

      {/* Hero Overview Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #070c18 0%, #0f172a 50%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px 38px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ maxWidth: 760, position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span
              className="pill blue"
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                fontSize: 12,
                padding: '4px 10px',
              }}
            >
              {course.category}
            </span>
            <span
              className="pill navy"
              style={{
                background: 'rgba(255,255,255,0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 12,
                padding: '4px 10px',
              }}
            >
              {course.difficulty} Level
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(26px, 2.8vw, 36px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.25,
              marginBottom: 12,
            }}
          >
            {course.title}
          </h1>

          <p style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.6, marginBottom: 24 }}>
            {course.description}
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{
                padding: '12px 24px',
                fontSize: 14.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
              onClick={() => navigate(`/courses/${course.id}/learn?step=${currentStepOrder}`)}
            >
              <PlayCircle size={18} />
              <span>Continue Learning</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{
                padding: '12px 20px',
                fontSize: 14.5,
                fontWeight: 600,
                background: 'rgba(255,255,255,0.08)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
              onClick={() => navigate(`/courses/${course.id}/learn?step=${currentStepOrder}&tab=practice`)}
            >
              <Code2 size={17} />
              <span>Continue Practicing</span>
            </button>

            <button
              type="button"
              className="btn"
              style={{
                padding: '12px 20px',
                fontSize: 14,
                color: '#93c5fd',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
              onClick={() => navigate(`/courses/${course.id}/assessment`)}
            >
              <Award size={17} />
              <span>Final Assessment</span>
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Roadmap on Left, Telemetry & Mastery on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.8fr) minmax(320px, 1fr)', gap: 24 }}>
        {/* LEFT: Structured Sequential Learning Roadmap */}
        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)' }}>
                Course Learning Path
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                Sequential progression. Complete steps one-by-one to unlock subsequent modules.
              </div>
            </div>

            <div style={{ fontSize: 13, color: 'var(--text-soft)', fontWeight: 600 }}>
              {course.completedModulesCount || 4} of {course.totalModulesCount || 12} Modules Completed
            </div>
          </div>

          <div className="stack gap-sm">
            {(course.modules || []).map((mod) => {
              const isCompleted = mod.status === 'completed'
              const isCurrent = mod.status === 'current'
              const isAvailable = mod.status === 'available'
              const isLocked = mod.status === 'locked'

              return (
                <div
                  key={mod.id}
                  className="card"
                  style={{
                    padding: '18px 22px',
                    borderRadius: 14,
                    border: isCurrent
                      ? '2px solid var(--primary)'
                      : isCompleted
                      ? '1px solid var(--success-border)'
                      : '1px solid var(--border)',
                    background: isCurrent ? '#f0f7ff' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    opacity: isLocked ? 0.72 : 1,
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/courses/${course.id}/learn?step=${mod.order}`)
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 }}>
                    {/* Status Badge Icon */}
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: isCompleted
                          ? 'var(--success-bg)'
                          : isCurrent
                          ? 'var(--primary-subtle)'
                          : isAvailable
                          ? '#f1f5f9'
                          : '#f8fafc',
                        color: isCompleted
                          ? 'var(--success)'
                          : isCurrent
                          ? 'var(--primary)'
                          : isAvailable
                          ? 'var(--navy-700)'
                          : 'var(--text-muted)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={22} color="var(--success)" />
                      ) : isCurrent ? (
                        <PlayCircle size={22} color="var(--primary)" />
                      ) : isAvailable ? (
                        <Unlock size={20} color="var(--navy-700)" />
                      ) : (
                        <Lock size={18} color="var(--text-muted)" />
                      )}
                    </div>

                    {/* Step Title & Meta */}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            color: isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                          }}
                        >
                          Step {String(mod.order).padStart(2, '0')}
                        </span>
                        <span style={{ color: 'var(--border)' }}>•</span>
                        <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>{mod.topic}</span>
                      </div>

                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 700,
                          color: isCurrent ? 'var(--primary-hover)' : 'var(--navy-900)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {mod.title}
                      </div>

                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                        {mod.duration || '1h 30m'} • {mod.lessonsCount || 6} Lessons •{' '}
                        {mod.questionsCount || 10} Practice Problems
                      </div>
                    </div>
                  </div>

                  {/* Right Status Pill & Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                    {isCompleted && (
                      <Pill tone="success" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                        Completed
                      </Pill>
                    )}
                    {isCurrent && (
                      <Pill tone="blue" style={{ fontSize: 11.5, padding: '4px 10px', fontWeight: 700 }}>
                        Current Step
                      </Pill>
                    )}
                    {isAvailable && (
                      <Pill tone="neutral" style={{ fontSize: 11.5, padding: '4px 10px' }}>
                        Available
                      </Pill>
                    )}
                    {isLocked && (
                      <Pill tone="neutral" style={{ fontSize: 11.5, padding: '4px 10px', opacity: 0.8 }}>
                        Locked
                      </Pill>
                    )}

                    {!isLocked && <ChevronRight size={18} color="var(--text-muted)" />}
                  </div>
                </div>
              )
            })}

            {/* Step 13: Final Course Assessment Card */}
            <div
              className="card"
              style={{
                padding: '20px 22px',
                borderRadius: 14,
                border: '1.5px dashed var(--primary-border)',
                background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                marginTop: 8,
              }}
              onClick={() => navigate(`/courses/${course.id}/assessment`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: 'var(--primary-subtle)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Award size={24} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)' }}>
                      FINAL ASSESSMENT
                    </span>
                    <Pill tone="blue" style={{ fontSize: 11 }}>
                      Course Capstone
                    </Pill>
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy-900)' }}>
                    Comprehensive DSA Mastery Exam
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                    15 Structured Questions • 30 Minutes • Includes AI/ML Cognitive Mistake Diagnostics
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: 13, fontWeight: 700 }}
              >
                <span>Take Final Exam</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: Live Progress & Topic Mastery Metrics */}
        <div className="stack gap-md">
          {/* Progress Card */}
          <Card style={{ padding: '22px 24px', borderRadius: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 16 }}>
              Course Progress & Telemetry
            </h3>

            <div style={{ marginBottom: 18 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                <span>Course Completion</span>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{course.progress}%</span>
              </div>
              <div className="course-progress-bar" style={{ height: 8 }}>
                <div className="course-progress-fill" style={{ width: `${course.progress}%` }} />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-alt)',
                marginBottom: 16,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Practice Accuracy</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', marginTop: 2 }}>
                  {course.practiceAccuracy || 82}%
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current Topic</div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginTop: 4,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {course.currentTopic || 'Binary Search'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-soft)' }}>
              <Sparkles size={15} color="var(--primary)" />
              <span>AI learning diagnostics automatically track boundary mistakes.</span>
            </div>
          </Card>

          {/* Topic Mastery Matrix */}
          <Card style={{ padding: '22px 24px', borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)' }}>
                Topic Mastery
              </h3>
              <span className="pill neutral" style={{ fontSize: 11 }}>
                Live BKT Matrix
              </span>
            </div>

            <div className="stack gap-sm">
              {(course.topicMastery || []).map((t) => (
                <div key={t.topic}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12.5,
                      marginBottom: 4,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{t.topic}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color:
                          t.mastery >= 80
                            ? 'var(--success)'
                            : t.mastery >= 60
                            ? 'var(--primary)'
                            : 'var(--warning)',
                      }}
                    >
                      {t.mastery}% • {t.status}
                    </span>
                  </div>
                  <div className="course-progress-bar" style={{ height: 6 }}>
                    <div
                      className="course-progress-fill"
                      style={{
                        width: `${t.mastery}%`,
                        background:
                          t.mastery >= 80
                            ? 'var(--success)'
                            : t.mastery >= 60
                            ? 'var(--primary)'
                            : '#f59e0b',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Instructor Card */}
          <Card style={{ padding: '20px 22px', borderRadius: 16 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 8 }}>
              Academic Faculty
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: 'var(--navy-900)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                {course.instructor?.[0] || 'D'}
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 14 }}>
                  {course.instructor}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {course.instructorRole || 'Lead Instructor & Systems Researcher'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
