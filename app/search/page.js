'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sentRequests, setSentRequests] = useState({})
  const [existingConnections, setExistingConnections] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadCurrentUser()
  }, [])

  async function loadCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    // Load existing connections to filter them out
    const { data: connections } = await supabase
      .from('connections')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'active')

    const connectedIds = (connections || []).map(c =>
      c.sender_id === user.id ? c.receiver_id : c.sender_id
    )
    setExistingConnections(connectedIds)

    // Load sent requests
    const { data: sentReqs } = await supabase
      .from('connection_requests')
      .select('receiver_id')
      .eq('sender_id', user.id)
      .eq('status', 'pending')

    // Load received requests
    const { data: receivedReqs } = await supabase
      .from('connection_requests')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')

    const sentMap = {}
    ;(sentReqs || []).forEach(r => { sentMap[r.receiver_id] = 'sent' })
    ;(receivedReqs || []).forEach(r => { sentMap[r.sender_id] = 'received' })
    setSentRequests(sentMap)
  }

  // Search with debounce
  useEffect(() => {
    if (!query.trim() || !currentUser) {
      setResults([])
      return
    }

    setSearching(true)
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username')
        .ilike('username', `%${query.replace('@', '')}%`)
        .neq('id', currentUser.id)
        .limit(10)

      setResults(data || [])
      setSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [query, currentUser])

  async function sendRequest(receiverId) {
    const { error } = await supabase
      .from('connection_requests')
      .insert({
        sender_id: currentUser.id,
        receiver_id: receiverId
      })

    if (!error || error.code === '23505') {
      // 23505 = unique violation, request already exists — treat as success
      setSentRequests(prev => ({ ...prev, [receiverId]: 'sent' }))
    }
  }

  async function cancelRequest(receiverId) {
    await supabase
      .from('connection_requests')
      .delete()
      .eq('sender_id', currentUser.id)
      .eq('receiver_id', receiverId)

    setSentRequests(prev => {
      const updated = { ...prev }
      delete updated[receiverId]
      return updated
    })
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .search-root {
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

        .header-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          color: rgba(255,255,255,0.9);
        }

        .page-body {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 24px 16px;
        }

        /* SEARCH BOX */
        .search-wrap {
          position: relative;
          margin-bottom: 24px;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.25);
          font-size: 1rem;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          padding: 14px 16px 14px 40px;
          font-size: 0.95rem;
          color: rgba(255,255,255,0.9);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
          -webkit-appearance: none;
        }

        .search-input::placeholder { color: rgba(255,255,255,0.2); }

        .search-input:focus {
          border-color: rgba(232, 130, 106, 0.5);
          background: rgba(255,255,255,0.07);
        }

        /* RESULTS */
        .results-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .result-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: border-color 0.2s;
        }

        .result-card:hover {
          border-color: rgba(232,130,106,0.2);
        }

        .result-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c0503a, #e8826a);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', serif;
          font-size: 1.1rem;
          color: #fff;
          flex-shrink: 0;
        }

        .result-info {
          flex: 1;
          min-width: 0;
        }

        .result-name {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.88);
          margin-bottom: 2px;
        }

        .result-username {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
        }

        .connect-btn {
          background: linear-gradient(135deg, #c0503a 0%, #e8826a 100%);
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.8rem;
          font-weight: 500;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.15s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .connect-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .cancel-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .cancel-btn:hover {
          border-color: rgba(255,255,255,0.2);
          color: rgba(255,255,255,0.6);
        }

        .connected-badge {
          font-size: 0.78rem;
          color: rgba(109,187,138,0.8);
          background: rgba(109,187,138,0.1);
          border: 1px solid rgba(109,187,138,0.2);
          border-radius: 8px;
          padding: 7px 12px;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .pending-badge {
          font-size: 0.78rem;
          color: rgba(232,130,106,0.8);
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* EMPTY / HINT STATES */
        .hint-state {
          text-align: center;
          padding: 60px 24px;
        }

        .hint-emoji {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
        }

        .hint-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 8px;
        }

        .hint-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.6;
        }

        .no-results {
          text-align: center;
          padding: 40px 24px;
        }

        .no-results-text {
          font-size: 0.88rem;
          color: rgba(255,255,255,0.3);
        }

        .searching-text {
          text-align: center;
          padding: 40px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="search-root">
        <div className="bg-layer" />

        <header className="header">
          <button className="back-btn" onClick={() => router.push('/home')}>
            ← Back
          </button>
          <h2 className="header-title">Find Someone</h2>
        </header>

        <div className="page-body">
          {/* Search input */}
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by @username"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          {/* States */}
          {!query && (
            <div className="hint-state">
              <span className="hint-emoji">👥</span>
              <h3 className="hint-title">Find your people</h3>
              <p className="hint-sub">
                Search for someone by their username to send them a connection request
              </p>
            </div>
          )}

          {query && searching && (
            <p className="searching-text">Searching...</p>
          )}

          {query && !searching && results.length === 0 && (
            <div className="no-results">
              <p className="no-results-text">
                No users found for <strong style={{ color: 'rgba(255,255,255,0.5)' }}>@{query.replace('@', '')}</strong>
              </p>
            </div>
          )}

          {/* Results */}
          {results.length > 0 && (
            <div className="results-list">
              {results.map(profile => {
                const isConnected = existingConnections.includes(profile.id)

                return (
                  <div key={profile.id} className="result-card">
                    <div className="result-avatar">
                      {profile.display_name?.[0]?.toUpperCase()}
                    </div>
                    <div className="result-info">
                      <div className="result-name">{profile.display_name}</div>
                      <div className="result-username">@{profile.username}</div>
                    </div>

                    {isConnected ? (
                      <span className="connected-badge">✓ Connected</span>
                    ) : sentRequests[profile.id] === 'sent' ? (
                      <>
                        <span className="pending-badge">Requested</span>
                        <button
                          className="cancel-btn"
                          onClick={() => cancelRequest(profile.id)}
                        >
                          Cancel
                        </button>
                      </>
                    ) : sentRequests[profile.id] === 'received' ? (
                      <span className="pending-badge">↩ They requested you</span>
                    ) : (
                      <button
                        className="connect-btn"
                        onClick={() => sendRequest(profile.id)}
                      >
                        Connect
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}