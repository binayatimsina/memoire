'use client'
import { useState } from 'react'
import MomentCard from './MomentCard'
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
    <div className="max-w-md mx-auto min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 bg-[#fdf8f3] border-b border-rose-100 px-4 py-4 flex items-center justify-between z-10">
        <h1 className="font-lora text-2xl text-rose-800">Memoire</h1>
        <div className="flex items-center gap-3">
          {partner && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Connected with</p>
              <p className="text-sm font-medium text-rose-700">{partner.display_name}</p>
            </div>
          )}
          <button onClick={handleSignOut} className="text-xs text-gray-400 hover:text-gray-600">
            Sign out
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-4">
        {!connection ? (
          // No connection yet
          <div className="text-center mt-16">
            <p className="text-5xl mb-4">💌</p>
            <h2 className="font-lora text-2xl text-rose-800 mb-2">
              Connect with someone special
            </h2>
            <p className="text-gray-500 text-sm mb-6">
              Invite your partner to start sharing moments together
            </p>
            <button
              onClick={() => router.push('/connect/invite')}
              className="bg-rose-700 text-white rounded-xl px-6 py-3 text-sm font-medium hover:bg-rose-800 transition"
            >
              Send an Invite
            </button>
          </div>
        ) : moments.length === 0 ? (
          // Connected but no moments yet
          <div className="text-center mt-16">
            <p className="text-5xl mb-4">🌱</p>
            <h2 className="font-lora text-2xl text-rose-800 mb-2">
              Your story starts here
            </h2>
            <p className="text-gray-500 text-sm">
              Share your first moment with {partner?.display_name}
            </p>
          </div>
        ) : (
          // Show moments feed
          <div className="space-y-6">
            {moments.map(moment => (
              <MomentCard key={moment.id} moment={moment} currentUserId={user.id} />
            ))}
          </div>
        )}
      </div>

      {/* Floating action button */}
      {connection && (
        <button
          onClick={() => router.push('/moment/new')}
          className="fixed bottom-6 right-6 bg-rose-700 text-white w-14 h-14 rounded-full text-2xl shadow-lg hover:bg-rose-800 transition flex items-center justify-center"
        >
          +
        </button>
      )}
    </div>
  )
}