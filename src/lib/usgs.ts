import { CRISIS_CONFIG, getDataFeed } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'

const USGS_FEED = getDataFeed('usgs')
const BASE = USGS_FEED?.url ?? 'https://earthquake.usgs.gov/fdsnws/event/1/query'
const REVALIDATE = USGS_FEED?.cacheSeconds ?? 300

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

export function getMagnitudeColor(mag: number): string {
  if (mag < 2.5) return '#22c55e'
  if (mag < 4.0) return '#f59e0b'
  if (mag < 5.5) return '#f97316'
  if (mag < 7.0) return '#ef4444'
  return '#7c3aed'
}

export async function getVenezuelaSeismicEvents(): Promise<SeismicEvent[]> {
  try {
    const { mapBounds, seismic } = CRISIS_CONFIG
    // Rolling 30-day window with the crisis date as a floor: keeps the feed
    // current as the sequence ages instead of pinning to June 24 forever
    // (limit 300 newest-first would eventually fill with old events).
    const rollingStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const crisisStart = new Date(`${seismic.startDate}T00:00:00Z`)
    const starttime = (rollingStart > crisisStart ? rollingStart : crisisStart)
      .toISOString()
      .slice(0, 10)
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
      next: { revalidate: REVALIDATE },
    })

    if (!res.ok) return []

    const data = (await res.json()) as UsgsGeoJson
    return data.features
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
  } catch {
    return []
  }
}

export function countAlertEvents(events: SeismicEvent[]): number {
  return events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag).length
}
