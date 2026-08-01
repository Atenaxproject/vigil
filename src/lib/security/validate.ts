import { CRISIS_CONFIG, diasporaSupportConfig } from '@/config/crisis.config'
import type { RegionScope } from '@/types/vigil.types'
import { createHash } from 'crypto'

export function isWithinBounds(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = CRISIS_CONFIG.mapBounds
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

export function isWithinDiasporaBounds(lat: number, lng: number): boolean {
  const { minLat, maxLat, minLng, maxLng } = diasporaSupportConfig.bounds
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng
}

export function isWithinRegionBounds(
  regionScope: RegionScope,
  lat: number,
  lng: number
): boolean {
  if (regionScope === 'usa_diaspora') return isWithinDiasporaBounds(lat, lng)
  return isWithinBounds(lat, lng)
}

/**
 * Per-record-type geo policy:
 * - persons / needs / volunteers / property → crisis (Venezuela) bounds only
 * - collection points → Venezuela OR USA diaspora hub (South Florida)
 */
export type GeoRecordKind =
  | 'person'
  | 'need'
  | 'resource'
  | 'collection_point'
  | 'volunteer'
  | 'property'
  | 'event'

export function resolveGeoForRecord(
  kind: GeoRecordKind,
  lat: number,
  lng: number
): { ok: true; regionScope: RegionScope } | { ok: false; error: string } {
  if (kind === 'collection_point') {
    if (isWithinBounds(lat, lng)) {
      return { ok: true, regionScope: 'venezuela' }
    }
    if (isWithinDiasporaBounds(lat, lng)) {
      return { ok: true, regionScope: 'usa_diaspora' }
    }
    return {
      ok: false,
      error:
        'Coordenadas fuera de las zonas permitidas (Venezuela o Sur de Florida / diáspora)',
    }
  }

  if (!isWithinBounds(lat, lng)) {
    return { ok: false, error: 'Coordenadas fuera de Venezuela' }
  }
  return { ok: true, regionScope: 'venezuela' }
}

export function hashIp(ip: string): string {
  const secret = process.env.VIGIL_ADMIN_SECRET ?? 'vigil-dev-secret'
  return createHash('sha256').update(ip + secret).digest('hex').slice(0, 16)
}

export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  )
}

// Script-capable URL schemes. Blocklisted as defense-in-depth; the angle-bracket
// strip below already prevents any HTML element from forming, and React escapes
// on render. URL fields used as links must additionally pass isSafeHttpUrl().
const DANGEROUS_SCHEME = /(?:javascript|data|vbscript):/gi
const ANGLE_BRACKETS = /[<>]/g

/**
 * Neutralize user text before storage/display. Removes angle brackets outright
 * (so no HTML tag can ever form — robust against the "reforming tag" and bare
 * "<script" bypasses) and strips script-capable URL schemes. Removals run to a
 * fixpoint so a match revealed by an earlier removal cannot survive. Text only —
 * it must not emit HTML entities (React re-escapes on render).
 */
export function sanitizeText(text: string): string {
  // Bound the work before the fixpoint loop.
  let out = text.slice(0, 4000)
  let previous: string
  do {
    previous = out
    out = out.replace(ANGLE_BRACKETS, '').replace(DANGEROUS_SCHEME, '')
  } while (out !== previous)
  return out.replace(/\s+/g, ' ').trim().slice(0, 2000)
}

/** Claim tokens are server-issued UUIDs — reject anything else before href/storage use. */
const CLAIM_TOKEN_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isClaimToken(token: string): boolean {
  return CLAIM_TOKEN_RE.test(token.trim())
}

/**
 * Allowlist URL validator for values rendered as links. Only http(s), mailto,
 * and tel schemes pass — blocks javascript:, data:, vbscript:, and anything
 * else. Returns the trimmed URL if safe, otherwise null.
 */
export function isSafeHttpUrl(url: string): string | null {
  const trimmed = url.trim()
  try {
    const parsed = new URL(trimmed)
    const allowed = ['http:', 'https:', 'mailto:', 'tel:']
    return allowed.includes(parsed.protocol) ? trimmed : null
  } catch {
    return null
  }
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-\s()]/g, '').slice(0, 25)
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 6) return '****'
  return phone.slice(0, 3) + '***' + phone.slice(-2)
}

export function validatePhoto(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSizeBytes = 5 * 1024 * 1024

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Solo se aceptan imágenes JPG, PNG o WebP' }
  }
  if (file.size > maxSizeBytes) {
    return { valid: false, error: 'La imagen no puede superar 5MB' }
  }
  return { valid: true }
}
