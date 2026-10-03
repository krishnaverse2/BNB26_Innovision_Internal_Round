import { useState, useEffect } from 'react'
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Code2,
  TrendingUp,
  Brain,
  Zap,
  ArrowRight,
  Flame,
  ShieldCheck,
  ChevronRight,
  Target,
} from 'lucide-react'

/**
 * InteractiveConceptBoard
 * High-tech animated chalkboard/smartboard positioned beside the AI teacher.
 * Renders tailored visual animations corresponding to every scene:
 * - Scene 1: Personalized Diagnostic Scanner & Mistake Diff Analysis
 * - Scene 2: The 3 Core Pointers Invariant & Live Formula Evaluator
 * - Scene 3: Live Animated Binary Search Stepper (pointers leaping, range shading)
 * - Scene 4: Infinite Loop Pitfall Demonstration (CPU overheat & frozen bounds)
 * - Scene 5: Mathematical Invariant Proof (50% search-space halving bar)
 * - Scene 6: Syntax-Highlighted Code Walkthrough with Execution Cursor
 * - Scene 7: Common Traps & Edge-Cases Interactive Inspection
 * - Scene 8: Quick Practice Live Mini-Challenge with Instant Feedback
 * - Scene 9: Divide-and-Conquer Logarithmic Tree
 * - Scene 10: Mastery Synthesis & Launchpad to Practice Again
 */
