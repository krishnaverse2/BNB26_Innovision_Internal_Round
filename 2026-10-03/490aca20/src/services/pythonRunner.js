// ============================================================
// Mini Python-subset interpreter used by the Coding Lab.
// ------------------------------------------------------------
// This is NOT Python and it is NOT a trained model. It is a small,
// safe evaluator that covers the language subset used by the demo
// question bank: range/for/while/if/def/print, arithmetic,
// comparisons, strings and lists.
//
// User code is parsed into an AST and evaluated by this file. It is
// never passed to eval() or new Function(), so pasted code cannot
// execute arbitrary JavaScript in the browser.
// ============================================================

class PyError extends Error {}

// ---------------- Tokenizer ----------------

const TOKEN_PATTERN =
  /\s*(?:(\d+\.\d+|\d+)|("""[\s\S]*?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\*\*|\/\/|==|!=|<=|>=|[-+*/%<>=(),:\[\].])|([A-Za-z_][A-Za-z0-9_]*))/

const KEYWORDS = new Set(['and', 'or', 'not'])

function tokenize(source) {
  const tokens = []
  let rest = source
  while (rest.length) {
    const match = TOKEN_PATTERN.exec(rest)
    if (!match || match.index !== 0) {
      throw new PyError(`Cannot parse: ${rest.slice(0, 20)}`)
    }
    const [, number, string, operator, name] = match
    if (number) tokens.push({ type: 'number', value: Number(number) })
    else if (string) {
      const inner = string.startsWith('"""')
        ? string.slice(3, -3)
        : string.slice(1, -1)
      tokens.push({ type: 'string', value: inner })
    } else if (operator) tokens.push({ type: 'op', value: operator })
    else if (name) tokens.push({ type: 'name', value: name })
    rest = rest.slice(match[0].length)
  }
  return tokens
}

// ---------------- Expression parser ----------------

const CONSTANTS = { True: true, False: false, None: null }

class Parser {
  constructor(tokens) {
    this.tokens = tokens
    this.pos = 0
  }

  peek(offset = 0) {
    return this.tokens[this.pos + offset]
  }

  next() {
    return this.tokens[this.pos++]
  }

  expectOp(value) {
    const token = this.next()
    if (!token || token.type !== 'op' || token.value !== value) {
      throw new PyError(`Expected "${value}"`)
    }
  }

  parseExpression() {
    return this.parseOr()
  }

  parseOr() {
    let left = this.parseAnd()
    while (this.peek()?.type === 'name' && this.peek().value === 'or') {
      this.next()
      left = { type: 'logical', op: 'or', left, right: this.parseAnd() }
    }
    return left
  }

  parseAnd() {
    let left = this.parseNot()
    while (this.peek()?.type === 'name' && this.peek().value === 'and') {
      this.next()
      left = { type: 'logical', op: 'and', left, right: this.parseNot() }
    }
    return left
  }

  parseNot() {
    if (this.peek()?.type === 'name' && this.peek().value === 'not') {
      this.next()
      return { type: 'logical', op: 'not', operand: this.parseNot() }
    }
    return this.parseComparison()
  }

  parseComparison() {
    let left = this.parseAdditive()
    while (
      this.peek()?.type === 'op' &&
      ['==', '!=', '<', '>', '<=', '>='].includes(this.peek().value)
    ) {
      const op = this.next().value
      const right = this.parseAdditive()
      left = { type: 'binary', op, left, right }
    }
    return left
  }

  parseAdditive() {
    let left = this.parseMultiplicative()
    while (
      this.peek()?.type === 'op' &&
      ['+', '-'].includes(this.peek().value)
    ) {
      const op = this.next().value
      const right = this.parseMultiplicative()
      left = { type: 'binary', op, left, right }
    }
    return left
  }

  parseMultiplicative() {
    let left = this.parseUnary()
    while (
      this.peek()?.type === 'op' &&
      ['*', '/', '//', '%'].includes(this.peek().value)
    ) {
      const op = this.next().value
      const right = this.parseUnary()
      left = { type: 'binary', op, left, right }
    }
    return left
  }

  parseUnary() {
    if (this.peek()?.type === 'op' && this.peek().value === '-') {
      this.next()
      return { type: 'unary', op: '-', operand: this.parseUnary() }
    }
    if (this.peek()?.type === 'op' && this.peek().value === '+') {
      this.next()
      return this.parseUnary()
    }
    return this.parsePower()
  }

