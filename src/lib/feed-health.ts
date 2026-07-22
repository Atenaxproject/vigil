/**
 * Live-feed freshness helpers — safe for client components (prompt 67).
 */

export type FeedId =
  | 'usgs'
  | 'gdacs'
  | 'reliefweb'
  | 'open-meteo'
  | 'funvisis'
  | 'dtv-metrics'
  | 'nws'
  | 'nhc'
  | 'usgs-water'
  | 'firms'
  | 'tsunami'

export interface FeedHealthRecord {
  feed_id: FeedId | string
  label: string
  last_success_at: string | null
  last_attempt_at: string
  last_error: string | null
  item_count: number | null
  meta?: Record<string, unknown>
}

export type FeedFreshness = 'fresh' | 'stale' | 'unavailable' | 'never'

/** Seismic / live map thresholds from prompt 67 Part C */
export const FEED_STALE_MS = 30 * 60 * 1000 // 30 minutes
export const FEED_UNAVAILABLE_MS = 2 * 60 * 60 * 1000 // 2 hours

export function getFeedFreshness(
  lastSuccessAt: string | Date | null | undefined,
  now = Date.now()
): FeedFreshness {
  if (!lastSuccessAt) return 'never'
  const t = typeof lastSuccessAt === 'string' ? Date.parse(lastSuccessAt) : lastSuccessAt.getTime()
  if (Number.isNaN(t)) return 'never'
  const age = now - t
  if (age > FEED_UNAVAILABLE_MS) return 'unavailable'
  if (age > FEED_STALE_MS) return 'stale'
  return 'fresh'
}

export function usgsSourceUrl(): string {
  return 'https://earthquake.usgs.gov/earthquakes/map/?extent=0.6,-73.5&extent=12.5,-59.5'
}
