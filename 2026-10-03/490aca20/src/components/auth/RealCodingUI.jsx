import { useState, useEffect } from 'react'
import { Play, Terminal, CheckCircle2, Sparkles, FileCode, Check, Copy } from 'lucide-react'

const CODE_FILES = {
  'relearn_engine.py': {
    lang: 'python',
    lines: [
      { num: 1, text: '# RE:LEARN Bayesian Cognitive Engine v2.4', type: 'comment' },
      { num: 2, text: 'from cognitive.bkt import BayesianKnowledgeTracer', type: 'import' },
      { num: 3, text: 'from ast_engine import ASTBoundaryAnalyzer', type: 'import' },
      { num: 4, text: '', type: 'empty' },
      { num: 5, text: 'def evaluate_concept_stability(student_code: str):', type: 'def' },
      { num: 6, text: '    analyzer = ASTBoundaryAnalyzer(student_code)', type: 'code' },
      { num: 7, text: '    features = analyzer.extract_loop_invariants()', type: 'code' },
      { num: 8, text: '', type: 'empty' },
      { num: 9, text: '    if features.has_off_by_one_inclusive:', type: 'keyword' },
      { num: 10, text: '        bf10 = BayesianKnowledgeTracer.calc_bayes_factor()', type: 'code' },
      { num: 11, text: '        return DiagnosticReport(status="MISCONCEPTION_DETECTED", bf10=18.4)', type: 'return' },
      { num: 12, text: '', type: 'empty' },
      { num: 13, text: '    return DiagnosticReport(status="CONCEPT_STABLE", mastery=0.94)', type: 'return' },
    ],
  },
  'ast_diagnostics.ts': {
    lang: 'typescript',
    lines: [
      { num: 1, text: '// AST Telemetry & IRT 2PL Fisher Information', type: 'comment' },
      { num: 2, text: 'export interface CognitiveTelemetry {', type: 'def' },
      { num: 3, text: '  studentId: string;', type: 'code' },
      { num: 4, text: '  itemDifficulty: number; // IRT parameter b', type: 'code' },
      { num: 5, text: '  discrimination: number; // IRT parameter a', type: 'code' },
      { num: 6, text: '  masteryPosterior: number;', type: 'code' },
      { num: 7, text: '}', type: 'code' },
      { num: 8, text: '', type: 'empty' },
      { num: 9, text: 'export function computeFisherInfo(theta: number): number {', type: 'def' },
      { num: 10, text: '  const p = 1 / (1 + Math.exp(-1.42 * (theta - 0.25)));', type: 'code' },
      { num: 11, text: '  return Math.pow(1.42, 2) * p * (1 - p);', type: 'return' },
      { num: 12, text: '}', type: 'code' },
    ],
  },
  'two_sum_test.py': {
    lang: 'python',
    lines: [
      { num: 1, text: '# Test Suite: Two Sum Sorted (Two Pointer Technique)', type: 'comment' },
      { num: 2, text: 'def test_two_sum_invariants():', type: 'def' },
      { num: 3, text: '    nums = [2, 7, 11, 15]', type: 'code' },
      { num: 4, text: '    target = 9', type: 'code' },
      { num: 5, text: '    assert two_sum(nums, target) == [0, 1]', type: 'keyword' },
      { num: 6, text: '    print("✓ All 14/14 automated assertions passed")', type: 'return' },
    ],
  },
}

const TERMINAL_OUTPUTS = [
  '[BKT-ENGINE] Initializing Bayesian knowledge tracing model...',
  '[AST-PARSER] Analyzing syntax tree: 48 tokens, 12 AST branches parsed.',
  '[IRT-2PL] Item difficulty calibrated (b = -0.35, a = 1.42).',
  '[TELEMETRY] Posterior mastery probability: P(L_t) = 0.94.',
  '✓ All 14/14 automated tests passed (42ms, Memory: 14.8 MB).',
  '🟢 Concept Status: STABLE — Ready for advanced DSA challenges!',
]

