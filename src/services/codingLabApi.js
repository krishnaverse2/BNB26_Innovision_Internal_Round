// Coding Lab API Client

const BASE_URL = '/api/coding-lab';

export async function getLanguages() {
  try {
    const res = await fetch(`${BASE_URL}/languages`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.languages || [];
  } catch (err) {
    console.warn('API error, using local fallback:', err);
    return [];
  }
}

export async function getProblems({ difficulty, tag, search } = {}) {
  try {
    const params = new URLSearchParams();
    if (difficulty && difficulty !== 'All') params.append('difficulty', difficulty);
    if (tag && tag !== 'All') params.append('tag', tag);
    if (search) params.append('search', search);

    const res = await fetch(`${BASE_URL}/problems?${params.toString()}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.problems || [];
  } catch (err) {
    console.warn('API error fetching problems:', err);
    return [];
  }
}

export async function getProblemById(id) {
  try {
    const res = await fetch(`${BASE_URL}/problems/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.problem || null;
  } catch (err) {
    console.warn('API error fetching problem:', err);
    return null;
  }
}

export async function runCode({ problemId, language, code, customInput }) {
  const res = await fetch(`${BASE_URL}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, language, code, customInput }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Run failed with status ${res.status}`);
  }
  return await res.json();
}

export async function submitCode({ problemId, language, code }) {
  const res = await fetch(`${BASE_URL}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problemId, language, code }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Submit failed with status ${res.status}`);
  }
  return await res.json();
}

export async function getPredictQuestions(language) {
  try {
    const url = language && language !== 'all'
      ? `${BASE_URL}/predict-output?language=${encodeURIComponent(language)}`
      : `${BASE_URL}/predict-output`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.questions || [];
  } catch (err) {
    console.warn('API error fetching predict questions:', err);
    return [];
  }
}

export async function getPredictQuestionById(id) {
  try {
    const res = await fetch(`${BASE_URL}/predict-output/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    return data.question || null;
  } catch (err) {
    console.warn('API error fetching predict question:', err);
    return null;
  }
}

export async function evaluatePrediction({ questionId, answer }) {
  const res = await fetch(`${BASE_URL}/predict-output/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, answer }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Evaluation failed with status ${res.status}`);
  }
  return await res.json();
}
