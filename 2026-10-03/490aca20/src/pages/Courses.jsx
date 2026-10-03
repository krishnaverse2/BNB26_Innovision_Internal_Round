import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  BookOpen,
  Code2,
  Database,
  Globe2,
  Cpu,
  Clock,
  Star,
  ArrowRight,
  Filter,
  PlayCircle,
  Layers,
  Terminal,
  FileCode,
  Network,
  Sparkles,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { getCourses } from '../services/courseApi'

const INITIAL_COURSES = [
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    instructor: 'Dr. Aris Vance',
    category: 'DSA',
    difficulty: 'Intermediate',
    duration: '18h 40m',
    totalModules: 12,
    totalLessons: 86,
    totalPracticeQuestions: 120,
    progress: 78,
    currentTopic: 'Binary Search',
    rating: 4.9,
    reviews: 1420,
    icon: Code2,
    accent: '#2563eb',
    description:
      'Master arrays, strings, two-pointers, binary search, trees, graphs, and dynamic programming step-by-step with visual explanations and AI diagnostics.',
    enrolled: true,
  },
  {
    id: 'web-dev',
    title: 'Full-Stack Modern Web Engineering',
    instructor: 'Marcus Chen',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration: '26h 00m',
    totalModules: 10,
    totalLessons: 74,
    totalPracticeQuestions: 105,
    progress: 40,
    currentTopic: 'RESTful Microservices & Auth',
    rating: 4.9,
    reviews: 2150,
    icon: Globe2,
    accent: '#1e293b',
    description:
      'Build production cloud-native microservices with React 18, Node.js, Express, RESTful pipelines, and PostgreSQL caching.',
    enrolled: true,
  },
  {
    id: 'python',
    title: 'Python for Systems & Algorithms',
    instructor: 'Elena Rostova',
    category: 'Programming',
    difficulty: 'Beginner',
    duration: '14h 15m',
    totalModules: 8,
    totalLessons: 58,
    totalPracticeQuestions: 80,
    progress: 92,
    currentTopic: 'Generators & Memory Profiles',
    rating: 4.8,
    reviews: 980,
    icon: Terminal,
    accent: '#60a5fa',
    description:
      'Deep dive into Pythonic internals, loop boundary invariants, iterators, decorators, and asymptotic runtime optimization.',
    enrolled: true,
  },
  {
    id: 'java',
    title: 'Java Programming & OOP Mastery',
    instructor: 'Dr. Ronald Evans',
    category: 'Programming',
    difficulty: 'Intermediate',
    duration: '20h 30m',
    totalModules: 10,
    totalLessons: 68,
    totalPracticeQuestions: 95,
    progress: 0,
    currentTopic: 'JVM Memory & ClassLoaders',
    rating: 4.8,
    reviews: 1120,
    icon: FileCode,
    accent: '#2563eb',
    description:
      'Enterprise Java engineering covering JVM garbage collection internals, generics, multithreading, and Spring Boot architecture.',
    enrolled: false,
  },
  {
    id: 'cpp',
    title: 'C++ Programming & Systems Engineering',
    instructor: 'Alexander Fischer',
    category: 'Programming',
    difficulty: 'Advanced',
    duration: '24h 00m',
    totalModules: 11,
    totalLessons: 82,
    totalPracticeQuestions: 110,
    progress: 0,
    currentTopic: 'Pointers & Memory Allocation',
    rating: 4.9,
    reviews: 780,
    icon: Layers,
    accent: '#1e293b',
    description:
      'Low-level systems programming: RAII memory safety, smart pointers, templates, cache lines, and multi-core thread concurrency.',
    enrolled: false,
  },
  {
    id: 'dbms',
    title: 'Database Management & SQL Systems',
    instructor: 'Priya Sundaram',
    category: 'Database',
    difficulty: 'Intermediate',
    duration: '16h 00m',
    totalModules: 9,
    totalLessons: 62,
    totalPracticeQuestions: 88,
    progress: 0,
    currentTopic: 'Relational Algebra & Normalization',
    rating: 4.7,
    reviews: 630,
    icon: Database,
    accent: '#0f172a',
    description:
      'Relational database engines, B-Tree indices, transaction isolation levels, query optimizer cost models, and distributed replication.',
    enrolled: false,
  },
  {
    id: 'cn',
    title: 'Computer Networks & Internet Protocols',
    instructor: 'Prof. David Thorne',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    duration: '18h 20m',
    totalModules: 9,
    totalLessons: 58,
    totalPracticeQuestions: 75,
    progress: 0,
    currentTopic: 'OSI 7-Layer & TCP/IP Model',
    rating: 4.8,
    reviews: 540,
    icon: Network,
    accent: '#2563eb',
    description:
      'From physical bits to HTTP/3: routing algorithms, TCP sliding windows, congestion control, TLS 1.3 cryptography, and DNS.',
    enrolled: false,
  },
  {
    id: 'os',
    title: 'Operating Systems & Concurrency',
    instructor: 'Dr. Sarah Lin',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    duration: '19h 40m',
    totalModules: 10,
    totalLessons: 66,
    totalPracticeQuestions: 92,
    progress: 0,
    currentTopic: 'Process Lifecycle & Context Switching',
    rating: 4.9,
    reviews: 810,
    icon: Cpu,
    accent: '#1e293b',
    description:
      'Kernel architecture, process scheduling, virtual memory paging, synchronization primitives, deadlocks, and disk I/O.',
    enrolled: false,
  },
]

