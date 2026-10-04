import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyAuth, requireTeacher } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROBLEMS_FILE = path.join(__dirname, '../data/problems.json');
const PREDICT_FILE = path.join(__dirname, '../data/predictQuestions.json');
const PROFILES_FILE = path.join(__dirname, '../data/studentProfiles.json');
const SUBMISSIONS_FILE = path.join(__dirname, '../data/submissions.json');

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

export const teacherRouter = Router();

// Protect ALL teacher routes with verifyAuth and requireTeacher
teacherRouter.use(verifyAuth, requireTeacher);

// GET /api/teacher/overview
teacherRouter.get('/overview', (req, res) => {
  const students = readFile(PROFILES_FILE);
  const problems = readFile(PROBLEMS_FILE);
  const submissions = readFile(SUBMISSIONS_FILE);
  const predictQuestions = readFile(PREDICT_FILE);

  const totalStudents = students.length;
  const totalProblems = problems.length;
  const publishedProblems = problems.filter((p) => p.isPublished).length;
  const totalSubmissions = submissions.length;
  const acceptedSubmissions = submissions.filter((s) => s.status === 'Accepted').length;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedSubmissions / totalSubmissions) * 100) : 0;

  // Language usage across submissions
  const languageUsage = {};
  submissions.forEach((s) => {
    languageUsage[s.language] = (languageUsage[s.language] || 0) + 1;
  });

  // Difficulty counts
  const difficultyDistribution = {
    Easy: problems.filter((p) => p.difficulty === 'Easy').length,
    Medium: problems.filter((p) => p.difficulty === 'Medium').length,
    Hard: problems.filter((p) => p.difficulty === 'Hard').length,
  };

  // Recent 6 submissions
  const recentSubmissions = [...submissions].reverse().slice(0, 6);

  res.json({
    ok: true,
    overview: {
      totalStudents,
      totalProblems,
      publishedProblems,
      totalSubmissions,
      acceptedSubmissions,
      acceptanceRate,
      predictQuestionsCount: predictQuestions.length,
      languageUsage,
      difficultyDistribution,
      recentSubmissions,
    },
  });
});

// GET /api/teacher/students
teacherRouter.get('/students', (req, res) => {
  const { search, branch, college, year } = req.query;
  let students = readFile(PROFILES_FILE);

  if (search) {
    const q = search.toLowerCase();
    students = students.filter(
      (s) =>
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.college.toLowerCase().includes(q) ||
        s.branch.toLowerCase().includes(q)
    );
  }

  if (branch && branch !== 'All') {
    students = students.filter((s) => s.branch.toLowerCase() === branch.toLowerCase());
  }

  if (college && college !== 'All') {
    students = students.filter((s) => s.college.toLowerCase() === college.toLowerCase());
  }

  if (year && year !== 'All') {
    students = students.filter((s) => s.yearSemester.toLowerCase().includes(year.toLowerCase()));
  }

  res.json({
    ok: true,
    total: students.length,
    students,
  });
});

// GET /api/teacher/students/:id
teacherRouter.get('/students/:id', (req, res) => {
  const students = readFile(PROFILES_FILE);
  const student = students.find((s) => s.userId === req.params.id);
  if (!student) {
    return res.status(404).json({ ok: false, error: 'Student profile not found.' });
  }

  const submissions = readFile(SUBMISSIONS_FILE).filter(
    (s) => s.userId === req.params.id || s.studentEmail.toLowerCase() === student.email.toLowerCase()
  );

  res.json({
    ok: true,
    student,
    submissions,
  });
});

// GET /api/teacher/problems (All problems including drafts)
teacherRouter.get('/problems', (req, res) => {
  const problems = readFile(PROBLEMS_FILE);
  res.json({
    ok: true,
    total: problems.length,
    problems,
  });
});

