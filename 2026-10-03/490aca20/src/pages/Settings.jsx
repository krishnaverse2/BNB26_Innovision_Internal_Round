import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Cpu,
  Database,
  RotateCcw,
  Settings2,
  Terminal,
  TriangleAlert,
} from 'lucide-react'
import {
  Card,
  CardHeader,
  PageHead,
  Pill,
  PrototypeNote,
} from '../components/ui'
import { FLOW_STEPS } from '../components/Sidebar'
import { useDemo, STAGE_ORDER } from '../context/DemoContext'
import { aiServiceMeta } from '../services/aiService'
import { runnerMeta } from '../services/pythonRunner'
import { concepts, misconceptions } from '../data/misconceptions'
import { questions, stressTestStages } from '../data/questions'
import { responses, recurringPatterns, DEMO_DATA_NOTE } from '../data/responses'
import { interventions, learningModes } from '../data/interventions'
import { assessments, assessmentTypes } from '../data/assessments'
import { classRoster } from '../data/students'

const STORAGE_KEY = 'relearn.demo.v1'

const JUMP_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/coding-lab', label: 'Coding Lab' },
  ...FLOW_STEPS.map(({ to, label }) => ({ to, label })),
  { to: '/misconceptions', label: 'Misconceptions' },
  { to: '/timeline', label: 'Learning Timeline' },
]

const DATA_SETS = [
  { file: 'src/data/misconceptions.js', label: 'Concepts', count: concepts.length },
  { file: 'src/data/misconceptions.js', label: 'Misconception patterns', count: misconceptions.length },
  { file: 'src/data/questions.js', label: 'Practice questions', count: questions.length },
  { file: 'src/data/questions.js', label: 'Stability check stages', count: stressTestStages.length },
  { file: 'src/data/responses.js', label: 'Response examples', count: responses.length },
  { file: 'src/data/responses.js', label: 'Recurring patterns', count: recurringPatterns.length },
  { file: 'src/data/interventions.js', label: 'Intervention entries', count: interventions.length },
  { file: 'src/data/interventions.js', label: 'Learning modes', count: learningModes.length },
  { file: 'src/data/assessments.js', label: 'Assessment items', count: assessments.length },
  { file: 'src/data/assessments.js', label: 'Evidence types', count: assessmentTypes.length },
  { file: 'src/data/students.js', label: 'Class roster (teacher view)', count: classRoster.length },
]

const STATE_FIELDS = [
  'currentStudent',
  'currentMisconception',
  'diagnosisConfidence',
  'diagnosticResult',
  'interventionCompleted',
  'stressTestProgress',
  'stressTestResults',
  'resolutionStatus',
]

