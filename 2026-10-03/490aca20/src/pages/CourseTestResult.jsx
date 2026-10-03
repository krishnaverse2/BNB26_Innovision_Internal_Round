import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Play,
  RotateCcw,
  BookOpen,
  Brain,
  Video,
  Award,
  RefreshCw,
  Clock,
  Layers,
  HelpCircle,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { triggerAiVideoGeneration, checkAiVideoStatus } from '../services/courseApi'

export default function CourseTestResult() {
  const { courseId, assessmentId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  // Result from navigation state or local fallback
  const [result, setResult] = useState(location.state?.result || null)

  // Video generation state
  const [generatingVideo, setGeneratingVideo] = useState(false)
  const [generationJobId, setGenerationJobId] = useState(null)
  const [generationStage, setGenerationStage] = useState(null) // { stage, message, progressPct, isComplete }
  const [lessonScript, setLessonScript] = useState(null)
  const [videoError, setVideoError] = useState('')

  // Default fallback if refreshed directly
  useEffect(() => {
    if (!result) {
      // Simulate test result with Binary Search pointer movement mistakes
      setResult({
        assessmentId: assessmentId || 'test-sample',
        courseId: courseId || 'dsa',
        score: 72,
        percentage: 72,
        correctCount: 11,
        incorrectCount: 4,
        totalQuestions: 15,
        timeTakenSec: 420,
        perfectScore: false,
        shouldGenerateVideo: true,
        topicPerformance: [
          { topic: 'Arrays', total: 3, correct: 3, incorrect: 0, accuracy: 100, status: 'Strong' },
          { topic: 'Sorting', total: 3, correct: 2, incorrect: 1, accuracy: 67, status: 'Needs Improvement' },
          { topic: 'Linked Lists', total: 3, correct: 2, incorrect: 1, accuracy: 67, status: 'Needs Improvement' },
          { topic: 'Binary Search', total: 4, correct: 1, incorrect: 3, accuracy: 25, status: 'Weak' },
          { topic: 'Trees', total: 2, correct: 2, incorrect: 0, accuracy: 100, status: 'Strong' },
        ],
        learningGaps: [
          {
            gapId: 'gap-bs-01',
            topic: 'Binary Search',
            concept: 'Pointer Movement',
            likelyProblem:
              'Student understands the basic search concept, but does not correctly understand when low and high should move.',
            reasoningExplanation:
              'The student answered multiple questions incorrectly regarding low = mid + 1 versus high = mid - 1, causing infinite loops when search bounds fail to strictly shrink.',
            confidence: 'High (94%)',
            relatedMistakeCount: 3,
            mistakes: [
              {
                questionId: 'FINAL-DSA-001',
                question: 'When arr[mid] < target, which pointer must be updated?',
                studentAnswer: 'low = mid',
                correctAnswer: 'low = mid + 1',
                explanation: 'Must discard mid to strictly shrink search space.',
              },
              {
                questionId: 'FINAL-DSA-002',
                question: 'When arr[mid] > target, what is the next pointer update?',
                studentAnswer: 'high = mid',
                correctAnswer: 'high = mid - 1',
                explanation: 'Must advance high past mid to mid - 1.',
              },
              {
                questionId: 'FINAL-DSA-003',
                question: 'Why does setting high = mid risk an infinite loop?',
                studentAnswer: 'Because mid becomes negative',
                correctAnswer: 'Because high will never decrease below low when low equals mid',
                explanation: 'Search space never shrinks when low equals mid.',
              },
            ],
          },
        ],
      })
    }
  }, [result, assessmentId, courseId])

  // Poll video generation status if job is active
  useEffect(() => {
    let interval = null
    if (generatingVideo && generationJobId) {
      interval = setInterval(async () => {
        try {
          const status = await checkAiVideoStatus(generationJobId)
          setGenerationStage(status)
          if (status.isComplete) {
            setGeneratingVideo(false)
            setLessonScript(status.lessonScript)
          }
        } catch (err) {
          console.error(err)
          setVideoError('Video generation encountered a momentary delay. AI diagnosis remains available.')
          setGeneratingVideo(false)
        }
      }, 1200)
    }
    return () => clearInterval(interval)
  }, [generatingVideo, generationJobId])

  // Trigger Video Generation
  async function handleStartVideoGeneration(gap) {
    try {
      setGeneratingVideo(true)
      setVideoError('')
      const res = await triggerAiVideoGeneration({
        assessmentId: result.assessmentId,
        courseId: courseId || 'dsa',
        learningGap: gap,
      })

      setGenerationJobId(res.jobId)
      setLessonScript(res.lessonScript)
    } catch (err) {
      console.error(err)
      setVideoError('Could not start video generation right now. Learning analysis is still available.')
      setGeneratingVideo(false)
    }
  }

  if (!result) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="spin" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
        <div>Analyzing cognitive test results...</div>
      </div>
    )
  }

  const primaryGap = result.learningGaps?.[0]
  const isPerfect = Boolean(result.perfectScore || result.incorrectCount === 0)

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1200, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Overview Score Card */}
      <div
        className="card"
        style={{
          background: isPerfect
            ? 'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #047857 100%)'
            : 'linear-gradient(135deg, #070c18 0%, #0f172a 50%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '36px 40px',
          marginBottom: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span
                className="pill"
                style={{
                  background: isPerfect ? 'rgba(74, 222, 128, 0.2)' : 'rgba(37, 99, 235, 0.25)',
                  color: isPerfect ? '#86efac' : '#93c5fd',
                  fontSize: 12,
                  padding: '4px 10px',
                }}
              >
                {isPerfect ? 'Mastery Confirmed' : 'AI Diagnostic Completed'}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(24px, 2.5vw, 32px)', fontWeight: 800, color: '#ffffff', margin: '4px 0 10px' }}>
              {isPerfect ? 'Test Complete — Perfect Score!' : 'Test Complete & Learning Analysis'}
            </h1>

            <p style={{ fontSize: 14.5, color: '#94a3b8', maxWidth: 600, lineHeight: 1.5, margin: 0 }}>
              {isPerfect
                ? 'You demonstrated comprehensive mastery across all tested algorithms. No cognitive learning gaps were detected.'
                : 'RE:LEARN AI evaluated your answer telemetry and pinpointed the underlying concept causing your errors.'}
            </p>
          </div>

          {/* Big Score Radial Badge */}
          <div
            style={{
              textAlign: 'center',
              padding: '18px 28px',
              borderRadius: 16,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <div style={{ fontSize: 44, fontWeight: 900, color: isPerfect ? '#4ade80' : '#60a5fa', lineHeight: 1 }}>
              {result.score}%
            </div>
            <div style={{ fontSize: 13, color: '#cbd5e1', marginTop: 6, fontWeight: 600 }}>
              {result.correctCount} / {result.totalQuestions} Correct
            </div>
          </div>
        </div>

        {/* Quick Stat Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 24,
            paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.1)',
            fontSize: 13,
            color: '#cbd5e1',
            flexWrap: 'wrap',
          }}
        >
          <div>
            Correct: <strong style={{ color: '#4ade80' }}>{result.correctCount}</strong>
          </div>
          <span>•</span>
          <div>
            Incorrect: <strong style={{ color: '#f87171' }}>{result.incorrectCount}</strong>
          </div>
          <span>•</span>
          <div>
            Time Taken: <strong>{Math.round((result.timeTakenSec || 300) / 60)} mins</strong>
          </div>
          <span>•</span>
          <div>
            Course Track: <strong>Data Structures & Algorithms</strong>
          </div>
        </div>
      </div>

      {/* CASE 1: MANDATORY PERFECT SCORE EXPERIENCE (NO VIDEO GENERATED!) */}
      {isPerfect ? (
        <Card style={{ padding: '36px 40px', borderRadius: 18, marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: 'var(--success-bg)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={30} />
            </div>
            <div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                🎉 Excellent Work!
              </h2>
              <div style={{ fontSize: 14, color: 'var(--text-soft)', marginTop: 4 }}>
                You answered every question correctly. No major learning gaps were detected.
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14.5, color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: 700 }}>
            Your understanding of Array Partitioning, Binary Search Invariants, MergeSort, Linked List Pointers,
            and Tree Traversals is rigorous and stable. You are ready to explore advanced topics and competitive challenge tracks.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 24 }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/courses')}
              style={{ padding: '10px 20px', fontSize: 14, fontWeight: 700 }}
            >
              <span>Explore Advanced Courses</span>
              <ArrowRight size={16} />
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/coding-lab')}
              style={{ padding: '10px 18px', fontSize: 14 }}
            >
              Solve Competitive Challenges
            </button>
          </div>
        </Card>
      ) : (
        /* CASE 2: MISTAKES DETECTED -> AI/ML LEARNING GAP & PERSONALIZED VIDEO GENERATION */
        <div className="stack gap-lg" style={{ marginBottom: 28 }}>
          {/* AI/ML Learning Gap Analysis Card */}
          <Card style={{ padding: '32px 36px', borderRadius: 18, border: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
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
                <Brain size={24} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                  AI COGNITIVE DIAGNOSTIC RESULT
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                  Detected Learning Gap: {primaryGap?.topic} — {primaryGap?.concept}
                </h2>
              </div>
            </div>

            {/* Diagnostic Box */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 14,
                padding: '20px 24px',
                marginBottom: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span className="pill warning" style={{ fontSize: 12, fontWeight: 700 }}>
                  Likely Root Misconception
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  AI Confidence: {primaryGap?.confidence || 'High (94%)'}
                </span>
              </div>

              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 8 }}>
                "{primaryGap?.likelyProblem}"
              </div>

              <div style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {primaryGap?.reasoningExplanation}
              </div>
            </div>

            {/* Grouped Mistakes Summary */}
            <div style={{ marginBottom: 24 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 10 }}>
                Grouped Cognitive Mistake Trace ({primaryGap?.relatedMistakeCount || 3} related questions):
              </h4>

              <div className="stack gap-xs">
                {(primaryGap?.mistakes || []).map((m, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      background: '#fff5f5',
                      border: '1px solid #fed7d7',
                      fontSize: 13,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 10,
                    }}
                  >
                    <div>
                      <strong>{m.questionId}: </strong>
                      <span>{m.question}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12 }}>
                      <span style={{ color: '#dc2626' }}>
                        Your Answer: <strong>{m.studentAnswer}</strong> ❌
                      </span>
                      <span style={{ color: '#16a34a' }}>
                        Correct: <strong>{m.correctAnswer}</strong> ✅
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Generation Trigger / Progress Area */}
            {!generatingVideo && !lessonScript && (
              <div
                style={{
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0f7ff 100%)',
                  borderRadius: 14,
                  padding: '24px 26px',
                  border: '1px solid var(--primary-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Sparkles size={18} color="var(--primary)" />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      Personalized Remedial Lesson Available
                    </h3>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', marginTop: 4 }}>
                    Generate a personalized 10-scene animated lesson explaining your exact pointer movement mistakes.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleStartVideoGeneration(primaryGap)}
                  style={{
                    padding: '12px 22px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <Video size={17} />
                  <span>Generate Personalized AI Lesson</span>
                </button>
              </div>
            )}

            {/* Multi-Stage Generation Progress UX */}
            {generatingVideo && (
              <div
                className="card"
                style={{
                  padding: '28px 30px',
                  borderRadius: 14,
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div className="spin" style={{ width: 22, height: 22, border: '3px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      AI Video Generation in Progress...
                    </h4>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      {generationStage?.message || 'Analyzing your assessment mistakes...'}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="course-progress-bar" style={{ height: 8, marginBottom: 18 }}>
                  <div
                    className="course-progress-fill"
                    style={{ width: `${generationStage?.progressPct || 25}%`, background: 'var(--primary)' }}
                  />
                </div>

                {/* Multi-step Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: 12 }}>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 20 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ✓ 1. Analyzing your answers
                  </div>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 40 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ✓ 2. Finding your learning gaps
                  </div>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 60 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ✓ 3. Understanding your mistakes
                  </div>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 80 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ⏳ 4. Creating your personalized lesson
                  </div>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 90 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ⏳ 5. Generating explanation
                  </div>
                  <div style={{ color: (generationStage?.progressPct || 0) >= 100 ? 'var(--success)' : 'var(--text-muted)' }}>
                    ⏳ 6. Preparing your video
                  </div>
                </div>
              </div>
            )}

            {/* Lesson Generated Ready CTA */}
            {lessonScript && !generatingVideo && (
              <div
                className="card animate-rise"
                style={{
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  border: '1.5px solid #a7f3d0',
                  borderRadius: 16,
                  padding: '24px 28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: 12,
                      background: '#10b981',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Play size={22} fill="#ffffff" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 800, color: '#065f46', margin: 0 }}>
                      Your Personalized AI Lesson is Ready!
                    </h3>
                    <div style={{ fontSize: 13, color: '#047857', marginTop: 3 }}>
                      {lessonScript.title} • 10 Interactive Animated Scenes • Targeted at your mistakes
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate(`/courses/${courseId || 'dsa'}/video/${lessonScript.lessonId}`)}
                  style={{
                    padding: '12px 24px',
                    fontSize: 14,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span>Watch My Personalized AI Lesson</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Topic-wise Performance Grid */}
      <Card style={{ padding: '28px 32px', borderRadius: 16 }}>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 18 }}>
          Topic Performance Breakdown
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {(result.topicPerformance || []).map((t) => (
            <div
              key={t.topic}
              style={{
                padding: '16px 18px',
                borderRadius: 12,
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 14 }}>{t.topic}</span>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color:
                      t.status === 'Strong'
                        ? 'var(--success)'
                        : t.status === 'Needs Improvement'
                        ? 'var(--primary)'
                        : 'var(--danger)',
                  }}
                >
                  {t.accuracy}% • {t.status}
                </span>
              </div>

              <div className="course-progress-bar" style={{ height: 6 }}>
                <div
                  className="course-progress-fill"
                  style={{
                    width: `${t.accuracy}%`,
                    background:
                      t.status === 'Strong'
                        ? 'var(--success)'
                        : t.status === 'Needs Improvement'
                        ? 'var(--primary)'
                        : 'var(--danger)',
                  }}
                />
              </div>

              <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 8 }}>
                {t.correct} of {t.total} questions answered correctly
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
