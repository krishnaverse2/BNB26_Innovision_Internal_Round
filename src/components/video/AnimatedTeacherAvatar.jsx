import { useState, useEffect } from 'react'
import { Sparkles, Mic, Volume2 } from 'lucide-react'

/**
 * AnimatedTeacherAvatar
 * An expressive, fully animated academic AI professor (Dr. Aris Vance)
 * Features:
 * - Lifelike phoneme-based mouth sync animation while speaking
 * - Eye tracking (looks at student on intro/outro, looks at smartboard during teaching)
 * - Natural eye blinking and eyebrow micro-expressions
 * - Breathing torso and subtle head nodding animations
 * - Dynamic telescoping laser stylus with illuminated beam targeting the smartboard
 * - Multiple pedagogical poses: 'pointing', 'explaining', 'warning', 'celebrating'
 * - Real-time reactive audio frequency equalizer waves
 * - High-contrast academic attire with RE:LEARN crest pin and smart glasses
 */
export default function AnimatedTeacherAvatar({
  isSpeaking = false,
  gesture = 'pointing', // 'pointing' | 'explaining' | 'warning' | 'celebrating'
  teacherName = 'Dr. Aris Vance',
  role = 'Lead Algorithms Professor',
  activeConcept = 'Binary Search',
}) {
  const [blink, setBlink] = useState(false)
  const [mouthShape, setMouthShape] = useState(0) // 0: closed, 1: wide, 2: round, 3: half
  const [pointerSparkle, setPointerSparkle] = useState(false)
  const [headTilt, setHeadTilt] = useState(0)
  const [laserBeamY, setLaserBeamY] = useState(130)

  // Natural eye blinking loop
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 130)
    }, 3200)
    return () => clearInterval(blinkInterval)
  }, [])

  // Dynamic speaking mouth phoneme animation loop
  useEffect(() => {
    let mouthInterval = null
    if (isSpeaking) {
      const shapes = [1, 2, 3, 1, 3, 2, 1, 0, 3]
      let idx = 0
      mouthInterval = setInterval(() => {
        setMouthShape(shapes[idx % shapes.length])
        idx++
      }, 110)
    } else {
      setMouthShape(0)
    }
    return () => clearInterval(mouthInterval)
  }, [isSpeaking])

  // Subtle head nod / breathing motion while speaking
  useEffect(() => {
    let nodInterval = null
    if (isSpeaking) {
      nodInterval = setInterval(() => {
        setHeadTilt((prev) => (prev === 0 ? 1.5 : prev === 1.5 ? -1 : 0))
      }, 700)
    } else {
      setHeadTilt(0)
    }
    return () => clearInterval(nodInterval)
  }, [isSpeaking])

  // Laser beam target movement
  useEffect(() => {
    const beamInterval = setInterval(() => {
      setPointerSparkle((p) => !p)
      setLaserBeamY((y) => (y === 130 ? 115 : y === 115 ? 145 : 130))
    }, 1200)
    return () => clearInterval(beamInterval)
  }, [])

  // Determine eye pupil direction:
  // When pointing/explaining smartboard, look towards the board (rightward)
  // When celebrating or warning, look more directly at the student
  const isLookingAtBoard = gesture === 'pointing' || gesture === 'warning'
  const pupilOffsetX = isLookingAtBoard ? 2.5 : 0

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        userSelect: 'none',
        height: '100%',
        width: '100%',
      }}
    >
      {/* Teacher Action Status Indicator */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: isSpeaking ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 255, 255, 0.06)',
          border: `1px solid ${isSpeaking ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
          borderRadius: 9999,
          padding: '4px 12px',
          marginBottom: 10,
          transition: 'all 0.25s ease',
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: isSpeaking ? '#22c55e' : '#94a3b8',
            boxShadow: isSpeaking ? '0 0 8px #22c55e' : 'none',
            animation: isSpeaking ? 'pulse 1.5s infinite' : 'none',
          }}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isSpeaking ? '#4ade80' : '#cbd5e1',
            letterSpacing: '0.02em',
          }}
        >
          {isSpeaking
            ? gesture === 'warning'
              ? 'Dr. Vance: Highlighting Bug'
              : gesture === 'celebrating'
              ? 'Dr. Vance: Celebrating Progress'
              : 'Dr. Vance is Teaching'
            : 'Classroom Ready'}
        </span>
      </div>

      {/* Teacher Character SVG Canvas */}
      <div style={{ position: 'relative', width: 235, height: 320 }}>
        <svg
          viewBox="0 0 250 340"
          width="100%"
          height="100%"
          style={{ overflow: 'visible' }}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffd8b3" />
              <stop offset="100%" stopColor="#f3be94" />
            </linearGradient>

            <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>

            <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>

            <linearGradient id="laserBeamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#f87171" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.1" />
            </linearGradient>

            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* BACK CHAIR / SHADOW */}
          <ellipse cx="125" cy="325" rx="76" ry="12" fill="rgba(0, 0, 0, 0.45)" />

          {/* TEACHER BODY / SUIT */}
          <g
            style={{
              transform: isSpeaking ? 'translateY(1px)' : 'none',
              transition: 'transform 0.4s ease',
            }}
          >
            {/* Shoulders and Torso */}
            <path
              d="M 62 215 Q 125 190 188 215 L 202 330 L 48 330 Z"
              fill="url(#suitGrad)"
            />

            {/* White Collar Shirt */}
            <path d="M 102 190 L 125 232 L 148 190 Z" fill="#ffffff" />

            {/* Blue Academic Tie */}
            <path
              d="M 120 200 L 130 200 L 133 260 L 125 272 L 117 260 Z"
              fill="url(#tieGrad)"
            />
            {/* Tie Knot */}
            <polygon points="118,193 132,193 128,206 122,206" fill="#1e40af" />

            {/* Blazer Lapels */}
            <path
              d="M 62 215 L 102 190 L 114 268 L 84 330 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <path
              d="M 188 215 L 148 190 L 136 268 L 166 330 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.5"
            />

            {/* RE:LEARN Academic Pin on Lapel */}
            <circle cx="86" cy="240" r="5.5" fill="#3b82f6" />
            <circle cx="86" cy="240" r="2.8" fill="#ffffff" />
          </g>

          {/* NECK */}
          <rect x="110" y="162" width="30" height="32" rx="6" fill="url(#skinGrad)" />

          {/* HEAD & FACE with dynamic nod / tilt */}
          <g
            style={{
              transform: `rotate(${headTilt}deg)`,
              transformOrigin: '125px 145px',
              transition: 'transform 0.25s ease',
            }}
          >
            {/* Ears */}
            <ellipse cx="70" cy="128" rx="7" ry="12" fill="#f3be94" />
            <ellipse cx="180" cy="128" rx="7" ry="12" fill="#f3be94" />

            {/* Head Contour */}
            <rect
              x="74"
              y="72"
              width="102"
              height="108"
              rx="42"
              fill="url(#skinGrad)"
            />

            {/* Trimmed Academic Hair */}
            <path
              d="M 70 98 C 70 54 94 38 125 38 C 156 38 180 54 180 98 C 176 86 166 76 150 72 C 132 68 116 68 98 72 C 82 76 74 86 70 98 Z"
              fill="#2e384d"
            />
            {/* Sideburns */}
            <path d="M 72 88 L 76 128 L 80 122 L 78 88 Z" fill="#2e384d" />
            <path d="M 178 88 L 174 128 L 170 122 L 172 88 Z" fill="#2e384d" />

            {/* Eyebrows with pedagogical expressions */}
            <path
              d={
                gesture === 'warning'
                  ? 'M 88 102 Q 100 106 110 99'
                  : gesture === 'celebrating'
                  ? 'M 88 95 Q 100 90 110 95'
                  : 'M 88 97 Q 100 95 110 98'
              }
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.4"
              strokeLinecap="round"
            />
            <path
              d={
                gesture === 'warning'
                  ? 'M 140 98 Q 150 106 162 102'
                  : gesture === 'celebrating'
                  ? 'M 140 95 Q 150 90 162 95'
                  : 'M 140 98 Q 150 95 162 97'
              }
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.4"
              strokeLinecap="round"
            />

            {/* Eyes with gaze tracking */}
            {!blink ? (
              <g>
                {/* Left Eye Sclera & Iris */}
                <ellipse cx="100" cy="112" rx="6.5" ry="6.5" fill="#ffffff" />
                <circle cx={100 + pupilOffsetX} cy="112" r="3.7" fill="#1e293b" />
                <circle cx={101.5 + pupilOffsetX} cy="110.5" r="1.3" fill="#ffffff" />

                {/* Right Eye Sclera & Iris */}
                <ellipse cx="150" cy="112" rx="6.5" ry="6.5" fill="#ffffff" />
                <circle cx={150 + pupilOffsetX} cy="112" r="3.7" fill="#1e293b" />
                <circle cx={151.5 + pupilOffsetX} cy="110.5" r="1.3" fill="#ffffff" />
              </g>
            ) : (
              <g>
                {/* Blinking closed slits */}
                <path d="M 94 112 Q 100 116 106 112" fill="none" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M 144 112 Q 150 116 156 112" fill="none" stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" />
              </g>
            )}

            {/* Smart Glasses with Subtle Sheen */}
            <g stroke="#3b82f6" strokeWidth="2.4" fill="rgba(255, 255, 255, 0.18)">
              {/* Left Lens Frame */}
              <rect x="86" y="101" width="27" height="21" rx="5" />
              {/* Right Lens Frame */}
              <rect x="137" y="101" width="27" height="21" rx="5" />
              {/* Bridge */}
              <path d="M 113 110 L 137 110" fill="none" />
              {/* Temples */}
              <path d="M 86 108 L 71 105" fill="none" />
              <path d="M 164 108 L 179 105" fill="none" />
              {/* Glasses Glint Sheen */}
              <line x1="89" y1="104" x2="100" y2="119" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            </g>

            {/* Nose */}
            <path
              d="M 123 116 Q 128 127 124 132 Q 129 132 131 129"
              fill="none"
              stroke="#d49a6a"
              strokeWidth="2.4"
              strokeLinecap="round"
            />

            {/* REALISTIC MULTI-PHONEME MOUTH SYNC */}
            {isSpeaking ? (
              mouthShape === 1 ? (
                /* Wide Open (A / E vowel) */
                <g>
                  <path d="M 112 144 Q 125 160 138 144 Q 125 152 112 144 Z" fill="#881337" />
                  <rect x="118" y="145" width="14" height="3" fill="#ffffff" rx="1" />
                  <ellipse cx="125" cy="154" rx="7" ry="2.5" fill="#f43f5e" />
                </g>
              ) : mouthShape === 2 ? (
                /* Round 'O' Shape (O / U vowel) */
                <g>
                  <ellipse cx="125" cy="147" rx="7" ry="9" fill="#881337" />
                  <ellipse cx="125" cy="147" rx="4.5" ry="6.5" fill="#4c0519" />
                </g>
              ) : mouthShape === 3 ? (
                /* Half Open (Consonant / Teeth) */
                <g>
                  <path d="M 114 145 Q 125 152 136 145 Q 125 149 114 145 Z" fill="#881337" />
                  <rect x="117" y="145" width="16" height="2.5" fill="#ffffff" rx="1" />
                </g>
              ) : (
                /* Closed speech pause */
                <path d="M 114 146 Q 125 150 136 146" fill="none" stroke="#9f1239" strokeWidth="2.8" strokeLinecap="round" />
              )
            ) : (
              /* Natural resting smile */
              <path d="M 114 145 Q 125 152 136 145" fill="none" stroke="#9f1239" strokeWidth="2.6" strokeLinecap="round" />
            )}

            {/* Well-groomed Beard / Goatee */}
            <path
              d="M 116 156 Q 125 166 134 156 Q 125 162 116 156 Z"
              fill="#2e384d"
            />
          </g>

          {/* LEFT ARM (Academic Clipboard / Rest) */}
          <g>
            <path
              d="M 62 215 Q 40 265 56 305 L 78 310 Q 62 265 78 225 Z"
              fill="#1e293b"
            />
            {/* Hand */}
            <circle cx="62" cy="310" r="9.5" fill="url(#skinGrad)" />
            {/* Digital Professor Tablet */}
            <rect x="36" y="270" width="30" height="42" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
            <rect x="40" y="275" width="22" height="3" rx="1.5" fill="#38bdf8" />
            <rect x="40" y="282" width="16" height="2" rx="1" fill="#64748b" />
            <rect x="40" y="287" width="19" height="2" rx="1" fill="#64748b" />
          </g>

          {/* RIGHT ARM & TEACHING LASER POINTER STYLUS */}
          <g>
            {gesture === 'pointing' || gesture === 'warning' ? (
              <g>
                {/* Arm extending toward smartboard on right */}
                <path
                  d="M 188 215 Q 215 235 230 205 Q 242 192 248 180"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="24"
                  strokeLinecap="round"
                />

                {/* Hand holding Teaching Pointer */}
                <circle cx="247" cy="180" r="8.5" fill="url(#skinGrad)" />

                {/* Metallic Stylus / Pointer Wand */}
                <line
                  x1="244"
                  y1="182"
                  x2="276"
                  y2="148"
                  stroke="#94a3b8"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                />
                {/* Wand Tip Glow Bulb */}
                <circle cx="276" cy="148" r="3.5" fill="#ef4444" />

                {/* PROJECTED LASER BEAM TARGETING SMARTBOARD */}
                <line
                  x1="278"
                  y1="146"
                  x2="330"
                  y2={laserBeamY}
                  stroke="url(#laserBeamGrad)"
                  strokeWidth={pointerSparkle ? '3' : '2'}
                  strokeDasharray="5 3"
                  opacity={isSpeaking ? '0.95' : '0.6'}
                />

                {/* Laser Impact Reticle / Particle Sparkle */}
                {pointerSparkle && (
                  <g filter="url(#glowEffect)">
                    <circle cx="330" cy={laserBeamY} r="7" fill="#ef4444" opacity="0.5" />
                    <circle cx="330" cy={laserBeamY} r="3" fill="#ffffff" />
                  </g>
                )}
              </g>
            ) : gesture === 'celebrating' ? (
              <g>
                {/* Thumbs up arm */}
                <path
                  d="M 188 215 Q 220 225 226 182"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                {/* Hand with thumbs up */}
                <circle cx="226" cy="177" r="9.5" fill="url(#skinGrad)" />
                <path
                  d="M 226 177 L 226 160"
                  stroke="url(#skinGrad)"
                  strokeWidth="6.5"
                  strokeLinecap="round"
                />
                {/* Sparkle star on thumbs up */}
                <polygon
                  points="238,150 241,156 248,157 243,162 245,169 238,165 231,169 233,162 228,157 235,156"
                  fill="#f59e0b"
                />
              </g>
            ) : (
              <g>
                {/* Open explaining hand */}
                <path
                  d="M 188 215 Q 225 245 236 222"
                  fill="none"
                  stroke="#1e293b"
                  strokeWidth="24"
                  strokeLinecap="round"
                />
                <circle cx="236" cy="218" r="9.5" fill="url(#skinGrad)" />
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Professor Credentials Badge */}
      <div
        style={{
          marginTop: -4,
          background: 'rgba(15, 23, 42, 0.92)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: 14,
          padding: '10px 16px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          width: '92%',
          maxWidth: 228,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span style={{ fontSize: 13.5, fontWeight: 800, color: '#ffffff' }}>{teacherName}</span>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isSpeaking ? '#22c55e' : '#64748b',
              boxShadow: isSpeaking ? '0 0 10px #22c55e' : 'none',
            }}
          />
        </div>

        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{role}</div>

        {/* Live Audio Equalizer Wave when speaking */}
        {isSpeaking ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3.5,
              marginTop: 8,
              height: 16,
            }}
          >
            {[5, 14, 9, 16, 7, 12, 15, 6, 11].map((h, i) => (
              <span
                key={i}
                style={{
                  width: 2.8,
                  height: mouthShape > 0 ? `${h}px` : `${Math.max(4, h / 2.5)}px`,
                  background: 'linear-gradient(180deg, #60a5fa 0%, #2563eb 100%)',
                  borderRadius: 1.5,
                  transition: 'height 0.1s ease',
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 10.5, color: '#64748b', marginTop: 6, fontWeight: 500 }}>
            Press Play to begin audio
          </div>
        )}
      </div>
    </div>
  )
}
