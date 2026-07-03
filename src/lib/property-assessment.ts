import { CRISIS_CONFIG } from '@/config/crisis.config'

/** Jitter exact coordinates for public map display (~100–200 m). */
export function jitterCoordinates(lat: number, lng: number): { lat: number; lng: number } {
  const jitter = 0.001 + Math.random() * 0.001
  const signLat = Math.random() > 0.5 ? 1 : -1
  const signLng = Math.random() > 0.5 ? 1 : -1
  const approxLat = Math.round((lat + signLat * jitter) * 10000) / 10000
  const approxLng = Math.round((lng + signLng * jitter) * 10000) / 10000
  const { minLat, maxLat, minLng, maxLng } = CRISIS_CONFIG.mapBounds
  return {
    lat: Math.min(maxLat, Math.max(minLat, approxLat)),
    lng: Math.min(maxLng, Math.max(minLng, approxLng)),
  }
}

export type PropertyTagStatus = 'unassessed' | 'green' | 'yellow' | 'red'

export const PROPERTY_TAG_COLORS: Record<PropertyTagStatus, { stroke: string; fill: string; dashArray?: string }> = {
  unassessed: { stroke: '#64748B', fill: '#94A3B8', dashArray: '4 4' },
  green: { stroke: '#16A34A', fill: '#16A34A' },
  yellow: { stroke: '#D97706', fill: '#D97706' },
  red: { stroke: '#DC2626', fill: '#DC2626' },
}

export const DANGER_INDICATORS = [
  'visible_cracks',
  'leaning',
  'flooding',
  'foundation_damage',
  'gas_smell',
  'partial_collapse',
  'other',
] as const

export type DangerIndicator = (typeof DANGER_INDICATORS)[number]
