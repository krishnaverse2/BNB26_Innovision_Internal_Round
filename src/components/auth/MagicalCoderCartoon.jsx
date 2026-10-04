import { useState, useEffect } from 'react'

/**
 * MagicalCoderCartoon
 * An enchanting, magical cartoon wizard-developer with interactive wand spells,
 * glowing celestial aura, orbiting runes, and magical particle bursts!
 */
export default function MagicalCoderCartoon({
  state = 'idle', // 'idle' | 'focus-email' | 'focus-password' | 'typing-password' | 'hover-submit' | 'success'
  onCastSpell,
}) {
  const [blink, setBlink] = useState(false)
  const [spellCount, setSpellCount] = useState(0)
  const [wandSpark, setWandSpark] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Natural blinking
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 150)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  // Wand sparkle pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setWandSpark(true)
      setTimeout(() => setWandSpark(false), 400)
    }, 2400)
    return () => clearInterval(interval)
  }, [])

  // Mouse interaction
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 6
      const y = (e.clientY / window.innerHeight - 0.5) * 4
      setMousePos({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const handleCastMagic = () => {
    setSpellCount((c) => c + 1)
    setWandSpark(true)
    setTimeout(() => setWandSpark(false), 800)
    if (onCastSpell) onCastSpell()
  }

  const isCoveringEyes = state === 'focus-password' || state === 'typing-password'
  const isLooking = state === 'focus-email'
  const isCheering = state === 'hover-submit' || state === 'success' || wandSpark

  return (
    <div
      onClick={handleCastMagic}
      title="Click to cast a coding spell! ✨"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: 320,
        height: 'clamp(150px, 24vh, 210px)',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* Magic Celestial Swirling Aura Background */}
      <div
        style={{
          position: 'absolute',
          width: 180,
          height: 180,
          borderRadius: '50%',
          background:
            'radial-gradient(circle, rgba(96,165,250,0.35) 0%, rgba(37,99,235,0.15) 50%, transparent 75%)',
          filter: 'blur(20px)',
          animation: 'magicPulse 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Orbiting Magical Code Runes */}
      <div
        className="magic-orbit-ring"
        style={{
          position: 'absolute',
          width: 220,
          height: 170,
          borderRadius: '50%',
          border: '1px dashed rgba(96, 165, 250, 0.4)',
          pointerEvents: 'none',
          animation: 'orbitSpin 12s linear infinite',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: '45%',
            fontSize: 13,
            color: '#60a5fa',
            filter: 'drop-shadow(0 0 6px #60a5fa)',
          }}
        >
          ✦
        </span>
        <span
          style={{
            position: 'absolute',
            bottom: -6,
            left: '48%',
            fontSize: 12,
            color: '#38bdf8',
            filter: 'drop-shadow(0 0 6px #38bdf8)',
          }}
        >
          &lt;/&gt;
        </span>
        <span
          style={{
            position: 'absolute',
            top: '40%',
            left: -10,
            fontSize: 13,
            color: '#93c5fd',
            filter: 'drop-shadow(0 0 6px #93c5fd)',
          }}
        >
          λ
        </span>
        <span
          style={{
            position: 'absolute',
            top: '45%',
            right: -10,
            fontSize: 14,
            color: '#facc15',
            filter: 'drop-shadow(0 0 6px #facc15)',
          }}
        >
          ★
        </span>
      </div>

      {/* Floating Magic Spell Particles Burst */}
      {wandSpark && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
          <div className="spark-particle spark-1">✨</div>
          <div className="spark-particle spark-2">⭐</div>
          <div className="spark-particle spark-3">✦</div>
          <div className="spark-particle spark-4">💫</div>
        </div>
      )}

      {/* Character Vector SVG */}
      <svg
        viewBox="0 0 320 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          width: '100%',
          height: '100%',
          filter: 'drop-shadow(0 10px 24px rgba(37, 99, 235, 0.25))',
          animation: 'wizardHover 3.5s ease-in-out infinite',
        }}
      >
        <defs>
          <radialGradient id="wandGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          <linearGradient id="robeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id="skin" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fca5a5" />
          </linearGradient>
          <filter id="magicBloom" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* --- FLOATING MAGIC CLOUD / POD --- */}
        <g opacity="0.85">
          <ellipse cx="160" cy="256" rx="72" ry="14" fill="#1e293b" />
          <ellipse cx="160" cy="254" rx="60" ry="10" fill="#2563eb" opacity="0.5" />
          <ellipse cx="160" cy="252" rx="42" ry="6" fill="#60a5fa" opacity="0.75" />
        </g>

        {/* --- WIZARD ROBE & BODY --- */}
        <g>
          {/* Main Cloak */}
          <path
            d="M100 248 C100 185, 120 160, 160 160 C200 160, 220 185, 220 248 Z"
            fill="url(#robeGrad)"
            stroke="#3b82f6"
            strokeWidth="1.5"
          />
          {/* Golden Rune trim down the center */}
          <path d="M160 162 L160 248" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="3 3" />
          {/* Mystical Belt Buckle */}
          <circle cx="160" cy="225" r="7" fill="#f59e0b" stroke="#fef08a" strokeWidth="1.5" />
          <circle cx="160" cy="225" r="3.5" fill="#2563eb" />
        </g>

        {/* --- HEAD & FACE --- */}
        <g
          style={{
            transformOrigin: '160px 125px',
            transform: isLooking
              ? 'rotate(5deg) translate(5px, -2px)'
              : isCoveringEyes
              ? 'translate(0px, 3px)'
              : `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Head Base */}
          <circle cx="160" cy="120" r="38" fill="url(#skin)" />

          {/* Cute Rosy Cheeks */}
          <circle cx="135" cy="130" r="6" fill="#f43f5e" opacity="0.35" />
          <circle cx="185" cy="130" r="6" fill="#f43f5e" opacity="0.35" />

          {/* Eyes */}
          {/* Left Eye */}
          <g
            style={{
              transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {blink || isCoveringEyes ? (
              <path
                d="M139 122 Q146 127 153 122"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : isCheering ? (
              <path
                d="M139 123 Q146 116 153 123"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <ellipse cx="146" cy="120" rx="6" ry="7" fill="#0f172a" />
                <circle cx="148" cy="118" r="2.2" fill="#ffffff" />
                <circle cx="144" cy="122" r="1.2" fill="#60a5fa" />
              </>
            )}
          </g>

          {/* Right Eye */}
          <g
            style={{
              transform: `translate(${mousePos.x * 0.6}px, ${mousePos.y * 0.6}px)`,
              transition: 'transform 0.1s ease-out',
            }}
          >
            {blink || isCoveringEyes ? (
              <path
                d="M167 122 Q174 127 181 122"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : isCheering ? (
              <path
                d="M167 123 Q174 116 181 123"
                stroke="#0f172a"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              <>
                <ellipse cx="174" cy="120" rx="6" ry="7" fill="#0f172a" />
                <circle cx="176" cy="118" r="2.2" fill="#ffffff" />
                <circle cx="172" cy="122" r="1.2" fill="#60a5fa" />
              </>
            )}
          </g>

          {/* Smiling Mouth */}
          {isCheering ? (
            <path
              d="M153 135 Q160 145 167 135 Z"
              fill="#0f172a"
              stroke="#0f172a"
              strokeWidth="1.5"
            />
          ) : (
            <path
              d="M154 133 Q160 139 166 133"
              stroke="#0f172a"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* --- WIZARD HAT --- */}
          <g>
            {/* Hat Brim */}
            <ellipse cx="160" cy="94" rx="56" ry="12" fill="#1e293b" stroke="#3b82f6" strokeWidth="2" />
            {/* Hat Cone */}
            <path
              d="M120 92 C125 50, 150 20, 184 14 C175 45, 185 70, 200 92 Z"
              fill="url(#hatGrad)"
              stroke="#60a5fa"
              strokeWidth="1.5"
            />
            {/* Hat Star Emblem */}
            <path
              d="M172 38 L175 46 L183 47 L177 52 L179 60 L172 55 L165 60 L167 52 L161 47 L169 46 Z"
              fill="#f59e0b"
              filter="url(#magicBloom)"
            />
            {/* Hat Glowing Band */}
            <path
              d="M122 91 C135 84, 185 84, 198 91"
              stroke="#38bdf8"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>

        {/* --- LEFT HAND: MAGICAL CODING WAND --- */}
        <g
          style={{
            transformOrigin: '98px 185px',
            transform: wandSpark ? 'rotate(-12deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          {/* Left Arm */}
          <path
            d="M112 185 C95 190, 80 180, 72 165"
            stroke="#1e3a8a"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Wand Shaft (wood/obsidian) */}
          <path d="M72 168 L48 108" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
          <path d="M54 122 L48 108" stroke="#d97706" strokeWidth="3" strokeLinecap="round" />
          {/* Glowing Crystal Star Orb at tip */}
          <circle cx="46" cy="104" r="14" fill="url(#wandGlow)" filter="url(#magicBloom)" />
          <circle cx="46" cy="104" r="5" fill="#ffffff" />
          <path
            d="M46 95 L46 113 M37 104 L55 104"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>

        {/* --- RIGHT HAND: LEVITATING SPELL CODE BOOK --- */}
        <g
          style={{
            animation: 'bookFloat 3s ease-in-out infinite',
            transformOrigin: '240px 185px',
          }}
        >
          {/* Right Arm */}
          <path
            d="M208 185 C222 190, 235 180, 242 170"
            stroke="#1e3a8a"
            strokeWidth="12"
            strokeLinecap="round"
            fill="none"
          />
          {/* Levitating Magic Book */}
          <path
            d="M232 170 L256 160 L280 170 L274 192 L256 182 L238 192 Z"
            fill="#1e293b"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          {/* Glowing book pages */}
          <path d="M256 162 L256 182" stroke="#93c5fd" strokeWidth="2" />
          <circle cx="256" cy="172" r="2.5" fill="#facc15" filter="url(#magicBloom)" />
        </g>
      </svg>

      {/* Reactive Magic Speech Banner */}
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(6px)',
          borderRadius: 20,
          padding: '4px 14px',
          boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
          border: '1px solid rgba(96, 165, 250, 0.4)',
          fontSize: 11.5,
          fontWeight: 600,
          color: '#ffffff',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          zIndex: 15,
        }}
      >
        <span style={{ fontSize: 13 }}>✨</span>
        <span>
          {spellCount > 0
            ? `Cast Spell #${spellCount}! Algorithmic boost active ⚡`
            : state === 'focus-password'
            ? 'Casting Star Shield! Password is secure 🛡️'
            : state === 'focus-email'
            ? 'Enter your wizard credentials below 📜'
            : state === 'hover-submit'
            ? 'Summoning the learning portal 🚀'
            : 'Click me to cast a magic coding spell! ✨'}
        </span>
      </div>

      <style>{`
        @keyframes wizardHover {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1.2deg); }
        }
        @keyframes magicPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
        @keyframes orbitSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bookFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(-3deg); }
        }
        @keyframes sparkFly1 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 1; }
          100% { transform: translate(-30px, -40px) scale(1.4); opacity: 0; }
        }
        @keyframes sparkFly2 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 1; }
          100% { transform: translate(40px, -35px) scale(1.4); opacity: 0; }
        }
        @keyframes sparkFly3 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 1; }
          100% { transform: translate(-45px, 20px) scale(1.3); opacity: 0; }
        }
        @keyframes sparkFly4 {
          0% { transform: translate(0, 0) scale(0.6); opacity: 1; }
          100% { transform: translate(35px, 30px) scale(1.3); opacity: 0; }
        }
        .spark-particle {
          position: absolute;
          font-size: 18px;
          top: 35%;
          left: 20%;
        }
        .spark-1 { animation: sparkFly1 0.7s ease-out forwards; }
        .spark-2 { animation: sparkFly2 0.7s ease-out forwards; }
        .spark-3 { animation: sparkFly3 0.7s ease-out forwards; }
        .spark-4 { animation: sparkFly4 0.7s ease-out forwards; }
      `}</style>
    </div>
  )
}
