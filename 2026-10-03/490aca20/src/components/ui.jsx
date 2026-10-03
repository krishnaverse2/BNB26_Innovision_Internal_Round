import { CheckCircle2 } from 'lucide-react'

export function Card({ className = '', accent = false, dark = false, children, ...rest }) {
  const classes = ['card', accent ? 'accent' : '', dark ? 'dark' : '', className]
    .filter(Boolean)
    .join(' ')
  return (
    <section className={classes} {...rest}>
      {children}
    </section>
  )
}

export function CardHeader({ title, subtitle, icon, actions }) {
  return (
    <div className="card-header">
      <div>
        <div className="card-title">
          {icon}
          {title}
        </div>
        {subtitle ? <div className="card-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="row" style={{ gap: 8 }}>{actions}</div> : null}
    </div>
  )
}

export function StatCard({ icon, tone = 'blue', value, label, delta, deltaTone }) {
  return (
    <Card className="stat-card animate-rise">
      {icon ? <div className={`stat-icon tone-${tone}`}>{icon}</div> : null}
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {delta ? (
        <span className={`stat-delta tone-${deltaTone || tone}`}>{delta}</span>
      ) : null}
    </Card>
  )
}

export function Pill({ tone = 'neutral', children, className = '' }) {
  return <span className={`pill ${tone} ${className}`.trim()}>{children}</span>
}

export function ProgressBar({
  name,
  value,
  status,
  tone = 'blue',
  showStatus = true,
  suffix = '%',
  max = 100,
}) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="progress-row">
      <span className="progress-name">{name}</span>
      <span className="progress-value">
        {value}
        {suffix}
      </span>
      <div className="progress-track">
        <div
          className={`progress-fill ${tone}`}
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </div>
      {showStatus && status ? (
        <div className="progress-meta">
          <Pill tone={tone === 'stable' || tone === 'developing' || tone === 'attention' ? tone : 'neutral'}>
            {status}
          </Pill>
        </div>
      ) : null}
    </div>
  )
}

const PY_TOKEN =
  /(#[^\n]*)|("""[\s\S]*?"""|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|\b(for|while|if|elif|else|def|return|in|not|and|or|import|from|break|continue|pass|True|False|None)\b|\b(print|range|len|int|str|float|abs|sum|input)\b|\b(\d+(?:\.\d+)?)\b/g

function highlight(line) {
  const parts = []
  let lastIndex = 0
  let match
  PY_TOKEN.lastIndex = 0

  while ((match = PY_TOKEN.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ text: line.slice(lastIndex, match.index), type: null })
    }
    const [full, comment, string, keyword, builtin, number] = match
    const type = comment
      ? 'comment'
      : string
        ? 'string'
        : keyword
          ? 'keyword'
          : builtin
            ? 'builtin'
            : number
              ? 'number'
              : null
    parts.push({ text: full, type })
    lastIndex = match.index + full.length
  }

  if (lastIndex < line.length) parts.push({ text: line.slice(lastIndex), type: null })
  return parts
}

export function CodeBlock({ code, language = 'python', title }) {
  const lines = String(code ?? '').replace(/\r\n/g, '\n').split('\n')

  return (
    <div className="code-block">
      <div className="code-head">
        <span className="code-dot" style={{ background: '#ff5f57' }} />
        <span className="code-dot" style={{ background: '#febc2e' }} />
        <span className="code-dot" style={{ background: '#28c840' }} />
        {title ? (
          <span className="code-lang" style={{ marginLeft: 10 }}>
            {title}
          </span>
        ) : null}
        <span className="code-lang">{language}</span>
      </div>
      <div className="code-body">
        <div className="code-gutter">
          {lines.map((_, index) => (
            <div key={index}>{index + 1}</div>
          ))}
        </div>
        <pre className="code-lines" style={{ margin: 0 }}>
          {lines.map((line, lineIndex) => (
            <div key={lineIndex}>
              {line.length === 0 ? (
                '\u00A0'
              ) : (
                highlight(line).map((part, partIndex) =>
                  part.type ? (
                    <span key={partIndex} className={`tok-${part.type}`}>
                      {part.text}
                    </span>
                  ) : (
                    <span key={partIndex}>{part.text}</span>
                  ),
                )
              )}
            </div>
          ))}
        </pre>
      </div>
    </div>
  )
}

