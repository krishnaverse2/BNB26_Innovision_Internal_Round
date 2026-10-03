import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  FileSearch,
  FlaskConical,
  ScanLine,
  ShieldAlert,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  ConfidenceRing,
  EvidenceCard,
  PageHead,
  Pill,
  PrototypeNote,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { aiServiceMeta, generateDiagnosticQuestion } from '../services/aiService'
import { getQuestion } from '../data/questions'

const ANALYSIS_STEPS = [
  'Loading your prediction…',
  'Comparing it with the actual output…',
  'Matching the difference against known misconception patterns…',
  'Checking your previous attempts for the same boundary error…',
  'Scoring confidence for each candidate pattern…',
]

const EVIDENCE_LABELS = [
  'Student Prediction',
  'Code Structure',
  'Actual Output',
  'Previous Attempts',
]

export default function Diagnosis() {
  const navigate = useNavigate()
  const { state, runDiagnosis } = useDemo()
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [analyzing, setAnalyzing] = useState(!state.diagnosis)

  useEffect(() => {
    if (!analyzing) return undefined

    let step = 0
    const interval = window.setInterval(() => {
      step += 1
      setVisibleSteps(step)
      if (step >= ANALYSIS_STEPS.length) window.clearInterval(interval)
    }, 420)

    const timeout = window.setTimeout(() => {
      runDiagnosis()
      setAnalyzing(false)
    }, ANALYSIS_STEPS.length * 420 + 500)

    return () => {
      window.clearInterval(interval)
      window.clearTimeout(timeout)
    }
    // Runs once per mount; runDiagnosis is safe to repeat.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!state.submitted) return <Navigate to="/coding-lab" replace />

  const question = getQuestion(state.submitted.questionId)
  const diagnosis = state.diagnosis

  if (analyzing || !diagnosis) {
    return (
      <div className="stack gap-lg">
        <PageHead
          title="AI Diagnosis"
          subtitle="Re:Learn is working out why the prediction differed, not just that it differed."
        />
        <Card dark>
          <div className="row" style={{ gap: 12, marginBottom: 18 }}>
            <ScanLine size={20} color="#a5b4fc" />
            <h3 style={{ color: '#fff' }}>Analyzing your response...</h3>
          </div>
          <div className="scanner" style={{ marginBottom: 20 }} />
          <div className="stack gap-sm">
            {ANALYSIS_STEPS.slice(0, Math.max(visibleSteps, 1)).map((text, index) => (
              <div key={text} className="analysis-line" style={{ color: '#c3cee2', animationDelay: `${index * 60}ms` }}>
                <span style={{ color: '#7ee2a8' }}>›</span>
                {text}
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader title="Your submission" />
          <div className="grid cols-2">
            <div>
              <div className="small muted strong" style={{ marginBottom: 6 }}>
                Student prediction
              </div>
              <OutputBlockLike value={state.submitted.answer} />
            </div>
            {question ? (
              <div>
                <div className="small muted strong" style={{ marginBottom: 6 }}>
                  Code
                </div>
                <CodeBlock code={question.code} />
              </div>
            ) : null}
          </div>
        </Card>
      </div>
    )
  }

  const diagnostic = generateDiagnosticQuestion(diagnosis.misconceptionId)
  const priorAttempts = diagnosis.analysis?.priorAttempts ?? 0

  const evidenceDetails = [
    `You predicted “${state.submitted.answer.replace(/\n/g, ' ')}”.`,
    diagnosis.analysis?.signals.find((s) => s.id === 'code-uses-range')?.detail ||
      'The code shape was matched against known patterns.',
    `Python actually printed “${diagnosis.analysis?.expectedOutput.replace(/\n/g, ' ')}”.`,
    priorAttempts
      ? `${priorAttempts} earlier attempts show the same boundary error.`
      : 'No earlier attempts matched this pattern.',
  ]

  return (
    <div className="stack gap-lg">
      <PageHead
        title="AI Diagnosis"
        subtitle="The submitted answer, the real output, and the reasoning gap between them."
        actions={<Pill tone="violet">Diagnosis complete</Pill>}
      />

      <Card>
        <CardHeader icon={<FileSearch size={18} />} title="Submission review" />
        <div className="grid cols-2">
          <div>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="small muted strong">Student prediction</span>
              <Pill tone="attention">Incorrect</Pill>
            </div>
            <OutputBlockLike value={state.submitted.answer} />
          </div>
          <div>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="small muted strong">Actual output</span>
              <Pill tone="stable">Ground truth</Pill>
            </div>
            <OutputBlockLike value={diagnosis.analysis.expectedOutput} good />
          </div>
        </div>
        {question ? (
          <div style={{ marginTop: 18 }}>
            <CodeBlock code={question.code} title="submitted challenge" />
          </div>
        ) : null}
      </Card>

      <Card className="accent animate-rise">
        <CardHeader
          icon={<BrainCircuit size={18} />}
          title="Possible Misconception"
          subtitle="The reasoning pattern that best explains the difference"
        />
        <div className="row wrap" style={{ gap: 24, alignItems: 'center' }}>
          <ConfidenceRing value={diagnosis.confidence} />
          <div style={{ flex: 1, minWidth: 240 }}>
            <h2>{diagnosis.misconceptionName}</h2>
            <p className="soft" style={{ marginTop: 8, fontSize: 14 }}>
              {diagnosis.description}
            </p>
            <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
              <Pill tone="violet">Confidence: {diagnosis.confidence}%</Pill>
              {diagnosis.competingPatterns?.map((pattern) => (
                <Pill key={pattern.id} tone="neutral">
                  {pattern.name}: {pattern.confidence}%
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader title="Evidence" subtitle="Every signal the prototype engine used to reach this conclusion" />
        <div className="evidence-grid">
          {EVIDENCE_LABELS.map((label, index) => (
            <EvidenceCard
              key={label}
              label={label}
              detail={evidenceDetails[index]}
              delay={index * 90}
            />
          ))}
        </div>
        <div className="divider" />
        <div className="stack gap-sm">
          <div className="row" style={{ gap: 8 }}>
            <ShieldAlert size={15} className="muted" />
            <span className="strong small">{aiServiceMeta.engine}</span>
          </div>
          <PrototypeNote>{aiServiceMeta.note}</PrototypeNote>
          <div className="tiny muted mono">{diagnosis.rationale?.join(' · ')}</div>
        </div>
      </Card>

      {diagnostic ? (
        <Card dark>
          <CardHeader
            icon={<FlaskConical size={18} />}
            title="Verify the Diagnosis"
            subtitle="Re:Learn doesn't want to assume why you made the mistake. Let's test the hypothesis."
          />
          <div className="stack gap">
            <div
              className="callout"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.14)',
                color: '#e6ecf7',
              }}
            >
              <div className="tiny strong" style={{ color: '#9fb0cc', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
                Hypothesis
              </div>
              <div style={{ fontSize: 15 }}>&ldquo;{diagnostic.hypothesis}&rdquo;</div>
            </div>
            <div className="row between wrap">
              <Pill tone="violet">Confidence: {state.diagnosisConfidence}%</Pill>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/diagnostic-test')}
              >
                Test My Understanding
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </Card>
      ) : null}
    </div>
  )
}

function OutputBlockLike({ value, good = false }) {
  return (
    <div
      className="output-block"
      style={{
        color: good ? '#b9f5d0' : '#ffc9c9',
        background: good ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.07)',
        borderColor: good ? 'rgba(22,163,74,0.25)' : 'rgba(220,38,38,0.22)',
      }}
    >
      {value}
    </div>
  )
}
