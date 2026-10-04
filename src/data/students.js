// ============================================================
// DEMO DATA — synthetic student roster for the Re:Learn
// prototype. These are generated demo records, not real students.
// ============================================================
import { concepts, misconceptions } from './misconceptions'

// Deterministic PRNG so the demo data is identical on every load.
export function mulberry32(seed) {
  let a = seed
  return function random() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const FIRST_NAMES = [
  'Alex', 'Priya', 'Marcus', 'Yuki', 'Sofia', 'Daniel', 'Amara', 'Ravi',
  'Elena', 'Tomas', 'Nadia', 'Kwame', 'Iris', 'Hugo', 'Mei', 'Jonas',
  'Layla', 'Victor', 'Anya', 'Felix', 'Zara', 'Omar', 'Lucia', 'Nikolai',
  'Hana', 'Diego', 'Freya', 'Sanjay', 'Chloe', 'Mateo', 'Ingrid', 'Arjun',
  'Talia', 'Bruno', 'Sana', 'Emil', 'Rosa', 'Kai', 'Marta', 'Idris',
  'Lena', 'Paolo', 'Aisha', 'Ruben', 'Nina', 'Theo', 'Carla', 'Samir',
]

const LAST_INITIALS = 'ABCDEFGHIJKLMNOPRSTVW'

export const currentStudent = {
  id: 'stu-001',
  name: 'Alex',
  fullName: 'Krishna Sonawane',
  cohort: 'Intro to Python — Section B',
  avatarInitials: 'AR',
  streakDays: 7,
}

// Concept mastery for the demo student. `baseline` is what the dashboard
// shows before the flow is completed, `resolved` is what it shows after the
// Range Endpoint Confusion misconception is marked stable.
export const studentMastery = {
  baseline: {
    variables: 86,
    conditions: 91,
    loops: 72,
    functions: 43,
    lists: 88,
  },
  resolved: {
    variables: 86,
    conditions: 91,
    loops: 91,
    functions: 43,
    lists: 88,
  },
}

export const studentStatus = (score) => {
  if (score >= 85) return { label: 'Stable', tone: 'stable', dot: '🟢' }
  if (score >= 60) return { label: 'Developing', tone: 'developing', dot: '🟡' }
  return { label: 'Needs Attention', tone: 'attention', dot: '🔴' }
}

// Active misconceptions tracked for the demo student.
export const studentMisconceptions = [
  {
    misconceptionId: 'm-range-endpoint',
    status: 'active',
    confidence: 87,
    attempts: 5,
    firstSeen: '2026-09-02',
  },
  {
    misconceptionId: 'm-return-vs-print',
    status: 'active',
    confidence: 74,
    attempts: 3,
    firstSeen: '2026-09-11',
  },
  {
    misconceptionId: 'm-param-order',
    status: 'active',
    confidence: 61,
    attempts: 2,
    firstSeen: '2026-09-19',
  },
  {
    misconceptionId: 'm-index-starts-at-one',
    status: 'resolved',
    confidence: 92,
    attempts: 2,
    firstSeen: '2026-08-24',
    resolvedOn: '2026-09-15',
  },
]

const CLASS_PATTERN_WEIGHTS = [
  { misconceptionId: 'm-range-endpoint', label: 'Range Boundary', count: 18 },
  { misconceptionId: 'm-param-order', label: 'Function Parameters', count: 14 },
  { misconceptionId: 'm-index-starts-at-one', label: 'List Indexing', count: 11 },
  { misconceptionId: 'm-boolean-operator', label: 'Boolean Conditions', count: 7 },
]

export const CLASS_SIZE = 48

// Students carrying at least one active misconception.
const AFFECTED_COUNT = 37

// A concept score at or above this bar is counted as stable in the class
// view (196 of 240 student-concept pairs in this demo roster).
const STABLE_THRESHOLD = 76

// Build a deterministic roster of 48 students. 37 of them carry at least
// one active misconception; the 50 pattern instances below are spread
// across those 37 students, so 13 of them carry two patterns.
function buildRoster() {
  const random = mulberry32(20260931)
  const roster = []

  for (let i = 0; i < CLASS_SIZE; i += 1) {
    const first = FIRST_NAMES[i % FIRST_NAMES.length]
    const last = LAST_INITIALS[Math.floor(random() * LAST_INITIALS.length)]
    const understanding = 64 + Math.floor(random() * (100 - 64))

    const conceptScores = {}
    concepts.forEach((concept) => {
      const drift = Math.round((random() * 2 - 1) * 6)
      conceptScores[concept.id] = Math.max(
        20,
        Math.min(100, understanding + drift),
      )
    })

    roster.push({
      id: `stu-${String(i + 2).padStart(3, '0')}`,
      name: first,
      fullName: `${first} ${last}.`,
      initials: `${first[0]}${last}`,
      understanding,
      conceptScores,
      status: studentStatus(understanding).label,
      activeMisconceptions: [],
      attemptsThisWeek: 2 + Math.floor(random() * 9),
    })
  }

  const affected = [...roster].sort(() => random() - 0.5).slice(0, AFFECTED_COUNT)

  const patternPool = []
  CLASS_PATTERN_WEIGHTS.forEach((pattern) => {
    for (let n = 0; n < pattern.count; n += 1) patternPool.push(pattern.misconceptionId)
  })

  patternPool.forEach((misconceptionId, index) => {
    const student = affected[index % affected.length]
    if (!student.activeMisconceptions.includes(misconceptionId)) {
      student.activeMisconceptions.push(misconceptionId)
    }
  })

  return roster
}

export const classRoster = buildRoster()

const nameOf = (id) => misconceptions.find((m) => m.id === id)?.name || id

export const DEMO_DATA_NOTE =
  'Demo data: synthetic records generated locally for this prototype.'

// Weekly learning history for the demo student, used by the timeline chart.
export const learningTimeline = [
  {
    week: 'Week 1',
    title: 'Range Endpoint Confusion',
    detail: 'Predicted 1 2 3 4 5 for range(1, 5). Boundary error detected.',
    status: 'detected',
    label: '🔴 Detected',
    loopsScore: 58,
  },
  {
    week: 'Week 2',
    title: 'Repeated mistake',
    detail: 'Same boundary error on range(2, 6) and range(1, 6).',
    status: 'repeated',
    label: '🔴 Repeated',
    loopsScore: 61,
  },
  {
    week: 'Week 3',
    title: 'After intervention',
    detail: 'Visual and practice modes completed. Answers improving but not confirmed.',
    status: 'improving',
    label: '🟡 Improving',
    loopsScore: 72,
  },
  {
    week: 'Week 4',
    title: 'Stress test passed',
    detail: 'Stable across same concept, new context, debugging, explanation and an unseen problem.',
    status: 'stable',
    label: '🟢 Stable',
    loopsScore: 91,
  },
]

export const classInsights = (() => {
  const withMisconceptions = classRoster.filter(
    (s) => s.activeMisconceptions.length > 0,
  )

  const conceptPairs = classRoster.flatMap((student) =>
    concepts.map((concept) => student.conceptScores[concept.id]),
  )
  const stablePairs = conceptPairs.filter((score) => score >= STABLE_THRESHOLD)

  return {
    students: classRoster.length,
    activeMisconceptions: withMisconceptions.length,
    stableConcepts: Math.round((stablePairs.length / conceptPairs.length) * 100),
    heatmap: CLASS_PATTERN_WEIGHTS.map((pattern) => ({
      misconceptionId: pattern.misconceptionId,
      label: pattern.label,
      name: nameOf(pattern.misconceptionId),
      students: classRoster.filter((s) =>
        s.activeMisconceptions.includes(pattern.misconceptionId),
      ).length,
    })).sort((a, b) => b.students - a.students),
  }
})()
