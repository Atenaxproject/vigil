import { getWaterGaugesBySites } from '@/lib/feeds/usgs-water'
import type { HazardEvent } from '@/lib/hazards/types'

/** Priority FL flood gauges — height only; severity = gauge ft (agency observation). */
const FL_SITES = [
  '02359170', // Apalachicola
  '02296750', // Peace River
  '02358000', // Chipola
  '02320000', // Suwannee
  '02315500', // Withlacoochee
  '02244040', // St Johns
  '02300033', // Alafia
  '02295420', // Myakka
]

export async function pollUsgsWaterHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  try {
    const gauges = await getWaterGaugesBySites(FL_SITES)
    return gauges
      .filter((g) => g.gaugeHeightFt != null)
      .map((g) => ({
        id: `usgs-water:${g.siteCode}`,
        hazard_type: 'flood' as const,
        severity: `${g.gaugeHeightFt!.toFixed(1)} ft`,
        region: g.siteName,
        lat: g.lat,
        lng: g.lng,
        headline: `${g.siteName}: ${g.gaugeHeightFt!.toFixed(1)} ft`,
        issued_at: g.observedAt ?? fetched_at,
        source: 'usgs-water' as const,
        source_url: `https://waterdata.usgs.gov/monitoring-location/${g.siteCode}/`,
        fetched_at,
      }))
  } catch {
    return []
  }
}
