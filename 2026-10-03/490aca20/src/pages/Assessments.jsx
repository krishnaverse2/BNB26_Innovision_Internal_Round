import { useMemo, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { Card, CardHeader, CodeBlock, PageHead, Pill } from '../components/ui'
import {
  assessmentLabel,
  assessmentTypes,
  assessments,
} from '../data/assessments'
import { getMisconception } from '../data/misconceptions'
import { questions } from '../data/questions'
import { responses } from '../data/responses'

export default function Assessments() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [conceptFilter, setConceptFilter] = useState('all')

  const filtered = useMemo(
    () =>
      assessments.filter(
        (item) =>
          (typeFilter === 'all' || item.type === typeFilter) &&
          (conceptFilter === 'all' || item.concept === conceptFilter),
      ),
    [typeFilter, conceptFilter],
  )

  const counts = assessmentTypes.map((type) => ({
    ...type,
    count: assessments.filter((item) => item.type === type.id).length,
  }))

  const correctRate = Math.round(
    (responses.filter((r) => r.isCorrect).length / responses.length) * 100,
  )

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Assessments"
        subtitle={`${assessments.length} assessment items and ${questions.length} practice questions, tagged by evidence type and misconception.`}
        actions={
          <>
            <Pill tone="blue">{responses.length} demo responses</Pill>
            <Pill tone="neutral">{correctRate}% correct in log</Pill>
          </>
        }
      />

      <div className="grid cols-4">
        <Card className="stat-card">
          <div className="stat-value">{assessments.length}</div>
          <div className="stat-label">Assessment items</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{assessmentTypes.length}</div>
          <div className="stat-label">Evidence types</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{questions.length}</div>
          <div className="stat-label">Practice questions</div>
        </Card>
        <Card className="stat-card">
          <div className="stat-value">{counts.reduce((sum, entry) => sum + entry.count, 0)}</div>
          <div className="stat-label">Tagged items</div>
        </Card>
      </div>

      <Card className="flat">
        <CardHeader
          icon={<ClipboardCheck size={18} />}
          title="Assessment bank"
          subtitle="Filter by the kind of evidence an item collects"
        />

        <div className="tab-bar">
          <button
            type="button"
            className={`tab ${typeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTypeFilter('all')}
          >
            All types
          </button>
          {assessmentTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              className={`tab ${typeFilter === type.id ? 'active' : ''}`}
              onClick={() => setTypeFilter(type.id)}
            >
              {type.label}
            </button>
          ))}
        </div>

        <div className="tab-bar">
          <button
            type="button"
            className={`tab ${conceptFilter === 'all' ? 'active' : ''}`}
            onClick={() => setConceptFilter('all')}
          >
            All concepts
          </button>
          {['variables', 'conditions', 'loops', 'functions', 'lists'].map((concept) => (
            <button
              key={concept}
              type="button"
              className={`tab ${conceptFilter === concept ? 'active' : ''}`}
              onClick={() => setConceptFilter(concept)}
            >
              {concept}
            </button>
          ))}
        </div>

        <div className="stack gap">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="callout"
              style={{ background: 'var(--surface)', padding: 16 }}
            >
              <div className="row between wrap" style={{ gap: 10, marginBottom: 10 }}>
                <div className="row wrap" style={{ gap: 8 }}>
                  <Pill tone="violet">{assessmentLabel(item.type)}</Pill>
                  <Pill tone="neutral">{item.concept}</Pill>
                  <span className="tiny muted mono">{item.id}</span>
                </div>
                {item.misconceptionId ? (
                  <Pill tone="developing">
                    {getMisconception(item.misconceptionId)?.name}
                  </Pill>
                ) : null}
              </div>

              <div className="strong small" style={{ marginBottom: 8 }}>
                {item.question}
              </div>

              {item.code ? (
                <CodeBlock code={item.code} title="assessment" />
              ) : null}

              <div className="row wrap" style={{ gap: 8, marginTop: 10 }}>
                <span className="tiny muted strong">Expected answer:</span>
                <span className="mono small">{item.expectedAnswer}</span>
              </div>
            </div>
          ))}
          {!filtered.length ? (
            <div className="empty-state">No items match those filters.</div>
          ) : null}
        </div>
      </Card>
    </div>
  )
}
