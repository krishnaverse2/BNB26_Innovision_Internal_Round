import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { CalendarRange, TrendingUp } from 'lucide-react'
import { Card, CardHeader, PageHead, Pill } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { learningTimeline } from '../data/students'

const STATUS_COLOR = {
  detected: '#dc2626',
  repeated: '#dc2626',
  improving: '#d97706',
  stable: '#16a34a',
}

export default function Timeline() {
  const { state, isResolved } = useDemo()

  const chartData = learningTimeline.map((entry) => ({
    week: entry.week,
    'Loops understanding': entry.loopsScore,
    status: entry.status,
  }))

  const events = isResolved
    ? [
        ...learningTimeline,
        {
          week: 'Today',
          title: 'Live demo cycle completed',
          detail: `Stability check finished with ${
            state.resolution?.passedCount ?? 0
          }/${state.resolution?.totalCount ?? 5} evidence types passed.`,
          status: 'stable',
          label: '🟢 Recorded now',
        },
      ]
    : learningTimeline

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Learning Timeline"
        subtitle="How one misconception moved from detected to stable across four weeks."
        actions={<Pill tone="violet">Loops · range()</Pill>}
      />

      <Card>
        <CardHeader
          icon={<TrendingUp size={18} />}
          title="Improvement trend"
          subtitle="Loops understanding measured after each cycle"
        />
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 4, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f7" />
              <XAxis
                dataKey="week"
                tick={{ fill: '#64748b', fontSize: 12.5 }}
                axisLine={{ stroke: '#e6eaf2' }}
                tickLine={false}
              />
              <YAxis
                domain={[40, 100]}
                tick={{ fill: '#94a3b8', fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #e6eaf2',
                  fontSize: 13,
                }}
              />
              <Line
                type="monotone"
                dataKey="Loops understanding"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 5, fill: '#7c3aed', strokeWidth: 0 }}
                activeDot={{ r: 7 }}
                animationDuration={900}
              />
              {chartData.map((point) => (
                <ReferenceDot
                  key={point.week}
                  x={point.week}
                  y={point['Loops understanding']}
                  r={6}
                  fill={STATUS_COLOR[point.status]}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<CalendarRange size={18} />}
          title="Journey log"
          subtitle="Each entry is one evidence event recorded by the prototype engine"
        />
        <div className="timeline">
          {events.map((entry) => (
            <div className={`timeline-item ${entry.status}`} key={entry.week + entry.title}>
              <div className="row between wrap" style={{ gap: 8 }}>
                <div className="row" style={{ gap: 10 }}>
                  <Pill tone="neutral">{entry.week}</Pill>
                  <span className="strong" style={{ fontSize: 14.5 }}>
                    {entry.title}
                  </span>
                </div>
                <Pill
                  tone={
                    entry.status === 'stable'
                      ? 'stable'
                      : entry.status === 'improving'
                        ? 'developing'
                        : 'attention'
                  }
                >
                  {entry.label}
                </Pill>
              </div>
              <p className="small soft" style={{ marginTop: 6 }}>
                {entry.detail}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