// POST /api/teacher/problems (Create Question)
teacherRouter.post('/problems', (req, res) => {
  try {
    const {
      title,
      difficulty = 'Easy',
      topics = [],
      description,
      inputFormat,
      outputFormat,
      constraints = [],
      examples = [],
      sampleTestCases = [],
      hiddenTestCases = [],
      starterCode = {},
      isPublished = true,
      companies = [],
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ ok: false, error: 'Question title is required.' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ ok: false, error: 'Problem description is required.' });
    }

    const problems = readFile(PROBLEMS_FILE);
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const id = slug || 'prob-' + Date.now();

    // Check duplicate id/slug
    if (problems.some((p) => p.id === id)) {
      return res.status(400).json({ ok: false, error: 'A problem with this title or slug already exists.' });
    }

    const newProblem = {
      id,
      slug,
      title: title.trim(),
      difficulty,
      acceptanceRate: '0.0%',
      topics: Array.isArray(topics) ? topics : typeof topics === 'string' ? topics.split(',').map((t) => t.trim()) : [],
      companies: Array.isArray(companies) ? companies : [],
      description: description.trim(),
      inputFormat: inputFormat?.trim() || '',
      outputFormat: outputFormat?.trim() || '',
      constraints: Array.isArray(constraints) ? constraints : [],
      examples: Array.isArray(examples) ? examples : [],
      sampleTestCases: Array.isArray(sampleTestCases) ? sampleTestCases : [],
      hiddenTestCases: Array.isArray(hiddenTestCases) ? hiddenTestCases : [],
      starterCode: typeof starterCode === 'object' && starterCode !== null ? starterCode : {},
      isPublished: Boolean(isPublished),
      createdAt: new Date().toISOString(),
      author: req.user.name,
    };

    problems.push(newProblem);
    writeFile(PROBLEMS_FILE, problems);

    res.status(201).json({
      ok: true,
      message: 'Question created successfully.',
      problem: newProblem,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to create problem.' });
  }
});

// PUT /api/teacher/problems/:id (Edit Question)
teacherRouter.put('/problems/:id', (req, res) => {
  try {
    const problems = readFile(PROBLEMS_FILE);
    const idx = problems.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Problem not found.' });
    }

    const existing = problems[idx];
    const updated = {
      ...existing,
      ...req.body,
      id: existing.id, // preserve id
      updatedAt: new Date().toISOString(),
    };

    problems[idx] = updated;
    writeFile(PROBLEMS_FILE, problems);

    res.json({
      ok: true,
      message: 'Question updated successfully.',
      problem: updated,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to update problem.' });
  }
});

// DELETE /api/teacher/problems/:id
teacherRouter.delete('/problems/:id', (req, res) => {
  try {
    const problems = readFile(PROBLEMS_FILE);
    const idx = problems.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Problem not found.' });
    }

    const deleted = problems.splice(idx, 1)[0];
    writeFile(PROBLEMS_FILE, problems);

    res.json({
      ok: true,
      message: `Problem "${deleted.title}" deleted successfully.`,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to delete problem.' });
  }
});

// PATCH /api/teacher/problems/:id/publish (Toggle publish status)
teacherRouter.patch('/problems/:id/publish', (req, res) => {
  const problems = readFile(PROBLEMS_FILE);
  const problem = problems.find((p) => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ ok: false, error: 'Problem not found.' });
  }

  problem.isPublished = !problem.isPublished;
  writeFile(PROBLEMS_FILE, problems);

  res.json({
    ok: true,
    isPublished: problem.isPublished,
    message: problem.isPublished ? 'Question published to students.' : 'Question unpublished (Draft mode).',
  });
});

// POST /api/teacher/problems/:id/duplicate
teacherRouter.post('/problems/:id/duplicate', (req, res) => {
  const problems = readFile(PROBLEMS_FILE);
  const problem = problems.find((p) => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ ok: false, error: 'Problem not found.' });
  }

  const newId = `${problem.id}-copy-${Date.now()}`;
  const duplicated = {
    ...JSON.parse(JSON.stringify(problem)),
    id: newId,
    slug: newId,
    title: `${problem.title} (Copy)`,
    isPublished: false,
    createdAt: new Date().toISOString(),
    author: req.user.name,
  };

  problems.push(duplicated);
  writeFile(PROBLEMS_FILE, problems);

  res.json({
    ok: true,
    message: 'Question duplicated as a draft.',
    problem: duplicated,
  });
});

// GET /api/teacher/predict-output
teacherRouter.get('/predict-output', (req, res) => {
  const questions = readFile(PREDICT_FILE);
  res.json({
    ok: true,
    total: questions.length,
    questions,
  });
});

