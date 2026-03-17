'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [usernameStatus, setUsernameStatus] = useState('') // 'checking' | 'available' | 'taken' | ''
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)
    }
    getUser()
  }, [])

  // Check username availability with debounce
  useEffect(() => {
    if (!username) { setUsernameStatus(''); return }
    if (username.length < 3) { setUsernameStatus('short'); return }
    if (!/^[a-z0-9_]+$/.test(username)) { setUsernameStatus('invalid'); return }

    setUsernameStatus('checking')
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      setUsernameStatus(data ? 'taken' : 'available')
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  function handleUsernameChange(value) {
    // Force lowercase, no spaces, only letters numbers underscores
    setUsername(value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
  }

  async function handleContinue() {
    if (!displayName.trim() || !username || usernameStatus !== 'available' || !user) return
    setLoading(true)

    await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim(),
        username: username
      })
      .eq('id', user.id)

    router.push('/home')
  }

  function getUsernameMessage() {
    switch (usernameStatus) {
      case 'checking': return { text: 'Checking...', color: 'rgba(255,255,255,0.3)' }
      case 'available': return { text: '✓ Available', color: '#6dbb8a' }
      case 'taken': return { text: '✗ Already taken', color: '#f08080' }
      case 'short': return { text: 'At least 3 characters', color: 'rgba(255,255,255,0.3)' }
      case 'invalid': return { text: 'Only letters, numbers and _', color: '#f08080' }
      default: return null
    }
  }

  const usernameMessage = getUsernameMessage()
  const canContinue = displayName.trim() && usernameStatus === 'available' && user && !loading

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .ob-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'DM Sans', sans-serif;
          background: #0f0707;
          overflow: hidden;
          position: relative;
          padding: 24px 20px;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 40%, rgba(180, 60, 60, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 20% 80%, rgba(120, 40, 40, 0.10) 0%, transparent 60%),
            #0f0707;
          pointer-events: none;
        }

        .bg-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        .hearts { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .heart { position: absolute; opacity: 0; animation: floatUp 8s ease-in infinite; }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          10% { opacity: 0.15; }
          90% { opacity: 0.05; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1.1); }
        }

        .logo-top {
          position: relative;
          z-index: 1;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 32px;
          letter-spacing: -0.01em;
        }

        .logo-top span { color: #e8826a; }

        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 40px 32px;
          backdrop-filter: blur(20px);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .card.visible { opacity: 1; transform: translateY(0); }

        .step-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #e8826a;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.7;
        }

        .step-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(232, 130, 106, 0.2);
        }

        .emoji-wrap {
          font-size: 2.8rem;
          margin-bottom: 20px;
          display: block;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .ob-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: rgba(255,255,255,0.92);
          margin-bottom: 8px;
          line-height: 1.2;
        }

        .ob-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .input-group { margin-bottom: 20px; }

        .input-label {
          display: block;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 16px;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.9);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .input-field::placeholder { color: rgba(255,255,255,0.18); }
        .input-field:focus {
          border-color: rgba(232, 130, 106, 0.5);
          background: rgba(255,255,255,0.07);
        }

        .username-wrap { position: relative; }

        .username-prefix {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #e8826a;
          font-size: 0.95rem;
          pointer-events: none;
        }

        .username-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 14px 16px 14px 28px;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.9);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .username-input::placeholder { color: rgba(255,255,255,0.18); }

        .username-input:focus {
          border-color: rgba(232, 130, 106, 0.5);
          background: rgba(255,255,255,0.07);
        }

        .username-input.available { border-color: rgba(109, 187, 138, 0.5); }
        .username-input.taken { border-color: rgba(240, 128, 128, 0.5); }

        .username-hint {
          font-size: 0.75rem;
          margin-top: 6px;
          height: 16px;
          transition: color 0.2s;
        }

        .continue-btn {
          width: 100%;
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 10px;
          padding: 15px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }

        .continue-btn:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
        .continue-btn:disabled { opacity: 0.35; cursor: not-allowed; }

        .arrow { transition: transform 0.2s; }
        .continue-btn:hover:not(:disabled) .arrow { transform: translateX(4px); }

        .footer-note {
          text-align: center;
          margin-top: 16px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
        }
      `}</style>

      <div className="ob-root">
        <div className="bg-layer" />

        <div className="hearts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="heart" style={{
              left: `${10 + i * 15}%`,
              bottom: '-20px',
              animationDelay: `${i * 1.4}s`,
              animationDuration: `${7 + i * 0.8}s`,
              fontSize: `${0.7 + i * 0.15}rem`,
              color: 'rgba(232,130,106,0.6)'
            }}>✦</div>
          ))}
        </div>

        <div className="logo-top">Memoire<span>.</span></div>

        <div className={`card ${mounted ? 'visible' : ''}`}>
          <div className="step-label">Setup your profile</div>
          <span className="emoji-wrap">✨</span>
          <h2 className="ob-title">Let's set you up</h2>
          <p className="ob-subtitle">
            Tell us your name and pick a unique username so friends can find you.
          </p>

          {/* Display Name */}
          <div className="input-group">
            <label className="input-label">Your name</label>
            <input
              type="text"
              placeholder="e.g. Sofia, Jake..."
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>

          {/* Username */}
          <div className="input-group">
            <label className="input-label">Username</label>
            <div className="username-wrap">
              <span className="username-prefix">@</span>
              <input
                type="text"
                placeholder="yourname"
                value={username}
                onChange={e => handleUsernameChange(e.target.value)}
                className={`username-input ${usernameStatus === 'available' ? 'available' : ''} ${usernameStatus === 'taken' ? 'taken' : ''}`}
              />
            </div>
            {usernameMessage && (
              <p className="username-hint" style={{ color: usernameMessage.color }}>
                {usernameMessage.text}
              </p>
            )}
          </div>

          <button
            onClick={handleContinue}
            disabled={!canContinue}
            className="continue-btn"
          >
            {loading ? 'Saving...' : (
              <>
                Continue
                <span className="arrow">→</span>
              </>
            )}
          </button>

          <p className="footer-note">
            Username can only contain letters, numbers and underscores
          </p>
        </div>
      </div>
    </>
  )
}