// ============================================================
// DEMO DATA — synthetic seed data created for the Re:Learn
// prototype. Not collected from real students.
// ============================================================

export const concepts = [
  { id: 'variables', name: 'Variables', icon: '📦' },
  { id: 'conditions', name: 'Conditions', icon: '🔀' },
  { id: 'loops', name: 'Loops', icon: '🔁' },
  { id: 'functions', name: 'Functions', icon: '⚙️' },
  { id: 'lists', name: 'Lists and Indexing', icon: '🗂️' },
]

export const misconceptions = [
  {
    id: 'm-range-endpoint',
    concept: 'loops',
    name: 'Range Endpoint Confusion',
    description:
      'The student treats the stop value of range() as included, so loop output contains one extra number.',
    evidence: [
      'Prediction contains the stop value of range()',
      'Code structure uses range(start, stop)',
      'Actual output stops one value earlier',
      'Previous attempts show the same boundary error',
    ],
    intervention: {
      headline: 'In Python, the stop value in range() is not included.',
      visual: { start: 1, stop: 5 },
      examples: [
        { code: 'range(1, 5)', output: '1 2 3 4' },
        { code: 'range(1, 6)', output: '1 2 3 4 5' },
      ],
      practice: {
        question: 'What does range(3, 7) produce?',
        answer: '3 4 5 6',
      },
      explain:
        'Explain in your own words why 7 is not included in range(3, 7).',
    },
    diagnostic: {
      question: 'What will this Python code print?',
      code: 'for i in range(2, 6):\n    print(i)',
      hypothesis: 'The student may believe that range() includes the ending number.',
      options: [
        { key: 'A', text: '2 3 4 5', correct: true },
        { key: 'B', text: '2 3 4 5 6', correct: false },
        { key: 'C', text: '1 2 3 4 5', correct: false },
        { key: 'D', text: '2 3 4', correct: false },
      ],
      supportingMessage:
        'Your answer supports the idea that you understand the range boundary better.',
      nonSupportingMessage: 'The misconception may still be present.',
    },
  },
  {
    id: 'm-loop-off-by-one',
    concept: 'loops',
    name: 'Off-By-One Iteration Count',
    description:
      'The student miscounts how many times a loop body runs, usually by counting the stop value as an iteration.',
    evidence: [
      'Reported iteration count is one higher than actual',
      'Accumulator final value reflects the extra pass',
    ],
    intervention: {
      headline: 'Count the values produced, not the numbers written in range().',
      examples: [
        { code: 'for i in range(4): pass  # runs 4 times', output: 'i = 0 1 2 3' },
        { code: 'for i in range(2, 9): pass  # runs 7 times', output: '9 - 2 = 7' },
      ],
      practice: {
        question: 'How many times does range(5, 12) iterate?',
        answer: '7',
      },
      explain: 'Explain why range(a, b) iterates exactly b - a times.',
    },
    diagnostic: {
      question: 'How many times does this loop print?',
      code: 'for i in range(3, 10):\n    print(i)',
      options: [
        { key: 'A', text: '7 times', correct: true },
        { key: 'B', text: '8 times', correct: false },
        { key: 'C', text: '10 times', correct: false },
        { key: 'D', text: '6 times', correct: false },
      ],
      supportingMessage: 'You counted the iterations using stop minus start.',
      nonSupportingMessage: 'The iteration count still looks uncertain.',
    },
  },
  {
    id: 'm-nested-loop-count',
    concept: 'loops',
    name: 'Nested Loop Iteration Miscount',
    description:
      'The student adds inner and outer loop counts instead of multiplying them.',
    evidence: ['Total printed lines reported as sum instead of product'],
    intervention: {
      headline: 'Inner loops restart fully for every single outer iteration.',
      examples: [
        {
          code: 'for i in range(2):\n    for j in range(3):\n        print(i, j)',
          output: '6 lines: 2 x 3',
        },
      ],
      practice: {
        question: 'How many lines does range(3) nested inside range(4) print?',
        answer: '12',
      },
      explain: 'Explain why nested loop totals multiply rather than add.',
    },
    diagnostic: {
      question: 'How many lines are printed?',
      code: 'for i in range(3):\n    for j in range(4):\n        print("*")',
      options: [
        { key: 'A', text: '12', correct: true },
        { key: 'B', text: '7', correct: false },
        { key: 'C', text: '9', correct: false },
        { key: 'D', text: '16', correct: false },
      ],
      supportingMessage: 'You multiplied the loop counts correctly.',
      nonSupportingMessage: 'Nested loop counting may still be unclear.',
    },
  },
  {
    id: 'm-while-condition',
    concept: 'loops',
    name: 'While Condition Blindness',
    description:
      'The student expects a while loop to stop without checking whether the condition can ever become false.',
    evidence: ['Predicted a finite output for a loop that never terminates'],
    intervention: {
      headline: 'A while loop only stops when its condition becomes False.',
      examples: [
        { code: 'n = 1\nwhile n < 5:\n    n = n + 1', output: 'stops at n = 5' },
        { code: 'n = 1\nwhile n < 5:\n    n = n - 1', output: 'never stops' },
      ],
      practice: {
        question: 'Does `while x > 0: x = x + 1` terminate?',
        answer: 'No',
      },
      explain: 'Explain what must change inside a while loop body for it to end.',
    },
    diagnostic: {
      question: 'What happens here?',
      code: 'count = 0\nwhile count < 3:\n    print(count)',
      options: [
        { key: 'A', text: 'It never stops', correct: true },
        { key: 'B', text: 'Prints 0 1 2', correct: false },
        { key: 'C', text: 'Prints 0 1 2 3', correct: false },
        { key: 'D', text: 'Prints nothing', correct: false },
      ],
      supportingMessage: 'You spotted that count never changes.',
      nonSupportingMessage: 'Loop termination still needs attention.',
    },
  },
  {
    id: 'm-assignment-vs-equality',
    concept: 'conditions',
    name: 'Assignment vs Equality Confusion',
    description:
      'The student reads `=` as a comparison and `==` as an assignment.',
    evidence: ['Predicted a boolean result from a single equals sign'],
    intervention: {
      headline: '`=` stores a value. `==` asks a question.',
      examples: [
        { code: 'x = 5', output: 'x now holds 5' },
        { code: 'x == 5', output: 'True' },
      ],
      practice: { question: 'What does `7 == 7` evaluate to?', answer: 'True' },
      explain: 'Explain the difference between = and == in one sentence.',
    },
    diagnostic: {
      question: 'Which line compares two values?',
      code: 'a = 3\nb = 4',
      options: [
        { key: 'A', text: 'a == b', correct: true },
        { key: 'B', text: 'a = b', correct: false },
        { key: 'C', text: 'a := b', correct: false },
        { key: 'D', text: 'a -> b', correct: false },
      ],
      supportingMessage: 'You identified the comparison operator.',
      nonSupportingMessage: 'Operator roles are still mixed up.',
    },
  },
  {
    id: 'm-boolean-operator',
    concept: 'conditions',
    name: 'And/Or Truth Table Error',
    description:
      'The student applies `and` where `or` is required, producing an over-strict condition.',
    evidence: ['Condition evaluated False when one half was True'],
    intervention: {
      headline: '`and` needs both sides True. `or` needs only one.',
      examples: [
        { code: 'True and False', output: 'False' },
        { code: 'True or False', output: 'True' },
      ],
      practice: { question: 'What is `False or True`?', answer: 'True' },
      explain: 'Explain when you would choose `or` instead of `and`.',
    },
    diagnostic: {
      question: 'What does this print?',
      code: 'age = 16\nif age < 13 or age > 19:\n    print("out")\nelse:\n    print("teen")',
      options: [
        { key: 'A', text: 'teen', correct: true },
        { key: 'B', text: 'out', correct: false },
        { key: 'C', text: 'nothing', correct: false },
        { key: 'D', text: 'error', correct: false },
      ],
      supportingMessage: 'You evaluated the or-condition correctly.',
      nonSupportingMessage: 'Boolean operator handling needs more work.',
    },
  },
  {
    id: 'm-negation-placement',
    concept: 'conditions',
    name: 'Negation Misplacement',
    description:
      'The student negates only part of a compound condition instead of the whole expression.',
    evidence: ['not (a and b) treated as (not a) and b'],
    intervention: {
      headline: '`not` flips the value immediately to its right.',
      examples: [
        { code: 'not (True and False)', output: 'True' },
        { code: '(not True) and False', output: 'False' },
      ],
      practice: { question: 'What is `not (3 > 5)`?', answer: 'True' },
      explain: 'Explain how parentheses change what `not` applies to.',
    },
    diagnostic: {
      question: 'What is the value of this expression?',
      code: 'result = not (4 > 2 and 1 > 9)',
      options: [
        { key: 'A', text: 'True', correct: true },
        { key: 'B', text: 'False', correct: false },
        { key: 'C', text: 'None', correct: false },
        { key: 'D', text: 'Error', correct: false },
      ],
      supportingMessage: 'You applied negation to the whole expression.',
      nonSupportingMessage: 'Negation scope is still unclear.',
    },
  },
  {
    id: 'm-variable-snapshot',
    concept: 'variables',
    name: 'Variable Snapshot Belief',
    description:
      'The student believes a variable keeps the value it had when another variable was created from it.',
    evidence: ['Predicted stale value after the source variable changed'],
    intervention: {
      headline: 'Assignment copies the value at that moment, not a live link.',
      examples: [
        { code: 'a = 1\nb = a\na = 9\nprint(b)', output: '1' },
      ],
      practice: { question: 'After x = 5; y = x; x = 0, what is y?', answer: '5' },
      explain: 'Explain why changing x does not change y.',
    },
    diagnostic: {
      question: 'What does this print?',
      code: 'a = 2\nb = a\na = 10\nprint(b)',
      options: [
        { key: 'A', text: '2', correct: true },
        { key: 'B', text: '10', correct: false },
        { key: 'C', text: '12', correct: false },
        { key: 'D', text: 'None', correct: false },
      ],
      supportingMessage: 'You treated the assignment as a snapshot.',
      nonSupportingMessage: 'Variable copying behaviour still needs work.',
    },
  },
  {
    id: 'm-variable-scope',
    concept: 'variables',
    name: 'Scope Boundary Confusion',
    description:
      'The student expects a variable created inside a function to be visible outside it.',
    evidence: ['Predicted a value for a name that is out of scope'],
    intervention: {
      headline: 'Names created inside a function disappear when it returns.',
      examples: [
        { code: 'def f():\n    x = 1\nf()\nprint(x)', output: 'NameError' },
      ],
      practice: { question: 'Can code outside a function read a local variable?', answer: 'No' },
      explain: 'Explain what "local scope" means.',
    },
    diagnostic: {
      question: 'What happens when this runs?',
      code: 'def setup():\n    total = 5\nsetup()\nprint(total)',
      options: [
        { key: 'A', text: 'NameError', correct: true },
        { key: 'B', text: '5', correct: false },
        { key: 'C', text: 'None', correct: false },
        { key: 'D', text: '0', correct: false },
      ],
      supportingMessage: 'You recognised the scope boundary.',
      nonSupportingMessage: 'Scope rules are still uncertain.',
    },
  },
  {
    id: 'm-type-coercion',
    concept: 'variables',
    name: 'Type Coercion Assumption',
    description:
      'The student assumes Python will silently convert between strings and numbers.',
    evidence: ['Predicted arithmetic on a string input'],
    intervention: {
      headline: 'Python refuses to mix str and int in arithmetic.',
      examples: [
        { code: '"5" + 5', output: 'TypeError' },
        { code: 'int("5") + 5', output: '10' },
      ],
      practice: { question: 'What does `"3" * 2` produce?', answer: '33' },
      explain: 'Explain why input() always returns a string.',
    },
    diagnostic: {
      question: 'What is the result?',
      code: 'value = "7"\nprint(value + 3)',
      options: [
        { key: 'A', text: 'TypeError', correct: true },
        { key: 'B', text: '10', correct: false },
        { key: 'C', text: '73', correct: false },
        { key: 'D', text: 'None', correct: false },
      ],
      supportingMessage: 'You predicted the type error.',
      nonSupportingMessage: 'Type handling needs revisiting.',
    },
  },
  {
    id: 'm-return-vs-print',
    concept: 'functions',
    name: 'Return vs Print Confusion',
    description:
      'The student believes printing a value inside a function makes it available to the caller.',
    evidence: ['Used the printed value in a later expression'],
    intervention: {
      headline: 'print() shows a value. return hands it back to the caller.',
      examples: [
        { code: 'def f():\n    print(3)\nx = f()\nprint(x)', output: '3 then None' },
        { code: 'def f():\n    return 3\nx = f()\nprint(x)', output: '3' },
      ],
      practice: { question: 'What is x after `def f(): print(1)` then `x = f()`?', answer: 'None' },
      explain: 'Explain the difference between returning and printing.',
    },
    diagnostic: {
      question: 'What is stored in result?',
      code: 'def double(n):\n    print(n * 2)\nresult = double(4)',
      options: [
        { key: 'A', text: 'None', correct: true },
        { key: 'B', text: '8', correct: false },
        { key: 'C', text: '4', correct: false },
        { key: 'D', text: '0', correct: false },
      ],
      supportingMessage: 'You distinguished printing from returning.',
      nonSupportingMessage: 'Return semantics still need work.',
    },
  },
  {
    id: 'm-param-order',
    concept: 'functions',
    name: 'Parameter Order Confusion',
    description:
      'The student matches arguments to parameters by value rather than by position.',
    evidence: ['Swapped arguments produced a different but plausible result'],
    intervention: {
      headline: 'Positional arguments bind left to right.',
      examples: [
        { code: 'def f(a, b):\n    return a - b\nf(10, 3)', output: '7' },
        { code: 'f(3, 10)', output: '-7' },
      ],
      practice: { question: 'In `def g(x, y)`, which argument does the first value bind to?', answer: 'x' },
      explain: 'Explain how positional binding works.',
    },
    diagnostic: {
      question: 'What does this print?',
      code: 'def sub(a, b):\n    return a - b\nprint(sub(2, 9))',
      options: [
        { key: 'A', text: '-7', correct: true },
        { key: 'B', text: '7', correct: false },
        { key: 'C', text: '11', correct: false },
        { key: 'D', text: 'Error', correct: false },
      ],
      supportingMessage: 'You bound the arguments in order.',
      nonSupportingMessage: 'Parameter order still trips you up.',
    },
  },
  {
    id: 'm-default-argument',
    concept: 'functions',
    name: 'Shared Default Argument',
    description:
      'The student expects a mutable default argument to be recreated on every call.',
    evidence: ['Predicted a fresh list on the second call'],
    intervention: {
      headline: 'A default value is created once, when the function is defined.',
      examples: [
        { code: 'def add(x, items=[]):\n    items.append(x)\n    return items', output: 'shared across calls' },
      ],
      practice: { question: 'What should a safe default for a list parameter be?', answer: 'None' },
      explain: 'Explain why `def f(x=[])` is risky.',
    },
    diagnostic: {
      question: 'What does the second call return?',
      code: 'def add(v, box=[]):\n    box.append(v)\n    return box\nadd(1)\nprint(add(2))',
      options: [
        { key: 'A', text: '[1, 2]', correct: true },
        { key: 'B', text: '[2]', correct: false },
        { key: 'C', text: '[]', correct: false },
        { key: 'D', text: 'Error', correct: false },
      ],
      supportingMessage: 'You knew the default list persists.',
      nonSupportingMessage: 'Default argument behaviour needs review.',
    },
  },
  {
    id: 'm-index-starts-at-one',
    concept: 'lists',
    name: 'Index Starts At One',
    description:
      'The student counts list positions from 1 instead of 0.',
    evidence: ['Accessed items[1] expecting the first element'],
    intervention: {
      headline: 'Python list positions start at 0.',
      examples: [
        { code: 'nums = [10, 20, 30]\nnums[0]', output: '10' },
      ],
      practice: { question: 'What is `["a","b","c"][2]`?', answer: 'c' },
      explain: 'Explain why the last index is len(list) - 1.',
    },
    diagnostic: {
      question: 'Which value is printed?',
      code: 'letters = ["a", "b", "c"]\nprint(letters[1])',
      options: [
        { key: 'A', text: 'b', correct: true },
        { key: 'B', text: 'a', correct: false },
        { key: 'C', text: 'c', correct: false },
        { key: 'D', text: 'Error', correct: false },
      ],
      supportingMessage: 'You counted from zero.',
      nonSupportingMessage: 'Indexing base is still off by one.',
    },
  },
  {
    id: 'm-negative-index',
    concept: 'lists',
    name: 'Negative Index Misread',
    description:
      'The student reads a negative index as an error or as counting from the start.',
    evidence: ['Predicted an IndexError for a valid negative index'],
    intervention: {
      headline: 'Negative indices count backwards from the last element.',
      examples: [
        { code: 'nums = [1, 2, 3]\nnums[-1]', output: '3' },
        { code: 'nums[-3]', output: '1' },
      ],
      practice: { question: 'What is `[5, 6, 7][-2]`?', answer: '6' },
      explain: 'Explain what items[-1] always refers to.',
    },
    diagnostic: {
      question: 'What is printed?',
      code: 'nums = [4, 5, 6, 7]\nprint(nums[-2])',
      options: [
        { key: 'A', text: '6', correct: true },
        { key: 'B', text: '5', correct: false },
        { key: 'C', text: '7', correct: false },
        { key: 'D', text: 'IndexError', correct: false },
      ],
      supportingMessage: 'You counted backwards correctly.',
      nonSupportingMessage: 'Negative indexing still needs practice.',
    },
  },
]

export const misconceptionById = misconceptions.reduce((acc, m) => {
  acc[m.id] = m
  return acc
}, {})

export const getMisconception = (id) => misconceptionById[id] || null

export const misconceptionsByConcept = (conceptId) =>
  misconceptions.filter((m) => m.concept === conceptId)

export const PRIMARY_MISCONCEPTION_ID = 'm-range-endpoint'
