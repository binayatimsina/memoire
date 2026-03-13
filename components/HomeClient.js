'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function HomeClient({ user, profile, connection, initialMoments }) {
  const [moments, setMoments] = useState(initialMoments)
  const router = useRouter()
  const supabase = createClient()

  const partner = connection
    ? (connection.sender_id === user.id ? connection.receiver : connection.sender)
    : null

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

        /* HEADER */
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

        .header-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 2px;
          min-width: 0;
        }

        .partner-label {
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }

        .partner-name {
          font-size: 0.88rem;
          font-weight: 500;
          color: #e8826a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
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

        /* FEED */
        .feed-wrap {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 24px 16px 100px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* EMPTY STATES */
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

        .invite-btn {
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

        .invite-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        /* MOMENT CARD */
        .moment-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .moment-card:hover {
          border-color: rgba(232, 130, 106, 0.2);
        }

        .moment-img {
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          display: block;
        }

        .moment-body {
          padding: 16px 18px 14px;
        }

        .moment-note {
          font-family: 'Playfair Display', serif;
          font-style: italic;
          font-size: 1rem;
          color: rgba(255,255,255,0.82);
          line-height: 1.6;
          margin-bottom: 14px;
        }

        .moment-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .moment-author {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .author-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c0503a, #e8826a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
          color: #fff;
          flex-shrink: 0;
        }

        .author-name {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.4);
        }

        .moment-date {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.25);
        }

        /* FLOATING ADD BUTTON */
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

        .fab:active {
          transform: translateX(50%) translateY(0);
        }

        .fab-icon {
          font-size: 1.2rem;
          line-height: 1;
        }

        /* Hearts bg */
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
          color: rgba(232,130,106,0.4);
          animation: floatUp 9s ease-in infinite;
        }

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
            }}>♡</div>
          ))}
        </div>

        {/* Header */}
        <header className="header">
          <div className="header-logo">
            Memoire<span>.</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {partner && (
              <div className="header-right">
                <span className="partner-label">Connected with</span>
                <span className="partner-name">{partner.display_name}</span>
              </div>
            )}
            <button className="signout-btn" onClick={handleSignOut}>
              Sign out
            </button>
          </div>
        </header>

        {/* Feed */}
        <div className="feed-wrap">
          {!connection ? (
            <div className="empty-state">
                <div className="empty-emoji">🤝</div>
                <h2 className="empty-title">Share moments with others</h2>
                <p className="empty-sub">
                    A friend, a partner, a sibling — invite anyone you want to share memories with
                </p>
                <button className="invite-btn" onClick={() => router.push('/connect/invite')}>
                    Send an Invite
                </button>
            </div>
          ) : moments.length === 0 ? (
            <div className="empty-state">
                <div className="empty-emoji">🌱</div>
                <h2 className="empty-title">Your shared story starts here</h2>
                <p className="empty-sub">
                    Post your first photo and note — {partner?.display_name} will see it instantly
                </p>
            </div>
          ) : (
            moments.map(moment => (
              <MomentCard
                key={moment.id}
                moment={moment}
                currentUserId={user.id}
              />
            ))
          )}
        </div>

        {/* Floating action button */}
        {connection && (
          <button className="fab" onClick={() => router.push('/moment/new')}>
            <span className="fab-icon">+</span>
            New Moment
          </button>
        )}
      </div>
    </>
  )
}

function MomentCard({ moment, currentUserId }) {
  const isOwn = moment.author_id === currentUserId
  const date = new Date(moment.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  return (
    <>
      <style>{`
        .moment-card-own {
          background: rgba(192, 80, 58, 0.12);
          border: 1px solid rgba(232, 130, 106, 0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .moment-card-own:hover {
          border-color: rgba(232, 130, 106, 0.4);
        }

        .moment-card-theirs {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .moment-card-theirs:hover {
          border-color: rgba(255, 255, 255, 0.18);
        }

        .card-author-tag {
          padding: 8px 16px 0;
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: ${isOwn ? 'rgba(232,130,106,0.7)' : 'rgba(255,255,255,0.3)'};
        }
      `}</style>

      <div className={isOwn ? 'moment-card-own' : 'moment-card-theirs'}>
        <div className="card-author-tag">
          {isOwn ? '✦ You' : `✦ ${moment.author?.display_name}`}
        </div>
        <img
          src={moment.photo_url}
          alt="Moment"
          className="moment-img"
        />
        <div className="moment-body">
          <p className="moment-note">"{moment.note}"</p>
          <div className="moment-meta">
            <div className="moment-author">
              <div className="author-avatar">
                {moment.author?.display_name?.[0]?.toUpperCase()}
              </div>
              <span className="author-name">
                {isOwn ? 'You' : moment.author?.display_name}
              </span>
            </div>
            <span className="moment-date">{date}</span>
          </div>
        </div>
      </div>
    </>
  )
}