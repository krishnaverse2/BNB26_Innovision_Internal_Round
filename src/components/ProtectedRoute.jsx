import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user, isTeacher, isStudent, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            className="spin"
            style={{
              width: 32,
              height: 32,
              border: '3px solid var(--border)',
              borderTopColor: 'var(--blue-600)',
              borderRadius: '50%',
              margin: '0 auto 12px',
            }}
          />
          <div className="small muted">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Not logged in -> go to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Student trying to access teacher area -> Block and redirect
  if (role === 'teacher' && !isTeacher) {
    return (
      <div
        style={{
          display: 'flex',
          height: '80vh',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: 480,
            textAlign: 'center',
            padding: '36px 28px',
            borderRadius: 16,
            border: '1px solid #fecaca',
            background: '#fff5f5',
          }}
        >
          <ShieldAlert size={48} color="#dc2626" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ color: '#dc2626', marginBottom: 8 }}>Access Denied</h2>
          <p className="soft" style={{ fontSize: 14.5, lineHeight: 1.5, marginBottom: 20 }}>
            You do not have teacher permissions to access the Teacher Portal. This area is
            restricted to authorized educators only.
          </p>
          <a href="/dashboard" className="btn btn-primary">
            Return to Student Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Teacher trying to access student area -> redirect to teacher dashboard
  if (role === 'student' && !isStudent) {
    return <Navigate to="/teacher-dashboard" replace />;
  }

  return children;
}
