import { CRISIS_CONFIG, getDataFeed } from '@/config/crisis.config'
import { usgsSourceUrl } from '@/lib/feed-health'
import { recordFeedHealth } from '@/lib/feed-health-server'
import type { SeismicEvent } from '@/types/vigil.types'

const USGS_FEED = getDataFeed('usgs')
const BASE = USGS_FEED?.url ?? 'https://earthquake.usgs.gov/fdsnws/event/1/query'
const REVALIDATE = USGS_FEED?.cacheSeconds ?? 300

/** Banner / alert count: true rolling window so M4+ ages out (prompt 67). */
export const ALERT_WINDOW_DAYS = CRISIS_CONFIG.seismic.alertWindowDays ?? 7
/** Map markers: longer rolling window for situational context. */
export const MAP_WINDOW_DAYS = CRISIS_CONFIG.seismic.mapWindowDays ?? 30

interface UsgsFeature {
  id: string
  properties: {
    mag: number | null
    place: string
    time: number
    url: string
  }
  geometry: {
    coordinates: [number, number, number]
  }
}

interface UsgsGeoJson {
  features: UsgsFeature[]
}

export interface SeismicFetchResult {
  events: SeismicEvent[]
  fetchedAt: string
  starttime: string
  windowDays: number
  ok: boolean
  sourceUrl: string
}

export function getMagnitudeColor(mag: number): string {
  if (mag < 2.5) return '#22c55e'
  if (mag < 4.0) return '#f59e0b'
  if (mag < 5.5) return '#f97316'
  if (mag < 7.0) return '#ef4444'
  return '#7c3aed'
}

function rollingStartIso(windowDays: number): string {
  // Pure rolling window — do NOT floor at crisisDate. A crisis-pinned
  // starttime produced the frozen "20 réplicas M4.0+" banner (prompt 67).
  return new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

async function fetchUsgsWindow(windowDays: number): Promise<SeismicFetchResult> {
  const fetchedAt = new Date().toISOString()
  const sourceUrl = usgsSourceUrl()
  const starttime = rollingStartIso(windowDays)

  try {
    const { mapBounds, seismic } = CRISIS_CONFIG
    const params = new URLSearchParams({
      format: 'geojson',
      minlatitude: String(mapBounds.minLat),
      maxlatitude: String(mapBounds.maxLat),
      minlongitude: String(mapBounds.minLng),
      maxlongitude: String(mapBounds.maxLng),
      orderby: 'time',
      limit: '300',
      starttime,
      minmagnitude: String(seismic.minMagnitudeDisplay),
    })

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: REVALIDATE, tags: ['usgs-seismic'] },
    })

    if (!res.ok) {
      await recordFeedHealth({
        feedId: 'usgs',
        label: 'USGS seismic',
        ok: false,
        error: `HTTP ${res.status}`,
        meta: { windowDays, starttime },
      })
      return { events: [], fetchedAt, starttime, windowDays, ok: false, sourceUrl }
    }

    const data = (await res.json()) as UsgsGeoJson
    const events = data.features
      .filter((f) => f.properties.mag !== null)
      .map((f) => ({
        id: f.id,
        magnitude: f.properties.mag as number,
        place: f.properties.place,
        time: f.properties.time,
        lat: f.geometry.coordinates[1],
        lng: f.geometry.coordinates[0],
        depth: f.geometry.coordinates[2],
        url: f.properties.url,
        source: 'USGS' as const,
      }))

    await recordFeedHealth({
      feedId: 'usgs',
      label: 'USGS seismic',
      ok: true,
      itemCount: events.length,
      meta: { windowDays, starttime },
    })

    return { events, fetchedAt, starttime, windowDays, ok: true, sourceUrl }
  } catch (err) {
    await recordFeedHealth({
      feedId: 'usgs',
      label: 'USGS seismic',
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
      meta: { windowDays, starttime },
    })
    return { events: [], fetchedAt, starttime, windowDays, ok: false, sourceUrl }
  }
}

/** Map + feed: rolling MAP_WINDOW_DAYS (events age out). */
export async function getVenezuelaSeismicEvents(): Promise<SeismicEvent[]> {
  const result = await fetchUsgsWindow(MAP_WINDOW_DAYS)
  return result.events
}

/** Full result with freshness metadata for banner / staleness UI. */
export async function getVenezuelaSeismicFetch(
  windowDays: number = MAP_WINDOW_DAYS
): Promise<SeismicFetchResult> {
  return fetchUsgsWindow(windowDays)
}

/**
 * M4.0+ count for the emergency banner — rolling ALERT_WINDOW_DAYS only.
 * Crisis-pinned cumulative counts freeze once the sequence plateaus.
 */
export async function getAlertAftershockCount(): Promise<{
  count: number
  fetchedAt: string
  ok: boolean
  sourceUrl: string
  windowDays: number
}> {
  const result = await fetchUsgsWindow(ALERT_WINDOW_DAYS)
  const threshold = CRISIS_CONFIG.seismic.alertThresholdMag
  const count = result.ok
    ? result.events.filter((e) => e.magnitude >= threshold).length
    : 0
  return {
    count,
    fetchedAt: result.fetchedAt,
    ok: result.ok,
    sourceUrl: result.sourceUrl,
    windowDays: ALERT_WINDOW_DAYS,
  }
}

export function countAlertEvents(events: SeismicEvent[]): number {
  return events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag).length
}
