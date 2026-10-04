import { useEffect, useState } from 'react'

/**
 * InteractiveMascot
 * Professional 2D developer/student character with mouse-tracking eyes,
 * lo-fi headphone soundwaves, laptop typing effects, and reactive state animations.
 */
export default function InteractiveMascot({
  state = 'idle', // 'idle' | 'focus-email' | 'focus-password' | 'typing-password' | 'hover-submit' | 'success'
  isCompact = false,
  showPassword = false,
}) {
  const [blink, setBlink] = useState(false)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 })
  const [clicked, setClicked] = useState(false)

  // Gentle random blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 160)
    }, 3600)
    return () => clearInterval(interval)
  }, [])

  // Smooth mouse tracking for eyes when in idle state
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (state === 'idle') {
        const x = ((e.clientX / window.innerWidth) - 0.5) * 5
        const y = ((e.clientY / window.innerHeight) - 0.5) * 3.5
        setMouseOffset({ x, y })
      }
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [state])

  const isCoveringEyes = (state === 'focus-password' || state === 'typing-password') && !showPassword
  const isPeeking = (state === 'focus-password' || state === 'typing-password') && showPassword
  const isLookingAtInput = state === 'focus-email'
  const isCheering = state === 'hover-submit' || state === 'success' || clicked

  const handleMascotClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 1200)
  }

  return (
    <div
      onClick={handleMascotClick}
      title="Click me for a high five! 🖐️"
      style={{
        width: '100%',
        maxWidth: isCompact ? 160 : 340,
        height: isCompact ? 120 : 'clamp(180px, 30vh, 260px)',
        margin: '0 auto',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Floating Code Symbols */}
      {!isCompact && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <span
            className="floating-code"
            style={{
              position: 'absolute',
              top: '10%',
              left: '6%',
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(96, 165, 250, 0.5)',
              fontFamily: 'var(--mono)',
              animation: 'floatCode 6s ease-in-out infinite',
            }}
          >
            &lt;/&gt;
          </span>
          <span
            className="floating-code"
            style={{
              position: 'absolute',
              top: '18%',
              right: '8%',
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(37, 99, 235, 0.45)',
              fontFamily: 'var(--mono)',
              animation: 'floatCode 7s ease-in-out 1s infinite',
            }}
          >
            &#123;&#125;
          </span>
          <span
            className="floating-code"
            style={{
              position: 'absolute',
              bottom: '22%',
              left: '8%',
              fontSize: 11,
              fontWeight: 700,
              color: 'rgba(148, 163, 184, 0.4)',
              fontFamily: 'var(--mono)',
              animation: 'floatCode 8s ease-in-out 2s infinite',
            }}
          >
            0101
          </span>
          <span
            className="floating-code"
            style={{
              position: 'absolute',
              bottom: '18%',
              right: '8%',
              fontSize: 12,
              fontWeight: 700,
              color: 'rgba(96, 165, 250, 0.45)',
              fontFamily: 'var(--mono)',
              animation: 'floatCode 6.5s ease-in-out 1.5s infinite',
            }}
          >
            () =&gt;
          </span>
        </div>
      )}

      {/* Main SVG Mascot */}
      <svg
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 8px 20px rgba(15, 23, 42, 0.12))',
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: clicked ? 'scale(1.05) translateY(-4px)' : 'scale(1)',
        }}
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fdba74" />
          </linearGradient>
          <linearGradient id="laptopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#eff6ff" />
            <stop offset="100%" stopColor="#bfdbfe" />
          </linearGradient>
          <linearGradient id="headphoneGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>

        {/* Desk Surface */}
        <rect x="30" y="242" width="260" height="10" rx="5" fill="#e2e8f0" />
        <rect x="50" y="252" width="220" height="3" rx="1.5" fill="#cbd5e1" opacity="0.6" />

        {/* Mascot Body Group */}
        <g
          style={{
            transformOrigin: '160px 220px',
            animation: state === 'idle' ? 'idleBreath 4s ease-in-out infinite' : 'none',
          }}
        >
          {/* Torso / Hoodie */}
          <path
            d="M95 240 C95 185, 120 165, 160 165 C200 165, 225 185, 225 240 Z"
            fill="url(#bodyGrad)"
          />
          <path d="M160 170 L160 220" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
          {/* RE:LEARN chest crest */}
          <rect x="122" y="195" width="16" height="16" rx="4" fill="#2563eb" />
          <text x="125" y="207" fill="#ffffff" fontSize="8" fontWeight="800" fontFamily="sans-serif">
            RE
          </text>

          {/* Headphone Audio Soundwaves (Lo-Fi EQ effect) */}
          <g opacity="0.85">
            <rect x="96" y="104" width="2" height="12" rx="1" fill="#60a5fa" className="eq-bar-1" />
            <rect x="100" y="100" width="2.5" height="18" rx="1" fill="#93c5fd" className="eq-bar-2" />
            <rect x="105" y="106" width="2" height="10" rx="1" fill="#2563eb" className="eq-bar-3" />

            <rect x="212" y="106" width="2" height="10" rx="1" fill="#2563eb" className="eq-bar-3" />
            <rect x="217" y="100" width="2.5" height="18" rx="1" fill="#93c5fd" className="eq-bar-2" />
            <rect x="222" y="104" width="2" height="12" rx="1" fill="#60a5fa" className="eq-bar-1" />
          </g>

          {/* Head Group */}
          <g
            style={{
              transformOrigin: '160px 125px',
              transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
              transform: isLookingAtInput
                ? 'rotate(5deg) translate(8px, -2px)'
                : isCoveringEyes
                ? 'translate(0px, 4px) rotate(-2deg)'
                : isCheering
                ? 'translate(0px, -4px)'
                : `translate(${mouseOffset.x * 0.4}px, ${mouseOffset.y * 0.4}px)`,
            }}
          >
            {/* Neck */}
            <rect x="148" y="145" width="24" height="22" rx="4" fill="url(#skinGrad)" />

            {/* Face */}
            <rect x="120" y="70" width="80" height="85" rx="36" fill="url(#skinGrad)" />

            {/* Hair */}
            <path
              d="M116 95 C116 65, 135 52, 160 52 C185 52, 204 65, 204 95 C195 85, 180 82, 165 88 C150 82, 130 85, 116 95 Z"
              fill="#0f172a"
            />
            <path d="M145 68 C155 60, 165 62, 172 72 Z" fill="#1e293b" />

            {/* Headphones */}
            <path
              d="M114 110 C110 50, 210 50, 206 110"
              stroke="url(#headphoneGrad)"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Ear Cups */}
            <rect x="110" y="98" width="10" height="26" rx="5" fill="#2563eb" />
            <rect x="112" y="103" width="6" height="16" rx="3" fill="#60a5fa" />
            <rect x="200" y="98" width="10" height="26" rx="5" fill="#2563eb" />
            <rect x="202" y="103" width="6" height="16" rx="3" fill="#60a5fa" />

            {/* Eyes */}
            {/* Left Eye */}
            <g
              style={{
                transformOrigin: '143px 112px',
                transform: isLookingAtInput
                  ? 'translateX(3.5px)'
                  : `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                transition: 'transform 0.12s ease-out',
              }}
            >
              {blink || isCoveringEyes ? (
                <path
                  d="M136 114 Q143 118 150 114"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isCheering ? (
                <path
                  d="M136 113 Q143 107 150 113"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isPeeking ? (
                /* Funny curious peeking eye */
                <>
                  <ellipse cx="143" cy="112" rx="6" ry="6" fill="#ffffff" />
                  <ellipse cx="145" cy="112" rx="3.5" ry="3.5" fill="#0f172a" />
                  <circle cx="146" cy="110" r="1.5" fill="#ffffff" />
                </>
              ) : (
                /* Normal Eye */
                <>
                  <ellipse cx="143" cy="112" rx="6" ry="7" fill="#ffffff" />
                  <ellipse
                    cx={isLookingAtInput ? 145.5 : 143}
                    cy={112}
                    rx="3.5"
                    ry="4.5"
                    fill="#0f172a"
                  />
                  <circle cx={isLookingAtInput ? 146.5 : 144} cy="110" r="1.5" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Right Eye */}
            <g
              style={{
                transformOrigin: '177px 112px',
                transform: isLookingAtInput
                  ? 'translateX(3.5px)'
                  : `translate(${mouseOffset.x}px, ${mouseOffset.y}px)`,
                transition: 'transform 0.12s ease-out',
              }}
            >
              {blink || isCoveringEyes ? (
                <path
                  d="M171 114 Q178 118 185 114"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isCheering ? (
                <path
                  d="M171 113 Q178 107 185 113"
                  stroke="#0f172a"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              ) : isPeeking ? (
                /* Funny curious peeking eye */
                <>
                  <ellipse cx="177" cy="112" rx="6" ry="6" fill="#ffffff" />
                  <ellipse cx="179" cy="112" rx="3.5" ry="3.5" fill="#0f172a" />
                  <circle cx="180" cy="110" r="1.5" fill="#ffffff" />
                </>
              ) : (
                /* Normal Eye */
                <>
                  <ellipse cx="177" cy="112" rx="6" ry="7" fill="#ffffff" />
                  <ellipse
                    cx={isLookingAtInput ? 179.5 : 177}
                    cy={112}
                    rx="3.5"
                    ry="4.5"
                    fill="#0f172a"
                  />
                  <circle cx={isLookingAtInput ? 180.5 : 178} cy="110" r="1.5" fill="#ffffff" />
                </>
              )}
            </g>

            {/* Eyebrows */}
            <path
              d={isCheering ? 'M136 100 Q143 96 150 99' : 'M136 102 Q143 100 150 102'}
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d={isCheering ? 'M171 99 Q178 96 185 100' : 'M171 102 Q178 100 185 102'}
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Cheerful blush */}
            <circle cx="132" cy="124" r="5" fill="#f43f5e" opacity="0.25" />
            <circle cx="188" cy="124" r="5" fill="#f43f5e" opacity="0.25" />

            {/* Mouth */}
            {isCheering ? (
              <path
                d="M152 130 Q160 142 168 130 Z"
                fill="#0f172a"
                stroke="#0f172a"
                strokeWidth="1.5"
              />
            ) : isCoveringEyes ? (
              <path
                d="M155 132 Q160 135 165 132"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            ) : isPeeking ? (
              <path
                d="M156 131 Q160 138 164 131"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <path
                d="M154 130 Q160 137 166 130"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>

          {/* Laptop on Desk with Live Typing Effect */}
          <g>
            <path
              d="M125 192 L195 192 L202 240 L118 240 Z"
              fill="url(#laptopGrad)"
              stroke="#1e3a8a"
              strokeWidth="1.5"
            />
            <path
              d="M129 196 L191 196 L197 236 L123 236 Z"
              fill="url(#screenGlow)"
              opacity="0.95"
            />
            {/* Animated Code typing lines */}
            <rect x="133" y="202" width="24" height="2" rx="1" fill="#2563eb" />
            <rect x="133" y="207" width="34" height="2" rx="1" fill="#60a5fa" />
            <rect x="138" y="212" width="26" height="2" rx="1" fill="#0f172a" opacity="0.7" />
            <rect x="144" y="217" width="20" height="2" rx="1" fill="#22c55e" />
            {/* Blinking typing cursor on laptop */}
            <rect x="166" y="217" width="2" height="3" fill="#2563eb" className="typing-cursor" />
            <rect x="133" y="222" width="18" height="2" rx="1" fill="#f59e0b" />
          </g>

          {/* Hands & Arms Behavior */}
          {isCoveringEyes ? (
            /* Hands tight covering eyes */
            <g
              style={{
                transformOrigin: '160px 120px',
                animation:
                  state === 'typing-password' ? 'peekHands 1s ease-in-out infinite' : 'none',
              }}
            >
              <path
                d="M106 215 C102 180, 115 130, 138 116"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="138" cy="116" r="11" fill="url(#skinGrad)" />
              <path
                d="M214 215 C218 180, 205 130, 182 116"
                stroke="#1e293b"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="182" cy="116" r="11" fill="url(#skinGrad)" />
            </g>
          ) : isPeeking ? (
            /* Hands separated slightly to peek */
            <g>
              <path
                d="M106 215 C102 180, 110 135, 126 120"
                stroke="#1e293b"
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="126" cy="120" r="10" fill="url(#skinGrad)" />
              <path
                d="M214 215 C218 180, 210 135, 194 120"
                stroke="#1e293b"
                strokeWidth="15"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="194" cy="120" r="10" fill="url(#skinGrad)" />
            </g>
          ) : isCheering ? (
            /* Celebrating arms */
            <g>
              <path
                d="M108 215 C100 185, 96 150, 102 135"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="102" cy="133" r="8" fill="url(#skinGrad)" />
              <path d="M102 131 L102 124" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />

              <path
                d="M212 215 C220 185, 224 150, 218 135"
                stroke="#1e293b"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="218" cy="133" r="8" fill="url(#skinGrad)" />
              <path d="M218 131 L218 124" stroke="#fdba74" strokeWidth="4" strokeLinecap="round" />
            </g>
          ) : (
            /* Hands resting on desk / typing */
            <g>
              <ellipse cx="126" cy="238" rx="8" ry="6" fill="url(#skinGrad)" />
              <ellipse cx="194" cy="238" rx="8" ry="6" fill="url(#skinGrad)" />
            </g>
          )}
        </g>
      </svg>

      {/* Reactive Mascot Speech Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: -4,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#ffffff',
          borderRadius: 20,
          padding: '4px 12px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
          border: '1px solid var(--border)',
          fontSize: 11.5,
          fontWeight: 600,
          color: 'var(--navy-900)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          transition: 'all 0.2s ease',
          pointerEvents: 'none',
        }}
      >
        {clicked ? (
          <>
            <span>⚡</span> Let&apos;s build something awesome today!
          </>
        ) : state === 'idle' ? (
          <>
            <span>👋</span> Ready to code and learn?
          </>
        ) : state === 'focus-email' ? (
          <>
            <span>👀</span> Enter your student email!
          </>
        ) : isPeeking ? (
          <>
            <span>🤫</span> Peeking password mode activated!
          </>
        ) : isCoveringEyes ? (
          <>
            <span>🙈</span> Password is safe, no peeking!
          </>
        ) : state === 'hover-submit' ? (
          <>
            <span>🚀</span> Ready? Let&apos;s get into the platform!
          </>
        ) : (
          <>
            <span>🎉</span> Welcome back! Loading your dashboard...
          </>
        )}
      </div>

      <style>{`
        @keyframes idleBreath {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-2px) scale(1.006); }
        }
        @keyframes peekHands {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(1.5px); }
        }
        @keyframes floatCode {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.45; }
          50% { transform: translateY(-6px) rotate(3deg); opacity: 0.8; }
        }
        @keyframes eqBounce1 {
          0%, 100% { height: 12px; }
          50% { height: 4px; }
        }
        @keyframes eqBounce2 {
          0%, 100% { height: 18px; }
          50% { height: 8px; }
        }
        @keyframes eqBounce3 {
          0%, 100% { height: 8px; }
          50% { height: 16px; }
        }
        .eq-bar-1 { animation: eqBounce1 1.2s ease-in-out infinite; }
        .eq-bar-2 { animation: eqBounce2 0.9s ease-in-out infinite; }
        .eq-bar-3 { animation: eqBounce3 1.4s ease-in-out infinite; }
        @keyframes blinkCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typing-cursor { animation: blinkCursor 0.8s infinite; }
        @media (prefers-reduced-motion: reduce) {
          .floating-code, [style*="animation"], .eq-bar-1, .eq-bar-2, .eq-bar-3 {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
