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
import { concepts, getMisconception, PRIMARY_MISCONCEPTION_ID } from '../data/misconceptions'

const STORAGE_KEY = 'relearn.demo.v2'

// Default fallback active diagnosis for instant interactivity on any diagnostic page
const defaultDiagnosis = diagnoseMisconception({
  targetMisconceptionId: PRIMARY_MISCONCEPTION_ID,
  studentAnswer: '1 2 3 4 5',
  expectedOutput: '1 2 3 4',
  code: 'for i in range(1, 5):\n    print(i)',
})

export const initialState = {
  studentId: currentStudent.id,
  stage: 'diagnosed',
  submitted: {
    questionId: 'q-range-bounds',
    answer: '1 2 3 4 5',
    runOutput: '1 2 3 4',
    isCorrect: false,
    expectedOutput: '1 2 3 4',
    code: 'for i in range(1, 5):\n    print(i)',
    submittedAt: new Date().toISOString(),
  },
  diagnosis: defaultDiagnosis,
  diagnosisConfidence: defaultDiagnosis.confidence || 87,
  confidenceBaseline: defaultDiagnosis.confidence || 87,
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
    case 'INITIATE_DIAGNOSIS': {
      const { diagnosis, submitted } = action.payload
      return {
        ...state,
        stage: 'diagnosed',
        submitted,
        diagnosis,
        diagnosisConfidence: diagnosis.confidence,
        confidenceBaseline: diagnosis.confidence,
        diagnosticResult: null,
        interventionCompleted: false,
        stressTestProgress: 0,
        stressTestResults: {},
        resolution: null,
        resolutionStatus: null,
        breakdown: null,
      }
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
    // Guarantee active diagnosis and submission are present
    if (!parsed.diagnosis) parsed.diagnosis = defaultDiagnosis
    if (!parsed.submitted) parsed.submitted = initialState.submitted
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
      // Storage fallback
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

      /**
       * Seamless 1-click bridge from Coding Lab into Diagnosis Flow
       */
      initiateDiagnosis({
        questionId = 'custom-flow',
        studentAnswer = '',
        expectedOutput = '',
        code = '',
        misconceptionId = null,
        language = 'python',
        title = 'Submitted Code',
      }) {
        const submitted = {
          questionId,
          title,
          answer: studentAnswer,
          expectedOutput,
          code,
          language,
          submittedAt: new Date().toISOString(),
        }

        const diagnosis = diagnoseMisconception({
          questionId,
          studentAnswer,
          expectedOutput,
          code,
          targetMisconceptionId: misconceptionId,
        })

        dispatch({
          type: 'INITIATE_DIAGNOSIS',
          payload: { diagnosis, submitted },
        })

        return diagnosis
      },

      /**
       * Switch diagnosed misconception on the fly to inspect any cognitive pattern
       */
      switchDiagnosedMisconception(targetMisconceptionId) {
        const diag = diagnoseMisconception({
          targetMisconceptionId,
          studentAnswer: 'student error pattern',
        })
        const misconception = getMisconception(targetMisconceptionId)
        const submitted = {
          questionId: `probe-${targetMisconceptionId}`,
          title: misconception?.name || 'Selected Misconception',
          answer: misconception?.diagnostic?.options?.find(o => !o.correct)?.text || 'mistaken output',
          expectedOutput: misconception?.diagnostic?.options?.find(o => o.correct)?.text || 'correct output',
          code: misconception?.diagnostic?.code || '# Code under diagnostic observation',
          submittedAt: new Date().toISOString(),
        }
        dispatch({
          type: 'INITIATE_DIAGNOSIS',
          payload: { diagnosis: diag, submitted },
        })
        return diag
      },

      submitAnswer({ questionId, answer, runOutput, code, expectedOutput }) {
        const analysis = analyzeResponse({ questionId, studentAnswer: answer, code, expectedOutput })
        dispatch({
          type: 'SUBMIT_ANSWER',
          payload: {
            questionId,
            answer,
            runOutput,
            code,
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
          code: reducerState.submitted?.code,
          expectedOutput: reducerState.submitted?.expectedOutput,
          targetMisconceptionId: reducerState.diagnosis?.misconceptionId,
        })
        dispatch({
          type: 'DIAGNOSE',
          payload: { diagnosis, confidence: diagnosis.confidence },
        })
        return diagnosis
      },

      recordDiagnosticAnswer(selectedKey) {
        const before =
          reducerState.confidenceBaseline ?? reducerState.diagnosisConfidence ?? 87
        const result = evaluateDiagnosticAnswer(
          reducerState.diagnosis?.misconceptionId || PRIMARY_MISCONCEPTION_ID,
          selectedKey,
        )
        const payload = {
          selectedKey,
          supported: result.supported,
          message: result.message,
          selectedDetail: result.selectedDetail,
          confidenceBefore: before,
          confidenceAfter: result.supported ? Math.min(before + 8, 99) : before,
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
