'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { MapMarker } from '@/types/vigil.types'

interface HospitalLayerProps {
  markers: MapMarker[]
}

export function HospitalLayer({ markers }: HospitalLayerProps) {
  const hospitals = markers.filter((m) => m.type === 'hospital' && m.status === 'active')

  return (
    <>
      {hospitals.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={marker.urgent ? 10 : 8}
          pathOptions={{ color: '#EC4899', fillColor: '#EC4899', fillOpacity: 0.7 }}
        >
          <Popup>
            <strong>{marker.title}</strong>
            {marker.description && <p className="text-sm">{marker.description}</p>}
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
