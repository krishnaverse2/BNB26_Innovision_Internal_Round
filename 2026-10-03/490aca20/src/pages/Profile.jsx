import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Award,
  CalendarDays,
  Flame,
  Fingerprint,
  RotateCcw,
  Target,
  User,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  PageHead,
  Pill,
  ProgressBar,
  StatCard,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getMisconception, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'
import { recurringPatterns } from '../data/responses'
import { learningTimeline, studentMisconceptions } from '../data/students'

export default function Profile() {
  const navigate = useNavigate()
  const { student, summary, fingerprint, isResolved, state, resetDemo } = useDemo()

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

  const latest = learningTimeline[learningTimeline.length - 1]

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Profile"
        subtitle="The learner record Re:Learn updates as each diagnosis cycle completes."
        actions={
          isResolved ? (
            <Pill tone="stable">🟢 Updated after resolution</Pill>
          ) : (
            <Pill tone="neutral">Demo learner</Pill>
          )
        }
      />

      <Card dark>
        <div className="row between wrap" style={{ gap: 18 }}>
          <div className="row" style={{ gap: 16 }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 18, borderRadius: 16 }}>
              {student.avatarInitials}
            </div>
            <div>
              <div style={{ fontSize: 21, fontWeight: 700 }}>{student.fullName}</div>
              <div className="small" style={{ color: '#b9c4dc', marginTop: 3 }}>
                {student.cohort}
              </div>
              <div className="row wrap" style={{ gap: 8, marginTop: 12 }}>
                <Pill tone="dark">
                  <User size={13} />
                  <span className="mono">{student.id}</span>
                </Pill>
                <Pill tone="dark">
                  <Flame size={13} />
                  {summary.streakDays} day streak
                </Pill>
                <Pill tone={isResolved ? 'stable' : 'developing'}>
                  {isResolved ? 'Loops stable at 91%' : 'Loops developing at 72%'}
                </Pill>
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="tiny" style={{ color: '#93a1bd', letterSpacing: 0.4 }}>
              CURRENT STAGE
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginTop: 4 }}>
              {state.stage}
            </div>
            <div className="tiny" style={{ color: '#93a1bd', marginTop: 6 }}>
              {state.completedAt
                ? `Cycle completed ${new Date(state.completedAt).toLocaleString()}`
                : 'Cycle not completed yet'}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid cols-4">
        <StatCard
          icon={<Target size={18} />}
          tone="violet"
          value={`${summary.overallUnderstanding}%`}
          label="Overall understanding"
          delta={isResolved ? '↑ from 76%' : 'Baseline'}
          deltaTone={isResolved ? 'stable' : 'neutral'}
        />
        <StatCard
          icon={<Award size={18} />}
          tone="blue"
          value={summary.conceptsStable}
          label="Concepts stable"
        />
        <StatCard
          icon={<Fingerprint size={18} />}
          tone="violet"
          value={summary.activeMisconceptions}
          label="Active misconceptions"
          delta={isResolved ? '↓ from 3' : 'No change yet'}
          deltaTone={isResolved ? 'stable' : 'neutral'}
        />
        <StatCard
          icon={<CalendarDays size={18} />}
          tone="blue"
          value={`${summary.streakDays} days`}
          label="Learning streak"
        />
      </div>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<Fingerprint size={18} />}
            title="Concept mastery"
            subtitle="Five tracked concepts, recomputed from the demo profile"
            actions={
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => navigate('/misconceptions')}
              >
                Full fingerprint
                <ArrowRight size={15} />
              </button>
            }
          />
          <div className="stack gap">
            {fingerprint.map((entry) => (
              <ProgressBar
                key={entry.id}
                name={`${entry.icon} ${entry.name}`}
                value={entry.score}
                status={`${entry.dot} ${entry.label}`}
                tone={entry.tone}
              />
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            icon={<Flame size={18} />}
            title="Recurring patterns"
            subtitle="Where this learner keeps slipping"
          />
          <div className="data-list">
            {recurringPatterns.map((pattern) => (
              <div className="data-row" key={pattern.misconceptionId}>
                <div style={{ flex: 1 }}>
                  <div className="data-row-title">{pattern.label}</div>
                  <div className="data-row-sub">
                    {getMisconception(pattern.misconceptionId)?.name}
                  </div>
                </div>
                <Pill tone={pattern.attempts >= 4 ? 'attention' : 'neutral'}>
                  {pattern.attempts} attempts
                </Pill>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="row" style={{ gap: 10 }}>
            <span style={{ fontSize: 18 }}>{latest.label.split(' ')[0]}</span>
            <div>
              <div className="strong small">{latest.title}</div>
              <div className="tiny muted">
                Latest timeline entry · {latest.week} · Loops score {latest.loopsScore}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          icon={<Target size={18} />}
          title="Tracked misconceptions"
          subtitle="Status changes here the moment a stability check resolves a pattern"
          actions={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              Back to dashboard
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
                  First seen {entry.firstSeen}
                  {entry.resolvedOn ? ` · resolved ${entry.resolvedOn}` : ''}
                  {isResolved && entry.misconceptionId === PRIMARY_MISCONCEPTION_ID
                    ? ' · resolved in this session'
                    : ''}
                </div>
              </div>
              <Pill tone="violet">{entry.confidence}% confidence</Pill>
              <Pill tone={entry.status === 'resolved' ? 'stable' : 'attention'}>
                {entry.status === 'resolved' ? '🟢 Resolved' : '🔴 Active'}
              </Pill>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="row between wrap" style={{ gap: 12 }}>
          <p className="tiny muted" style={{ maxWidth: '68ch', margin: 0 }}>
            Profile data is synthetic demo content defined in
            <span className="mono"> src/data/students.js</span>. Resetting clears the
            saved journey in this browser and restores the starting profile.
          </p>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => {
              resetDemo()
              navigate('/dashboard')
            }}
          >
            <RotateCcw size={15} />
            Reset demo profile
          </button>
        </div>
      </Card>
    </div>
  )
}