  parsePower() {
    const base = this.parseAtom()
    if (this.peek()?.type === 'op' && this.peek().value === '**') {
      this.next()
      return { type: 'binary', op: '**', left: base, right: this.parseUnary() }
    }
    return base
  }

  parseAtom() {
    const token = this.next()
    if (!token) throw new PyError('Unexpected end of expression')

    if (token.type === 'number' || token.type === 'string') {
      return { type: 'literal', value: token.value }
    }

    if (token.type === 'op' && token.value === '(') {
      const expression = this.parseExpression()
      this.expectOp(')')
      return expression
    }

    if (token.type === 'op' && token.value === '[') {
      const items = []
      if (!(this.peek()?.type === 'op' && this.peek().value === ']')) {
        items.push(this.parseExpression())
        while (this.peek()?.type === 'op' && this.peek().value === ',') {
          this.next()
          items.push(this.parseExpression())
        }
      }
      this.expectOp(']')
      return { type: 'list', items }
    }

    if (token.type === 'name') {
      if (token.value in CONSTANTS && !KEYWORDS.has(token.value)) {
        return { type: 'literal', value: CONSTANTS[token.value] }
      }
      let node = { type: 'name', name: token.value }

      // Postfix chain: calls, attribute access and subscripts/slices.
      for (;;) {
        const upcoming = this.peek()
        if (upcoming?.type === 'op' && upcoming.value === '(') {
          this.next()
          const args = []
          if (!(this.peek()?.type === 'op' && this.peek().value === ')')) {
            args.push(this.parseExpression())
            while (this.peek()?.type === 'op' && this.peek().value === ',') {
              this.next()
              args.push(this.parseExpression())
            }
          }
          this.expectOp(')')
          node = { type: 'call', target: node, args }
        } else if (upcoming?.type === 'op' && upcoming.value === '.') {
          this.next()
          const attribute = this.next()
          if (!attribute || attribute.type !== 'name') {
            throw new PyError('Expected an attribute name after "."')
          }
          node = { type: 'attribute', target: node, name: attribute.value }
        } else if (upcoming?.type === 'op' && upcoming.value === '[') {
          this.next()
          let start = null
          let end = null
          let isSlice = false
          if (!(this.peek()?.type === 'op' && this.peek().value === ':')) {
            start = this.parseExpression()
          }
          if (this.peek()?.type === 'op' && this.peek().value === ':') {
            this.next()
            isSlice = true
            if (!(this.peek()?.type === 'op' && this.peek().value === ']')) {
              end = this.parseExpression()
            }
          }
          this.expectOp(']')
          node = isSlice
            ? { type: 'slice', target: node, start, end }
            : { type: 'index', target: node, index: start }
        } else {
          break
        }
      }

      return node
    }

    throw new PyError(`Unexpected token: ${token.value}`)
  }
}

// ---------------- Line / block parsing ----------------

function splitLines(source) {
  return source
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/#.*$/, ''))
    .filter((line) => line.trim().length > 0)
    .map((line) => ({
      indent: line.length - line.trimStart().length,
      text: line.trim(),
    }))
}

function parseBlock(lines, startIndex, indent) {
  const body = []
  let index = startIndex

  while (index < lines.length && lines[index].indent >= indent) {
    const line = lines[index]
    if (line.indent > indent) {
      throw new PyError('Unexpected indentation')
    }
    const parsed = parseStatement(line.text)
    index += 1

    if (parsed.needsBody) {
      const childIndent = lines[index]?.indent
      if (childIndent === undefined || childIndent <= indent) {
        throw new PyError(`Expected an indented block after "${line.text}"`)
      }
      const result = parseBlock(lines, index, childIndent)
      parsed.node.body = result.body
      index = result.index

      while (parsed.node.alternates !== undefined) {
        const nextLine = lines[index]
        if (!nextLine || nextLine.indent !== indent) break
        if (nextLine.text.startsWith('elif ')) {
          const elif = parseStatement(nextLine.text)
          index += 1
          const child = parseBlock(lines, index, lines[index].indent)
          elif.node.body = child.body
          index = child.index
          parsed.node.alternates.push({ test: elif.node.test, body: elif.node.body })
        } else if (nextLine.text === 'else:') {
          index += 1
          const child = parseBlock(lines, index, lines[index].indent)
          parsed.node.otherwise = child.body
          index = child.index
        } else break
      }
    }

    body.push(parsed.node)
  }

  return { body, index }
}

