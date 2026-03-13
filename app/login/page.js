'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => setMounted(true), [])

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/onboarding')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError(error.message); setLoading(false); return }
      router.push('/home')
    }
  }

  async function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'DM Sans', sans-serif;
          background: #1a0a0a;
          overflow: hidden;
          position: relative;
        }

        /* Atmospheric background */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(180, 60, 60, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 20%, rgba(120, 40, 40, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 60% 80%, rgba(200, 100, 60, 0.08) 0%, transparent 50%),
            #0f0707;
        }

        /* Grain texture overlay */
        .bg-layer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.4;
          pointer-events: none;
        }

        /* Left decorative panel — hidden on mobile */
        .left-panel {
          display: none;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 768px) {
          .left-panel {
            display: flex;
            flex: 1;
            flex-direction: column;
            justify-content: center;
            align-items: flex-start;
            padding: 60px;
          }
        }

        .left-tagline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(2.4rem, 4vw, 4rem);
          font-style: italic;
          color: rgba(255,255,255,0.85);
          line-height: 1.2;
          margin-bottom: 24px;
          max-width: 420px;
        }

        .left-tagline span {
          color: #e8826a;
          font-style: normal;
        }

        .left-sub {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.35);
          max-width: 320px;
          line-height: 1.7;
          letter-spacing: 0.01em;
        }

        .decorative-line {
          width: 48px;
          height: 2px;
          background: linear-gradient(90deg, #e8826a, transparent);
          margin-bottom: 32px;
        }

        /* Right form panel */
        .right-panel {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          padding: 24px 20px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .right-panel {
            width: 460px;
            min-width: 460px;
            padding: 60px 48px;
            border-left: 1px solid rgba(255,255,255,0.05);
            background: rgba(255,255,255,0.02);
            backdrop-filter: blur(20px);
          }
        }

        .form-container {
          width: 100%;
          max-width: 360px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .form-container.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          color: #fff;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .logo-dot {
          color: #e8826a;
        }

        .logo-sub {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 48px;
        }

        .form-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 8px;
        }

        .form-subtitle {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 32px;
        }

        .input-group {
          margin-bottom: 14px;
          position: relative;
        }

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

        .input-field::placeholder {
          color: rgba(255,255,255,0.18);
        }

        .input-field:focus {
          border-color: rgba(232, 130, 106, 0.5);
          background: rgba(255,255,255,0.07);
        }

        .input-field:-webkit-autofill {
          -webkit-box-shadow: 0 0 0px 1000px #1f0d0d inset;
          -webkit-text-fill-color: rgba(255,255,255,0.9);
        }

        .error-box {
          background: rgba(220, 60, 60, 0.12);
          border: 1px solid rgba(220, 60, 60, 0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.82rem;
          color: #f08080;
          margin-bottom: 16px;
        }

        .submit-btn {
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
          margin-top: 8px;
          letter-spacing: 0.03em;
          transition: opacity 0.2s, transform 0.15s;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .toggle-row {
          text-align: center;
          margin-top: 28px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
        }

        .toggle-btn {
          background: none;
          border: none;
          color: #e8826a;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          text-decoration: underline;
          text-decoration-color: rgba(232,130,106,0.4);
          transition: color 0.2s;
        }

        .toggle-btn:hover { color: #f0a090; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.07);
        }

        .divider-text {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
        }

        /* Floating hearts decoration */
        .hearts {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .heart {
          position: absolute;
          font-size: 1rem;
          opacity: 0;
          animation: floatUp 8s ease-in infinite;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          10% { opacity: 0.15; }
          90% { opacity: 0.05; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1.1); }
        }
      `}</style>

      <div className="login-root">
        <div className="bg-layer" />

        {/* Floating hearts */}
        <div className="hearts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="heart" style={{
              left: `${10 + i * 15}%`,
              bottom: '-20px',
              animationDelay: `${i * 1.4}s`,
              animationDuration: `${7 + i * 0.8}s`,
              fontSize: `${0.7 + i * 0.15}rem`
            }}>♡</div>
          ))}
        </div>

        {/* Left panel */}
        <div className="left-panel">
          <div className="decorative-line" />
          <h1 className="left-tagline">
            Every moment<br />deserves to be<br /><span>remembered.</span>
          </h1>
          <p className="left-sub">
            Share photos and notes with someone special.
            Watch your story grow — one moment at a time.
          </p>
        </div>

        {/* Right form panel */}
        <div className="right-panel">
          <div className={`form-container ${mounted ? 'visible' : ''}`}>

            <div className="logo">Memoire<span className="logo-dot">.</span></div>
            <div className="logo-sub">Your shared memory</div>

            <h2 className="form-title">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="form-subtitle">
              {isSignUp
                ? 'Start capturing moments together'
                : 'Sign in to see what was shared'}
            </p>

            <div className="input-group">
              <label className="input-label">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="input-field"
              />
            </div>

            {error && <div className="error-box">{error}</div>}

            <button
              onClick={handleSubmit}
              disabled={loading || !email || !password}
              className="submit-btn"
            >
              {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>

            <div className="toggle-row">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button className="toggle-btn" onClick={() => { setIsSignUp(!isSignUp); setError('') }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}