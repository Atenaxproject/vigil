import { getNwsAlertsByState } from '@/lib/feeds/nws'
import type { HazardEvent } from '@/lib/hazards/types'

/** NWS active alerts for priority US watch states — severity = NWS Extreme/Severe/…. */
const STATES = ['FL', 'TX', 'LA', 'AL', 'MS', 'GA', 'SC', 'NC', 'CA', 'OR', 'WA']

function centroid(geometry: GeoJSON.Geometry | null): { lat: number; lng: number } | null {
  if (!geometry) return null
  if (geometry.type === 'Point') {
    const [lng, lat] = geometry.coordinates as [number, number]
    return { lat, lng }
  }
  // Use first ring first point for polygons — approximate only
  if (geometry.type === 'Polygon') {
    const [lng, lat] = geometry.coordinates[0][0] as [number, number]
    return { lat, lng }
  }
  if (geometry.type === 'MultiPolygon') {
    const [lng, lat] = geometry.coordinates[0][0][0] as [number, number]
    return { lat, lng }
  }
  return null
}

export async function pollNwsHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  const batches = await Promise.all(STATES.map((s) => getNwsAlertsByState(s)))
  const seen = new Set<string>()
  const out: HazardEvent[] = []

  for (const alerts of batches) {
    for (const a of alerts) {
      if (seen.has(a.id)) continue
      // Extreme / Severe only for public monitor volume control
      if (a.severity !== 'Extreme' && a.severity !== 'Severe') continue
      seen.add(a.id)
      const c = centroid(a.geometry)
      out.push({
        id: `nws:${a.id}`,
        hazard_type: 'weather_alert',
        severity: a.severity,
        region: a.event,
        lat: c?.lat ?? null,
        lng: c?.lng ?? null,
        headline: a.headline || a.event,
        issued_at: a.effective || fetched_at,
        source: 'nws',
        source_url: `https://api.weather.gov/alerts/${encodeURIComponent(a.id.replace('urn:oid:', ''))}`,
        fetched_at,
        meta: { urgency: a.urgency, certainty: a.certainty, expires: a.expires },
      })
    }
  }
  return out
}
