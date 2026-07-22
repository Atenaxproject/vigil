/**
 * Normalized hazard event shape (prompt 68).
 * Severity is always the issuing agency's own tier — never flattened.
 */

export type HazardType =
  | 'earthquake'
  | 'tropical_cyclone'
  | 'flood'
  | 'wildfire'
  | 'volcano'
  | 'tsunami'
  | 'weather_alert'
  | 'drought'
  | 'other'

export type HazardSource =
  | 'usgs'
  | 'gdacs'
  | 'reliefweb'
  | 'open-meteo'
  | 'firms'
  | 'nhc'
  | 'nws'
  | 'tsunami'
  | 'usgs-water'

export interface HazardEvent {
  /** Stable id across polls: `${source}:${externalId}` */
  id: string
  hazard_type: HazardType
  /** Agency-native severity string (GDACS Orange, NWS Extreme, M6.2, Cat 3…). */
  severity: string
  region: string
  lat: number | null
  lng: number | null
  headline: string
  issued_at: string
  source: HazardSource
  source_url: string
  fetched_at: string
  /** Cross-source cluster id when deduped (e.g. same EQ from USGS+GDACS). */
  cluster_id?: string | null
  active?: boolean
  suppressed?: boolean
  meta?: Record<string, unknown>
}

export interface HazardAdapter {
  source: HazardSource
  label: string
  poll: () => Promise<HazardEvent[]>
}
