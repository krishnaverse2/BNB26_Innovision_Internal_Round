# Re:Learn 🧠 — Adaptive Multimodal Learning Environment

> **Don't just correct the answer. Correct the misconception.**

A working frontend prototype for a hackathon project. A normal LMS shows the correct
answer after a mistake. Re:Learn analyses the mistake, forms a hypothesis about the
*reasoning* behind it, tests that hypothesis with a diagnostic question, teaches to the
specific misconception, and then requires evidence across several different question
types before it will call the misconception resolved.

Domain for this prototype: **introductory Python** (variables, conditions, loops,
functions, lists and indexing). The headline demo is Python loops and `range()`.

---

## Honesty statement — read this first

This project has **no dataset and no trained ML model**. Nothing here claims otherwise.

- The diagnosis layer is a **rule-based Prototype Diagnosis Engine**. It matches a
  student's answer against predefined misconception patterns and computes a confidence
  score from weighted signals. It is labelled as such everywhere it appears in the UI.
- All learner, question, response, intervention and assessment records are **synthetic
  demo data** generated locally. None of it was collected from real students.
- The class roster shown in Teacher Analytics is produced by a **seeded** pseudo-random
  generator, so the same 48 students appear on every load.
- Teacher Analytics includes a **Future Model Evaluation** section that deliberately
  shows no accuracy, precision, recall or F1 numbers, because none have been measured.
  It reads: *"Available after real labeled training data is connected."*
- The class data is deterministic and reproducible; the demo path lands on the same
  confidence figures every time (87% → 94% when the hypothesis is supported).

---

## Quick start

```bash
npm install
npm run dev
```