export default function RealCodingUI() {
  const [activeTab, setActiveTab] = useState('relearn_engine.py')
  const [isRunning, setIsRunning] = useState(false)
  const [terminalLogs, setTerminalLogs] = useState(TERMINAL_OUTPUTS.slice(0, 4))
  const [copied, setCopied] = useState(false)

  const activeFile = CODE_FILES[activeTab]

  const handleRunCode = () => {
    if (isRunning) return
    setIsRunning(true)
    setTerminalLogs(['$ python -m relearn.cognitive_engine --evaluate-student'])

    TERMINAL_OUTPUTS.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs((prev) => [...prev, log])
        if (index === TERMINAL_OUTPUTS.length - 1) {
          setIsRunning(false)
        }
      }, (index + 1) * 350)
    })
  }

  const handleCopyCode = () => {
    const codeText = activeFile.lines.map((l) => l.text).join('\n')
    navigator.clipboard?.writeText(codeText)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 560,
        margin: '0 auto',
        borderRadius: 14,
        overflow: 'hidden',
        background: '#090d16',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.45)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* IDE Window Titlebar with macOS Controls */}
      <div
        style={{
          height: 38,
          background: '#0d131f',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* macOS Traffic Light Window Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#ef4444' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#f59e0b' }} />
          <div style={{ width: 11, height: 11, borderRadius: '50%', background: '#22c55e' }} />
        </div>

        {/* Center Title */}
        <div
          style={{
            fontSize: 12,
            color: '#94a3b8',
            fontFamily: 'var(--mono)',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>relearn-ide</span>
          <span style={{ color: '#475569' }}>—</span>
          <span style={{ color: '#cbd5e1' }}>{activeTab}</span>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleCopyCode}
            title="Copy code"
            style={{
              color: copied ? '#22c55e' : '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              background: 'rgba(255,255,255,0.06)',
              padding: '3px 8px',
              borderRadius: 6,
              border: 'none',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleRunCode}
            disabled={isRunning}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '3px 10px',
              borderRadius: 6,
              background: isRunning ? '#334155' : '#2563eb',
              color: '#ffffff',
              fontSize: 11.5,
              fontWeight: 600,
              cursor: isRunning ? 'default' : 'pointer',
              border: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Play size={11} fill="#ffffff" />
            <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
          </button>
        </div>
      </div>

      {/* Editor File Tabs */}
      <div
        style={{
          display: 'flex',
          background: '#070b12',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          overflowX: 'auto',
        }}
      >
        {Object.keys(CODE_FILES).map((fileName) => {
          const isActive = activeTab === fileName
          return (
            <button
              key={fileName}
              type="button"
              onClick={() => setActiveTab(fileName)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 7,
                padding: '7px 14px',
                fontSize: 11.5,
                fontFamily: 'var(--mono)',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#60a5fa' : '#64748b',
                background: isActive ? '#090d16' : 'transparent',
                borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              <FileCode size={13} color={isActive ? '#60a5fa' : '#64748b'} />
              <span>{fileName}</span>
            </button>
          )
        })}
      </div>

      {/* Code Editor Body */}
      <div
        style={{
          padding: '12px 14px',
          fontFamily: 'var(--mono)',
          fontSize: 12,
          lineHeight: 1.6,
          minHeight: 180,
          background: '#090d16',
          color: '#e2e8f0',
          overflowX: 'auto',
        }}
      >
        {activeFile.lines.map((line) => (
          <div key={line.num} style={{ display: 'flex', alignItems: 'flex-start' }}>
            <span
              style={{
                width: 26,
                color: '#475569',
                userSelect: 'none',
                textAlign: 'right',
                paddingRight: 14,
                flexShrink: 0,
                fontSize: 11,
              }}
            >
              {line.num}
            </span>
            <span
              style={{
                whiteSpace: 'pre',
                color:
                  line.type === 'comment'
                    ? '#64748b'
                    : line.type === 'import'
                    ? '#93c5fd'
                    : line.type === 'def'
                    ? '#60a5fa'
                    : line.type === 'keyword'
                    ? '#f59e0b'
                    : line.type === 'return'
                    ? '#34d399'
                    : '#e2e8f0',
              }}
            >
              {line.text}
            </span>
          </div>
        ))}
      </div>

      {/* Integrated Live Terminal Console */}
      <div
        style={{
          background: '#060910',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 14px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              color: '#94a3b8',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            <Terminal size={12} color="#60a5fa" />
            <span>Interactive Terminal</span>
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: isRunning ? '#f59e0b' : '#22c55e',
                boxShadow: isRunning
                  ? '0 0 8px rgba(245, 158, 11, 0.6)'
                  : '0 0 8px rgba(34, 197, 94, 0.6)',
              }}
            />
          </div>
          <span style={{ fontSize: 10.5, color: '#64748b', fontFamily: 'var(--mono)' }}>
            Python 3.12 • utf-8
          </span>
        </div>

        <div
          style={{
            fontFamily: 'var(--mono)',
            fontSize: 11,
            color: '#a1a1aa',
            lineHeight: 1.5,
            maxHeight: 74,
            overflowY: 'auto',
          }}
        >
          {terminalLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                color: log.startsWith('✓') || log.startsWith('🟢')
                  ? '#4ade80'
                  : log.startsWith('$')
                  ? '#60a5fa'
                  : '#cbd5e1',
              }}
            >
              {log}
            </div>
          ))}
          {isRunning && (
            <span style={{ display: 'inline-block', width: 6, height: 11, background: '#60a5fa' }} />
          )}
        </div>
      </div>
    </div>
  )
}
