// ============================================================
// DEMO DATA — synthetic response log for the Re:Learn
// prototype. Generated locally, not collected from real students.
// ============================================================
import { questions } from './questions'
import { classRoster, currentStudent, mulberry32 } from './students'

const CORRECT_REASONING = [
  'Traced the loop one value at a time before answering.',
  'Remembered the boundary rule and counted the printed values.',
  'Ran the same shape of code in a previous exercise.',
  'Checked the operator precedence before evaluating.',
  'Recognised this pattern from the earlier lesson.',
]

const WRONG_REASONING = {
  'm-range-endpoint': [
    'Counted the stop value as one of the printed numbers.',
    'Assumed range(1, 5) covers five values.',
    'Thought the last number is always included.',
  ],
  'm-loop-off-by-one': [
    'Counted iterations as stop - start + 1.',
    'Added one extra pass to the accumulator.',
  ],
  'm-nested-loop-count': ['Added the two loop counts instead of multiplying.'],
  'm-while-condition': ['Assumed the loop stops after three prints.'],
  'm-assignment-vs-equality': ['Read the single equals sign as a comparison.'],
  'm-boolean-operator': ['Treated or as requiring both sides to be true.'],
  'm-negation-placement': ['Applied not to only the first comparison.'],
  'm-variable-snapshot': ['Expected y to follow x after reassignment.'],
  'm-variable-scope': ['Expected the local name to survive the call.'],
  'm-type-coercion': ['Assumed Python would convert the string to a number.'],
  'm-return-vs-print': ['Treated the printed value as the returned value.'],
  'm-param-order': ['Matched arguments to parameters by size, not position.'],
  'm-default-argument': ['Expected a fresh default list on every call.'],
  'm-index-starts-at-one': ['Counted the first element as position 1.'],
  'm-negative-index': ['Read the negative index as counting from the start.'],
}

function wrongAnswerFor(question, misconceptionId) {
  const lines = question.expectedOutput.split('\n')
  if (misconceptionId === 'm-range-endpoint' && lines.length > 1) {
    const last = Number(lines[lines.length - 1])
    if (!Number.isNaN(last)) return [...lines, String(last + 1)].join('\n')
  }
  if (misconceptionId === 'm-index-starts-at-one') return 'shifted by one position'
  if (misconceptionId === 'm-return-vs-print') return 'the printed value'
  return `${lines[0]} (incorrect)`
}

const DAY = 86400000
const START = Date.UTC(2026, 8, 1) // 1 September 2026

