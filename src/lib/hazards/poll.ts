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
import {
  type HazardShardId,
  shouldCooldownFeed,
  sourcesForShard,
} from '@/lib/hazards/shards'
import type { HazardEvent, HazardSource } from '@/lib/hazards/types'
import { createAdminClient } from '@/lib/supabase/admin'
import { FEED_FETCH_TIMEOUT_MS, withTimeout } from '@/lib/with-timeout'

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

async function loadTimeoutCooldowns(sources: HazardSource[]): Promise<Set<HazardSource>> {
  const skipped = new Set<HazardSource>()
  if (sources.length === 0) return skipped
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('feed_health')
      .select('feed_id, last_error, last_attempt_at')
      .in('feed_id', sources)
    if (error || !data) return skipped
    for (const row of data) {
      if (
        shouldCooldownFeed({
          lastError: row.last_error,
          lastAttemptAt: row.last_attempt_at,
        })
      ) {
        skipped.add(row.feed_id as HazardSource)
      }
    }
  } catch {
    /* cooldown is best-effort — never block the poll */
  }
  return skipped
}

export async function pollAllHazards(options?: {
  sources?: HazardSource[]
}): Promise<{
  events: HazardEvent[]
  bySource: Record<string, number>
  skipped: string[]
}> {
  const allow = options?.sources ? new Set(options.sources) : null
  const selected = allow ? ADAPTERS.filter((a) => allow.has(a.source)) : ADAPTERS
  const cooldown = await loadTimeoutCooldowns(selected.map((a) => a.source))
  const skipped: string[] = []
  const bySource: Record<string, number> = {}

  const batches = await Promise.all(
    selected.map(async (a) => {
      if (cooldown.has(a.source)) {
        // Do not rewrite feed_health here — that would extend the cooldown window.
        skipped.push(a.source)
        bySource[a.source] = 0
        return [] as HazardEvent[]
      }
      try {
        const events = await withTimeout(a.poll(), FEED_FETCH_TIMEOUT_MS, a.label)
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
  return { events, bySource, skipped }
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

  return rows.length
}

export async function runHazardPoll(options?: {
  shard?: HazardShardId
}): Promise<{
  polled: Record<string, number>
  upserted: number
  skipped: string[]
  shard: HazardShardId | 'all'
}> {
  const sources = options?.shard ? sourcesForShard(options.shard) : undefined
  const { events, bySource, skipped } = await pollAllHazards({ sources })
  const upserted = await persistHazardEvents(events)
  return {
    polled: bySource,
    upserted,
    skipped,
    shard: options?.shard ?? 'all',
  }
}

export async function isMonitorPublicEnabled(): Promise<boolean> {
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
