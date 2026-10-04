import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ArrowRight,
  BookOpen,
  Send,
  Sparkles,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { getCourseAssessment, submitCourseAssessment } from '../services/courseApi'

export default function CourseAssessment() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [assessment, setAssessment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(30 * 60) // 30 minutes in seconds
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getCourseAssessment(courseId || 'dsa')
        setAssessment(data)
        if (data.durationMinutes) {
          setTimeLeft(data.durationMinutes * 60)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId])

  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  function handleSelectOption(qId, opt) {
    setAnswers((prev) => ({ ...prev, [qId]: opt }))
  }

  // Quick Demo Auto-Fill: fills answers with either 100% correct or intentional mistakes for testing
  function handleAutoFill(type = 'with_mistakes') {
    if (!assessment?.questions) return
    const newAns = {}
    assessment.questions.forEach((q, idx) => {
      if (type === 'perfect') {
        // Correct answers
        if (q.questionId === 'FINAL-DSA-001') newAns[q.questionId] = 'low = mid + 1'
        else if (q.questionId === 'FINAL-DSA-002') newAns[q.questionId] = 'high = mid - 1'
        else if (q.questionId === 'FINAL-DSA-003') newAns[q.questionId] = 'Because high will never decrease below low when low equals mid'
        else if (q.options && q.options.length) newAns[q.questionId] = q.options[0]
      } else {
        // Intentional mistakes on Binary Search pointer movement
        if (q.questionId === 'FINAL-DSA-001') newAns[q.questionId] = 'low = mid' // ❌ MISTAKE
        else if (q.questionId === 'FINAL-DSA-002') newAns[q.questionId] = 'high = mid' // ❌ MISTAKE
        else if (q.questionId === 'FINAL-DSA-003') newAns[q.questionId] = 'Because mid becomes negative' // ❌ MISTAKE
        else if (q.options && q.options.length) newAns[q.questionId] = q.options[0]
      }
    })
    setAnswers(newAns)
  }

  async function handleSubmit() {
    if (submitting) return
    try {
      setSubmitting(true)
      const res = await submitCourseAssessment(courseId || 'dsa', {
        answers,
        timeTakenSec: (assessment?.durationMinutes || 30) * 60 - timeLeft,
      })

      // Navigate to Test Result & AI/ML Learning Analysis Page
      navigate(`/courses/${courseId || 'dsa'}/result/${res.assessmentId}`, {
        state: { result: res.result },
      })
    } catch (err) {
      console.error(err)
      setSubmitting(false)
    }
  }

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
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Preparing comprehensive assessment items...
        </div>
      </div>
    )
  }

  if (!assessment || !assessment.questions?.length) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <h3>Assessment not found.</h3>
        <button
          type="button"
          className="btn btn-primary"
          style={{ marginTop: 16 }}
          onClick={() => navigate(`/courses/${courseId || 'dsa'}`)}
        >
          Return to Course
        </button>
      </div>
    )
  }

  const questions = assessment.questions
  const currentQ = questions[currentIndex]
  const answeredCount = Object.keys(answers).length

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Assessment Header Bar */}
      <div
        className="card"
        style={{
          padding: '16px 24px',
          borderRadius: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} color="var(--primary)" />
            <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy-900)' }}>
              {assessment.title}
            </span>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
            Question {currentIndex + 1} of {questions.length} • {answeredCount} Answered
          </div>
        </div>

        {/* Live Timer & Quick Demo Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {/* Demo Helper Chips for evaluators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => handleAutoFill('with_mistakes')}
              style={{ fontSize: 11, padding: '4px 8px' }}
              title="Auto-fill with Binary Search pointer mistakes to test AI video generation"
            >
              Demo: Test Mistakes
            </button>
            <button
              type="button"
              className="btn btn-soft"
              onClick={() => handleAutoFill('perfect')}
              style={{ fontSize: 11, padding: '4px 8px' }}
              title="Auto-fill with 100% correct answers to verify NO video generated"
            >
              Demo: 100% Correct
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 14px',
              borderRadius: 10,
              background: timeLeft < 300 ? '#fef2f2' : 'var(--surface-alt)',
              color: timeLeft < 300 ? '#dc2626' : 'var(--navy-900)',
              fontWeight: 700,
              fontSize: 14,
              fontFamily: 'var(--mono)',
            }}
          >
            <Clock size={16} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700 }}
          >
            <Send size={14} style={{ marginRight: 6 }} />
            <span>{submitting ? 'Analyzing Answers...' : 'Submit Test'}</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: 24 }}>
        {/* LEFT: Current Question Card */}
        <Card style={{ padding: '32px 36px', borderRadius: 18 }}>
          {/* Metadata Chips */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="pill blue" style={{ fontSize: 11.5 }}>
                {currentQ.topic}
              </span>
              <span className="pill neutral" style={{ fontSize: 11.5 }}>
                {currentQ.concept}
              </span>
              <span
                className="pill"
                style={{
                  fontSize: 11.5,
                  background:
                    currentQ.difficulty === 'Easy'
                      ? 'var(--success-bg)'
                      : currentQ.difficulty === 'Medium'
                      ? 'var(--primary-subtle)'
                      : '#fef2f2',
                  color:
                    currentQ.difficulty === 'Easy'
                      ? 'var(--success)'
                      : currentQ.difficulty === 'Medium'
                      ? 'var(--primary)'
                      : '#dc2626',
                }}
              >
                {currentQ.difficulty}
              </span>
            </div>

            <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
              {currentQ.questionId}
            </span>
          </div>

          {/* Question Text */}
          <h2
            style={{
              fontSize: 18,
              fontWeight: 800,
              color: 'var(--navy-900)',
              lineHeight: 1.5,
              marginBottom: 24,
            }}
          >
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="stack gap-sm" style={{ marginBottom: 32 }}>
            {(currentQ.options || []).map((opt, i) => {
              const isSelected = answers[currentQ.questionId] === opt

              return (
                <div
                  key={i}
                  onClick={() => handleSelectOption(currentQ.questionId, opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: 12,
                    fontSize: 14.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--primary-subtle)' : '#ffffff',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      border: isSelected ? '6px solid var(--primary)' : '2px solid var(--border)',
                      background: '#ffffff',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'var(--navy-900)', fontWeight: isSelected ? 600 : 400 }}>
                    {opt}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Prev / Next Pagination Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              style={{ padding: '8px 16px' }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              disabled={currentIndex === questions.length - 1}
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              style={{ padding: '8px 18px' }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </Card>

        {/* RIGHT: Question Palette Navigator */}
        <Card style={{ padding: '22px 20px', borderRadius: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 14 }}>
            Question Palette
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 8,
              marginBottom: 20,
            }}
          >
            {questions.map((q, idx) => {
              const isAnswered = Boolean(answers[q.questionId])
              const isCurrent = idx === currentIndex

              return (
                <button
                  key={q.questionId}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 8,
                    fontSize: 12.5,
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: isCurrent
                      ? 'var(--navy-900)'
                      : isAnswered
                      ? 'var(--primary)'
                      : 'var(--surface-alt)',
                    color: isCurrent || isAnswered ? '#ffffff' : 'var(--text-soft)',
                    border: isCurrent ? '2px solid var(--primary-light)' : '1px solid var(--border)',
                    textAlign: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--primary)' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--navy-900)' }} />
              <span>Current</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--surface-alt)' }} />
              <span>Unanswered ({questions.length - answeredCount})</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
