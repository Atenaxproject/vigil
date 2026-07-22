import { CRISIS_CONFIG, getDataFeed } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'

/**
 * EMSC / seismicportal.eu FDSN event query (prompt 69 B1).
 * Free, keyless; often reports global events faster than USGS.
 */
const EMSC_FEED = getDataFeed('emsc')
const BASE =
  EMSC_FEED?.url ?? 'https://www.seismicportal.eu/fdsnws/event/1/query'
const REVALIDATE = EMSC_FEED?.cacheSeconds ?? 300

interface EmscFeature {
  id?: string
  properties?: {
    mag?: number | null
    flynn_region?: string
    place?: string
    time?: string | number
    lastupdate?: string
    auth?: string
    depth?: number
    lat?: number
    lon?: number
    unid?: string
  }
  geometry?: {
    coordinates?: [number, number, number]
  }
}

interface EmscGeoJson {
  features?: EmscFeature[]
}

function rollingStartIso(windowDays: number): string {
  return new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

export async function getEmscVenezuelaEvents(
  windowDays: number = CRISIS_CONFIG.seismic.mapWindowDays ?? 30
): Promise<SeismicEvent[]> {
  try {
    const { mapBounds, seismic } = CRISIS_CONFIG
    const params = new URLSearchParams({
      format: 'json',
      minlat: String(mapBounds.minLat),
      maxlat: String(mapBounds.maxLat),
      minlon: String(mapBounds.minLng),
      maxlon: String(mapBounds.maxLng),
      orderby: 'time',
      limit: '200',
      start: rollingStartIso(windowDays),
      minmag: String(seismic.minMagnitudeDisplay),
    })

    const res = await fetch(`${BASE}?${params}`, {
      next: { revalidate: REVALIDATE, tags: ['emsc-seismic'] },
      headers: { Accept: 'application/json', 'User-Agent': 'VigilCrisisPlatform/1.0 (humanitarian)' },
    })
    if (!res.ok) return []

    const data = (await res.json()) as EmscGeoJson
    const features = data.features ?? []
    return features
      .map((f): SeismicEvent | null => {
        const p = f.properties ?? {}
        const mag = p.mag
        if (mag == null) return null
        const coords = f.geometry?.coordinates
        const lat = coords?.[1] ?? p.lat
        const lng = coords?.[0] ?? p.lon
        const depth = coords?.[2] ?? p.depth ?? 0
        if (lat == null || lng == null) return null
        let timeMs: number
        if (typeof p.time === 'number') timeMs = p.time
        else if (typeof p.time === 'string') timeMs = Date.parse(p.time)
        else timeMs = Date.now()
        const place =
          p.flynn_region || p.place || `${lat.toFixed(2)}, ${lng.toFixed(2)}`
        const id = String(f.id ?? p.unid ?? `emsc-${timeMs}-${mag}`)
        return {
          id: `emsc-${id}`,
          magnitude: mag,
          place,
          time: timeMs,
          lat,
          lng,
          depth,
          url: `https://www.seismicportal.eu/event/${encodeURIComponent(String(p.unid ?? id))}`,
          source: 'EMSC' as const,
        }
      })
      .filter((e): e is SeismicEvent => e !== null)
  } catch {
    return []
  }
}
