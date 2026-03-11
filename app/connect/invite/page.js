'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function InvitePage() {
  const [inviteCode, setInviteCode] = useState('')
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    generateInvite()
  }, [])

  async function generateInvite() {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      setError('Not logged in. Please sign in first.')
      return
    }

    console.log('Logged in as:', user.id)

    // Check if there's already a pending invite
    const { data: existing, error: fetchError } = await supabase
      .from('connections')
      .select('invite_code')
      .eq('sender_id', user.id)
      .eq('status', 'pending')
      .single()

    console.log('Existing invite:', existing, 'Error:', fetchError)

    if (existing) {
      setInviteCode(existing.invite_code)
      setInviteLink(`${window.location.origin}/connect/${existing.invite_code}`)
      return
    }

    // Generate new code
    const code = Math.random().toString(36).substring(2, 6).toUpperCase() +
                 '-' +
                 Math.random().toString(36).substring(2, 6).toUpperCase()

    console.log('Inserting new invite with code:', code, 'for user:', user.id)

    const { data: inserted, error: insertError } = await supabase
      .from('connections')
      .insert({
        sender_id: user.id,
        invite_code: code,
      })
      .select()

    console.log('Insert result:', inserted, 'Insert error:', insertError)

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
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <p className="text-5xl mb-4">💌</p>
        <h2 className="font-lora text-3xl text-rose-800 mb-2">Invite Your Partner</h2>
        <p className="text-gray-500 text-sm mb-8">
          Share this link or code with someone special
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 mb-4">
          <p className="text-xs text-gray-400 mb-2">Your invite code</p>
          <p className="font-lora text-3xl text-rose-700 tracking-widest mb-4">
            {inviteCode || '...'}
          </p>
          <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500 break-all mb-4">
            {inviteLink || 'Generating link...'}
          </div>
          <button
            onClick={copyLink}
            disabled={!inviteLink}
            className="w-full bg-rose-700 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition"
          >
            {copied ? '✓ Copied!' : 'Copy Invite Link'}
          </button>
        </div>

        <p className="text-xs text-gray-400">This invite expires in 72 hours</p>
      </div>
    </div>
  )
}