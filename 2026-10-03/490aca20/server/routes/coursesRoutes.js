import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { optionalAuth, verifyAuth } from '../middleware/authMiddleware.js';
import {
  analyzeTestPerformance,
  generatePersonalizedLessonScript,
  generateTargetedPracticeQuestions,
  evaluateReAssessment,
} from '../services/aiVideoService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COURSES_FILE = path.join(__dirname, '../data/courses.json');
const PROGRESS_FILE = path.join(__dirname, '../data/studentProgress.json');

function readJson(p, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeJson(p, data) {
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

export const coursesRouter = Router();

// In-memory async video generation job store: jobId -> { status, progress, lessonId, result }
const videoJobs = new Map();

// Helper to get or init student course record
function getStudentCourseData(studentId, courseId) {
  const allProgress = readJson(PROGRESS_FILE, {});
  const userProgress = allProgress[studentId] || { studentId, courses: {} };
  if (!userProgress.courses) userProgress.courses = {};
  
  if (!userProgress.courses[courseId]) {
    userProgress.courses[courseId] = {
      courseId,
      enrolled: true,
      progress: 0,
      practiceAccuracy: 0,
      completedQuestions: 0,
      totalQuestions: 0,
      currentModuleId: 'mod-01',
      completedModuleIds: [],
      unlockedModuleIds: ['mod-01'],
      topicMastery: [],
      questionAttempts: [],
      testResults: [],
      learningGaps: [],
      aiLessons: [],
      reEvaluations: [],
    };
    allProgress[studentId] = userProgress;
    writeJson(PROGRESS_FILE, allProgress);
  }

  return { allProgress, studentCourse: userProgress.courses[courseId], userProgress };
}

// 1. GET /api/courses — List all available courses with student progress
coursesRouter.get('/', optionalAuth, (req, res) => {
  const courses = readJson(COURSES_FILE, []);
  const studentId = req.user?.id || 'stu_alex123';
  const allProgress = readJson(PROGRESS_FILE, {});
  const studentData = allProgress[studentId]?.courses || {};

  const merged = courses.map((course) => {
    const p = studentData[course.id];
    if (p) {
      return {
        ...course,
        progress: p.progress !== undefined ? p.progress : course.progress,
        currentTopic: p.currentTopic || course.currentTopic,
        currentModuleId: p.currentModuleId || course.currentModuleId,
        enrolled: true,
      };
    }
    return course;
  });

  res.json({ ok: true, courses: merged });
});

// 2. GET /api/courses/:courseId — Course Detail with modules roadmap & progress
coursesRouter.get('/:courseId', optionalAuth, (req, res) => {
  const { courseId } = req.params;
  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);

  if (!course) {
    return res.status(404).json({ ok: false, error: 'Course not found' });
  }

  const studentId = req.user?.id || 'stu_alex123';
  const { studentCourse } = getStudentCourseData(studentId, course.id);

  // Map module statuses: completed, current, available, locked
  const unlocked = new Set(studentCourse.unlockedModuleIds || ['mod-01']);
  const completed = new Set(studentCourse.completedModuleIds || []);

  const modulesWithStatus = (course.modules || []).map((m, idx) => {
    let status = 'locked';
    if (completed.has(m.id)) {
      status = 'completed';
    } else if (m.id === studentCourse.currentModuleId || (unlocked.has(m.id) && !completed.has(m.id))) {
      status = 'current';
    } else if (unlocked.has(m.id)) {
      status = 'available';
    }
    return {
      ...m,
      status,
    };
  });

  // Calculate live progress %
  const totalMod = course.modules?.length || 1;
  const compMod = completed.size;
  const liveProgress = Math.round((compMod / totalMod) * 100);

  res.json({
    ok: true,
    course: {
      ...course,
      progress: Math.max(liveProgress, studentCourse.progress || 0),
      currentModuleId: studentCourse.currentModuleId,
      completedModulesCount: compMod,
      totalModulesCount: totalMod,
      practiceAccuracy: studentCourse.practiceAccuracy || 82,
      topicMastery: studentCourse.topicMastery?.length ? studentCourse.topicMastery : course.topicMastery,
      modules: modulesWithStatus,
    },
  });
});

// 3. GET /api/courses/:courseId/step/:stepOrder — Single Step Page (Concept, Example, Visual, Practice)
coursesRouter.get('/:courseId/step/:stepOrder', optionalAuth, (req, res) => {
  const { courseId, stepOrder } = req.params;
  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);

  if (!course) {
    return res.status(404).json({ ok: false, error: 'Course not found' });
  }

  const orderNum = parseInt(stepOrder, 10) || 1;
  const moduleIndex = course.modules?.findIndex((m) => m.order === orderNum || m.id === stepOrder);

  if (moduleIndex === -1 || moduleIndex === undefined) {
    return res.status(404).json({ ok: false, error: 'Module step not found' });
  }

  const currentMod = course.modules[moduleIndex];
  const prevMod = moduleIndex > 0 ? course.modules[moduleIndex - 1] : null;
  const nextMod = moduleIndex < course.modules.length - 1 ? course.modules[moduleIndex + 1] : null;

  const studentId = req.user?.id || 'stu_alex123';
  const { studentCourse } = getStudentCourseData(studentId, course.id);

  const isCompleted = studentCourse.completedModuleIds?.includes(currentMod.id);
  const isUnlocked = studentCourse.unlockedModuleIds?.includes(currentMod.id) || orderNum === 1;

  res.json({
    ok: true,
    step: {
      ...currentMod,
      isCompleted,
      isUnlocked,
      totalModules: course.modules.length,
      currentStepIndex: orderNum,
      prevStepOrder: prevMod ? prevMod.order : null,
      nextStepOrder: nextMod ? nextMod.order : null,
    },
  });
});

