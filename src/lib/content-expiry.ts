/**
 * Dated content expiry (prompt 66).
 * Content with a known end date auto-suppresses or auto-marks when past.
 * Peak-response figures without an end date use verified_at + 63 staleness.
 */

import { getFigureFreshness, type FigureFreshness } from '@/lib/provenance'

export type ContentDisposition = 'show' | 'expired' | 'suppressed'

export interface DatedContentMeta {
  /** ISO date YYYY-MM-DD — hard end (promotions, waivers). */
  expiresAt?: string
  /** ISO date of last verification — for peak-response figures. */
  verifiedAt?: string
  /** When true, expired/stale content is omitted entirely (not shown as expired). */
  suppressWhenStale?: boolean
}

export function isPastDate(isoDate: string, now = new Date()): boolean {
  const end = new Date(`${isoDate}T23:59:59.999Z`)
  if (Number.isNaN(end.getTime())) return true
  return now.getTime() > end.getTime()
}

export function getContentDisposition(
  meta: DatedContentMeta,
  now = new Date()
): { disposition: ContentDisposition; freshness?: FigureFreshness } {
  if (meta.expiresAt && isPastDate(meta.expiresAt, now)) {
    return {
      disposition: meta.suppressWhenStale ? 'suppressed' : 'expired',
    }
  }

  if (meta.verifiedAt) {
    const freshness = getFigureFreshness(meta.verifiedAt, now)
    if (freshness === 'expired') {
      return {
        disposition: meta.suppressWhenStale !== false ? 'suppressed' : 'expired',
        freshness,
      }
    }
    return { disposition: 'show', freshness }
  }

  return { disposition: 'show' }
}

/** Deduplicate orgs that share a donation URL or near-identical name. */
export function dedupeDonationOrgs<
  T extends { name: string; donation_link?: string | null }
>(orgs: T[]): T[] {
  const seenUrls = new Set<string>()
  const seenNames = new Set<string>()
  const out: T[] = []

  for (const org of orgs) {
    const urlKey = (org.donation_link ?? '').trim().toLowerCase().replace(/\/$/, '')
    const nameKey = org.name
      .toLowerCase()
      .replace(/\s*\(.*?\)\s*/g, ' ')
      .replace(/\bgem\b/gi, 'global empowerment mission')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()

    if (urlKey && seenUrls.has(urlKey)) continue
    if (nameKey && seenNames.has(nameKey)) continue

    if (urlKey) seenUrls.add(urlKey)
    if (nameKey) seenNames.add(nameKey)
    out.push(org)
  }
  return out
}
