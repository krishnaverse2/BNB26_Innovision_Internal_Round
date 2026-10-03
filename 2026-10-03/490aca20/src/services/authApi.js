// Authentication API Client

const BASE_URL = '/api/auth';

export async function login({ email, password, roleHint }) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, roleHint }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed.');
  }
  return data;
}

export async function registerStudent(formData) {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed.');
  }
  return data;
}

export async function getMe(token) {
  const res = await fetch(`${BASE_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data;
}

export async function logout(token) {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    // ignore
  }
}
