import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Lightbulb } from 'lucide-react'
import { Card, CardHeader, CodeBlock, PageHead, Pill } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { concepts, getMisconception, misconceptions } from '../data/misconceptions'
import { interventions, learningModes } from '../data/interventions'

const MODE_TONE = {
  visual: 'blue',
  example: 'violet',
  practice: 'developing',
  explain: 'stable',
}

export default function InterventionLibrary() {
  const navigate = useNavigate()
  const { state, switchDiagnosedMisconception } = useDemo()
  const [conceptFilter, setConceptFilter] = useState('all')
  const [selectedId, setSelectedId] = useState(
    state.diagnosis?.misconceptionId || misconceptions[0].id,
  )

  const filtered = useMemo(
    () =>
      conceptFilter === 'all'
        ? misconceptions
        : misconceptions.filter((entry) => entry.concept === conceptFilter),
    [conceptFilter],
  )

  const selected = getMisconception(selectedId) || misconceptions[0]
  const selectedInterventions = interventions.filter(
    (entry) => entry.misconceptionId === selected.id,
  )
  const isDiagnosed = state.diagnosis?.misconceptionId === selected.id

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Intervention Library"
        subtitle={`${interventions.length} authored teaching moves across ${misconceptions.length} misconception patterns and ${learningModes.length} learning modes.`}
        actions={<Pill tone="violet">Demo content</Pill>}
      />

      <Card className="flat">
        <div className="tab-bar">
          <button
            type="button"
            className={`tab ${conceptFilter === 'all' ? 'active' : ''}`}
            onClick={() => setConceptFilter('all')}
          >
            All concepts
          </button>
          {concepts.map((concept) => (
            <button
              key={concept.id}
              type="button"
              className={`tab ${conceptFilter === concept.id ? 'active' : ''}`}
              onClick={() => setConceptFilter(concept.id)}
            >
              {concept.icon} {concept.name}
            </button>
          ))}
        </div>

        <div className="grid cols-3">
          {filtered.map((entry) => (
            <button
              key={entry.id}
              type="button"
              className="option"
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 8,
                borderColor: entry.id === selected.id ? 'var(--violet-500)' : undefined,
                background: entry.id === selected.id ? 'var(--violet-50)' : undefined,
              }}
              onClick={() => setSelectedId(entry.id)}
            >
              <div className="row between" style={{ width: '100%', gap: 8 }}>
                <span className="strong" style={{ fontSize: 14 }}>
                  {entry.name}
                </span>
                <Pill tone="neutral">{entry.concept}</Pill>
              </div>
              <span className="tiny muted" style={{ textAlign: 'left' }}>
                {entry.description}
              </span>
              <span className="tiny strong" style={{ color: 'var(--violet-600)' }}>
                {interventions.filter((item) => item.misconceptionId === entry.id).length}{' '}
                {interventions.filter((item) => item.misconceptionId === entry.id).length === 1
                  ? 'teaching move'
                  : 'teaching moves'}
              </span>
            </button>
          ))}
        </div>
      </Card>

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<Lightbulb size={18} />}
            title={selected.name}
            subtitle={selected.intervention.headline}
            actions={
              isDiagnosed ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate('/intervention')}
                >
                  Open my intervention
                  <ArrowRight size={15} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    switchDiagnosedMisconception(selected.id)
                    navigate('/intervention')
                  }}
                >
                  Practice This Intervention →
                </button>
              )
            }
          />

          {selected.intervention.examples?.length ? (
            <div className="grid cols-2" style={{ marginBottom: 18 }}>
              {selected.intervention.examples.map((example) => (
                <div key={example.code}>
                  <CodeBlock code={example.code} title="example" />
                  <div className="callout" style={{ marginTop: 8 }}>
                    → <span className="mono">{example.output}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="stack gap-sm">
            {selectedInterventions.length ? (
              selectedInterventions.map((entry) => (
                <div className="callout" key={entry.id} style={{ background: 'var(--surface)' }}>
                  <div className="row between wrap" style={{ gap: 8, marginBottom: 6 }}>
                    <span className="strong small">{entry.title}</span>
                    <div className="row" style={{ gap: 6 }}>
                      <Pill tone={MODE_TONE[entry.mode]}>{entry.mode}</Pill>
                      <Pill tone="neutral">{entry.minutes} min</Pill>
                    </div>
                  </div>
                  <span className="small soft">{entry.body}</span>
                  {entry.question ? (
                    <div className="tiny muted" style={{ marginTop: 6 }}>
                      Practice: {entry.question} →{' '}
                      <span className="mono">{entry.answer}</span>
                    </div>
                  ) : null}
                  {entry.prompt ? (
                    <div className="tiny muted" style={{ marginTop: 6 }}>
                      Prompt: {entry.prompt}
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <div className="callout">
                No authored teaching moves for this pattern yet — the prototype falls back to
                the misconception&rsquo;s built-in explanation, examples, practice and prompt.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Built-in teaching content" subtitle="Always available for every pattern" />
          <div className="stack gap">
            <div>
              <div className="strong small">Practice</div>
              <div className="small soft">{selected.intervention.practice?.question}</div>
              <div className="tiny muted mono" style={{ marginTop: 4 }}>
                answer: {selected.intervention.practice?.answer}
              </div>
            </div>
            <div className="divider" />
            <div>
              <div className="strong small">Explain</div>
              <div className="small soft">{selected.intervention.explain}</div>
            </div>
            <div className="divider" />
            <div>
              <div className="strong small">Diagnostic question</div>
              <div className="small soft">{selected.diagnostic?.question}</div>
              {selected.diagnostic?.code ? (
                <div style={{ marginTop: 8 }}>
                  <CodeBlock code={selected.diagnostic.code} title="diagnostic" />
                </div>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
