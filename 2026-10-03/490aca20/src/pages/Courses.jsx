import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  BookOpen,
  Code2,
  Database,
  Brain,
  Globe2,
  Cpu,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Filter,
  PlayCircle,
  Award,
  Layers,
  Terminal,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'

const COURSES_DATA = [
  {
    id: 'dsa-fundamentals',
    title: 'DSA Fundamentals & Problem Solving',
    instructor: 'Dr. Aris Vance',
    category: 'DSA',
    difficulty: 'Intermediate',
    duration: '18h 40m',
    lessons: 32,
    progress: 75,
    rating: 4.9,
    reviews: 1420,
    icon: Code2,
    accent: '#2563eb',
    description:
      'Master fundamental arrays, two-pointers, hash maps, sliding windows, and recursion with interactive code challenges.',
    enrolled: true,
  },
  {
    id: 'python-systems',
    title: 'Python for Systems & Algorithms',
    instructor: 'Elena Rostova',
    category: 'Programming',
    difficulty: 'Beginner',
    duration: '14h 15m',
    lessons: 28,
    progress: 92,
    rating: 4.8,
    reviews: 980,
    icon: Terminal,
    accent: '#60a5fa',
    description:
      'Deep dive into Pythonic internals, loop boundary invariants, iterators, and asymptotic runtime optimization.',
    enrolled: true,
  },
  {
    id: 'fullstack-web-dev',
    title: 'Full-Stack Modern Web Engineering',
    instructor: 'Marcus Chen',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration: '26h 00m',
    lessons: 48,
    progress: 40,
    rating: 4.9,
    reviews: 2150,
    icon: Globe2,
    accent: '#1e293b',
    description:
      'Build end-to-end cloud-native microservices with React 18, Node.js, RESTful pipelines, and PostgreSQL caching.',
    enrolled: true,
  },
  {
    id: 'advanced-data-structures',
    title: 'Advanced Trees, Graphs & Dynamic Programming',
    instructor: 'Dr. Aris Vance',
    category: 'DSA',
    difficulty: 'Advanced',
    duration: '22h 30m',
    lessons: 36,
    progress: 0,
    rating: 4.9,
    reviews: 840,
    icon: Layers,
    accent: '#2563eb',
    description:
      'Tackle complex competitive programming algorithms: segment trees, Dijkstra shortest-paths, topological sorting, and DP.',
    enrolled: false,
  },
  {
    id: 'relational-database-arch',
    title: 'Relational Database Architecture & SQL Tuning',
    instructor: 'Priya Sundaram',
    category: 'Database',
    difficulty: 'Intermediate',
    duration: '12h 10m',
    lessons: 22,
    progress: 0,
    rating: 4.7,
    reviews: 630,
    icon: Database,
    accent: '#0f172a',
    description:
      'Query optimizer indexing, B-Tree vs LSM trees, transactional ACID isolation levels, and write-ahead logging.',
    enrolled: false,
  },
  {
    id: 'applied-machine-learning',
    title: 'Applied AI & Cognitive Diagnostic Models',
    instructor: 'Dr. Sarah Lin',
    category: 'AI/ML',
    difficulty: 'Advanced',
    duration: '20h 50m',
    lessons: 30,
    progress: 15,
    rating: 5.0,
    reviews: 790,
    icon: Brain,
    accent: '#60a5fa',
    description:
      'Implement Bayesian Knowledge Tracing (BKT), Item Response Theory (IRT 2PL), and Softmax error classification in EdTech.',
    enrolled: true,
  },
  {
    id: 'operating-systems-foundations',
    title: 'Computer Science: OS & Memory Models',
    instructor: 'Prof. David Thorne',
    category: 'Computer Science',
    difficulty: 'Intermediate',
    duration: '16h 00m',
    lessons: 24,
    progress: 0,
    rating: 4.8,
    reviews: 512,
    icon: Cpu,
    accent: '#1e293b',
    description:
      'Concurrency primitives, virtual memory paging, scheduling algorithms, and hardware memory barriers.',
    enrolled: false,
  },
]

