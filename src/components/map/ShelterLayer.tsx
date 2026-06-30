'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { MapMarker } from '@/types/vigil.types'

interface ShelterLayerProps {
  markers: MapMarker[]
}

export function ShelterLayer({ markers }: ShelterLayerProps) {
  const shelters = markers.filter((m) => m.type === 'shelter' && m.status === 'active')

  return (
    <>
      {shelters.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={8}
          pathOptions={{ color: '#2563EB', fillColor: '#2563EB', fillOpacity: 0.7 }}
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
