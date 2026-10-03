import { useNavigate } from 'react-router-dom'
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { ArrowRight, Fingerprint, Repeat, Target } from 'lucide-react'
import {
  Card,
  CardHeader,
  PageHead,
  Pill,
  ProgressBar,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getMisconception, misconceptions, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'
import { recurringPatterns } from '../data/responses'
import { studentMastery, studentMisconceptions } from '../data/students'

export default function Misconceptions() {
  const navigate = useNavigate()
  const { fingerprint, isResolved } = useDemo()

  const radarData = fingerprint.map((entry) => ({
    concept: entry.name.replace(' and Indexing', ''),
    before: studentMastery.baseline[entry.id],
    now: entry.score,
  }))

  const tracked = studentMisconceptions.map((entry) => {
    const resolvedNow =
      entry.status === 'active' &&
      isResolved &&
      entry.misconceptionId === PRIMARY_MISCONCEPTION_ID
    return {
      ...entry,
      status: resolvedNow ? 'resolved' : entry.status,
      misconception: getMisconception(entry.misconceptionId),
    }
  })

  const maxPattern = Math.max(...recurringPatterns.map((p) => p.attempts))

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Your Misconception Fingerprint"
        subtitle="Concept-level understanding plus the specific reasoning patterns Re:Learn has tracked for you."
        actions={
          isResolved ? (
            <Pill tone="stable">Profile updated after resolution</Pill>
          ) : (
            <Pill tone="neutral">Live demo profile</Pill>
          )
        }
      />

      <div className="grid cols-4">
        {fingerprint.map((entry) => {
          const before = studentMastery.baseline[entry.id]
          const changed = entry.score !== before
          return (
            <Card key={entry.id} className="stat-card">
              <div className="row between" style={{ marginBottom: 12 }}>
                <span style={{ fontSize: 20 }}>{entry.icon}</span>
                <Pill tone={entry.tone}>
                  {entry.dot} {entry.label}
                </Pill>
              </div>
              <div className="stat-value">{entry.score}%</div>
              <div className="stat-label">{entry.name}</div>
              <div className="progress-track" style={{ marginTop: 14 }}>
                <div
                  className={`progress-fill ${entry.tone}`}
                  style={{ width: `${entry.score}%` }}
                />
              </div>
              {changed ? (
                <span className="stat-delta tone-stable">
                  ↑ from {before}% after intervention
                </span>
              ) : (
                <span className="stat-delta tone-neutral">No change this cycle</span>
              )}
            </Card>
          )
        })}
      </div>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<Fingerprint size={18} />}
            title="Concept radar"
            subtitle="Before the intervention versus now"
          />
          <div className="chart-box tall">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="76%">
                <PolarGrid stroke="#e6eaf2" />
                <PolarAngleAxis
                  dataKey="concept"
                  tick={{ fill: '#475569', fontSize: 12.5 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                />
                <Radar
                  name="Before intervention"
                  dataKey="before"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.18}
                  strokeDasharray="4 4"
                />
                <Radar
                  name="Now"
                  dataKey="now"
                  stroke="#7c3aed"
                  fill="#7c3aed"
                  fillOpacity={0.28}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e6eaf2',
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12.5 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={<Repeat size={18} />}
            title="Recurring Patterns"
            subtitle="Reasoning errors seen more than once"
          />
          <div className="stack gap-sm">
            {recurringPatterns.map((pattern) => (
              <div key={pattern.misconceptionId}>
                <ProgressBar
                  name={pattern.label}
                  value={pattern.attempts}
                  max={maxPattern}
                  suffix=" attempts"
                  tone={pattern.attempts >= 4 ? 'attention' : 'developing'}
                  showStatus={false}
                />
                <div className="tiny muted" style={{ marginTop: -6, marginBottom: 8 }}>
                  {getMisconception(pattern.misconceptionId)?.name}
                  {isResolved && pattern.misconceptionId === PRIMARY_MISCONCEPTION_ID
                    ? ' · resolved this session'
                    : ''}
                </div>
              </div>
            ))}
          </div>
          <div className="divider" />
          <p className="tiny muted">
            Attempt counts are calculated from the demo response log
            (<span className="mono">src/data/responses.js</span>), not from real learners.
            Bar width is scaled to {maxPattern} attempts.
          </p>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={<Target size={18} />}
          title="Tracked misconceptions"
          subtitle="Your learning profile, updated by each diagnosis cycle"
          actions={
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/interventions')}
            >
              Intervention library
              <ArrowRight size={15} />
            </button>
          }
        />
        <div className="data-list">
          {tracked.map((entry) => (
            <div className="data-row" key={entry.misconceptionId}>
              <div style={{ flex: 1 }}>
                <div className="data-row-title">{entry.misconception?.name}</div>
                <div className="data-row-sub">
                  {entry.misconception?.description}
                </div>
              </div>
              <Pill tone="neutral">{entry.attempts} attempts</Pill>
              <Pill tone="violet">{entry.confidence}% confidence</Pill>
              <Pill tone={entry.status === 'resolved' ? 'stable' : 'attention'}>
                {entry.status === 'resolved' ? '🟢 Resolved' : '🔴 Active'}
              </Pill>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flat">
        <CardHeader
          title="Pattern catalogue"
          subtitle={`${misconceptions.length} misconception patterns the prototype engine can match, across 5 concepts`}
        />
        <div className="grid cols-3">
          {misconceptions.map((entry) => (
            <div
              key={entry.id}
              className="callout"
              style={{ background: 'var(--surface)' }}
            >
              <div className="row between" style={{ gap: 8, marginBottom: 4 }}>
                <span className="strong small">{entry.name}</span>
                <Pill tone="neutral">{entry.concept}</Pill>
              </div>
              <span className="tiny muted">{entry.description}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
