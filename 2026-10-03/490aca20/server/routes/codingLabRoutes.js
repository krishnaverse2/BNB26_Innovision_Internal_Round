import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeProblem, compareOutputs, normalizeOutput } from '../services/codeExecutionService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read JSON data files
const languagesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/languages.json'), 'utf-8')
);
const problemsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/problems.json'), 'utf-8')
);
const predictQuestionsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../data/predictQuestions.json'), 'utf-8')
);

export const codingLabRouter = Router();

// GET /api/coding-lab/languages
codingLabRouter.get('/languages', (req, res) => {
  res.json({
    ok: true,
    total: languagesData.length,
    languages: languagesData,
  });
});

// GET /api/coding-lab/problems
codingLabRouter.get('/problems', (req, res) => {
  const { difficulty, tag, search } = req.query;

  let filtered = problemsData.map(p => {
    // Return sanitized problem metadata for list view
    const { hiddenTestCases, referenceCode, ...safeProblem } = p;
    return safeProblem;
  });

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter(p => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (tag && tag !== 'All') {
    filtered = filtered.filter(p => p.topics.some(t => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.topics.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({
    ok: true,
    total: filtered.length,
    problems: filtered,
  });
});

// GET /api/coding-lab/problems/:id
codingLabRouter.get('/problems/:id', (req, res) => {
  const problem = problemsData.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!problem) {
    return res.status(404).json({ ok: false, error: 'Problem not found' });
  }

  // Hide hidden test cases from client response
  const { hiddenTestCases, referenceCode, ...clientProblem } = problem;
  res.json({
    ok: true,
    problem: clientProblem,
  });
});

// POST /api/coding-lab/run
codingLabRouter.post('/run', async (req, res) => {
  try {
    const { problemId, language, code, customInput } = req.body;

    if (!problemId || !language || code === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing required parameters: problemId, language, code' });
    }

    const problem = problemsData.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ ok: false, error: 'Problem not found' });
    }

    const result = await executeProblem({
      problem,
      language: language.toLowerCase(),
      code,
      customInput,
      isSubmission: false,
    });

    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Execution error occurred',
    });
  }
});

// POST /api/coding-lab/submit
codingLabRouter.post('/submit', async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || code === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing required parameters: problemId, language, code' });
    }

    const problem = problemsData.find(p => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ ok: false, error: 'Problem not found' });
    }

    const result = await executeProblem({
      problem,
      language: language.toLowerCase(),
      code,
      isSubmission: true,
    });

    res.json({
      ok: true,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Submission error occurred',
    });
  }
});

// GET /api/coding-lab/predict-output
codingLabRouter.get('/predict-output', (req, res) => {
  const { language } = req.query;

  let questions = predictQuestionsData;
  if (language && language !== 'all') {
    questions = questions.filter(q => q.language.toLowerCase() === language.toLowerCase());
  }

  // For predict list, do not reveal expectedOutput or explanation in advance
  const sanitized = questions.map(q => ({
    id: q.id,
    language: q.language,
    title: q.title,
    concept: q.concept,
    difficulty: q.difficulty,
    tags: q.tags,
    code: q.code,
    demoWrongAnswer: q.demoWrongAnswer,
    relatedMisconceptionId: q.relatedMisconceptionId,
  }));

  res.json({
    ok: true,
    total: sanitized.length,
    questions: sanitized,
  });
});

// GET /api/coding-lab/predict-output/:id
codingLabRouter.get('/predict-output/:id', (req, res) => {
  const question = predictQuestionsData.find(q => q.id === req.params.id);
  if (!question) {
    return res.status(404).json({ ok: false, error: 'Question not found' });
  }

  const { expectedOutput, explanation, executionDetails, ...safeQuestion } = question;
  res.json({
    ok: true,
    question: safeQuestion,
  });
});

// POST /api/coding-lab/predict-output/evaluate
codingLabRouter.post('/predict-output/evaluate', (req, res) => {
  try {
    const { questionId, answer } = req.body;

    if (!questionId || answer === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing questionId or answer' });
    }

    const question = predictQuestionsData.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }

    const isCorrect = compareOutputs(answer, question.expectedOutput);

    res.json({
      ok: true,
      questionId: question.id,
      isCorrect,
      userAnswer: String(answer).trim(),
      expectedOutput: question.expectedOutput,
      explanation: question.explanation,
      executionDetails: question.executionDetails,
      relatedMisconceptionId: question.relatedMisconceptionId || null,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Evaluation failed',
    });
  }
});
