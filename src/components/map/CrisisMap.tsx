'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'
import type { MapMarker } from '@/types/vigil.types'
import { MapLayers, type MapLayerState } from '@/components/map/MapLayers'

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), { ssr: false })
const TileLayer = dynamic(() => import('react-leaflet').then((m) => m.TileLayer), { ssr: false })
const AftershockLayer = dynamic(
  () => import('@/components/map/AftershockLayer').then((m) => m.AftershockLayer),
  { ssr: false }
)
const NeedsLayer = dynamic(() => import('@/components/map/NeedsLayer').then((m) => m.NeedsLayer), { ssr: false })
const ResourceLayer = dynamic(
  () => import('@/components/map/ResourceLayer').then((m) => m.ResourceLayer),
  { ssr: false }
)

interface CrisisMapProps {
  events?: SeismicEvent[]
  markers?: MapMarker[]
}

export function CrisisMap({ events = [], markers = [] }: CrisisMapProps) {
  const [mounted, setMounted] = useState(false)
  const [layers, setLayers] = useState<MapLayerState>({
    aftershocks: true,
    needs: true,
    resources: true,
    shelters: false,
    hospitals: false,
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const { centerLat, centerLng, defaultZoom, minZoom, maxZoom } = CRISIS_CONFIG.mapBounds

  if (!mounted) {
    return <div className="skeleton h-full min-h-[400px] w-full rounded-card" />
  }

  return (
    <div className="relative h-full min-h-[400px] w-full overflow-hidden rounded-card border border-slate-200">
      <MapLayers layers={layers} onChange={setLayers} />
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={defaultZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        className="h-full min-h-[400px] w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.aftershocks && <AftershockLayer events={events} />}
        {layers.needs && <NeedsLayer markers={markers} />}
        {layers.resources && <ResourceLayer markers={markers} />}
      </MapContainer>
    </div>
  )
}
