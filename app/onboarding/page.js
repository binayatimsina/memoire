'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)
    }
    getUser()
  }, [])

  async function handleContinue() {
    if (!displayName.trim() || !user) return
    setLoading(true)

    await supabase
      .from('profiles')
      .update({ display_name: displayName.trim() })
      .eq('id', user.id)

    router.push('/home')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <h2 className="font-lora text-3xl text-rose-800 mb-2">One last thing</h2>
        <p className="text-gray-500 text-sm mb-8">What should your partner call you?</p>

        <input
          type="text"
          placeholder="Your name"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm focus:outline-none focus:border-rose-300 bg-white text-center text-lg"
        />

        <button
          onClick={handleContinue}
          disabled={loading || !displayName.trim() || !user}
          className="w-full bg-rose-700 text-white rounded-xl py-3 text-sm font-medium hover:bg-rose-800 disabled:opacity-50 transition"
        >
          {loading ? 'Saving...' : 'Continue →'}
        </button>
      </div>
    </div>
  )
}