const CATEGORIES = [
  'All',
  'Programming',
  'DSA',
  'Web Development',
  'Database',
  'AI/ML',
  'Computer Science',
]

export default function Courses() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterDifficulty, setFilterDifficulty] = useState('All')

  const filteredCourses = COURSES_DATA.filter((course) => {
    const matchesCat =
      selectedCategory === 'All' || course.category === selectedCategory
    const matchesDiff =
      filterDifficulty === 'All' || course.difficulty === filterDifficulty
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesCat && matchesDiff && matchesSearch
  })

  return (
    <div className="stack gap-lg">
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--navy-900) 0%, var(--navy-800) 100%)',
          borderRadius: 'var(--radius-card)',
          padding: '32px 36px',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ maxWidth: 650, position: 'relative', zIndex: 2 }}>
          <div
            className="pill blue"
            style={{
              background: 'rgba(37,99,235,0.25)',
              color: '#93c5fd',
              border: '1px solid rgba(147,197,253,0.3)',
              marginBottom: 12,
            }}
          >
            Curated Academic Curriculum
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.03em' }}>
            Explore Verified Engineering Courses
          </h1>
          <p style={{ fontSize: 15, color: '#cbd5e1', marginTop: 8, lineHeight: 1.5 }}>
            Master core computer science, algorithmic reasoning, and production software engineering
            with adaptive learning feedback and instant coding practice.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Controls */}
      <div
        className="card"
        style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          {/* Search Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'var(--surface-alt)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '8px 14px',
              flex: 1,
              minWidth: 260,
              maxWidth: 420,
            }}
          >
            <Search size={17} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search courses, topics, instructors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                fontSize: 13.5,
                color: 'var(--text)',
                width: '100%',
              }}
            />
          </div>

          {/* Difficulty Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
              Difficulty:
            </span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input"
              style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--border)',
          }}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  background: isSelected ? 'var(--navy-900)' : 'var(--surface-alt)',
                  color: isSelected ? '#ffffff' : 'var(--text-soft)',
                  border: isSelected ? '1px solid var(--navy-900)' : '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid cols-3">
        {filteredCourses.map((course) => {
          const Icon = course.icon || BookOpen
          const isInProgress = course.progress > 0

          return (
            <div key={course.id} className="course-card">
              <div>
                {/* Header row: Category & Rating */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}
                >
                  <span
                    className="pill blue"
                    style={{ fontSize: 11.5, padding: '3px 9px' }}
                  >
                    {course.category}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <span>{course.rating}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>
                      ({course.reviews})
                    </span>
                  </div>
                </div>

                {/* Course Title */}
                <h3
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: 'var(--navy-900)',
                    lineHeight: 1.35,
                    marginBottom: 8,
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                  }}
                >
                  {course.title}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                    marginBottom: 16,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {course.description}
                </p>

                {/* Meta Attributes: Instructor, Duration, Lessons */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 12,
                    color: 'var(--text-soft)',
                    marginBottom: 16,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>By {course.instructor}</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={13} color="var(--text-muted)" />
                    {course.duration}
                  </span>
                  <span>•</span>
                  <span>{course.lessons} lessons</span>
                </div>
              </div>

              {/* Progress & CTA Area */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                {isInProgress ? (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--navy-900)',
                      }}
                    >
                      <span>Course Progress</span>
                      <span style={{ color: 'var(--primary)' }}>{course.progress}% Complete</span>
                    </div>
                    <div className="course-progress-bar">
                      <div
                        className="course-progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      style={{ marginTop: 12 }}
                      onClick={() => navigate('/coding-lab')}
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
                      <span>Level: <strong>{course.difficulty}</strong></span>
                      <span>Verified Certificate</span>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary btn-block"
                      onClick={() => navigate('/coding-lab')}
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
        <Card style={{ textAlign: 'center', padding: '48px 24px' }}>
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
