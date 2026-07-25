'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

/** Fly the Leaflet map to a focused marker from the accessible list. */
export function MapFocusController({
  lat,
  lng,
  active,
}: {
  lat: number | null
  lng: number | null
  active: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!active || lat == null || lng == null) return
    map.flyTo([lat, lng], Math.max(map.getZoom(), 11), { duration: 0.6 })
  }, [active, lat, lng, map])

  return null
}
