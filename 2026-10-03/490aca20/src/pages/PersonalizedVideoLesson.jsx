import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Video,
  Award,
  BookOpen,
  MessageSquare,
  Sliders,
  Settings,
  Mic,
} from 'lucide-react'
import { Card, Pill } from '../components/ui'
import { getAiLesson } from '../services/courseApi'
import InteractiveConceptBoard from '../components/video/InteractiveConceptBoard'

export default function PersonalizedVideoLesson() {
  const { courseId, lessonId } = useParams()
  const navigate = useNavigate()

  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [sceneProgress, setSceneProgress] = useState(0) // 0 to 100%
  const [speechRate, setSpeechRate] = useState(0.92) // 0.85, 0.92, 1.05 (ideal Indian educator pace)
  const [voices, setVoices] = useState([])
  const [selectedVoice, setSelectedVoice] = useState(null)
  const [showVoiceSettings, setShowVoiceSettings] = useState(false)
  const [hasStartedAudio, setHasStartedAudio] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const data = await getAiLesson(lessonId || 'default')
        setLesson(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [lessonId])

  // Discover and prioritize Indian English voice (en-IN)
  useEffect(() => {
    function loadVoices() {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const available = window.speechSynthesis.getVoices()
        if (available && available.length) {
          const englishVoices = available.filter(
            (v) => v.lang.startsWith('en') || v.lang.includes('IN') || v.name.toLowerCase().includes('india')
          )

          // 1. Look for explicit Indian English voices
          const indianVoice = available.find(
            (v) =>
              v.lang.toLowerCase() === 'en-in' ||
              v.lang.toLowerCase().replace('_', '-').startsWith('en-in') ||
              v.name.toLowerCase().includes('india') ||
              v.name.toLowerCase().includes('heera') ||
              v.name.toLowerCase().includes('ravi') ||
              v.name.toLowerCase().includes('neerja') ||
              v.name.toLowerCase().includes('veena')
          )

          // Sort voices placing Indian voices at the very top
          const sorted = [...englishVoices].sort((a, b) => {
            const aIsInd =
              a.lang.toLowerCase().includes('in') ||
              a.name.toLowerCase().includes('india') ||
              a.name.toLowerCase().includes('heera')
            const bIsInd =
              b.lang.toLowerCase().includes('in') ||
              b.name.toLowerCase().includes('india') ||
              b.name.toLowerCase().includes('heera')
            if (aIsInd && !bIsInd) return -1
            if (!aIsInd && bIsInd) return 1
            return 0
          })

          setVoices(sorted.length ? sorted : available)

          // Set default voice (Indian English first, or natural English fallback)
          const preferred =
            indianVoice ||
            available.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural'))) ||
            available.find((v) => v.lang.startsWith('en')) ||
            available[0]

          setSelectedVoice(preferred)
        }
      }
    }

    loadVoices()
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices
    }
  }, [])

  // Auto-advance timer when playing
  useEffect(() => {
    let interval = null
    if (isPlaying && lesson?.scenes) {
      const scene = lesson.scenes[currentSceneIndex]
      const durationSec = scene?.durationSec || 9
      const stepMs = 100
      const increment = (stepMs / (durationSec * 1000)) * 100

      interval = setInterval(() => {
        setSceneProgress((prev) => {
          if (prev >= 100) {
            if (currentSceneIndex < lesson.scenes.length - 1) {
              setCurrentSceneIndex((c) => c + 1)
              return 0
            } else {
              setIsPlaying(false)
              return 100
            }
          }
          return prev + increment
        })
      }, stepMs)
    }
    return () => clearInterval(interval)
  }, [isPlaying, currentSceneIndex, lesson])

  // Clear speech synthesis & conversation narration with Indian English accent
  useEffect(() => {
    if (isPlaying && !isMuted && typeof window !== 'undefined' && window.speechSynthesis && lesson?.scenes) {
      const scene = lesson.scenes[currentSceneIndex]
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(scene.narration)
      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
      utterance.rate = speechRate
      utterance.pitch = 1.0

      utterance.onend = () => {
        // finished speaking current scene
      }

      window.speechSynthesis.speak(utterance)
    } else if (!isPlaying && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isPlaying, currentSceneIndex, isMuted, speechRate, selectedVoice, lesson])

  function handlePlayToggle() {
    setHasStartedAudio(true)
    setIsPlaying(!isPlaying)
  }

  function handleSelectScene(idx) {
    setHasStartedAudio(true)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setCurrentSceneIndex(idx)
    setSceneProgress(0)
    setIsPlaying(true)
  }

  function handleReplayCurrentScene() {
    setHasStartedAudio(true)
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setSceneProgress(0)
    setIsPlaying(true)
  }

  function handleTestVoice() {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
      const sample = new SpeechSynthesisUtterance(
        'Namaste Alex! Let us understand Binary Search and pointer movement step by step. Look at the animated searching elements on your screen.'
      )
      if (selectedVoice) sample.voice = selectedVoice
      sample.rate = speechRate
      sample.pitch = 1.0
      window.speechSynthesis.speak(sample)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="spin" style={{ width: 38, height: 38, margin: '0 auto 16px' }} />
        <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Loading animated DSA searching lesson...
        </div>
      </div>
    )
  }

  const scenes = lesson?.scenes || []
  const activeScene = scenes[currentSceneIndex] || scenes[0]

  // Words array for live karaoke-style word highlighting
  const narrationWords = (activeScene?.narration || '').split(' ')
  const activeWordIndex = Math.min(
    narrationWords.length - 1,
    Math.floor((sceneProgress / 100) * narrationWords.length)
  )

  const isIndianVoiceSelected =
    selectedVoice?.lang?.toLowerCase()?.includes('in') ||
    selectedVoice?.name?.toLowerCase()?.includes('india') ||
    selectedVoice?.name?.toLowerCase()?.includes('heera') ||
    selectedVoice?.name?.toLowerCase()?.includes('ravi')

  return (
    <div style={{ padding: '24px 32px', maxWidth: 1360, margin: '0 auto', boxSizing: 'border-box' }}>
      {/* Breadcrumb Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          color: 'var(--text-muted)',
          marginBottom: 16,
        }}
      >
        <Link to={`/courses/${courseId || 'dsa'}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
          Course Detail
        </Link>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>Animated DSA Searching Lesson</span>
      </div>

      {/* Lesson Header Title & Indian English Voice Settings */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <span
              className="pill blue"
              style={{
                background: 'rgba(37, 99, 235, 0.1)',
                color: 'var(--primary)',
                fontSize: 12,
                padding: '3px 10px',
                fontWeight: 700,
              }}
            >
              <Sparkles size={12} />
              AI Cognitive Remediation • Animated Concept Simulation
            </span>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--navy-900)', margin: '0 0 6px' }}>
            {lesson?.title || 'Binary Search — Pointer Movement'}
          </h1>

          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', margin: 0 }}>
            {lesson?.whyGenerated || 'Generated from your specific assessment mistake pattern.'}
          </p>
        </div>

        {/* Voice & Speed Bar with Indian English Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#ffffff',
            padding: '6px 14px',
            borderRadius: 12,
            border: '1px solid var(--border)',
          }}
        >
          <span
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              color: isIndianVoiceSelected ? '#16a34a' : 'var(--text-muted)',
              background: isIndianVoiceSelected ? '#f0fdf4' : 'transparent',
              padding: '2px 6px',
              borderRadius: 6,
            }}
          >
            🇮🇳 {isIndianVoiceSelected ? 'Indian English' : 'Voice'}
          </span>

          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Speed:</span>
          {[0.85, 0.92, 1.05].map((rate) => (
            <button
              key={rate}
              type="button"
              onClick={() => setSpeechRate(rate)}
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                fontSize: 11.5,
                fontWeight: speechRate === rate ? 700 : 500,
                background: speechRate === rate ? 'var(--primary)' : 'transparent',
                color: speechRate === rate ? '#ffffff' : 'var(--text-soft)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {rate}x
            </button>
          ))}

          <button
            type="button"
            onClick={() => setShowVoiceSettings(!showVoiceSettings)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 8px',
              borderRadius: 6,
              background: showVoiceSettings ? 'var(--primary-subtle)' : 'transparent',
              color: showVoiceSettings ? 'var(--primary)' : 'var(--text-soft)',
              border: 'none',
              cursor: 'pointer',
              fontSize: 11.5,
              fontWeight: 600,
            }}
            title="Configure Voice & Accent"
          >
            <Settings size={13} />
            <span>Voice Options</span>
          </button>
        </div>
      </div>

      {/* Voice Customization Drawer */}
      {showVoiceSettings && (
        <Card style={{ padding: '16px 20px', borderRadius: 14, marginBottom: 20, background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mic size={18} color="var(--primary)" />
              <div>
                <strong style={{ fontSize: 13, color: 'var(--navy-900)' }}>
                  Selected Accent & Voice: {selectedVoice?.name || 'Default Voice'}
                </strong>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {isIndianVoiceSelected
                    ? '🇮🇳 Indian English Accent is active for crystal-clear pedagogical explanation.'
                    : 'Select an Indian English voice below for authentic regional pronunciation.'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <select
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const v = voices.find((item) => item.name === e.target.value)
                  if (v) setSelectedVoice(v)
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  fontSize: 12,
                  background: '#ffffff',
                  color: 'var(--navy-900)',
                  maxWidth: 300,
                  fontWeight: 500,
                }}
              >
                {voices.map((v) => {
                  const isInd =
                    v.lang.toLowerCase().includes('in') ||
                    v.name.toLowerCase().includes('india') ||
                    v.name.toLowerCase().includes('heera')
                  return (
                    <option key={v.name} value={v.name}>
                      {isInd ? `🇮🇳 ${v.name} (${v.lang})` : `${v.name} (${v.lang})`}
                    </option>
                  )
                })}
              </select>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleTestVoice}
                style={{ padding: '6px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Volume2 size={14} />
                <span>Test Voice</span>
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ============================================================
          MAIN FULL-WIDTH ANIMATED TEACHING STAGE (NO TEACHER AVATAR)
          ============================================================ */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #070c18 0%, #0f172a 45%, #182235 100%)',
          borderRadius: 20,
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 18px 52px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          marginBottom: 24,
          position: 'relative',
        }}
      >
        {/* Stage Top Bar: Scene Indicator & Sound Controls */}
        <div
          style={{
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: isPlaying ? '#22c55e' : '#f59e0b',
                boxShadow: isPlaying ? '0 0 10px #22c55e' : 'none',
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>
              SCENE {activeScene.sceneNumber}: {activeScene.title}
            </span>
            <span style={{ fontSize: 11.5, color: '#94a3b8' }}>• Duration: {activeScene.durationSec}s</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                borderRadius: 8,
                padding: '5px 10px',
                color: isMuted ? '#f87171' : '#60a5fa',
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 600,
              }}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
              <span>{isMuted ? 'Voice Muted' : 'Indian English Voice On'}</span>
            </button>
          </div>
        </div>

        {/* Full-Width Animated Teaching Canvas (No teacher cartoon, all animated concepts) */}
        <div
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 460,
          }}
        >
          <InteractiveConceptBoard
            sceneIndex={currentSceneIndex}
            sceneData={activeScene}
            studentName="Krishna Sonawane"
            courseTitle="Data Structures & Algorithms"
            onPracticeAgain={() => navigate(`/courses/${courseId || 'dsa'}/practice-again/gap-bs-01`)}
          />
        </div>

        {/* Initial Click-to-Start Audio Overlay for Browser Autoplay Policy */}
        {!hasStartedAudio && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(7, 12, 24, 0.8)',
              backdropFilter: 'blur(5px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 30,
            }}
          >
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.95)',
                border: '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: 20,
                padding: '30px 40px',
                textAlign: 'center',
                maxWidth: 480,
                boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 24px rgba(37,99,235,0.6)',
                }}
              >
                <Play size={28} color="#ffffff" style={{ marginLeft: 3 }} />
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                Start Animated DSA Searching Lesson
              </h3>

              <p style={{ fontSize: 13.5, color: '#cbd5e1', lineHeight: 1.5, marginBottom: 22 }}>
                Watch animated searching elements in motion with clear Indian English educator voice and real-time concept demonstrations.
              </p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePlayToggle}
                style={{
                  padding: '12px 28px',
                  fontSize: 14.5,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 4px 18px rgba(37,99,235,0.5)',
                }}
              >
                <span>Play with Indian Voice (🇮🇳)</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            BOTTOM STAGE: Clear Conversation Subtitle & Live Audio Controls
            ============================================================ */}
        <div
          style={{
            padding: '16px 24px',
            background: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Subtitle Narration Box with High-Contrast Clear Text & Word Karaoke Sync */}
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              border: '1.5px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 14,
              padding: '14px 20px',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <div
              style={{
                borderRadius: 8,
                background: 'linear-gradient(135deg, #1e40af, #2563eb)',
                color: '#ffffff',
                fontSize: 10.5,
                fontWeight: 800,
                padding: '6px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
                flexShrink: 0,
                boxShadow: '0 0 10px rgba(37,99,235,0.4)',
                letterSpacing: '0.04em',
              }}
            >
              <span>🇮🇳 AI TUTOR</span>
            </div>

            <div
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: '#f8fafc',
                fontWeight: 500,
                letterSpacing: '0.01em',
                flex: 1,
              }}
            >
              "{narrationWords.map((word, wIdx) => {
                const isCurrentWord = isPlaying && wIdx === activeWordIndex
                const isPastWord = isPlaying && wIdx < activeWordIndex

                return (
                  <span
                    key={wIdx}
                    style={{
                      display: 'inline-block',
                      marginRight: 4,
                      color: isCurrentWord
                        ? '#38bdf8'
                        : isPastWord
                        ? '#ffffff'
                        : '#94a3b8',
                      fontWeight: isCurrentWord ? 800 : 500,
                      background: isCurrentWord ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
                      padding: isCurrentWord ? '0 4px' : '0',
                      borderRadius: 3,
                      transition: 'all 0.15s ease',
                      textShadow: isCurrentWord ? '0 0 10px rgba(56, 189, 248, 0.9)' : 'none',
                    }}
                  >
                    {word}
                  </span>
                )
              })}"
            </div>
          </div>

          {/* Scrubber Progress Bar */}
          <div
            style={{
              height: 6,
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: 3,
              marginBottom: 14,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const pos = (e.clientX - rect.left) / rect.width
              setSceneProgress(pos * 100)
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${sceneProgress}%`,
                background: 'linear-gradient(90deg, #2563eb, #38bdf8)',
                transition: 'width 0.1s linear',
              }}
            />
          </div>

          {/* Media Playback Controls Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                onClick={handlePlayToggle}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
                  transition: 'transform 0.1s ease',
                }}
              >
                {isPlaying ? <Pause size={19} /> : <Play size={19} style={{ marginLeft: 2 }} />}
              </button>

              <button
                type="button"
                onClick={handleReplayCurrentScene}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  borderRadius: 10,
                  padding: '8px 12px',
                  color: '#e2e8f0',
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                title="Replay this scene and audio"
              >
                <RotateCcw size={15} />
                <span>Replay Scene</span>
              </button>
            </div>

            {/* Scene Stepper Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                disabled={currentSceneIndex === 0}
                onClick={() => handleSelectScene(Math.max(0, currentSceneIndex - 1))}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.08)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  cursor: currentSceneIndex === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentSceneIndex === 0 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <ChevronLeft size={16} />
                <span>Previous Scene</span>
              </button>

              <button
                type="button"
                disabled={currentSceneIndex === scenes.length - 1}
                onClick={() => handleSelectScene(Math.min(scenes.length - 1, currentSceneIndex + 1))}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: currentSceneIndex === scenes.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentSceneIndex === scenes.length - 1 ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>Next Scene</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Cards: Practice Again CTA & Scene Playlist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(320px, 1fr)', gap: 24 }}>
        {/* Practice Again & Resolution Card */}
        <Card style={{ padding: '28px 32px', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'var(--primary-subtle)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                Next Pedagogical Step: Practice Again
              </h3>
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 2 }}>
                Prove your understanding on freshly generated diagnostic questions
              </div>
            </div>
          </div>

          <p style={{ fontSize: 14, color: 'var(--text-soft)', lineHeight: 1.6, marginBottom: 20 }}>
            Now that you have visually seen why <code>low = mid + 1</code> is mathematically required,
            solve 3 targeted questions to measure your concept improvement score.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate(`/courses/${courseId || 'dsa'}/practice-again/gap-bs-01`)}
              style={{
                padding: '12px 24px',
                fontSize: 14.5,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Practice Again</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(`/courses/${courseId || 'dsa'}`)}
              style={{ padding: '12px 18px', fontSize: 13.5 }}
            >
              Mark as Understood & Return
            </button>
          </div>
        </Card>

        {/* 10-Scene Curriculum Playlist */}
        <Card style={{ padding: '22px 24px', borderRadius: 16 }}>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: 'var(--navy-900)', marginBottom: 14 }}>
            Lesson Scenes ({scenes.length})
          </h4>

          <div className="stack gap-xs" style={{ maxHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
            {scenes.map((s, idx) => {
              const isActive = idx === currentSceneIndex

              return (
                <div
                  key={s.sceneNumber}
                  onClick={() => handleSelectScene(idx)}
                  style={{
                    padding: '9px 12px',
                    borderRadius: 10,
                    background: isActive ? 'var(--primary-subtle)' : 'var(--surface-alt)',
                    border: isActive ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: isActive ? 'var(--primary)' : 'var(--navy-900)',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {s.sceneNumber}
                  </span>

                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 12.5,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? 'var(--primary-hover)' : 'var(--navy-900)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {s.title}
                    </div>
                  </div>

                  {isActive && <Play size={11} color="var(--primary)" fill="var(--primary)" />}
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
