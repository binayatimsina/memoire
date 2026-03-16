'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    generateInvite()
  }, [])

  async function generateInvite() {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Not logged in. Please sign in first.')
      return
    }

    const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                 '-' +
                 Math.random().toString(36).substring(2, 6).toUpperCase()

    const { data: inserted, error: insertError } = await supabase
      .from('connections')
      .insert({ sender_id: user.id, invite_code: code })
      .select()

    if (insertError) {
      setError(`Failed to create invite: ${insertError.message}`)
      return
    }

    setInviteCode(code)
    setInviteLink(`${window.location.origin}/connect/${code}`)
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .invite-root {
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
          color: rgba(232,130,106,0.5);
          animation: floatUp 8s ease-in infinite;
        }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          10% { opacity: 0.15; }
          90% { opacity: 0.05; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1.1); }
        }

        .back-btn {
          position: relative;
          z-index: 2;
          align-self: flex-start;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 32px;
        }

        .back-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
        }

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
          text-align: center;
        }

        .card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .emoji-wrap {
          font-size: 2.8rem;
          margin-bottom: 16px;
          display: block;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          color: rgba(255,255,255,0.92);
          margin-bottom: 8px;
        }

        .card-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          margin-bottom: 32px;
          line-height: 1.6;
        }

        .code-label {
          font-size: 0.7rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          margin-bottom: 10px;
          display: block;
        }

        .invite-code {
          font-family: 'Playfair Display', serif;
          font-size: 2.2rem;
          color: #e8826a;
          letter-spacing: 0.1em;
          margin-bottom: 20px;
          display: block;
        }

        .invite-link-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.3);
          word-break: break-all;
          margin-bottom: 20px;
          text-align: left;
          line-height: 1.5;
        }

        .copy-btn {
          width: 100%;
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.03em;
        }

        .copy-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .copy-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .expires-note {
          margin-top: 16px;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.2);
        }

        .error-box {
          background: rgba(220,60,60,0.12);
          border: 1px solid rgba(220,60,60,0.25);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 0.82rem;
          color: #f08080;
          margin-bottom: 16px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 24px 0;
        }

        .new-invite-btn {
          width: 100%;
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 12px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
        }

        .new-invite-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.7);
        }
      `}</style>

      <div className="invite-root">
        <div className="bg-layer" />

        <div className="hearts">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="heart" style={{
              left: `${10 + i * 15}%`,
              bottom: '-20px',
              animationDelay: `${i * 1.4}s`,
              animationDuration: `${7 + i * 0.8}s`,
              fontSize: `${0.7 + i * 0.15}rem`
            }}>✦</div>
          ))}
        </div>

        <button className="back-btn" onClick={() => router.push('/home')}>
          ← Back
        </button>

        <div className={`card ${mounted ? 'visible' : ''}`}>
          <span className="emoji-wrap">🔗</span>
          <h2 className="card-title">Invite Someone</h2>
          <p className="card-sub">
            Share this link or code with a friend, partner, or anyone you want to share memories with
          </p>

          {error && <div className="error-box">{error}</div>}

          <span className="code-label">Your invite code</span>
          <span className="invite-code">{inviteCode || '...'}</span>

          <div className="invite-link-box">
            {inviteLink || 'Generating link...'}
          </div>

          <button
            onClick={copyLink}
            disabled={!inviteLink}
            className="copy-btn"
          >
            {copied ? '✓ Copied!' : 'Copy Invite Link'}
          </button>

          <p className="expires-note">This invite expires in 72 hours</p>

          <div className="divider" />

          <button className="new-invite-btn" onClick={generateInvite}>
            Generate a new code
          </button>
        </div>
      </div>
    </>
  )
}