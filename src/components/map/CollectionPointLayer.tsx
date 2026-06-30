'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import type { MapMarker } from '@/types/vigil.types'

interface CollectionPointLayerProps {
  markers: MapMarker[]
}

export function CollectionPointLayer({ markers }: CollectionPointLayerProps) {
  const t = useTranslations('collectionPoint')
  const points = markers.filter((m) => m.type === 'collection_point' && m.status === 'active')

  return (
    <>
      {points.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.lat, marker.lng]}
          radius={10}
          pathOptions={{ color: '#D97706', fillColor: '#F59E0B', fillOpacity: 0.85, weight: 2 }}
        >
          <Popup>
            <strong>{marker.title}</strong>
            {marker.organizer_name && (
              <p className="text-[11px] text-slate-600">
                {t('map.organizer')}: {marker.organizer_name}
              </p>
            )}
            {marker.hours_schedule && (
              <p className="text-[11px] text-slate-600">
                {t('form.hours')}: {marker.hours_schedule}
              </p>
            )}
            {marker.accepts_categories && marker.accepts_categories.length > 0 && (
              <p className="text-[11px] text-slate-600">
                {t('form.accepts')}: {marker.accepts_categories.join(', ')}
              </p>
            )}
            {marker.description && <p className="text-sm">{marker.description}</p>}
            <p className="mt-2 text-[11px] text-vigil-blue">{t('map.contactViaVigil')}</p>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}
