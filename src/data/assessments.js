// ============================================================
// DEMO DATA — assessment bank for the Re:Learn prototype.
// `type` matches the evidence type used by the Learning Stability
// Check, so an assessment can be reused as a stability probe.
// ============================================================

const A = (id, type, question, expectedAnswer, misconceptionId, concept, code = null) => ({
  id,
  type,
  question,
  code,
  expectedAnswer,
  misconceptionId,
  concept,
})

export const assessments = [
  A('as-01', 'output-prediction', 'What is the output?', '1\n2\n3\n4', 'm-range-endpoint', 'loops',
    'for i in range(1, 5):\n    print(i)'),
  A('as-02', 'output-prediction', 'What numbers are produced?', '3\n4\n5\n6\n7', 'm-range-endpoint', 'loops',
    'for i in range(3, 8):\n    print(i)'),
  A('as-03', 'output-prediction', 'What is the output with a step value?', '4\n6\n8', 'm-range-endpoint', 'loops',
    'for i in range(4, 10, 2):\n    print(i)'),
  A('as-04', 'multiple-choice', 'How many values does range(2, 9) produce?', '7', 'm-loop-off-by-one', 'loops'),
  A('as-05', 'debugging', 'A student expected 1,2,3,4,5. What is the misunderstanding?',
    'They believe the stop value of range() is included', 'm-range-endpoint', 'loops',
    'for i in range(1, 5):\n    print(i)'),
  A('as-06', 'explanation', 'Explain why the final number is not included in Python range().',
    'range() stops before the stop value; the stop value is exclusive', 'm-range-endpoint', 'loops'),
  A('as-07', 'transfer', 'What does list slicing nums[1:4] return for [1,2,3,4,5]?', '[2, 3, 4]',
    'm-range-endpoint', 'lists', 'nums = [1, 2, 3, 4, 5]\nprint(nums[1:4])'),
  A('as-08', 'output-prediction', 'What is the output?', '0\n1\n2', 'm-loop-off-by-one', 'loops',
    'for i in range(3):\n    print(i)'),
  A('as-09', 'output-prediction', 'What is the output?', '5\n4\n3\n2\n1', 'm-range-endpoint', 'loops',
    'for i in range(5, 0, -1):\n    print(i)'),
  A('as-10', 'multiple-choice', 'How many lines does a 3 x 4 nested loop print?', '12',
    'm-nested-loop-count', 'loops'),
  A('as-11', 'debugging', 'This loop never ends. What is missing?',
    'The condition variable is never updated inside the body', 'm-while-condition', 'loops',
    'count = 0\nwhile count < 3:\n    print(count)'),
  A('as-12', 'explanation', 'Explain what must change inside a while loop for it to terminate.',
    'Something in the body must eventually make the condition False', 'm-while-condition', 'loops'),
  A('as-13', 'output-prediction', 'What is the output?', '6', 'm-loop-off-by-one', 'loops',
    'total = 0\nfor i in range(1, 4):\n    total = total + i\nprint(total)'),
  A('as-14', 'multiple-choice', 'Which line compares two values?', 'a == b',
    'm-assignment-vs-equality', 'conditions'),
  A('as-15', 'output-prediction', 'What is printed?', 'teen', 'm-boolean-operator', 'conditions',
    'age = 16\nif age < 13 or age > 19:\n    print("out")\nelse:\n    print("teen")'),
  A('as-16', 'output-prediction', 'What is printed?', 'False', 'm-boolean-operator', 'conditions',
    'a = True\nb = False\nprint(a and b)'),
  A('as-17', 'explanation', 'Explain when you would choose or instead of and.',
    'or when at least one condition being true is enough', 'm-boolean-operator', 'conditions'),
  A('as-18', 'output-prediction', 'What is the value of the expression?', 'True',
    'm-negation-placement', 'conditions', 'result = not (4 > 2 and 1 > 9)\nprint(result)'),
  A('as-19', 'debugging', 'The condition never becomes true. What is wrong with the negation?',
    'not is applied to only part of the compound condition', 'm-negation-placement', 'conditions'),
  A('as-20', 'output-prediction', 'What is printed?', 'warm', 'm-boolean-operator', 'conditions',
    'temp = 25\nif temp > 30:\n    print("hot")\nelif temp > 20:\n    print("warm")\nelse:\n    print("cold")'),
  A('as-21', 'output-prediction', 'What is printed?', '5', 'm-variable-snapshot', 'variables',
    'x = 5\ny = x\nx = 9\nprint(y)'),
  A('as-22', 'explanation', 'Explain why changing x does not change y.',
    'Assignment copies the value at that moment', 'm-variable-snapshot', 'variables'),
  A('as-23', 'debugging', 'This code raises NameError. Why?',
    'total is local to setup() and does not exist outside it', 'm-variable-scope', 'variables',
    'def setup():\n    total = 5\nsetup()\nprint(total)'),
  A('as-24', 'output-prediction', 'What is printed?', 'TypeError', 'm-type-coercion', 'variables',
    'value = "7"\nprint(value + 3)'),
  A('as-25', 'multiple-choice', 'What does input() always return?', 'A string',
    'm-type-coercion', 'variables'),
  A('as-26', 'output-prediction', 'What is stored in result?', 'None', 'm-return-vs-print', 'functions',
    'def double(n):\n    print(n * 2)\nresult = double(4)'),
  A('as-27', 'explanation', 'Explain the difference between returning and printing a value.',
    'return passes a value back to the caller, print only displays it', 'm-return-vs-print', 'functions'),
  A('as-28', 'output-prediction', 'What does this print?', '-7', 'm-param-order', 'functions',
    'def sub(a, b):\n    return a - b\nprint(sub(2, 9))'),
  A('as-29', 'output-prediction', 'What does the second call print?', '[1, 2]',
    'm-default-argument', 'functions',
    'def add(v, box=[]):\n    box.append(v)\n    return box\nadd(1)\nprint(add(2))'),
  A('as-30', 'output-prediction', 'Which element is printed?', '6', 'm-negative-index', 'lists',
    'nums = [4, 5, 6, 7]\nprint(nums[-2])'),
]

export const assessmentTypes = [
  { id: 'output-prediction', label: 'Output Prediction' },
  { id: 'multiple-choice', label: 'Multiple Choice' },
  { id: 'debugging', label: 'Debugging' },
  { id: 'explanation', label: 'Explanation' },
  { id: 'transfer', label: 'Transfer' },
]

export const assessmentsByType = (type) => assessments.filter((a) => a.type === type)

export const assessmentLabel = (type) =>
  assessmentTypes.find((t) => t.id === type)?.label || type