const CATEGORIES = [
  'All',
  'DSA',
  'Programming',
  'Web Development',
  'Database',
  'Computer Science',
]

const ICONS_MAP = {
  dsa: Code2,
  'web-dev': Globe2,
  python: Terminal,
  java: FileCode,
  cpp: Layers,
  dbms: Database,
  cn: Network,
  os: Cpu,
}

export default function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState(INITIAL_COURSES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [filterDifficulty, setFilterDifficulty] = useState('All')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await getCourses()
        if (data && data.length) {
          // Merge icons
          const merged = data.map((c) => ({
            ...c,
            icon: ICONS_MAP[c.id] || Code2,
          }))
          setCourses(merged)
        }
      } catch {
        // Retain initial courses
      }
    }
    load()
  }, [])

  // Filter courses by search query, category, and difficulty
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' || course.category === selectedCategory

    const matchesDifficulty =
      filterDifficulty === 'All' || course.difficulty === filterDifficulty

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // Open dedicated course detail page (Never redirect to generic coding lab!)
  function handleOpenCourse(courseId) {
    navigate(`/courses/${courseId}`)
  }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1400, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Header Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #070c18 0%, #0f172a 45%, #1e293b 100%)',
          color: '#ffffff',
          padding: '32px 36px',
          borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 28,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 680 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            <span
              className="pill blue"
              style={{
                background: 'rgba(37, 99, 235, 0.25)',
                color: '#93c5fd',
                border: '1px solid rgba(147, 197, 253, 0.3)',
                fontSize: 12,
                padding: '4px 10px',
              }}
            >
              <Sparkles size={13} />
              Personalized Adaptive Curriculum
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(24px, 2.5vw, 32px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.03em',
              lineHeight: 1.25,
              marginBottom: 10,
            }}
          >
            Explore Courses & Mastery Roadmaps
          </h1>

          <p style={{ fontSize: 14.5, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
            Learn step-by-step through interactive concepts, visual pointer simulations, code challenges,
            and comprehensive diagnostic assessments with AI-generated remedial video lessons.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, fontSize: 13, color: '#cbd5e1' }}>
            <div>
              <strong style={{ color: '#ffffff', fontSize: 16 }}>{courses.length}</strong> Specialized Courses
            </div>
            <span>•</span>
            <div>
              <strong style={{ color: '#ffffff', fontSize: 16 }}>
                {courses.reduce((acc, c) => acc + (c.totalModules || 10), 0)}
              </strong> Total Modules
            </div>
            <span>•</span>
            <div>
              <strong style={{ color: '#ffffff', fontSize: 16 }}>
                {courses.reduce((acc, c) => acc + (c.totalPracticeQuestions || 80), 0)}
              </strong> Practice Problems
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Search Input */}
        <div style={{ position: 'relative', flex: '1 1 320px', maxWidth: 440 }}>
          <Search
            size={18}
            color="var(--text-muted)"
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
            }}
          />
          <input
            type="text"
            placeholder="Search courses, concepts, topics, or faculty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{
              paddingLeft: 42,
              borderRadius: 12,
              background: '#ffffff',
              fontSize: 13.5,
              width: '100%',
            }}
          />
        </div>

        {/* Filter Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          {/* Difficulty Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Filter size={15} color="var(--text-muted)" />
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input"
              style={{
                padding: '8px 12px',
                fontSize: 13,
                borderRadius: 10,
                background: '#ffffff',
                border: '1px solid var(--border)',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 24,
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: 9999,
              fontSize: 13,
              fontWeight: selectedCategory === cat ? 700 : 500,
              background: selectedCategory === cat ? 'var(--navy-900)' : '#ffffff',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-soft)',
              border: '1px solid',
              borderColor: selectedCategory === cat ? 'var(--navy-900)' : 'var(--border)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: 22,
        }}
      >
        {filteredCourses.map((course) => {
          const Icon = course.icon || Code2
          const isInProgress = course.progress > 0

          return (
            <div
              key={course.id}
              className="card course-card"
              style={{
                borderRadius: 16,
                border: '1px solid var(--border)',
                background: '#ffffff',
                padding: '24px 22px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
              }}
              onClick={() => handleOpenCourse(course.id)}
            >
              <div>
                {/* Top Row: Icon + Category + Difficulty */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'var(--primary-subtle)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={22} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Pill tone="blue" style={{ fontSize: 11, padding: '3px 8px' }}>
                      {course.category}
                    </Pill>
                    <Pill
                      tone={
                        course.difficulty === 'Beginner'
                          ? 'success'
                          : course.difficulty === 'Intermediate'
                          ? 'blue'
                          : 'warning'
                      }
                      style={{ fontSize: 11, padding: '3px 8px' }}
                    >
                      {course.difficulty}
                    </Pill>
                  </div>
                </div>

                {/* Course Title */}
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--navy-900)',
                    lineHeight: 1.35,
                    marginBottom: 8,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {course.title}
                </h3>

                {/* Course Description */}
                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description}
                </p>

                {/* Meta Attributes: Instructor, Modules, Lessons, Practice Questions */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: 8,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--surface-alt)',
                    marginBottom: 16,
                    fontSize: 12,
                    textAlign: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      {course.totalModules || 10}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Modules</div>
                  </div>
                  <div style={{ borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      {course.totalLessons || 60}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Lessons</div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>
                      {course.totalPracticeQuestions || 80}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Questions</div>
                  </div>
                </div>

                {/* Instructor & Rating */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: 12,
                    color: 'var(--text-soft)',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>By {course.instructor}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={13} color="#f59e0b" fill="#f59e0b" />
                    <strong>{course.rating}</strong>
                    <span style={{ color: 'var(--text-muted)' }}>({course.reviews})</span>
                  </div>
                </div>
              </div>

              {/* Progress & Current Topic / Action Area */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {isInProgress ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--navy-900)',
                        marginBottom: 4,
                      }}
                    >
                      <span>Progress</span>
                      <span style={{ color: 'var(--primary)' }}>{course.progress}% Complete</span>
                    </div>

                    <div className="course-progress-bar" style={{ height: 6, marginBottom: 8 }}>
                      <div
                        className="course-progress-fill"
                        style={{ width: `${course.progress}%`, background: 'var(--primary)' }}
                      />
                    </div>

                    {course.currentTopic && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: 'var(--text-muted)',
                          marginBottom: 12,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <span>Current Topic:</span>
                        <strong style={{ color: 'var(--navy-900)' }}>{course.currentTopic}</strong>
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenCourse(course.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        fontWeight: 700,
                        fontSize: 13.5,
                      }}
                    >
                      <span>Continue Learning</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        color: 'var(--text-muted)',
                        marginBottom: 12,
                      }}
                    >
                      <span>Est. Duration: <strong>{course.duration}</strong></span>
                      <span>Verified Track</span>
                    </div>

                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenCourse(course.id)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '10px 16px',
                        fontSize: 13.5,
                      }}
                    >
                      <PlayCircle size={16} color="var(--primary)" />
                      <span>Start Course</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredCourses.length === 0 && (
        <Card style={{ textAlign: 'center', padding: '48px 24px', marginTop: 24 }}>
          <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 18, color: 'var(--navy-900)' }}>No courses found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Try adjusting your search query or category filter.
          </p>
          <button
            type="button"
            className="btn btn-soft"
            style={{ marginTop: 16 }}
            onClick={() => {
              setSearchQuery('')
              setSelectedCategory('All')
              setFilterDifficulty('All')
            }}
          >
            Reset Filters
          </button>
        </Card>
      )}
    </div>
  )
}