export function OutputBlock({ children, error = false, label = 'Output' }) {
  return (
    <div>
      <div className="small muted strong" style={{ marginBottom: 6 }}>
        {label}
      </div>
      <div className={`output-block ${error ? 'error' : ''}`}>
        {children === '' || children === undefined || children === null
          ? '(no output)'
          : children}
      </div>
    </div>
  )
}

export function ConfidenceRing({ value, size = 108, stroke = 10, label = 'Confidence' }) {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, value || 0))
  const offset = circumference - (clamped / 100) * circumference
  const color = clamped >= 85 ? '#7c3aed' : clamped >= 60 ? '#2563eb' : '#d97706'

  return (
    <div className="confidence-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e6eaf2"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="ring-value">
        <div style={{ textAlign: 'center' }}>
          <div>{clamped}%</div>
          <div className="tiny muted" style={{ fontWeight: 600, letterSpacing: 0 }}>
            {label}
          </div>
        </div>
      </div>
    </div>
  )
}

export function EvidenceCard({ label, detail, delay = 0 }) {
  return (
    <div className="evidence-card" style={{ animationDelay: `${delay}ms` }}>
      <span className="evidence-check">
        <CheckCircle2 size={14} strokeWidth={2.5} />
      </span>
      <div>
        <div className="strong" style={{ fontSize: 13.5 }}>
          {label}
        </div>
        <div className="small muted">{detail}</div>
      </div>
    </div>
  )
}

export function StageIndicator({ stages, currentIndex, results = {} }) {
  return (
    <div className="stages">
      {stages.map((stage, index) => {
        const result = results[stage.id]
        let className = 'stage'
        if (result?.passed === true) className += ' done'
        else if (result?.passed === false) className += ' failed'
        else if (index === currentIndex) className += ' active'

        return (
          <div key={stage.id} className={className}>
            <span className="stage-dot">
              {result?.passed === true ? '✓' : result?.passed === false ? '!' : index + 1}
            </span>
            {stage.label}
          </div>
        )
      })}
    </div>
  )
}

export function InsightCard({ icon, title, children, action }) {
  return (
    <div className="insight">
      {icon ? <div className="insight-icon">{icon}</div> : null}
      <div style={{ flex: 1 }}>
        {title ? (
          <div className="strong" style={{ fontSize: 14, marginBottom: 4 }}>
            {title}
          </div>
        ) : null}
        <div className="soft" style={{ fontSize: 13.5 }}>
          {children}
        </div>
        {action ? <div style={{ marginTop: 14 }}>{action}</div> : null}
      </div>
    </div>
  )
}

export function PrototypeNote({ children }) {
  return <div className="prototype-note">{children}</div>
}

export function PageHead({ title, subtitle, actions }) {
  return (
    <div className="page-head row between wrap" style={{ alignItems: 'flex-end' }}>
      <div>
        <h1>{title}</h1>
        {subtitle ? <p className="subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="row wrap">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({ icon, title, children, action }) {
  return (
    <div className="empty-state">
      {icon ? <div style={{ marginBottom: 10, opacity: 0.7 }}>{icon}</div> : null}
      <div className="strong" style={{ fontSize: 15, marginBottom: 6 }}>
        {title}
      </div>
      <div className="small" style={{ maxWidth: '52ch', margin: '0 auto' }}>
        {children}
      </div>
      {action ? <div style={{ marginTop: 16 }}>{action}</div> : null}
    </div>
  )
}