function parseStatement(text) {
  if (text.startsWith('for ')) {
    const match = /^for\s+([A-Za-z_]\w*)\s+in\s+(.+):$/.exec(text)
    if (!match) throw new PyError(`Cannot parse for loop: ${text}`)
    return {
      needsBody: true,
      node: {
        type: 'for',
        variable: match[1],
        iterable: parseExpressionString(match[2]),
        body: [],
      },
    }
  }

  if (text.startsWith('while ')) {
    const match = /^while\s+(.+):$/.exec(text)
    if (!match) throw new PyError(`Cannot parse while loop: ${text}`)
    return {
      needsBody: true,
      node: { type: 'while', test: parseExpressionString(match[1]), body: [] },
    }
  }

  if (text.startsWith('if ')) {
    const match = /^if\s+(.+):$/.exec(text)
    if (!match) throw new PyError(`Cannot parse if: ${text}`)
    return {
      needsBody: true,
      node: {
        type: 'if',
        test: parseExpressionString(match[1]),
        body: [],
        alternates: [],
        otherwise: null,
      },
    }
  }

  if (text.startsWith('elif ')) {
    const match = /^elif\s+(.+):$/.exec(text)
    return {
      needsBody: true,
      node: { type: 'if', test: parseExpressionString(match[1]), body: [], alternates: [] },
    }
  }

  if (text.startsWith('def ')) {
    const match = /^def\s+([A-Za-z_]\w*)\s*\((.*)\):$/.exec(text)
    if (!match) throw new PyError(`Cannot parse def: ${text}`)
    const params = match[2]
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const [name, defaultValue] = part.split('=').map((s) => s.trim())
        return { name, default: defaultValue ? parseExpressionString(defaultValue) : null }
      })
    return {
      needsBody: true,
      node: { type: 'def', name: match[1], params, body: [] },
    }
  }

  if (text.startsWith('return')) {
    const rest = text.slice(6).trim()
    return {
      needsBody: false,
      node: { type: 'return', value: rest ? parseExpressionString(rest) : null },
    }
  }

  const augmented = /^([A-Za-z_]\w*)\s*(\+=|-=|\*=)\s*(.+)$/.exec(text)
  if (augmented) {
    const op = { '+=': '+', '-=': '-', '*=': '*' }[augmented[2]]
    return {
      needsBody: false,
      node: {
        type: 'assign',
        target: augmented[1],
        value: {
          type: 'binary',
          op,
          left: { type: 'name', name: augmented[1] },
          right: parseExpressionString(augmented[3]),
        },
      },
    }
  }

  const tupleAssignment = /^([A-Za-z_]\w*(?:\s*,\s*[A-Za-z_]\w*)+)\s*=\s*(.+)$/.exec(text)
  if (tupleAssignment) {
    const targets = tupleAssignment[1].split(',').map((part) => part.trim())
    const values = splitTopLevel(tupleAssignment[2])
    if (targets.length !== values.length) {
      throw new PyError(
        `ValueError: too many values to unpack (expected ${targets.length})`,
      )
    }
    return {
      needsBody: false,
      node: {
        type: 'assign-multi',
        targets,
        values: values.map((part) => parseExpressionString(part)),
      },
    }
  }

  const assignment = /^([A-Za-z_]\w*)\s*=\s*(.+)$/.exec(text)
  if (assignment && !assignment[2].startsWith('=')) {
    return {
      needsBody: false,
      node: {
        type: 'assign',
        target: assignment[1],
        value: parseExpressionString(assignment[2]),
      },
    }
  }

  return { needsBody: false, node: { type: 'expression', value: parseExpressionString(text) } }
}

function splitTopLevel(text) {
  const parts = []
  let depth = 0
  let current = ''
  for (const char of text) {
    if ('(['.includes(char)) depth += 1
    if (')]'.includes(char)) depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current)
      current = ''
      continue
    }
    current += char
  }
  parts.push(current)
  return parts.map((part) => part.trim()).filter(Boolean)
}

