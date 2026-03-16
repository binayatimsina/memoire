'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const REACTIONS = ['❤️', '😊', '🥹', '😂', '😢', '🎉', '👍']

export default function FeedClient({ user, connection, partner, initialMoments }) {
  const [moments, setMoments] = useState(initialMoments)
  const router = useRouter()
  const supabase = createClient()

  async function handleReaction(momentId, emoji) {
    const moment = moments.find(m => m.id === momentId)
    const existingReaction = moment.reactions?.find(r => r.author_id === user.id)

    if (existingReaction?.emoji === emoji) {
      await supabase.from('reactions').delete().eq('id', existingReaction.id)
      setMoments(prev => prev.map(m => m.id === momentId ? {
        ...m,
        reactions: m.reactions.filter(r => r.id !== existingReaction.id)
      } : m))
      return
    }

    if (existingReaction) {
      const { data } = await supabase
        .from('reactions').update({ emoji }).eq('id', existingReaction.id).select().single()
      setMoments(prev => prev.map(m => m.id === momentId ? {
        ...m,
        reactions: m.reactions.map(r => r.id === existingReaction.id ? data : r)
      } : m))
      return
    }

    const { data } = await supabase
      .from('reactions').insert({ moment_id: momentId, author_id: user.id, emoji }).select().single()
    setMoments(prev => prev.map(m => m.id === momentId ? {
      ...m,
      reactions: [...(m.reactions || []), data]
    } : m))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .feed-root {
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
          gap: 16px;
        }

        .back-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.4);
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          padding: 7px 13px;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .back-btn:hover {
          border-color: rgba(255,255,255,0.25);
          color: rgba(255,255,255,0.7);
        }

        .header-info {
          flex: 1;
          min-width: 0;
        }

        .header-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: rgba(255,255,255,0.9);
        }

        .header-sub {
          font-size: 0.72rem;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.05em;
        }

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
        }

        /* MOMENT CARD */
        .moment-card-own {
          background: rgba(192, 80, 58, 0.12);
          border: 1px solid rgba(232, 130, 106, 0.2);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .moment-card-own:hover { border-color: rgba(232, 130, 106, 0.4); }

        .moment-card-theirs {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.09);
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .moment-card-theirs:hover { border-color: rgba(255, 255, 255, 0.18); }

        .moment-img {
          width: 100%;
          max-height: 360px;
          object-fit: cover;
          display: block;
        }

        .moment-body { padding: 16px 18px 6px; }

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
          margin-bottom: 14px;
        }

        .moment-author { display: flex; align-items: center; gap: 8px; }

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

        .author-name { font-size: 0.8rem; color: rgba(255,255,255,0.4); }
        .moment-date { font-size: 0.75rem; color: rgba(255,255,255,0.25); }

        /* REACTIONS */
        .moment-footer {
          padding: 0 18px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        .reaction-chips {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          flex: 1;
        }

        .reaction-chip {
          display: flex;
          align-items: center;
          gap: 3px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 50px;
          padding: 3px 8px 3px 5px;
          font-size: 0.82rem;
          color: rgba(255,255,255,0.4);
          animation: popIn 0.2s ease;
        }

        .reaction-chip.mine {
          border-color: rgba(232, 130, 106, 0.3);
          background: rgba(192, 80, 58, 0.12);
          color: #e8826a;
        }

        @keyframes popIn {
          0% { transform: scale(0.7); opacity: 0; }
          70% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .react-icon-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 50px;
          padding: 5px 10px;
          font-size: 0.9rem;
          cursor: pointer;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .react-icon-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
        }

        .react-icon-btn.reacted {
          border-color: rgba(232, 130, 106, 0.3);
          color: #e8826a;
        }

        .picker-popup {
          position: absolute;
          bottom: 44px;
          left: 0;
          background: #1a0c0c;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50px;
          padding: 8px 12px;
          display: flex;
          gap: 6px;
          z-index: 50;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          animation: slideUp 0.15s ease;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .picker-emoji {
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          padding: 2px 4px;
          border-radius: 6px;
          transition: transform 0.15s;
          line-height: 1;
        }

        .picker-emoji:hover { transform: scale(1.3); }
        .picker-emoji.selected { background: rgba(232, 130, 106, 0.15); }

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

      <div className="feed-root">
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
          <button className="back-btn" onClick={() => router.push('/home')}>
            ← Back
          </button>
          <div className="header-info">
            <div className="header-name">{partner?.display_name}</div>
            <div className="header-sub">Shared moments</div>
          </div>
        </header>

        {/* Feed */}
        <div className="feed-wrap">
          {moments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-emoji">🌱</div>
              <h2 className="empty-title">Your shared story starts here</h2>
              <p className="empty-sub">
                Post your first moment — {partner?.display_name} will see it instantly
              </p>
            </div>
          ) : (
            moments.map(moment => (
              <MomentCard
                key={moment.id}
                moment={moment}
                currentUserId={user.id}
                onReact={handleReaction}
              />
            ))
          )}
        </div>

        {/* FAB */}
        <button
          className="fab"
          onClick={() => router.push(`/moment/new?connectionId=${connection.id}`)}
        >
          <span className="fab-icon">+</span>
          New Moment
        </button>
      </div>
    </>
  )
}

function MomentCard({ moment, currentUserId, onReact }) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef(null)
  const isOwn = moment.author_id === currentUserId
  const date = new Date(moment.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  })

  const reactionMap = {}
  moment.reactions?.forEach(r => {
    if (!reactionMap[r.emoji]) reactionMap[r.emoji] = []
    reactionMap[r.emoji].push(r)
  })

  const myReaction = moment.reactions?.find(r => r.author_id === currentUserId)

  useEffect(() => {
    if (!showPicker) return
    function handleClickOutside(e) {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setShowPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  function handleReactClick(emoji) {
    onReact(moment.id, emoji)
    setShowPicker(false)
  }

  return (
    <div className={isOwn ? 'moment-card-own' : 'moment-card-theirs'}>
      <img src={moment.photo_url} alt="Moment" className="moment-img" />
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

      <div className="moment-footer">
        {/* Show partner reactions on your own moments */}
        {isOwn && Object.keys(reactionMap).length > 0 && (
          <div className="reaction-chips">
            {Object.entries(reactionMap).map(([emoji, reactors]) => (
              <div key={emoji} className="reaction-chip">
                <span>{emoji}</span>
                {reactors.length > 1 && (
                  <span style={{ fontSize: '0.72rem' }}>{reactors.length}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* React button on partner's moments */}
        {!isOwn && (
          <div style={{ position: 'relative' }} ref={pickerRef}>
            <button
              className={`react-icon-btn ${myReaction ? 'reacted' : ''}`}
              onClick={() => setShowPicker(p => !p)}
            >
              {myReaction ? myReaction.emoji : '☺ React'}
            </button>

            {showPicker && (
              <div className="picker-popup">
                {REACTIONS.map(emoji => (
                  <button
                    key={emoji}
                    className={`picker-emoji ${myReaction?.emoji === emoji ? 'selected' : ''}`}
                    onClick={() => handleReactClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}