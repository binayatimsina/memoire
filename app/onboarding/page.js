'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('')
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

  async function handleContinue() {
    if (!displayName.trim() || !user) return
    setLoading(true)
    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)
    router.push('/home')
  }

  async function handleKeyDown(e) {
    if (e.key === 'Enter') handleContinue()
  }

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
        }

        .bg-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        .hearts {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .heart {
          position: absolute;
          opacity: 0;
          animation: floatUp 8s ease-in infinite;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          10% { opacity: 0.15; }
          90% { opacity: 0.05; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1.1); }
        }

        .card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 48px 36px;
          backdrop-filter: blur(20px);
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .step-label {
          font-size: 0.72rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: rgba(232, 130, 106, 0.7);
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
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
          font-size: 1.9rem;
          color: rgba(255,255,255,0.92);
          margin-bottom: 10px;
          line-height: 1.2;
        }

        .ob-subtitle {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          margin-bottom: 36px;
        }

        .input-label {
          display: block;
          font-size: 0.72rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.4);
          margin-bottom: 8px;
        }

        .name-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 15px 18px;
          font-size: 1.05rem;
          color: rgba(255,255,255,0.9);
          font-family: 'Playfair Display', serif;
          font-style: italic;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          text-align: left;
          -webkit-appearance: none;
          margin-bottom: 24px;
        }

        .name-input::placeholder {
          color: rgba(255,255,255,0.18);
          font-style: italic;
        }

        .name-input:focus {
          border-color: rgba(232, 130, 106, 0.5);
          background: rgba(255,255,255,0.07);
        }

        .name-input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #1f0d0d inset;
          -webkit-text-fill-color: rgba(255,255,255,0.9);
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
        }

        .continue-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .continue-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .continue-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
        }

        .arrow {
          transition: transform 0.2s;
        }

        .continue-btn:hover:not(:disabled) .arrow {
          transform: translateX(4px);
        }

        .footer-note {
          text-align: center;
          margin-top: 20px;
          font-size: 0.78rem;
          color: rgba(255,255,255,0.2);
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
            }}>♡</div>
          ))}
        </div>

        <div className="logo-top">Memoire<span>.</span></div>

        <div className={`card ${mounted ? 'visible' : ''}`}>
          <div className="step-label">Step 1 of 1</div>

          <span className="emoji-wrap">✨</span>

          <h2 className="ob-title">What's your name?</h2>
          <p className="ob-subtitle">
            This is how your partner will see you in the app.
            Pick something that feels like you.
          </p>

          <label className="input-label">Your name</label>
          <input
            type="text"
            placeholder="e.g. Sofia, Jake, Sam..."
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="name-input"
            autoFocus
          />

          <button
            onClick={handleContinue}
            disabled={loading || !displayName.trim() || !user}
            className="continue-btn"
          >
            {loading ? 'Saving...' : (
              <>
                Continue
                <span className="arrow">→</span>
              </>
            )}
          </button>

          <p className="footer-note">You can change this later in your profile</p>
        </div>
      </div>
    </>
  )
}