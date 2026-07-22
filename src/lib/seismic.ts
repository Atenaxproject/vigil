import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'
import {
  getAlertAftershockCount,
  getVenezuelaSeismicEvents,
  getVenezuelaSeismicFetch,
  type SeismicFetchResult,
} from '@/lib/usgs'

/**
 * Merged seismic feed for map and /informacion.
 * USGS events always included; FUNVISIS merged when a stable public feed exists.
 *
 * FUNVISIS gap (2026-07-04): funvisis.gob.ve exposes HTML tables only — no official
 * JSON/XML API. Scraping is intentionally skipped (fragile, unverified). Re-enable
 * FUNVISIS merge here once Orlando confirms a stable feed or partnership.
 */
export async function getMergedSeismicEvents(): Promise<SeismicEvent[]> {
  const usgsEvents = await getVenezuelaSeismicEvents()

  // Deduplicate by proximity + time when FUNVISIS is added:
  // prefer USGS for overlapping events, keep FUNVISIS-only local aftershocks.
  return usgsEvents.sort((a, b) => b.time - a.time)
}

export async function getMergedSeismicFetch(): Promise<SeismicFetchResult> {
  return getVenezuelaSeismicFetch()
}

export { getAlertAftershockCount }

export function countAlertEvents(events: SeismicEvent[]): number {
  return events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag).length
}
