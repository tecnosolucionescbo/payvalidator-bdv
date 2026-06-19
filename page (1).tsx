import { useEffect, useRef } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { getSupabaseClient } from '@/lib/supabase'

type Table = 'orders' | 'payments_received' | 'payment_logs'
type Event = 'INSERT' | 'UPDATE' | 'DELETE' | '*'

interface UseRealtimeOptions {
  table: Table
  event?: Event
  filter?: string
  onchange: () => void
}

/**
 * Subscribe to real-time changes on a Supabase table.
 * Calls `onchange` whenever a matching event fires.
 */
export function useRealtime({ table, event = '*', filter, onchange }: UseRealtimeOptions) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onchangeRef = useRef(onchange)

  // Keep callback ref up to date without triggering re-subscriptions
  useEffect(() => { onchangeRef.current = onchange }, [onchange])

  useEffect(() => {
    const supabase = getSupabaseClient()
    const channelName = `${table}-${event}-${filter ?? 'all'}-${Date.now()}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event, schema: 'public', table, filter },
        () => onchangeRef.current()
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, event, filter])
}
