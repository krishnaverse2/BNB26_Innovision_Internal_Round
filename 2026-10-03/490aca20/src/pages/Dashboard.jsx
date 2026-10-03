import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Brain,
  Flame,
  Gauge,
  Layers,
  Sparkles,
  Target,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react'
import { Card, CardHeader, Pill, ProgressBar, StatCard, InsightCard } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getMisconception, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'
import { FLOW_STEPS } from '../components/Sidebar'

function greeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

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
  const { student, summary, fingerprint, state, activeMisconceptions, isResolved } =
    useDemo()

  const primary = getMisconception(PRIMARY_MISCONCEPTION_ID)
  const confidence = state.diagnosisConfidence ?? 87
  const nextFocus = activeMisconceptions.find(
    (entry) => entry.misconceptionId !== PRIMARY_MISCONCEPTION_ID,
  )
  const nextMisconception = nextFocus ? getMisconception(nextFocus.misconceptionId) : null

  const journeyDone = JOURNEY.filter((step) =>
    step.stateKey ? Boolean(state[step.stateKey]) : step.done,
  ).length

  return (
    <div className="stack gap-lg">
      <div className="page-head">
        <h1>
          {greeting()}, {student.name} 👋
        </h1>
        <p className="subtitle">Understand concepts, not just answers.</p>
      </div>

      <div className="grid cols-4">
        <StatCard
          icon={<Gauge size={19} />}
          tone="blue"
          value={`${summary.overallUnderstanding}%`}
          label="Overall Understanding"
          delta={isResolved ? '↑ 4% after resolution' : 'Updated after each cycle'}
          deltaTone={isResolved ? 'stable' : 'neutral'}
        />
        <StatCard
          icon={<Layers size={19} />}
          tone="violet"
          value={summary.conceptsStable}
          label="Concepts Stable"
          delta={isResolved ? 'Loops now stable' : '12 concepts tracked'}
          deltaTone={isResolved ? 'stable' : 'neutral'}
        />
        <StatCard
          icon={<Target size={19} />}
          tone="attention"
          value={summary.activeMisconceptions}
          label="Active Misconceptions"
          delta={isResolved ? '↓ from 3 to 2' : '3 need attention'}
          deltaTone={isResolved ? 'stable' : 'attention'}
        />
        <StatCard
          icon={<Flame size={19} />}
          tone="developing"
          value={`${summary.streakDays} days`}
          label="Learning Streak"
          delta="Keep it going"
          deltaTone="developing"
        />
      </div>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<Brain size={18} />}
            title="Your Misconception Fingerprint"
            subtitle="Concept-level understanding, updated as misconceptions are resolved"
            actions={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/misconceptions')}
              >
                Details
                <ArrowRight size={15} />
              </button>
            }
          />
          <div>
            {fingerprint.map((entry) => (
              <ProgressBar
                key={entry.id}
                name={`${entry.icon} ${entry.name}`}
                value={entry.score}
                tone={entry.tone}
                status={`${entry.dot} ${entry.label}`}
              />
            ))}
          </div>
          <div className="divider" />
          <div className="row between wrap" style={{ gap: 10 }}>
            <span className="legend-row">
              <span className="legend-swatch" style={{ background: '#16a34a' }} />
              Stable (85%+)
            </span>
            <span className="legend-row">
              <span className="legend-swatch" style={{ background: '#f59e0b' }} />
              Developing (60–84%)
            </span>
            <span className="legend-row">
              <span className="legend-swatch" style={{ background: '#dc2626' }} />
              Needs attention (&lt;60%)
            </span>
          </div>
        </Card>

        <div className="stack gap">
          <Card dark className="animate-rise">
            <CardHeader
              icon={<Target size={18} />}
              title={isResolved ? 'Focus resolved' : 'Current Focus'}
              subtitle={
                isResolved
                  ? 'Your learning profile was updated after the stability check'
                  : 'The misconception Re:Learn wants to work on next'
              }
            />

            {isResolved ? (
              <div className="stack gap">
                <div className="row" style={{ gap: 10 }}>
                  <CheckCircle2 size={18} color="#7ee2a8" />
                  <span className="strong" style={{ color: '#fff' }}>
                    {primary.name}
                  </span>
                  <Pill tone="stable">🟢 Concept Stable</Pill>
                </div>
                <p className="small" style={{ color: '#a9b6cf' }}>
                  Loops moved from 72% to 91% and active misconceptions dropped from 3 to 2.
                </p>
                {nextMisconception ? (
                  <div className="callout" style={{ background: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.12)', color: '#dfe7f5' }}>
                    <div className="strong" style={{ fontSize: 13, marginBottom: 4 }}>
                      Next suggested focus
                    </div>
                    {nextMisconception.name} — {nextFocus.confidence}% confidence
                  </div>
                ) : null}
                <button
                  type="button"
                  className="btn btn-primary btn-block"
                  onClick={() => navigate('/misconceptions')}
                >
                  View updated profile
                  <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="stack gap">
                <div className="row between" style={{ gap: 12 }}>
                  <div>
                    <div className="tiny" style={{ color: '#93a1bd', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                      Current Misconception
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', marginTop: 4 }}>
                      {primary.name}
                    </div>
                  </div>
                  <Pill tone="violet">{confidence}% confidence</Pill>
                </div>
                <p className="small" style={{ color: '#c3cee2' }}>
                  &ldquo;You may be treating the ending value of Python range() as
                  included.&rdquo;
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-block btn-lg"
                  onClick={() => navigate('/coding-lab')}
                >
                  Start Diagnosis
                  <ArrowRight size={17} />
                </button>
              </div>
            )}
          </Card>

          <Card>
            <CardHeader icon={<Sparkles size={18} />} title="AI Learning Insight" />
            <InsightCard
              icon={<TrendingUp size={18} />}
              title="Pattern detected across recent attempts"
            >
              Your recent attempts suggest that you understand loop syntax but sometimes
              confuse boundary conditions.
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="btn btn-soft btn-sm"
                  onClick={() => navigate('/misconceptions')}
                >
                  View Learning Analysis
                  <ArrowRight size={15} />
                </button>
              </div>
            </InsightCard>
          </Card>
        </div>
      </div>

      <Card className="flat">
        <CardHeader
          title="Your diagnosis journey"
          subtitle="Where you are in the Re:Learn cycle — progress survives a page refresh"
          actions={<Pill tone="neutral">{journeyDone} / {JOURNEY.length} steps</Pill>}
        />
        <div className="row wrap" style={{ gap: 8 }}>
          {JOURNEY.map((step) => {
            const done = step.stateKey ? Boolean(state[step.stateKey]) : step.done
            return (
              <span key={step.label} className={`stage ${done ? 'done' : ''}`}>
                <span className="stage-dot">{done ? '✓' : '•'}</span>
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
      </Card>
    </div>
  )
}
