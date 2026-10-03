import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Send,
  Terminal,
  Wand2,
  BookOpen,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Code,
} from 'lucide-react';
import { CodeBlock, Pill, Card, CardHeader } from '../ui';
import { evaluatePrediction, getPredictQuestions } from '../../services/codingLabApi';
import { useDemo } from '../../context/DemoContext';

export default function PredictOutputWorkspace({
  language,
  languages = [],
  onSelectLanguage,
  onChangeMode,
}) {
  const navigate = useNavigate();
  const { submitAnswer } = useDemo();

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [error, setError] = useState('');

  // Fetch questions for this language
  useEffect(() => {
    async function load() {
      const qs = await getPredictQuestions(language?.id || 'python');
      setQuestions(qs);
      setCurrentIdx(0);
      setPrediction('');
      setEvalResult(null);
      setError('');
    }
    load();
  }, [language?.id]);

  const currentQ = questions[currentIdx] || null;

  async function handleSubmit() {
    if (!prediction.trim()) {
      setError('Please enter your predicted output before submitting.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const res = await evaluatePrediction({
        questionId: currentQ.id,
        answer: prediction.trim(),
      });
      setEvalResult(res);

      // If this is connected to Re:Learn's demo misconception question, also update DemoContext
      if (currentQ.relatedMisconceptionId) {
        submitAnswer({
          questionId: currentQ.id,
          answer: prediction.trim(),
          runOutput: res.expectedOutput,
        });
      }
    } catch (err) {
      setError(err.message || 'Evaluation failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoWrongAnswer() {
    if (currentQ?.demoWrongAnswer) {
      setPrediction(currentQ.demoWrongAnswer);
      setError('');
    }
  }

  function handleNextQuestion() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setPrediction('');
      setEvalResult(null);
      setError('');
    }
  }

  function handlePrevQuestion() {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
      setPrediction('');
      setEvalResult(null);
      setError('');
    }
  }

  return (
    <div className="stack gap-lg animate-rise">
      {/* Top Header Bar */}
      <div
        className="card"
        style={{
          padding: '12px 18px',
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

            <div className="row" style={{ gap: 8, alignItems: 'center' }}>
              <span className="strong" style={{ fontSize: 15 }}>
                {language?.name || 'Python'} Output Prediction
              </span>
              {currentQ && <Pill tone="violet">{currentQ.concept}</Pill>}
            </div>
          </div>

          {/* Language Switcher and Question Pager */}
          <div className="row wrap" style={{ gap: 10, alignItems: 'center' }}>
            <select
              className="select"
              value={language?.id || 'python'}
              onChange={(e) => {
                const target = languages.find((l) => l.id === e.target.value);
                if (target) onSelectLanguage(target);
              }}
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

            {questions.length > 1 && (
              <div className="row" style={{ gap: 4, alignItems: 'center' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handlePrevQuestion}
                  disabled={currentIdx === 0}
                  style={{ padding: '6px 8px' }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="tiny muted" style={{ minWidth: 46, textAlign: 'center' }}>
                  {currentIdx + 1} / {questions.length}
                </span>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleNextQuestion}
                  disabled={currentIdx === questions.length - 1}
                  style={{ padding: '6px 8px' }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {currentQ ? (
        <div className="grid sidebar-split" style={{ alignItems: 'start' }}>
          {/* Left Column: Code Snippet to Predict */}
          <Card>
            <CardHeader
              icon={<Terminal size={18} />}
              title={currentQ.title}
              subtitle="Analyze the code snippet below and predict what it outputs to the console."
              actions={
                <Pill
                  tone={
                    currentQ.difficulty === 'Easy'
                      ? 'stable'
                      : currentQ.difficulty === 'Medium'
                        ? 'developing'
                        : 'attention'
                  }
                >
                  {currentQ.difficulty}
                </Pill>
              }
            />

            {/* Code Snippet Box */}
            <div style={{ marginTop: 12 }}>
              <CodeBlock
                code={currentQ.code}
                language={language?.id || 'python'}
                title={`snippet.${language?.extension || 'py'}`}
              />
            </div>

            {/* Tags */}
            {currentQ.tags && (
              <div className="row wrap" style={{ gap: 6, marginTop: 16 }}>
                {currentQ.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      background: 'var(--bg)',
                      padding: '3px 8px',
                      borderRadius: 6,
                      color: 'var(--text-soft)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Right Column: Prediction Input & Results */}
          <div className="stack gap">
            <Card>
              <CardHeader
                title="Your Predicted Output"
                subtitle="Enter exact expected console output (one line per printed value)."
              />

              <div className="field" style={{ marginTop: 12 }}>
                <textarea
                  className="textarea"
                  value={prediction}
                  spellCheck={false}
                  placeholder="Enter what you believe this program will print..."
                  onChange={(e) => setPrediction(e.target.value)}
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: 13.5,
                    minHeight: 110,
                  }}
                />

                <div className="row between wrap" style={{ gap: 8, marginTop: 8 }}>
                  {currentQ.demoWrongAnswer ? (
                    <button
                      type="button"
                      className="btn btn-soft btn-sm"
                      onClick={handleDemoWrongAnswer}
                    >
                      <Wand2 size={14} style={{ marginRight: 4 }} />
                      Use Demo Wrong Answer
                    </button>
                  ) : <div />}

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setPrediction('');
                      setEvalResult(null);
                      setError('');
                    }}
                  >
                    Clear
                  </button>
                </div>

                {error ? (
                  <div className="callout error" style={{ marginTop: 10 }}>
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  className="btn btn-primary btn-lg btn-block"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{ marginTop: 14 }}
                >
                  <Send size={16} />
                  {isSubmitting ? 'Evaluating Output...' : 'Submit Prediction'}
                </button>
              </div>
            </Card>

            {/* Evaluation Result Feedback */}
            {evalResult && (
              <Card
                className={evalResult.isCorrect ? 'flat' : 'accent'}
                style={{
                  border: `1px solid ${evalResult.isCorrect ? '#86efac' : '#fca5a5'}`,
                  background: evalResult.isCorrect ? '#f0fdf4' : '#fff5f5',
                }}
              >
                <div className="stack gap">
                  <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                    {evalResult.isCorrect ? (
                      <CheckCircle2 size={24} color="#16a34a" />
                    ) : (
                      <XCircle size={24} color="#dc2626" />
                    )}
                    <div>
                      <div
                        style={{
                          fontSize: 17,
                          fontWeight: 700,
                          color: evalResult.isCorrect ? '#16a34a' : '#dc2626',
                        }}
                      >
                        {evalResult.isCorrect ? 'Correct! Excellent mental trace.' : 'Incorrect Output'}
                      </div>
                      <span className="tiny muted">
                        {evalResult.isCorrect
                          ? 'Your predicted output matches the compiler/interpreter output.'
                          : 'Your predicted output differs from the actual execution.'}
                      </span>
                    </div>
                  </div>

                  {/* Output Comparison Grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: 12,
                      background: 'var(--surface)',
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: '1px solid var(--border)',
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div className="tiny muted strong" style={{ marginBottom: 4 }}>
                        Your Answer
                      </div>
                      <div style={{ color: evalResult.isCorrect ? '#16a34a' : '#dc2626' }}>
                        {evalResult.userAnswer || '(empty)'}
                      </div>
                    </div>
                    <div>
                      <div className="tiny muted strong" style={{ marginBottom: 4 }}>
                        Expected Output
                      </div>
                      <div style={{ color: '#16a34a', fontWeight: 600 }}>
                        {evalResult.expectedOutput}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  {evalResult.explanation && (
                    <div style={{ fontSize: 13.5, lineHeight: 1.6, color: 'var(--text)' }}>
                      <div className="strong" style={{ marginBottom: 4 }}>
                        Execution Explanation:
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-soft)' }}>
                        {evalResult.explanation}
                      </p>
                    </div>
                  )}

                  {/* Line by line trace if available */}
                  {evalResult.executionDetails && (
                    <div
                      style={{
                        background: 'var(--surface)',
                        padding: '10px 14px',
                        borderRadius: 8,
                        fontSize: 12,
                        fontFamily: 'var(--mono)',
                        whiteSpace: 'pre-wrap',
                        border: '1px solid var(--border)',
                        color: 'var(--text-soft)',
                      }}
                    >
                      <div className="tiny muted strong" style={{ marginBottom: 4 }}>
                        Execution Trace
                      </div>
                      {evalResult.executionDetails}
                    </div>
                  )}

                  {/* Re:Learn Diagnosis Continuity Bridge */}
                  {!evalResult.isCorrect && (
                    <div
                      style={{
                        borderTop: '1px solid #fecaca',
                        paddingTop: 12,
                        marginTop: 4,
                      }}
                    >
                      <p className="small soft" style={{ marginBottom: 10 }}>
                        Re:Learn can analyze <em>why</em> you predicted this and detect underlying misconceptions.
                      </p>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={() => navigate('/diagnosis')}
                      >
                        Explain My Thinking
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  )}

                  {/* Next question button */}
                  {evalResult.isCorrect && currentIdx < questions.length - 1 && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={handleNextQuestion}
                    >
                      Next Question
                      <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
          <p className="strong">No questions currently available for {language?.name}.</p>
          <p className="small soft">Please choose another language or check back shortly.</p>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onChangeMode}
            style={{ marginTop: 14 }}
          >
            Select Another Language
          </button>
        </Card>
      )}
    </div>
  );
}
