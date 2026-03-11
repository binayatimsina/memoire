'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

export default function AcceptInvitePage() {
  const [connection, setConnection] = useState(null)
  const [senderProfile, setSenderProfile] = useState(null)
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const router = useRouter()
  const { code } = useParams()
  const supabase = createClient()

  useEffect(() => {
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

    // Check expiry
    if (new Date(conn.expires_at) < new Date()) {
      setStatus('expired'); return
    }

    setConnection(conn)
    setSenderProfile(conn.sender)
    setStatus('ready')
  }

  async function acceptInvite() {
    setStatus('accepting')
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    console.log('Accepting user:', user?.id)
    console.log('Connection to update:', connection?.id)

    if (!user) {
      setError('You must be logged in to accept an invite.')
      setStatus('ready')
      return
    }

    // Check user doesn't already have an active connection
    const { data: existing } = await supabase
      .from('connections')
      .select('id')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .eq('status', 'active')
      .maybeSingle()

    if (existing) {
      setError('You already have an active connection.')
      setStatus('ready')
      return
    }

    // Update the connection
    const { data: updated, error: updateError } = await supabase
      .from('connections')
      .update({ receiver_id: user.id, status: 'active' })
      .eq('id', connection.id)
      .select()

    console.log('Update result:', updated)
    console.log('Update error:', updateError)

    if (updateError) {
      setError(`Failed to connect: ${updateError.message}`)
      setStatus('ready')
      return
    }

    router.push('/home')
  }

  if (status === 'loading') return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400">Loading invite...</p>
    </div>
  )

  if (status === 'invalid' || status === 'expired') return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <p className="text-5xl mb-4">😕</p>
        <h2 className="font-lora text-2xl text-rose-800 mb-2">
          {status === 'expired' ? 'Invite Expired' : 'Invalid Invite'}
        </h2>
        <p className="text-gray-500 text-sm">Ask your partner to send a new invite link.</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-5xl mb-4">🤝</p>
        <h2 className="font-lora text-3xl text-rose-800 mb-2">You're invited!</h2>
        <p className="text-gray-500 text-sm mb-8">
          <span className="font-medium text-rose-700">{senderProfile?.display_name}</span>
          {' '}wants to share moments with you on Memoire
        </p>

        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

        <button
          onClick={acceptInvite}
          disabled={status === 'accepting'}
          className="w-full bg-rose-700 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition"
        >
          {status === 'accepting' ? 'Connecting...' : 'Accept & Connect'}
        </button>
      </div>
    </div>
  )
}