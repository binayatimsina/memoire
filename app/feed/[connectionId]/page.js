import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedClient from '@/components/FeedClient'

export default async function FeedPage({ params }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { connectionId } = await params

  // Get the connection and verify user is part of it
  const { data: connection } = await supabase
    .from('connections')
    .select(`
      *,
      sender:profiles!connections_sender_id_fkey(id, display_name, avatar_url),
      receiver:profiles!connections_receiver_id_fkey(id, display_name, avatar_url)
    `)
    .eq('id', connectionId)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .eq('status', 'active')
    .single()

  // If connection not found or user is not part of it, redirect home
  if (!connection) redirect('/home')

  // Get moments for this connection
  const { data: moments } = await supabase
    .from('moments')
    .select('*, author:profiles(display_name, avatar_url), reactions(*)')
    .eq('connection_id', connectionId)
    .order('created_at', { ascending: false })
    .limit(20)

  const partner = connection.sender_id === user.id
    ? connection.receiver
    : connection.sender

  return (
    <FeedClient
      user={user}
      connection={connection}
      partner={partner}
      initialMoments={moments || []}
    />
  )
}