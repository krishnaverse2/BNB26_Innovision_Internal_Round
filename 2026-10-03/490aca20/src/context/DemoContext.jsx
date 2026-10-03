import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import {
  analyzeResponse,
  diagnoseMisconception,
  evaluateDiagnosticAnswer,
  evaluateResolution,
  understandingBreakdown,
} from '../services/aiService'
import {
  currentStudent,
  studentMastery,
  studentMisconceptions,
  studentStatus,
} from '../data/students'
import { concepts } from '../data/misconceptions'

const STORAGE_KEY = 'relearn.demo.v1'

// One field per step of the journey, so a refresh resumes exactly where
// the learner left off.
export const initialState = {
  studentId: currentStudent.id,
  stage: 'not-started',
  submitted: null,
  diagnosis: null,
  diagnosisConfidence: null,
  confidenceBaseline: null,
  diagnosticResult: null,
  interventionMode: 'visual',
  interventionCompleted: false,
  stressTestProgress: 0,
  stressTestResults: {},
  resolution: null,
  resolutionStatus: null,
  breakdown: null,
  completedAt: null,
}

const STAGE_ORDER = [
  'not-started',
  'submitted',
  'diagnosed',
  'verified',
  'intervened',
  'stress-testing',
  'resolved',
]

function reducer(state, action) {
  switch (action.type) {
    case 'SUBMIT_ANSWER':
      return {
        ...state,
        stage: 'submitted',
        submitted: action.payload,
        diagnosis: null,
        diagnosisConfidence: null,
        confidenceBaseline: null,
        diagnosticResult: null,
        interventionCompleted: false,
        stressTestProgress: 0,
        stressTestResults: {},
        resolution: null,
        resolutionStatus: null,
        breakdown: null,
        completedAt: null,
      }
    case 'DIAGNOSE':
      return {
        ...state,
        stage: 'diagnosed',
        diagnosis: action.payload.diagnosis,
        diagnosisConfidence: action.payload.confidence,
        confidenceBaseline: action.payload.confidence,
      }
    case 'RECORD_DIAGNOSTIC':
      return {
        ...state,
        stage: 'verified',
        diagnosticResult: action.payload,
        diagnosisConfidence: action.payload.confidenceAfter,
      }
    case 'SET_INTERVENTION_MODE':
      return { ...state, interventionMode: action.payload }
    case 'COMPLETE_INTERVENTION':
      return { ...state, stage: 'intervened', interventionCompleted: true }
    case 'START_STRESS_TEST':
      return {
        ...state,
        stage: state.stressTestProgress > 0 ? state.stage : 'stress-testing',
      }
    case 'RECORD_STRESS_RESULT':
      return {
        ...state,
        stage: 'stress-testing',
        stressTestResults: {
          ...state.stressTestResults,
          [action.payload.stageId]: action.payload,
        },
        stressTestProgress: Math.max(
          state.stressTestProgress,
          action.payload.index + 1,
        ),
      }
    case 'CLEAR_STRESS_RESULT': {
      const rest = { ...state.stressTestResults }
      delete rest[action.payload.stageId]
      return {
        ...state,
        stressTestResults: rest,
        stressTestProgress: Math.min(
          state.stressTestProgress,
          action.payload.index,
        ),
      }
    }
    case 'FINISH_STRESS_TEST':
      return {
        ...state,
        stage: 'resolved',
        resolution: action.payload.resolution,
        breakdown: action.payload.breakdown,
        resolutionStatus: action.payload.resolution.status,
        completedAt: action.payload.completedAt,
      }
    case 'RESET':
      return { ...initialState }
    default:
      return state
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState
    const parsed = JSON.parse(raw)
    return { ...initialState, ...parsed }
  } catch {
    return initialState
  }
}

const DemoContext = createContext(null)

