// ============================================================
// Re:Learn Prototype Diagnosis Engine
// ------------------------------------------------------------
// Everything in this file runs locally against the demo data in
// src/data. There is NO trained model and NO external API call.
//
// Each exported function is the seam where a real backend will
// plug in later:
//
//   React  ->  aiService (this file)      [today]
//   React  ->  FastAPI  ->  ML model      [future]
//
// Keep the input/output shapes below stable and the swap is a
// fetch() call per function.
// ============================================================

import { getMisconception, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'
import { getQuestion } from '../data/questions'
import { interventionsForMisconception } from '../data/interventions'
import { attemptsForMisconception } from '../data/responses'
import { currentStudent } from '../data/students'

const normalize = (value = '') =>
  String(value)
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()

export const normalizeAnswer = normalize

export const isCorrectAnswer = (studentAnswer, expectedOutput) =>
  normalize(studentAnswer) === normalize(expectedOutput)

/**
 * Stage 1 — compare the submitted answer against the real output and
 * describe *how* it differs. Nothing here concludes a misconception yet;
 * it only produces observable signals.
 */
export function analyzeResponse({ questionId, studentAnswer }) {
  const question = getQuestion(questionId)
  if (!question) {
    return { ok: false, error: 'Unknown question id' }
  }

  const expectedLines = normalize(question.expectedOutput).split(' ')
  const answerLines = normalize(studentAnswer).split(' ').filter(Boolean)
  const correct = isCorrectAnswer(studentAnswer, question.expectedOutput)

  const signals = []

  const rangeMatch = question.code.match(/range\(\s*(-?\d+)\s*,\s*(-?\d+)/)
  if (rangeMatch) {
    signals.push({
      id: 'code-uses-range',
      label: 'Code Structure',
      detail: `The code calls range(${rangeMatch[1]}, ${rangeMatch[2]}), a two-argument range.`,
      weight: 9,
    })
  }

  const history = attemptsForMisconception(
    currentStudent.id,
    PRIMARY_MISCONCEPTION_ID,
  )

  const stopValue = rangeMatch ? Number(rangeMatch[2]) : null
  const includesStop =
    stopValue !== null && answerLines.some((line) => Number(line) === stopValue)
  if (includesStop && !correct) {
    signals.push({
      id: 'stop-value-included',
      label: 'Answer Pattern',
      detail: `The prediction includes ${stopValue}, the stop value of range().`,
      weight: 18,
      // Only counts as evidence when the learner has a boundary history,
      // otherwise a single lucky guess should not drive the diagnosis.
      requiresHistory: history.length >= 3,
    })
  }

  const expectedCount = expectedLines.length
  if (!correct && answerLines.length === expectedCount + 1) {
    signals.push({
      id: 'one-extra-value',
      label: 'Output Length',
      detail: `The prediction has one more value (${answerLines.length}) than the real output (${expectedCount}).`,
      weight: 6,
    })
  }

  if (history.length >= 3) {
    signals.push({
      id: 'previous-attempts',
      label: 'Previous Attempts',
      detail: `${history.length} earlier attempts show the same boundary error.`,
      weight: 10,
    })
  }

  return {
    ok: true,
    questionId,
    studentAnswer,
    expectedOutput: question.expectedOutput,
    isCorrect: correct,
    priorAttempts: history.length,
    signals: signals.filter((signal) => !signal.requiresHistory || history.length >= 3),
  }
}

/**
 * Which observed signals count as evidence *for* which pattern. A signal
 * only raises the confidence of the patterns it actually supports, so
 * competing misconceptions for the same question score differently.
 */
const SIGNAL_RELEVANCE = {
  'm-range-endpoint': ['stop-value-included', 'code-uses-range', 'previous-attempts'],
  'm-loop-off-by-one': ['one-extra-value', 'code-uses-range', 'previous-attempts'],
  'm-nested-loop-count': ['one-extra-value', 'previous-attempts'],
  'm-while-condition': ['previous-attempts'],
  'm-index-starts-at-one': ['previous-attempts'],
  'm-negative-index': ['previous-attempts'],
  'm-return-vs-print': ['previous-attempts'],
  'm-param-order': ['previous-attempts'],
  'm-default-argument': ['previous-attempts'],
  'm-type-coercion': ['previous-attempts'],
  'm-variable-snapshot': ['previous-attempts'],
  'm-variable-scope': ['previous-attempts'],
  'm-assignment-vs-equality': ['previous-attempts'],
  'm-boolean-operator': ['previous-attempts'],
  'm-negation-placement': ['previous-attempts'],
}

const BASE_CONFIDENCE = 50

/**
 * Stage 2 — turn the observed signals into a named misconception with a
 * confidence score. Confidence is the base rate for the pattern plus the
 * weight of every *relevant* signal that fired.
 */
export function diagnoseMisconception({ questionId, studentAnswer, studentId }) {
  const analysis = analyzeResponse({ questionId, studentAnswer })
  if (!analysis.ok) return { ok: false, error: analysis.error }
  if (analysis.isCorrect) {
    return { ok: true, analysis, misconception: null, confidence: null }
  }

  const question = getQuestion(questionId)
  const candidates = question.misconceptionIds.length
    ? question.misconceptionIds
    : [PRIMARY_MISCONCEPTION_ID]

  const scored = candidates
    .map((id) => getMisconception(id))
    .filter(Boolean)
    .map((misconception) => {
      const relevant = SIGNAL_RELEVANCE[misconception.id] || ['previous-attempts']
      const matched = analysis.signals.filter((signal) =>
        relevant.includes(signal.id),
      )
      const confidence = Math.min(
        BASE_CONFIDENCE + matched.reduce((sum, signal) => sum + signal.weight, 0),
        99,
      )
      return { misconception, confidence, matched }
    })
    .sort((a, b) => b.confidence - a.confidence)

  const best = scored[0]
  const misconception = best
    ? best.misconception
    : getMisconception(PRIMARY_MISCONCEPTION_ID)
  const confidence = best ? best.confidence : BASE_CONFIDENCE

  const history = attemptsForMisconception(
    studentId || currentStudent.id,
    misconception.id,
  )

  return {
    ok: true,
    analysis,
    misconceptionId: misconception.id,
    misconceptionName: misconception.name,
    description: misconception.description,
    confidence,
    competingPatterns: scored.slice(1).map((entry) => ({
      id: entry.misconception.id,
      name: entry.misconception.name,
      confidence: entry.confidence,
    })),
    evidence: misconception.evidence.map((text, index) => ({
      id: `ev-${index}`,
      label: best?.matched[index]?.label || 'Pattern Library',
      detail: text,
      checked: true,
    })),
    rationale: [
      `Fired signals: ${analysis.signals.length ? analysis.signals.map((s) => s.id).join(', ') : 'none'}`,
      history.length
        ? `Learner history contains ${history.length} matching attempt(s).`
        : 'No matching learner history found.',
    ],
  }
}

/**
 * Stage 3 — produce the question used to *test* the hypothesis rather
 * than assume it.
 */
export function generateDiagnosticQuestion(misconceptionId) {
  const misconception = getMisconception(misconceptionId)
  if (!misconception?.diagnostic) return null

  const hypothesis =
    misconception.diagnostic.hypothesis ||
    `The student may be showing: ${misconception.name}.`

  return {
    misconceptionId,
    misconceptionName: misconception.name,
    hypothesis,
    ...misconception.diagnostic,
  }
}

export const evaluateDiagnosticAnswer = (misconceptionId, selectedKey) => {
  const diagnostic = getMisconception(misconceptionId)?.diagnostic
  const option = diagnostic?.options.find((o) => o.key === selectedKey)
  const supported = Boolean(option?.correct)

  return {
    supported,
    message: supported
      ? diagnostic.supportingMessage
      : diagnostic.nonSupportingMessage,
  }
}

/**
 * Stage 4 — assemble the personalized intervention for a confirmed
 * misconception, one entry per learning mode.
 */
export function generateIntervention(misconceptionId) {
  const misconception = getMisconception(misconceptionId)
  if (!misconception) return null

  const library = interventionsForMisconception(misconceptionId)
  const modes = ['visual', 'example', 'practice', 'explain'].map((mode) => ({
    mode,
    entry: library.find((item) => item.mode === mode) || null,
  }))

  return {
    misconceptionId,
    misconceptionName: misconception.name,
    headline: misconception.intervention.headline,
    visual: misconception.intervention.visual || null,
    examples: misconception.intervention.examples || [],
    practice: misconception.intervention.practice || null,
    explain: misconception.intervention.explain || null,
    modes,
  }
}

/**
 * Stage 5 — decide whether the misconception is actually resolved.
 * One correct answer is never enough: stability requires several
 * different evidence types to pass.
 */
export function evaluateResolution(results = {}) {
  const keys = Object.keys(results)
  const passed = keys.filter((key) => results[key]?.passed)
  const failed = keys.filter((key) => !results[key]?.passed)

  const ratio = keys.length ? passed.length / keys.length : 0
  const distinctEvidenceTypes = new Set(
    passed.map((key) => results[key].stageId || key),
  ).size

  // Prototype rule: at least 60% of evidence types passed AND at least
  // three distinct evidence types, otherwise the concept is still moving.
  const stable = ratio >= 0.6 && distinctEvidenceTypes >= 3

  const score = Math.round(ratio * 100)

  return {
    stable,
    status: stable ? 'stable' : 'developing',
    statusLabel: stable ? '🟢 Concept Stable' : '🟡 Still Developing',
    resolutionLabel: stable ? 'STABLE' : 'STILL DEVELOPING',
    passedCount: passed.length,
    totalCount: keys.length,
    score,
    distinctEvidenceTypes,
    failedStages: failed,
    message: stable
      ? 'Your understanding remained stable across different question types.'
      : 'Some evidence types are not stable yet. One correct answer does not prove resolution.',
  }
}

/**
 * Understanding breakdown shown on the resolution screen. Derived from
 * which evidence types passed.
 *
 * Prototype rubric: 58 base points + up to 33 points for the share of
 * that dimension's stages which passed, minus a difficulty weighting.
 * Explanation evidence is weighted hardest because articulating a rule
 * is stronger proof than recognising it.
 */
const DIMENSION_WEIGHTING = {
  conceptual: 0,
  application: -3,
  explanation: -7,
  generalization: -2,
}

export function understandingBreakdown(results = {}) {
  const groupScore = (stageIds, dimension) => {
    const relevant = stageIds.filter((id) => results[id])
    if (!relevant.length) return 0
    const passed = relevant.filter((id) => results[id].passed).length
    const ratio = passed / relevant.length
    return Math.max(
      0,
      Math.min(100, Math.round(58 + ratio * 33 + DIMENSION_WEIGHTING[dimension])),
    )
  }

  return [
    { label: 'Conceptual Understanding', value: groupScore(['same-concept'], 'conceptual') },
    {
      label: 'Application',
      value: groupScore(['new-context', 'debugging'], 'application'),
    },
    { label: 'Explanation', value: groupScore(['explain'], 'explanation') },
    { label: 'Generalization', value: groupScore(['unseen'], 'generalization') },
  ]
}

export const aiServiceMeta = {
  engine: 'Re:Learn Prototype Diagnosis Engine',
  note: 'Prototype diagnosis based on predefined misconception patterns. A trained ML model can replace this engine later.',
  runtime: 'local (no network calls)',
  version: '0.1.0-prototype',
}
