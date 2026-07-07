// USGS Water Services adapter — river gauge heights (parameter 00065, feet).
// Flood-archetype feed. Deployment configs should prefer explicit `sites=`
// lists (~15 most flood-relevant gauges) over statewide dumps.

const USGS_WATER_BASE = 'https://waterservices.usgs.gov/nwis/iv/'
const USGS_WATER_REVALIDATE = 900
const GAUGE_HEIGHT_PARAM = '00065'

export interface WaterGauge {
  siteCode: string
  siteName: string
  lat: number
  lng: number
  gaugeHeightFt: number | null
  observedAt: string | null
}

interface RawTimeSeries {
  sourceInfo?: {
    siteName?: string
    siteCode?: { value?: string }[]
    geoLocation?: { geogLocation?: { latitude?: number; longitude?: number } }
  }
  values?: { value?: { value?: string; dateTime?: string }[] }[]
}

async function fetchGauges(query: string): Promise<WaterGauge[]> {
  try {
    const res = await fetch(
      `${USGS_WATER_BASE}?format=json&parameterCd=${GAUGE_HEIGHT_PARAM}&siteStatus=active&${query}`,
      { next: { revalidate: USGS_WATER_REVALIDATE } }
    )
    if (!res.ok) {
      console.error('USGS water error:', res.status, res.statusText)
      return []
    }
    const data = (await res.json()) as { value?: { timeSeries?: RawTimeSeries[] } }
    const gauges: WaterGauge[] = []

    for (const ts of data.value?.timeSeries ?? []) {
      const loc = ts.sourceInfo?.geoLocation?.geogLocation
      if (typeof loc?.latitude !== 'number' || typeof loc?.longitude !== 'number') continue
      const latest = ts.values?.[0]?.value?.[0]
      const height = latest?.value != null ? parseFloat(latest.value) : NaN
      gauges.push({
        siteCode: ts.sourceInfo?.siteCode?.[0]?.value ?? '',
        siteName: ts.sourceInfo?.siteName ?? 'USGS gauge',
        lat: loc.latitude,
        lng: loc.longitude,
        gaugeHeightFt: Number.isNaN(height) ? null : height,
        observedAt: latest?.dateTime ?? null,
      })
    }
    return gauges
  } catch (error) {
    console.error('USGS water fetch failed:', error)
    return []
  }
}

/** Gauges for an explicit site list (preferred for deployments). */
export async function getWaterGaugesBySites(siteCodes: string[]): Promise<WaterGauge[]> {
  if (siteCodes.length === 0) return []
  return fetchGauges(`sites=${siteCodes.join(',')}`)
}

/** Statewide gauges (e.g. 'fl') — heavier; prefer getWaterGaugesBySites. */
export async function getWaterGaugesByState(stateCode: string): Promise<WaterGauge[]> {
  return fetchGauges(`stateCd=${encodeURIComponent(stateCode.toLowerCase())}`)
}