export function DemoProvider({ children }) {
  const [reducerState, dispatch] = useReducer(reducer, undefined, loadState)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(reducerState))
    } catch {
      // Storage can be unavailable in private mode; the demo still works
      // in-memory for the current session.
    }
  }, [reducerState])

  const resolved = reducerState.resolutionStatus === 'stable'

  const value = useMemo(() => {
    const mastery = resolved ? studentMastery.resolved : studentMastery.baseline
    const fingerprint = concepts.map((concept) => {
      const score = mastery[concept.id] ?? 0
      return { ...concept, score, ...studentStatus(score) }
    })

    const activeMisconceptions = studentMisconceptions.filter(
      (entry) =>
        entry.status === 'active' &&
        !(resolved && entry.misconceptionId === reducerState.diagnosis?.misconceptionId),
    )

    const overallUnderstanding = Math.round(
      fingerprint.reduce((sum, entry) => sum + entry.score, 0) / fingerprint.length,
    )

    return {
      state: reducerState,
      dispatch,
      student: currentStudent,
      stageIndex: STAGE_ORDER.indexOf(reducerState.stage),
      isResolved: resolved,
      mastery,
      fingerprint,
      activeMisconceptions,
      summary: {
        overallUnderstanding,
        conceptsStable: `${resolved ? 9 : 8} / 12`,
        activeMisconceptions: activeMisconceptions.length,
        streakDays: currentStudent.streakDays,
      },

      submitAnswer({ questionId, answer, runOutput }) {
        const analysis = analyzeResponse({ questionId, studentAnswer: answer })
        dispatch({
          type: 'SUBMIT_ANSWER',
          payload: {
            questionId,
            answer,
            runOutput,
            isCorrect: analysis.isCorrect,
            expectedOutput: analysis.expectedOutput,
            signals: analysis.signals,
            submittedAt: new Date().toISOString(),
          },
        })
        return analysis
      },

      runDiagnosis() {
        const diagnosis = diagnoseMisconception({
          questionId: reducerState.submitted?.questionId,
          studentAnswer: reducerState.submitted?.answer,
          studentId: reducerState.studentId,
        })
        dispatch({
          type: 'DIAGNOSE',
          payload: { diagnosis, confidence: diagnosis.confidence },
        })
        return diagnosis
      },

      recordDiagnosticAnswer(selectedKey) {
        // Always measured against the confidence the diagnosis produced, so
        // re-answering does not compound the change.
        const before =
          reducerState.confidenceBaseline ?? reducerState.diagnosisConfidence ?? 0
        const result = evaluateDiagnosticAnswer(
          reducerState.diagnosis?.misconceptionId,
          selectedKey,
        )
        const payload = {
          selectedKey,
          supported: result.supported,
          message: result.message,
          confidenceBefore: before,
          // A supported hypothesis raises confidence; an unsupported one
          // leaves it unchanged rather than inventing a new number.
          confidenceAfter: result.supported ? Math.min(before + 7, 99) : before,
        }
        dispatch({ type: 'RECORD_DIAGNOSTIC', payload })
        return payload
      },

      setInterventionMode(mode) {
        dispatch({ type: 'SET_INTERVENTION_MODE', payload: mode })
      },

      completeIntervention() {
        dispatch({ type: 'COMPLETE_INTERVENTION' })
      },

      startStressTest() {
        dispatch({ type: 'START_STRESS_TEST' })
      },

      recordStressResult(result) {
        dispatch({ type: 'RECORD_STRESS_RESULT', payload: result })
      },

      clearStressResult(stageId, index) {
        dispatch({ type: 'CLEAR_STRESS_RESULT', payload: { stageId, index } })
      },

      finishStressTest() {
        const resolution = evaluateResolution(reducerState.stressTestResults)
        const breakdown = understandingBreakdown(reducerState.stressTestResults)
        dispatch({
          type: 'FINISH_STRESS_TEST',
          payload: {
            resolution,
            breakdown,
            completedAt: new Date().toISOString(),
          },
        })
        return { resolution, breakdown }
      },

      resetDemo() {
        dispatch({ type: 'RESET' })
        try {
          window.localStorage.removeItem(STORAGE_KEY)
        } catch {
          /* ignore */
        }
      },
    }
  }, [reducerState, resolved])

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used inside <DemoProvider>')
  return context
}

export { STAGE_ORDER }
