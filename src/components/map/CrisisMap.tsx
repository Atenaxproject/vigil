'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { SeismicEvent } from '@/types/vigil.types'
import type { MapMarker } from '@/types/vigil.types'
import { MapLayers, type MapLayerState } from '@/components/map/MapLayers'
import { useRealtimeMapMarkers } from '@/hooks/useRealtimeMapMarkers'
import { useRealtimeRescuerPresence } from '@/hooks/useRealtimeRescuerPresence'

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
const CollectionPointLayer = dynamic(
  () => import('@/components/map/CollectionPointLayer').then((m) => m.CollectionPointLayer),
  { ssr: false }
)
const ShelterLayer = dynamic(
  () => import('@/components/map/ShelterLayer').then((m) => m.ShelterLayer),
  { ssr: false }
)
const HospitalLayer = dynamic(
  () => import('@/components/map/HospitalLayer').then((m) => m.HospitalLayer),
  { ssr: false }
)
const RescuerPresenceLayer = dynamic(
  () => import('@/components/map/RescuerPresenceLayer').then((m) => m.RescuerPresenceLayer),
  { ssr: false }
)
const MapZoomControls = dynamic(
  () => import('@/components/map/MapZoomControls').then((m) => m.MapZoomControls),
  { ssr: false }
)

interface CrisisMapProps {
  events?: SeismicEvent[]
  markers?: MapMarker[]
}

export function CrisisMap({ events = [], markers: initialMarkers = [] }: CrisisMapProps) {
  const [mounted, setMounted] = useState(false)
  const [layers, setLayers] = useState<MapLayerState>({
    aftershocks: true,
    needs: true,
    resources: true,
    shelters: false,
    hospitals: false,
    activeTeams: true,
    collection: true,
  })
  const markers = useRealtimeMapMarkers(initialMarkers)
  const rescuerPresence = useRealtimeRescuerPresence()

  useEffect(() => {
    setMounted(true)
  }, [])

  const { centerLat, centerLng, defaultZoom, minZoom, maxZoom } = CRISIS_CONFIG.mapBounds

  if (!mounted) {
    return <div className="skeleton h-full min-h-[240px] w-full rounded-card lg:min-h-[400px]" />
  }

  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden rounded-card border border-slate-200 lg:min-h-[400px]">
      <MapLayers layers={layers} onChange={setLayers} />
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={defaultZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        zoomControl={false}
        className="h-full min-h-[240px] w-full lg:min-h-[400px]"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {layers.aftershocks && <AftershockLayer events={events} />}
        {layers.needs && <NeedsLayer markers={markers} />}
        {layers.resources && <ResourceLayer markers={markers} />}
        {layers.collection && <CollectionPointLayer markers={markers} />}
        {layers.shelters && <ShelterLayer markers={markers} />}
        {layers.hospitals && <HospitalLayer markers={markers} />}
        {layers.activeTeams && <RescuerPresenceLayer presence={rescuerPresence} />}
        <MapZoomControls />
      </MapContainer>
    </div>
  )
}
