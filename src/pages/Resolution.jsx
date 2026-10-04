import { useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle2, MoveRight, RotateCcw, Trophy, Award, Sparkles } from 'lucide-react'
import {
  Card,
  CardHeader,
  PageHead,
  Pill,
  ProgressBar,
  PrototypeNote,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getMisconception } from '../data/misconceptions'
import { stressTestStages } from '../data/questions'
import { evaluateResolution, understandingBreakdown } from '../services/aiService'

export default function Resolution() {
  const navigate = useNavigate()
  const { state } = useDemo()

  const results = state.stressTestResults || {}
  const resolution = state.resolution || evaluateResolution(results)
  const breakdown = state.breakdown?.length ? state.breakdown : understandingBreakdown(results)
  const misconception = getMisconception(state.diagnosis?.misconceptionId || 'm-range-endpoint')

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Resolution"
        subtitle="What changed, and the evidence Re:Learn used to decide it."
        actions={
          <Pill tone={resolution.stable ? 'stable' : 'developing'}>
            Misconception Resolution: {resolution.resolutionLabel}
          </Pill>
        }
      />

      <Card className="flat">
        <div className="before-after">
          <div className="ba-panel before">
            <div className="tiny strong" style={{ letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9b1c1c' }}>
              Before
            </div>
            <div style={{ fontSize: 34, margin: '10px 0 6px' }}>🔴</div>
            <div className="strong" style={{ fontSize: 16 }}>
              {misconception?.name || 'Range Endpoint Confusion'}
            </div>
            <div className="small" style={{ color: '#9b1c1c', marginTop: 6 }}>
              Loops at 72% · Developing
            </div>
          </div>

          <div className="ba-arrow">
            <MoveRight size={30} />
          </div>

          <div className="ba-panel after">
            <div className="tiny strong" style={{ letterSpacing: '0.09em', textTransform: 'uppercase', color: '#14532d' }}>
              After
            </div>
            <div style={{ fontSize: 34, margin: '10px 0 6px' }}>🟢</div>
            <div className="strong" style={{ fontSize: 16 }}>
              {resolution.stable ? 'Concept Stable' : 'Still Developing'}
            </div>
            <div className="small" style={{ color: '#14532d', marginTop: 6 }}>
              Loops at {resolution.stable ? '91%' : '72%'} ·{' '}
              {resolution.passedCount}/{resolution.totalCount} evidence types
            </div>
          </div>
        </div>
      </Card>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<CheckCircle2 size={18} />}
            title="Evidence Matrix"
            subtitle="Each row is a different way of proving the same understanding"
          />
          <div className="data-list">
            {stressTestStages.map((stage) => {
              const result = results[stage.id]
              return (
                <div className="data-row" key={stage.id}>
                  <span
                    className="option-key"
                    style={{
                      background: result?.passed ? 'var(--stable-bg)' : 'var(--attention-bg)',
                      color: result?.passed ? 'var(--stable)' : 'var(--attention)',
                      borderColor: 'transparent',
                    }}
                  >
                    {result?.passed ? '✓' : '✗'}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div className="data-row-title">{stage.label}</div>
                    <div className="data-row-sub">{result?.reason || 'Not attempted'}</div>
                  </div>
                  <Pill tone={result?.passed ? 'stable' : 'attention'}>
                    {result?.passed ? '✓ Passed' : 'Not passed'}
                  </Pill>
                </div>
              )
            })}
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={<Trophy size={18} />}
            title="Understanding Breakdown"
            subtitle="Derived from which evidence types passed"
          />
          <div>
            {breakdown.map((entry) => (
              <ProgressBar
                key={entry.label}
                name={entry.label}
                value={entry.value}
                tone={entry.value >= 85 ? 'stable' : entry.value >= 60 ? 'developing' : 'attention'}
                showStatus={false}
              />
            ))}
          </div>
          <div className="divider" />
          <PrototypeNote>
            Scores come from the prototype rubric in
            <span className="mono"> evaluateResolution()</span>, not from a trained model.
          </PrototypeNote>
        </Card>
      </div>

      <Card dark>
        <div className="stack gap">
          <h3 style={{ color: '#fff' }}>{resolution.message}</h3>
          <div className="row wrap" style={{ gap: 10 }}>
            <Pill tone={resolution.stable ? 'stable' : 'developing'}>
              Misconception Resolution: {resolution.resolutionLabel}
            </Pill>
            <Pill tone="dark">{resolution.distinctEvidenceTypes} distinct evidence types</Pill>
            {state.completedAt ? (
              <Pill tone="dark">
                Completed {new Date(state.completedAt).toLocaleString()}
              </Pill>
            ) : null}
          </div>

          <div className="row wrap" style={{ gap: 10, marginTop: 6 }}>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => navigate('/misconceptions')}
            >
              View Updated Learning Profile
              <ArrowRight size={17} />
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-lg"
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
            {!resolution.stable ? (
              <button
                type="button"
                className="btn btn-soft btn-lg"
                onClick={() => navigate('/stress-test')}
              >
                <RotateCcw size={16} />
                Retake stability check
              </button>
            ) : null}
          </div>

          {!resolution.stable ? (
            <div
              className="callout"
              style={{
                background: 'rgba(255,255,255,0.06)',
                borderColor: 'rgba(255,255,255,0.14)',
                color: '#e6ecf7',
              }}
            >
              Re:Learn will not mark a misconception resolved on partial evidence. Failed
              stages are listed above — retake them and the resolution is recalculated.
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
