import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSessionToken, verifyAuth, sessions } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.join(__dirname, '../data/users.json');
const PROFILES_FILE = path.join(__dirname, '../data/studentProfiles.json');

function getUsers() {
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function getProfiles() {
  try {
    return JSON.parse(fs.readFileSync(PROFILES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function saveProfiles(profiles) {
  fs.writeFileSync(PROFILES_FILE, JSON.stringify(profiles, null, 2), 'utf-8');
}

export const authRouter = Router();

// POST /api/auth/register (Student Registration Only)
authRouter.post('/register', (req, res) => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      mobile,
      college,
      course,
      branch,
      yearSemester,
      skills,
    } = req.body;

    // 1. Required field validations
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ ok: false, error: 'Full name is required.' });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ ok: false, error: 'Email address is required.' });
    }
    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid email address.' });
    }
    if (!password) {
      return res.status(400).json({ ok: false, error: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters long.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ ok: false, error: 'Passwords do not match.' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ ok: false, error: 'Mobile number is required.' });
    }
    if (!college || !college.trim()) {
      return res.status(400).json({ ok: false, error: 'College / Institute name is required.' });
    }
    if (!course || !course.trim()) {
      return res.status(400).json({ ok: false, error: 'Course / Degree is required.' });
    }
    if (!branch || !branch.trim()) {
      return res.status(400).json({ ok: false, error: 'Branch is required.' });
    }
    if (!yearSemester || !yearSemester.trim()) {
      return res.status(400).json({ ok: false, error: 'Year / Semester is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();

    // 2. Duplicate email check
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({
        ok: false,
        error: 'An account with this email address already exists. Please login instead.',
      });
    }

    // 3. Create new student user
    const newUserId = 'usr_student_' + Date.now();
    const newUser = {
      id: newUserId,
      name: fullName.trim(),
      email: cleanEmail,
      password: password, // In production this would be bcrypt hash
      role: 'student',
      createdAt: new Date().toISOString(),
    };

    // 4. Create student profile
    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [];

    const newProfile = {
      userId: newUserId,
      fullName: fullName.trim(),
      email: cleanEmail,
      mobile: mobile.trim(),
      college: college.trim(),
      course: course.trim(),
      branch: branch.trim(),
      yearSemester: yearSemester.trim(),
      skills: parsedSkills,
      problemsAttempted: 0,
      problemsSolved: 0,
      submissionsCount: 0,
      acceptedSubmissions: 0,
      accuracy: 0,
      languageUsage: {},
      predictOutputAttempted: 0,
      predictOutputCorrect: 0,
      predictAccuracy: 0,
      recentActivity: 'Account registered',
      lastActive: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const profiles = getProfiles();
    profiles.push(newProfile);
    saveProfiles(profiles);

    // 5. Generate session token
    const token = createSessionToken(newUser);

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({
      ok: true,
      message: 'Student account registered successfully.',
      token,
      user: safeUser,
      profile: newProfile,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Registration failed.' });
  }
});

// POST /api/auth/login (Supports both Student & Teacher)
authRouter.post('/login', (req, res) => {
  try {
    const { email, password, roleHint } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const users = getUsers();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    // Role check if user tried to login through mismatched portal
    if (roleHint && user.role !== roleHint) {
      if (roleHint === 'teacher' && user.role === 'student') {
        return res.status(403).json({
          ok: false,
          error: 'Access denied: This email belongs to a student account. Please use Student Login.',
        });
      }
      if (roleHint === 'student' && user.role === 'teacher') {
        return res.status(403).json({
          ok: false,
          error: 'This is a Teacher account. Please use the Teacher Login portal.',
        });
      }
    }

    if (user.password !== password) {
      return res.status(401).json({ ok: false, error: 'Invalid email or password.' });
    }

    // Load profile if student
    let profile = null;
    if (user.role === 'student') {
      const profiles = getProfiles();
      profile = profiles.find((p) => p.userId === user.id || p.email.toLowerCase() === cleanEmail) || null;
    }

    const token = createSessionToken(user);
    const { password: _, ...safeUser } = user;

    res.json({
      ok: true,
      message: 'Login successful.',
      token,
      user: safeUser,
      profile,
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message || 'Login failed.' });
  }
});

// GET /api/auth/me (Returns logged-in profile)
authRouter.get('/me', verifyAuth, (req, res) => {
  const users = getUsers();
  const user = users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ ok: false, error: 'User not found' });
  }

  let profile = null;
  if (user.role === 'student') {
    const profiles = getProfiles();
    profile = profiles.find((p) => p.userId === user.id) || null;
  }

  const { password: _, ...safeUser } = user;
  res.json({
    ok: true,
    user: safeUser,
    profile,
  });
});

// POST /api/auth/logout
authRouter.post('/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    sessions.delete(token);
  }
  res.json({ ok: true, message: 'Logged out successfully.' });
});
