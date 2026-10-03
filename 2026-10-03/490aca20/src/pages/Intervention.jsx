import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Eye,
  BookOpen,
  MessageSquare,
  PenLine,
  Sparkles,
  X,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  OutputBlock,
  PageHead,
  Pill,
  PrototypeNote,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { generateIntervention, normalizeAnswer } from '../services/aiService'
import { learningModes } from '../data/interventions'

const MODE_ICONS = {
  visual: Eye,
  example: BookOpen,
  practice: PenLine,
  explain: MessageSquare,
}

function RangeVisualizer({ start = 1, stop = 5 }) {
  const values = []
  for (let i = start; i < stop; i += 1) values.push(i)

  return (
    <div className="stack gap">
      <div className="range-viz">
        <span className="range-caption">range({start}, {stop})</span>
        {values.map((value, index) => (
          <span key={value} className="row" style={{ gap: 10 }}>
            <span className="range-node" style={{ animationDelay: `${index * 130}ms` }}>
              {value}
            </span>
            <span className="range-arrow">→</span>
          </span>
        ))}
        <span className="range-node stop-node" style={{ animationDelay: `${values.length * 130}ms` }}>
          STOP
        </span>
        <span className="range-arrow">✕</span>
        <span
          className="range-node excluded"
          style={{ animationDelay: `${values.length * 130 + 120}ms` }}
        >
          {stop}
        </span>
      </div>
      <div className="row wrap" style={{ gap: 8 }}>
        <Pill tone="stable">
          <Check size={13} /> {values.join(' ')} are produced
        </Pill>
        <Pill tone="attention">
          <X size={13} /> {stop} is excluded
        </Pill>
      </div>
    </div>
  )
}

