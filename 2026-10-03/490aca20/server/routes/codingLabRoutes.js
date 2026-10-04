import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { executeProblem, compareOutputs, normalizeOutput } from '../services/codeExecutionService.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROBLEMS_FILE = path.join(__dirname, '../data/problems.json');
const PREDICT_FILE = path.join(__dirname, '../data/predictQuestions.json');
const LANGUAGES_FILE = path.join(__dirname, '../data/languages.json');
const SUBMISSIONS_FILE = path.join(__dirname, '../data/submissions.json');
const PROFILES_FILE = path.join(__dirname, '../data/studentProfiles.json');

function readFile(p) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return [];
  }
}

function writeFile(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

export const codingLabRouter = Router();

codingLabRouter.use(optionalAuth);

// GET /api/coding-lab/languages
codingLabRouter.get('/languages', (req, res) => {
  const languages = readFile(LANGUAGES_FILE);
  res.json({
    ok: true,
    total: languages.length,
    languages,
  });
});

// GET /api/coding-lab/problems (Only published problems for students)
codingLabRouter.get('/problems', (req, res) => {
  const { difficulty, tag, search } = req.query;
  const problems = readFile(PROBLEMS_FILE);

  // Filter ONLY published problems
  let filtered = problems
    .filter((p) => p.isPublished !== false)
    .map((p) => {
      const { hiddenTestCases, referenceCode, ...safeProblem } = p;
      return safeProblem;
    });

  if (difficulty && difficulty !== 'All') {
    filtered = filtered.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
  }

  if (tag && tag !== 'All') {
    filtered = filtered.filter((p) => p.topics.some((t) => t.toLowerCase() === tag.toLowerCase()));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.topics.some((t) => t.toLowerCase().includes(q))
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
  const problems = readFile(PROBLEMS_FILE);
  const problem = problems.find(
    (p) => (p.id === req.params.id || p.slug === req.params.id) && p.isPublished !== false
  );

  if (!problem) {
    return res.status(404).json({ ok: false, error: 'Problem not found or not published.' });
  }

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

    const problems = readFile(PROBLEMS_FILE);
    const problem = problems.find((p) => p.id === problemId);
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

// POST /api/coding-lab/submit (Executes & records student submission)
codingLabRouter.post('/submit', async (req, res) => {
  try {
    const { problemId, language, code } = req.body;

    if (!problemId || !language || code === undefined) {
      return res.status(400).json({ ok: false, error: 'Missing required parameters: problemId, language, code' });
    }

    const problems = readFile(PROBLEMS_FILE);
    const problem = problems.find((p) => p.id === problemId);
    if (!problem) {
      return res.status(404).json({ ok: false, error: 'Problem not found' });
    }

    const result = await executeProblem({
      problem,
      language: language.toLowerCase(),
      code,
      isSubmission: true,
    });

    // Record submission to submissions.json
    const submissions = readFile(SUBMISSIONS_FILE);
    const studentUser = req.user || {
      id: 'usr_student_01',
      name: 'Krishna Sonawane',
      email: 'student@gmail.com',
    };

    const newSubmission = {
      id: 'sub_' + Date.now(),
      userId: studentUser.id,
      studentName: studentUser.name,
      studentEmail: studentUser.email,
      problemId: problem.id,
      problemTitle: problem.title,
      language: language.toLowerCase(),
      status: result.status,
      passedCount: result.passedCount,
      totalCount: result.totalCount,
      runtimeMs: result.runtimeMs,
      runtimePercentile: result.runtimePercentile,
      memoryMB: result.memoryMB,
      memoryPercentile: result.memoryPercentile,
      code,
      submittedAt: new Date().toISOString(),
    };

    submissions.push(newSubmission);
    writeFile(SUBMISSIONS_FILE, submissions);

    // Update student profile stats
    const profiles = readFile(PROFILES_FILE);
    const profile = profiles.find((p) => p.userId === studentUser.id || p.email === studentUser.email);
    if (profile) {
      profile.submissionsCount = (profile.submissionsCount || 0) + 1;
      if (result.status === 'Accepted') {
        profile.acceptedSubmissions = (profile.acceptedSubmissions || 0) + 1;
      }
      profile.accuracy = Math.round((profile.acceptedSubmissions / Math.max(1, profile.submissionsCount)) * 100);
      profile.languageUsage = profile.languageUsage || {};
      profile.languageUsage[language.toLowerCase()] = (profile.languageUsage[language.toLowerCase()] || 0) + 1;
      profile.recentActivity = `Submitted '${problem.title}' in ${language.toUpperCase()} (${result.status})`;
      profile.lastActive = new Date().toISOString();
      writeFile(PROFILES_FILE, profiles);
    }

    res.json({
      ok: true,
      submissionId: newSubmission.id,
      ...result,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message || 'Submission error occurred',
    });
  }
});

// GET /api/coding-lab/predict-output (Only published questions for students)
codingLabRouter.get('/predict-output', (req, res) => {
  const { language } = req.query;
  const questions = readFile(PREDICT_FILE);

  let filtered = questions.filter((q) => q.isPublished !== false);
  if (language && language !== 'all') {
    filtered = filtered.filter((q) => q.language.toLowerCase() === language.toLowerCase());
  }

  const sanitized = filtered.map((q) => ({
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
  const questions = readFile(PREDICT_FILE);
  const question = questions.find((q) => q.id === req.params.id && q.isPublished !== false);
  if (!question) {
    return res.status(404).json({ ok: false, error: 'Question not found or not published.' });
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

    const questions = readFile(PREDICT_FILE);
    const question = questions.find((q) => q.id === questionId);
    if (!question) {
      return res.status(404).json({ ok: false, error: 'Question not found' });
    }

    const isCorrect = compareOutputs(answer, question.expectedOutput);

    // Update student predict stats if student logged in
    const studentUser = req.user;
    if (studentUser) {
      const profiles = readFile(PROFILES_FILE);
      const profile = profiles.find((p) => p.userId === studentUser.id || p.email === studentUser.email);
      if (profile) {
        profile.predictOutputAttempted = (profile.predictOutputAttempted || 0) + 1;
        if (isCorrect) {
          profile.predictOutputCorrect = (profile.predictOutputCorrect || 0) + 1;
        }
        profile.predictAccuracy = Math.round(
          (profile.predictOutputCorrect / Math.max(1, profile.predictOutputAttempted)) * 100
        );
        profile.recentActivity = `Predicted output for '${question.title}' (${isCorrect ? 'Correct' : 'Incorrect'})`;
        profile.lastActive = new Date().toISOString();
        writeFile(PROFILES_FILE, profiles);
      }
    }

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
