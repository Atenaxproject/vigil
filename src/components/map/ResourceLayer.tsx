'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { MapMarker } from '@/types/vigil.types'

interface ResourceLayerProps {
  markers: MapMarker[]
}

export function ResourceLayer({ markers }: ResourceLayerProps) {
  const resources = markers.filter((m) => m.type === 'resource' && m.status === 'active')

  return (
    <>
      {resources.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={8}
          pathOptions={{ color: '#16A34A', fillColor: '#16A34A', fillOpacity: 0.7 }}
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
