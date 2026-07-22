import type { HazardEvent } from '@/lib/hazards/types'

const USGS_SIG =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'

interface UsgsFeature {
  id: string
  properties: { mag: number | null; place: string; time: number; url: string }
  geometry: { coordinates: [number, number, number] }
}

/** Significant USGS quakes (M4.5+ week feed) — severity = agency magnitude. */
export async function pollUsgsHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  try {
    const res = await fetch(USGS_SIG, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data = (await res.json()) as { features?: UsgsFeature[] }
    return (data.features ?? [])
      .filter((f) => f.properties.mag != null)
      .map((f) => {
        const mag = f.properties.mag as number
        const [lng, lat] = f.geometry.coordinates
        return {
          id: `usgs:${f.id}`,
          hazard_type: 'earthquake' as const,
          severity: `M${mag.toFixed(1)}`,
          region: f.properties.place,
          lat,
          lng,
          headline: `M${mag.toFixed(1)} — ${f.properties.place}`,
          issued_at: new Date(f.properties.time).toISOString(),
          source: 'usgs' as const,
          source_url: f.properties.url,
          fetched_at,
        }
      })
  } catch {
    return []
  }
}
