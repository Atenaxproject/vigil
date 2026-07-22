import type { SeismicEvent } from '@/types/vigil.types'

/** Relative time for seismic list (prompt 69 B3). Spanish-first. */
export function formatSeismicRelativeTime(timeMs: number, locale = 'es'): string {
  const diffMs = Date.now() - timeMs
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return locale === 'en' ? 'just now' : 'hace un momento'
  if (mins < 60) {
    return locale === 'en' ? `${mins} min ago` : `hace ${mins} min`
  }
  const hours = Math.floor(mins / 60)
  if (hours < 48) {
    return locale === 'en' ? `${hours} h ago` : `hace ${hours} h`
  }
  const days = Math.floor(hours / 24)
  return locale === 'en' ? `${days} d ago` : `hace ${days} d`
}

/**
 * Prefer USGS-style "X km Dir of Locality"; otherwise show place as-is.
 */
export function formatSeismicLocality(event: SeismicEvent): string {
  return event.place
}

export function isAlertTier(event: SeismicEvent, threshold = 4.0): boolean {
  return event.magnitude >= threshold
}
