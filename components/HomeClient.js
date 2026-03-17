'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomeClient({ user, profile, connections }) {
  const [requestCount, setRequestCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadRequestCount()

    // Listen for new requests in real time
    const channel = supabase
      .channel('requests')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'connection_requests',
        filter: `receiver_id=eq.${user.id}`
      }, () => {
        loadRequestCount()
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function loadRequestCount() {
    const { count } = await supabase
      .from('connection_requests')
      .select('*', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    setRequestCount(count || 0)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .home-root {
          min-height: 100vh;
          background: #0f0707;
          font-family: 'DM Sans', sans-serif;
          position: relative;
        }

        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(180, 60, 60, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 40% 40% at 80% 80%, rgba(120, 40, 40, 0.08) 0%, transparent 60%),
            #0f0707;
          pointer-events: none;
        }

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(15, 7, 7, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 0 20px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .header-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.5rem;
          color: #fff;
          letter-spacing: -0.02em;
          flex-shrink: 0;
        }

        .header-logo span { color: #e8826a; }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .icon-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          position: relative;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .icon-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
        }

        .icon-btn.requests-btn:hover {
          border-color: rgba(232,130,106,0.4);
          color: #e8826a;
        }

        .request-badge {
          background: linear-gradient(135deg, #c0503a, #e8826a);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          border-radius: 50%;
          width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: absolute;
          top: -6px;
          right: -6px;
          animation: popIn 0.3s ease;
        }

        @keyframes popIn {
          0% { transform: scale(0); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }

        .signout-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.35);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .signout-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.6);
        }

        .page-wrap {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 24px 16px 100px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .page-heading {
          font-family: 'Playfair Display', serif;
          font-size: 1rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        /* EMPTY STATE */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          min-height: 60vh;
        }

        .empty-emoji {
          font-size: 3.5rem;
          margin-bottom: 20px;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.6rem;
          color: rgba(255,255,255,0.85);
          margin-bottom: 10px;
          line-height: 1.3;
        }

        .empty-sub {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.35);
          line-height: 1.6;
          max-width: 260px;
          margin-bottom: 32px;
        }

        .search-btn {
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 12px;
          padding: 14px 28px;
          font-size: 0.9rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          letter-spacing: 0.02em;
        }

        .search-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        /* CONNECTION CARD */
        .connection-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 18px 20px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .connection-card:hover {
          background: rgba(255,255,255,0.07);
          border-color: rgba(232, 130, 106, 0.25);
          transform: translateY(-1px);
        }

        .connection-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c0503a, #e8826a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: #fff;
          flex-shrink: 0;
        }

        .connection-info {
          flex: 1;
          min-width: 0;
        }

        .connection-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
          margin-bottom: 4px;
        }

        .connection-preview {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.35);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          font-style: italic;
        }

        .connection-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
          flex-shrink: 0;
        }

        .connection-date {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.25);
        }

        .connection-count {
          font-size: 0.72rem;
          color: rgba(232,130,106,0.6);
        }

        .connection-arrow {
          font-size: 1rem;
          color: rgba(255,255,255,0.2);
          margin-left: 4px;
        }

        /* FAB */
        .fab {
          position: fixed;
          bottom: 28px;
          right: 50%;
          transform: translateX(50%);
          z-index: 200;
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 50px;
          padding: 14px 28px;
          font-size: 0.88rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 24px rgba(192, 80, 58, 0.45);
          transition: transform 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }

        .fab:hover {
          transform: translateX(50%) translateY(-2px);
          box-shadow: 0 8px 32px rgba(192, 80, 58, 0.55);
        }

        .fab:active { transform: translateX(50%) translateY(0); }
        .fab-icon { font-size: 1.2rem; line-height: 1; }

        .hearts { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
        .heart { position: absolute; opacity: 0; color: rgba(232,130,106,0.4); animation: floatUp 9s ease-in infinite; }

        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) scale(0.8); }
          10% { opacity: 0.12; }
          90% { opacity: 0.03; }
          100% { opacity: 0; transform: translateY(-100vh) scale(1.1); }
        }
      `}</style>

      <div className="home-root">
        <div className="bg-layer" />

        <div className="hearts">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="heart" style={{
              left: `${8 + i * 18}%`,
              bottom: '-20px',
              animationDelay: `${i * 1.8}s`,
              animationDuration: `${8 + i * 0.9}s`,
              fontSize: `${0.8 + i * 0.1}rem`
            }}>✦</div>
          ))}
        </div>

        {/* Header */}
        <header className="header">
          <div className="header-logo">Memoire<span>.</span></div>
          <div className="header-actions">
            {/* Search button */}
            <button
              className="icon-btn"
              onClick={() => router.push('/search')}
              title="Find someone"
            >
              🔍
            </button>

            {/* Requests button */}
            <button
              className="icon-btn requests-btn"
              onClick={() => router.push('/requests')}
              title="Connection requests"
            >
              👥
              {requestCount > 0 && (
                <span className="request-badge">{requestCount}</span>
              )}
            </button>

            <button className="signout-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="page-wrap">
          {connections.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🤝</div>
              <h2 className="empty-title">Share moments with someone you care about</h2>
              <p className="empty-sub">
                Search for a friend by their username to get started
              </p>
              <button
                className="search-btn"
                onClick={() => router.push('/search')}
              >
                🔍 Find Someone
              </button>
            </div>
          ) : (
            <>
              <p className="page-heading">Your Connections</p>
              {connections.map(connection => {
                const partner = connection.sender_id === user.id
                  ? connection.receiver
                  : connection.sender

                const preview = connection.latestMoment
                  ? `"${connection.latestMoment.note}"`
                  : 'No moments yet — be the first!'

                const date = connection.latestMoment
                  ? new Date(connection.latestMoment.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric'
                    })
                  : null

                return (
                  <div
                    key={connection.id}
                    className="connection-card"
                    onClick={() => router.push(`/feed/${connection.id}`)}
                  >
                    <div className="connection-avatar">
                      {partner?.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="connection-info">
                      <div className="connection-name">{partner?.display_name}</div>
                      <div className="connection-preview">{preview}</div>
                    </div>
                    <div className="connection-meta">
                      {date && <span className="connection-date">{date}</span>}
                      <span className="connection-count">
                        {connection.totalMoments} {connection.totalMoments === 1 ? 'moment' : 'moments'}
                      </span>
                    </div>
                    <span className="connection-arrow">›</span>
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* FAB */}
        <button
          className="fab"
          onClick={() => router.push('/search')}
        >
          <span className="fab-icon">+</span>
          New Connection
        </button>
      </div>
    </>
  )
}