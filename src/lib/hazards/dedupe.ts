import type { HazardEvent } from '@/lib/hazards/types'

/**
 * Cross-source dedupe: link USGS + GDACS earthquakes that are close in space/time.
 * Severity tiers stay agency-native; we only share a cluster_id.
 */
const EQ_KM = 80
const EQ_MS = 6 * 60 * 60 * 1000 // 6 hours

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
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

export function clusterHazardEvents(events: HazardEvent[]): HazardEvent[] {
  const eqs = events.filter(
    (e) =>
      e.hazard_type === 'earthquake' &&
      e.lat != null &&
      e.lng != null &&
      (e.source === 'usgs' || e.source === 'gdacs')
  )
  const clusterOf = new Map<string, string>()

  for (let i = 0; i < eqs.length; i++) {
    for (let j = i + 1; j < eqs.length; j++) {
      const a = eqs[i]
      const b = eqs[j]
      if (a.source === b.source) continue
      if (a.lat == null || a.lng == null || b.lat == null || b.lng == null) continue
      const dt = Math.abs(Date.parse(a.issued_at) - Date.parse(b.issued_at))
      if (dt > EQ_MS) continue
      if (haversineKm({ lat: a.lat, lng: a.lng }, { lat: b.lat, lng: b.lng }) > EQ_KM) continue
      const clusterId = clusterOf.get(a.id) ?? clusterOf.get(b.id) ?? `eq:${a.id}`
      clusterOf.set(a.id, clusterId)
      clusterOf.set(b.id, clusterId)
    }
  }

  return events.map((e) =>
    clusterOf.has(e.id) ? { ...e, cluster_id: clusterOf.get(e.id) } : e
  )
}
