import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, Check, RotateCcw, ShieldCheck, Trophy } from 'lucide-react'
import {
  Card,
  CardHeader,
  CodeBlock,
  PageHead,
  Pill,
  StageIndicator,
  PrototypeNote,
} from '../components/ui'
import { useDemo } from '../context/DemoContext'
import { getQuestion, stressTestStages } from '../data/questions'
import { evaluateResolution, normalizeAnswer } from '../services/aiService'

function gradeStage(stage, answer) {
  const trimmed = String(answer || '').trim()

  if (stage.kind === 'choice') {
    const option = stage.options.find((item) => item.key === trimmed.toUpperCase())
    return {
      passed: Boolean(option?.correct),
      reason: option?.correct
        ? 'Correct — the stop value is treated as exclusive.'
        : 'Not the misunderstanding Re:Learn was testing for.',
      expected: stage.options.find((item) => item.correct)?.text || '',
    }
  }

  if (stage.kind === 'text') {
    const lower = trimmed.toLowerCase()
    const hits = stage.keywords.filter((keyword) => lower.includes(keyword))
    const passed = hits.length > 0 && trimmed.split(/\s+/).length >= 6
    return {
      passed,
      reason: passed
        ? `Your explanation covers the boundary rule (${hits.slice(0, 2).join(', ')}).`
        : 'Mention the stop value or exclusion, and write a full sentence.',
      expected: 'The stop value is excluded: range() stops before it.',
    }
  }

  const question = getQuestion(stage.questionId)
  const passed = normalizeAnswer(trimmed) === normalizeAnswer(question.expectedOutput)
  return {
    passed,
    reason: passed
      ? 'Matches the real output exactly.'
      : `Python prints ${question.expectedOutput.replace(/\n/g, ' ')}.`,
    expected: question.expectedOutput,
  }
}

