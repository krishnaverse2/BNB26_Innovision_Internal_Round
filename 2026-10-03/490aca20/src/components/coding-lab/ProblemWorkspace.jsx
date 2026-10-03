import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Play,
  Send,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  ChevronDown,
  Layers,
  BookOpen,
  Terminal,
  RotateCcw,
  Sparkles,
  Search,
  Brain,
} from 'lucide-react';
import CodeEditor from './CodeEditor';
import { Pill } from '../ui';
import { runCode, submitCode } from '../../services/codingLabApi';
import { useDemo } from '../../context/DemoContext';

export default function ProblemWorkspace({
  problem,
  problems = [],
  selectedLanguage,
  languages = [],
  onSelectProblem,
  onSelectLanguage,
}) {
  const navigate = useNavigate();
  const { initiateDiagnosis } = useDemo();

  // Current language ID
  const currentLangId = selectedLanguage?.id || 'python';

  // Active code state: initialized with language starter code
  const [code, setCode] = useState(problem?.starterCode?.[currentLangId] || '');
  const [fontSize, setFontSize] = useState(14);
  const [activeTab, setActiveTab] = useState('testcase'); // 'testcase' | 'custom' | 'result'
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState(problem?.sampleTestCases?.[0]?.input || '');

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [executionError, setExecutionError] = useState(null);

  // Problem Switcher dropdown modal/popover
  const [showProblemDropdown, setShowProblemDropdown] = useState(false);
  const [problemSearch, setProblemSearch] = useState('');

  // Update starter code whenever problem or language changes
  useEffect(() => {
    if (problem?.starterCode) {
      const template = problem.starterCode[currentLangId] || problem.starterCode['python'] || '';
      setCode(template);
      setRunResult(null);
      setSubmissionResult(null);
      setExecutionError(null);
      if (problem.sampleTestCases?.[0]) {
        setCustomInput(problem.sampleTestCases[0].input);
      }
    }
  }, [problem?.id, currentLangId]);

  // Handle language switch from header dropdown
  function handleLanguageChange(newLangId) {
    const targetLang = languages.find((l) => l.id === newLangId);
    if (targetLang) {
      onSelectLanguage(targetLang);
      const newTemplate = problem?.starterCode?.[newLangId] || '';
      setCode(newTemplate);
      setRunResult(null);
      setSubmissionResult(null);
    }
  }

  // Handle Reset Code
  function handleResetCode() {
    const template = problem?.starterCode?.[currentLangId] || '';
    setCode(template);
    setRunResult(null);
    setSubmissionResult(null);
  }

  // Handle Run Code (sample test cases or custom input)
  async function handleRunCode() {
    setIsRunning(true);
    setExecutionError(null);
    try {
      const isCustom = activeTab === 'custom';
      const res = await runCode({
        problemId: problem.id,
        language: currentLangId,
        code,
        customInput: isCustom ? customInput : undefined,
      });
      setRunResult(res);
      setSubmissionResult(null);
      setActiveTab('result');
    } catch (err) {
      setExecutionError(err.message || 'Run failed');
      setActiveTab('result');
    } finally {
      setIsRunning(false);
    }
  }

  // Handle Submit Code (full test suite including hidden test cases)
  async function handleSubmitCode() {
    setIsSubmitting(true);
    setExecutionError(null);
    try {
      const res = await submitCode({
        problemId: problem.id,
        language: currentLangId,
        code,
      });
      setSubmissionResult(res);
      setRunResult(null);
      setActiveTab('result');
    } catch (err) {
      setExecutionError(err.message || 'Submission failed');
      setActiveTab('result');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Difficulty badge tone
  const diffTone =
    problem.difficulty === 'Easy'
      ? 'stable'
      : problem.difficulty === 'Medium'
        ? 'developing'
        : 'attention';

  const diffColor =
    problem.difficulty === 'Easy'
      ? '#00b8a3'
      : problem.difficulty === 'Medium'
        ? '#ffc01e'
        : '#ff375f';

  // Filter problems for dropdown
  const filteredProblems = problems.filter(
    (p) =>
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.difficulty.toLowerCase().includes(problemSearch.toLowerCase()) ||
      p.topics.some((t) => t.toLowerCase().includes(problemSearch.toLowerCase()))
  );

  const activeResult = submissionResult || runResult;

  return (
    <div className="stack gap-md animate-rise">
      {/* Top Breadcrumb & Navigation Bar */}
      <div
        className="card"
        style={{
          padding: '10px 18px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
        }}
      >
        <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
          <div className="row wrap" style={{ gap: 12, alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onChangeMode}
              style={{ padding: '6px 10px', color: 'var(--text-soft)' }}
            >
              <ArrowLeft size={15} style={{ marginRight: 4 }} />
              Languages & Modes
            </button>
            <span style={{ color: 'var(--border-strong)' }}>|</span>

            {/* Problem Switcher Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setShowProblemDropdown(!showProblemDropdown)}
                style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <BookOpen size={14} />
                <span>{problem.title}</span>
                <ChevronDown size={14} />
              </button>

              {/* Problem Switcher Dropdown Popover */}
              {showProblemDropdown && (
                <div
                  className="card"
                  style={{
                    position: 'absolute',
                    top: '110%',
                    left: 0,
                    width: 320,
                    maxHeight: 400,
                    overflowY: 'auto',
                    zIndex: 100,
                    padding: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    border: '1px solid var(--border)',
                    background: 'var(--surface)',
                  }}
                >
                  <div
                    className="row"
                    style={{
                      gap: 6,
                      alignItems: 'center',
                      background: 'var(--bg)',
                      padding: '6px 10px',
                      borderRadius: 8,
                      marginBottom: 8,
                    }}
                  >
                    <Search size={14} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Search problems..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: 12,
                        width: '100%',
                      }}
                    />
                  </div>
                  <div className="stack" style={{ gap: 4 }}>
                    {filteredProblems.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          onSelectProblem(p);
                          setShowProblemDropdown(false);
                        }}
                        style={{
                          padding: '8px 10px',
                          borderRadius: 6,
                          cursor: 'pointer',
                          background: p.id === problem.id ? 'var(--blue-50)' : 'transparent',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: p.id === problem.id ? 600 : 400,
                            color: p.id === problem.id ? 'var(--blue-600)' : 'var(--text)',
                          }}
                        >
                          {p.title}
                        </span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color:
                              p.difficulty === 'Easy'
                                ? '#00b8a3'
                                : p.difficulty === 'Medium'
                                  ? '#ffc01e'
                                  : '#ff375f',
                          }}
                        >
                          {p.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Pill tone={diffTone}>{problem.difficulty}</Pill>
          </div>

          {/* Action Buttons in Header */}
          <div className="row wrap" style={{ gap: 8, alignItems: 'center' }}>
            {/* Language Selector Dropdown */}
            <div className="row" style={{ gap: 6, alignItems: 'center' }}>
              <span className="tiny muted">Language:</span>
              <select
                className="select"
                value={currentLangId}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {languages.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Run Code Button */}
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleRunCode}
              disabled={isRunning || isSubmitting}
              style={{ fontWeight: 600 }}
            >
              <Play size={14} />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>

            {/* Submit Button */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSubmitCode}
              disabled={isRunning || isSubmitting}
              style={{
                fontWeight: 600,
                background: '#16a34a',
                borderColor: '#16a34a',
              }}
            >
              <Send size={14} />
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      {/* Main LeetCode Two-Column Workspace */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.15fr',
          gap: 16,
          alignItems: 'start',
        }}
      >
        {/* Left Column: Problem Description & Statement */}
        <div
          className="card"
          style={{
            maxHeight: 'calc(100vh - 170px)',
            overflowY: 'auto',
            padding: '22px 24px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 14,
          }}
        >
          {/* Problem Header */}
          <div style={{ marginBottom: 18 }}>
            <div className="row between wrap" style={{ gap: 10, alignItems: 'center' }}>
              <h2 style={{ fontSize: 22 }}>{problem.title}</h2>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 20,
                  background: `${diffColor}18`,
                  color: diffColor,
                }}
              >
                {problem.difficulty}
              </span>
            </div>

            {/* Topics Tags */}
            <div className="row wrap" style={{ gap: 6, marginTop: 10 }}>
              {problem.topics?.map((topic) => (
                <span
                  key={topic}
                  style={{
                    fontSize: 11,
                    fontWeight: 500,
                    background: 'var(--bg)',
                    color: 'var(--text-soft)',
                    padding: '3px 8px',
                    borderRadius: 6,
                    border: '1px solid var(--border)',
                  }}
                >
                  {topic}
                </span>
              ))}
              {problem.acceptanceRate && (
                <span className="tiny muted" style={{ alignSelf: 'center', marginLeft: 6 }}>
                  Acceptance: {problem.acceptanceRate}
                </span>
              )}
            </div>
          </div>

          <div className="divider" style={{ margin: '14px 0' }} />

          {/* Description Body */}
          <div style={{ fontSize: 14.5, lineHeight: 1.65, color: 'var(--text)' }}>
            <p style={{ whiteSpace: 'pre-line', margin: '0 0 16px' }}>{problem.description}</p>

            {/* Examples */}
            {problem.examples?.map((ex, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg)',
                  borderRadius: 10,
                  padding: '12px 16px',
                  margin: '14px 0',
                  border: '1px solid var(--border)',
                }}
              >
                <div className="strong" style={{ fontSize: 13, marginBottom: 8 }}>
                  Example {idx + 1}:
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--text-soft)' }}>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Input:</strong> {ex.input}
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text)' }}>Output:</strong> {ex.output}
                  </div>
                  {ex.explanation && (
                    <div style={{ marginTop: 4, fontFamily: 'var(--font)' }}>
                      <strong style={{ color: 'var(--text)' }}>Explanation:</strong> {ex.explanation}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Input & Output Format */}
            {problem.inputFormat && (
              <div style={{ marginTop: 16 }}>
                <div className="strong" style={{ fontSize: 13, marginBottom: 4 }}>
                  Input Format:
                </div>
                <p className="small soft" style={{ margin: 0 }}>
                  {problem.inputFormat}
                </p>
              </div>
            )}
            {problem.outputFormat && (
              <div style={{ marginTop: 12 }}>
                <div className="strong" style={{ fontSize: 13, marginBottom: 4 }}>
                  Output Format:
                </div>
                <p className="small soft" style={{ margin: 0 }}>
                  {problem.outputFormat}
                </p>
              </div>
            )}

            {/* Constraints */}
            {problem.constraints?.length ? (
              <div style={{ marginTop: 18 }}>
                <div className="strong" style={{ fontSize: 13, marginBottom: 6 }}>
                  Constraints:
                </div>
                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 13, color: 'var(--text-soft)' }}>
                  {problem.constraints.map((c, i) => (
                    <li key={i} style={{ marginBottom: 4 }}>
                      <code style={{ background: 'var(--bg)', padding: '2px 5px', borderRadius: 4 }}>
                        {c}
                      </code>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Column: Code Editor & Test Execution Panels */}
        <div className="stack gap-md">
          {/* Code Editor */}
          <CodeEditor
            code={code}
            onChange={setCode}
            onReset={handleResetCode}
            language={currentLangId}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            minHeight={340}
          />

          {/* Testcase / Results Panel */}
          <div
            className="card"
            style={{
              padding: '16px 18px',
              background: 'var(--surface)',
              borderRadius: 14,
              border: '1px solid var(--border)',
            }}
          >
            {/* Panel Tabs */}
            <div className="row between" style={{ alignItems: 'center', marginBottom: 14 }}>
              <div className="row" style={{ gap: 6 }}>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'testcase' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('testcase')}
                  style={{ borderRadius: 8, padding: '5px 12px' }}
                >
                  Sample Testcases
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'custom' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('custom')}
                  style={{ borderRadius: 8, padding: '5px 12px' }}
                >
                  Custom Input
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${activeTab === 'result' ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setActiveTab('result')}
                  style={{ borderRadius: 8, padding: '5px 12px' }}
                >
                  Test Result {activeResult ? `(${activeResult.status})` : ''}
                </button>
              </div>

              {/* Bottom Quick Run / Submit */}
              <div className="row" style={{ gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleRunCode}
                  disabled={isRunning || isSubmitting}
                >
                  <Play size={13} />
                  {isRunning ? 'Running...' : 'Run'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSubmitCode}
                  disabled={isRunning || isSubmitting}
                  style={{ background: '#16a34a', borderColor: '#16a34a' }}
                >
                  <Send size={13} />
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>

            {/* TAB 1: Sample Testcases */}
            {activeTab === 'testcase' && (
              <div>
                <div className="row wrap" style={{ gap: 8, marginBottom: 12 }}>
                  {problem.sampleTestCases?.map((tc, idx) => (
                    <button
                      key={tc.id}
                      type="button"
                      className={`btn btn-sm ${selectedCaseIdx === idx ? 'btn-secondary' : 'btn-ghost'}`}
                      onClick={() => setSelectedCaseIdx(idx)}
                      style={{
                        borderRadius: 8,
                        fontWeight: selectedCaseIdx === idx ? 700 : 500,
                        border: selectedCaseIdx === idx ? '1px solid var(--border-strong)' : 'none',
                      }}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {problem.sampleTestCases?.[selectedCaseIdx] && (
                  <div
                    style={{
                      background: 'var(--bg)',
                      padding: '12px 16px',
                      borderRadius: 10,
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                    }}
                  >
                    <div className="tiny muted strong" style={{ marginBottom: 4 }}>
                      Input
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {problem.sampleTestCases[selectedCaseIdx].input}
                    </pre>

                    <div className="tiny muted strong" style={{ margin: '10px 0 4px' }}>
                      Expected Output
                    </div>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-soft)' }}>
                      {problem.sampleTestCases[selectedCaseIdx].expectedOutput}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Custom Input */}
            {activeTab === 'custom' && (
              <div>
                <label className="field-label" style={{ marginBottom: 6, display: 'block' }}>
                  Provide your own custom test case input (lines passed to the solution):
                </label>
                <textarea
                  className="textarea"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Enter inputs here..."
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13,
                    minHeight: 110,
                  }}
                />
                <p className="tiny muted" style={{ marginTop: 6 }}>
                  Click "Run" to test your code against this custom input.
                </p>
              </div>
            )}

            {/* TAB 3: Execution Result Panel */}
            {activeTab === 'result' && (
              <div>
                {/* Loading State */}
                {(isRunning || isSubmitting) && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '30px 20px',
                      color: 'var(--text-soft)',
                    }}
                  >
                    <div
                      className="spin"
                      style={{
                        display: 'inline-block',
                        width: 24,
                        height: 24,
                        border: '3px solid var(--border)',
                        borderTopColor: 'var(--blue-500)',
                        borderRadius: '50%',
                        marginBottom: 10,
                      }}
                    />
                    <div className="strong">
                      {isSubmitting ? 'Evaluating against hidden test cases...' : 'Executing code on test engine...'}
                    </div>
                  </div>
                )}

                {/* Execution Error Banner */}
                {!isRunning && !isSubmitting && executionError && (
                  <div
                    className="callout error"
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                    }}
                  >
                    <div className="row" style={{ gap: 8, alignItems: 'center', fontWeight: 600 }}>
                      <AlertTriangle size={16} />
                      Execution Error
                    </div>
                    <pre
                      style={{
                        margin: '8px 0 0',
                        fontSize: 12,
                        fontFamily: 'var(--mono)',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {executionError}
                    </pre>
                  </div>
                )}

                {/* Active Results Display */}
                {!isRunning && !isSubmitting && !executionError && activeResult && (
                  <div className="stack gap-sm">
                    {/* Verdict Banner */}
                    <div
                      style={{
                        padding: '14px 18px',
                        borderRadius: 10,
                        background:
                          activeResult.status === 'Accepted'
                            ? '#ecfdf3'
                            : activeResult.status === 'Finished'
                              ? 'var(--bg)'
                              : '#fef2f2',
                        border: `1px solid ${
                          activeResult.status === 'Accepted'
                            ? '#bbf7d0'
                            : activeResult.status === 'Finished'
                              ? 'var(--border)'
                              : '#fecaca'
                        }`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 12,
                      }}
                    >
                      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                        {activeResult.status === 'Accepted' ? (
                          <CheckCircle2 size={24} color="#16a34a" />
                        ) : activeResult.status === 'Finished' ? (
                          <Terminal size={22} color="var(--blue-500)" />
                        ) : (
                          <XCircle size={24} color="#dc2626" />
                        )}
                        <div>
                          <div
                            style={{
                              fontSize: 18,
                              fontWeight: 700,
                              color:
                                activeResult.status === 'Accepted'
                                  ? '#16a34a'
                                  : activeResult.status === 'Finished'
                                    ? 'var(--text)'
                                    : '#dc2626',
                            }}
                          >
                            {activeResult.status}
                          </div>
                          <span className="tiny muted">
                            {submissionResult
                              ? `${activeResult.passedCount} / ${activeResult.totalCount} test cases passed (Submission Verdict)`
                              : `${activeResult.passedCount} / ${activeResult.totalCount} test cases passed`}
                          </span>
                        </div>
                      </div>

                      {/* Performance Benchmarks */}
                      <div className="row wrap" style={{ gap: 14 }}>
                        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                          <Clock size={16} color="var(--text-muted)" />
                          <div>
                            <div className="strong" style={{ fontSize: 13 }}>
                              {activeResult.runtimeMs} ms
                            </div>
                            <span className="tiny muted">
                              Beats {activeResult.runtimePercentile}%
                            </span>
                          </div>
                        </div>

                        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
                          <Cpu size={16} color="var(--text-muted)" />
                          <div>
                            <div className="strong" style={{ fontSize: 13 }}>
                              {activeResult.memoryMB} MB
                            </div>
                            <span className="tiny muted">
                              Beats {activeResult.memoryPercentile}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Compilation / Runtime Error message if any */}
                    {activeResult.error && (
                      <div
                        style={{
                          background: '#181a20',
                          color: '#f87171',
                          padding: '12px 14px',
                          borderRadius: 8,
                          fontFamily: 'var(--mono)',
                          fontSize: 12,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {activeResult.error}
                      </div>
                    )}

                    {/* Test Case Breakdown Tabs */}
                    {activeResult.results?.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div className="row wrap" style={{ gap: 6, marginBottom: 10 }}>
                          {activeResult.results.map((r, i) => (
                            <button
                              key={r.id || i}
                              type="button"
                              className={`btn btn-sm ${selectedCaseIdx === i ? 'btn-secondary' : 'btn-ghost'}`}
                              onClick={() => setSelectedCaseIdx(i)}
                              style={{
                                borderRadius: 6,
                                padding: '4px 10px',
                                fontSize: 12,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                color: r.passed ? '#16a34a' : '#dc2626',
                              }}
                            >
                              <span>{r.passed ? '✓' : '✗'}</span>
                              <span>Case {i + 1}</span>
                            </button>
                          ))}
                        </div>

                        {activeResult.results[selectedCaseIdx] && (
                          <div
                            style={{
                              background: 'var(--bg)',
                              borderRadius: 10,
                              padding: '12px 14px',
                              fontFamily: 'var(--mono)',
                              fontSize: 12.5,
                            }}
                          >
                            <div className="tiny muted strong" style={{ marginBottom: 4 }}>
                              Input
                            </div>
                            <div style={{ color: 'var(--text)' }}>
                              {activeResult.results[selectedCaseIdx].input}
                            </div>

                            {activeResult.results[selectedCaseIdx].expectedOutput ? (
                              <>
                                <div className="tiny muted strong" style={{ margin: '10px 0 4px' }}>
                                  Expected Output
                                </div>
                                <div style={{ color: '#16a34a' }}>
                                  {activeResult.results[selectedCaseIdx].expectedOutput}
                                </div>
                              </>
                            ) : null}

                            <div className="tiny muted strong" style={{ margin: '10px 0 4px' }}>
                              Actual Output
                            </div>
                            <div
                              style={{
                                color: activeResult.results[selectedCaseIdx].passed
                                  ? '#16a34a'
                                  : '#dc2626',
                                fontWeight: 600,
                              }}
                            >
                              {activeResult.results[selectedCaseIdx].actualOutput || '(no output)'}
                            </div>

                            {activeResult.results[selectedCaseIdx].stdout && (
                              <>
                                <div className="tiny muted strong" style={{ margin: '10px 0 4px' }}>
                                  Stdout / Console Logs
                                </div>
                                <div style={{ color: 'var(--text-soft)' }}>
                                  {activeResult.results[selectedCaseIdx].stdout}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Re:Learn Cognitive Diagnosis Bridge on error or failed test case */}
                    {activeResult && activeResult.status !== 'Accepted' && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: '12px 16px',
                          background: 'rgba(124, 58, 237, 0.08)',
                          borderRadius: 10,
                          border: '1px solid rgba(124, 58, 237, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--violet-600)', fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Brain size={16} />
                            Re:Learn AI Cognitive Diagnosis Available
                          </div>
                          <div className="small soft" style={{ marginTop: 2 }}>
                            Test case failed. Run live Bayesian diagnosis to detect underlying misconception.
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={() => {
                            const failCase = activeResult.firstFailure || activeResult.results?.find((r) => !r.passed) || activeResult.results?.[0];
                            initiateDiagnosis({
                              questionId: problem.id,
                              studentAnswer: failCase?.actualOutput || 'Compilation/Runtime Error',
                              expectedOutput: failCase?.expectedOutput || '',
                              code: code,
                              language: currentLangId,
                              title: problem.title,
                            });
                            navigate('/diagnosis');
                          }}
                        >
                          Run AI Diagnosis →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Empty State before running */}
                {!isRunning && !isSubmitting && !activeResult && !executionError && (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '24px 16px',
                      color: 'var(--text-muted)',
                      fontSize: 13,
                    }}
                  >
                    You must run your code first to view execution results.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
