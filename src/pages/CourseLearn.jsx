import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Layers,
  HelpCircle,
  Check,
  X,
  Timer,
  Lock,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { getCourseStep, submitQuestionAttempt, completeCourseStep } from '../services/courseApi'

export default function CourseLearn() {
  const { courseId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const currentStep = searchParams.get('step') || '5'
  const activeTabParam = searchParams.get('tab') || 'concept'

  const [stepData, setStepData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(activeTabParam) // 'concept' | 'example' | 'visual' | 'practice'
  const [selectedAnswers, setSelectedAnswers] = useState({})
  const [submittedAnswers, setSubmittedAnswers] = useState({})
  const [feedback, setFeedback] = useState({})
  const [stepCompleted, setStepCompleted] = useState(false)
  const [completing, setCompleting] = useState(false)

  // Interactive Visual Simulation State (Binary Search Pointer Animator)
  const [simStep, setSimStep] = useState(0)
  const [simPlaying, setSimPlaying] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getCourseStep(courseId || 'dsa', currentStep)
        setStepData(data)
        setStepCompleted(Boolean(data.isCompleted))
        setSelectedAnswers({})
        setSubmittedAnswers({})
        setFeedback({})
        setSimStep(0)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [courseId, currentStep])

  // Sync tab with URL
  useEffect(() => {
    if (activeTabParam && activeTabParam !== activeTab) {
      setActiveTab(activeTabParam)
    }
  }, [activeTabParam])

  // Simulation step timer
  useEffect(() => {
    let interval = null
    if (simPlaying && stepData?.content?.visualExplanation?.steps) {
      const maxSteps = stepData.content.visualExplanation.steps.length
      interval = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= maxSteps - 1) {
            setSimPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, 2200)
    }
    return () => clearInterval(interval)
  }, [simPlaying, stepData])

  function handleTabChange(tab) {
    setActiveTab(tab)
    setSearchParams({ step: currentStep, tab })
  }

  // Handle Question Answer Selection
  function handleSelectOption(questionId, option) {
    if (submittedAnswers[questionId]) return // locked after submit
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }))
  }

  // Handle Question Submit & Attempt Recording
  async function handleSubmitAnswer(question) {
    const selected = selectedAnswers[question.questionId]
    if (!selected) return

    try {
      const res = await submitQuestionAttempt(courseId || 'dsa', {
        moduleId: stepData.id,
        questionId: question.questionId,
        studentAnswer: selected,
        correctAnswer: question.correctAnswer,
        timeSpentSec: 35,
      })

      setSubmittedAnswers((prev) => ({ ...prev, [question.questionId]: selected }))
      setFeedback((prev) => ({
        ...prev,
        [question.questionId]: {
          isCorrect: res.isCorrect,
          explanation: res.explanation || question.explanation,
        },
      }))

      // Check if all practice questions in this step are answered
      const allQ = stepData.practiceQuestions || []
      const answeredCount = Object.keys(submittedAnswers).length + 1
      if (answeredCount >= allQ.length) {
        handleMarkStepComplete()
      }
    } catch (err) {
      console.error(err)
    }
  }

  // Complete Step
  async function handleMarkStepComplete() {
    try {
      setCompleting(true)
      await completeCourseStep(courseId || 'dsa', stepData.id)
      setStepCompleted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setCompleting(false)
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
          Loading step content & practice challenges...
        </div>
      </div>
    )
  }

  if (!stepData) {
    return (
      <div style={{ padding: '40px 24px', textAlign: 'center' }}>
        <h3>Step not found.</h3>
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

  const simData = stepData.content?.visualExplanation || {}
  const simSteps = simData.steps || []
  const currentSimState = simSteps[simStep] || {
    low: 0,
    high: 9,
    mid: 4,
    midVal: 16,
    explanation: 'Initial binary search state.',
  }
  const simArray = simData.array || [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1300, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Top Step Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate(`/courses/${courseId || 'dsa'}`)}
            style={{ padding: '7px 12px', fontSize: 13 }}
          >
            <ChevronLeft size={16} />
            <span>Course Roadmap</span>
          </button>

          <div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 600 }}>
              Step {stepData.currentStepIndex} of {stepData.totalModules} • {stepData.topic}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)' }}>
              {stepData.title}
            </div>
          </div>
        </div>

        {/* Step Prev / Next Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={!stepData.prevStepOrder}
            onClick={() => {
              if (stepData.prevStepOrder) {
                setSearchParams({ step: stepData.prevStepOrder, tab: activeTab })
              }
            }}
            style={{ padding: '7px 14px', fontSize: 13 }}
          >
            <ChevronLeft size={16} />
            <span>Previous Step</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            disabled={!stepData.nextStepOrder || (!stepCompleted && !stepData.isCompleted)}
            onClick={() => {
              if (stepData.nextStepOrder) {
                setSearchParams({ step: stepData.nextStepOrder, tab: activeTab })
              }
            }}
            style={{ padding: '7px 14px', fontSize: 13 }}
          >
            <span>Next Step</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Step Tabs: A. Concept, B. Practical Example, C. Visual Animation, D. Practice */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          background: '#ffffff',
          borderRadius: 14,
          padding: 5,
          border: '1px solid var(--border)',
          marginBottom: 24,
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <button
          type="button"
          onClick={() => handleTabChange('concept')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: activeTab === 'concept' ? 700 : 500,
            background: activeTab === 'concept' ? 'var(--navy-900)' : 'transparent',
            color: activeTab === 'concept' ? '#ffffff' : 'var(--text-soft)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          A. Concept
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('example')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: activeTab === 'example' ? 700 : 500,
            background: activeTab === 'example' ? 'var(--navy-900)' : 'transparent',
            color: activeTab === 'example' ? '#ffffff' : 'var(--text-soft)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          B. Practical Example
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('visual')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: activeTab === 'visual' ? 700 : 500,
            background: activeTab === 'visual' ? 'var(--navy-900)' : 'transparent',
            color: activeTab === 'visual' ? '#ffffff' : 'var(--text-soft)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          C. Visual Simulation
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('practice')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.5,
            fontWeight: activeTab === 'practice' ? 700 : 500,
            background: activeTab === 'practice' ? 'var(--navy-900)' : 'transparent',
            color: activeTab === 'practice' ? '#ffffff' : 'var(--text-soft)',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          D. Practice Questions ({stepData.practiceQuestions?.length || 0})
        </button>
      </div>

      {/* TAB A: CONCEPT */}
      {activeTab === 'concept' && (
        <Card style={{ padding: '32px 36px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="pill blue" style={{ fontSize: 11.5 }}>
              Core Theoretical Concept
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Estimated time: {stepData.duration || '1h 30m'}
            </span>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 16 }}>
            {stepData.concept}
          </h2>

          <div style={{ fontSize: 15, lineHeight: 1.7, color: 'var(--text-soft)', marginBottom: 24 }}>
            {stepData.content?.concept}
          </div>

          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 12 }}>
            Fundamental Principles & Invariants:
          </h3>

          <ul style={{ margin: 0, paddingLeft: 20, color: 'var(--text-soft)', fontSize: 14.5, lineHeight: 1.8 }}>
            {(stepData.content?.keyPoints || []).map((pt, idx) => (
              <li key={idx} style={{ marginBottom: 6 }}>
                {pt}
              </li>
            ))}
          </ul>

          <div
            style={{
              marginTop: 32,
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleTabChange('example')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <span>Next: Practical Example</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </Card>
      )}

      {/* TAB B: PRACTICAL EXAMPLE */}
      {activeTab === 'example' && (
        <Card style={{ padding: '32px 36px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span className="pill navy" style={{ fontSize: 11.5 }}>
              Concrete Implementation
            </span>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 16 }}>
            Code Example & Execution Trace
          </h2>

          <div
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              borderRadius: 12,
              padding: '20px 24px',
              fontFamily: 'var(--mono)',
              fontSize: 13.5,
              lineHeight: 1.6,
              overflowX: 'auto',
              marginBottom: 24,
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <pre style={{ margin: 0 }}>{stepData.content?.example}</pre>
          </div>

          <div
            style={{
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleTabChange('concept')}
            >
              <ChevronLeft size={16} />
              <span>Back to Concept</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleTabChange('visual')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <span>Next: Visual Animation</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </Card>
      )}

      {/* TAB C: VISUAL EXPLANATION & ANIMATION */}
      {activeTab === 'visual' && (
        <Card style={{ padding: '32px 36px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="pill blue" style={{ fontSize: 11.5 }}>
                  Interactive Algorithm Simulator
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Step {simStep + 1} of {simSteps.length || 3}
                </span>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--navy-900)', marginTop: 4 }}>
                {simData.title || 'Dynamic Binary Search Pointer Stepper'}
              </h2>
            </div>

            {/* Animation Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSimStep((prev) => Math.max(0, prev - 1))}
                disabled={simStep === 0}
                style={{ padding: '6px 12px', fontSize: 12.5 }}
              >
                Previous Step
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setSimPlaying(!simPlaying)}
                style={{ padding: '6px 14px', fontSize: 12.5 }}
              >
                {simPlaying ? 'Pause Animation' : 'Play Simulation'}
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSimStep(0)
                  setSimPlaying(false)
                }}
                style={{ padding: '6px 10px' }}
                title="Reset simulation"
              >
                <RotateCcw size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Visual Array & Pointer Display */}
          <div
            style={{
              background: '#070c18',
              borderRadius: 16,
              padding: '36px 28px',
              border: '1px solid rgba(255,255,255,0.1)',
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28,
                color: '#ffffff',
                fontSize: 13,
              }}
            >
              <div>
                Target Value to Locate: <strong style={{ color: '#60a5fa', fontSize: 16 }}>{simData.target || 23}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                  LOW: {currentSimState.low}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#3b82f6' }} />
                  MID: {currentSimState.mid}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  HIGH: {currentSimState.high}
                </span>
              </div>
            </div>

            {/* Array Cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${simArray.length}, minmax(0, 1fr))`,
                gap: 8,
                marginBottom: 32,
              }}
            >
              {simArray.map((val, idx) => {
                const isMid = idx === currentSimState.mid
                const isLow = idx === currentSimState.low
                const isHigh = idx === currentSimState.high
                const isInSearchSpace = idx >= currentSimState.low && idx <= currentSimState.high
                const isMatched = val === (simData.target || 23) && isMid

                return (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    {/* Upper Indicator */}
                    <div style={{ height: 22, fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
                      {isMid && <span style={{ color: '#60a5fa' }}>MID</span>}
                    </div>

                    {/* Array Box */}
                    <div
                      style={{
                        padding: '14px 4px',
                        borderRadius: 10,
                        fontWeight: 800,
                        fontSize: 16,
                        fontFamily: 'var(--mono)',
                        background: isMatched
                          ? 'rgba(34, 197, 94, 0.3)'
                          : isMid
                          ? 'rgba(59, 130, 246, 0.35)'
                          : isInSearchSpace
                          ? '#1e293b'
                          : '#0b1120',
                        color: isMatched
                          ? '#4ade80'
                          : isMid
                          ? '#93c5fd'
                          : isInSearchSpace
                          ? '#ffffff'
                          : '#475569',
                        border: isMatched
                          ? '2px solid #22c55e'
                          : isMid
                          ? '2px solid #3b82f6'
                          : '1px solid rgba(255,255,255,0.08)',
                        transition: 'all 0.25s ease',
                      }}
                    >
                      {val}
                    </div>

                    {/* Lower Pointer Labels */}
                    <div style={{ marginTop: 8, height: 20, fontSize: 11, fontWeight: 700 }}>
                      {isLow && <span style={{ color: '#22c55e', marginRight: 2 }}>LOW</span>}
                      {isHigh && <span style={{ color: '#ef4444' }}>HIGH</span>}
                      {!isLow && !isHigh && <span style={{ color: '#475569' }}>[{idx}]</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Live Explanation Callout */}
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 12,
                padding: '16px 20px',
                color: '#e2e8f0',
                fontSize: 14,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: '#60a5fa' }}>Step {simStep + 1} Logic: </strong>
              {currentSimState.explanation}
            </div>
          </div>

          <div
            style={{
              paddingTop: 20,
              borderTop: '1px solid var(--border)',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleTabChange('example')}
            >
              <ChevronLeft size={16} />
              <span>Back to Example</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleTabChange('practice')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
            >
              <span>Next: Practice Questions</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </Card>
      )}

      {/* TAB D: PRACTICE QUESTIONS */}
      {activeTab === 'practice' && (
        <div className="stack gap-md">
          {/* Step Completion Banner (if completed) */}
          {stepCompleted && (
            <div
              className="card animate-rise"
              style={{
                padding: '24px 28px',
                borderRadius: 16,
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <CheckCircle2 size={36} color="var(--success)" />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#166534', margin: 0 }}>
                    🎉 Step Completed!
                  </h3>
                  <div style={{ fontSize: 13.5, color: '#15803d', marginTop: 3 }}>
                    You successfully completed {stepData.title}. All progress metrics and topic mastery have been updated.
                  </div>
                </div>
              </div>

              {stepData.nextStepOrder && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setSearchParams({ step: stepData.nextStepOrder, tab: 'concept' })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
                >
                  <span>Continue to Next Step</span>
                  <ArrowRight size={16} />
                </button>
              )}
            </div>
          )}

          {/* List of Practice Questions with Structured Metadata */}
          {(stepData.practiceQuestions || []).map((q, idx) => {
            const isSubmitted = Boolean(submittedAnswers[q.questionId])
            const qFeedback = feedback[q.questionId]
            const selected = selectedAnswers[q.questionId]

            return (
              <Card key={q.questionId} style={{ padding: '28px 32px', borderRadius: 16 }}>
                {/* Question Header & Structured Metadata Chips */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: 8,
                    marginBottom: 14,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        background: 'var(--navy-900)',
                        color: '#ffffff',
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                      ID: {q.questionId}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Pill tone="blue" style={{ fontSize: 11 }}>
                      {q.topic}
                    </Pill>
                    <Pill tone="neutral" style={{ fontSize: 11 }}>
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
                <h3
                  style={{
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: 'var(--navy-900)',
                    lineHeight: 1.5,
                    marginBottom: 18,
                  }}
                >
                  {q.question}
                </h3>

                {/* Options List */}
                <div className="stack gap-xs" style={{ marginBottom: 20 }}>
                  {(q.options || []).map((opt) => {
                    const isSelected = selected === opt
                    const isCorrectAnswer = isSubmitted && opt === q.correctAnswer
                    const isWrongSelection = isSubmitted && isSelected && !qFeedback?.isCorrect

                    return (
                      <div
                        key={opt}
                        onClick={() => handleSelectOption(q.questionId, opt)}
                        style={{
                          padding: '12px 18px',
                          borderRadius: 10,
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          cursor: isSubmitted ? 'default' : 'pointer',
                          background: isCorrectAnswer
                            ? '#f0fdf4'
                            : isWrongSelection
                            ? '#fef2f2'
                            : isSelected
                            ? 'var(--primary-subtle)'
                            : 'var(--surface-alt)',
                          border: isCorrectAnswer
                            ? '1.5px solid #22c55e'
                            : isWrongSelection
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

                {/* Submit Question Button */}
                {!isSubmitted ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={!selected}
                    onClick={() => handleSubmitAnswer(q)}
                    style={{ padding: '8px 18px', fontSize: 13, fontWeight: 700 }}
                  >
                    Submit Answer
                  </button>
                ) : (
                  <div
                    style={{
                      padding: '14px 18px',
                      borderRadius: 12,
                      background: qFeedback?.isCorrect ? '#f0fdf4' : '#fef2f2',
                      border: `1px solid ${qFeedback?.isCorrect ? '#bbf7d0' : '#fecaca'}`,
                      fontSize: 13.5,
                      lineHeight: 1.5,
                      color: qFeedback?.isCorrect ? '#166534' : '#991b1b',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                      {qFeedback?.isCorrect ? (
                        <>
                          <CheckCircle size={16} color="#16a34a" />
                          <span>Correct!</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle size={16} color="#dc2626" />
                          <span>Incorrect</span>
                        </>
                      )}
                    </div>
                    <div>{qFeedback?.explanation}</div>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