// 4. POST /api/courses/:courseId/practice/attempt — Record individual practice question attempt
coursesRouter.post('/:courseId/practice/attempt', optionalAuth, (req, res) => {
  const { courseId } = req.params;
  const { moduleId, questionId, studentAnswer, correctAnswer, timeSpentSec = 30 } = req.body;

  const studentId = req.user?.id || 'stu_alex123';
  const { allProgress, studentCourse } = getStudentCourseData(studentId, courseId);

  const isCorrect = String(studentAnswer).trim() === String(correctAnswer).trim();

  // Find question metadata from course
  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  const currentMod = course?.modules?.find((m) => m.id === moduleId);
  const questionMeta = currentMod?.practiceQuestions?.find((q) => q.questionId === questionId);

  const attempt = {
    studentId,
    courseId,
    moduleId: moduleId || currentMod?.id || 'mod-unknown',
    topicId: questionMeta?.topic || currentMod?.topic || 'Topic',
    concept: questionMeta?.concept || currentMod?.concept || 'Concept',
    questionId,
    studentAnswer,
    correctAnswer,
    isCorrect,
    attemptNumber: (studentCourse.questionAttempts?.filter((a) => a.questionId === questionId).length || 0) + 1,
    timeSpentSec,
    difficulty: questionMeta?.difficulty || 'Medium',
    timestamp: new Date().toISOString(),
  };

  if (!studentCourse.questionAttempts) studentCourse.questionAttempts = [];
  studentCourse.questionAttempts.push(attempt);

  // Update total questions and accuracy
  studentCourse.completedQuestions = (studentCourse.completedQuestions || 0) + 1;
  const totalCorrect = studentCourse.questionAttempts.filter((a) => a.isCorrect).length;
  studentCourse.practiceAccuracy = Math.round((totalCorrect / studentCourse.questionAttempts.length) * 100);

  writeJson(PROGRESS_FILE, allProgress);

  res.json({
    ok: true,
    isCorrect,
    explanation: questionMeta?.explanation || 'Answer recorded.',
    attempt,
    currentAccuracy: studentCourse.practiceAccuracy,
  });
});

// 5. POST /api/courses/:courseId/complete-step — Complete step & unlock next
coursesRouter.post('/:courseId/complete-step', optionalAuth, (req, res) => {
  const { courseId } = req.params;
  const { moduleId } = req.body;

  const studentId = req.user?.id || 'stu_alex123';
  const { allProgress, studentCourse } = getStudentCourseData(studentId, courseId);

  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  if (!course) return res.status(404).json({ ok: false, error: 'Course not found' });

  const currentModIndex = course.modules.findIndex((m) => m.id === moduleId);
  if (currentModIndex === -1) return res.status(404).json({ ok: false, error: 'Module not found' });

  // Add to completed
  if (!studentCourse.completedModuleIds) studentCourse.completedModuleIds = [];
  if (!studentCourse.completedModuleIds.includes(moduleId)) {
    studentCourse.completedModuleIds.push(moduleId);
  }

  // Unlock next step
  const nextMod = course.modules[currentModIndex + 1];
  if (nextMod) {
    if (!studentCourse.unlockedModuleIds) studentCourse.unlockedModuleIds = [];
    if (!studentCourse.unlockedModuleIds.includes(nextMod.id)) {
      studentCourse.unlockedModuleIds.push(nextMod.id);
    }
    studentCourse.currentModuleId = nextMod.id;
  }

  // Update overall progress percentage
  const totalModules = course.modules.length;
  const completedCount = studentCourse.completedModuleIds.length;
  studentCourse.progress = Math.min(100, Math.round((completedCount / totalModules) * 100));

  writeJson(PROGRESS_FILE, allProgress);

  res.json({
    ok: true,
    message: `Step ${course.modules[currentModIndex].title} marked completed!`,
    progress: studentCourse.progress,
    unlockedNextModuleId: nextMod ? nextMod.id : null,
    nextStepOrder: nextMod ? nextMod.order : null,
    isFinalAssessmentReady: completedCount >= totalModules,
  });
});

