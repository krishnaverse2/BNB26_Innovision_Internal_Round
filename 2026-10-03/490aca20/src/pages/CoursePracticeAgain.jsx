import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  ChevronRight,
  Check,
  X,
  PlayCircle,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { getTargetedPractice, submitTargetedPractice } from '../services/courseApi'

export default function CoursePracticeAgain() {
  const { courseId, gapId } = useParams()
  const navigate = useNavigate()

  const [practiceData, setPracticeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getTargetedPractice(gapId || 'gap-bs-01')
        setPracticeData(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [gapId])

  function handleSelectOption(qId, opt) {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qId]: opt }))
  }

  // Quick Demo Auto-fill for evaluators
  function handleAutoFillCorrect() {
    if (!practiceData?.questions) return
    const filled = {}
    practiceData.questions.forEach((q) => {
      filled[q.questionId] = q.correctAnswer
    })
    setAnswers(filled)
  }

  async function handleSubmit() {
    if (submitting) return
    try {
      setSubmitting(true)
      const res = await submitTargetedPractice({
        gapId: gapId || 'gap-bs-01',
        answers,
        previousAccuracy: 40,
      })

      setEvaluation(res.evaluation)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="spin" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
        <div>Generating fresh questions targeting your learning gap...</div>
      </div>
    )
  }

  const questions = practiceData?.questions || []
  const answeredCount = Object.keys(answers).length

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1100, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        <Link to={`/courses/${courseId || 'dsa'}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Course Detail
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>Targeted Re-Evaluation</span>
      </div>

      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #070c18 0%, #0f172a 45%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 18,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '28px 32px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <span
              className="pill blue"
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                color: '#93c5fd',
                fontSize: 12,
                padding: '3px 8px',
              }}
            >
              <Sparkles size={12} />
              Re-Evaluation Loop • {practiceData?.topic}
            </span>
          </div>

          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '0 0 6px' }}>
            Practice Again: {practiceData?.concept}
          </h1>

          <p style={{ fontSize: 13.5, color: '#94a3b8', margin: 0, maxWidth: 640 }}>
            These fresh diagnostic questions test whether you now understand pointer movement invariants
            after watching the personalized AI lesson.
          </p>
        </div>

        {/* Demo Helper Button */}
        {!submitted && (
          <button
            type="button"
            className="btn btn-soft"
            onClick={handleAutoFillCorrect}
            style={{ fontSize: 12, padding: '6px 12px' }}
          >
            Auto-Fill Correct Answers
          </button>
        )}
      </div>

      {/* Evaluation Results Banner (when submitted) */}
      {submitted && evaluation && (
        <Card
          className="animate-rise"
          style={{
            padding: '32px 36px',
            borderRadius: 18,
            marginBottom: 28,
            background:
              evaluation.status === 'mastered'
                ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)'
                : '#eff6ff',
            border:
              evaluation.status === 'mastered'
                ? '1.5px solid #86efac'
                : '1.5px solid var(--primary-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: evaluation.status === 'mastered' ? '#16a34a' : 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUp size={28} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: evaluation.status === 'mastered' ? '#15803d' : 'var(--primary)' }}>
                  COGNITIVE RE-EVALUATION RESULT
                </div>
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 800,
                    color: evaluation.status === 'mastered' ? '#14532d' : 'var(--navy-900)',
                    margin: '2px 0 6px',
                  }}
                >
                  {evaluation.status === 'mastered' ? '🎉 Great Improvement!' : 'Progress Recorded'}
                </h2>
                <div style={{ fontSize: 14, color: evaluation.status === 'mastered' ? '#166534' : 'var(--text-soft)' }}>
                  {evaluation.message}
                </div>
              </div>
            </div>

            {/* Before vs After Metric Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                background: '#ffffff',
                padding: '14px 20px',
                borderRadius: 14,
                boxShadow: 'var(--shadow-sm)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Before AI Lesson</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--danger)', marginTop: 2 }}>
                  {evaluation.previousAccuracy}%
                </div>
              </div>

              <div style={{ fontSize: 18, color: 'var(--text-muted)' }}>➔</div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>After AI Lesson</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)', marginTop: 2 }}>
                  {evaluation.newAccuracy}%
                </div>
              </div>

              <div
                style={{
                  background: '#f0fdf4',
                  color: '#16a34a',
                  fontWeight: 800,
                  fontSize: 13,
                  padding: '4px 10px',
                  borderRadius: 8,
                }}
              >
                +{evaluation.improvement}%
              </div>
            </div>
          </div>

          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/courses/${courseId || 'dsa'}`)}
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700 }}
            >
              <span>Return to Course Dashboard</span>
              <ArrowRight size={15} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/courses/${courseId || 'dsa'}/assessment`)}
              style={{ padding: '10px 18px', fontSize: 14 }}
            >
              Retake Final Assessment
            </button>
          </div>
        </Card>
      )}

      {/* Questions Stack */}
      <div className="stack gap-md" style={{ marginBottom: 32 }}>
        {questions.map((q, idx) => {
          const selected = answers[q.questionId]
          const isCorrect = submitted && selected === q.correctAnswer
          const isWrong = submitted && selected !== q.correctAnswer

          return (
            <Card key={q.questionId} style={{ padding: '28px 32px', borderRadius: 16 }}>
              {/* Question Metadata */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 6,
                      background: 'var(--navy-900)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                    {q.questionId}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Pill tone="blue" style={{ fontSize: 11 }}>
                    {q.concept}
                  </Pill>
                  <Pill
                    tone={
                      q.difficulty === 'Easy'
                        ? 'success'
                        : q.difficulty === 'Medium'
                        ? 'blue'
                        : 'warning'
                    }
                    style={{ fontSize: 11 }}
                  >
                    {q.difficulty}
                  </Pill>
                </div>
              </div>

              {/* Question Text */}
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 18, lineHeight: 1.5 }}>
                {q.question}
              </h3>

              {/* Options */}
              <div className="stack gap-xs" style={{ marginBottom: 16 }}>
                {(q.options || []).map((opt) => {
                  const isSelected = selected === opt
                  const isRightAnswer = submitted && opt === q.correctAnswer
                  const isWrongChoice = submitted && isSelected && isWrong

                  return (
                    <div
                      key={opt}
                      onClick={() => handleSelectOption(q.questionId, opt)}
                      style={{
                        padding: '12px 16px',
                        borderRadius: 10,
                        fontSize: 14,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: submitted ? 'default' : 'pointer',
                        background: isRightAnswer
                          ? '#f0fdf4'
                          : isWrongChoice
                          ? '#fef2f2'
                          : isSelected
                          ? 'var(--primary-subtle)'
                          : 'var(--surface-alt)',
                        border: isRightAnswer
                          ? '1.5px solid #22c55e'
                          : isWrongChoice
                          ? '1.5px solid #ef4444'
                          : isSelected
                          ? '1.5px solid var(--primary)'
                          : '1px solid var(--border)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          border: isSelected ? '5px solid var(--primary)' : '2px solid var(--border)',
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

              {/* Explanation (when submitted) */}
              {submitted && (
                <div
                  style={{
                    padding: '12px 16px',
                    borderRadius: 10,
                    background: isCorrect ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${isCorrect ? '#bbf7d0' : '#fecaca'}`,
                    fontSize: 13,
                    color: isCorrect ? '#166534' : '#991b1b',
                  }}
                >
                  <strong>{isCorrect ? '✅ Correct Explanation: ' : '❌ Conceptual Remedy: '}</strong>
                  {q.explanation}
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Bottom Submit Action */}
      {!submitted && (
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={answeredCount < questions.length || submitting}
            onClick={handleSubmit}
            style={{
              padding: '12px 28px',
              fontSize: 15,
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>{submitting ? 'Evaluating Mastery...' : 'Submit Re-Assessment'}</span>
            <ArrowRight size={16} />
          </button>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
            Answer all {questions.length} questions to calculate your updated concept accuracy.
          </div>
        </div>
      )}
    </div>
  )
}
