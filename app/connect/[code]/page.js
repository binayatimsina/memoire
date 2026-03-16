'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function AcceptInvitePage() {
  const [connection, setConnection] = useState(null)
  const [senderProfile, setSenderProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const { code } = useParams()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadInvite()
  }, [code])

  async function loadInvite() {
    const { data: conn } = await supabase
      .from('connections')
      .select('*, sender:profiles!connections_sender_id_fkey(display_name)')
      .eq('invite_code', code)
      .eq('status', 'pending')
      .single()

    if (!conn) { setStatus('invalid'); return }
    if (new Date(conn.expires_at) < new Date()) { setStatus('expired'); return }

    setConnection(conn)
    setSenderProfile(conn.sender)
    setStatus('ready')
  }

  async function acceptInvite() {
    setStatus('accepting')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in to accept an invite.')
      setStatus('ready')
      return
    }

    const { data: updated, error: updateError } = await supabase
      .from('connections')
      .update({ receiver_id: user.id, status: 'active' })
      .eq('id', connection.id)
      .select()

    if (updateError) {
      setError(`Failed to connect: ${updateError.message}`)
      setStatus('ready')
      return
    }

    router.push('/home')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .accept-root {
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

        .logo {
          position: relative;
          z-index: 2;
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: rgba(255,255,255,0.5);
          margin-bottom: 32px;
          letter-spacing: -0.01em;
        }

        .logo span { color: #e8826a; }

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

        .card.visible { opacity: 1; transform: translateY(0); }

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
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .card-sub {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        .sender-name {
          color: #e8826a;
          font-weight: 500;
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

        .accept-btn {
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
        }

        .accept-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .accept-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .decline-btn {
          width: 100%;
          background: none;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 12px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          margin-top: 10px;
          transition: all 0.2s;
        }

        .decline-btn:hover {
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.6);
        }

        /* Invalid / expired states */
        .state-emoji {
          font-size: 3rem;
          margin-bottom: 20px;
          display: block;
        }

        .state-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: rgba(255,255,255,0.85);
          margin-bottom: 10px;
        }

        .state-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          margin-bottom: 28px;
        }

        .home-btn {
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
          transition: opacity 0.2s;
        }

        .home-btn:hover { opacity: 0.9; }
      `}</style>

      <div className="accept-root">
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

        <div className="logo">Memoire<span>.</span></div>

        {status === 'loading' && (
          <div className={`card ${mounted ? 'visible' : ''}`}>
            <span className="emoji-wrap">⏳</span>
            <h2 className="card-title">Loading invite...</h2>
          </div>
        )}

        {(status === 'invalid' || status === 'expired') && (
          <div className={`card ${mounted ? 'visible' : ''}`}>
            <span className="state-emoji">{status === 'expired' ? '⌛' : '😕'}</span>
            <h2 className="state-title">
              {status === 'expired' ? 'Invite Expired' : 'Invalid Invite'}
            </h2>
            <p className="state-sub">
              {status === 'expired'
                ? 'This invite link has expired. Ask your friend to send a new one.'
                : 'This invite link is not valid. It may have already been used.'}
            </p>
            <button className="home-btn" onClick={() => router.push('/home')}>
              Go to Home
            </button>
          </div>
        )}

        {(status === 'ready' || status === 'accepting') && (
          <div className={`card ${mounted ? 'visible' : ''}`}>
            <span className="emoji-wrap">🤝</span>
            <h2 className="card-title">You're invited!</h2>
            <p className="card-sub">
              <span className="sender-name">{senderProfile?.display_name}</span>
              {' '}wants to share moments with you on Memoire
            </p>

            {error && <div className="error-box">{error}</div>}

            <button
              onClick={acceptInvite}
              disabled={status === 'accepting'}
              className="accept-btn"
            >
              {status === 'accepting' ? 'Connecting...' : 'Accept & Connect'}
            </button>

            <button
              className="decline-btn"
              onClick={() => router.push('/home')}
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </>
  )
}