// 6. GET /api/courses/:courseId/assessment — Get Final Assessment questions
coursesRouter.get('/:courseId/assessment', optionalAuth, (req, res) => {
  const { courseId } = req.params;
  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);

  if (!course || !course.finalAssessment) {
    return res.status(404).json({ ok: false, error: 'Final assessment not found for this course' });
  }

  // Return assessment with sanitized questions (without exposing correctAnswer)
  const assessment = course.finalAssessment;
  const clientQuestions = assessment.questions.map((q) => {
    const { correctAnswer: _, ...safeQ } = q;
    return safeQ;
  });

  res.json({
    ok: true,
    assessment: {
      ...assessment,
      questions: clientQuestions,
    },
  });
});

// 7. POST /api/courses/:courseId/assessment/submit — Submit Final Test & Run AI/ML Analysis
coursesRouter.post('/:courseId/assessment/submit', optionalAuth, (req, res) => {
  const { courseId } = req.params;
  const { answers, timeTakenSec = 180 } = req.body;

  const courses = readJson(COURSES_FILE, []);
  const course = courses.find((c) => c.id === courseId || c.slug === courseId);
  if (!course || !course.finalAssessment) {
    return res.status(404).json({ ok: false, error: 'Assessment not found' });
  }

  const studentId = req.user?.id || 'stu_alex123';
  const studentName = req.user?.name || 'Alex Rivera';

  // Run AI/ML Learning Analysis
  const analysis = analyzeTestPerformance(
    { answers, timeTakenSec },
    course.finalAssessment.questions
  );

  const assessmentId = 'test-' + crypto.randomUUID().slice(0, 8);
  const resultRecord = {
    assessmentId,
    courseId,
    courseTitle: course.title,
    studentId,
    studentName,
    ...analysis,
    timestamp: new Date().toISOString(),
  };

  // Save in student progress
  const { allProgress, studentCourse } = getStudentCourseData(studentId, courseId);
  if (!studentCourse.testResults) studentCourse.testResults = [];
  studentCourse.testResults.push(resultRecord);

  if (analysis.learningGaps?.length) {
    if (!studentCourse.learningGaps) studentCourse.learningGaps = [];
    studentCourse.learningGaps.push(...analysis.learningGaps);
  }

  writeJson(PROGRESS_FILE, allProgress);

  res.json({
    ok: true,
    assessmentId,
    result: resultRecord,
  });
});

// 8. POST /api/courses/analysis/generate-video — Initiate Personalized AI Video Generation
coursesRouter.post('/analysis/generate-video', optionalAuth, (req, res) => {
  const { assessmentId, courseId, learningGap } = req.body;

  if (!learningGap) {
    return res.status(400).json({ ok: false, error: 'Learning gap definition is required' });
  }

  const studentName = req.user?.name || 'Alex Rivera';
  const studentId = req.user?.id || 'stu_alex123';

  // Generate 10-Scene Lesson Script
  const lessonScript = generatePersonalizedLessonScript(studentName, 'Data Structures & Algorithms', learningGap);

  const jobId = 'job-' + crypto.randomUUID().slice(0, 8);
  const startTime = Date.now();

  // Initialize job in memory
  videoJobs.set(jobId, {
    jobId,
    status: 'analyzing',
    stepIndex: 1,
    lessonScript,
    startTime,
  });

  // Save lesson in student profile
  const { allProgress, studentCourse } = getStudentCourseData(studentId, courseId || 'dsa');
  if (!studentCourse.aiLessons) studentCourse.aiLessons = [];
  studentCourse.aiLessons.push(lessonScript);
  writeJson(PROGRESS_FILE, allProgress);

  res.json({
    ok: true,
    jobId,
    lessonId: lessonScript.lessonId,
    lessonScript,
  });
});