function parseExpressionString(text) {
  const parser = new Parser(tokenize(text))
  const node = parser.parseExpression()
  if (parser.pos < parser.tokens.length) {
    throw new PyError(`Trailing input in expression: ${text}`)
  }
  return node
}

// ---------------- Evaluator ----------------

class ReturnSignal {
  constructor(value) {
    this.value = value
  }
}

const MAX_STEPS = 20000

function makeScope(parent = null) {
  return { vars: Object.create(null), parent }
}

function lookup(scope, name) {
  let current = scope
  while (current) {
    if (name in current.vars) return current.vars[name]
    current = current.parent
  }
  throw new PyError(`NameError: name '${name}' is not defined`)
}

function assign(scope, name, value) {
  let current = scope
  while (current) {
    if (name in current.vars) {
      current.vars[name] = value
      return
    }
    current = current.parent
  }
  scope.vars[name] = value
}

// Python's true division always yields a float. Floats are carried as
// boxed Number objects so `4 / 2` prints as `2.0`, not `2`.
const makeFloat = (value) => {
  const boxed = new Number(value)
  boxed.pyFloat = true
  return boxed
}

const unwrap = (value) => (value instanceof Number ? value.valueOf() : value)

const isFloat = (value) => value instanceof Number && value.pyFloat === true

const isTruthy = (value) => {
  const raw = unwrap(value)
  if (raw === null || raw === undefined) return false
  if (typeof raw === 'boolean') return raw
  if (typeof raw === 'number') return raw !== 0
  if (typeof raw === 'string') return raw.length > 0
  if (Array.isArray(raw)) return raw.length > 0
  return true
}

function pyDivide(a, b, op) {
  const left = unwrap(a)
  const right = unwrap(b)
  if (right === 0) throw new PyError('ZeroDivisionError: division by zero')
  if (op === '/') return makeFloat(left / right)
  if (op === '//') return Math.floor(left / right)
  return left % right
}