export default function InteractiveConceptBoard({
  sceneIndex = 0,
  sceneData = {},
  studentName = 'Alex Rivera',
  courseTitle = 'Data Structures & Algorithms',
  onPracticeAgain,
}) {
  // Stepper state for Scene 3 animation
  const [activeStep, setActiveStep] = useState(0)

  // Code line execution pointer for Scene 6
  const [activeCodeLine, setActiveCodeLine] = useState(2)

  // Interactive Trap selector for Scene 7
  const [selectedTrap, setSelectedTrap] = useState(0)

  // Quick mini-quiz state for Scene 8
  const [selectedMiniAnswer, setSelectedMiniAnswer] = useState(null)

  // Search space halving step for Scene 5
  const [halvingStep, setHalvingStep] = useState(0)

  // Reset states when scene changes
  useEffect(() => {
    setActiveStep(0)
    setSelectedMiniAnswer(null)
    setActiveCodeLine(2)
    setHalvingStep(0)
  }, [sceneIndex])

  // Stepper auto-advance loop during Scene 3
  useEffect(() => {
    let timer = null
    if (sceneIndex === 2) {
      timer = setInterval(() => {
        setActiveStep((prev) => (prev + 1) % 3)
      }, 3600)
    }
    return () => clearInterval(timer)
  }, [sceneIndex])

  // Code line stepper during Scene 6
  useEffect(() => {
    let codeTimer = null
    if (sceneIndex === 5) {
      codeTimer = setInterval(() => {
        setActiveCodeLine((prev) => (prev >= 6 ? 2 : prev + 1))
      }, 2200)
    }
    return () => clearInterval(codeTimer)
  }, [sceneIndex])

  // Search-space halving loop during Scene 5
  useEffect(() => {
    let halfTimer = null
    if (sceneIndex === 4) {
      halfTimer = setInterval(() => {
        setHalvingStep((prev) => (prev + 1) % 4)
      }, 2400)
    }
    return () => clearInterval(halfTimer)
  }, [sceneIndex])

  const array = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91]
  const target = 23

  // Animation Step Configurations for Scene 3
  const stepConfigs = [
    {
      step: 1,
      low: 0,
      high: 9,
      mid: 4,
      midVal: 16,
      status: 'arr[mid] (16) < target (23)',
      action: 'Discard left half [0..4] ➔ Advance low = mid + 1 (5)',
      discarded: [0, 1, 2, 3, 4],
      activeRange: [5, 9],
    },
    {
      step: 2,
      low: 5,
      high: 9,
      mid: 7,
      midVal: 56,
      status: 'arr[mid] (56) > target (23)',
      action: 'Discard right half [7..9] ➔ Shift high = mid - 1 (6)',
      discarded: [0, 1, 2, 3, 4, 7, 8, 9],
      activeRange: [5, 6],
    },
    {
      step: 3,
      low: 5,
      high: 6,
      mid: 5,
      midVal: 23,
      status: 'arr[mid] (23) === target (23)',
      action: 'Target Matched! Located at Index 5 in just 3 operations.',
      discarded: [0, 1, 2, 3, 4, 7, 8, 9],
      activeRange: [5, 5],
      found: true,
    },
  ]

  const currentStepInfo = stepConfigs[activeStep] || stepConfigs[0]

  return (
    <div
      style={{
        flex: 1,
        height: '100%',
        minHeight: 420,
        background: 'radial-gradient(ellipse at top, #0f172a 0%, #070c18 100%)',
        borderRadius: 16,
        border: '1.5px solid rgba(255, 255, 255, 0.1)',
        padding: '22px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'inset 0 2px 20px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Board Ambient Top Indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#38bdf8',
              boxShadow: '0 0 10px #38bdf8',
            }}
          />
          <span style={{ fontSize: 11.5, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em' }}>
            DIGITAL SMARTBOARD • SCENE {sceneIndex + 1} OF 10
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: '#4ade80',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: 6,
              padding: '2px 8px',
              fontFamily: 'var(--mono)',
              fontWeight: 600,
            }}
          >
            ● LIVE ANIMATION
          </span>

          <span
            style={{
              fontSize: 11,
              color: '#60a5fa',
              background: 'rgba(37,99,235,0.2)',
              border: '1px solid rgba(96,165,250,0.3)',
              borderRadius: 6,
              padding: '2px 8px',
              fontFamily: 'var(--mono)',
            }}
          >
            DSA-BS-REMEDIATION
          </span>
        </div>
      </div>

      {/* DYNAMIC SCENE DISPLAY AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {/* ============================================================
            SCENE 1: Personalized Diagnostic Scanner & Mistake Diff Analysis
            ============================================================ */}
        {sceneIndex === 0 && (
          <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1.5px solid rgba(239, 68, 68, 0.35)',
                  borderRadius: 9999,
                  padding: '6px 16px',
                  color: '#fca5a5',
                  fontSize: 12.5,
                  fontWeight: 700,
                  marginBottom: 10,
                }}
              >
                <AlertTriangle size={15} color="#ef4444" />
                <span>3 Assessment Mistakes Detected on Binary Search Pointer Movement</span>
              </div>

              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
                Welcome {studentName}! Let's Master Pointer Invariants Step-by-Step.
              </h2>

              <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5, margin: 0, maxWidth: 680, marginInline: 'auto' }}>
                Our cognitive diagnostic evaluated your test questions and isolated the exact conceptual knot:
                deciding whether to write <code>low = mid</code> or <code>low = mid + 1</code>.
              </p>
            </div>

            {/* Diagnostic Scanner Comparison Card */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
                marginBottom: 16,
              }}
            >
              {/* Left: Student's Pitfall */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1.5px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontWeight: 800, fontSize: 13.5 }}>
                  <XCircle size={17} />
                  <span>Flagged Mistake in Your Test</span>
                </div>
                <div
                  style={{
                    background: '#18121a',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: '#fca5a5',
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  if arr[mid] &lt; target:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<strong>low = mid</strong> <span style={{ color: '#ef4444' }}>// ❌ Stalls execution</span>
                </div>
                <div style={{ fontSize: 12, color: '#f87171', marginTop: 8, fontWeight: 500 }}>
                  Traps low pointer at index 0 when two elements remain, causing an infinite loop!
                </div>
              </div>

              {/* Right: Required Invariant */}
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.08)',
                  border: '1.5px solid rgba(34, 197, 94, 0.4)',
                  borderRadius: 14,
                  padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontWeight: 800, fontSize: 13.5 }}>
                  <CheckCircle2 size={17} />
                  <span>Mathematical Invariant Rule</span>
                </div>
                <div
                  style={{
                    background: '#0d1d18',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    color: '#86efac',
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  if arr[mid] &lt; target:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<strong>low = mid + 1</strong> <span style={{ color: '#4ade80' }}>// ✅ Guarantees progress</span>
                </div>
                <div style={{ fontSize: 12, color: '#4ade80', marginTop: 8, fontWeight: 500 }}>
                  Strictly halves remaining candidate elements and eliminates tested index!
                </div>
              </div>
            </div>

            {/* Diagnostic Metadata Footer */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 12,
                background: 'rgba(255, 255, 255, 0.04)',
                padding: '12px 18px',
                borderRadius: 12,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: 12.5,
                textAlign: 'center',
              }}
            >
              <div>
                <span style={{ color: '#94a3b8' }}>Topic:</span>
                <strong style={{ color: '#ffffff', display: 'block', marginTop: 2 }}>Binary Search</strong>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.08)', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                <span style={{ color: '#94a3b8' }}>Detected Gap:</span>
                <strong style={{ color: '#f87171', display: 'block', marginTop: 2 }}>Pointer Movement</strong>
              </div>
              <div>
                <span style={{ color: '#94a3b8' }}>Pedagogical Goal:</span>
                <strong style={{ color: '#4ade80', display: 'block', marginTop: 2 }}>100% Invariant Mastery</strong>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 2: The 3 Core Pointers Invariant & Live Formula Evaluator
            ============================================================ */}
        {sceneIndex === 1 && (
          <div style={{ textAlign: 'center', width: '100%', maxWidth: 880, margin: '0 auto' }}>
            <div style={{ fontSize: 13.5, color: '#94a3b8', marginBottom: 16 }}>
              Golden Rule: Monotonically sorted arrays permit logarithmic halving by tracking 3 dynamic index pointers:
            </div>

            {/* 3 Pointer Dynamic Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
              <div
                style={{
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1.5px solid #22c55e',
                  borderRadius: 14,
                  padding: '16px 14px',
                  boxShadow: '0 4px 16px rgba(34,197,94,0.15)',
                }}
              >
                <div style={{ color: '#4ade80', fontWeight: 800, fontSize: 18 }}>LOW [0]</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Left Search Bound</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
                  Earliest viable index. Advances strictly to <code>mid + 1</code> when target is larger.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1.5px solid #38bdf8',
                  borderRadius: 14,
                  padding: '16px 14px',
                  boxShadow: '0 4px 16px rgba(56,189,248,0.2)',
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 800, fontSize: 18 }}>MID [4]</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Inspection Pivot</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
                  Calculated dynamically from low & high bounds: <code>low + (high - low) / 2</code>.
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1.5px solid #ef4444',
                  borderRadius: 14,
                  padding: '16px 14px',
                  boxShadow: '0 4px 16px rgba(239,68,68,0.15)',
                }}
              >
                <div style={{ color: '#f87171', fontWeight: 800, fontSize: 18 }}>HIGH [9]</div>
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 3 }}>Right Search Bound</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
                  Latest viable index. Decrements strictly to <code>mid - 1</code> when target is smaller.
                </div>
              </div>
            </div>

            {/* Live Arithmetic Computation Card */}
            <div
              style={{
                background: '#070c18',
                border: '1.5px solid rgba(56, 189, 248, 0.35)',
                borderRadius: 12,
                padding: '14px 24px',
                fontFamily: 'var(--mono)',
                fontSize: 14,
                color: '#e2e8f0',
                display: 'inline-block',
                textAlign: 'left',
              }}
            >
              <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: 4 }}>
                Formula: mid = low + Math.floor((high - low) / 2)
              </div>
              <div style={{ color: '#94a3b8', fontSize: 13 }}>
                Live Evaluation: 0 + Math.floor((9 - 0) / 2) = <strong style={{ color: '#38bdf8' }}>4</strong>
                &nbsp;➔ Checking Element: <code>arr[4] = 16</code>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
              *Using <code>low + (high - low) / 2</code> avoids 32-bit signed integer overflow in languages like C++, Java, and C#.
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 3: Live Interactive Stepper Simulation (Pointers Leaping)
            ============================================================ */}
        {sceneIndex === 2 && (
          <div>
            {/* Header info */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12.5, color: '#94a3b8' }}>Target Element: </span>
                <span
                  style={{
                    background: 'rgba(56,189,248,0.2)',
                    border: '1px solid #38bdf8',
                    color: '#38bdf8',
                    padding: '2px 10px',
                    borderRadius: 6,
                    fontWeight: 800,
                    fontSize: 15,
                    fontFamily: 'var(--mono)',
                  }}
                >
                  {target}
                </span>
              </div>

              {/* Step indicator buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {[0, 1, 2].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setActiveStep(s)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: 6,
                      fontSize: 11.5,
                      fontWeight: 700,
                      background: activeStep === s ? 'var(--primary)' : 'rgba(255,255,255,0.06)',
                      color: '#ffffff',
                      border: activeStep === s ? '1px solid #60a5fa' : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Step {s + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Array Cells with Pointer Leaping */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${array.length}, minmax(0, 1fr))`,
                gap: 6,
                marginBottom: 16,
              }}
            >
              {array.map((val, idx) => {
                const isMid = idx === currentStepInfo.mid
                const isLow = idx === currentStepInfo.low
                const isHigh = idx === currentStepInfo.high
                const isDiscarded = currentStepInfo.discarded.includes(idx)
                const isFound = currentStepInfo.found && isMid

                return (
                  <div key={idx} style={{ textAlign: 'center' }}>
                    {/* Top Pointer Indicator */}
                    <div style={{ height: 22, fontSize: 11, fontWeight: 800 }}>
                      {isMid && (
                        <span
                          style={{
                            color: isFound ? '#4ade80' : '#38bdf8',
                            animation: 'bounce 0.8s infinite',
                            display: 'inline-block',
                          }}
                        >
                          MID▼
                        </span>
                      )}
                    </div>

                    {/* Array Cell */}
                    <div
                      style={{
                        padding: '14px 2px',
                        borderRadius: 8,
                        fontWeight: 800,
                        fontSize: 15.5,
                        fontFamily: 'var(--mono)',
                        background: isFound
                          ? 'rgba(34, 197, 94, 0.45)'
                          : isMid
                          ? 'rgba(56, 189, 248, 0.35)'
                          : isDiscarded
                          ? '#0b1120'
                          : '#1e293b',
                        border: isFound
                          ? '2.5px solid #22c55e'
                          : isMid
                          ? '2.5px solid #38bdf8'
                          : isDiscarded
                          ? '1px dashed #334155'
                          : '1px solid rgba(255,255,255,0.12)',
                        color: isFound
                          ? '#4ade80'
                          : isMid
                          ? '#7dd3fc'
                          : isDiscarded
                          ? '#475569'
                          : '#ffffff',
                        opacity: isDiscarded ? 0.3 : 1,
                        textDecoration: isDiscarded ? 'line-through' : 'none',
                        transform: isMid ? 'scale(1.08)' : 'none',
                        boxShadow: isFound
                          ? '0 0 20px rgba(34, 197, 94, 0.6)'
                          : isMid
                          ? '0 0 14px rgba(56, 189, 248, 0.4)'
                          : 'none',
                        transition: 'all 0.35s ease',
                      }}
                    >
                      {val}
                    </div>

                    {/* Bottom Index / Pointer Label */}
                    <div style={{ height: 22, fontSize: 10, fontWeight: 800, marginTop: 4 }}>
                      {isLow && <span style={{ color: '#22c55e' }}>▲LOW</span>}
                      {isHigh && <span style={{ color: '#ef4444' }}>▲HIGH</span>}
                      {!isLow && !isHigh && <span style={{ color: '#475569' }}>[{idx}]</span>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Live Step Commentary Banner */}
            <div
              style={{
                background: currentStepInfo.found ? 'rgba(34, 197, 94, 0.16)' : 'rgba(56, 189, 248, 0.12)',
                border: `1.5px solid ${currentStepInfo.found ? '#22c55e' : '#38bdf8'}`,
                borderRadius: 10,
                padding: '12px 18px',
                fontSize: 13,
                color: '#e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ color: currentStepInfo.found ? '#4ade80' : '#38bdf8' }}>
                  {currentStepInfo.status}:{' '}
                </strong>
                {currentStepInfo.action}
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                Auto-advancing simulation
              </span>
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 4: Infinite Loop Pitfall Demonstration
            ============================================================ */}
        {sceneIndex === 3 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid #ef4444',
                  borderRadius: 6,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 800,
                  color: '#f87171',
                }}
              >
                LIVE BUG EMULATION
              </span>
              <span style={{ color: '#fca5a5', fontSize: 12.5, fontWeight: 700 }}>
                Why setting <code>low = mid</code> freezes program execution:
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
              {/* Code Box with Mistake Highlight */}
              <div
                style={{
                  background: '#19111e',
                  borderRadius: 12,
                  border: '1.5px solid #ef4444',
                  padding: '14px 16px',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: '#fca5a5',
                  lineHeight: 1.6,
                }}
              >
                <div>arr = [4, 7]  // target = 7</div>
                <div>low = 0, high = 1</div>
                <div>mid = 0 + (1 - 0) // 2 ➔ <strong>0</strong></div>
                <div style={{ marginTop: 6, color: '#ef4444', fontWeight: 800 }}>
                  ❌ Your Test Code:
                </div>
                <div style={{ background: 'rgba(239, 68, 68, 0.3)', padding: '4px 6px', borderRadius: 4 }}>
                  if arr[mid] &lt; target:
                  <br />
                  &nbsp;&nbsp;&nbsp;&nbsp;<strong>low = mid</strong>  <span style={{ color: '#ffffff' }}>// ➔ low stays 0!</span>
                </div>
              </div>

              {/* Infinite Loop Spinner Diagnostic */}
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: 12,
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <div
                  className="spin"
                  style={{
                    width: 32,
                    height: 32,
                    border: '3.5px solid #ef4444',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    marginBottom: 8,
                  }}
                />
                <div style={{ color: '#ef4444', fontWeight: 800, fontSize: 13.5 }}>
                  CPU Stuck: Infinite Loop!
                </div>
                <div style={{ fontSize: 11, color: '#cbd5e1', marginTop: 4 }}>
                  Iteration 1: low=0, mid=0
                  <br />
                  Iteration 2: low=0, mid=0
                  <br />
                  Search space NEVER shrinks!
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 5: The Invariant Solution Proof (Search Space Shrinking Bar)
            ============================================================ */}
        {sceneIndex === 4 && (
          <div style={{ textAlign: 'center', maxWidth: 580, margin: '0 auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(34, 197, 94, 0.15)',
                border: '1px solid #22c55e',
                borderRadius: 9999,
                padding: '5px 14px',
                color: '#4ade80',
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <CheckCircle2 size={15} color="#22c55e" />
              <span>Strict Halving Guarantee</span>
            </div>

            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: '0 0 10px' }}>
              Why <code>low = mid + 1</code> Guarantees Termination
            </h3>

            {/* Dynamic Halving Progress Bar */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: 12,
                padding: '16px 20px',
                marginBottom: 14,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
                <span>Remaining Search Space</span>
                <span style={{ color: '#38bdf8', fontWeight: 700 }}>
                  {halvingStep === 0 && 'Initial: 16 Elements (100%)'}
                  {halvingStep === 1 && 'Iteration 1: 8 Elements (50%)'}
                  {halvingStep === 2 && 'Iteration 2: 4 Elements (25%)'}
                  {halvingStep === 3 && 'Iteration 3: 1 Element (Target Found!)'}
                </span>
              </div>

              <div style={{ height: 14, background: '#1e293b', borderRadius: 7, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width:
                      halvingStep === 0 ? '100%' : halvingStep === 1 ? '50%' : halvingStep === 2 ? '25%' : '6.25%',
                    background:
                      halvingStep === 3 ? '#22c55e' : 'linear-gradient(90deg, #2563eb, #38bdf8)',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#64748b', marginTop: 6 }}>
                <span>N = 16</span>
                <span>N = 8</span>
                <span>N = 4</span>
                <span>Target Located</span>
              </div>
            </div>

            <p style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              Because we already evaluated <code>arr[mid]</code> and verified it does NOT equal target,
              <code>mid</code> can never be the answer. Advancing to <code>mid + 1</code> guarantees candidate count drops by at least 1 element every single turn.
            </p>
          </div>
        )}

        {/* ============================================================
            SCENE 6: Step-by-Step Code Walkthrough with Execution Cursor
            ============================================================ */}
        {sceneIndex === 5 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                Standard Python Implementation (Watch execution line cursor):
              </span>
              <span style={{ fontSize: 11, color: '#38bdf8', fontFamily: 'var(--mono)' }}>
                Executing Line {activeCodeLine}
              </span>
            </div>

            <div
              style={{
                background: '#070c18',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '14px 18px',
                fontFamily: 'var(--mono)',
                fontSize: 12.5,
                lineHeight: 1.6,
                color: '#e2e8f0',
              }}
            >
              {[
                { line: 1, text: 'def binary_search(arr, target):' },
                { line: 2, text: '    low, high = 0, len(arr) - 1' },
                { line: 3, text: '    while low <= high:  # Handles single elements' },
                { line: 4, text: '        mid = low + (high - low) // 2  # No overflow' },
                { line: 5, text: '        if arr[mid] == target:' },
                { line: 6, text: '            return mid' },
                { line: 7, text: '        elif arr[mid] < target:' },
                { line: 8, text: '            low = mid + 1  # <-- ALWAYS +1' },
                { line: 9, text: '        else:' },
                { line: 10, text: '            high = mid - 1 # <-- ALWAYS -1' },
                { line: 11, text: '    return -1' },
              ].map((c) => {
                const isActive =
                  (activeCodeLine === 2 && (c.line === 3 || c.line === 4)) ||
                  (activeCodeLine === 3 && (c.line === 7 || c.line === 8)) ||
                  (activeCodeLine === 4 && (c.line === 9 || c.line === 10))

                return (
                  <div
                    key={c.line}
                    style={{
                      background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                      borderLeft: isActive ? '3px solid #38bdf8' : '3px solid transparent',
                      paddingLeft: 8,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {c.text}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 7: Common Traps & Edge Cases Checklist
            ============================================================ */}
        {sceneIndex === 6 && (
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              The 3 Classic Binary Search Traps (Click to inspect):
            </h3>

            <div className="stack gap-xs">
              {[
                {
                  id: 0,
                  title: 'Trap 1: Signed Integer Overflow',
                  wrong: 'mid = (low + high) / 2',
                  right: 'mid = low + (high - low) // 2',
                  desc: 'In C++ and Java, low + high can exceed 2,147,483,647 and flip negative!',
                },
                {
                  id: 1,
                  title: 'Trap 2: Loop Termination Boundary',
                  wrong: 'while (low < high)',
                  right: 'while (low <= high)',
                  desc: 'Using strictly < fails to evaluate single-element subranges!',
                },
                {
                  id: 2,
                  title: 'Trap 3: Pointer Movement Stalling',
                  wrong: 'low = mid',
                  right: 'low = mid + 1',
                  desc: 'Never write low = mid. Always advance strictly past mid.',
                },
              ].map((trap) => (
                <div
                  key={trap.id}
                  onClick={() => setSelectedTrap(trap.id)}
                  style={{
                    background: selectedTrap === trap.id ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    border: selectedTrap === trap.id ? '1.5px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 10,
                    padding: '10px 14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: 13, color: selectedTrap === trap.id ? '#38bdf8' : '#ffffff' }}>
                      {trap.title}
                    </strong>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>
                      {selectedTrap === trap.id ? 'Active' : 'Click to inspect'}
                    </span>
                  </div>

                  {selectedTrap === trap.id && (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#cbd5e1' }}>
                      <div>{trap.desc}</div>
                      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontFamily: 'var(--mono)', fontSize: 11.5 }}>
                        <span style={{ color: '#f87171' }}>❌ {trap.wrong}</span>
                        <span style={{ color: '#4ade80' }}>✅ {trap.right}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 8: Quick Practice Live Mini-Challenge with Instant Feedback
            ============================================================ */}
        {sceneIndex === 7 && (
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <span
              style={{
                background: 'rgba(37, 99, 235, 0.2)',
                border: '1px solid #60a5fa',
                color: '#60a5fa',
                padding: '2px 8px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-block',
                marginBottom: 8,
              }}
            >
              LIVE CONCEPT CHECK
            </span>

            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              If arr = [4, 7], target = 7, and mid = 0. Where should <code>low</code> move?
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
              <button
                type="button"
                onClick={() => setSelectedMiniAnswer('wrong')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: selectedMiniAnswer === 'wrong' ? '#450a0a' : 'rgba(255,255,255,0.06)',
                  color: selectedMiniAnswer === 'wrong' ? '#fca5a5' : '#ffffff',
                  border: selectedMiniAnswer === 'wrong' ? '2px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                A. low = mid (0)
              </button>

              <button
                type="button"
                onClick={() => setSelectedMiniAnswer('correct')}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 700,
                  background: selectedMiniAnswer === 'correct' ? '#052e16' : 'rgba(255,255,255,0.06)',
                  color: selectedMiniAnswer === 'correct' ? '#86efac' : '#ffffff',
                  border: selectedMiniAnswer === 'correct' ? '2px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                B. low = mid + 1 (1) ✅
              </button>
            </div>

            {selectedMiniAnswer === 'correct' && (
              <div style={{ color: '#4ade80', fontSize: 13, fontWeight: 700, animation: 'fadeIn 0.3s ease' }}>
                🎉 Exactly right! low becomes 1, mid becomes 1, and arr[1] == 7 matches instantly!
              </div>
            )}
            {selectedMiniAnswer === 'wrong' && (
              <div style={{ color: '#f87171', fontSize: 12.5, animation: 'shake 0.3s ease' }}>
                ❌ Careful! Setting low = mid leaves low at 0 forever, freezing your program in an infinite loop!
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            SCENE 9: Divide-and-Conquer Logarithmic Tree
            ============================================================ */}
        {sceneIndex === 8 && (
          <div style={{ textAlign: 'center', maxWidth: 540, margin: '0 auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 12 }}>
              Why Binary Search is O(log N) Superpower
            </h3>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 14,
                marginBottom: 16,
              }}
            >
              <div style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', fontSize: 12.5 }}>
                N = 1,000,000 Elements
              </div>
              <div style={{ color: '#60a5fa', fontWeight: 800 }}>➔</div>
              <div
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'rgba(56, 189, 248, 0.2)',
                  border: '1.5px solid #38bdf8',
                  color: '#38bdf8',
                  fontWeight: 800,
                  fontSize: 13.5,
                }}
              >
                Only 20 Comparisons Max!
              </div>
            </div>

            <div style={{ fontSize: 12.5, color: '#cbd5e1', lineHeight: 1.6 }}>
              Because low and high discard half the remaining search space every turn ($N \rightarrow N/2 \rightarrow N/4 \rightarrow 1$),
              the algorithm terminates in strictly $\log_2(N)$ steps.
            </div>
          </div>
        )}

        {/* ============================================================
            SCENE 10: Mastery Synthesis & Call to Action
            ============================================================ */}
        {sceneIndex === 9 && (
          <div style={{ textAlign: 'center', maxWidth: 520, margin: '0 auto' }}>
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: '#22c55e',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 0 24px rgba(34, 197, 94, 0.5)',
              }}
            >
              <CheckCircle2 size={32} />
            </div>

            <h2 style={{ fontSize: 21, fontWeight: 800, color: '#ffffff', margin: '0 0 8px' }}>
              Lesson Complete! Concept Mastered.
            </h2>

            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 16 }}>
              You now understand exactly why pointer movement must strictly advance past mid.
              Take the targeted re-evaluation quiz to prove your mastery and raise your topic score!
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={onPracticeAgain}
              style={{
                padding: '12px 24px',
                fontSize: 14.5,
                fontWeight: 800,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 18px rgba(37,99,235,0.4)',
              }}
            >
              <span>Practice Again Now</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Board Bottom Indicator */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: 8,
          marginTop: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 11,
          color: '#64748b',
        }}
      >
        <span>RE:LEARN Dynamic Canvas Engine v2.4</span>
        <span>Cognitive Misconception Remediation Active</span>
      </div>
    </div>
  )
}
