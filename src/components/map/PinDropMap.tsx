'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { BASEMAP_ATTRIBUTION } from '@/lib/basemap'
import { useBasemapUrl } from '@/hooks/useBasemapUrl'

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const Marker = dynamic(() => import('react-leaflet').then((m) => m.Marker), { ssr: false })
const ClickHandler = dynamic(
  () => import('@/components/map/PinDropMapClick').then((m) => m.PinDropMapClick),
  { ssr: false }
)

interface PinDropMapProps {
  lat: number
  lng: number
  onChange: (lat: number, lng: number) => void
  ariaLabel: string
  tileUrl?: string
}

export function PinDropMap({ lat, lng, onChange, ariaLabel, tileUrl }: PinDropMapProps) {
  const [mounted, setMounted] = useState(false)
  const basemapUrl = useBasemapUrl(tileUrl)
  const { defaultZoom, minLat, maxLat, minLng, maxLng } = CRISIS_CONFIG.mapBounds

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="skeleton h-[220px] w-full rounded-card" aria-hidden />
  }

  return (
    <div
      className="h-[220px] overflow-hidden rounded-card border border-slate-200"
      role="application"
      aria-label={ariaLabel}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={defaultZoom}
        className="h-full w-full"
        maxBounds={[
          [minLat, minLng],
          [maxLat, maxLng],
        ]}
        scrollWheelZoom={false}
      >
        <TileLayer attribution={BASEMAP_ATTRIBUTION} url={basemapUrl} />
        <ClickHandler onPick={onChange} />
        <Marker position={[lat, lng]} />
      </MapContainer>
    </div>
  )
}