function formatValue(value) {
  if (value === null || value === undefined) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`
  if (isFloat(value)) {
    const raw = value.valueOf()
    return Number.isInteger(raw) ? raw.toFixed(1) : String(raw)
  }
  if (typeof value === 'number') {
    return Number.isInteger(value) ? String(value) : String(value)
  }
  return String(value)
}

const LIST_METHODS = {
  append: (list, args) => {
    list.push(args[0])
    return null
  },
  sort: (list) => {
    list.sort((a, b) => (unwrap(a) < unwrap(b) ? -1 : unwrap(a) > unwrap(b) ? 1 : 0))
    return null
  },
  reverse: (list) => {
    list.reverse()
    return null
  },
  pop: (list, args) => (args.length ? list.splice(args[0], 1)[0] : list.pop()),
  insert: (list, args) => {
    list.splice(args[0], 0, args[1])
    return null
  },
}

const STRING_METHODS = {
  upper: (value) => value.toUpperCase(),
  lower: (value) => value.toLowerCase(),
  strip: (value) => value.trim(),
  split: (value, args) =>
    args.length ? value.split(String(unwrap(args[0]))) : value.split(/\s+/),
  replace: (value, args) =>
    value.split(String(unwrap(args[0]))).join(String(unwrap(args[1]))),
}

function callMethod(target, name, args) {
  if (Array.isArray(target)) {
    const method = LIST_METHODS[name]
    if (!method) throw new PyError(`AttributeError: list has no method '${name}'`)
    return method(target, args)
  }
  if (typeof target === 'string') {
    const method = STRING_METHODS[name]
    if (!method) throw new PyError(`AttributeError: str has no method '${name}'`)
    return method(target, args)
  }
  throw new PyError(`AttributeError: '${name}' is not supported by the demo runner`)
}

function callBuiltin(name, args, runtime) {
  const numeric = args.map((arg) => unwrap(arg))
  switch (name) {
    case 'range': {
      let start = 0
      let stop
      let step = 1
      if (args.length === 1) stop = numeric[0]
      else if (args.length === 2) [start, stop] = numeric
      else [start, stop, step] = numeric
      if (step === 0) throw new PyError('ValueError: range() step must not be zero')
      const out = []
      if (step > 0) {
        for (let i = start; i < stop; i += step) out.push(i)
      } else {
        for (let i = start; i > stop; i += step) out.push(i)
      }
      return out
    }
    case 'len':
      return numeric[0] !== undefined && typeof args[0] !== 'string'
        ? args[0].length
        : String(args[0]).length
    case 'print': {
      runtime.output.push(args.map(formatValue).join(' '))
      return null
    }
    case 'int':
      return Math.trunc(Number(args[0]))
    case 'str':
      return formatValue(args[0])
    case 'float':
      return makeFloat(Number(args[0]))
    case 'abs':
      return Math.abs(numeric[0])
    case 'sum':
      return args[0].reduce((total, n) => total + unwrap(n), 0)
    default:
      throw new PyError(`NameError: '${name}' is not supported by the demo runner`)
  }
}

function evaluate(node, scope, runtime) {
  runtime.steps += 1
  if (runtime.steps > MAX_STEPS) {
    throw new PyError('Stopped: too many steps (possible infinite loop)')
  }

  switch (node.type) {
    case 'literal':
      return node.value
    case 'name':
      return lookup(scope, node.name)
    case 'list':
      return node.items.map((item) => evaluate(item, scope, runtime))
    case 'index': {
      const target = evaluate(node.target, scope, runtime)
      let index = unwrap(evaluate(node.index, scope, runtime))
      if (typeof target === 'string' || Array.isArray(target)) {
        if (index < 0) index += target.length
        if (index < 0 || index >= target.length) {
          const kind = Array.isArray(target) ? 'list' : 'string'
          throw new PyError(`IndexError: ${kind} index out of range`)
        }
        return target[index]
      }
      throw new PyError('TypeError: object is not subscriptable')
    }
    case 'slice': {
      const target = evaluate(node.target, scope, runtime)
      if (typeof target !== 'string' && !Array.isArray(target)) {
        throw new PyError('TypeError: object is not subscriptable')
      }
      const length = target.length
      let start = node.start ? unwrap(evaluate(node.start, scope, runtime)) : 0
      let end = node.end ? unwrap(evaluate(node.end, scope, runtime)) : length
      if (start < 0) start += length
      if (end < 0) end += length
      return target.slice(start, end)
    }
    case 'attribute':
      // Bare attribute access has no meaning outside a method call.
      throw new PyError(`AttributeError: cannot read '${node.name}' here`)
    case 'logical': {
      if (node.op === 'not') {
        return !isTruthy(evaluate(node.operand, scope, runtime))
      }
      const left = evaluate(node.left, scope, runtime)
      if (node.op === 'and') {
        return isTruthy(left) ? evaluate(node.right, scope, runtime) : left
      }
      return isTruthy(left) ? left : evaluate(node.right, scope, runtime)
    }
    case 'unary':
      return -unwrap(evaluate(node.operand, scope, runtime))
    case 'binary': {
      const rawLeft = evaluate(node.left, scope, runtime)
      const rawRight = evaluate(node.right, scope, runtime)
      const left = unwrap(rawLeft)
      const right = unwrap(rawRight)

      switch (node.op) {
        case '+':
          if (typeof left === 'string' || typeof right === 'string') {
            if (typeof left !== typeof right) {
              throw new PyError(
                `TypeError: can only concatenate str (not "${
                  typeof left === 'string' ? typeof right : typeof left
                }") to str`,
              )
            }
            return left + right
          }
          if (Array.isArray(left) && Array.isArray(right)) return [...left, ...right]
          if (isFloat(rawLeft) || isFloat(rawRight)) return makeFloat(left + right)
          return left + right
        case '-':
          return left - right
        case '*':
          if (typeof left === 'string' && typeof right === 'number') {
            return left.repeat(right)
          }
          if (Array.isArray(left) && typeof right === 'number') {
            return Array.from({ length: right }, () => [...left]).flat()
          }
          return left * right
        case '/':
        case '//':
        case '%':
          return pyDivide(left, right, node.op)
        case '**':
          return left ** right
        case '==':
          if (Array.isArray(left) && Array.isArray(right)) {
            return (
              left.length === right.length &&
              left.every((item, i) => unwrap(item) === unwrap(right[i]))
            )
          }
          return left === right
        case '!=':
          return !(left === right)
        case '<':
          return left < right
        case '>':
          return left > right
        case '<=':
          return left <= right
        case '>=':
          return left >= right
        default:
          throw new PyError(`Unsupported operator: ${node.op}`)
      }
    }
    case 'call': {
      const args = node.args.map((arg) => evaluate(arg, scope, runtime))
      if (node.target.type === 'attribute') {
        const object = evaluate(node.target.target, scope, runtime)
        return callMethod(object, node.target.name, args)
      }
      const name = node.target.name
      if (name in runtime.functions) return runtime.functions[name](args)
      return callBuiltin(name, args, runtime)
    }
    default:
      throw new PyError(`Cannot evaluate node: ${node.type}`)
  }
}

