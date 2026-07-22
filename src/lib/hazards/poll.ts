import { pollUsgsHazards } from '@/lib/hazards/adapters/usgs'
import { pollGdacsHazards } from '@/lib/hazards/adapters/gdacs'
import { pollNhcHazards } from '@/lib/hazards/adapters/nhc'
import { pollNwsHazards } from '@/lib/hazards/adapters/nws'
import { pollFirmsHazards } from '@/lib/hazards/adapters/firms'
import { pollTsunamiHazards } from '@/lib/hazards/adapters/tsunami'
import { pollUsgsWaterHazards } from '@/lib/hazards/adapters/usgs-water'
import { pollReliefwebHazards } from '@/lib/hazards/adapters/reliefweb'
import { pollOpenMeteoHazards } from '@/lib/hazards/adapters/open-meteo'
import { clusterHazardEvents } from '@/lib/hazards/dedupe'
import { recordFeedHealth } from '@/lib/feed-health-server'
import type { HazardEvent, HazardSource } from '@/lib/hazards/types'
import { createAdminClient } from '@/lib/supabase/admin'

const ADAPTERS: Array<{
  source: HazardSource
  label: string
  poll: () => Promise<HazardEvent[]>
}> = [
  { source: 'usgs', label: 'USGS earthquakes', poll: pollUsgsHazards },
  { source: 'gdacs', label: 'GDACS alerts', poll: pollGdacsHazards },
  { source: 'nhc', label: 'NOAA NHC storms', poll: pollNhcHazards },
  { source: 'nws', label: 'NWS alerts', poll: pollNwsHazards },
  { source: 'firms', label: 'NASA FIRMS fires', poll: pollFirmsHazards },
  { source: 'tsunami', label: 'NOAA Tsunami', poll: pollTsunamiHazards },
  { source: 'usgs-water', label: 'USGS water gauges', poll: pollUsgsWaterHazards },
  { source: 'reliefweb', label: 'ReliefWeb disasters', poll: pollReliefwebHazards },
  { source: 'open-meteo', label: 'Open-Meteo weather', poll: pollOpenMeteoHazards },
]

export async function pollAllHazards(): Promise<{
  events: HazardEvent[]
  bySource: Record<string, number>
}> {
  const bySource: Record<string, number> = {}
  const batches = await Promise.all(
    ADAPTERS.map(async (a) => {
      try {
        const events = await a.poll()
        bySource[a.source] = events.length
        await recordFeedHealth({
          feedId: a.source,
          label: a.label,
          ok: true,
          itemCount: events.length,
          meta: { via: 'hazard-poll' },
        })
        return events
      } catch (err) {
        bySource[a.source] = 0
        await recordFeedHealth({
          feedId: a.source,
          label: a.label,
          ok: false,
          error: err instanceof Error ? err.message : 'unknown',
        })
        return [] as HazardEvent[]
      }
    })
  )
  const events = clusterHazardEvents(batches.flat())
  return { events, bySource }
}

export async function persistHazardEvents(events: HazardEvent[]): Promise<number> {
  if (events.length === 0) return 0
  const supabase = createAdminClient()
  const rows = events.map((e) => ({
    id: e.id,
    hazard_type: e.hazard_type,
    severity: e.severity,
    region: e.region,
    lat: e.lat,
    lng: e.lng,
    headline: e.headline,
    issued_at: e.issued_at,
    source: e.source,
    source_url: e.source_url,
    fetched_at: e.fetched_at,
    cluster_id: e.cluster_id ?? null,
    active: true,
    suppressed: false,
    meta: e.meta ?? {},
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from('hazard_events').upsert(rows, { onConflict: 'id' })
  if (error) {
    console.error('[hazards] upsert failed:', error.message)
    return 0
  }

  // Archive resolved: mark rows not seen in this poll as inactive if older than 90d handled separately
  return rows.length
}

export async function runHazardPoll(): Promise<{
  polled: Record<string, number>
  upserted: number
}> {
  const { events, bySource } = await pollAllHazards()
  const upserted = await persistHazardEvents(events)
  return { polled: bySource, upserted }
}

export async function isMonitorPublicEnabled(): Promise<boolean> {
  // Env kill switch (no-deploy if flipped in Vercel)
  if (process.env.VIGIL_MONITOR_PUBLIC_ENABLED === 'false') return false
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'monitor_public_enabled')
      .maybeSingle()
    if (data?.value === false || data?.value === 'false') return false
    return true
  } catch {
    return process.env.VIGIL_MONITOR_PUBLIC_ENABLED !== 'false'
  }
}

export async function listPublicHazards(limit = 80): Promise<HazardEvent[]> {
  try {
    const { createClient } = await import('@/lib/supabase/server')
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('hazard_events')
      .select(
        'id, hazard_type, severity, region, lat, lng, headline, issued_at, source, source_url, fetched_at, cluster_id, active, suppressed, meta'
      )
      .eq('active', true)
      .eq('suppressed', false)
      .order('issued_at', { ascending: false })
      .limit(limit)
    if (error) {
      console.error('[hazards] list failed:', error.message)
      return []
    }
    return (data ?? []) as HazardEvent[]
  } catch {
    return []
  }
}
