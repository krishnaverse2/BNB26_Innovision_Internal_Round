import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Active in-memory token session store: token -> userObj
export const sessions = new Map();

// Helper to load users fresh
export function loadUsers() {
  try {
    const raw = fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Generate simple secure session token
export function createSessionToken(user) {
  const token = 'tok_' + Buffer.from(`${user.id}:${user.role}:${Date.now()}:${Math.random().toString(36).slice(2)}`).toString('base64url');
  sessions.set(token, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: Date.now(),
  });
  return token;
}

export function verifyAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, error: 'Unauthorized: Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const session = sessions.get(token);

  if (!session) {
    // Check if it's a valid encoded token matching a known user
    try {
      const decoded = Buffer.from(token.replace('tok_', ''), 'base64url').toString('utf-8');
      const [userId, role] = decoded.split(':');
      const users = loadUsers();
      const user = users.find(u => u.id === userId && u.role === role);
      if (user) {
        req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
        sessions.set(token, req.user);
        return next();
      }
    } catch {
      // invalid token
    }
    return res.status(401).json({ ok: false, error: 'Invalid or expired session token' });
  }

  req.user = session;
  next();
}

export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = sessions.get(token);
    if (session) {
      req.user = session;
    } else {
      try {
        const decoded = Buffer.from(token.replace('tok_', ''), 'base64url').toString('utf-8');
        const [userId, role] = decoded.split(':');
        const users = loadUsers();
        const user = users.find(u => u.id === userId && u.role === role);
        if (user) req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
      } catch {
        // ignore
      }
    }
  }
  next();
}

export function requireTeacher(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({
      ok: false,
      error: 'Forbidden: Access denied. Teacher privileges required.',
    });
  }
  next();
}

export function requireStudent(req, res, next) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({
      ok: false,
      error: 'Forbidden: Access denied. Student privileges required.',
    });
  }
  next();
}
