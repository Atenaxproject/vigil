'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { PublicRescuerPresence } from '@/types/vigil.types'

const SELECT =
  'id, display_name, team_or_org, presence_type, lat, lng, status, last_checkin, notes, auto_expire_at, created_at'

export function useRealtimeRescuerPresence() {
  const [presence, setPresence] = useState<PublicRescuerPresence[]>([])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('rescuer_presence')
      .select(SELECT)
      .neq('status', 'signed_off')
      .gt('auto_expire_at', new Date().toISOString())

    if (data) {
      setPresence(
        data.map((p) => ({
          ...p,
          lat: Number(p.lat),
          lng: Number(p.lng),
        })) as PublicRescuerPresence[]
      )
    }
  }, [])

  useEffect(() => {
    void refresh()
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('rescuer-presence-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rescuer_presence' }, () => {
        void refresh()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return presence
}
