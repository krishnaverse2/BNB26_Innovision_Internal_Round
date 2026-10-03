// Course API Client — Connects to backend courses & personalized learning engine

const BASE_URL = '/api/courses';

function getHeaders() {
  const token = localStorage.getItem('relearn_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// 1. Get all courses
export async function getCourses() {
  const res = await fetch(BASE_URL, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load courses.');
  const data = await res.json();
  return data.courses;
}

// 2. Get course details and roadmap
export async function getCourseDetail(courseId) {
  const res = await fetch(`${BASE_URL}/${courseId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load course details.');
  const data = await res.json();
  return data.course;
}

// 3. Get single step (module) content
export async function getCourseStep(courseId, stepOrder) {
  const res = await fetch(`${BASE_URL}/${courseId}/step/${stepOrder}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load learning step.');
  const data = await res.json();
  return data.step;
}

// 4. Record question attempt
export async function submitQuestionAttempt(courseId, payload) {
  const res = await fetch(`${BASE_URL}/${courseId}/practice/attempt`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to record attempt.');
  return await res.json();
}

// 5. Complete a step & unlock next
export async function completeCourseStep(courseId, moduleId) {
  const res = await fetch(`${BASE_URL}/${courseId}/complete-step`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ moduleId }),
  });
  if (!res.ok) throw new Error('Failed to complete step.');
  return await res.json();
}

// 6. Get final assessment questions
export async function getCourseAssessment(courseId) {
  const res = await fetch(`${BASE_URL}/${courseId}/assessment`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load final assessment.');
  const data = await res.json();
  return data.assessment;
}

// 7. Submit final assessment & trigger AI/ML analysis
export async function submitCourseAssessment(courseId, payload) {
  const res = await fetch(`${BASE_URL}/${courseId}/assessment/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit assessment.');
  return await res.json();
}

// 8. Generate personalized AI video lesson
export async function triggerAiVideoGeneration(payload) {
  const res = await fetch(`${BASE_URL}/analysis/generate-video`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to start video generation.');
  return await res.json();
}

// 9. Check video generation status
export async function checkAiVideoStatus(jobId) {
  const res = await fetch(`${BASE_URL}/analysis/video-status/${jobId}`);
  if (!res.ok) throw new Error('Failed to check video status.');
  return await res.json();
}

// 10. Get generated lesson details
export async function getAiLesson(lessonId) {
  const res = await fetch(`${BASE_URL}/lesson/${lessonId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load personalized lesson.');
  const data = await res.json();
  return data.lesson;
}

// 11. Get targeted practice questions
export async function getTargetedPractice(gapId) {
  const res = await fetch(`${BASE_URL}/practice-again/${gapId}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load practice questions.');
  return await res.json();
}

// 12. Submit targeted practice & re-evaluate
export async function submitTargetedPractice(payload) {
  const res = await fetch(`${BASE_URL}/practice-again/submit`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to submit re-evaluation.');
  return await res.json();
}
