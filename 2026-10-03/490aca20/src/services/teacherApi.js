// Teacher API Client

const BASE_URL = '/api/teacher';

function getHeaders() {
  const token = localStorage.getItem('relearn_token');
  return {
    'Content-Type': 'application/json',
    Authorization: token ? `Bearer ${token}` : '',
  };
}

export async function getTeacherOverview() {
  const res = await fetch(`${BASE_URL}/overview`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load teacher overview.');
  const data = await res.json();
  return data.overview;
}

export async function getTeacherStudents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/students?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load students.');
  const data = await res.json();
  return data.students;
}

export async function getTeacherStudentById(id) {
  const res = await fetch(`${BASE_URL}/students/${id}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load student details.');
  return await res.json();
}

export async function getTeacherProblems() {
  const res = await fetch(`${BASE_URL}/problems`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load questions.');
  const data = await res.json();
  return data.problems;
}

export async function createTeacherProblem(problemData) {
  const res = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(problemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create problem.');
  return data;
}

export async function updateTeacherProblem(id, problemData) {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(problemData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update problem.');
  return data;
}

export async function deleteTeacherProblem(id) {
  const res = await fetch(`${BASE_URL}/problems/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete problem.');
  return data;
}

export async function togglePublishProblem(id) {
  const res = await fetch(`${BASE_URL}/problems/${id}/publish`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle publish status.');
  return data;
}

export async function duplicateTeacherProblem(id) {
  const res = await fetch(`${BASE_URL}/problems/${id}/duplicate`, {
    method: 'POST',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to duplicate problem.');
  return data;
}

export async function getTeacherPredictQuestions() {
  const res = await fetch(`${BASE_URL}/predict-output`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load predict questions.');
  const data = await res.json();
  return data.questions;
}

export async function createTeacherPredictQuestion(questionData) {
  const res = await fetch(`${BASE_URL}/predict-output`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(questionData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create predict question.');
  return data;
}

export async function updateTeacherPredictQuestion(id, questionData) {
  const res = await fetch(`${BASE_URL}/predict-output/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(questionData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update predict question.');
  return data;
}

export async function deleteTeacherPredictQuestion(id) {
  const res = await fetch(`${BASE_URL}/predict-output/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to delete question.');
  return data;
}

export async function togglePublishPredictQuestion(id) {
  const res = await fetch(`${BASE_URL}/predict-output/${id}/publish`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to toggle publish status.');
  return data;
}

export async function getTeacherSubmissions(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/submissions?${query}`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load submissions.');
  const data = await res.json();
  return data.submissions;
}

export async function getTeacherAnalytics() {
  const res = await fetch(`${BASE_URL}/analytics`, { headers: getHeaders() });
  if (!res.ok) throw new Error('Failed to load analytics.');
  const data = await res.json();
  return data.analytics;
}