export default function Settings() {
  const { state, resetDemo } = useDemo()
  const [confirming, setConfirming] = useState(false)

  const savedCount = Object.keys(state.stressTestResults || {}).length
  const progress = Math.round(
    (Math.max(0, STAGE_ORDER.indexOf(state.stage)) / (STAGE_ORDER.length - 1)) * 100,
  )

  return (
    <div className="stack gap-lg">
      <PageHead
        title="Settings"
        subtitle="Demo controls and an honest description of what is running behind this prototype."
        actions={<Pill tone="neutral">Local prototype · no backend</Pill>}
      />

      <Card>
        <CardHeader
          icon={<Settings2 size={18} />}
          title="Demo controls"
          subtitle="Everything here works offline. Resetting clears the saved journey so the demo can be presented again from the start."
        />

        <div className="grid cols-3" style={{ marginBottom: 18 }}>
          <div className="callout">
            <div className="tiny muted strong">Current stage</div>
            <div className="strong" style={{ fontSize: 15, marginTop: 4 }}>
              {state.stage}
            </div>
            <div className="progress-track" style={{ marginTop: 10 }}>
              <div className="progress-fill violet" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="callout">
            <div className="tiny muted strong">Saved in this browser</div>
            <div className="strong mono" style={{ fontSize: 13, marginTop: 6 }}>
              {STORAGE_KEY}
            </div>
            <div className="tiny muted" style={{ marginTop: 6 }}>
              {savedCount} of {stressTestStages.length} stability results stored · refresh
              resumes where you left off
            </div>
          </div>
          <div className="callout">
            <div className="tiny muted strong">Tracked state fields</div>
            <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
              {STATE_FIELDS.map((field) => (
                <Pill key={field} tone="neutral">
                  <span className="mono">{field}</span>
                </Pill>
              ))}
            </div>
          </div>
        </div>

        <div className="divider" />

        <div className="row between wrap" style={{ gap: 12 }}>
          <div>
            <div className="strong" style={{ fontSize: 14 }}>
              Reset the demo journey
            </div>
            <div className="small muted" style={{ maxWidth: '60ch' }}>
              Clears the submitted answer, diagnosis, confidence, intervention flag,
              stability results and resolution, then returns the dashboard to its
              starting numbers (Loops 72%, 3 active misconceptions).
            </div>
          </div>
          {confirming ? (
            <div className="row" style={{ gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  resetDemo()
                  setConfirming(false)
                }}
              >
                <TriangleAlert size={15} />
                Yes, reset everything
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setConfirming(true)}
            >
              <RotateCcw size={15} />
              Reset demo
            </button>
          )}
        </div>

        <div className="divider" />

        <div className="tiny muted strong" style={{ marginBottom: 10 }}>
          Jump to any step
        </div>
        <div className="row wrap" style={{ gap: 8 }}>
          {JUMP_LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="btn btn-soft btn-sm">
              {label}
            </Link>
          ))}
        </div>
        <p className="tiny muted" style={{ marginTop: 12 }}>
          Steps in the diagnosis flow guard themselves: opening one without the
          required prior step sends you back to the step you are actually on, so no
          screen can show an empty diagnosis.
        </p>
      </Card>

      <div className="grid cols-2">
        <Card>
          <CardHeader
            icon={<Cpu size={18} />}
            title={aiServiceMeta.engine}
            subtitle="The reasoning layer behind diagnosis, intervention and resolution."
          />
          <div className="data-list">
            <div className="data-row">
              <div style={{ flex: 1 }}>
                <div className="data-row-title">Runtime</div>
                <div className="data-row-sub">{aiServiceMeta.runtime}</div>
              </div>
              <Pill tone="blue">v{aiServiceMeta.version}</Pill>
            </div>
            <div className="data-row">
              <div style={{ flex: 1 }}>
                <div className="data-row-title">Functions exposed</div>
                <div className="row wrap" style={{ gap: 6, marginTop: 6 }}>
                  {[
                    'analyzeResponse()',
                    'diagnoseMisconception()',
                    'generateDiagnosticQuestion()',
                    'generateIntervention()',
                    'evaluateResolution()',
                  ].map((fn) => (
                    <Pill key={fn} tone="violet">
                      <span className="mono">{fn}</span>
                    </Pill>
                  ))}
                </div>
              </div>
            </div>
            <div className="data-row" style={{ borderBottom: 'none' }}>
              <div style={{ flex: 1 }}>
                <div className="data-row-title">Replacement path</div>
                <div className="data-row-sub">
                  React → <span className="mono">src/services/aiService.js</span> today.
                  Swap the five functions for fetch calls to FastAPI → ML model later;
                  the pages only consume the returned shape.
                </div>
              </div>
            </div>
          </div>
          <PrototypeNote>{aiServiceMeta.note}</PrototypeNote>
        </Card>

        <Card>
          <CardHeader
            icon={<Terminal size={18} />}
            title={runnerMeta.name}
            subtitle="Used by “Run Code” in the Coding Lab and the stability check."
          />
          <p className="small soft">{runnerMeta.note}</p>
          <div className="tiny muted strong" style={{ margin: '14px 0 8px' }}>
            Supported subset
          </div>
          <div className="stack gap-sm">
            {runnerMeta.supports.map((item) => (
              <div key={item} className="row" style={{ gap: 8 }}>
                <Pill tone="stable">✓</Pill>
                <span className="small">{item}</span>
              </div>
            ))}
          </div>
          <div className="divider" />
          <p className="tiny muted">
            Student code is parsed into an AST and evaluated by this interpreter. It
            never uses <span className="mono">eval</span> or
            <span className="mono"> new Function</span>, and it stops runaway loops
            instead of hanging the tab.
          </p>
        </Card>
      </div>

      <Card className="flat">
        <CardHeader
          icon={<Database size={18} />}
          title="Demo data volumes"
          subtitle="Counted from the modules at runtime, so these numbers cannot drift from the files."
        />
        <div className="data-list">
          {DATA_SETS.map(({ file, label, count }) => (
            <div className="data-row" key={`${file}-${label}`}>
              <div style={{ flex: 1 }}>
                <div className="data-row-title">{label}</div>
                <div className="data-row-sub mono">{file}</div>
              </div>
              <Pill tone="blue">{count}</Pill>
            </div>
          ))}
        </div>
        <PrototypeNote>
          {DEMO_DATA_NOTE} The class roster is generated from a seeded pseudo-random
          generator, so the same 48 students appear on every load. No record here was
          collected from a real learner.
        </PrototypeNote>
      </Card>
    </div>
  )
}
