import { CRISIS_CONFIG } from '@/config/crisis.config'

export interface GeoCoords {
  lat: number
  lng: number
}

/** Geocode a Venezuelan address using Nominatim (free, no API key). */
export async function geocodeVenezuela(address: string): Promise<GeoCoords | null> {
  if (!address?.trim()) return null

  const query = encodeURIComponent(`${address.trim()}, Venezuela`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ve`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Vigil/1.0 humanitarian crisis platform vigil.youthewave.org',
        'Accept-Language': 'es',
      },
    })

    if (!res.ok) return null

    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>
    if (!data?.length) return null

    const lat = parseFloat(data[0].lat ?? '')
    const lng = parseFloat(data[0].lon ?? '')
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null

    const { minLat, maxLat, minLng, maxLng } = CRISIS_CONFIG.mapBounds
    if (lat < minLat || lat > maxLat || lng < minLng || lng > maxLng) {
      console.warn(`Geocoding returned out-of-bounds coords for: ${address}`, { lat, lng })
      return null
    }

    return { lat, lng }
  } catch (error) {
    console.error('Nominatim geocoding failed:', error)
    return null
  }
}

export const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
