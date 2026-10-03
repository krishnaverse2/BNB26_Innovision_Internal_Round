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
  Cpu,
  Globe2,
  BookOpen,
  Filter,
  Check,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Layers,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Pill, StatCard, Card, CardHeader, CodeBlock } from '../../components/ui';
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
  getTeacherAnalytics,
} from '../../services/teacherApi';
import CodeEditor from '../../components/coding-lab/CodeEditor';

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

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#0b1426',
        color: '#f8fafc',
        fontFamily: 'var(--font)',
      }}
    >
      {/* SIDEBAR: TEACHER PORTAL */}
      <aside
        style={{
          width: 270,
          background: '#070d1b',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="row" style={{ gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>🧠</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 17, color: '#ffffff' }}>Re:Learn</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#c4b5fd',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Teacher Portal
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ padding: '16px 12px', flex: 1, overflowY: 'auto' }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              padding: '6px 12px',
              letterSpacing: '0.06em',
            }}
          >
            Management
          </div>

          {[
            { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
            { id: 'problems', label: 'Manage Problems', icon: Code2, count: problems.length },
            { id: 'add-problem', label: editingProblem ? 'Edit Problem' : 'Add New Problem', icon: PlusCircle },
            { id: 'predict-output', label: 'Predict Output Questions', icon: HelpCircle, count: predictQuestions.length },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === 'add-problem' && !editingProblem) {
                    setProblemForm(defaultProblemForm);
                  }
                  setActiveTab(item.id);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                  color: active ? '#c4b5fd' : '#94a3b8',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 3,
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 12,
                      background: active ? 'rgba(124, 58, 237, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#64748b',
              padding: '16px 12px 6px',
              letterSpacing: '0.06em',
            }}
          >
            Learner Insights
          </div>

          {[
            { id: 'students', label: 'Student Progress & Roster', icon: Users, count: students.length },
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
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: active ? 'rgba(124, 58, 237, 0.18)' : 'transparent',
                  color: active ? '#c4b5fd' : '#94a3b8',
                  fontWeight: active ? 600 : 500,
                  fontSize: 13.5,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginBottom: 3,
                  transition: 'all 0.15s ease',
                }}
              >
                <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                  <Icon size={17} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    style={{
                      fontSize: 11,
                      padding: '2px 7px',
                      borderRadius: 12,
                      background: active ? 'rgba(124, 58, 237, 0.35)' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : '#94a3b8',
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Faculty Profile Footer */}
        <div
          style={{
            padding: '16px 18px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(0, 0, 0, 0.25)',
          }}
        >
          <div className="row between" style={{ alignItems: 'center' }}>
            <div className="row" style={{ gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: '#7c3aed',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                T
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f8fafc' }}>
                  {user?.name || 'Faculty Member'}
                </div>
                <div style={{ fontSize: 11, color: '#a78bfa' }}>Verified Teacher</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogoutClick}
              title="Logout"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                padding: 6,
                borderRadius: 8,
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto' }}>
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
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
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
            <div className="row between wrap" style={{ gap: 12, alignItems: 'flex-start' }}>
              <div>
                <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
                  Faculty Learning Dashboard
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 14.5, marginTop: 4 }}>
                  Overview of Coding Lab curriculum, live student submissions, and class learning trends.
                </p>
              </div>

              <div className="row" style={{ gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingProblem(null);
                    setProblemForm(defaultProblemForm);
                    setActiveTab('add-problem');
                  }}
                  style={{
                    background: '#7c3aed',
                    borderColor: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  <PlusCircle size={16} />
                  Add Coding Question
                </button>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 16,
              }}
            >
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Enrolled Students</span>
                  <Users size={18} color="#60a5fa" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
                  {overview.totalStudents}
                </div>
                <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>Active learning cohort</div>
              </div>

              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Total Questions</span>
                  <Code2 size={18} color="#a78bfa" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
                  {overview.totalProblems}
                </div>
                <div style={{ fontSize: 12, color: '#c4b5fd', marginTop: 4 }}>
                  {overview.publishedProblems} published to students
                </div>
              </div>

              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Total Submissions</span>
                  <Send size={18} color="#38bdf8" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
                  {overview.totalSubmissions}
                </div>
                <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 4 }}>
                  {overview.acceptedSubmissions} Accepted solutions
                </div>
              </div>

              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Class Acceptance Rate</span>
                  <CheckCircle2 size={18} color="#10b981" />
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#ffffff' }}>
                  {overview.acceptanceRate}%
                </div>
                <div style={{ fontSize: 12, color: '#10b981', marginTop: 4 }}>High problem solve accuracy</div>
              </div>
            </div>

            {/* Split Section: Recent Activity & Quick Navigation */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20 }}>
              {/* Recent Student Submissions Table */}
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff' }}>
                      Recent Student Submissions
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>Latest code evaluations in Coding Lab</div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setActiveTab('submissions')}
                    style={{ color: '#c4b5fd', fontSize: 12 }}
                  >
                    View All Submissions →
                  </button>
                </div>

                <div className="stack" style={{ gap: 10 }}>
                  {overview.recentSubmissions?.map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 10,
                        background: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                        {sub.status === 'Accepted' ? (
                          <CheckCircle2 size={18} color="#10b981" />
                        ) : (
                          <XCircle size={18} color="#ef4444" />
                        )}
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600 }}>{sub.studentName}</div>
                          <div style={{ fontSize: 11.5, color: '#94a3b8' }}>
                            {sub.problemTitle} •{' '}
                            <span style={{ textTransform: 'uppercase' }}>{sub.language}</span>
                          </div>
                        </div>
                      </div>

                      <div className="row" style={{ gap: 10, alignItems: 'center' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: sub.status === 'Accepted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: sub.status === 'Accepted' ? '#34d399' : '#f87171',
                          }}
                        >
                          {sub.status}
                        </span>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setViewingSubmissionCode(sub)}
                          style={{ padding: '3px 6px', color: '#94a3b8' }}
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Question Management Quick Card */}
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 14 }}>
                  Problem Difficulty Distribution
                </div>

                <div className="stack" style={{ gap: 12 }}>
                  <div>
                    <div className="row between" style={{ fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#00b8a3', fontWeight: 600 }}>Easy Problems</span>
                      <span>{overview.difficultyDistribution?.Easy || 0} questions</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${((overview.difficultyDistribution?.Easy || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                          background: '#00b8a3',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="row between" style={{ fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#ffc01e', fontWeight: 600 }}>Medium Problems</span>
                      <span>{overview.difficultyDistribution?.Medium || 0} questions</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${((overview.difficultyDistribution?.Medium || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                          background: '#ffc01e',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="row between" style={{ fontSize: 13, marginBottom: 4 }}>
                      <span style={{ color: '#ff375f', fontWeight: 600 }}>Hard Problems</span>
                      <span>{overview.difficultyDistribution?.Hard || 0} questions</span>
                    </div>
                    <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${((overview.difficultyDistribution?.Hard || 0) / Math.max(1, overview.totalProblems)) * 100}%`,
                          background: '#ff375f',
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="divider" style={{ margin: '20px 0 16px', borderColor: 'rgba(255,255,255,0.08)' }} />

                <div className="row between" style={{ gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-block btn-sm"
                    onClick={() => setActiveTab('problems')}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
                  >
                    Manage Problem Bank
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-block btn-sm"
                    onClick={() => setActiveTab('predict-output')}
                    style={{ background: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' }}
                  >
                    Predict Questions ({overview.predictQuestionsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Course Progression & AI Cognitive Remediation Telemetry */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '22px 26px',
                marginTop: 20,
              }}
            >
              <div className="row between wrap" style={{ alignItems: 'center', marginBottom: 16, gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: 'rgba(37,99,235,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#60a5fa',
                    }}
                  >
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 16, color: '#ffffff' }}>
                      Courses Progression & AI Cognitive Remediation Telemetry
                    </div>
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                      Adaptive curriculum tracking, student final assessments, and AI-generated video lessons
                    </div>
                  </div>
                </div>

                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 9999,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  AI Diagnostic Active
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {/* Cohort Course Progress */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600, marginBottom: 6 }}>
                    Active Course Track
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', marginBottom: 4 }}>
                    Data Structures & Algorithms
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 10 }}>
                    Cohort Average: <strong>78%</strong> • Current Module: <strong>Binary Search</strong>
                  </div>
                  <div style={{ height: 6, background: '#1e293b', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '78%', background: '#2563eb' }} />
                  </div>
                </div>

                {/* Detected Learning Gaps */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#f87171', fontWeight: 600, marginBottom: 6 }}>
                    Top Cognitive Learning Gap
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', marginBottom: 2 }}>
                    Binary Search — Pointer Movement
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.4 }}>
                    Confusion between low = mid + 1 and low = mid causing boundary infinite loops.
                  </div>
                  <div style={{ fontSize: 11.5, color: '#60a5fa', marginTop: 6, fontWeight: 600 }}>
                    AI Confidence: 94% • 3 questions flagged
                  </div>
                </div>

                {/* AI Lessons Generated */}
                <div
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 12,
                    padding: '16px 18px',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div style={{ fontSize: 12, color: '#a78bfa', fontWeight: 600, marginBottom: 6 }}>
                    Personalized AI Lessons
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 2 }}>
                    1 Active Lesson
                  </div>
                  <div style={{ fontSize: 12, color: '#cbd5e1' }}>
                    10-scene animated remedial video delivered to Alex Rivera
                  </div>
                  <div style={{ fontSize: 11.5, color: '#10b981', marginTop: 6, fontWeight: 600 }}>
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
            <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Coding Lab Questions</h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
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
                style={{
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <PlusCircle size={16} />
                Create New Question
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '12px 18px',
                borderRadius: 12,
              }}
            >
              <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
                <div
                  className="row"
                  style={{
                    gap: 8,
                    alignItems: 'center',
                    background: '#070d1b',
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    width: 320,
                  }}
                >
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Search by title, topic, algorithm..."
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: 13,
                      width: '100%',
                    }}
                  />
                </div>

                <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                  <span className="tiny muted">Difficulty:</span>
                  {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`btn btn-sm ${problemDifficultyFilter === d ? 'btn-primary' : 'btn-ghost'}`}
                      onClick={() => setProblemDifficultyFilter(d)}
                      style={{
                        padding: '4px 10px',
                        fontSize: 12,
                        borderRadius: 6,
                        background: problemDifficultyFilter === d ? '#7c3aed' : 'transparent',
                      }}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Problems Table */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr
                    style={{
                      background: '#070d1b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: 12,
                    }}
                  >
                    <th style={{ padding: '14px 18px' }}>Title & Description</th>
                    <th style={{ padding: '14px 14px' }}>Difficulty</th>
                    <th style={{ padding: '14px 14px' }}>Topics</th>
                    <th style={{ padding: '14px 14px' }}>Testcases</th>
                    <th style={{ padding: '14px 14px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProblems.map((prob) => {
                    const diffColor =
                      prob.difficulty === 'Easy'
                        ? '#00b8a3'
                        : prob.difficulty === 'Medium'
                          ? '#ffc01e'
                          : '#ff375f';

                    const totalTestcases =
                      (prob.sampleTestCases?.length || 0) + (prob.hiddenTestCases?.length || 0);

                    return (
                      <tr
                        key={prob.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          transition: 'background 0.15s ease',
                        }}
                      >
                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{prob.title}</div>
                          <div
                            style={{
                              fontSize: 12,
                              color: '#64748b',
                              maxWidth: 380,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {prob.description}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '3px 8px',
                              borderRadius: 12,
                              background: `${diffColor}20`,
                              color: diffColor,
                            }}
                          >
                            {prob.difficulty}
                          </span>
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <div className="row wrap" style={{ gap: 4, maxWidth: 200 }}>
                            {(prob.topics || []).map((t) => (
                              <span
                                key={t}
                                style={{
                                  fontSize: 11,
                                  background: 'rgba(255, 255, 255, 0.05)',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  color: '#cbd5e1',
                                }}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td style={{ padding: '14px 14px', color: '#94a3b8', fontSize: 12 }}>
                          {prob.sampleTestCases?.length || 0} public • {prob.hiddenTestCases?.length || 0} hidden
                        </td>

                        <td style={{ padding: '14px 14px' }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(prob.id)}
                            style={{
                              border: 'none',
                              background: prob.isPublished !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: prob.isPublished !== false ? '#34d399' : '#fbbf24',
                              padding: '4px 10px',
                              borderRadius: 12,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <span>{prob.isPublished !== false ? '● Published' : '○ Draft'}</span>
                          </button>
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                          <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              title="Preview as Student"
                              onClick={() => setPreviewingProblem(prob)}
                              style={{ padding: '5px 8px', color: '#60a5fa' }}
                            >
                              <Eye size={15} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              title="Edit Problem"
                              onClick={() => startEditProblem(prob)}
                              style={{ padding: '5px 8px', color: '#a78bfa' }}
                            >
                              <Edit size={15} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              title="Duplicate Problem"
                              onClick={() => handleDuplicateProblem(prob.id)}
                              style={{ padding: '5px 8px', color: '#94a3b8' }}
                            >
                              <Copy size={15} />
                            </button>

                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              title="Delete Problem"
                              onClick={() => setDeleteProblemConfirm(prob)}
                              style={{ padding: '5px 8px', color: '#ef4444' }}
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
          <div className="stack gap-lg animate-rise" style={{ maxWidth: 880 }}>
            <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                  {editingProblem ? `Edit Question: ${editingProblem.title}` : 'Author New Problem'}
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
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
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '22px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 14 }}>
                  1. Question Overview & Metadata
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Problem Title *
                    </label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Merge Intervals"
                      value={problemForm.title}
                      onChange={(e) => setProblemForm({ ...problemForm, title: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Difficulty Level
                    </label>
                    <select
                      className="select"
                      value={problemForm.difficulty}
                      onChange={(e) => setProblemForm({ ...problemForm, difficulty: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', width: '100%' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Topics / Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Array, Dynamic Programming, Two Pointers"
                    value={problemForm.topics}
                    onChange={(e) => setProblemForm({ ...problemForm, topics: e.target.value })}
                    style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                  />
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Problem Statement (Markdown supported) *
                  </label>
                  <textarea
                    className="textarea"
                    required
                    placeholder="Describe the task, requirements, and edge cases clearly..."
                    value={problemForm.description}
                    onChange={(e) => setProblemForm({ ...problemForm, description: e.target.value })}
                    style={{
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 110,
                      fontSize: 13.5,
                    }}
                  />
                </div>
              </div>

              {/* Card 2: Constraints & Examples */}
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '22px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 14 }}>
                  2. Input / Output & Sample Examples
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Input Format Description
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. First line contains integer array nums..."
                      value={problemForm.inputFormat}
                      onChange={(e) => setProblemForm({ ...problemForm, inputFormat: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Output Format Description
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. Return indices [i, j]..."
                      value={problemForm.outputFormat}
                      onChange={(e) => setProblemForm({ ...problemForm, outputFormat: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Constraints (one constraint per line)
                  </label>
                  <textarea
                    className="textarea"
                    placeholder="1 <= nums.length <= 10^5&#10;-10^9 <= target <= 10^9"
                    value={problemForm.constraints}
                    onChange={(e) => setProblemForm({ ...problemForm, constraints: e.target.value })}
                    style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', minHeight: 70 }}
                  />
                </div>

                <div style={{ marginTop: 12, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10 }}>
                  <div className="strong" style={{ fontSize: 13, marginBottom: 8, color: '#c4b5fd' }}>
                    Example 1
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div>
                      <label className="tiny muted">Example Input</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="nums = [2,7,11,15], target = 9"
                        value={problemForm.exampleInput}
                        onChange={(e) => setProblemForm({ ...problemForm, exampleInput: e.target.value })}
                        style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                      />
                    </div>
                    <div>
                      <label className="tiny muted">Example Output</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="[0,1]"
                        value={problemForm.exampleOutput}
                        onChange={(e) => setProblemForm({ ...problemForm, exampleOutput: e.target.value })}
                        style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                      />
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <label className="tiny muted">Example Explanation</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="Because nums[0] + nums[1] == 9, return [0, 1]."
                      value={problemForm.exampleExplanation}
                      onChange={(e) => setProblemForm({ ...problemForm, exampleExplanation: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Test Cases (Sample + Hidden) */}
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '22px 24px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 14 }}>
                  3. Test Cases (Sample Public & Hidden Evaluation Suites)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* Public Sample Testcases */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10 }}>
                    <div className="strong" style={{ fontSize: 13, marginBottom: 8, color: '#38bdf8' }}>
                      Sample Testcase 1 (Public)
                    </div>
                    <label className="tiny muted">Input (lines passed to solution)</label>
                    <textarea
                      className="textarea"
                      placeholder="[2,7,11,15]&#10;9"
                      value={problemForm.sampleInput1}
                      onChange={(e) => setProblemForm({ ...problemForm, sampleInput1: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', minHeight: 60 }}
                    />
                    <label className="tiny muted" style={{ marginTop: 8, display: 'block' }}>
                      Expected Output
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="[0,1]"
                      value={problemForm.sampleOutput1}
                      onChange={(e) => setProblemForm({ ...problemForm, sampleOutput1: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>

                  {/* Hidden Testcase */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10 }}>
                    <div className="strong" style={{ fontSize: 13, marginBottom: 8, color: '#f43f5e' }}>
                      Hidden Testcase 1 (Evaluated on Submit)
                    </div>
                    <label className="tiny muted">Input</label>
                    <textarea
                      className="textarea"
                      placeholder="[-1,-2,-3,-4]&#10;-7"
                      value={problemForm.hiddenInput1}
                      onChange={(e) => setProblemForm({ ...problemForm, hiddenInput1: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', minHeight: 60 }}
                    />
                    <label className="tiny muted" style={{ marginTop: 8, display: 'block' }}>
                      Expected Output
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="[2,3]"
                      value={problemForm.hiddenOutput1}
                      onChange={(e) => setProblemForm({ ...problemForm, hiddenOutput1: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Language-specific Starter Templates */}
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '22px 24px',
                }}
              >
                <div className="row between" style={{ alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff' }}>
                    4. Language Starter Code Templates
                  </div>
                  <div className="row" style={{ gap: 6 }}>
                    {['python', 'javascript', 'cpp', 'java'].map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        className={`btn btn-sm ${activeStarterTab === lang ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveStarterTab(lang)}
                        style={{
                          textTransform: 'uppercase',
                          fontSize: 11,
                          padding: '4px 10px',
                          background: activeStarterTab === lang ? '#7c3aed' : 'transparent',
                        }}
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
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 120,
                    }}
                  />
                )}
                {activeStarterTab === 'javascript' && (
                  <textarea
                    className="textarea"
                    value={problemForm.jsStarter}
                    onChange={(e) => setProblemForm({ ...problemForm, jsStarter: e.target.value })}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 120,
                    }}
                  />
                )}
                {activeStarterTab === 'cpp' && (
                  <textarea
                    className="textarea"
                    value={problemForm.cppStarter}
                    onChange={(e) => setProblemForm({ ...problemForm, cppStarter: e.target.value })}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 120,
                    }}
                  />
                )}
                {activeStarterTab === 'java' && (
                  <textarea
                    className="textarea"
                    value={problemForm.javaStarter}
                    onChange={(e) => setProblemForm({ ...problemForm, javaStarter: e.target.value })}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 120,
                    }}
                  />
                )}
              </div>

              {/* Publish Toggle & Submit Action */}
              <div className="row between" style={{ alignItems: 'center', marginTop: 10 }}>
                <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={problemForm.isPublished}
                    onChange={(e) => setProblemForm({ ...problemForm, isPublished: e.target.checked })}
                    style={{ width: 18, height: 18, accentColor: '#7c3aed' }}
                  />
                  <span style={{ fontSize: 14, fontWeight: 600 }}>
                    Publish to students immediately (uncheck to save as draft)
                  </span>
                </label>

                <div className="row" style={{ gap: 10 }}>
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
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    style={{ background: '#7c3aed', borderColor: '#7c3aed', fontWeight: 600 }}
                  >
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
            <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                  Predict Output Challenges
                </h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
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
                style={{
                  background: '#7c3aed',
                  borderColor: '#7c3aed',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <PlusCircle size={16} />
                {isAddingPredict ? 'Close Form' : 'Add Predict Challenge'}
              </button>
            </div>

            {/* Authoring Form if Open */}
            {isAddingPredict && (
              <form
                onSubmit={handleSavePredict}
                className="card stack gap-md"
                style={{
                  background: '#131b2e',
                  border: '1.5px solid #7c3aed',
                  borderRadius: 14,
                  padding: '24px 26px',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 16, color: '#c4b5fd' }}>
                  {editingPredict ? 'Edit Predict Challenge' : 'New Predict Output Challenge'}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Language *
                    </label>
                    <select
                      className="select"
                      value={predictForm.language}
                      onChange={(e) => setPredictForm({ ...predictForm, language: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', width: '100%' }}
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
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Question Title *
                    </label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. Closure in Loop"
                      value={predictForm.title}
                      onChange={(e) => setPredictForm({ ...predictForm, title: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>

                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Difficulty
                    </label>
                    <select
                      className="select"
                      value={predictForm.difficulty}
                      onChange={(e) => setPredictForm({ ...predictForm, difficulty: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', width: '100%' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Code Snippet (Syntax displayed to student) *
                  </label>
                  <textarea
                    className="textarea"
                    required
                    placeholder="Enter the code snippet..."
                    value={predictForm.code}
                    onChange={(e) => setPredictForm({ ...predictForm, code: e.target.value })}
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 13,
                      background: '#070d1b',
                      borderColor: '#334155',
                      color: '#ffffff',
                      minHeight: 110,
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Expected Output (Exact console output) *
                    </label>
                    <input
                      type="text"
                      className="input"
                      required
                      placeholder="e.g. 6"
                      value={predictForm.expectedOutput}
                      onChange={(e) => setPredictForm({ ...predictForm, expectedOutput: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                  <div>
                    <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                      Demo Common Wrong Answer (for guided demo)
                    </label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. 10"
                      value={predictForm.demoWrongAnswer}
                      onChange={(e) => setPredictForm({ ...predictForm, demoWrongAnswer: e.target.value })}
                      style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff' }}
                    />
                  </div>
                </div>

                <div>
                  <label className="field-label" style={{ color: '#cbd5e1', fontSize: 12 }}>
                    Step-by-step Execution Explanation *
                  </label>
                  <textarea
                    className="textarea"
                    required
                    placeholder="Explain why this snippet produces the output..."
                    value={predictForm.explanation}
                    onChange={(e) => setPredictForm({ ...predictForm, explanation: e.target.value })}
                    style={{ background: '#070d1b', borderColor: '#334155', color: '#ffffff', minHeight: 70 }}
                  />
                </div>

                <div className="row between" style={{ alignItems: 'center' }}>
                  <label className="row" style={{ gap: 8, alignItems: 'center', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={predictForm.isPublished}
                      onChange={(e) => setPredictForm({ ...predictForm, isPublished: e.target.checked })}
                      style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
                    />
                    <span style={{ fontSize: 13, color: '#cbd5e1' }}>Published to students</span>
                  </label>

                  <div className="row" style={{ gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsAddingPredict(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      style={{ background: '#7c3aed', borderColor: '#7c3aed' }}
                    >
                      {editingPredict ? 'Update Challenge' : 'Save Challenge'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Questions Table */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr
                    style={{
                      background: '#070d1b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: 12,
                    }}
                  >
                    <th style={{ padding: '14px 18px' }}>Title & Concept</th>
                    <th style={{ padding: '14px 14px' }}>Language</th>
                    <th style={{ padding: '14px 14px' }}>Difficulty</th>
                    <th style={{ padding: '14px 14px' }}>Expected Output</th>
                    <th style={{ padding: '14px 14px' }}>Status</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPredicts.map((q) => (
                    <tr
                      key={q.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{q.title}</div>
                        <div style={{ fontSize: 12, color: '#a78bfa' }}>{q.concept}</div>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 6,
                            background: 'rgba(255, 255, 255, 0.06)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {q.language}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: q.difficulty === 'Easy' ? '#00b8a3' : '#ffc01e',
                          }}
                        >
                          {q.difficulty}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px', fontFamily: 'var(--mono)', fontSize: 13, color: '#10b981' }}>
                        {q.expectedOutput}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <button
                          type="button"
                          onClick={() => handleTogglePublishPredict(q.id)}
                          style={{
                            border: 'none',
                            background: q.isPublished !== false ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            color: q.isPublished !== false ? '#34d399' : '#fbbf24',
                            padding: '3px 8px',
                            borderRadius: 10,
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          {q.isPublished !== false ? 'Published' : 'Draft'}
                        </button>
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Preview"
                            onClick={() => setPreviewingPredict(q)}
                            style={{ padding: '4px 6px', color: '#60a5fa' }}
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Edit"
                            onClick={() => {
                              setEditingPredict(q);
                              setPredictForm({ ...q });
                              setIsAddingPredict(true);
                            }}
                            style={{ padding: '4px 6px', color: '#a78bfa' }}
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            title="Delete"
                            onClick={() => handleDeletePredict(q.id)}
                            style={{ padding: '4px 6px', color: '#ef4444' }}
                          >
                            <Trash2 size={14} />
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
            <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Student Learning Progress</h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  Detailed cohort tracking: problems attempted, solve rates, language preferences, and activity logs.
                </p>
              </div>

              <div
                className="row"
                style={{
                  gap: 8,
                  alignItems: 'center',
                  background: '#131b2e',
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  width: 300,
                }}
              >
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Search students, college, branch..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: 13,
                    width: '100%',
                  }}
                />
              </div>
            </div>

            {/* Students Table */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: '#070d1b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: 12,
                    }}
                  >
                    <th style={{ padding: '14px 18px' }}>Student Profile</th>
                    <th style={{ padding: '14px 14px' }}>College & Branch</th>
                    <th style={{ padding: '14px 14px' }}>Semester</th>
                    <th style={{ padding: '14px 14px' }}>Solved / Attempted</th>
                    <th style={{ padding: '14px 14px' }}>Accuracy</th>
                    <th style={{ padding: '14px 14px' }}>Recent Activity</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stud) => (
                    <tr
                      key={stud.userId}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{stud.fullName}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{stud.email}</div>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ color: '#cbd5e1' }}>{stud.college}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{stud.branch}</div>
                      </td>
                      <td style={{ padding: '14px 14px', color: '#94a3b8' }}>
                        {stud.yearSemester || '3rd Year'}
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{ fontWeight: 700, color: '#10b981' }}>{stud.problemsSolved || 0}</span>
                        <span style={{ color: '#64748b' }}> / {stud.problemsAttempted || 0}</span>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, color: (stud.accuracy || 0) >= 75 ? '#10b981' : '#fbbf24' }}>
                            {stud.accuracy || 0}%
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 14px', maxWidth: 220, fontSize: 12, color: '#94a3b8' }}>
                        {stud.recentActivity || 'None'}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setSelectedStudentDetail(stud)}
                          style={{
                            borderRadius: 8,
                            fontSize: 12,
                            padding: '4px 10px',
                            background: 'rgba(255,255,255,0.06)',
                            color: '#ffffff',
                          }}
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
            <div className="row between wrap" style={{ gap: 12, alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Student Coding Submissions</h1>
                <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                  Real-time log of test case evaluations, runtimes, memory metrics, and submitted source code.
                </p>
              </div>

              <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                <span className="tiny muted">Verdict Filter:</span>
                {['All', 'Accepted', 'Wrong Answer', 'Compilation Error'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`btn btn-sm ${submissionFilterStatus === st ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setSubmissionFilterStatus(st)}
                    style={{
                      padding: '4px 10px',
                      fontSize: 12,
                      borderRadius: 6,
                      background: submissionFilterStatus === st ? '#7c3aed' : 'transparent',
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                overflow: 'hidden',
                padding: 0,
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr
                    style={{
                      background: '#070d1b',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      textAlign: 'left',
                      color: '#94a3b8',
                      fontSize: 12,
                    }}
                  >
                    <th style={{ padding: '14px 18px' }}>Student</th>
                    <th style={{ padding: '14px 14px' }}>Problem</th>
                    <th style={{ padding: '14px 14px' }}>Language</th>
                    <th style={{ padding: '14px 14px' }}>Status</th>
                    <th style={{ padding: '14px 14px' }}>Testcases</th>
                    <th style={{ padding: '14px 14px' }}>Runtime / Memory</th>
                    <th style={{ padding: '14px 14px' }}>Submitted At</th>
                    <th style={{ padding: '14px 18px', textAlign: 'right' }}>Code</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      }}
                    >
                      <td style={{ padding: '14px 18px', fontWeight: 600, color: '#ffffff' }}>
                        {sub.studentName}
                      </td>
                      <td style={{ padding: '14px 14px', color: '#c4b5fd' }}>{sub.problemTitle}</td>
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.06)',
                            textTransform: 'uppercase',
                          }}
                        >
                          {sub.language}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 10,
                            background: sub.status === 'Accepted' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                            color: sub.status === 'Accepted' ? '#34d399' : '#f87171',
                          }}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td style={{ padding: '14px 14px', color: '#cbd5e1' }}>
                        {sub.passedCount} / {sub.totalCount}
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: 12, color: '#94a3b8' }}>
                        {sub.runtimeMs} ms • {sub.memoryMB} MB
                      </td>
                      <td style={{ padding: '14px 14px', fontSize: 12, color: '#64748b' }}>
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setViewingSubmissionCode(sub)}
                          style={{ padding: '4px 8px', color: '#60a5fa' }}
                        >
                          <Eye size={14} style={{ marginRight: 4 }} />
                          Inspect
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
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>
                Class Learning Insights & Concept Stability
              </h1>
              <p style={{ color: '#94a3b8', fontSize: 14, marginTop: 4 }}>
                Aggregated reasoning patterns across the cohort — target teaching to common misconceptions.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Active Misconception Cases</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#f87171', margin: '6px 0 2px' }}>
                  23 Cases Detected
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Concentrated in loop boundary reasoning</div>
              </div>

              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Most Popular Language</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#60a5fa', margin: '6px 0 2px' }}>
                  Python (58%)
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Followed by C++ (26%) and Java (16%)</div>
              </div>

              <div
                className="card"
                style={{
                  background: '#131b2e',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: 14,
                  padding: '20px 22px',
                }}
              >
                <div style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Stable Core Concepts</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#34d399', margin: '6px 0 2px' }}>
                  83%
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>Variables, functions, and arrays stable</div>
              </div>
            </div>

            {/* Misconception Heatmap Breakdown */}
            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '22px 26px',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16, color: '#ffffff', marginBottom: 6 }}>
                Class Misconception Heatmap
              </div>
              <p style={{ color: '#94a3b8', fontSize: 13, margin: '0 0 16px' }}>
                Distribution of students displaying specific conceptual mental-model errors:
              </p>

              <div className="stack" style={{ gap: 14 }}>
                {[
                  { label: 'Range Endpoint Confusion', students: 14, total: 32, concept: 'Loops', pct: 44 },
                  { label: 'Mutable Default Argument Sharing', students: 9, total: 32, concept: 'Functions', pct: 28 },
                  { label: 'Pointer Post-Increment Precedence', students: 7, total: 32, concept: 'Pointers', pct: 22 },
                  { label: 'String Pool Reference vs Object Equality', students: 6, total: 32, concept: 'OOP', pct: 19 },
                  { label: 'Slice Backing Array Overwrite on Append', students: 4, total: 32, concept: 'Memory', pct: 12 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="row between" style={{ fontSize: 13.5, marginBottom: 4 }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {item.label}{' '}
                        <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 400 }}>
                          ({item.concept})
                        </span>
                      </span>
                      <span style={{ color: '#94a3b8' }}>
                        {item.students} of {item.total} students ({item.pct}%)
                      </span>
                    </div>
                    <div style={{ height: 8, background: '#070d1b', borderRadius: 4, overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${item.pct}%`,
                          background: item.pct > 30 ? '#f87171' : item.pct > 20 ? '#fbbf24' : '#60a5fa',
                          borderRadius: 4,
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
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#ffffff' }}>Faculty Account Settings</h1>

            <div
              className="card"
              style={{
                background: '#131b2e',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 14,
                padding: '24px 26px',
              }}
            >
              <div className="strong" style={{ fontSize: 15, color: '#ffffff', marginBottom: 14 }}>
                Account Information
              </div>

              <div className="stack" style={{ gap: 12, fontSize: 13.5 }}>
                <div>
                  <div className="tiny muted">Name</div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>{user?.name || 'Dr. Sarah Jenkins'}</div>
                </div>
                <div>
                  <div className="tiny muted">Faculty Email</div>
                  <div style={{ color: '#f8fafc', fontWeight: 600 }}>{user?.email || 'teacher@gmail.com'}</div>
                </div>
                <div>
                  <div className="tiny muted">Role</div>
                  <div style={{ color: '#a78bfa', fontWeight: 600 }}>Faculty / Course Instructor</div>
                </div>
                <div>
                  <div className="tiny muted">Predefined Credentials</div>
                  <div style={{ color: '#94a3b8' }}>
                    Email: <code>teacher@gmail.com</code> • Password: <code>•••••••••</code>
                  </div>
                </div>
              </div>

              <div className="divider" style={{ margin: '20px 0', borderColor: 'rgba(255,255,255,0.08)' }} />

              <button
                type="button"
                className="btn btn-secondary btn-block"
                onClick={handleLogoutClick}
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                Sign Out of Teacher Portal
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
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
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
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 18,
                padding: '28px 30px',
              }}
            >
              <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                    <h2 style={{ fontSize: 22, color: '#ffffff' }}>{previewingProblem.title}</h2>
                    <Pill tone={previewingProblem.difficulty === 'Easy' ? 'stable' : 'developing'}>
                      {previewingProblem.difficulty}
                    </Pill>
                  </div>
                  <div className="tiny muted" style={{ marginTop: 2 }}>
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

              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#cbd5e1' }}>
                <p style={{ whiteSpace: 'pre-line' }}>{previewingProblem.description}</p>

                {previewingProblem.examples?.map((ex, i) => (
                  <div
                    key={i}
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      padding: 12,
                      borderRadius: 8,
                      margin: '12px 0',
                    }}
                  >
                    <div>
                      <strong>Input:</strong> <code>{ex.input}</code>
                    </div>
                    <div>
                      <strong>Output:</strong> <code>{ex.output}</code>
                    </div>
                    {ex.explanation && (
                      <div style={{ marginTop: 4 }}>
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
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(5px)',
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
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 18,
                padding: '28px 30px',
              }}
            >
              <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 20, color: '#ffffff' }}>{previewingPredict.title}</h2>
                  <div className="tiny muted">{previewingPredict.concept}</div>
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

              <div style={{ marginTop: 14, background: 'rgba(255,255,255,0.03)', padding: 14, borderRadius: 10 }}>
                <div style={{ fontSize: 13, marginBottom: 4 }}>
                  <strong style={{ color: '#10b981' }}>Expected Output:</strong>{' '}
                  <code>{previewingPredict.expectedOutput}</code>
                </div>
                <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.5 }}>
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
              background: 'rgba(0,0,0,0.7)',
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
                background: '#0f172a',
                border: '1px solid #ef4444',
                borderRadius: 16,
                padding: '26px 28px',
                textAlign: 'center',
              }}
            >
              <Trash2 size={40} color="#ef4444" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ color: '#ffffff', marginBottom: 8 }}>Delete Question?</h3>
              <p style={{ color: '#94a3b8', fontSize: 13.5, marginBottom: 20 }}>
                Are you sure you want to permanently delete "{deleteProblemConfirm.title}"? Students will no
                longer be able to solve or submit this problem.
              </p>
              <div className="row" style={{ gap: 10, justifyContent: 'center' }}>
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
                  style={{ background: '#ef4444', borderColor: '#ef4444' }}
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
              background: 'rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            onClick={() => setSelectedStudentDetail(null)}
          >
            <div
              style={{
                width: 520,
                maxWidth: '90vw',
                height: '100%',
                background: '#0f172a',
                borderLeft: '1px solid rgba(255,255,255,0.1)',
                padding: '28px 24px',
                overflowY: 'auto',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 22, color: '#ffffff' }}>{selectedStudentDetail.fullName}</h2>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>{selectedStudentDetail.email}</div>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelectedStudentDetail(null)}
                >
                  ✕ Close
                </button>
              </div>

              <div className="stack" style={{ gap: 14 }}>
                <div style={{ background: '#131b2e', padding: 14, borderRadius: 10 }}>
                  <div className="strong" style={{ fontSize: 13, marginBottom: 8, color: '#93c5fd' }}>
                    Academic Profile
                  </div>
                  <div className="stack" style={{ gap: 6, fontSize: 12.5 }}>
                    <div>
                      <span className="muted">College:</span> {selectedStudentDetail.college}
                    </div>
                    <div>
                      <span className="muted">Degree:</span> {selectedStudentDetail.course}
                    </div>
                    <div>
                      <span className="muted">Branch:</span> {selectedStudentDetail.branch}
                    </div>
                    <div>
                      <span className="muted">Semester:</span> {selectedStudentDetail.yearSemester}
                    </div>
                    <div>
                      <span className="muted">Mobile:</span> {selectedStudentDetail.mobile}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#131b2e', padding: 14, borderRadius: 10 }}>
                  <div className="strong" style={{ fontSize: 13, marginBottom: 8, color: '#34d399' }}>
                    Coding Lab Performance
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                    <div>
                      <div className="tiny muted">Problems Solved</div>
                      <div style={{ fontSize: 18, fontWeight: 700 }}>
                        {selectedStudentDetail.problemsSolved} / {selectedStudentDetail.problemsAttempted}
                      </div>
                    </div>
                    <div>
                      <div className="tiny muted">Accuracy Rate</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981' }}>
                        {selectedStudentDetail.accuracy}%
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ background: '#131b2e', padding: 14, borderRadius: 10 }}>
                  <div className="strong" style={{ fontSize: 13, marginBottom: 6, color: '#c4b5fd' }}>
                    Skills & Interests
                  </div>
                  <div className="row wrap" style={{ gap: 6 }}>
                    {(selectedStudentDetail.skills || []).map((sk) => (
                      <span
                        key={sk}
                        style={{
                          fontSize: 11,
                          padding: '3px 8px',
                          borderRadius: 6,
                          background: 'rgba(255,255,255,0.06)',
                          color: '#f8fafc',
                        }}
                      >
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
              background: 'rgba(0,0,0,0.75)',
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
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 18,
                padding: '24px 28px',
              }}
            >
              <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h3 style={{ fontSize: 18, color: '#ffffff' }}>
                    {viewingSubmissionCode.studentName} — {viewingSubmissionCode.problemTitle}
                  </h3>
                  <div style={{ fontSize: 12, color: '#94a3b8' }}>
                    Language: <span style={{ textTransform: 'uppercase' }}>{viewingSubmissionCode.language}</span> • Status:{' '}
                    <strong
                      style={{
                        color: viewingSubmissionCode.status === 'Accepted' ? '#10b981' : '#ef4444',
                      }}
                    >
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
                className="row between"
                style={{
                  marginTop: 14,
                  fontSize: 12,
                  color: '#94a3b8',
                  background: 'rgba(255,255,255,0.03)',
                  padding: '10px 14px',
                  borderRadius: 8,
                }}
              >
                <span>Runtime: {viewingSubmissionCode.runtimeMs} ms</span>
                <span>Memory: {viewingSubmissionCode.memoryMB} MB</span>
                <span>
                  Passed: {viewingSubmissionCode.passedCount} / {viewingSubmissionCode.totalCount}
                </span>
                <span>{new Date(viewingSubmissionCode.submittedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