function buildResponses() {
  const random = mulberry32(424242)
  const records = []
  let n = 0

  questions.forEach((question, qIndex) => {
    const attempts = 2 + Math.floor(random() * 2) // 2-3 attempts per question

    for (let a = 0; a < attempts; a += 1) {
      n += 1
      const student =
        a === 0 ? currentStudent : classRoster[Math.floor(random() * classRoster.length)]
      const tags = question.misconceptionIds
      // Alex's logged mistakes are the explicit records below, so the counts
      // shown on the fingerprint and diagnosis screens always agree.
      const isCorrect =
        student.id === currentStudent.id
          ? true
          : tags.length === 0
            ? random() > 0.25
            : random() > 0.55
      const misconceptionId = isCorrect
        ? null
        : tags[Math.floor(random() * tags.length)] || null

      records.push({
        id: `res-${String(n).padStart(4, '0')}`,
        questionId: question.id,
        studentId: student.id,
        studentName: student.fullName || student.name,
        concept: question.concept,
        studentAnswer: isCorrect
          ? question.expectedOutput
          : wrongAnswerFor(question, misconceptionId),
        reasoning: isCorrect
          ? CORRECT_REASONING[Math.floor(random() * CORRECT_REASONING.length)]
          : (WRONG_REASONING[misconceptionId] || ['Uncertain — guessed from memory.'])[
              Math.floor(
                random() *
                  (WRONG_REASONING[misconceptionId] || ['Uncertain.']).length,
              )
            ],
        isCorrect,
        misconceptionId,
        timeTakenSeconds: 18 + Math.floor(random() * 120),
        timestamp: new Date(START + (qIndex * 3 + a) * DAY).toISOString(),
      })
    }
  })

  // Alex's repeated range-boundary mistakes: the evidence trail that makes
  // the "Previous Attempts" signal on the diagnosis screen believable.
  const alexRangeAttempts = [
    { questionId: 'q-l-01', answer: '1\n2\n3\n4\n5', day: 1 },
    { questionId: 'q-l-03', answer: '2\n3\n4\n5\n6', day: 5 },
    { questionId: 'q-l-12', answer: '1\n2\n3\n4\n5\n6', day: 9 },
    { questionId: 'q-l-04', answer: '0\n2\n4\n6\n8\n10', day: 14 },
    { questionId: 'q-l-07', answer: '5\n4\n3\n2\n1\n0', day: 20 },
  ]

  alexRangeAttempts.forEach((attempt, index) => {
    n += 1
    records.push({
      id: `res-alex-${String(index + 1).padStart(2, '0')}`,
      questionId: attempt.questionId,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      concept: 'loops',
      studentAnswer: attempt.answer,
      reasoning: 'Counted the stop value as part of the output.',
      isCorrect: false,
      misconceptionId: 'm-range-endpoint',
      timeTakenSeconds: 24 + index * 6,
      timestamp: new Date(START + attempt.day * DAY).toISOString(),
    })
  })

  // The other two recurring patterns on the fingerprint page, so every
  // attempt count in the UI can be traced back to this log.
  const alexOtherAttempts = [
    { questionId: 'q-f-04', misconceptionId: 'm-param-order', answer: '7', reasoning: 'Matched arguments to parameters by size, not position.', day: 11 },
    { questionId: 'q-f-10', misconceptionId: 'm-param-order', answer: '4', reasoning: 'Matched arguments to parameters by size, not position.', day: 16 },
    { questionId: 'q-f-04', misconceptionId: 'm-param-order', answer: '7', reasoning: 'Swapped the two arguments again.', day: 22 },
    { questionId: 'q-s-01', misconceptionId: 'm-index-starts-at-one', answer: '20', reasoning: 'Counted the first element as position 1.', day: 6 },
    { questionId: 'q-s-02', misconceptionId: 'm-index-starts-at-one', answer: 'c', reasoning: 'Counted the first element as position 1.', day: 18 },
  ]

  alexOtherAttempts.forEach((attempt, index) => {
    n += 1
    records.push({
      id: `res-alex-${String(index + 6).padStart(2, '0')}`,
      questionId: attempt.questionId,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      concept: attempt.misconceptionId.startsWith('m-param') ? 'functions' : 'lists',
      studentAnswer: attempt.answer,
      reasoning: attempt.reasoning,
      isCorrect: false,
      misconceptionId: attempt.misconceptionId,
      timeTakenSeconds: 30 + index * 5,
      timestamp: new Date(START + attempt.day * DAY).toISOString(),
    })
  })

  return records.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export const responses = buildResponses()

export const responsesByStudent = (studentId) =>
  responses.filter((r) => r.studentId === studentId)

export const responsesForQuestion = (questionId) =>
  responses.filter((r) => r.questionId === questionId)

export const attemptsForMisconception = (studentId, misconceptionId) =>
  responses.filter(
    (r) =>
      r.studentId === studentId &&
      r.misconceptionId === misconceptionId &&
      !r.isCorrect,
  )

// Recurring patterns shown on the Misconception Fingerprint page. Counts are
// read from the log above so they always match the diagnosis evidence.
export const recurringPatterns = [
  { label: 'Range boundaries', misconceptionId: 'm-range-endpoint' },
  { label: 'Function parameters', misconceptionId: 'm-param-order' },
  { label: 'List indexing', misconceptionId: 'm-index-starts-at-one' },
].map((pattern) => ({
  ...pattern,
  attempts: attemptsForMisconception(currentStudent.id, pattern.misconceptionId).length,
}))

export const DEMO_DATA_NOTE =
  'Demo data: synthetic records generated locally for this prototype. No real student data is used.'
