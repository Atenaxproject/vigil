import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'
import {
  getAlertAftershockCount,
  getVenezuelaSeismicEvents,
  getVenezuelaSeismicFetch,
  type SeismicFetchResult,
} from '@/lib/usgs'
import { getEmscVenezuelaEvents } from '@/lib/emsc'

const DEDUPE_KM = 50
const DEDUPE_MS = 6 * 60 * 60 * 1000

function haversineKm(a: SeismicEvent, b: SeismicEvent): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

/**
 * Merge USGS + EMSC. Prefer USGS on proximity+time overlap; keep EMSC-only events.
 * FUNVISIS still HTML-only — not scraped (prompt 41/69).
 */
export function mergeSeismicSources(
  usgs: SeismicEvent[],
  emsc: SeismicEvent[]
): SeismicEvent[] {
  const merged = [...usgs]
  for (const e of emsc) {
    const dup = merged.some(
      (u) =>
        Math.abs(u.time - e.time) < DEDUPE_MS && haversineKm(u, e) < DEDUPE_KM
    )
    if (!dup) merged.push(e)
  }
  return merged.sort((a, b) => b.time - a.time)
}

/**
 * Merged seismic feed for map and /informacion (prompt 69).
 */
export async function getMergedSeismicEvents(): Promise<SeismicEvent[]> {
  const [usgsEvents, emscEvents] = await Promise.all([
    getVenezuelaSeismicEvents(),
    getEmscVenezuelaEvents(),
  ])
  return mergeSeismicSources(usgsEvents, emscEvents)
}

export async function getMergedSeismicFetch(): Promise<SeismicFetchResult> {
  const usgs = await getVenezuelaSeismicFetch()
  const emscEvents = await getEmscVenezuelaEvents(usgs.windowDays)
  const events = mergeSeismicSources(usgs.events, emscEvents)
  return { ...usgs, events, ok: usgs.ok || events.length > 0 }
}

/**
 * Live aftershock total from aggregated feed since crisis start (prompt 69 B4).
 * Intentionally crisis-pinned — this is a cumulative sequence count, not the banner M4+.
 */
export async function getLiveAftershockTotal(): Promise<{
  total: number
  m4Plus: number
  ok: boolean
}> {
  const start = CRISIS_CONFIG.seismic.startDate
  const crisisDays = Math.max(
    1,
    Math.ceil((Date.now() - Date.parse(`${start}T00:00:00Z`)) / (24 * 60 * 60 * 1000)) + 1
  )
  const [usgs, emsc] = await Promise.all([
    getVenezuelaSeismicFetch(crisisDays, { limit: 2000 }),
    getEmscVenezuelaEvents(crisisDays),
  ])
  const events = mergeSeismicSources(usgs.events, emsc)
  const threshold = CRISIS_CONFIG.seismic.alertThresholdMag
  return {
    total: events.length,
    m4Plus: events.filter((e) => e.magnitude >= threshold).length,
    ok: usgs.ok || events.length > 0,
  }
}

export { getAlertAftershockCount }

export function countAlertEvents(events: SeismicEvent[]): number {
  return events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag).length
}