export default function StressTest() {
  const navigate = useNavigate()
  const {
    state,
    recordStressResult,
    clearStressResult,
    finishStressTest,
    startStressTest,
  } = useDemo()

  const results = state.stressTestResults || {}
  const firstMissing = stressTestStages.findIndex((stage) => !results[stage.id])
  const [activeIndex, setActiveIndex] = useState(
    firstMissing === -1 ? stressTestStages.length - 1 : firstMissing,
  )
  const [answers, setAnswers] = useState({})
  const stage = stressTestStages[activeIndex] || stressTestStages[0]
  const stageResult = results[stage?.id]
  const currentAnswer = answers[stage.id] ?? (stageResult ? stageResult.answer : '')
  const completedCount = stressTestStages.filter((item) => results[item.id]).length
  const allDone = completedCount === stressTestStages.length
  const preview = evaluateResolution(results)

  function submit() {
    startStressTest()
    const grade = gradeStage(stage, currentAnswer)
    recordStressResult({
      stageId: stage.id,
      index: activeIndex,
      label: stage.label,
      passed: grade.passed,
      reason: grade.reason,
      answer: currentAnswer,
      expected: grade.expected,
    })
  }

  function retake(index) {
    const target = stressTestStages[index]
    if (results[target.id]) clearStressResult(target.id, index)
    setActiveIndex(index)
  }

  function resolve() {
    finishStressTest()
    navigate('/resolution')
  }

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Learning Stability Check"
        subtitle="One correct answer does not prove that the misconception is resolved."
        actions={
          <Pill tone={allDone ? 'stable' : 'violet'}>
            {completedCount} / {stressTestStages.length} evidence types
          </Pill>
        }
      />

      <Card className="flat">
        <StageIndicator
          stages={stressTestStages}
          currentIndex={activeIndex}
          results={results}
        />
        <div className="row wrap" style={{ gap: 8, marginTop: 14 }}>
          {stressTestStages.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`btn btn-sm ${index === activeIndex ? 'btn-soft' : 'btn-ghost'}`}
              onClick={() => setActiveIndex(index)}
            >
              {index + 1}. {item.label}
              {results[item.id] ? (results[item.id].passed ? ' ✓' : ' ✗') : ''}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <CardHeader
          icon={<ShieldCheck size={18} />}
          title={`Test ${activeIndex + 1} — ${stage.label}`}
          subtitle={stage.prompt}
          actions={
            <Pill tone="blue">
              {stage.kind === 'output'
                ? 'Predict the output'
                : stage.kind === 'choice'
                  ? 'Choose one'
                  : 'Write your reasoning'}
            </Pill>
          }
        />

        <CodeBlock
          code={getQuestion(stage.questionId)?.code || ''}
          title={`stage-${activeIndex + 1}.py`}
        />

        <div style={{ marginTop: 18 }}>
          {stage.kind === 'choice' ? (
            <div className="option-list">
              {stage.options.map((option) => {
                const isSelected = currentAnswer === option.key
                let className = 'option'
                if (stageResult) {
                  if (option.correct) className += ' correct'
                  else if (isSelected) className += ' wrong'
                } else if (isSelected) {
                  className += ' selected'
                }

                return (
                  <button
                    key={option.key}
                    type="button"
                    className={className}
                    disabled={Boolean(stageResult)}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [stage.id]: option.key }))
                    }
                  >
                    <span className="option-key">{option.key}</span>
                    <span style={{ fontSize: 14 }}>{option.text}</span>
                  </button>
                )
              })}
            </div>
          ) : (
            <textarea
              className="textarea"
              value={currentAnswer}
              spellCheck={false}
              disabled={Boolean(stageResult)}
              placeholder={
                stage.kind === 'text'
                  ? 'Write your explanation in your own words…'
                  : 'One value per line'
              }
              style={stage.kind === 'text' ? { fontFamily: 'var(--font)' } : undefined}
              onChange={(event) =>
                setAnswers((prev) => ({ ...prev, [stage.id]: event.target.value }))
              }
            />
          )}
        </div>

        {stageResult ? (
          <div
            className={`callout ${stageResult.passed ? 'success' : 'error'}`}
            style={{ marginTop: 14 }}
          >
            <div className="strong" style={{ marginBottom: 4 }}>
              {stageResult.passed ? '✓ Passed' : '✗ Not passed'} — {stageResult.label}
            </div>
            <div>{stageResult.reason}</div>
            {!stageResult.passed ? (
              <div className="small" style={{ marginTop: 6 }}>
                Expected:{' '}
                <span className="mono">
                  {String(stageResult.expected).replace(/\n/g, ' ')}
                </span>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="row wrap" style={{ gap: 10, marginTop: 18 }}>
          {stageResult ? (
            <button type="button" className="btn btn-secondary" onClick={() => retake(activeIndex)}>
              <RotateCcw size={15} />
              Retake this stage
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={submit}
              disabled={!String(currentAnswer).trim()}
            >
              <Check size={16} />
              Check answer
            </button>
          )}

          {stageResult && activeIndex < stressTestStages.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveIndex(activeIndex + 1)}
            >
              Next test
              <ArrowRight size={16} />
            </button>
          ) : null}
        </div>
      </Card>

      <Card className={allDone ? 'accent' : 'flat'}>
        <CardHeader
          icon={<Trophy size={18} />}
          title="Evidence collected"
          subtitle="Resolution is decided from several different evidence types, never from one answer."
          actions={
            allDone ? (
              <Pill tone={preview.stable ? 'stable' : 'developing'}>
                {preview.statusLabel}
              </Pill>
            ) : null
          }
        />
        <div className="data-list">
          {stressTestStages.map((item) => {
            const result = results[item.id]
            return (
              <div className="data-row" key={item.id}>
                <span
                  className="option-key"
                  style={{
                    background: result
                      ? result.passed
                        ? 'var(--stable-bg)'
                        : 'var(--attention-bg)'
                      : undefined,
                    color: result
                      ? result.passed
                        ? 'var(--stable)'
                        : 'var(--attention)'
                      : undefined,
                    borderColor: result ? 'transparent' : undefined,
                  }}
                >
                  {result ? (result.passed ? '✓' : '✗') : '•'}
                </span>
                <div style={{ flex: 1 }}>
                  <div className="data-row-title">{item.label}</div>
                  <div className="data-row-sub">
                    {result ? result.reason : 'Not attempted yet'}
                  </div>
                </div>
                <Pill tone={result ? (result.passed ? 'stable' : 'attention') : 'neutral'}>
                  {result ? (result.passed ? 'Passed' : 'Not passed') : 'Pending'}
                </Pill>
              </div>
            )
          })}
        </div>

        {allDone ? (
          <div className="stack gap" style={{ marginTop: 18 }}>
            <div className="row between wrap" style={{ gap: 12 }}>
              <h3>{preview.statusLabel}</h3>
              <Pill tone={preview.stable ? 'stable' : 'developing'}>
                {preview.passedCount} / {preview.totalCount} evidence types passed
              </Pill>
            </div>
            <p className="small soft">{preview.message}</p>
            <PrototypeNote>
              Prototype rule: at least 60% of evidence types and at least three distinct
              types must pass before a misconception is marked resolved.
            </PrototypeNote>
            <div>
              <button type="button" className="btn btn-primary btn-lg" onClick={resolve}>
                See Resolution
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        ) : (
          <div className="callout" style={{ marginTop: 16 }}>
            Complete all five evidence types to calculate the stability result. Any stage can
            be retaken — Re:Learn records the latest attempt.
          </div>
        )}
      </Card>

      {state.resolution ? (
        <div className="row">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/resolution')}>
            View saved resolution
            <ArrowRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  )
}
