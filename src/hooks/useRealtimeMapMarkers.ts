'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import type { MapMarker, RegionScope } from '@/types/vigil.types'

export function useRealtimeMapMarkers(initialMarkers: MapMarker[], regionScope: RegionScope = 'venezuela') {
  const [markers, setMarkers] = useState<MapMarker[]>(initialMarkers)

  useEffect(() => {
    setMarkers(initialMarkers)
  }, [initialMarkers])

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const { data } = await supabase
      .from('map_markers')
      .select(
        'id, type, category, title, description, lat, lng, estado, municipio, urgent, status, verified, source, created_at, hours_schedule, accepts_categories, organizer_name, region_scope'
      )
      .eq('status', 'active')
      .eq('flagged', false)
      .eq('region_scope', regionScope)
      .limit(200)

    if (data) {
      setMarkers(
        data.map((m) => ({
          ...m,
          lat: Number(m.lat),
          lng: Number(m.lng),
          contact: null,
        })) as MapMarker[]
      )
    }
  }, [regionScope])

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('map-markers-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'map_markers' }, () => {
        void refresh()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh])

  return markers
}
