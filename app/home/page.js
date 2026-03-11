import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MomentCard from '@/components/MomentCard'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get user's active connection
  const { data: connection } = await supabase
    .from('connections')
    .select('*, sender:profiles!connections_sender_id_fkey(display_name, avatar_url), receiver:profiles!connections_receiver_id_fkey(display_name, avatar_url)')
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'active')
    .single()

  // Get moments if connected
  let moments = []
  if (connection) {
    const { data } = await supabase
      .from('moments')
      .select('*, author:profiles(display_name, avatar_url)')
      .eq('connection_id', connection.id)
      .order('created_at', { ascending: false })
      .limit(20)
    moments = data || []
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <HomeClient
      user={user}
      profile={profile}
      connection={connection}
      initialMoments={moments}
    />
  )
}