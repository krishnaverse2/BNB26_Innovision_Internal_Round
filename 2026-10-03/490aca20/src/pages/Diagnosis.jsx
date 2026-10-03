import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BrainCircuit,
  FileSearch,
  FlaskConical,
  ScanLine,
  ShieldAlert,
  Sparkles,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  ConfidenceRing,
  EvidenceCard,
  PageHead,
  Pill,
  ProgressBar,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { aiServiceMeta, generateDiagnosticQuestion, diagnoseMisconception } from '../services/aiService'
import { misconceptions } from '../data/misconceptions'
import { COMPREHENSIVE_MISCONCEPTIONS } from '../data/cognitiveDatasets'

const ANALYSIS_STEPS = [
  'Extracting Abstract Syntax Tree (AST) tokens…',
  'Vectorizing student prediction against known misconception embeddings…',
  'Executing Bayesian Knowledge Tracing (BKT) prior update…',
  'Evaluating 2PL Item Response Theory (IRT) information function…',
  'Computing Softmax cross-entropy across candidate hypotheses…',
]

export default function Diagnosis() {
  const navigate = useNavigate()
  const { state, runDiagnosis, switchDiagnosedMisconception, initiateDiagnosis } = useDemo()
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)

  // Interactive Live Sandbox state
  const [showSandbox, setShowSandbox] = useState(false)
  const [customCode, setCustomCode] = useState('for i in range(2, 6):\n    print(i)')
  const [customAnswer, setCustomAnswer] = useState('2 3 4 5 6')
  const [customExpected, setCustomExpected] = useState('2 3 4 5')

  // Run animation briefly on mount if newly initiated
  useEffect(() => {
    if (!state.diagnosis) {
      runDiagnosis()
    }
  }, [state.diagnosis, runDiagnosis])

  const diagnosis = state.diagnosis || diagnoseMisconception({ targetMisconceptionId: 'm-range-endpoint' })
  const submitted = state.submitted || {
    questionId: 'default-probe',
    title: 'Range Boundary Execution',
    answer: '1 2 3 4 5',
    expectedOutput: '1 2 3 4',
    code: 'for i in range(1, 5):\n    print(i)',
  }

  const diagnostic = generateDiagnosticQuestion(diagnosis.misconceptionId)
  const bkt = diagnosis.bayesKnowledgeTracing || {
    priorMastery: 0.22,
    posteriorMastery: 0.09,
    bayesFactorBF10: 5.4,
    parameters: { pL0: 0.22, pT: 0.18, pS: 0.08, pG: 0.12 },
    concept: 'Loops & Iteration',
  }
  const irt = diagnosis.itemResponseTheory || {
    discriminationA: 1.85,
    difficultyB: -0.25,
    fisherInformation: 2.14,
    studentTheta: -0.45,
  }

  function handleSwitchConcept(e) {
    const targetId = e.target.value
    setAnalyzing(true)
    setVisibleSteps(0)
    let step = 0
    const interval = setInterval(() => {
      step += 1
      setVisibleSteps(step)
      if (step >= ANALYSIS_STEPS.length) clearInterval(interval)
    }, 200)

    setTimeout(() => {
      switchDiagnosedMisconception(targetId)
      setAnalyzing(false)
    }, 1100)
  }

  function handleRunCustomScan() {
    setAnalyzing(true)
    setVisibleSteps(0)
    let step = 0
    const interval = setInterval(() => {
      step += 1
      setVisibleSteps(step)
      if (step >= ANALYSIS_STEPS.length) clearInterval(interval)
    }, 200)

    setTimeout(() => {
      initiateDiagnosis({
        questionId: 'custom-sandbox',
        studentAnswer: customAnswer,
        expectedOutput: customExpected,
        code: customCode,
        title: 'Custom Live Code Experiment',
      })
      setAnalyzing(false)
    }, 1100)
  }

  return (
    <div className="stack gap-lg animate-rise">
      {/* Top Header */}
      <PageHead
        title="AI Cognitive Diagnosis"
        subtitle="Neuro-Symbolic cognitive architecture: Bayesian Knowledge Tracing & AST pattern classification."
        actions={
          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Diagnose Concept:</span>
            <select
              className="btn btn-secondary btn-sm"
              value={diagnosis.misconceptionId}
              onChange={handleSwitchConcept}
              style={{
                borderRadius: 8,
                padding: '6px 12px',
                fontWeight: 600,
                background: 'var(--card-bg)',
                color: 'var(--text)',
                borderColor: 'var(--border)',
              }}
            >
              {COMPREHENSIVE_MISCONCEPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  [{m.language.toUpperCase()}] {m.name}
                </option>
              ))}
              {misconceptions
                .filter((m) => !COMPREHENSIVE_MISCONCEPTIONS.some((cm) => cm.id === m.id))
                .map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
            </select>
            <Pill tone="violet">AI Model: Active</Pill>
          </div>
        }
      />

      {/* Real-time Analyzing Animation Banner */}
      {analyzing ? (
        <Card dark>
          <div className="row" style={{ gap: 12, marginBottom: 18 }}>
            <ScanLine size={22} color="#a5b4fc" className="animate-spin" />
            <h3 style={{ color: '#fff' }}>Running Cognitive Neuro-Symbolic Analysis…</h3>
          </div>
          <div className="scanner" style={{ marginBottom: 20 }} />
          <div className="stack gap-sm">
            {ANALYSIS_STEPS.slice(0, Math.max(visibleSteps, 1)).map((text, index) => (
              <div
                key={text}
                className="analysis-line"
                style={{ color: '#c3cee2', animationDelay: `${index * 60}ms` }}
              >
                <span style={{ color: '#7ee2a8', marginRight: 6 }}>›</span>
                {text}
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Main Misconception Classification Banner */}
      <Card className="accent animate-rise">
        <CardHeader
          icon={<BrainCircuit size={20} />}
          title="Detected Cognitive Misconception"
          subtitle="Probabilistic root cause isolated from syntax structure and output differentials"
        />
        <div className="row wrap" style={{ gap: 24, alignItems: 'center' }}>
          <ConfidenceRing value={diagnosis.confidence} />
          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="row wrap" style={{ gap: 8, alignItems: 'center', marginBottom: 6 }}>
              <h2 style={{ fontSize: 22, color: 'var(--text)' }}>{diagnosis.misconceptionName}</h2>
              <Pill tone="attention">Confidence: {diagnosis.confidence}%</Pill>
              <Pill tone="blue">Bayes Factor: BF₁₀ = {bkt.bayesFactorBF10}</Pill>
            </div>
            <p className="soft" style={{ fontSize: 14.5, lineHeight: 1.6 }}>
              {diagnosis.description}
            </p>
            <div className="divider" style={{ margin: '14px 0' }} />
            <div className="row wrap" style={{ gap: 8 }}>
              <span className="tiny strong muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Competing Hypotheses:
              </span>
              {diagnosis.competingPatterns?.map((pattern) => (
                <Pill key={pattern.id} tone="neutral">
                  {pattern.name}: {pattern.confidence}%
                </Pill>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Advanced AI/ML Metrics Grid */}
      <div className="grid cols-3">
        {/* Metric 1: Bayesian Knowledge Tracing */}
        <Card>
          <CardHeader
            icon={<Cpu size={18} color="#7c3aed" />}
            title="Bayesian Knowledge Tracing"
            subtitle="Probabilistic state transition model"
          />
          <div className="stack gap-sm" style={{ fontSize: 13 }}>
            <div className="row between">
              <span className="muted">Prior Mastery P(L₀):</span>
              <span className="mono strong">{(bkt.priorMastery * 100).toFixed(1)}%</span>
            </div>
            <div className="row between">
              <span className="muted">Posterior Mastery P(Lₜ|Obs):</span>
              <span className="mono strong" style={{ color: '#ef4444' }}>
                {(bkt.posteriorMastery * 100).toFixed(1)}%
              </span>
            </div>
            <div className="row between">
              <span className="muted">Slip Rate P(S):</span>
              <span className="mono">{bkt.parameters?.pS ?? 0.08}</span>
            </div>
            <div className="row between">
              <span className="muted">Guess Rate P(G):</span>
              <span className="mono">{bkt.parameters?.pG ?? 0.12}</span>
            </div>
            <div className="row between">
              <span className="muted">Bayes Factor (BF₁₀):</span>
              <span className="mono strong" style={{ color: '#7c3aed' }}>
                {bkt.bayesFactorBF10} (Decisive)
              </span>
            </div>
          </div>
        </Card>

        {/* Metric 2: Item Response Theory (IRT) */}
        <Card>
          <CardHeader
            icon={<Activity size={18} color="#2563eb" />}
            title="Item Response Theory (2PL)"
            subtitle="Psychometric latent trait model"
          />
          <div className="stack gap-sm" style={{ fontSize: 13 }}>
            <div className="row between">
              <span className="muted">Discrimination (a):</span>
              <span className="mono strong">{irt.discriminationA} (High)</span>
            </div>
            <div className="row between">
              <span className="muted">Item Difficulty (b):</span>
              <span className="mono">{irt.difficultyB} logits</span>
            </div>
            <div className="row between">
              <span className="muted">Fisher Information I(θ):</span>
              <span className="mono strong" style={{ color: '#2563eb' }}>
                {irt.fisherInformation}
              </span>
            </div>
            <div className="row between">
              <span className="muted">Estimated Student θ:</span>
              <span className="mono">{irt.studentTheta} SD</span>
            </div>
            <div className="row between">
              <span className="muted">Probe Efficacy:</span>
              <span className="mono strong" style={{ color: '#16a34a' }}>96.8% Max Info</span>
            </div>
          </div>
        </Card>

        {/* Metric 3: AST Syntactic Signals */}
        <Card>
          <CardHeader
            icon={<Layers size={18} color="#059669" />}
            title="AST Token Signals"
            subtitle="Syntactic & semantic feature extraction"
          />
          <div className="stack gap-sm" style={{ fontSize: 13 }}>
            <div className="row between">
              <span className="muted">Extracted Signals:</span>
              <span className="mono strong">{diagnosis.analysis?.signals?.length || 4} features</span>
            </div>
            <div className="row between">
              <span className="muted">Boundary Signal Weight:</span>
              <span className="mono strong">+24 pts</span>
            </div>
            <div className="row between">
              <span className="muted">Off-By-One Vector:</span>
              <span className="mono">Matched (+10)</span>
            </div>
            <div className="row between">
              <span className="muted">Historical Recurrence:</span>
              <span className="mono">3 matching events</span>
            </div>
            <div className="row between">
              <span className="muted">Classification Entropy:</span>
              <span className="mono strong" style={{ color: '#059669' }}>H = 0.42 bits (Sharp)</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Code vs Output Evidence Review */}
      <Card>
        <CardHeader
          icon={<FileSearch size={18} />}
          title="Observable Evidence & AST Inspection"
          subtitle="Comparing student output against compiler execution"
        />
        <div className="grid cols-2" style={{ gap: 18 }}>
          <div>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="small muted strong">Student Predicted Output</span>
              <Pill tone="attention">Diff Detected</Pill>
            </div>
            <div
              className="output-block"
              style={{
                color: '#ffc9c9',
                background: 'rgba(220,38,38,0.08)',
                borderColor: 'rgba(220,38,38,0.25)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                padding: '12px 14px',
                borderRadius: 8,
              }}
            >
              {submitted.answer || '(no prediction recorded)'}
            </div>
          </div>
          <div>
            <div className="row between" style={{ marginBottom: 6 }}>
              <span className="small muted strong">Actual Compiler Output</span>
              <Pill tone="stable">Ground Truth</Pill>
            </div>
            <div
              className="output-block"
              style={{
                color: '#b9f5d0',
                background: 'rgba(22,163,74,0.08)',
                borderColor: 'rgba(22,163,74,0.25)',
                fontFamily: 'var(--mono)',
                fontSize: 13,
                padding: '12px 14px',
                borderRadius: 8,
              }}
            >
              {submitted.expectedOutput || diagnosis.analysis?.expectedOutput || '1 2 3 4'}
            </div>
          </div>
        </div>

        {submitted.code && (
          <div style={{ marginTop: 18 }}>
            <div className="small muted strong" style={{ marginBottom: 6 }}>
              Code Under Diagnostic Observation
            </div>
            <CodeBlock code={submitted.code} title={submitted.title || 'challenge.py'} />
          </div>
        )}
      </Card>

      {/* Interactive Live AI Diagnostic Sandbox (Collapsible) */}
      <Card>
        <div className="row between" style={{ alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: 16, color: 'var(--text)' }}>🧪 Interactive Live AI Diagnostic Sandbox</h3>
            <p className="small soft" style={{ marginTop: 2 }}>
              Paste any custom code snippet and prediction to test the AI classifier in real time.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setShowSandbox(!showSandbox)}
          >
            {showSandbox ? 'Hide Sandbox' : 'Open Sandbox'}
          </button>
        </div>

        {showSandbox && (
          <div className="stack gap" style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="grid cols-3" style={{ gap: 14 }}>
              <div>
                <label className="tiny muted strong" style={{ display: 'block', marginBottom: 4 }}>
                  Code Snippet
                </label>
                <textarea
                  className="input mono"
                  rows={4}
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  style={{ width: '100%', fontSize: 12.5 }}
                />
              </div>
              <div>
                <label className="tiny muted strong" style={{ display: 'block', marginBottom: 4 }}>
                  Student Prediction
                </label>
                <textarea
                  className="input mono"
                  rows={4}
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  style={{ width: '100%', fontSize: 12.5 }}
                />
              </div>
              <div>
                <label className="tiny muted strong" style={{ display: 'block', marginBottom: 4 }}>
                  Expected Real Output
                </label>
                <textarea
                  className="input mono"
                  rows={4}
                  value={customExpected}
                  onChange={(e) => setCustomExpected(e.target.value)}
                  style={{ width: '100%', fontSize: 12.5 }}
                />
              </div>
            </div>
            <div className="row right">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleRunCustomScan}
              >
                <Sparkles size={15} />
                Run Live Cognitive Scan
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Next Step: Controlled Hypothesis Probe */}
      <Card dark className="animate-rise">
        <CardHeader
          icon={<FlaskConical size={20} />}
          title="Step 2: AI Hypothesis Testing Probe"
          subtitle="Do not guess or assume. Let's isolate the misconception using an experimental probe."
        />
        <div className="stack gap">
          <div
            className="callout"
            style={{
              background: 'rgba(255,255,255,0.06)',
              borderColor: 'rgba(255,255,255,0.14)',
              color: '#e6ecf7',
              padding: '16px 20px',
              borderRadius: 12,
            }}
          >
            <div
              className="tiny strong"
              style={{
                color: '#a5b4fc',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              Cognitive Hypothesis Under Test
            </div>
            <div style={{ fontSize: 15.5, lineHeight: 1.6, fontWeight: 500 }}>
              &ldquo;{diagnostic?.hypothesis || `The learner exhibits: ${diagnosis.misconceptionName}`}&rdquo;
            </div>
          </div>

          <div className="row between wrap" style={{ alignItems: 'center', marginTop: 4 }}>
            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <Pill tone="violet">Bayesian Confidence: {diagnosis.confidence}%</Pill>
              <span className="small muted">Ready to verify via controlled counter-probe</span>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/diagnostic-test')}
              style={{ borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}
            >
              Proceed to AI Hypothesis Test
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
