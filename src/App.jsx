import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import CourseLearn from './pages/CourseLearn'
import CourseAssessment from './pages/CourseAssessment'
import CourseTestResult from './pages/CourseTestResult'
import PersonalizedVideoLesson from './pages/PersonalizedVideoLesson'
import CoursePracticeAgain from './pages/CoursePracticeAgain'
import CodingLab from './pages/CodingLab'
import Diagnosis from './pages/Diagnosis'
import DiagnosticTest from './pages/DiagnosticTest'
import Intervention from './pages/Intervention'
import StressTest from './pages/StressTest'
import Resolution from './pages/Resolution'
import Misconceptions from './pages/Misconceptions'
import InterventionLibrary from './pages/InterventionLibrary'
import Assessments from './pages/Assessments'
import Timeline from './pages/Timeline'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import AuthPage from './pages/Auth/AuthPage'
import TeacherDashboard from './pages/Teacher/TeacherDashboard'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>
      {/* When project is opened at root (/), the login page opens first */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<AuthPage />} />
      <Route path="/register" element={<AuthPage />} />

      {/* Protected Teacher Portal Route */}
      <Route
        path="/teacher-dashboard/*"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Student Portal Routes */}
      <Route
        element={
          <ProtectedRoute role="student">
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
        <Route path="/courses/:courseId/learn" element={<CourseLearn />} />
        <Route path="/courses/:courseId/practice" element={<CourseLearn />} />
        <Route path="/courses/:courseId/assessment" element={<CourseAssessment />} />
        <Route path="/courses/:courseId/result/:assessmentId" element={<CourseTestResult />} />
        <Route path="/courses/:courseId/video/:lessonId" element={<PersonalizedVideoLesson />} />
        <Route path="/courses/:courseId/practice-again/:gapId" element={<CoursePracticeAgain />} />
        <Route path="/coding-lab" element={<CodingLab />} />
        <Route path="/diagnosis" element={<Diagnosis />} />
        <Route path="/diagnostic-test" element={<DiagnosticTest />} />
        <Route path="/intervention" element={<Intervention />} />
        <Route path="/stress-test" element={<StressTest />} />
        <Route path="/resolution" element={<Resolution />} />
        <Route path="/misconceptions" element={<Misconceptions />} />
        <Route path="/interventions" element={<InterventionLibrary />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<Profile />} />

        {/* Removed Teacher Analytics from Student routes - redirect any direct access attempts */}
        <Route path="/teacher" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
