// ============================================================
// DEMO DATA — intervention library for the Re:Learn prototype.
// Each entry is one teaching move for one misconception and one
// learning mode (visual / example / practice / explain).
// ============================================================

export const learningModes = [
  { id: 'visual', label: 'Visual', icon: '👁️' },
  { id: 'example', label: 'Example', icon: '📘' },
  { id: 'practice', label: 'Practice', icon: '✍️' },
  { id: 'explain', label: 'Explain', icon: '💬' },
]

const I = (
  id,
  misconceptionId,
  mode,
  title,
  body,
  extra = {},
) => ({ id, misconceptionId, mode, title, body, minutes: 3, ...extra })

export const interventions = [
  // ---- Range Endpoint Confusion ----
  I(
    'int-01',
    'm-range-endpoint',
    'visual',
    'Walk the range boundary',
    'Step through range(1, 5) one value at a time and stop before 5.',
    { visual: { start: 1, stop: 5 }, minutes: 2 },
  ),
  I(
    'int-02',
    'm-range-endpoint',
    'example',
    'Compare two ranges',
    'range(1, 5) produces 1 2 3 4, while range(1, 6) produces 1 2 3 4 5.',
    { examples: [
      { code: 'range(1, 5)', output: '1 2 3 4' },
      { code: 'range(1, 6)', output: '1 2 3 4 5' },
    ] },
  ),
  I(
    'int-03',
    'm-range-endpoint',
    'practice',
    'Predict a new range',
    'What does range(3, 7) produce?',
    { question: 'What does range(3, 7) produce?', answer: '3 4 5 6' },
  ),
  I(
    'int-04',
    'm-range-endpoint',
    'explain',
    'Say it in your own words',
    'Explain in your own words why 7 is not included in range(3, 7).',
    { prompt: 'Explain in your own words why 7 is not included in range(3, 7).' },
  ),

  // ---- Off-by-one iteration count ----
  I('int-05', 'm-loop-off-by-one', 'visual', 'Count produced values',
    'Mark each printed value instead of counting the numbers written in range().',
    { visual: { start: 0, stop: 4 } }),
  I('int-06', 'm-loop-off-by-one', 'practice', 'Subtract, do not add',
    'range(a, b) iterates b - a times.',
    { question: 'How many times does range(5, 12) iterate?', answer: '7' }),

  // ---- Nested loops ----
  I('int-07', 'm-nested-loop-count', 'visual', 'Grid of iterations',
    'Draw the outer loop as rows and the inner loop as columns: rows x columns.',
    { visual: { start: 0, stop: 3 } }),
  I('int-08', 'm-nested-loop-count', 'explain', 'Why multiplication',
    'Explain why nested loop totals multiply rather than add.',
    { prompt: 'Explain why nested loop totals multiply rather than add.' }),

  // ---- While condition ----
  I('int-09', 'm-while-condition', 'example', 'Changing the condition variable',
    'A while loop ends only when something inside the body makes the condition False.',
    { examples: [
      { code: 'n = 1\nwhile n < 5:\n    n = n + 1', output: 'stops at n = 5' },
      { code: 'n = 1\nwhile n < 5:\n    n = n - 1', output: 'never stops' },
    ] }),

  // ---- Assignment vs equality ----
  I('int-10', 'm-assignment-vs-equality', 'visual', 'Store vs ask',
    '`=` stores a value into a name. `==` asks whether two values match.',
    { visual: null }),
  I('int-11', 'm-assignment-vs-equality', 'practice', 'Pick the comparison',
    'Identify which expression compares two values.',
    { question: 'Which expression compares values: a = b or a == b?', answer: 'a == b' }),

  // ---- Boolean operators ----
  I('int-12', 'm-boolean-operator', 'example', 'Truth table walk-through',
    '`and` needs both sides True. `or` needs only one side True.',
    { examples: [
      { code: 'True and False', output: 'False' },
      { code: 'True or False', output: 'True' },
    ] }),

  // ---- Negation placement ----
  I('int-13', 'm-negation-placement', 'explain', 'Scope of not',
    'Explain how parentheses change what `not` applies to.',
    { prompt: 'Explain how parentheses change what `not` applies to.' }),

  // ---- Variable snapshot ----
  I('int-14', 'm-variable-snapshot', 'example', 'Copy, not link',
    'Assignment copies the value at that moment; later changes do not propagate.',
    { examples: [{ code: 'a = 1\nb = a\na = 9\nprint(b)', output: '1' }] }),

  // ---- Scope ----
  I('int-15', 'm-variable-scope', 'visual', 'Inside vs outside the function',
    'Names created inside a function disappear when the function returns.',
    { visual: null }),

  // ---- Type coercion ----
  I('int-16', 'm-type-coercion', 'example', 'Convert explicitly',
    'Python will not silently mix str and int in arithmetic; use int() or str().',
    { examples: [
      { code: '"5" + 5', output: 'TypeError' },
      { code: 'int("5") + 5', output: '10' },
    ] }),

  // ---- Return vs print ----
  I('int-17', 'm-return-vs-print', 'example', 'Two functions, two behaviours',
    'print() shows a value to the reader; return hands a value back to the caller.',
    { examples: [
      { code: 'def f():\n    print(3)\nx = f()\nprint(x)', output: '3 then None' },
      { code: 'def f():\n    return 3\nx = f()\nprint(x)', output: '3' },
    ], minutes: 4 }),

  // ---- Parameter order ----
  I('int-18', 'm-param-order', 'visual', 'Left to right binding',
    'Positional arguments bind to parameters left to right, regardless of value.',
    { visual: null }),

  // ---- Default arguments ----
  I('int-19', 'm-default-argument', 'explain', 'One default, created once',
    'Explain why `def f(x=[])` keeps state between calls and why None is safer.',
    { prompt: 'Explain why `def f(x=[])` is risky.' }),

  // ---- Indexing ----
  I('int-20', 'm-index-starts-at-one', 'practice', 'Zero-based positions',
    'Python list positions start at 0, so the last index is len(list) - 1.',
    { question: 'What is ["a", "b", "c"][2]?', answer: 'c' }),
]

export const interventionsFor = (misconceptionId, mode) =>
  interventions.find(
    (entry) => entry.misconceptionId === misconceptionId && entry.mode === mode,
  ) || null

export const interventionsForMisconception = (misconceptionId) =>
  interventions.filter((entry) => entry.misconceptionId === misconceptionId)
