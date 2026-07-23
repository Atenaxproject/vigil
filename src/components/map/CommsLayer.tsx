'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import { Signal } from 'lucide-react'
import { MapMarkerSourceBadge } from '@/components/map/MapMarkerSourceBadge'
import type { MapMarker } from '@/types/vigil.types'

interface CommsLayerProps {
  markers: MapMarker[]
}

/** Amber WiFi-style markers for category=comms resources (distinct from green resources + collection points). */
export function CommsLayer({ markers }: CommsLayerProps) {
  const t = useTranslations('connectivity')
  const comms = markers.filter(
    (m) => m.type === 'resource' && m.category === 'comms' && m.status === 'active'
  )

  return (
    <>
      {comms.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={9}
          pathOptions={{
            color: '#B45309',
            fillColor: '#F59E0B',
            fillOpacity: 0.9,
            weight: 2,
            dashArray: '4 2',
          }}
        >
          <Popup>
            <div className="flex items-center gap-1">
              <Signal className="h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              <strong>{marker.title}</strong>
            </div>
            {marker.description && <p className="text-sm">{marker.description}</p>}
            <MapMarkerSourceBadge source={marker.source} />
            <p className="mt-2 text-[13px] text-vigil-blue">{t('map.reportedByCommunity')}</p>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
