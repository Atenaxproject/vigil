'use client'

import { useMapEvents } from 'react-leaflet'

interface PinDropMapClickProps {
  onPick: (lat: number, lng: number) => void
}

export function PinDropMapClick({ onPick }: PinDropMapClickProps) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}
