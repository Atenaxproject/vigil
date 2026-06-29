'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import type { MapMarker } from '@/types/vigil.types'

interface NeedsLayerProps {
  markers: MapMarker[]
}

export function NeedsLayer({ markers }: NeedsLayerProps) {
  const needs = markers.filter((m) => m.type === 'need' && m.status === 'active')

  return (
    <>
      {needs.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={marker.urgent ? 10 : 8}
          pathOptions={{ color: '#DC2626', fillColor: '#DC2626', fillOpacity: 0.7 }}
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