Then open the printed URL (default <http://localhost:5173>) and start on **Dashboard**.

```bash
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle
```

Requires Node 18+. No API keys, no network access, no database, no Firebase.

---

## 👥 Team Collaboration & Git Workflow

### For New Contributors (First-time clone)
```bash
git clone https://github.com/krishnaverse2/BNB26_Innovision_Internal_Round.git
cd BNB26_Innovision_Internal_Round
npm install
npm run dev
```

### For Existing Contributors (Upgrading from the previous folder structure)
If you previously cloned the repository and have existing local work:
```bash
# 1. Stash any uncommitted work safely
git stash

# 2. Pull the latest restructuring from main
git pull origin main

# 3. Restore your local work (Git will automatically map changes to the new file paths)
git stash pop

# 4. Install dependencies at the root level
npm install

# 5. Start the development server
npm run dev
```

### Daily Workflow (Preventing conflicts before pushing)
Before making commits and pushing your work:
```bash
# Always fetch and rebase latest changes first
git pull --rebase origin main

# Stage and commit your changes
git add .
git commit -m "Description of your feature or fix"

# Push to GitHub
git push origin main
```

---

## The demo flow

Every step below is functional — there are no "coming soon" buttons in the journey.

| # | Step | Route | What happens |
|---|------|-------|--------------|
| 1 | Dashboard | `/dashboard` | Summary cards, misconception fingerprint, current focus (Range Endpoint Confusion, 87%), AI learning insight |
| 2 | Coding Lab | `/coding-lab` | Predict the output of `for i in range(1, 5): print(i)`. **Run Code** really executes the snippet. **Use Demo Wrong Answer** enters `1 2 3 4 5` |
| 3 | Wrong answer | `/coding-lab` | Shows only that the prediction differs — the misconception is *not* revealed yet |
| 4 | AI Diagnosis | `/diagnosis` | Animated analysis, possible misconception + confidence, four evidence cards, prototype-engine disclosure |
| 5 | Hypothesis Test | `/diagnostic-test` | `range(2, 6)` multiple choice. Answering **A** supports the hypothesis and moves confidence 87% → 94% |
| 6 | Intervention | `/intervention` | Visual `range(1, 5)` → `1 → 2 → 3 → 4 → STOP` with 5 excluded, plus Visual / Example / Practice / Explain modes |
| 7 | Stability Check | `/stress-test` | Five evidence types: Same Concept, New Context, Debugging, Explain, Unseen Problem |
| 8 | Resolution | `/resolution` | Before/after, evidence matrix, understanding breakdown, resolution status |
| 9 | Updated profile | `/misconceptions` | Loops 72% → 91%, radar chart, recurring patterns |

Supporting routes: `/interventions` (teaching-move library), `/assessments` (question
bank by evidence type), `/timeline` (four-week progression), `/teacher` (class
analytics), `/settings`, `/profile`. Unknown routes redirect to `/dashboard`.

### Resolution is not granted for one correct answer

`evaluateResolution()` only reports **🟢 Concept Stable** when the learner passes at
least 60% of the five stages *and* those passes span at least three distinct evidence
types. Otherwise the result is **🟡 Still Developing**, and the resolution screen offers
a retake path instead of declaring success.

---

## Architecture

```
src/
├── components/       Sidebar, Layout, shared UI primitives (cards, pills, progress,
│                     code block, confidence ring, stage indicator, prototype note)
├── context/
│   └── DemoContext.jsx   useReducer + Context, persisted to localStorage
├── data/             DEMO DATA — synthetic, seeded, clearly marked
│   ├── questions.js       52 questions + the 5 stability-check stages
│   ├── misconceptions.js  5 concepts, 15 misconception patterns with evidence,
│   │                      interventions and diagnostic questions
│   ├── responses.js       130+ response examples + recurring patterns
│   ├── interventions.js   20 intervention entries across 4 learning modes
│   ├── assessments.js     30 assessment items across 5 evidence types
│   └── students.js        demo learner, mastery, class roster, timeline, insights
├── pages/            one file per route
├── services/
│   ├── aiService.js       the swappable reasoning layer
│   └── pythonRunner.js    safe Python-subset interpreter for "Run Code"
└── styles/global.css  design system (tokens, cards, charts, responsive rules)
```

### State

`DemoContext` holds one field per step of the journey and writes the whole object to
`localStorage` under `relearn.demo.v1` after every change, so a refresh resumes exactly
where the learner left off:

`studentId`, `stage`, `submitted`, `diagnosis`, `diagnosisConfidence`,
`confidenceBaseline`, `diagnosticResult`, `interventionMode`, `interventionCompleted`,
`stressTestProgress`, `stressTestResults`, `resolution`, `resolutionStatus`,
`breakdown`, `completedAt`.

Submitting a new answer resets everything downstream of it, so the dashboard can never
show a resolution that no longer matches the current attempt. **Reset demo** (topbar,
Settings, Profile) clears the stored state and restores the starting numbers.

### The AI service seam

`src/services/aiService.js` is the only place reasoning happens. Pages never compute a
diagnosis themselves; they call:

```js
analyzeResponse({ questionId, studentAnswer })      // signals + correctness
diagnoseMisconception({ questionId, studentAnswer })// ranked patterns + confidence
generateDiagnosticQuestion(misconceptionId)         // hypothesis test item
generateIntervention(misconceptionId)               // teaching content by mode
evaluateResolution(stressTestResults)               // stable vs still developing
```

`evaluateDiagnosticAnswer` and `understandingBreakdown` are exported too.

---

## Current vs future

**Current**

```
React UI → src/services/aiService.js (local rule-based Prototype Diagnosis Engine)
```

**Future**

```
React UI → FastAPI → ML model → misconception diagnosis
```

To make that swap, replace the bodies of the five functions with `fetch` calls and keep
the return shapes. No page, component or route needs to change — they only consume the
returned objects. The confidence figure, the evidence list and the resolution rule are
all read from the service, so a real model's output would flow straight through.

What a real model would need, and does not yet have: labelled response data pairing
student answers with confirmed misconceptions, an inter-rater agreement study on those
labels, and held-out evaluation to justify publishing accuracy numbers.

---

## The code runner

`src/services/pythonRunner.js` is a small interpreter for the Python subset used by the
question bank: tokenizer → recursive-descent parser → AST evaluator. It supports
`for`/`while`/`range`, `if`/`elif`/`else`, `def` with default parameters and `return`,
arithmetic and comparisons, strings, lists with common methods, slicing, tuple
assignment, and the builtins `print`, `len`, `int`, `str`, `float`, `abs`, `sum`.

It deliberately does **not** use `eval` or `new Function`, so pasted student code cannot
execute arbitrary JavaScript. Runaway loops are stopped with a clear message rather than
hanging the tab. Python semantics are modelled faithfully where the question bank
depends on them: `range()` excludes its stop value, `/` is true division, and default
arguments are evaluated once at definition time.

It is a demo runner, not CPython.

---

## Tech stack

React 18 · Vite 5 · JavaScript · React Router 6 · CSS custom properties · Recharts ·
Lucide React. Fonts are system stacks so the app renders identically offline.

---

## Known limitations

- The engine matches patterns it was given; it cannot discover a misconception that is
  not in `src/data/misconceptions.js`.
- Explanation answers are graded by keyword and length heuristics, not by understanding.
- Only one misconception is taken through the full cycle in the demo. The others appear
  in the profile, catalogue and teacher views.
- The dashboard headline numbers describe a single synthetic learner and a synthetic
  class of 48. They are not research findings.
