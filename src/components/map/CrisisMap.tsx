'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { CRISIS_CONFIG, diasporaSupportConfig } from '@/config/crisis.config'
import type { SeismicEvent, RegionScope } from '@/types/vigil.types'
import type { MapMarker, PublicPropertyAssessment, PublicMissingPerson } from '@/types/vigil.types'
import { MapLayers, type MapLayerState } from '@/components/map/MapLayers'
import { useRealtimeMapMarkers } from '@/hooks/useRealtimeMapMarkers'
import { useRealtimeRescuerPresence } from '@/hooks/useRealtimeRescuerPresence'

const MapContainer = dynamic(() => import('react-leaflet').then((m) => m.MapContainer), {
  ssr: false,
  // Keeps the shimmer up between hydration and the react-leaflet chunk arriving;
  // without it the map area goes blank on slow connections.
  loading: () => <div className="skeleton h-full min-h-[240px] w-full lg:min-h-[400px]" />,
})
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
const CommsLayer = dynamic(
  () => import('@/components/map/CommsLayer').then((m) => m.CommsLayer),
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
const MissingPersonsLayer = dynamic(
  () => import('@/components/map/MissingPersonsLayer').then((m) => m.MissingPersonsLayer),
  { ssr: false }
)
const PropertyAssessmentLayer = dynamic(
  () => import('@/components/map/PropertyAssessmentLayer').then((m) => m.PropertyAssessmentLayer),
  { ssr: false }
)

const MapZoomControls = dynamic(
  () => import('@/components/map/MapZoomControls').then((m) => m.MapZoomControls),
  { ssr: false }
)

interface CrisisMapProps {
  events?: SeismicEvent[]
  markers?: MapMarker[]
  propertyAssessments?: PublicPropertyAssessment[]
  missingPersons?: PublicMissingPerson[]
  regionScope?: RegionScope
}

export function CrisisMap({
  events = [],
  markers: initialMarkers = [],
  propertyAssessments = [],
  missingPersons = [],
  regionScope = 'venezuela',
}: CrisisMapProps) {
  const isDiaspora = regionScope === 'usa_diaspora'
  const [mounted, setMounted] = useState(false)
  const [layers, setLayers] = useState<MapLayerState>({
    aftershocks: !isDiaspora,
    needs: true,
    resources: true,
    shelters: false,
    hospitals: false,
    activeTeams: !isDiaspora,
    collection: true,
    propertyAssessments: !isDiaspora,
    missingPersons: !isDiaspora,
  })
  const markers = useRealtimeMapMarkers(initialMarkers, regionScope)
  const rescuerPresence = useRealtimeRescuerPresence()

  useEffect(() => {
    setMounted(true)
  }, [])

  const mapConfig = useMemo(() => {
    if (isDiaspora) {
      const b = diasporaSupportConfig
      return {
        centerLat: b.centerLat,
        centerLng: b.centerLng,
        defaultZoom: b.defaultZoom,
        minZoom: b.minZoom,
        maxZoom: b.maxZoom,
        maxBounds: [
          [b.bounds.minLat, b.bounds.minLng],
          [b.bounds.maxLat, b.bounds.maxLng],
        ] as [[number, number], [number, number]],
      }
    }
    const b = CRISIS_CONFIG.mapBounds
    return {
      centerLat: b.centerLat,
      centerLng: b.centerLng,
      defaultZoom: b.defaultZoom,
      minZoom: b.minZoom,
      maxZoom: b.maxZoom,
      maxBounds: [
        [b.minLat, b.minLng],
        [b.maxLat, b.maxLng],
      ] as [[number, number], [number, number]],
    }
  }, [isDiaspora])

  const { centerLat, centerLng, defaultZoom, minZoom, maxZoom, maxBounds } = mapConfig

  if (!mounted) {
    return <div className="skeleton h-full min-h-[240px] w-full rounded-card lg:min-h-[400px]" />
  }

  return (
    <div className="map-wrapper relative h-full min-h-[240px] w-full overflow-hidden rounded-card border border-slate-200 lg:min-h-[400px]">
      <MapLayers layers={layers} onChange={setLayers} />
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={defaultZoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        maxBounds={maxBounds}
        maxBoundsViscosity={1.0}
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
        {layers.resources && (
          <>
            <ResourceLayer markers={markers} />
            <CommsLayer markers={markers} />
          </>
        )}
        {layers.collection && <CollectionPointLayer markers={markers} />}
        {layers.shelters && <ShelterLayer markers={markers} />}
        {layers.hospitals && <HospitalLayer markers={markers} />}
        {layers.activeTeams && <RescuerPresenceLayer presence={rescuerPresence} />}
        {layers.propertyAssessments && (
          <PropertyAssessmentLayer assessments={propertyAssessments} />
        )}
        {layers.missingPersons && <MissingPersonsLayer persons={missingPersons} />}
        <MapZoomControls />
      </MapContainer>
    </div>
  )
}
