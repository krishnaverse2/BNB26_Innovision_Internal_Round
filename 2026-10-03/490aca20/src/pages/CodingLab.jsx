import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Code2,
  Brain,
  Sparkles,
  ArrowRight,
  Terminal,
  CheckCircle2,
  Layers,
  Cpu,
  Flame,
  Globe2,
} from 'lucide-react';
import { Card, CardHeader, PageHead, Pill, StatCard } from '../components/ui';
import LanguageSelectionScreen from '../components/coding-lab/LanguageSelectionScreen';
import ProblemWorkspace from '../components/coding-lab/ProblemWorkspace';
import PredictOutputWorkspace from '../components/coding-lab/PredictOutputWorkspace';
import { getLanguages, getProblems } from '../services/codingLabApi';

export default function CodingLab() {
  const navigate = useNavigate();

  // Navigation / View states: 'hub' | 'select-language' | 'solve' | 'predict'
  const [view, setView] = useState('hub');
  const [activeMode, setActiveMode] = useState(null); // 'solve' | 'predict'

  // Data states
  const [languages, setLanguages] = useState([]);
  const [problems, setProblems] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load languages and problems on mount
  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [langs, probs] = await Promise.all([getLanguages(), getProblems()]);
        setLanguages(langs);
        setProblems(probs);
        if (langs.length > 0 && !selectedLanguage) {
          // Default to Python or JavaScript
          const defaultLang = langs.find((l) => l.id === 'python') || langs[0];
          setSelectedLanguage(defaultLang);
        }
        if (probs.length > 0 && !selectedProblem) {
          setSelectedProblem(probs[0]);
        }
      } catch (err) {
        console.error('Failed to load Coding Lab data:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Handler when clicking "1. Solve Problem"
  function handleChooseSolve() {
    setActiveMode('solve');
    setView('select-language');
  }

  // Handler when clicking "2. Predict Output"
  function handleChoosePredict() {
    setActiveMode('predict');
    setView('select-language');
  }

  // Handler when selecting a language from the selection screen
  function handleSelectLanguage(lang) {
    setSelectedLanguage(lang);
    if (activeMode === 'solve') {
      setView('solve');
    } else if (activeMode === 'predict') {
      setView('predict');
    }
  }

  return (
    <div className="stack gap-lg animate-rise">
      {/* Page Header */}
      <PageHead
        title="Coding Lab"
        subtitle="Interactive coding practice platform. Solve LeetCode-style algorithmic challenges or master mental code tracing with output predictions."
        actions={
          <div className="row" style={{ gap: 8 }}>
            <Pill tone="blue">LeetCode Core Engine</Pill>
            <Pill tone="neutral">12 Languages Supported</Pill>
          </div>
        }
      />

      {/* VIEW 1: HUB / MAIN OPTIONS SCREEN */}
      {view === 'hub' && (
        <div className="stack gap-lg">
          {/* Quick Stats Overview */}
          <div className="grid cols-4">
            <StatCard
              icon={<Code2 size={20} />}
              tone="blue"
              value={problems.length ? `${problems.length} Problems` : '10+ Problems'}
              label="Algorithmic Library"
              delta="Curated LeetCode format"
              deltaTone="stable"
            />
            <StatCard
              icon={<Globe2 size={20} />}
              tone="violet"
              value={languages.length ? `${languages.length} Languages` : '12 Languages'}
              label="Multi-Language Support"
              delta="C, C++, Java, Python, Go..."
              deltaTone="stable"
            />
            <StatCard
              icon={<Cpu size={20} />}
              tone="developing"
              value="Real-Time"
              label="Execution & Testing"
              delta="Public & Hidden Testcases"
              deltaTone="neutral"
            />
            <StatCard
              icon={<Brain size={20} />}
              tone="attention"
              value="Mental Tracing"
              label="Predict Output Engine"
              delta="Cognitive Diagnosis"
              deltaTone="stable"
            />
          </div>

          {/* The Two Main Interactive Choices */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 24,
            }}
          >
            {/* OPTION 1: SOLVE PROBLEM */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '30px 28px',
                borderRadius: 18,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: 'var(--shadow)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--blue-500)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              onClick={handleChooseSolve}
            >
              <div>
                <div
                  className="row between"
                  style={{ alignItems: 'center', marginBottom: 18 }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--blue-50)',
                      color: 'var(--blue-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Code2 size={28} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: 'var(--blue-50)',
                      color: 'var(--blue-600)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Core Option 1
                  </span>
                </div>

                <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text)' }}>
                  1. Solve Problem
                </h2>

                <p
                  className="soft"
                  style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}
                >
                  Solve real algorithmic problems like Two Sum, Palindrome Number, Valid Parentheses,
                  and Maximum Subarray. Write code in your favorite programming language, run
                  against sample test cases, and submit to verify against hidden test suites.
                </p>

                <div className="stack" style={{ gap: 10, marginBottom: 24 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Language-specific starter templates that switch automatically</span>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Professional code editor with Run, Submit, Reset & Custom Input</span>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#16a34a" />
                    <span>Instant verdict, runtime & memory percentile benchmarks</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  style={{
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChooseSolve();
                  }}
                >
                  Choose Language & Start Solving
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>

            {/* OPTION 2: PREDICT OUTPUT */}
            <div
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '30px 28px',
                borderRadius: 18,
                border: '1.5px solid var(--border)',
                background: 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.22s ease',
                boxShadow: 'var(--shadow)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--violet-500)';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow)';
              }}
              onClick={handleChoosePredict}
            >
              <div>
                <div
                  className="row between"
                  style={{ alignItems: 'center', marginBottom: 18 }}
                >
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: 'var(--violet-50)',
                      color: 'var(--violet-600)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Brain size={28} />
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '4px 12px',
                      borderRadius: 20,
                      background: 'var(--violet-50)',
                      color: 'var(--violet-600)',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Core Option 2
                  </span>
                </div>

                <h2 style={{ fontSize: 24, marginBottom: 8, color: 'var(--text)' }}>
                  2. Predict Output
                </h2>

                <p
                  className="soft"
                  style={{ fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}
                >
                  Master mental code execution and spot tricky programming traps. Select any
                  language to view real code snippets (loop bounds, closures, pointer arithmetic,
                  mutability), predict the console output, and receive comprehensive step-by-step
                  execution explanations.
                </p>

                <div className="stack" style={{ gap: 10, marginBottom: 24 }}>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#7c3aed" />
                    <span>Real-world tricky snippets in Python, JS, C++, Java, PHP, Go...</span>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#7c3aed" />
                    <span>Instant evaluation with diff between your answer and expected output</span>
                  </div>
                  <div className="row" style={{ gap: 8, alignItems: 'center', fontSize: 13.5 }}>
                    <CheckCircle2 size={16} color="#7c3aed" />
                    <span>Connected to Re:Learn's cognitive diagnosis pipeline</span>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-secondary btn-lg btn-block"
                  style={{
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 8,
                    fontWeight: 600,
                    borderColor: 'var(--violet-500)',
                    color: 'var(--violet-600)',
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChoosePredict();
                  }}
                >
                  Choose Language & Predict Output
                  <ArrowRight size={17} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: LANGUAGE SELECTION SCREEN */}
      {view === 'select-language' && (
        <LanguageSelectionScreen
          languages={languages}
          mode={activeMode}
          onSelectLanguage={handleSelectLanguage}
          onBack={() => setView('hub')}
        />
      )}

      {/* VIEW 3: SOLVE PROBLEM WORKSPACE */}
      {view === 'solve' && selectedProblem && (
        <ProblemWorkspace
          problem={selectedProblem}
          problems={problems}
          selectedLanguage={selectedLanguage}
          languages={languages}
          onSelectProblem={(prob) => setSelectedProblem(prob)}
          onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          onChangeMode={() => setView('select-language')}
        />
      )}

      {/* VIEW 4: PREDICT OUTPUT WORKSPACE */}
      {view === 'predict' && (
        <PredictOutputWorkspace
          language={selectedLanguage}
          languages={languages}
          onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          onChangeMode={() => setView('select-language')}
        />
      )}
    </div>
  );
}
