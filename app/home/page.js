import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import HomeClient from '@/components/HomeClient'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get all active connections
  const { data: connections } = await supabase
    .from('connections')
    .select(`
      *,
      sender:profiles!connections_sender_id_fkey(id, display_name, avatar_url),
      receiver:profiles!connections_receiver_id_fkey(id, display_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'active')

  // For each connection, get the latest moment as preview
  const connectionsWithPreview = await Promise.all(
    (connections || []).map(async (connection) => {
      const { data: latestMoment } = await supabase
        .from('moments')
        .select('*, author:profiles(display_name)')
        .eq('connection_id', connection.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count } = await supabase
        .from('moments')
        .select('*', { count: 'exact', head: true })
        .eq('connection_id', connection.id)

      return {
        ...connection,
        latestMoment,
        totalMoments: count || 0
      }
    })
  )

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <HomeClient
      user={user}
      profile={profile}
      connections={connectionsWithPreview}
    />
  )
}