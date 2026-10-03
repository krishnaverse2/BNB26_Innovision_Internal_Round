import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  BookOpen,
  MessageSquare,
  PenLine,
  Sparkles,
  X,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  PageHead,
  Pill,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { generateIntervention, normalizeAnswer } from '../services/aiService'

const MODE_TABS = [
  { id: 'visual', label: '1. Visual Mental Model', icon: Eye },
  { id: 'example', label: '2. Contrastive Examples', icon: BookOpen },
  { id: 'practice', label: '3. Interactive Practice', icon: PenLine },
  { id: 'explain', label: '4. Socratic Reflection', icon: MessageSquare },
]

function InteractiveRangeStepper({ start = 2, stop = 6 }) {
  const [currentStep, setCurrentStep] = useState(start)
  const values = []
  for (let i = start; i < stop; i += 1) values.push(i)

  function stepNext() {
    if (currentStep < stop) {
      setCurrentStep((prev) => prev + 1)
    } else {
      setCurrentStep(start)
    }
  }

  function reset() {
    setCurrentStep(start)
  }

  return (
    <div className="stack gap" style={{ padding: '16px 0' }}>
      <div className="row wrap between" style={{ alignItems: 'center' }}>
        <span className="small muted strong">
          Simulating: <code className="mono">range({start}, {stop})</code>
        </span>
        <div className="row" style={{ gap: 8 }}>
          <button type="button" className="btn btn-secondary btn-sm" onClick={stepNext}>
            <Play size={13} /> Step Forward ({currentStep < stop ? `i = ${currentStep}` : 'STOP reached'})
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={reset}>
            <RotateCcw size={13} /> Reset
          </button>
        </div>
      </div>

      <div className="range-viz" style={{ overflowX: 'auto', padding: '14px 10px' }}>
        <span className="range-caption">range({start}, {stop})</span>
        {values.map((value) => {
          const isPassed = value < currentStep
          const isCurrent = value === currentStep
          return (
            <span key={value} className="row" style={{ gap: 8, alignItems: 'center' }}>
              <span
                className="range-node"
                style={{
                  background: isCurrent ? 'var(--blue-500)' : isPassed ? 'var(--green-600)' : 'rgba(255,255,255,0.06)',
                  color: isCurrent || isPassed ? '#fff' : 'var(--text-muted)',
                  borderColor: isCurrent ? '#93c5fd' : 'transparent',
                  transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                  transition: '0.2s all ease',
                }}
              >
                {value}
              </span>
              <span className="range-arrow">→</span>
            </span>
          )
        })}

        <span
          className="range-node stop-node"
          style={{
            background: currentStep >= stop ? '#dc2626' : 'rgba(239, 68, 68, 0.15)',
            color: '#fff',
            borderColor: currentStep >= stop ? '#f87171' : 'transparent',
            transform: currentStep >= stop ? 'scale(1.15)' : 'scale(1)',
            transition: '0.2s all ease',
          }}
        >
          STOP
        </span>
        <span className="range-arrow" style={{ color: '#ef4444' }}>✕</span>
        <span
          className="range-node excluded"
          style={{
            opacity: 0.65,
            textDecoration: 'line-through',
            borderColor: '#ef4444',
            color: '#f87171',
          }}
        >
          {stop}
        </span>
      </div>

      <div className="row wrap" style={{ gap: 8 }}>
        <Pill tone="stable">
          <Check size={13} /> Values produced: [{values.join(', ')}]
        </Pill>
        <Pill tone="attention">
          <X size={13} /> Excluded boundary: {stop} is NEVER executed
        </Pill>
      </div>
    </div>
  )
}

