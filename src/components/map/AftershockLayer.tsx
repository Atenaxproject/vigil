'use client'

import { Circle } from 'react-leaflet'
import type { SeismicEvent } from '@/types/vigil.types'
import { getMagnitudeColor } from '@/lib/usgs'

interface AftershockLayerProps {
  events: SeismicEvent[]
}

export function AftershockLayer({ events }: AftershockLayerProps) {
  return (
    <>
      {events.map((event) => (
        <Circle
          key={event.id}
          center={[event.lat, event.lng]}
          radius={event.magnitude * 3000}
          pathOptions={{
            color: getMagnitudeColor(event.magnitude),
            fillColor: getMagnitudeColor(event.magnitude),
            fillOpacity: 0.4,
            weight: 1,
          }}
        />
      ))}
    </>
  )
}
