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

export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
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