export default function Intervention() {
  const navigate = useNavigate()
  const { state, setInterventionMode, completeIntervention } = useDemo()

  const [practiceAnswer, setPracticeAnswer] = useState('')
  const [practiceChecked, setPracticeChecked] = useState(false)
  const [explainText, setExplainText] = useState('')
  const [explainSaved, setExplainSaved] = useState(false)

  if (!state.diagnosis) return <Navigate to="/coding-lab" replace />

  const intervention = generateIntervention(state.diagnosis.misconceptionId)
  if (!intervention) return <Navigate to="/diagnosis" replace />

  const mode = state.interventionMode || 'visual'
  const practiceExpected = intervention.practice?.answer || ''
  const practiceCorrect =
    practiceChecked &&
    normalizeAnswer(practiceAnswer) === normalizeAnswer(practiceExpected)

  function goStressTest() {
    completeIntervention()
    navigate('/stress-test')
  }

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Personalized Intervention"
        subtitle="Teaching aimed at the specific misconception that was confirmed, not at the question that was missed."
        actions={
          <>
            <Pill tone="violet">Detected: {intervention.misconceptionName}</Pill>
            {state.interventionCompleted ? <Pill tone="stable">Completed</Pill> : null}
          </>
        }
      />

      <Card dark>
        <CardHeader
          icon={<Sparkles size={18} />}
          title="Visual Explanation"
          subtitle={intervention.headline}
        />
        <RangeVisualizer
          start={intervention.visual?.start ?? 1}
          stop={intervention.visual?.stop ?? 5}
        />
        <div
          className="callout"
          style={{
            marginTop: 16,
            background: 'rgba(255,255,255,0.06)',
            borderColor: 'rgba(255,255,255,0.14)',
            color: '#e6ecf7',
          }}
        >
          &ldquo;In Python, the stop value in range() is not included.&rdquo; The loop runs
          while the counter is <span className="mono">less than</span> the stop value, so it
          stops one step before it.
        </div>
      </Card>

      <Card>
        <CardHeader
          title="Learning Modes"
          subtitle="The same rule taught four ways — pick whichever makes it click."
        />
        <div className="mode-switch">
          {learningModes.map((item) => {
            const Icon = MODE_ICONS[item.id] || Eye
            return (
              <button
                key={item.id}
                type="button"
                className={`mode-btn ${mode === item.id ? 'active' : ''}`}
                onClick={() => setInterventionMode(item.id)}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </div>

        <div className="stack gap" style={{ marginTop: 20 }}>
          {mode === 'visual' ? (
            <div className="animate-rise">
              <h4>Watch the boundary</h4>
              <p className="small soft" style={{ margin: '6px 0 14px' }}>
                Each blue value is printed. The dashed value is the stop value: the loop
                checks <span className="mono">i &lt; {intervention.visual?.stop ?? 5}</span>{' '}
                before every iteration, so that value is never reached.
              </p>
              <RangeVisualizer
                start={intervention.visual?.start ?? 1}
                stop={intervention.visual?.stop ?? 5}
              />
            </div>
          ) : null}

          {mode === 'example' ? (
            <div className="animate-rise stack gap">
              <h4>Worked examples</h4>
              <p className="small soft">
                Same rule, two different stop values. Count the values produced, not the
                numbers written.
              </p>
              {intervention.examples.map((example) => (
                <div key={example.code} className="grid cols-2">
                  <CodeBlock code={example.code} title="example" />
                  <OutputBlock label={`→ ${example.output}`}>{example.output.replace(/ /g, '\n')}</OutputBlock>
                </div>
              ))}
            </div>
          ) : null}

          {mode === 'practice' ? (
            <div className="animate-rise stack gap">
              <h4>{intervention.practice?.question}</h4>
              <p className="small soft">
                Type the values the loop produces, one per line.
              </p>
              <textarea
                className="textarea"
                value={practiceAnswer}
                spellCheck={false}
                placeholder="3&#10;4&#10;5&#10;6"
                onChange={(event) => {
                  setPracticeAnswer(event.target.value)
                  setPracticeChecked(false)
                }}
              />
              <div className="row wrap" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setPracticeChecked(true)}
                  disabled={!practiceAnswer.trim()}
                >
                  Check answer
                </button>
                {practiceChecked ? (
                  practiceCorrect ? (
                    <Pill tone="stable">
                      <Check size={13} /> Correct — {practiceExpected}
                    </Pill>
                  ) : (
                    <Pill tone="attention">
                      <X size={13} /> Not yet. Remember: the stop value is excluded.
                    </Pill>
                  )
                ) : null}
              </div>
            </div>
          ) : null}

          {mode === 'explain' ? (
            <div className="animate-rise stack gap">
              <h4>{intervention.explain}</h4>
              <p className="small soft">
                Explaining a rule in your own words is the strongest signal that a
                misconception is gone. Your answer is stored in the demo profile.
              </p>
              <textarea
                className="textarea"
                style={{ fontFamily: 'var(--font)' }}
                value={explainText}
                placeholder="The stop value is not included because…"
                onChange={(event) => {
                  setExplainText(event.target.value)
                  setExplainSaved(false)
                }}
              />
              <div className="row wrap" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={explainText.trim().length < 15}
                  onClick={() => setExplainSaved(true)}
                >
                  Save explanation
                </button>
                {explainSaved ? (
                  <Pill tone="stable">
                    <Check size={13} /> Saved — {explainText.trim().split(/\s+/).length} words
                  </Pill>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </Card>

      <Card className="flat">
        <div className="row between wrap" style={{ gap: 14 }}>
          <div style={{ maxWidth: '62ch' }}>
            <h4>Next: prove it stuck</h4>
            <p className="small soft" style={{ marginTop: 6 }}>
              Understanding this once is not enough. The Learning Stability Check re-tests
              the same rule in five different ways before Re:Learn will call the
              misconception resolved.
            </p>
          </div>
          <button type="button" className="btn btn-primary btn-lg" onClick={goStressTest}>
            Start Learning Stability Check
            <ArrowRight size={17} />
          </button>
        </div>
        <div style={{ marginTop: 16 }}>
          <PrototypeNote>
            Intervention content is authored demo material selected by misconception id. A
            future model can generate or rank this content instead.
          </PrototypeNote>
        </div>
      </Card>
    </div>
  )
}
