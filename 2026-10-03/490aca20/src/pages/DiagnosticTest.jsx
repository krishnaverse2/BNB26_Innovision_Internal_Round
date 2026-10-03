import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, FlaskConical, RotateCcw } from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  PageHead,
  Pill,
  PrototypeNote,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { generateDiagnosticQuestion } from '../services/aiService'

export default function DiagnosticTest() {
  const navigate = useNavigate()
  const { state, recordDiagnosticAnswer } = useDemo()
  const [selected, setSelected] = useState(state.diagnosticResult?.selectedKey || null)

  if (!state.diagnosis) return <Navigate to="/coding-lab" replace />

  const diagnostic = generateDiagnosticQuestion(state.diagnosis.misconceptionId)
  if (!diagnostic) return <Navigate to="/diagnosis" replace />

  const result = selected ? state.diagnosticResult : null

  function choose(key) {
    setSelected(key)
    recordDiagnosticAnswer(key)
  }

  return (
    <div className="stack gap-lg">
      <PageHead
        title="AI Hypothesis Test"
        subtitle="A diagnostic question that separates “got it right by luck” from “actually holds the misconception”."
        actions={<Pill tone="violet">Step 2 of the cycle</Pill>}
      />

      <Card>
        <CardHeader
          icon={<FlaskConical size={18} />}
          title={diagnostic.question}
          subtitle={`Hypothesis under test: “${diagnostic.hypothesis}”`}
        />
        <CodeBlock code={diagnostic.code} title="diagnostic.py" />

        <div className="option-list" style={{ marginTop: 18 }}>
          {diagnostic.options.map((option) => {
            const isSelected = selected === option.key
            let className = 'option'
            if (result) {
              if (isSelected) className += option.correct ? ' correct' : ' wrong'
            } else if (isSelected) {
              className += ' selected'
            }

            return (
              <button
                key={option.key}
                type="button"
                className={className}
                disabled={Boolean(result)}
                onClick={() => choose(option.key)}
              >
                <span className="option-key">{option.key}</span>
                <span className="mono" style={{ fontSize: 14 }}>
                  {option.text}
                </span>
                {result && option.correct ? (
                  <Pill tone="stable" className="" >
                    Correct output
                  </Pill>
                ) : null}
              </button>
            )
          })}
        </div>
      </Card>

      {result ? (
        <Card className={result.supported ? 'flat' : 'accent'}>
          <div className="stack gap">
            <div className="row between wrap" style={{ gap: 12 }}>
              <h3>
                {result.supported
                  ? 'Hypothesis supported'
                  : 'Hypothesis not supported yet'}
              </h3>
              <div className="row" style={{ gap: 8 }}>
                <Pill tone="neutral">{result.confidenceBefore}%</Pill>
                <ArrowRight size={15} className="muted" />
                <Pill tone={result.supported ? 'stable' : 'developing'}>
                  {result.confidenceAfter}%
                </Pill>
              </div>
            </div>

            <p className="soft">{result.message}</p>

            {!result.supported ? (
              <div className="callout warning">
                Re:Learn keeps the misconception marked as active and will revisit it. The
                intervention below still targets the same boundary rule, and the stability
                check is what finally decides whether it is resolved.
              </div>
            ) : (
              <div className="callout success">
                Confidence rose from {result.confidenceBefore}% to {result.confidenceAfter}%.
                A single supported answer is evidence, not proof — the Learning Stability
                Check still has to confirm it across different question types.
              </div>
            )}

            <PrototypeNote>
              Confidence changes come from the prototype rule set in
              <span className="mono"> src/services/aiService.js</span>, not from a trained
              model.
            </PrototypeNote>

            <div className="row wrap" style={{ gap: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/intervention')}
              >
                Continue to Personalized Intervention
                <ArrowRight size={17} />
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelected(null)}
                disabled={!result}
              >
                <RotateCcw size={15} />
                Answer again
              </button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="flat">
          <p className="small soft">
            Select one option. Re:Learn uses the choice to confirm or weaken the hypothesis
            before it teaches anything.
          </p>
        </Card>
      )}
    </div>
  )
}