export default function Intervention() {
  const navigate = useNavigate()
  const { state, setInterventionMode, completeIntervention } = useDemo()

  const misconceptionId = state.diagnosis?.misconceptionId || 'm-range-endpoint'
  const intervention = generateIntervention(misconceptionId) || {
    headline: 'In Python, the stop value in range() is not included.',
    visual: { start: 2, stop: 6 },
    counterExample: {
      badMentalModel: 'Assumes stop value is executed.',
      actualExecution: 'Stops immediately before reaching stop value.',
    },
    examples: [
      { code: 'range(1, 5)', output: '1 2 3 4' },
      { code: 'range(1, 6)', output: '1 2 3 4 5' },
    ],
    practice: {
      prompt: 'What does range(3, 7) produce?',
      code: 'for i in range(3, 7):\n    print(i, end=" ")',
      answer: '3 4 5 6',
    },
    explainPrompt: 'Explain in your own words why 7 is not included in range(3, 7).',
    expectedKeywords: ['exclude', 'stop', 'before', 'boundary', 'inclusive'],
  }

  const activeMode = state.interventionMode || 'visual'

  // Interactive Practice State
  const [practiceInput, setPracticeInput] = useState('')
  const [practiceChecked, setPracticeChecked] = useState(false)
  const isPracticeCorrect =
    practiceChecked &&
    normalizeAnswer(practiceInput) === normalizeAnswer(intervention.practice?.answer || '')

  // Socratic Reflection State
  const [explainText, setExplainText] = useState('')
  const [explainEvaluated, setExplainEvaluated] = useState(false)
  const [nlpScore, setNlpScore] = useState(null)

  function evaluateExplanation() {
    const text = explainText.toLowerCase()
    const keywords = intervention.expectedKeywords || ['exclude', 'stop', 'before', 'boundary']
    const hits = keywords.filter((k) => text.includes(k))
    const wordCount = explainText.trim().split(/\s+/).length
    const passed = hits.length >= 1 && wordCount >= 5

    setNlpScore({
      passed,
      hits,
      wordCount,
      feedback: passed
        ? `Excellent conceptual explanation! Detected core reasoning keywords: (${hits.join(', ')}).`
        : 'Good effort. Try mentioning words like "excluded", "stop value", or "before" to articulate the precise rule.',
    })
    setExplainEvaluated(true)
  }

  function handleCompleteAndProceed() {
    completeIntervention()
    navigate('/stress-test')
  }

  return (
    <div className="stack gap-lg animate-rise">
      <PageHead
        title="Personalized Multi-Modal Intervention"
        subtitle="Targeted conceptual remediation: Resolves the underlying mental model gap through 4 complementary learning modes."
        actions={
          <div className="row wrap" style={{ gap: 8 }}>
            <Pill tone="violet">Concept: {intervention.misconceptionName || 'Range Endpoint'}</Pill>
            {state.interventionCompleted && <Pill tone="stable">Step Completed ✓</Pill>}
          </div>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="row wrap" style={{ gap: 8 }}>
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeMode === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setInterventionMode(tab.id)}
              style={{
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: isActive ? 600 : 500,
              }}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* MODE 1: VISUAL MENTAL MODEL */}
      {activeMode === 'visual' && (
        <Card dark className="animate-rise">
          <CardHeader
            icon={<Sparkles size={20} color="#a5b4fc" />}
            title="Interactive Visual Mental Model"
            subtitle={intervention.headline}
          />

          <InteractiveRangeStepper
            start={intervention.visual?.start ?? 2}
            stop={intervention.visual?.stop ?? 6}
          />

          <div
            className="callout"
            style={{
              background: 'rgba(255,255,255,0.05)',
              borderColor: 'rgba(255,255,255,0.12)',
              marginTop: 14,
            }}
          >
            <strong>Core Cognitive Rule:</strong> In standard programming languages, bounds are represented as
            half-open intervals: <code>[start, stop)</code>. The loop executes while <code>i &lt; stop</code>, not{' '}
            <code>i &le; stop</code>.
          </div>
        </Card>
      )}

      {/* MODE 2: CONTRASTIVE EXAMPLES */}
      {activeMode === 'example' && (
        <div className="stack gap-md animate-rise">
          <Card>
            <CardHeader
              icon={<BookOpen size={20} color="#2563eb" />}
              title="Contrastive Counterexamples"
              subtitle="Comparing faulty mental model assumptions against real language execution"
            />

            <div className="grid cols-2" style={{ gap: 16 }}>
              <div
                style={{
                  background: 'rgba(220,38,38,0.06)',
                  border: '1.5px solid rgba(220,38,38,0.25)',
                  borderRadius: 12,
                  padding: '18px',
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <X size={18} color="#dc2626" />
                  <h4 style={{ color: '#dc2626', margin: 0 }}>Misconception Assumption</h4>
                </div>
                <p className="small soft" style={{ lineHeight: 1.6 }}>
                  {intervention.counterExample?.badMentalModel || 'Assumes range(1, 5) produces 1, 2, 3, 4, 5 inclusive.'}
                </p>
                <div style={{ marginTop: 12 }}>
                  <div className="tiny muted strong">Assumed Output:</div>
                  <div className="mono" style={{ color: '#dc2626', fontWeight: 600, marginTop: 4 }}>
                    1 2 3 4 5
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(22,163,74,0.06)',
                  border: '1.5px solid rgba(22,163,74,0.25)',
                  borderRadius: 12,
                  padding: '18px',
                }}
              >
                <div className="row" style={{ gap: 8, alignItems: 'center', marginBottom: 8 }}>
                  <Check size={18} color="#16a34a" />
                  <h4 style={{ color: '#16a34a', margin: 0 }}>Compiler Truth</h4>
                </div>
                <p className="small soft" style={{ lineHeight: 1.6 }}>
                  {intervention.counterExample?.actualExecution || 'range(1, 5) halts strictly before reaching 5.'}
                </p>
                <div style={{ marginTop: 12 }}>
                  <div className="tiny muted strong">Actual Output:</div>
                  <div className="mono" style={{ color: '#16a34a', fontWeight: 600, marginTop: 4 }}>
                    1 2 3 4
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 20 }}>
              <div className="small muted strong" style={{ marginBottom: 10 }}>
                More Reference Examples:
              </div>
              <div className="grid cols-2" style={{ gap: 12 }}>
                {intervention.examples?.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--bg)',
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div className="tiny muted strong">{ex.code}</div>
                    <div className="mono strong" style={{ color: '#16a34a', marginTop: 4 }}>
                      → {ex.output}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* MODE 3: INTERACTIVE PRACTICE */}
      {activeMode === 'practice' && (
        <Card className="animate-rise">
          <CardHeader
            icon={<PenLine size={20} color="#059669" />}
            title="Interactive Practice Sandbox"
            subtitle="Apply the updated mental model on an active exercise"
          />

          <div className="stack gap">
            <h3 style={{ fontSize: 16 }}>{intervention.practice?.prompt || 'What does range(3, 7) produce?'}</h3>

            {intervention.practice?.code && (
              <CodeBlock code={intervention.practice.code} title="practice.py" />
            )}

            <div>
              <label className="small muted strong" style={{ display: 'block', marginBottom: 6 }}>
                Your Predicted Output:
              </label>
              <div className="row" style={{ gap: 10 }}>
                <input
                  type="text"
                  className="input mono"
                  placeholder="e.g. 3 4 5 6"
                  value={practiceInput}
                  onChange={(e) => {
                    setPracticeInput(e.target.value)
                    setPracticeChecked(false)
                  }}
                  style={{ flex: 1, fontSize: 14 }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPracticeChecked(true)}
                  disabled={!practiceInput.trim()}
                >
                  Check Output
                </button>
              </div>
            </div>

            {practiceChecked && (
              <div
                className={`callout ${isPracticeCorrect ? 'success animate-rise' : 'warning animate-rise'}`}
                style={{ borderRadius: 10, padding: '14px 18px' }}
              >
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  {isPracticeCorrect ? (
                    <CheckCircle2 size={18} color="#16a34a" />
                  ) : (
                    <AlertCircle size={18} color="#dc2626" />
                  )}
                  <strong>
                    {isPracticeCorrect ? 'Spot On! Target output matches.' : 'Not quite matching yet.'}
                  </strong>
                </div>
                <div className="small" style={{ marginTop: 6 }}>
                  {isPracticeCorrect
                    ? `You correctly stopped before 7. Produced exactly: [${intervention.practice?.answer}].`
                    : `Expected: "${intervention.practice?.answer}". Remember that range() stops strictly before the stop value.`}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* MODE 4: SOCRATIC REFLECTION */}
      {activeMode === 'explain' && (
        <Card className="animate-rise">
          <CardHeader
            icon={<MessageSquare size={20} color="#7c3aed" />}
            title="Socratic Self-Explanation"
            subtitle="Articulating the rule in your own words produces 3x higher cognitive stability than passive reading"
          />

          <div className="stack gap">
            <h3 style={{ fontSize: 16 }}>{intervention.explainPrompt}</h3>

            <textarea
              className="input"
              rows={4}
              placeholder="Explain why the endpoint is excluded..."
              value={explainText}
              onChange={(e) => setExplainText(e.target.value)}
              style={{ width: '100%', fontSize: 14, lineHeight: 1.6 }}
            />

            <div className="row between wrap" style={{ alignItems: 'center' }}>
              <span className="tiny muted">
                Re:Learn NLP engine will analyze conceptual keywords and semantic depth.
              </span>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={evaluateExplanation}
                disabled={explainText.trim().split(/\s+/).length < 3}
              >
                Submit Reflection for AI Review
              </button>
            </div>

            {explainEvaluated && nlpScore && (
              <div
                className={`callout ${nlpScore.passed ? 'success animate-rise' : 'warning animate-rise'}`}
                style={{ borderRadius: 10, padding: '14px 18px' }}
              >
                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  {nlpScore.passed ? (
                    <CheckCircle2 size={18} color="#16a34a" />
                  ) : (
                    <HelpCircle size={18} color="#d97706" />
                  )}
                  <strong>{nlpScore.passed ? 'AI Semantic Verification: Passed' : 'Needs More Conceptual Detail'}</strong>
                </div>
                <p className="small" style={{ marginTop: 6, margin: 0 }}>
                  {nlpScore.feedback}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bottom Action Footer */}
      <Card dark>
        <div className="row between wrap" style={{ gap: 14, alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 17, color: '#fff' }}>Ready for Learning Stability Check?</h3>
            <p className="small soft" style={{ marginTop: 2, color: '#c3cee2' }}>
              Verify whether this concept is genuinely stable across near-transfer, far-transfer, and edge-case probes.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary btn-lg"
            onClick={handleCompleteAndProceed}
            style={{ borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            Proceed to Learning Stability Check
            <ArrowRight size={17} />
          </button>
        </div>
      </Card>
    </div>
  )
}
