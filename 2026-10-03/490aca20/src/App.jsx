import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
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
import TeacherAnalytics from './pages/TeacherAnalytics'
import Settings from './pages/Settings'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="coding-lab" element={<CodingLab />} />
        <Route path="diagnosis" element={<Diagnosis />} />
        <Route path="diagnostic-test" element={<DiagnosticTest />} />
        <Route path="intervention" element={<Intervention />} />
        <Route path="stress-test" element={<StressTest />} />
        <Route path="resolution" element={<Resolution />} />
        <Route path="misconceptions" element={<Misconceptions />} />
        <Route path="interventions" element={<InterventionLibrary />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="timeline" element={<Timeline />} />
        <Route path="teacher" element={<TeacherAnalytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}
