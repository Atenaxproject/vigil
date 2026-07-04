import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'

const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

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
    const params = new URLSearchParams({
      format: 'geojson',
      minlatitude: String(mapBounds.minLat),
      maxlatitude: String(mapBounds.maxLat),
      minlongitude: String(mapBounds.minLng),
      maxlongitude: String(mapBounds.maxLng),
      orderby: 'time',
      limit: '300',
      starttime: seismic.startDate,
      minmagnitude: String(seismic.minMagnitudeDisplay),
    })

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: 300 },
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
