'use client'

import Link from 'next/link'
import { CircleMarker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import type { PublicMissingPerson } from '@/types/vigil.types'

interface MissingPersonsLayerProps {
  persons: PublicMissingPerson[]
}

export function MissingPersonsLayer({ persons }: MissingPersonsLayerProps) {
  const t = useTranslations('map.layers')

  return (
    <>
      {persons.map((person) => {
        if (person.approx_last_seen_lat == null || person.approx_last_seen_lng == null) return null
        return (
          <CircleMarker
            key={person.id}
            center={[person.approx_last_seen_lat, person.approx_last_seen_lng]}
            radius={9}
            pathOptions={{
              color: '#7C3AED',
              fillColor: '#A78BFA',
              fillOpacity: 0.75,
              weight: 2,
            }}
          >
            <Popup>
              <strong>{person.full_name}</strong>
              <p className="text-sm">
                {person.estado}
                {person.municipio ? `, ${person.municipio}` : ''}
              </p>
              <p className="text-xs text-slate-500">{t('missingPersonsApprox')}</p>
              <Link
                href={`/buscar/${person.id}`}
                className="mt-2 inline-block text-sm font-medium text-vigil-blue hover:underline"
              >
                {t('missingPersonsView')}
              </Link>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}
