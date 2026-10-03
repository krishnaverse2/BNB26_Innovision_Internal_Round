import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  FlaskConical,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Cpu,
  Brain,
  Layers,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  PageHead,
  Pill,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { generateDiagnosticQuestion } from '../services/aiService'

export default function DiagnosticTest() {
  const navigate = useNavigate()
  const { state, recordDiagnosticAnswer } = useDemo()
  const [selected, setSelected] = useState(state.diagnosticResult?.selectedKey || null)

  const misconceptionId = state.diagnosis?.misconceptionId || 'm-range-endpoint'
  const diagnostic = generateDiagnosticQuestion(misconceptionId) || {
    question: 'What will this Python code print?',
    code: 'for i in range(2, 6):\n    print(i, end=" ")',
    hypothesis: 'The student may believe that range() includes the ending number.',
    options: [
      { key: 'A', text: '2 3 4 5', correct: true, detail: 'Correct! Range stops before 6.' },
      { key: 'B', text: '2 3 4 5 6', correct: false, detail: 'Boundary error: includes stop value.' },
      { key: 'C', text: '1 2 3 4 5', correct: false, detail: '0-index offset misconception.' },
      { key: 'D', text: '2 3 4', correct: false, detail: 'Premature loop exit.' },
    ],
  }

  const result = selected ? state.diagnosticResult : null

  function choose(key) {
    setSelected(key)
    recordDiagnosticAnswer(key)
  }

  return (
    <div className="stack gap-lg animate-rise">
      <PageHead
        title="AI Hypothesis Verification Test"
        subtitle="Controlled experimental counter-probe: Separates 'got it right by luck' from genuine conceptual mastery."
        actions={
          <div className="row wrap" style={{ gap: 8 }}>
            <Pill tone="violet">Step 2: Empirical Verification</Pill>
            <Pill tone="blue">Bayesian Probe</Pill>
          </div>
        }
      />

      {/* Main Diagnostic Question Card */}
      <Card>
        <CardHeader
          icon={<FlaskConical size={20} color="#7c3aed" />}
          title={diagnostic.question}
          subtitle={`Testing Hypothesis: “${diagnostic.hypothesis}”`}
        />

        {diagnostic.code && (
          <div style={{ marginBottom: 18 }}>
            <CodeBlock code={diagnostic.code} title="diagnostic_probe.py" />
          </div>
        )}

        <div className="stack" style={{ gap: 10 }}>
          <div className="tiny muted strong" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select the exact output produced by the code above:
          </div>

          <div className="option-list">
            {diagnostic.options?.map((option) => {
              const isSelected = selected === option.key
              let className = 'option'
              if (result) {
                if (isSelected) className += option.correct ? ' correct' : ' wrong'
              } else if (isSelected) {
                className += ' selected'
              }

              return (
                <button
                  key={option.key}
                  type="button"
                  className={className}
                  disabled={Boolean(result)}
                  onClick={() => choose(option.key)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 10,
                  }}
                >
                  <div className="row" style={{ gap: 12, alignItems: 'center' }}>
                    <span className="option-key">{option.key}</span>
                    <span className="mono" style={{ fontSize: 14 }}>
                      {option.text}
                    </span>
                  </div>

                  {result && (
                    <div>
                      {option.correct ? (
                        <Pill tone="stable">Correct Target</Pill>
                      ) : isSelected ? (
                        <Pill tone="attention">Misconception Exhibited</Pill>
                      ) : null}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* AI Evaluation & Bayesian Likelihood Feedback */}
      {result ? (
        <Card className={result.supported ? 'flat animate-rise' : 'accent animate-rise'}>
          <div className="stack gap">
            <div className="row between wrap" style={{ gap: 12 }}>
              <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                {result.supported ? (
                  <CheckCircle2 size={24} color="#16a34a" />
                ) : (
                  <XCircle size={24} color="#dc2626" />
                )}
                <div>
                  <h3 style={{ fontSize: 18 }}>
                    {result.supported
                      ? 'Target Rule Verified — Misconception Overcome'
                      : 'Cognitive Misconception Confirmed'}
                  </h3>
                  <div className="small soft" style={{ marginTop: 2 }}>
                    {result.selectedDetail || 'Empirical evidence recorded in student Bayesian Knowledge Tracing profile.'}
                  </div>
                </div>
              </div>

              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <span className="tiny muted strong">Bayesian Confidence:</span>
                <Pill tone="neutral">{result.confidenceBefore}%</Pill>
                <ArrowRight size={15} className="muted" />
                <Pill tone={result.supported ? 'stable' : 'attention'}>
                  {result.confidenceAfter}%
                </Pill>
              </div>
            </div>

            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)' }}>
              {result.message}
            </p>

            <div
              className={`callout ${result.supported ? 'success' : 'warning'}`}
              style={{ borderRadius: 10, padding: '12px 16px' }}
            >
              {result.supported ? (
                <div>
                  <strong>Bayesian Update:</strong> Confidence in student mastery increased to{' '}
                  <strong>{result.confidenceAfter}%</strong>. Proceed to the multi-modal intervention to reinforce the mental model across varied contexts.
                </div>
              ) : (
                <div>
                  <strong>Cognitive Root Cause Isolated:</strong> The student selected the option reflecting the specific cognitive boundary trap. The personalized intervention will now present a visual stepper and contrastive counterexamples.
                </div>
              )}
            </div>

            <div className="row wrap between" style={{ gap: 12, marginTop: 8 }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
              >
                <RotateCcw size={15} />
                Try Another Option
              </button>

              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/intervention')}
                style={{ borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                Continue to Personalized Intervention
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flat">
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <Cpu size={18} color="#7c3aed" />
            <p className="small soft" style={{ margin: 0 }}>
              Select an option above to trigger the real-time Bayesian hypothesis test. Re:Learn computes the likelihood ratio to determine if this error was a slip or an entrenched misconception.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