// 9. GET /api/courses/analysis/video-status/:jobId — Check AI Video generation progress
coursesRouter.get('/analysis/video-status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = videoJobs.get(jobId);

  if (!job) {
    return res.status(404).json({ ok: false, error: 'Generation job not found' });
  }

  const elapsed = (Date.now() - job.startTime) / 1000;

  // Stages progression simulation for real-time progress UX
  let stage = 'analyzing';
  let message = 'Analyzing your test answers...';
  let progressPct = 20;

  if (elapsed >= 1.5 && elapsed < 3.0) {
    stage = 'detecting_gaps';
    message = 'Finding your learning gaps and root misconception...';
    progressPct = 40;
  } else if (elapsed >= 3.0 && elapsed < 4.5) {
    stage = 'understanding_mistakes';
    message = 'Understanding your mistake patterns and pointer confusion...';
    progressPct = 60;
  } else if (elapsed >= 4.5 && elapsed < 6.0) {
    stage = 'generating_script';
    message = 'Creating your 10-scene personalized lesson script...';
    progressPct = 80;
  } else if (elapsed >= 6.0) {
    stage = 'ready';
    message = 'Your personalized lesson is ready to watch!';
    progressPct = 100;
  }

  res.json({
    ok: true,
    jobId,
    stage,
    message,
    progressPct,
    isComplete: stage === 'ready',
    lessonScript: job.lessonScript,
  });
});

// 10. GET /api/courses/lesson/:lessonId — Get personalized AI lesson details
coursesRouter.get('/lesson/:lessonId', optionalAuth, (req, res) => {
  const { lessonId } = req.params;
  const studentId = req.user?.id || 'stu_alex123';
  const allProgress = readJson(PROGRESS_FILE, {});
  const studentData = allProgress[studentId]?.courses?.dsa || {};

  const lesson = studentData.aiLessons?.find((l) => l.lessonId === lessonId);
  if (!lesson) {
    // Return sample/default lesson
    const defaultLesson = generatePersonalizedLessonScript('Alex Rivera', 'Data Structures & Algorithms', {
      topic: 'Binary Search',
      concept: 'Pointer Movement',
      mistakes: [
        { questionId: 'FINAL-DSA-001', studentAnswer: 'low = mid', correctAnswer: 'low = mid + 1' },
      ],
    });
    return res.json({ ok: true, lesson: defaultLesson });
  }

  res.json({ ok: true, lesson });
});

// 11. GET /api/courses/practice-again/:gapId — Fresh targeted practice questions
coursesRouter.get('/practice-again/:gapId', optionalAuth, (req, res) => {
  const { gapId } = req.params;
  const questions = generateTargetedPracticeQuestions({
    gapId,
    topic: 'Binary Search',
    concept: 'Pointer Movement',
  });

  res.json({
    ok: true,
    gapId,
    topic: 'Binary Search',
    concept: 'Pointer Movement',
    questions,
  });
});

// 12. POST /api/courses/practice-again/submit — Evaluate re-assessment & measure improvement
coursesRouter.post('/practice-again/submit', optionalAuth, (req, res) => {
  const { gapId, answers, previousAccuracy = 40 } = req.body;

  const questions = generateTargetedPracticeQuestions({
    gapId,
    topic: 'Binary Search',
    concept: 'Pointer Movement',
  });

  const evaluation = evaluateReAssessment(previousAccuracy, answers, questions);

  const studentId = req.user?.id || 'stu_alex123';
  const { allProgress, studentCourse } = getStudentCourseData(studentId, 'dsa');
  if (!studentCourse.reEvaluations) studentCourse.reEvaluations = [];
  studentCourse.reEvaluations.push({
    gapId,
    ...evaluation,
    timestamp: new Date().toISOString(),
  });

  // Update topic mastery
  const searchingTopic = studentCourse.topicMastery?.find((t) => t.topic === 'Searching');
  if (searchingTopic) {
    searchingTopic.mastery = evaluation.newAccuracy;
    searchingTopic.status = evaluation.newAccuracy >= 80 ? 'Strong' : 'Moderate';
  }

  writeJson(PROGRESS_FILE, allProgress);

  res.json({
    ok: true,
    evaluation,
  });
});

// 13. GET /api/courses/teacher/telemetry — Telemetry metrics for Teacher Dashboard
coursesRouter.get('/teacher/telemetry', (req, res) => {
  const allProgress = readJson(PROGRESS_FILE, {});
  const students = Object.values(allProgress);

  const totalEnrolled = students.length;
  let totalAiLessons = 0;
  let totalGaps = 0;
  const weakTopics = {};

  students.forEach((s) => {
    Object.values(s.courses || {}).forEach((c) => {
      totalAiLessons += c.aiLessons?.length || 0;
      totalGaps += c.learningGaps?.length || 0;
      (c.topicMastery || []).forEach((tm) => {
        if (tm.mastery < 60) {
          weakTopics[tm.topic] = (weakTopics[tm.topic] || 0) + 1;
        }
      });
    });
  });

  res.json({
    ok: true,
    telemetry: {
      totalEnrolled,
      totalAiLessons,
      totalGaps,
      weakTopics,
    },
  });
});
