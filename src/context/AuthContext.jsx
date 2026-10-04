import { createContext, useContext, useState, useEffect } from 'react';
import { login, registerStudent, getMe, logout as apiLogout } from '../services/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'relearn_token';
const USER_KEY = 'relearn_user';
const PROFILE_KEY = 'relearn_profile';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [profile, setProfile] = useState(() => {
    try {
      const stored = localStorage.getItem(PROFILE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Verify session on initial mount if token exists
  useEffect(() => {
    async function verify() {
      if (token) {
        try {
          const res = await getMe(token);
          if (res?.ok && res.user) {
            setUser(res.user);
            setProfile(res.profile || null);
            localStorage.setItem(USER_KEY, JSON.stringify(res.user));
            if (res.profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(res.profile));
          } else {
            // invalid session
            handleClearAuth();
          }
        } catch {
          // network error, retain local session
        }
      }
      setLoading(false);
    }
    verify();
  }, [token]);

  function handleSaveAuth(newToken, newUser, newProfile) {
    setToken(newToken);
    setUser(newUser);
    setProfile(newProfile || null);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    if (newProfile) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
    } else {
      localStorage.removeItem(PROFILE_KEY);
    }
  }

  function handleClearAuth() {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PROFILE_KEY);
  }

  // Student Login
  async function handleStudentLogin({ email, password }) {
    const data = await login({ email, password, roleHint: 'student' });
    handleSaveAuth(data.token, data.user, data.profile);
    return data;
  }

  // Student Registration
  async function handleStudentRegister(formData) {
    const data = await registerStudent(formData);
    handleSaveAuth(data.token, data.user, data.profile);
    return data;
  }

  // Teacher Login
  async function handleTeacherLogin({ email, password }) {
    const data = await login({ email, password, roleHint: 'teacher' });
    handleSaveAuth(data.token, data.user, null);
    return data;
  }

  // Logout
  async function handleLogout() {
    if (token) {
      await apiLogout(token);
    }
    handleClearAuth();
  }

  const value = {
    token,
    user,
    profile,
    loading,
    isAuthenticated: Boolean(user && token),
    isTeacher: user?.role === 'teacher',
    isStudent: user?.role === 'student',
    loginStudent: handleStudentLogin,
    registerStudent: handleStudentRegister,
    loginTeacher: handleTeacherLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
