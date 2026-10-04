import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  PlusCircle,
  HelpCircle,
  Users,
  Send,
  BarChart3,
  Settings,
  LogOut,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Trash2,
  Edit,
  Copy,
  Clock,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Zap,
  TrendingUp,
  Check,
  FileCode,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Pill, Card, CodeBlock } from '../../components/ui';
import {
  getTeacherOverview,
  getTeacherStudents,
  getTeacherProblems,
  createTeacherProblem,
  updateTeacherProblem,
  deleteTeacherProblem,
  togglePublishProblem,
  duplicateTeacherProblem,
  getTeacherPredictQuestions,
  createTeacherPredictQuestion,
  updateTeacherPredictQuestion,
  deleteTeacherPredictQuestion,
  togglePublishPredictQuestion,
  getTeacherSubmissions,
} from '../../services/teacherApi';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Navigation module state:
  // 'overview' | 'problems' | 'add-problem' | 'predict-output' | 'students' | 'submissions' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState('overview');

  // Overview data
  const [overview, setOverview] = useState(null);
  const [loadingOverview, setLoadingOverview] = useState(true);

  // Problems data
  const [problems, setProblems] = useState([]);
  const [problemSearch, setProblemSearch] = useState('');
  const [problemDifficultyFilter, setProblemDifficultyFilter] = useState('All');
  const [editingProblem, setEditingProblem] = useState(null);
  const [previewingProblem, setPreviewingProblem] = useState(null);
  const [deleteProblemConfirm, setDeleteProblemConfirm] = useState(null);

  // Predict Output data
  const [predictQuestions, setPredictQuestions] = useState([]);
  const [predictLangFilter, setPredictLangFilter] = useState('all');
  const [editingPredict, setEditingPredict] = useState(null);
  const [isAddingPredict, setIsAddingPredict] = useState(false);
  const [previewingPredict, setPreviewingPredict] = useState(null);

  // Students data
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);

  // Submissions data
  const [submissions, setSubmissions] = useState([]);
  const [submissionFilterStatus, setSubmissionFilterStatus] = useState('All');
  const [viewingSubmissionCode, setViewingSubmissionCode] = useState(null);

  // Notification message
  const [notification, setNotification] = useState(null);

  function notify(msg, type = 'success') {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  }

  // Load initial overview and problems
  useEffect(() => {
    loadOverviewData();
  }, []);

  async function loadOverviewData() {
    setLoadingOverview(true);
    try {
      const [ov, probs, studs, subs, preds] = await Promise.all([
        getTeacherOverview(),
        getTeacherProblems(),
        getTeacherStudents(),
        getTeacherSubmissions(),
        getTeacherPredictQuestions(),
      ]);
      setOverview(ov);
      setProblems(probs);
      setStudents(studs);
      setSubmissions(subs);
      setPredictQuestions(preds);
    } catch (err) {
      console.error(err);
      notify('Failed to load dashboard data: ' + err.message, 'error');
    } finally {
      setLoadingOverview(false);
    }
  }

  // New problem form state
  const defaultProblemForm = {
    title: '',
    difficulty: 'Easy',
    topics: 'Array, Algorithms',
    description: '',
    inputFormat: '',
    outputFormat: '',
    constraints: '1 <= nums.length <= 10^4\n-10^9 <= target <= 10^9',
    exampleInput: 'nums = [2,7,11,15], target = 9',
    exampleOutput: '[0,1]',
    exampleExplanation: 'Because nums[0] + nums[1] == 9, return [0, 1].',
    sampleInput1: '[2,7,11,15]\n9',
    sampleOutput1: '[0,1]',
    sampleInput2: '[3,2,4]\n6',
    sampleOutput2: '[1,2]',
    hiddenInput1: '[1,2,3,4,5]\n9',
    hiddenOutput1: '[3,4]',
    pyStarter: 'class Solution:\n    def solve(self, nums: list[int], target: int):\n        # Write solution here\n        pass',
    jsStarter: '/**\n * @return {any}\n */\nfunction solve(nums, target) {\n    // Write solution here\n}',
    cppStarter: '#include <vector>\nusing namespace std;\nclass Solution {\npublic:\n    void solve() {\n        \n    }\n};',
    javaStarter: 'import java.util.*;\nclass Solution {\n    public void solve() {\n        \n    }\n}',
    isPublished: true,
  };

  const [problemForm, setProblemForm] = useState(defaultProblemForm);
  const [activeStarterTab, setActiveStarterTab] = useState('python');

  // Handle Save (Create or Edit) Problem
  async function handleSaveProblem(e) {
    e.preventDefault();
    try {
      const payload = {
        title: problemForm.title,
        difficulty: problemForm.difficulty,
        topics: typeof problemForm.topics === 'string'
          ? problemForm.topics.split(',').map((t) => t.trim()).filter(Boolean)
          : problemForm.topics,
        description: problemForm.description,
        inputFormat: problemForm.inputFormat,
        outputFormat: problemForm.outputFormat,
        constraints: problemForm.constraints ? problemForm.constraints.split('\n').filter(Boolean) : [],
        examples: [
          {
            input: problemForm.exampleInput,
            output: problemForm.exampleOutput,
            explanation: problemForm.exampleExplanation,
          },
        ],
        sampleTestCases: [
          { id: 'sample-1', input: problemForm.sampleInput1, expectedOutput: problemForm.sampleOutput1 },
          ...(problemForm.sampleInput2
            ? [{ id: 'sample-2', input: problemForm.sampleInput2, expectedOutput: problemForm.sampleOutput2 }]
            : []),
        ],
        hiddenTestCases: [
          ...(problemForm.hiddenInput1
            ? [{ id: 'hidden-1', input: problemForm.hiddenInput1, expectedOutput: problemForm.hiddenOutput1 }]
            : []),
        ],
        starterCode: {
          python: problemForm.pyStarter,
          javascript: problemForm.jsStarter,
          cpp: problemForm.cppStarter,
          java: problemForm.javaStarter,
        },
        isPublished: problemForm.isPublished,
      };

      if (editingProblem) {
        await updateTeacherProblem(editingProblem.id, payload);
        notify(`Problem "${problemForm.title}" updated successfully.`);
      } else {
        await createTeacherProblem(payload);
        notify(`Problem "${problemForm.title}" created successfully.`);
      }

      setProblemForm(defaultProblemForm);
      setEditingProblem(null);
      const updated = await getTeacherProblems();
      setProblems(updated);
      setActiveTab('problems');
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Handle Delete Problem
  async function handleDeleteProblem(id) {
    try {
      await deleteTeacherProblem(id);
      notify('Problem deleted.');
      setDeleteProblemConfirm(null);
      const updated = await getTeacherProblems();
      setProblems(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Handle Toggle Publish Problem
  async function handleTogglePublish(id) {
    try {
      const res = await togglePublishProblem(id);
      notify(res.message);
      const updated = await getTeacherProblems();
      setProblems(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Handle Duplicate Problem
  async function handleDuplicateProblem(id) {
    try {
      const res = await duplicateTeacherProblem(id);
      notify('Problem duplicated as draft.');
      const updated = await getTeacherProblems();
      setProblems(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Populate form for Editing
  function startEditProblem(prob) {
    setEditingProblem(prob);
    setProblemForm({
      title: prob.title,
      difficulty: prob.difficulty,
      topics: (prob.topics || []).join(', '),
      description: prob.description || '',
      inputFormat: prob.inputFormat || '',
      outputFormat: prob.outputFormat || '',
      constraints: (prob.constraints || []).join('\n'),
      exampleInput: prob.examples?.[0]?.input || '',
      exampleOutput: prob.examples?.[0]?.output || '',
      exampleExplanation: prob.examples?.[0]?.explanation || '',
      sampleInput1: prob.sampleTestCases?.[0]?.input || '',
      sampleOutput1: prob.sampleTestCases?.[0]?.expectedOutput || '',
      sampleInput2: prob.sampleTestCases?.[1]?.input || '',
      sampleOutput2: prob.sampleTestCases?.[1]?.expectedOutput || '',
      hiddenInput1: prob.hiddenTestCases?.[0]?.input || '',
      hiddenOutput1: prob.hiddenTestCases?.[0]?.expectedOutput || '',
      pyStarter: prob.starterCode?.python || '',
      jsStarter: prob.starterCode?.javascript || '',
      cppStarter: prob.starterCode?.cpp || '',
      javaStarter: prob.starterCode?.java || '',
      isPublished: prob.isPublished !== false,
    });
    setActiveTab('add-problem');
  }

  // Predict Output Question Form
  const defaultPredictForm = {
    language: 'python',
    title: '',
    concept: 'Loop Boundaries',
    difficulty: 'Easy',
    tags: 'Loops, Bounds',
    code: 'total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)',
    expectedOutput: '6',
    demoWrongAnswer: '10',
    explanation: 'range(1, 4) produces [1, 2, 3]. Sum is 6.',
    executionDetails: 'Iteration 1: i=1, total=1\nIteration 2: i=2, total=3\nIteration 3: i=3, total=6',
    isPublished: true,
  };
  const [predictForm, setPredictForm] = useState(defaultPredictForm);

  // Handle Save Predict Question
  async function handleSavePredict(e) {
    e.preventDefault();
    try {
      if (editingPredict) {
        await updateTeacherPredictQuestion(editingPredict.id, predictForm);
        notify('Predict question updated.');
      } else {
        await createTeacherPredictQuestion(predictForm);
        notify('Predict question created.');
      }
      setIsAddingPredict(false);
      setEditingPredict(null);
      setPredictForm(defaultPredictForm);
      const updated = await getTeacherPredictQuestions();
      setPredictQuestions(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleDeletePredict(id) {
    if (!window.confirm('Are you sure you want to delete this predict-output challenge?')) return;
    try {
      await deleteTeacherPredictQuestion(id);
      notify('Question deleted.');
      const updated = await getTeacherPredictQuestions();
      setPredictQuestions(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  async function handleTogglePublishPredict(id) {
    try {
      const res = await togglePublishPredictQuestion(id);
      notify(res.message);
      const updated = await getTeacherPredictQuestions();
      setPredictQuestions(updated);
    } catch (err) {
      notify(err.message, 'error');
    }
  }

  // Logout Handler
  async function handleLogoutClick() {
    await logout();
    navigate('/login', { replace: true });
  }

  // Filtered problems list
  const filteredProblems = problems.filter((p) => {
    const matchDiff = problemDifficultyFilter === 'All' || p.difficulty === problemDifficultyFilter;
    const matchSearch =
      !problemSearch ||
      p.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      (p.topics || []).some((t) => t.toLowerCase().includes(problemSearch.toLowerCase()));
    return matchDiff && matchSearch;
  });

  // Filtered predict questions
  const filteredPredicts = predictQuestions.filter((q) => {
    return predictLangFilter === 'all' || q.language === predictLangFilter;
  });

  // Filtered students
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return (
      !studentSearch ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      s.college.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q)
    );
  });

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    return submissionFilterStatus === 'All' || sub.status === submissionFilterStatus;
  });

  const facultyName = user?.name || 'Faculty Member';
  const facultyInitials = facultyName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const TAB_TITLES = {
    overview: 'Dashboard Overview',
    problems: 'Manage Coding Questions',
    'add-problem': editingProblem ? 'Edit Problem' : 'Author New Problem',
    'predict-output': 'Predict Output Challenges',
    students: 'Student Cohort & Progress',
    submissions: 'Real-Time Submissions',
    analytics: 'Analytics & Misconception Heatmap',
    settings: 'Faculty Profile & Settings',
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR: FACULTY PORTAL (Matches User UI Dark Navy Design) */}
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-header">
          <div
            className="brand-badge"
            onClick={() => setActiveTab('overview')}
            style={{ cursor: 'pointer' }}
          >
            <div className="brand-icon-box">
              <span style={{ fontSize: 17, letterSpacing: -1 }}>RE</span>
            </div>
            <div>
              <div className="brand-title">RE:LEARN</div>
              <div style={{ fontSize: 11, color: '#60a5fa', fontWeight: 700, letterSpacing: '0.04em' }}>
                FACULTY PORTAL
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="sidebar-scroll">
          <div className="sidebar-section-title">Curriculum & Labs</div>

          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'problems', label: 'Manage Problems', icon: Code2, count: problems.length },
            {
              id: 'add-problem',
              label: editingProblem ? 'Edit Problem' : 'Add New Problem',
              icon: PlusCircle,
            },
            {
              id: 'predict-output',
              label: 'Predict Output',
              icon: HelpCircle,
              count: predictQuestions.length,
            },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => {
                  if (item.id === 'add-problem' && !editingProblem) {
                    setProblemForm(defaultProblemForm);
                  }
                  setActiveTab(item.id);
                }}
                style={{ width: '100%', border: 'none', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div className="row center" style={{ gap: 12 }}>
                  <Icon className="link-icon" size={18} strokeWidth={active ? 2.2 : 1.9} />
                  <span className="label">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: active ? 'rgba(96, 165, 250, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div className="sidebar-section-title" style={{ marginTop: 14 }}>
            Learner Insights
          </div>

          {[
            { id: 'students', label: 'Student Roster', icon: Users, count: students.length },
            { id: 'submissions', label: 'Live Submissions', icon: Send, count: submissions.length },
            { id: 'analytics', label: 'Analytics & Heatmap', icon: BarChart3 },
            { id: 'settings', label: 'Teacher Settings', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-link ${active ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                style={{ width: '100%', border: 'none', justifyContent: 'space-between', cursor: 'pointer' }}
              >
                <div className="row center" style={{ gap: 12 }}>
                  <Icon className="link-icon" size={18} strokeWidth={active ? 2.2 : 1.9} />
                  <span className="label">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: active ? 'rgba(96, 165, 250, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Faculty Profile Footer */}
        <div className="sidebar-footer">
          <div className="user-mini-card">
            <div className="user-avatar-sm" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #2563eb 100%)' }}>
              {facultyInitials || 'T'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: '#ffffff',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {facultyName}
              </div>
              <div style={{ fontSize: 11, color: '#60a5fa' }}>Verified Teacher</div>
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={handleLogoutClick}
              title="Logout"
              style={{ width: 30, height: 30, color: '#ef4444' }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WRAPPER */}
      <div className="main-wrapper">
        {/* TOP NAVBAR (Matches User UI Topbar) */}
        <header className="topbar">
          <div className="topbar-left">
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Faculty Portal / {TAB_TITLES[activeTab] || 'Dashboard'}
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--navy-900)', marginTop: 1 }}>
                {TAB_TITLES[activeTab] || 'Overview'}
              </div>
            </div>
          </div>

          <div className="topbar-right">
            <div className="pill blue" style={{ fontSize: 12 }}>
              <ShieldCheck size={14} />
              <span>Faculty Access</span>
            </div>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setEditingProblem(null);
                setProblemForm(defaultProblemForm);
                setActiveTab('add-problem');
              }}
            >
              <PlusCircle size={15} />
              <span>Add Question</span>
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={handleLogoutClick}
              title="Sign Out"
              style={{ color: 'var(--text-muted)' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main className="content-area">
          {/* Notification Toast */}
          {notification && (
            <div
              style={{
                position: 'fixed',
                top: 24,
                right: 24,
                zIndex: 9999,
                background: notification.type === 'error' ? '#ef4444' : '#10b981',
                color: '#ffffff',
                padding: '12px 20px',
                borderRadius: 12,
                boxShadow: 'var(--shadow-lg)',
                fontWeight: 600,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              {notification.type === 'error' ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
              <span>{notification.msg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && overview && (
            <div className="stack gap-lg animate-rise">
              {/* Header */}
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--navy-900)', letterSpacing: '-0.03em' }}>
                    {getGreeting()}, {facultyName} 👨‍🏫
                  </h1>
                  <p style={{ fontSize: 15, color: 'var(--text-muted)', marginTop: 4 }}>
                    Overview of Coding Lab curriculum, live student submissions, and class learning trends.
                  </p>
                </div>

                <div className="row center" style={{ gap: 12 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      setEditingProblem(null);
                      setProblemForm(defaultProblemForm);
                      setActiveTab('add-problem');
                    }}
                  >
                    <PlusCircle size={16} />
                    <span>Add Coding Question</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setActiveTab('submissions')}
                  >
                    <Send size={16} color="var(--primary)" />
                    <span>Live Submissions</span>
                  </button>
                </div>
              </div>

              {/* 4 Stat Cards (Clean SaaS Metrics identical to Student Dashboard) */}
              <div className="grid cols-4">
                {/* Card 1: Enrolled Students */}
                <div className="stat-card-clean">
                  <div className="stat-header">
                    <span className="stat-label">Enrolled Students</span>
                    <div className="stat-icon blue">
                      <Users size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-value">{overview.totalStudents}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="stat-trend up">
                        <TrendingUp size={13} />
                        Active learning cohort
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 2: Total Questions */}
                <div className="stat-card-clean">
                  <div className="stat-header">
                    <span className="stat-label">Total Questions</span>
                    <div className="stat-icon navy">
                      <Code2 size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-value">{overview.totalProblems}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="stat-trend neutral">
                        {overview.publishedProblems} published to students
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 3: Total Submissions */}
                <div className="stat-card-clean">
                  <div className="stat-header">
                    <span className="stat-label">Total Submissions</span>
                    <div className="stat-icon green">
                      <Send size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-value">{overview.totalSubmissions}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="stat-trend up">
                        <TrendingUp size={13} />
                        {overview.acceptedSubmissions} accepted solutions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 4: Class Acceptance Rate */}
                <div className="stat-card-clean">
                  <div className="stat-header">
                    <span className="stat-label">Class Acceptance Rate</span>
                    <div className="stat-icon amber">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                  <div>
                    <div className="stat-value">{overview.acceptanceRate}%</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="stat-trend up">
                        <Zap size={13} />
                        High solve accuracy
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Split Section: Recent Activity & Quick Navigation */}
              <div className="grid sidebar-split">
                {/* Recent Student Submissions Table */}
                <div className="card">
                  <div className="card-header" style={{ marginBottom: 16 }}>
                    <div>
                      <div className="card-title">Recent Student Submissions</div>
                      <div className="card-subtitle">Latest code evaluations in Coding Lab</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setActiveTab('submissions')}
                      style={{ color: 'var(--primary)', fontWeight: 600 }}
                    >
                      View All Submissions →
                    </button>
                  </div>

                  <div className="stack" style={{ gap: 10 }}>
                    {overview.recentSubmissions?.map((sub) => (
                      <div
                        key={sub.id}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 12,
                          background: 'var(--surface-alt)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div className="row center" style={{ gap: 12 }}>
                          {sub.status === 'Accepted' ? (
                            <CheckCircle2 size={18} color="var(--success)" />
                          ) : (
                            <XCircle size={18} color="var(--danger)" />
                          )}
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy-900)' }}>
                              {sub.studentName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                              {sub.problemTitle} •{' '}
                              <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{sub.language}</span>
                            </div>
                          </div>
                        </div>

                        <div className="row center" style={{ gap: 10 }}>
                          <span className={`pill ${sub.status === 'Accepted' ? 'green' : 'red'}`}>
                            {sub.status}
                          </span>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            onClick={() => setViewingSubmissionCode(sub)}
                            title="Inspect code"
                            style={{ padding: '6px 8px', color: 'var(--primary)' }}
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Question Management Quick Card */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 4 }}>
                    Problem Difficulty Distribution
                  </div>
                  <div className="card-subtitle" style={{ marginBottom: 18 }}>
                    Question bank difficulty breakdown
                  </div>

                  <div className="stack" style={{ gap: 16 }}>
                    <div>
                      <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: '#00b8a3', fontWeight: 700 }}>Easy Problems</span>
                        <span style={{ fontWeight: 600 }}>{overview.difficultyDistribution?.Easy || 0} questions</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${((overview.difficultyDistribution?.Easy || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                            background: '#00b8a3',
                            borderRadius: 9999,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: '#ffc01e', fontWeight: 700 }}>Medium Problems</span>
                        <span style={{ fontWeight: 600 }}>{overview.difficultyDistribution?.Medium || 0} questions</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${((overview.difficultyDistribution?.Medium || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                            background: '#ffc01e',
                            borderRadius: 9999,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="row between" style={{ fontSize: 13, marginBottom: 6 }}>
                        <span style={{ color: '#ff375f', fontWeight: 700 }}>Hard Problems</span>
                        <span style={{ fontWeight: 600 }}>{overview.difficultyDistribution?.Hard || 0} questions</span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${((overview.difficultyDistribution?.Hard || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                            background: '#ff375f',
                            borderRadius: 9999,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="divider" style={{ margin: '22px 0 16px' }} />

                  <div className="row between" style={{ gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block btn-sm"
                      onClick={() => setActiveTab('problems')}
                    >
                      Manage Problem Bank
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block btn-sm"
                      onClick={() => setActiveTab('predict-output')}
                    >
                      Predict Output ({overview.predictQuestionsCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Course Progression & AI Cognitive Remediation Telemetry */}
              <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
                <div className="row between wrap center" style={{ marginBottom: 18, gap: 12 }}>
                  <div className="row center" style={{ gap: 12 }}>
                    <div className="stat-icon blue">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--navy-900)' }}>
                        Courses Progression & AI Remediation Telemetry
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Adaptive curriculum tracking, student final assessments, and AI-generated video lessons
                      </div>
                    </div>
                  </div>

                  <span className="pill green" style={{ fontWeight: 700 }}>
                    AI Diagnostic Active
                  </span>
                </div>

                <div className="grid cols-3">
                  {/* Cohort Course Progress */}
                  <div
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 14,
                      padding: '16px 18px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                      Active Course Track
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 4 }}>
                      Data Structures & Algorithms
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 12 }}>
                      Cohort Average: <strong>78%</strong> • Current Module: <strong>Binary Search</strong>
                    </div>
                    <div style={{ height: 6, background: '#e2e8f0', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: '78%', background: 'var(--primary)', borderRadius: 9999 }} />
                    </div>
                  </div>

                  {/* Detected Learning Gaps */}
                  <div
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 14,
                      padding: '16px 18px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 600, marginBottom: 4 }}>
                      Top Cognitive Learning Gap
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy-900)', marginBottom: 4 }}>
                      Binary Search — Pointer Movement
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      Confusion between low = mid + 1 and low = mid causing boundary infinite loops.
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--primary)', marginTop: 8, fontWeight: 700 }}>
                      AI Confidence: 94% • 3 questions flagged
                    </div>
                  </div>

                  {/* AI Lessons Generated */}
                  <div
                    style={{
                      background: 'var(--surface-alt)',
                      borderRadius: 14,
                      padding: '16px 18px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginBottom: 4 }}>
                      Personalized AI Remedial Lessons
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 4 }}>
                      1 Active Lesson
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-soft)' }}>
                      10-scene animated remedial video delivered to Alex Rivera
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--success)', marginTop: 8, fontWeight: 700 }}>
                      Re-evaluation: +45% accuracy gain
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MANAGE PROBLEMS */}
          {activeTab === 'problems' && (
            <div className="stack gap-lg animate-rise">
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                    Coding Lab Questions
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                    Add, edit, delete, publish, or preview programming challenges shown to students in Coding Lab.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProblem(null);
                    setProblemForm(defaultProblemForm);
                    setActiveTab('add-problem');
                  }}
                >
                  <PlusCircle size={16} />
                  <span>Create New Question</span>
                </button>
              </div>

              {/* Filter and Search Bar */}
              <div className="card" style={{ padding: '14px 20px' }}>
                <div className="row between center wrap" style={{ gap: 14 }}>
                  <div className="search-bar" style={{ maxWidth: 360 }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                      type="text"
                      placeholder="Search title, topic, algorithm..."
                      value={problemSearch}
                      onChange={(e) => setProblemSearch(e.target.value)}
                    />
                  </div>

                  <div className="row center" style={{ gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Difficulty:</span>
                    {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                      <button
                        key={d}
                        type="button"
                        className={`btn btn-sm ${problemDifficultyFilter === d ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setProblemDifficultyFilter(d)}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Problems Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title & Description</th>
                      <th>Difficulty</th>
                      <th>Topics</th>
                      <th>Testcases</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProblems.map((prob) => {
                      const diffTone =
                        prob.difficulty === 'Easy'
                          ? 'green'
                          : prob.difficulty === 'Medium'
                            ? 'amber'
                            : 'red';

                      return (
                        <tr key={prob.id}>
                          <td>
                            <div style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 14.5 }}>
                              {prob.title}
                            </div>
                            <div
                              style={{
                                fontSize: 12.5,
                                color: 'var(--text-muted)',
                                maxWidth: 360,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: 2,
                              }}
                            >
                              {prob.description}
                            </div>
                          </td>

                          <td>
                            <span className={`pill ${diffTone}`}>{prob.difficulty}</span>
                          </td>

                          <td>
                            <div className="row wrap" style={{ gap: 4, maxWidth: 220 }}>
                              {(prob.topics || []).map((t) => (
                                <span key={t} className="pill neutral" style={{ fontSize: 11 }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td style={{ color: 'var(--text-soft)', fontSize: 12.5 }}>
                            {prob.sampleTestCases?.length || 0} public • {prob.hiddenTestCases?.length || 0} hidden
                          </td>

                          <td>
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(prob.id)}
                              className={`pill ${prob.isPublished !== false ? 'green' : 'amber'}`}
                              style={{ cursor: 'pointer', border: 'none' }}
                            >
                              <span>{prob.isPublished !== false ? '● Published' : '○ Draft'}</span>
                            </button>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div className="row center right" style={{ gap: 6 }}>
                              <button
                                type="button"
                                className="icon-btn"
                                title="Preview as Student"
                                onClick={() => setPreviewingProblem(prob)}
                                style={{ color: 'var(--primary)', width: 32, height: 32 }}
                              >
                                <Eye size={15} />
                              </button>

                              <button
                                type="button"
                                className="icon-btn"
                                title="Edit Problem"
                                onClick={() => startEditProblem(prob)}
                                style={{ color: 'var(--navy-900)', width: 32, height: 32 }}
                              >
                                <Edit size={15} />
                              </button>

                              <button
                                type="button"
                                className="icon-btn"
                                title="Duplicate Problem"
                                onClick={() => handleDuplicateProblem(prob.id)}
                                style={{ color: 'var(--text-muted)', width: 32, height: 32 }}
                              >
                                <Copy size={15} />
                              </button>

                              <button
                                type="button"
                                className="icon-btn"
                                title="Delete Problem"
                                onClick={() => setDeleteProblemConfirm(prob)}
                                style={{ color: 'var(--danger)', width: 32, height: 32 }}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD / EDIT PROBLEM */}
          {activeTab === 'add-problem' && (
            <div className="stack gap-lg animate-rise" style={{ maxWidth: 960 }}>
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                    {editingProblem ? `Edit Question: ${editingProblem.title}` : 'Author New Problem'}
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                    Configure problem statements, testcases, hidden test suites, and starter code templates.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setEditingProblem(null);
                    setActiveTab('problems');
                  }}
                >
                  Back to Problem List
                </button>
              </div>

              <form onSubmit={handleSaveProblem} className="stack gap-md">
                {/* Card 1: Basic Info */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 16 }}>
                    1. Question Overview & Metadata
                  </div>

                  <div className="grid cols-2" style={{ gap: 16 }}>
                    <div>
                      <label className="field-label">Problem Title *</label>
                      <input
                        type="text"
                        className="input"
                        required
                        placeholder="e.g. Merge Intervals"
                        value={problemForm.title}
                        onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="field-label">Difficulty Level</label>
                      <select
                        className="select"
                        value={problemForm.difficulty}
                        onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="field-label">Topics / Tags (comma-separated)</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Array, Dynamic Programming, Two Pointers"
                      value={problemForm.topics}
                      onChange={(e) => setProblemForm({ ...problemForm, topics: e.target.value })}
                    />
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="field-label">Problem Statement (Markdown supported) *</label>
                    <textarea
                      className="textarea"
                      required
                      placeholder="Describe the task, requirements, and edge cases clearly..."
                      value={problemForm.description}
                      onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                      style={{ minHeight: 120 }}
                    />
                  </div>
                </div>

                {/* Card 2: Constraints & Examples */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 16 }}>
                    2. Input / Output & Sample Examples
                  </div>

                  <div className="grid cols-2" style={{ gap: 16 }}>
                    <div>
                      <label className="field-label">Input Format Description</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. First line contains integer array nums..."
                        value={problemForm.inputFormat}
                        onChange={(e) => setProblemForm({ ...problemForm, inputFormat: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="field-label">Output Format Description</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Return indices [i, j]..."
                        value={problemForm.outputFormat}
                        onChange={(e) => setProblemForm({ ...problemForm, outputFormat: e.target.value })}
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <label className="field-label">Constraints (one constraint per line)</label>
                    <textarea
                      className="textarea"
                      placeholder="1 <= nums.length <= 10^5&#10;-10^9 <= target <= 10^9"
                      value={problemForm.constraints}
                      onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                      style={{ minHeight: 70 }}
                    />
                  </div>

                  <div style={{ marginTop: 16, background: 'var(--surface-alt)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10, color: 'var(--primary)' }}>
                      Sample Example 1
                    </div>
                    <div className="grid cols-2" style={{ gap: 12 }}>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Example Input</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="nums = [2,7,11,15], target = 9"
                          value={problemForm.exampleInput}
                          onChange={(e) => setProblemForm({ ...problemForm, exampleInput: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Example Output</label>
                        <input
                          type="text"
                          className="input"
                          placeholder="[0,1]"
                          value={problemForm.exampleOutput}
                          onChange={(e) => setProblemForm({ ...problemForm, exampleOutput: e.target.value })}
                        />
                      </div>
                    </div>
                    <div style={{ marginTop: 10 }}>
                      <label className="field-label" style={{ fontSize: 12 }}>Example Explanation</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="Because nums[0] + nums[1] == 9, return [0, 1]."
                        value={problemForm.exampleExplanation}
                        onChange={(e) => setProblemForm({ ...problemForm, exampleExplanation: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 3: Test Cases (Sample + Hidden) */}
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 16 }}>
                    3. Test Cases (Sample Public & Hidden Evaluation Suites)
                  </div>

                  <div className="grid cols-2" style={{ gap: 16 }}>
                    {/* Public Sample Testcases */}
                    <div style={{ background: 'var(--surface-alt)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10, color: 'var(--primary)' }}>
                        Sample Testcase 1 (Public)
                      </div>
                      <label className="field-label" style={{ fontSize: 12 }}>Input</label>
                      <textarea
                        className="textarea"
                        placeholder="[2,7,11,15]&#10;9"
                        value={problemForm.sampleInput1}
                        onChange={(e) => setProblemForm({ ...problemForm, sampleInput1: e.target.value })}
                        style={{ minHeight: 70 }}
                      />
                      <label className="field-label" style={{ fontSize: 12, marginTop: 10 }}>Expected Output</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="[0,1]"
                        value={problemForm.sampleOutput1}
                        onChange={(e) => setProblemForm({ ...problemForm, sampleOutput1: e.target.value })}
                      />
                    </div>

                    {/* Hidden Testcase */}
                    <div style={{ background: 'var(--surface-alt)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 10, color: 'var(--danger)' }}>
                        Hidden Testcase 1 (Evaluated on Submit)
                      </div>
                      <label className="field-label" style={{ fontSize: 12 }}>Input</label>
                      <textarea
                        className="textarea"
                        placeholder="[-1,-2,-3,-4]&#10;-7"
                        value={problemForm.hiddenInput1}
                        onChange={(e) => setProblemForm({ ...problemForm, hiddenInput1: e.target.value })}
                        style={{ minHeight: 70 }}
                      />
                      <label className="field-label" style={{ fontSize: 12, marginTop: 10 }}>Expected Output</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="[2,3]"
                        value={problemForm.hiddenOutput1}
                        onChange={(e) => setProblemForm({ ...problemForm, hiddenOutput1: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Card 4: Language Starter Templates */}
                <div className="card">
                  <div className="row between center" style={{ marginBottom: 14 }}>
                    <div className="card-title">4. Language Starter Code Templates</div>
                    <div className="row" style={{ gap: 6 }}>
                      {['python', 'javascript', 'cpp', 'java'].map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          className={`btn btn-sm ${activeStarterTab === lang ? 'btn-primary' : 'btn-secondary'}`}
                          onClick={() => setActiveStarterTab(lang)}
                          style={{ textTransform: 'uppercase', fontSize: 11 }}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activeStarterTab === 'python' && (
                    <textarea
                      className="textarea"
                      value={problemForm.pyStarter}
                      onChange={(e) => setProblemForm({ ...problemForm, pyStarter: e.target.value })}
                      style={{ fontFamily: 'var(--mono)', fontSize: 13, minHeight: 140, background: '#fafafa' }}
                    />
                  )}
                  {activeStarterTab === 'javascript' && (
                    <textarea
                      className="textarea"
                      value={problemForm.jsStarter}
                      onChange={(e) => setProblemForm({ ...problemForm, jsStarter: e.target.value })}
                      style={{ fontFamily: 'var(--mono)', fontSize: 13, minHeight: 140, background: '#fafafa' }}
                    />
                  )}
                  {activeStarterTab === 'cpp' && (
                    <textarea
                      className="textarea"
                      value={problemForm.cppStarter}
                      onChange={(e) => setProblemForm({ ...problemForm, cppStarter: e.target.value })}
                      style={{ fontFamily: 'var(--mono)', fontSize: 13, minHeight: 140, background: '#fafafa' }}
                    />
                  )}
                  {activeStarterTab === 'java' && (
                    <textarea
                      className="textarea"
                      value={problemForm.javaStarter}
                      onChange={(e) => setProblemForm({ ...problemForm, javaStarter: e.target.value })}
                      style={{ fontFamily: 'var(--mono)', fontSize: 13, minHeight: 140, background: '#fafafa' }}
                    />
                  )}
                </div>

                {/* Publish Toggle & Submit Action */}
                <div className="row between center" style={{ marginTop: 8 }}>
                  <label className="row center" style={{ gap: 10, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={problemForm.isPublished}
                      onChange={(e) => setProblemForm({ ...problemForm, isPublished: e.target.checked })}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                    />
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--navy-900)' }}>
                      Publish to students immediately (uncheck to save as draft)
                    </span>
                  </label>

                  <div className="row" style={{ gap: 12 }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setEditingProblem(null);
                        setActiveTab('problems');
                      }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-lg">
                      {editingProblem ? 'Update Question' : 'Publish Question to Coding Lab'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: PREDICT OUTPUT QUESTIONS */}
          {activeTab === 'predict-output' && (
            <div className="stack gap-lg animate-rise">
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                    Predict Output Challenges
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                    Manage tricky code snippets, expected outputs, and execution explanations across programming languages.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingPredict(null);
                    setPredictForm(defaultPredictForm);
                    setIsAddingPredict(!isAddingPredict);
                  }}
                >
                  <PlusCircle size={16} />
                  <span>{isAddingPredict ? 'Close Form' : 'Add Predict Challenge'}</span>
                </button>
              </div>

              {/* Authoring Form if Open */}
              {isAddingPredict && (
                <form
                  onSubmit={handleSavePredict}
                  className="card stack gap-md"
                  style={{ border: '2px solid var(--primary)' }}
                >
                  <div style={{ fontWeight: 800, fontSize: 17, color: 'var(--primary)' }}>
                    {editingPredict ? 'Edit Predict Challenge' : 'New Predict Output Challenge'}
                  </div>

                  <div className="grid cols-3" style={{ gap: 14 }}>
                    <div>
                      <label className="field-label">Language *</label>
                      <select
                        className="select"
                        value={predictForm.language}
                        onChange={(e) => setPredictForm({ ...predictForm, language: e.target.value })}
                      >
                        <option value="python">Python</option>
                        <option value="javascript">JavaScript</option>
                        <option value="cpp">C++</option>
                        <option value="c">C</option>
                        <option value="java">Java</option>
                        <option value="php">PHP</option>
                        <option value="go">Go</option>
                        <option value="csharp">C#</option>
                        <option value="kotlin">Kotlin</option>
                        <option value="rust">Rust</option>
                      </select>
                    </div>

                    <div>
                      <label className="field-label">Question Title *</label>
                      <input
                        type="text"
                        className="input"
                        required
                        placeholder="e.g. Closure in Loop"
                        value={predictForm.title}
                        onChange={(e) => setPredictForm({ ...predictForm, title: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="field-label">Difficulty</label>
                      <select
                        className="select"
                        value={predictForm.difficulty}
                        onChange={(e) => setPredictForm({ ...predictForm, difficulty: e.target.value })}
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Code Snippet (Syntax displayed to student) *</label>
                    <textarea
                      className="textarea"
                      required
                      placeholder="Enter the code snippet..."
                      value={predictForm.code}
                      onChange={(e) => setPredictForm({ ...predictForm, code: e.target.value })}
                      style={{ fontFamily: 'var(--mono)', fontSize: 13, minHeight: 110, background: '#fafafa' }}
                    />
                  </div>

                  <div className="grid cols-2" style={{ gap: 14 }}>
                    <div>
                      <label className="field-label">Expected Output (Exact console output) *</label>
                      <input
                        type="text"
                        className="input"
                        required
                        placeholder="e.g. 6"
                        value={predictForm.expectedOutput}
                        onChange={(e) => setPredictForm({ ...predictForm, expectedOutput: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="field-label">Demo Common Wrong Answer (for guided demo)</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. 10"
                        value={predictForm.demoWrongAnswer}
                        onChange={(e) => setPredictForm({ ...predictForm, demoWrongAnswer: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="field-label">Step-by-step Execution Explanation *</label>
                    <textarea
                      className="textarea"
                      required
                      placeholder="Explain why this snippet produces the output..."
                      value={predictForm.explanation}
                      onChange={(e) => setPredictForm({ ...predictForm, explanation: e.target.value })}
                      style={{ minHeight: 70 }}
                    />
                  </div>

                  <div className="row between center">
                    <label className="row center" style={{ gap: 8, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={predictForm.isPublished}
                        onChange={(e) => setPredictForm({ ...predictForm, isPublished: e.target.checked })}
                        style={{ width: 16, height: 16, accentColor: 'var(--primary)' }}
                      />
                      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-soft)' }}>
                        Published to students
                      </span>
                    </label>

                    <div className="row" style={{ gap: 10 }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setIsAddingPredict(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary btn-sm">
                        {editingPredict ? 'Update Challenge' : 'Save Challenge'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {/* Questions Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Title & Concept</th>
                      <th>Language</th>
                      <th>Difficulty</th>
                      <th>Expected Output</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPredicts.map((q) => (
                      <tr key={q.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{q.title}</div>
                          <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>{q.concept}</div>
                        </td>
                        <td>
                          <span className="pill neutral" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                            {q.language}
                          </span>
                        </td>
                        <td>
                          <span className={`pill ${q.difficulty === 'Easy' ? 'green' : 'amber'}`}>
                            {q.difficulty}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--mono)', fontSize: 13, color: 'var(--success)', fontWeight: 700 }}>
                          {q.expectedOutput}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => handleTogglePublishPredict(q.id)}
                            className={`pill ${q.isPublished !== false ? 'green' : 'amber'}`}
                            style={{ cursor: 'pointer', border: 'none' }}
                          >
                            {q.isPublished !== false ? 'Published' : 'Draft'}
                          </button>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="row center right" style={{ gap: 6 }}>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Preview"
                              onClick={() => setPreviewingPredict(q)}
                              style={{ color: 'var(--primary)', width: 32, height: 32 }}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Edit"
                              onClick={() => {
                                setEditingPredict(q);
                                setPredictForm({ ...q });
                                setIsAddingPredict(true);
                              }}
                              style={{ color: 'var(--navy-900)', width: 32, height: 32 }}
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              type="button"
                              className="icon-btn"
                              title="Delete"
                              onClick={() => handleDeletePredict(q.id)}
                              style={{ color: 'var(--danger)', width: 32, height: 32 }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STUDENT PROGRESS & ROSTER */}
          {activeTab === 'students' && (
            <div className="stack gap-lg animate-rise">
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                    Student Learning Cohort
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                    Detailed cohort tracking: problems attempted, solve rates, college details, and activity logs.
                  </p>
                </div>

                <div className="search-bar" style={{ maxWidth: 340 }}>
                  <Search size={16} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search students, college, branch..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                  />
                </div>
              </div>

              {/* Students Table */}
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student Profile</th>
                      <th>College & Branch</th>
                      <th>Semester</th>
                      <th>Solved / Attempted</th>
                      <th>Accuracy</th>
                      <th>Recent Activity</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((stud) => (
                      <tr key={stud.userId}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{stud.fullName}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stud.email}</div>
                        </td>
                        <td>
                          <div style={{ color: 'var(--text)' }}>{stud.college}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{stud.branch}</div>
                        </td>
                        <td style={{ color: 'var(--text-soft)' }}>
                          {stud.yearSemester || '3rd Year'}
                        </td>
                        <td>
                          <span style={{ fontWeight: 800, color: 'var(--success)' }}>
                            {stud.problemsSolved || 0}
                          </span>
                          <span style={{ color: 'var(--text-muted)' }}> / {stud.problemsAttempted || 0}</span>
                        </td>
                        <td>
                          <span
                            className={`pill ${(stud.accuracy || 0) >= 75 ? 'green' : 'amber'}`}
                            style={{ fontWeight: 700 }}
                          >
                            {stud.accuracy || 0}%
                          </span>
                        </td>
                        <td style={{ maxWidth: 220, fontSize: 12.5, color: 'var(--text-muted)' }}>
                          {stud.recentActivity || 'None'}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => setSelectedStudentDetail(stud)}
                          >
                            View Details →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: LIVE SUBMISSIONS */}
          {activeTab === 'submissions' && (
            <div className="stack gap-lg animate-rise">
              <div className="row between center wrap" style={{ gap: 16 }}>
                <div>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                    Student Coding Submissions
                  </h1>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                    Real-time log of test case evaluations, runtimes, memory metrics, and submitted source code.
                  </p>
                </div>

                <div className="row center" style={{ gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>Verdict Filter:</span>
                  {['All', 'Accepted', 'Wrong Answer', 'Compilation Error'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      className={`btn btn-sm ${submissionFilterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => setSubmissionFilterStatus(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Problem</th>
                      <th>Language</th>
                      <th>Status</th>
                      <th>Testcases</th>
                      <th>Runtime / Memory</th>
                      <th>Submitted At</th>
                      <th style={{ textAlign: 'right' }}>Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubmissions.map((sub) => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                          {sub.studentName}
                        </td>
                        <td style={{ color: 'var(--primary)', fontWeight: 600 }}>{sub.problemTitle}</td>
                        <td>
                          <span className="pill neutral" style={{ textTransform: 'uppercase', fontWeight: 700 }}>
                            {sub.language}
                          </span>
                        </td>
                        <td>
                          <span className={`pill ${sub.status === 'Accepted' ? 'green' : 'red'}`}>
                            {sub.status}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-soft)', fontWeight: 600 }}>
                          {sub.passedCount} / {sub.totalCount}
                        </td>
                        <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                          {sub.runtimeMs} ms • {sub.memoryMB} MB
                        </td>
                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                          {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-soft btn-sm"
                            onClick={() => setViewingSubmissionCode(sub)}
                          >
                            <Eye size={14} />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 7: ANALYTICS & HEATMAP */}
          {activeTab === 'analytics' && (
            <div className="stack gap-lg animate-rise">
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                  Class Learning Insights & Concept Stability
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: 14.5, marginTop: 4 }}>
                  Aggregated reasoning patterns across the cohort — target teaching to common misconceptions.
                </p>
              </div>

              <div className="grid cols-3">
                <div className="card">
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Active Misconception Cases
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--danger)', margin: '8px 0 4px' }}>
                    23 Cases Detected
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Concentrated in loop boundary reasoning
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Most Popular Language
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary)', margin: '8px 0 4px' }}>
                    Python (58%)
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Followed by C++ (26%) and Java (16%)
                  </div>
                </div>

                <div className="card">
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                    Stable Core Concepts
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--success)', margin: '8px 0 4px' }}>
                    83%
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                    Variables, functions, and arrays stable
                  </div>
                </div>
              </div>

              {/* Misconception Heatmap Breakdown */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>
                  Class Misconception Heatmap
                </div>
                <div className="card-subtitle" style={{ marginBottom: 20 }}>
                  Distribution of students displaying specific conceptual mental-model errors:
                </div>

                <div className="stack" style={{ gap: 16 }}>
                  {[
                    { label: 'Range Endpoint Confusion', students: 14, total: 32, concept: 'Loops', pct: 44 },
                    { label: 'Mutable Default Argument Sharing', students: 9, total: 32, concept: 'Functions', pct: 28 },
                    { label: 'Pointer Post-Increment Precedence', students: 7, total: 32, concept: 'Pointers', pct: 22 },
                    { label: 'String Pool Reference vs Object Equality', students: 6, total: 32, concept: 'OOP', pct: 19 },
                    { label: 'Slice Backing Array Overwrite on Append', students: 4, total: 32, concept: 'Memory', pct: 12 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="row between" style={{ fontSize: 13.5, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                          {item.label}{' '}
                          <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>
                            ({item.concept})
                          </span>
                        </span>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                          {item.students} of {item.total} students ({item.pct}%)
                        </span>
                      </div>
                      <div style={{ height: 8, background: 'var(--surface-alt)', borderRadius: 9999, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${item.pct}%`,
                            background: item.pct > 30 ? 'var(--danger)' : item.pct > 20 ? 'var(--warning)' : 'var(--primary)',
                            borderRadius: 9999,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: TEACHER SETTINGS */}
          {activeTab === 'settings' && (
            <div className="stack gap-lg animate-rise" style={{ maxWidth: 640 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)' }}>
                Faculty Account Settings
              </h1>

              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>
                  Account Information
                </div>

                <div className="stack" style={{ gap: 14, fontSize: 14 }}>
                  <div>
                    <div className="field-label" style={{ marginBottom: 2 }}>Name</div>
                    <div style={{ color: 'var(--navy-900)', fontWeight: 700 }}>
                      {user?.name || 'Dr. Sarah Jenkins'}
                    </div>
                  </div>
                  <div>
                    <div className="field-label" style={{ marginBottom: 2 }}>Faculty Email</div>
                    <div style={{ color: 'var(--navy-900)', fontWeight: 700 }}>
                      {user?.email || 'teacher@gmail.com'}
                    </div>
                  </div>
                  <div>
                    <div className="field-label" style={{ marginBottom: 2 }}>Role</div>
                    <div>
                      <span className="pill blue" style={{ fontWeight: 700 }}>Faculty / Course Instructor</span>
                    </div>
                  </div>
                  <div>
                    <div className="field-label" style={{ marginBottom: 2 }}>Predefined Credentials</div>
                    <div style={{ color: 'var(--text-muted)' }}>
                      Email: <code>teacher@gmail.com</code> • Password: <code>•••••••••</code>
                    </div>
                  </div>
                </div>

                <div className="divider" style={{ margin: '24px 0' }} />

                <button
                  type="button"
                  className="btn btn-secondary btn-block"
                  onClick={handleLogoutClick}
                  style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                >
                  <LogOut size={16} />
                  <span>Sign Out of Teacher Portal</span>
                </button>
              </div>
            </div>
          )}

          {/* MODAL: PREVIEW PROBLEM */}
          {previewingProblem && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: 720,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div className="row between center" style={{ marginBottom: 16 }}>
                  <div>
                    <div className="row center" style={{ gap: 10 }}>
                      <h2 style={{ fontSize: 20, color: 'var(--navy-900)' }}>{previewingProblem.title}</h2>
                      <span className={`pill ${previewingProblem.difficulty === 'Easy' ? 'green' : 'amber'}`}>
                        {previewingProblem.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      Student Preview Mode
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPreviewingProblem(null)}
                  >
                    ✕ Close
                  </button>
                </div>

                <div style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text)' }}>
                  <p style={{ whiteSpace: 'pre-line' }}>{previewingProblem.description}</p>

                  {previewingProblem.examples?.map((ex, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'var(--surface-alt)',
                        border: '1px solid var(--border)',
                        padding: 14,
                        borderRadius: 10,
                        margin: '14px 0',
                      }}
                    >
                      <div>
                        <strong>Input:</strong> <code>{ex.input}</code>
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <strong>Output:</strong> <code>{ex.output}</code>
                      </div>
                      {ex.explanation && (
                        <div style={{ marginTop: 6, fontSize: 13, color: 'var(--text-soft)' }}>
                          <strong>Explanation:</strong> {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MODAL: PREVIEW PREDICT QUESTION */}
          {previewingPredict && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: 680,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div className="row between center" style={{ marginBottom: 16 }}>
                  <div>
                    <h2 style={{ fontSize: 20, color: 'var(--navy-900)' }}>{previewingPredict.title}</h2>
                    <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>
                      {previewingPredict.concept}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPreviewingPredict(null)}
                  >
                    ✕ Close
                  </button>
                </div>

                <CodeBlock code={previewingPredict.code} language={previewingPredict.language} />

                <div style={{ marginTop: 16, background: 'var(--surface-alt)', padding: 16, borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 13.5, marginBottom: 6 }}>
                    <strong style={{ color: 'var(--success)' }}>Expected Output:</strong>{' '}
                    <code>{previewingPredict.expectedOutput}</code>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-soft)', lineHeight: 1.5 }}>
                    <strong>Explanation:</strong> {previewingPredict.explanation}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: DELETE PROBLEM CONFIRMATION */}
          {deleteProblemConfirm && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div
                className="card"
                style={{
                  maxWidth: 440,
                  textAlign: 'center',
                }}
              >
                <Trash2 size={44} color="var(--danger)" style={{ margin: '0 auto 14px' }} />
                <h3 style={{ color: 'var(--navy-900)', marginBottom: 8, fontSize: 18 }}>Delete Question?</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22 }}>
                  Are you sure you want to permanently delete "{deleteProblemConfirm.title}"? Students will no
                  longer be able to solve or submit this problem.
                </p>
                <div className="row center" style={{ gap: 12, justifyContent: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setDeleteProblemConfirm(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleDeleteProblem(deleteProblemConfirm.id)}
                    style={{ background: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Yes, Delete Question
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: STUDENT DETAILS DRAWER */}
          {selectedStudentDetail && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.5)',
                backdropFilter: 'blur(3px)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
              onClick={() => setSelectedStudentDetail(null)}
            >
              <div
                style={{
                  width: 520,
                  maxWidth: '92vw',
                  height: '100%',
                  background: '#ffffff',
                  borderLeft: '1px solid var(--border)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '28px 24px',
                  overflowY: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="row between center" style={{ marginBottom: 20 }}>
                  <div>
                    <h2 style={{ fontSize: 20, color: 'var(--navy-900)' }}>
                      {selectedStudentDetail.fullName}
                    </h2>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {selectedStudentDetail.email}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setSelectedStudentDetail(null)}
                  >
                    ✕ Close
                  </button>
                </div>

                <div className="stack" style={{ gap: 16 }}>
                  <div className="card" style={{ background: 'var(--surface-alt)', padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--primary)' }}>
                      Academic Profile
                    </div>
                    <div className="stack" style={{ gap: 6, fontSize: 13 }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>College:</span>{' '}
                        <strong>{selectedStudentDetail.college}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Degree:</span>{' '}
                        <strong>{selectedStudentDetail.course}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Branch:</span>{' '}
                        <strong>{selectedStudentDetail.branch}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Semester:</span>{' '}
                        <strong>{selectedStudentDetail.yearSemester}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Mobile:</span>{' '}
                        <strong>{selectedStudentDetail.mobile}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: 'var(--surface-alt)', padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10, color: 'var(--success)' }}>
                      Coding Lab Performance
                    </div>
                    <div className="grid cols-2" style={{ gap: 12 }}>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Problems Solved</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--navy-900)' }}>
                          {selectedStudentDetail.problemsSolved} / {selectedStudentDetail.problemsAttempted}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Accuracy Rate</div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--success)' }}>
                          {selectedStudentDetail.accuracy}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ background: 'var(--surface-alt)', padding: 18 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--navy-900)' }}>
                      Skills & Interests
                    </div>
                    <div className="row wrap" style={{ gap: 6 }}>
                      {(selectedStudentDetail.skills || []).map((sk) => (
                        <span key={sk} className="pill blue" style={{ fontSize: 11.5 }}>
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL: SUBMISSION CODE INSPECTOR */}
          {viewingSubmissionCode && (
            <div
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(15, 23, 42, 0.6)',
                backdropFilter: 'blur(4px)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
              }}
            >
              <div
                className="card"
                style={{
                  width: '100%',
                  maxWidth: 760,
                  maxHeight: '90vh',
                  overflowY: 'auto',
                }}
              >
                <div className="row between center" style={{ marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontSize: 18, color: 'var(--navy-900)' }}>
                      {viewingSubmissionCode.studentName} — {viewingSubmissionCode.problemTitle}
                    </h3>
                    <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                      Language: <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{viewingSubmissionCode.language}</span> • Status:{' '}
                      <strong style={{ color: viewingSubmissionCode.status === 'Accepted' ? 'var(--success)' : 'var(--danger)' }}>
                        {viewingSubmissionCode.status}
                      </strong>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setViewingSubmissionCode(null)}
                  >
                    ✕ Close
                  </button>
                </div>

                <CodeBlock
                  code={viewingSubmissionCode.code}
                  language={viewingSubmissionCode.language}
                  title={`solution.${viewingSubmissionCode.language}`}
                />

                <div
                  className="row between center wrap"
                  style={{
                    marginTop: 16,
                    fontSize: 12.5,
                    color: 'var(--text-muted)',
                    background: 'var(--surface-alt)',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: '1px solid var(--border)',
                  }}
                >
                  <span>Runtime: <strong>{viewingSubmissionCode.runtimeMs} ms</strong></span>
                  <span>Memory: <strong>{viewingSubmissionCode.memoryMB} MB</strong></span>
                  <span>
                    Passed: <strong>{viewingSubmissionCode.passedCount} / {viewingSubmissionCode.totalCount}</strong>
                  </span>
                  <span>{new Date(viewingSubmissionCode.submittedAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
