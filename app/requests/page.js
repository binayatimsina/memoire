'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
    loadRequests()
  }, [])

  async function loadRequests() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    setCurrentUser(user)

    const { data } = await supabase
      .from('connection_requests')
      .select('*, sender:profiles!connection_requests_sender_id_fkey(id, display_name, username)')
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })

    setRequests(data || [])
    setLoading(false)
  }

  async function acceptRequest(request) {
    const { error: connError } = await supabase
      .from('connections')
      .insert({
        sender_id: request.sender_id,
        receiver_id: currentUser.id,
        status: 'active'
      })

    if (connError) {
      console.error('Connection error:', connError)
      return
    }

    // Update request status
    await supabase
      .from('connection_requests')
      .update({ status: 'accepted' })
      .eq('id', request.id)

    // Remove from local state
    setRequests(prev => prev.filter(r => r.id !== request.id))

    router.push('/home')
  }

  async function declineRequest(requestId) {
    await supabase
      .from('connection_requests')
      .update({ status: 'declined' })
      .eq('id', requestId)

    setRequests(prev => prev.filter(r => r.id !== requestId))
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .req-root {
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
          flex: 1;
        }

        .header-count {
          background: linear-gradient(135deg, #c0503a, #e8826a);
          color: #fff;
          font-size: 0.72rem;
          font-weight: 600;
          border-radius: 50px;
          padding: 3px 10px;
          flex-shrink: 0;
        }

        .page-body {
          position: relative;
          z-index: 1;
          max-width: 560px;
          margin: 0 auto;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* REQUEST CARD */
        .request-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .request-avatar {
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

        .request-info {
          flex: 1;
          min-width: 0;
        }

        .request-name {
          font-size: 0.95rem;
          color: rgba(255,255,255,0.88);
          margin-bottom: 2px;
        }

        .request-username {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.3);
          margin-bottom: 4px;
        }

        .request-text {
          font-size: 0.78rem;
          color: rgba(255,255,255,0.25);
          font-style: italic;
        }

        .request-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex-shrink: 0;
        }

        .accept-btn {
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
        }

        .accept-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .decline-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          padding: 7px 16px;
          font-size: 0.8rem;
          color: rgba(255,255,255,0.3);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .decline-btn:hover {
          border-color: rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.6);
        }

        /* EMPTY STATE */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px;
          min-height: 50vh;
        }

        .empty-emoji {
          font-size: 3rem;
          margin-bottom: 16px;
          display: block;
          animation: pulse 3s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }

        .empty-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          color: rgba(255,255,255,0.7);
          margin-bottom: 8px;
        }

        .empty-sub {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
          line-height: 1.6;
          max-width: 240px;
        }

        .loading-text {
          text-align: center;
          padding: 60px;
          font-size: 0.85rem;
          color: rgba(255,255,255,0.3);
        }
      `}</style>

      <div className="req-root">
        <div className="bg-layer" />

        <header className="header">
          <button className="back-btn" onClick={() => router.push('/home')}>
            ← Back
          </button>
          <h2 className="header-title">Connection Requests</h2>
          {requests.length > 0 && (
            <span className="header-count">{requests.length} pending</span>
          )}
        </header>

        <div className="page-body">
          {loading ? (
            <p className="loading-text">Loading requests...</p>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">📭</span>
              <h3 className="empty-title">No pending requests</h3>
              <p className="empty-sub">
                When someone sends you a connection request it will appear here
              </p>
            </div>
          ) : (
            requests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-avatar">
                  {request.sender?.display_name?.[0]?.toUpperCase()}
                </div>
                <div className="request-info">
                  <div className="request-name">{request.sender?.display_name}</div>
                  <div className="request-username">@{request.sender?.username}</div>
                  <div className="request-text">wants to share moments with you</div>
                </div>
                <div className="request-actions">
                  <button
                    className="accept-btn"
                    onClick={() => acceptRequest(request)}
                  >
                    Accept
                  </button>
                  <button
                    className="decline-btn"
                    onClick={() => declineRequest(request.id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}