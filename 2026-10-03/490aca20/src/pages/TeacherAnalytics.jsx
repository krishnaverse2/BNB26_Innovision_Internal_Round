import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  GraduationCap,
  Lightbulb,
  Sparkles,
  Users,
  Activity,
  ShieldCheck,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  InsightCard,
  PageHead,
  Pill,
  StatCard,
  PrototypeNote,
} from '../components/ui'
import { classInsights, classRoster } from '../data/students'
import { getMisconception } from '../data/misconceptions'

const METRIC_PLACEHOLDERS = [
  { label: 'Accuracy', symbol: '—' },
  { label: 'Precision', symbol: '—' },
  { label: 'Recall', symbol: '—' },
  { label: 'F1 Score', symbol: '—' },
]

export default function TeacherAnalytics() {
  const { students, activeMisconceptions, stableConcepts, heatmap } = classInsights
  const maxStudents = Math.max(...heatmap.map((row) => row.students))
  const topPattern = heatmap[0]

  const chartData = heatmap.map((row) => ({ name: row.label, students: row.students }))

  const needsAttention = [...classRoster]
    .sort(
      (a, b) =>
        b.activeMisconceptions.length - a.activeMisconceptions.length ||
        a.understanding - b.understanding,
    )
    .slice(0, 6)

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Class Learning Insights"
        subtitle="The same misconception engine, aggregated across the class — so teaching can target the pattern, not the individual answer."
        actions={<Pill tone="neutral">Intro to Python · Section B</Pill>}
      />

      <div className="grid cols-3">
        <StatCard
          icon={<Users size={19} />}
          tone="blue"
          value={students}
          label="Students"
          delta="Enrolled in this cohort"
          deltaTone="neutral"
        />
        <StatCard
          icon={<Activity size={19} />}
          tone="attention"
          value={activeMisconceptions}
          label="Active Misconceptions"
          delta={`${heatmap.reduce((sum, row) => sum + row.students, 0)} pattern instances`}
          deltaTone="attention"
        />
        <StatCard
          icon={<ShieldCheck size={19} />}
          tone="stable"
          value={`${stableConcepts}%`}
          label="Stable Concepts"
          delta="Across all concept areas"
          deltaTone="stable"
        />
      </div>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            title="Class Misconception Heatmap"
            subtitle="How many students show each reasoning pattern"
          />
          <div>
            {heatmap.map((row) => (
              <div className="heat-row" key={row.misconceptionId}>
                <div>
                  <div className="data-row-title">{row.label}</div>
                  <div className="data-row-sub">{row.name}</div>
                </div>
                <div className="heat-bar">
                  <div
                    className="heat-fill"
                    style={{
                      width: `${(row.students / maxStudents) * 100}%`,
                      opacity: 0.45 + (row.students / maxStudents) * 0.55,
                    }}
                  />
                </div>
                <Pill tone={row.students >= 15 ? 'attention' : 'developing'}>
                  {row.students} students
                </Pill>
              </div>
            ))}
          </div>
          <div className="divider" />
          <div className="chart-box" style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 6, right: 12, bottom: 0, left: -22 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e6eaf2' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(124,58,237,0.06)' }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e6eaf2',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="students" radius={[8, 8, 0, 0]} animationDuration={800}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={index === 0 ? '#dc2626' : index === 1 ? '#f59e0b' : '#7c3aed'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="stack gap">
          <Card dark>
            <CardHeader
              icon={<Lightbulb size={18} />}
              title="Teach the Teacher"
              subtitle="What the class data suggests for the next lesson"
            />
            <InsightCard
              icon={<Sparkles size={18} />}
              title={`${topPattern.students} students are showing difficulty with range boundaries.`}
            >
              Consider adding a visual explanation of inclusive and exclusive boundaries
              before the next coding exercise.
            </InsightCard>
            <div style={{ marginTop: 14 }}>
              <PrototypeNote>
                This recommendation is generated by a rule over the demo class data. The same
                hook is where a trained model would surface patterns a teacher had not
                noticed.
              </PrototypeNote>
            </div>
          </Card>

          <Card>
            <CardHeader
              icon={<GraduationCap size={18} />}
              title="Students to check in with"
              subtitle="Most active patterns, lowest understanding first"
            />
            <div className="data-list">
              {needsAttention.map((student) => (
                <div className="data-row" key={student.id}>
                  <div className="avatar">{student.initials}</div>
                  <div style={{ flex: 1 }}>
                    <div className="data-row-title">{student.fullName}</div>
                    <div className="data-row-sub">
                      {student.activeMisconceptions
                        .map((id) => getMisconception(id)?.name)
                        .filter(Boolean)
                        .join(' · ') || 'No active patterns'}
                    </div>
                  </div>
                  <Pill tone={student.understanding >= 85 ? 'stable' : student.understanding >= 70 ? 'developing' : 'attention'}>
                    {student.understanding}%
                  </Pill>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="flat">
        <CardHeader
          title="Future Model Evaluation"
          subtitle="Placeholder metrics for the trained diagnosis model"
          actions={<Pill tone="neutral">Not measured yet</Pill>}
        />
        <div className="grid cols-4">
          {METRIC_PLACEHOLDERS.map((metric) => (
            <div
              key={metric.label}
              className="callout center"
              style={{ padding: '18px 14px' }}
            >
              <div className="stat-value muted" style={{ fontSize: 24 }}>
                {metric.symbol}
              </div>
              <div className="stat-label">{metric.label}</div>
            </div>
          ))}
        </div>
        <div className="divider" />
        <div className="grid cols-2">
          <div>
            <div className="strong small" style={{ marginBottom: 8 }}>
              Confusion Matrix
            </div>
            <div
              className="callout center"
              style={{
                padding: 26,
                borderStyle: 'dashed',
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
              }}
            >
              predicted →<br />
              [ TP · FP ]<br />
              [ FN · TN ]
            </div>
          </div>
          <div className="stack gap-sm">
            <div className="callout warning">
              Available after real labeled training data is connected.
            </div>
            <p className="tiny muted">
              No accuracy numbers are shown because none have been measured. The prototype
              engine in <span className="mono">src/services/aiService.js</span> uses
              hand-written rules over the demo data; metrics become meaningful only once a
              trained classifier replaces it and is evaluated on held-out labeled responses.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