function execute(body, scope, runtime) {
  for (const node of body) {
    switch (node.type) {
      case 'assign':
        assign(scope, node.target, evaluate(node.value, scope, runtime))
        break
      case 'assign-multi':
        // Evaluate the whole right-hand side before binding any name.
        node.values
          .map((value) => evaluate(value, scope, runtime))
          .forEach((value, i) => assign(scope, node.targets[i], value))
        break
      case 'expression':
        evaluate(node.value, scope, runtime)
        break
      case 'print':
        break
      case 'return':
        throw new ReturnSignal(
          node.value ? evaluate(node.value, scope, runtime) : null,
        )
      case 'for': {
        const iterable = evaluate(node.iterable, scope, runtime)
        if (typeof iterable === 'string') {
          for (const ch of iterable) {
            assign(scope, node.variable, ch)
            execute(node.body, scope, runtime)
          }
        } else if (Array.isArray(iterable)) {
          for (const item of iterable) {
            assign(scope, node.variable, item)
            execute(node.body, scope, runtime)
          }
        } else {
          throw new PyError('TypeError: object is not iterable')
        }
        break
      }
      case 'while': {
        let guard = 0
        while (evaluate(node.test, scope, runtime)) {
          guard += 1
          if (guard > 1000) {
            throw new PyError('Stopped: loop did not terminate (infinite loop)')
          }
          execute(node.body, scope, runtime)
        }
        break
      }
      case 'if': {
        if (evaluate(node.test, scope, runtime)) {
          execute(node.body, scope, runtime)
          break
        }
        let handled = false
        for (const alternate of node.alternates || []) {
          if (evaluate(alternate.test, scope, runtime)) {
            execute(alternate.body, scope, runtime)
            handled = true
            break
          }
        }
        if (!handled && node.otherwise) execute(node.otherwise, scope, runtime)
        break
      }
      case 'def': {
        const definition = node
        // Python evaluates default values once, at definition time. That is
        // why a mutable default (box=[]) is shared between calls.
        const defaults = definition.params.map((param) =>
          param.default ? evaluate(param.default, scope, runtime) : undefined,
        )
        runtime.functions[definition.name] = (args) => {
          const local = makeScope(scope)
          definition.params.forEach((param, i) => {
            local.vars[param.name] = i < args.length ? args[i] : defaults[i]
          })
          try {
            execute(definition.body, local, runtime)
          } catch (error) {
            if (error instanceof ReturnSignal) return error.value
            throw error
          }
          return null
        }
        break
      }
      default:
        throw new PyError(`Cannot execute statement: ${node.type}`)
    }
  }
}

/**
 * Run a snippet and return { ok, output, error }.
 * `output` is the joined stdout, matching Python's line-per-print shape.
 */
export function runPython(source) {
  try {
    const lines = splitLines(source)
    if (!lines.length) return { ok: true, output: '', error: null }

    const { body } = parseBlock(lines, 0, lines[0].indent)
    const runtime = { output: [], functions: Object.create(null), steps: 0 }
    execute(body, makeScope(), runtime)
    return { ok: true, output: runtime.output.join('\n'), error: null }
  } catch (error) {
    return { ok: false, output: '', error: error.message || String(error) }
  }
}

export const runnerMeta = {
  name: 'Re:Learn demo code runner',
  note: 'A safe subset interpreter for the snippets in the demo question bank. It is not CPython and not a model.',
  supports: [
    'for / range / while',
    'if / elif / else',
    'def with default parameters and return',
    'arithmetic, comparisons, strings and lists',
    'print, len, int, str, float, abs, sum',
  ],
}
