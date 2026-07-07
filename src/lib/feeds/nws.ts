// NWS Alerts adapter (api.weather.gov). Hurricane/flood archetype feed —
// consumed only by deployments whose disasterArchetypes include those.
// NWS requires an identifying User-Agent and asks for ≥60s caching.

const NWS_BASE = 'https://api.weather.gov'
const NWS_USER_AGENT = 'Vigil (vigil.youthewave.org, vigil@youthewave.org)'
const NWS_REVALIDATE = 120

/** Official NWS tiers — mirrored, never invented. */
export type NwsSeverity = 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'

export interface NwsAlert {
  id: string
  event: string
  severity: NwsSeverity
  urgency: string
  certainty: string
  headline: string
  instruction: string | null
  effective: string
  expires: string
  /** GeoJSON geometry (Polygon/MultiPolygon) — null for zone-referenced alerts. */
  geometry: GeoJSON.Geometry | null
}

interface NwsFeature {
  id: string
  geometry: GeoJSON.Geometry | null
  properties: {
    event?: string
    severity?: string
    urgency?: string
    certainty?: string
    headline?: string
    instruction?: string | null
    effective?: string
    expires?: string
  }
}

function mapAlert(f: NwsFeature): NwsAlert {
  const severity = (f.properties.severity ?? 'Unknown') as NwsSeverity
  return {
    id: f.id,
    event: f.properties.event ?? 'Alert',
    severity: ['Extreme', 'Severe', 'Moderate', 'Minor'].includes(severity) ? severity : 'Unknown',
    urgency: f.properties.urgency ?? 'Unknown',
    certainty: f.properties.certainty ?? 'Unknown',
    headline: f.properties.headline ?? '',
    instruction: f.properties.instruction ?? null,
    effective: f.properties.effective ?? '',
    expires: f.properties.expires ?? '',
    geometry: f.geometry,
  }
}

async function fetchAlerts(query: string): Promise<NwsAlert[]> {
  try {
    const res = await fetch(`${NWS_BASE}/alerts/active?${query}`, {
      headers: { 'User-Agent': NWS_USER_AGENT, Accept: 'application/geo+json' },
      next: { revalidate: NWS_REVALIDATE },
    })
    if (!res.ok) {
      console.error('NWS alerts error:', res.status, res.statusText)
      return []
    }
    const data = (await res.json()) as { features?: NwsFeature[] }
    return (data.features ?? []).map(mapAlert)
  } catch (error) {
    console.error('NWS alerts fetch failed:', error)
    return []
  }
}

/** Active alerts for a US state (e.g. 'FL'). Graceful: feed down → []. */
export async function getNwsAlertsByState(stateCode: string): Promise<NwsAlert[]> {
  return fetchAlerts(`area=${encodeURIComponent(stateCode)}`)
}

/** Active alerts at a point. */
export async function getNwsAlertsByPoint(lat: number, lng: number): Promise<NwsAlert[]> {
  return fetchAlerts(`point=${lat.toFixed(4)},${lng.toFixed(4)}`)
}
