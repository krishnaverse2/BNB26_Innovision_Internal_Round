import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Send,
  Terminal,
  Wand2,
  XCircle,
} from 'lucide-react'
import { Card, CardHeader, CodeBlock, OutputBlock, PageHead, Pill } from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { runPython, runnerMeta } from '../services/pythonRunner'
import {
  CODING_LAB_QUESTION_ID,
  DEMO_WRONG_ANSWER,
  getQuestion,
} from '../data/questions'

export default function CodingLab() {
  const navigate = useNavigate()
  const { state, submitAnswer } = useDemo()
  const question = getQuestion(state.submitted?.questionId || CODING_LAB_QUESTION_ID)

  const [code, setCode] = useState(question?.code || '')
  const [prediction, setPrediction] = useState(state.submitted?.answer || '')
  const [runResult, setRunResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    setCode(question?.code || '')
  }, [question?.id, question?.code])

  if (!question) return null

  const submitted = state.submitted && state.submitted.questionId === question.id

  function handleRun() {
    const result = runPython(code)
    setRunResult(result)
  }

  function handleSubmit() {
    const answer = prediction.trim()
    if (!answer) {
      setError('Enter a prediction, or use the demo wrong answer to run the guided flow.')
      return
    }
    setError('')
    const result = runPython(code)
    setRunResult(result)
    submitAnswer({
      questionId: question.id,
      answer,
      runOutput: result.ok ? result.output : null,
    })
  }

  function useDemoAnswer() {
    setPrediction(DEMO_WRONG_ANSWER)
    setError('')
  }

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Coding Lab"
        subtitle="Predict what the code does before you run it. Re:Learn analyses the prediction, not just the result."
        actions={
          <>
            <Pill tone="blue">{question.concept}</Pill>
            <Pill tone="neutral">Difficulty: {question.difficulty}</Pill>
          </>
        }
      />

      <div className="grid sidebar-split">
        <Card>
          <CardHeader
            icon={<Terminal size={18} />}
            title={question.question}
            subtitle="Read the code, then write down what you think it prints."
          />

          <CodeBlock code={code} title="challenge.py" />

          <div className="field" style={{ marginTop: 18 }}>
            <label className="field-label" htmlFor="editor">
              Editable copy — change it and press Run Code to experiment
            </label>
            <textarea
              id="editor"
              className="textarea"
              value={code}
              spellCheck={false}
              onChange={(event) => setCode(event.target.value)}
              style={{ minHeight: 132 }}
            />
            <div className="row wrap" style={{ gap: 8 }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleRun}>
                <Play size={15} />
                Run Code
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setCode(question.code)
                  setRunResult(null)
                }}
              >
                Reset code
              </button>
            </div>
          </div>

          {runResult ? (
            <div style={{ marginTop: 18 }}>
              {runResult.ok ? (
                <OutputBlock label="Actual output">{runResult.output}</OutputBlock>
              ) : (
                <OutputBlock label="Error" error>
                  {runResult.error}
                </OutputBlock>
              )}
              <p className="tiny muted" style={{ marginTop: 8 }}>
                {runnerMeta.note}
              </p>
            </div>
          ) : null}
        </Card>

        <div className="stack gap">
          <Card>
            <CardHeader title="Your Prediction" subtitle="One value per line, exactly as Python would print it." />
            <div className="field">
              <textarea
                className="textarea"
                value={prediction}
                spellCheck={false}
                placeholder={'1\n2\n3\n4'}
                onChange={(event) => setPrediction(event.target.value)}
              />
              <button type="button" className="btn btn-soft btn-sm" onClick={useDemoAnswer}>
                <Wand2 size={15} />
                Use Demo Wrong Answer
              </button>
              {error ? <div className="callout error">{error}</div> : null}
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={handleSubmit}>
                <Send size={16} />
                Submit Answer
              </button>
            </div>
          </Card>

          <Card className="flat">
            <CardHeader title="How Re:Learn marks this" />
            <p className="small soft">
              A normal LMS would show the correct output here. Re:Learn first compares your
              prediction with the real output, then asks <em>why</em> the two differ — the
              reasoning is what identifies the misconception.
            </p>
          </Card>
        </div>
      </div>

      {submitted ? (
        <Card className={state.submitted.isCorrect ? 'flat' : 'accent'}>
          {state.submitted.isCorrect ? (
            <div className="stack gap">
              <div className="row" style={{ gap: 10 }}>
                <CheckCircle2 size={20} color="#16a34a" />
                <h3>Your prediction matches the actual output</h3>
              </div>
              <p className="small soft">
                No misconception detected on this attempt. The guided demo follows a wrong
                prediction — press <strong>Use Demo Wrong Answer</strong> and submit again to
                walk through the full diagnosis cycle.
              </p>
              <div className="row wrap">
                <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                  Back to Dashboard
                </button>
                <button type="button" className="btn btn-soft" onClick={useDemoAnswer}>
                  <Wand2 size={15} />
                  Use Demo Wrong Answer
                </button>
              </div>
            </div>
          ) : (
            <div className="stack gap">
              <div className="row" style={{ gap: 10 }}>
                <XCircle size={20} color="#dc2626" />
                <h3>Your prediction is different from the actual output.</h3>
              </div>
              <p className="soft">
                Before showing the answer, Re:Learn wants to understand your reasoning.
              </p>
              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  onClick={() => navigate('/diagnosis')}
                >
                  Explain My Thinking
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  )
}
