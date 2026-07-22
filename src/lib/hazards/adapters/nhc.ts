import { getNhcActiveStorms } from '@/lib/feeds/nhc'
import type { HazardEvent } from '@/lib/hazards/types'

/** NHC CurrentStorms — severity = official classification (TS/HU/MH…). */
export async function pollNhcHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  const storms = await getNhcActiveStorms()
  return storms.map((s) => ({
    id: `nhc:${s.id}`,
    hazard_type: 'tropical_cyclone' as const,
    severity: s.classification,
    region: `${s.basin} · ${s.name}`,
    lat: s.lat,
    lng: s.lng,
    headline: `${s.classification} ${s.name}`,
    issued_at: s.lastUpdate || fetched_at,
    source: 'nhc' as const,
    source_url: s.advisoryUrl || 'https://www.nhc.noaa.gov/',
    fetched_at,
    meta: { intensityKt: s.intensityKt, movement: s.movement },
  }))
}