// POST /api/teacher/predict-output
teacherRouter.post('/predict-output', (req, res) => {
  try {
    const {
      language,
      title,
      concept,
      difficulty = 'Easy',
      tags = [],
      code,
      expectedOutput,
      demoWrongAnswer,
      explanation,
      executionDetails,
      isPublished = true,
    } = req.body;

    if (!title || !code || expectedOutput === undefined) {
      return res.status(400).json({ ok: false, error: 'Title, code snippet, and expected output are required.' });
    }

    const questions = readFile(PREDICT_FILE);
    const id = `pred-${language}-${Date.now()}`;

    const newQuestion = {
      id,
      language: language?.toLowerCase() || 'python',
      title: title.trim(),
      concept: concept?.trim() || 'General Concept',
      difficulty,
      tags: Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',').map((t) => t.trim()) : [],
      code: code.trim(),
      expectedOutput: String(expectedOutput).trim(),
      demoWrongAnswer: demoWrongAnswer?.trim() || '',
      explanation: explanation?.trim() || '',
      executionDetails: executionDetails?.trim() || '',
      isPublished: Boolean(isPublished),
      createdAt: new Date().toISOString(),
      author: req.user.name,
    };

    questions.push(newQuestion);
    writeFile(PREDICT_FILE, questions);

    res.status(201).json({
      ok: true,
      message: 'Predict Output question created successfully.',
      question: newQuestion,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to create predict question.' });
  }
});

// PUT /api/teacher/predict-output/:id
teacherRouter.put('/predict-output/:id', (req, res) => {
  try {
    const questions = readFile(PREDICT_FILE);
    const idx = questions.findIndex((q) => q.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ ok: false, error: 'Predict question not found.' });
    }

    const updated = {
      ...questions[idx],
      ...req.body,
      id: questions[idx].id,
      updatedAt: new Date().toISOString(),
    };

    questions[idx] = updated;
    writeFile(PREDICT_FILE, questions);

    res.json({
      ok: true,
      message: 'Predict question updated successfully.',
      question: updated,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Failed to update predict question.' });
  }
});

// DELETE /api/teacher/predict-output/:id
teacherRouter.delete('/predict-output/:id', (req, res) => {
  const questions = readFile(PREDICT_FILE);
  const idx = questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ ok: false, error: 'Predict question not found.' });
  }

  const deleted = questions.splice(idx, 1)[0];
  writeFile(PREDICT_FILE, questions);

  res.json({
    ok: true,
    message: `Predict question "${deleted.title}" deleted successfully.`,
  });
});

// PATCH /api/teacher/predict-output/:id/publish
teacherRouter.patch('/predict-output/:id/publish', (req, res) => {
  const questions = readFile(PREDICT_FILE);
  const q = questions.find((item) => item.id === req.params.id);
  if (!q) {
    return res.status(404).json({ ok: false, error: 'Predict question not found.' });
  }

  q.isPublished = !q.isPublished;
  writeFile(PREDICT_FILE, questions);

  res.json({
    ok: true,
    isPublished: q.isPublished,
    message: q.isPublished ? 'Question published.' : 'Question unpublished.',
  });
});

// GET /api/teacher/submissions
teacherRouter.get('/submissions', (req, res) => {
  const { problemId, studentId, status, language } = req.query;
  let submissions = readFile(SUBMISSIONS_FILE);

  if (problemId && problemId !== 'All') {
    submissions = submissions.filter((s) => s.problemId === problemId);
  }
  if (studentId && studentId !== 'All') {
    submissions = submissions.filter((s) => s.userId === studentId);
  }
  if (status && status !== 'All') {
    submissions = submissions.filter((s) => s.status.toLowerCase() === status.toLowerCase());
  }
  if (language && language !== 'All') {
    submissions = submissions.filter((s) => s.language.toLowerCase() === language.toLowerCase());
  }

  res.json({
    ok: true,
    total: submissions.length,
    submissions: [...submissions].reverse(),
  });
});

// GET /api/teacher/analytics
teacherRouter.get('/analytics', (req, res) => {
  const students = readFile(PROFILES_FILE);
  const problems = readFile(PROBLEMS_FILE);
  const submissions = readFile(SUBMISSIONS_FILE);

  // Concept distribution
  const topicStats = {};
  problems.forEach((p) => {
    (p.topics || []).forEach((t) => {
      if (!topicStats[t]) topicStats[t] = { topic: t, count: 0, solved: 0 };
      topicStats[t].count++;
    });
  });

  // Calculate student average accuracy
  const totalAcc = students.reduce((sum, s) => sum + (s.accuracy || 0), 0);
  const avgAccuracy = students.length > 0 ? Math.round(totalAcc / students.length) : 0;

  res.json({
    ok: true,
    analytics: {
      avgAccuracy,
      totalStudents: students.length,
      topicStats: Object.values(topicStats),
      totalSubmissions: submissions.length,
    },
  });
});
