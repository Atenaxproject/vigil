'use client'

import Link from 'next/link'
import { CircleMarker, Circle, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { getMunicipioCentroid } from '@/lib/geo/municipio-centroids'

interface MissingPersonsLayerProps {
  persons: PublicMissingPerson[]
}

// Honest-approximation radii (meters) — same idiom as AftershockLayer's
// magnitude-scaled Circle: a real-world-scale area reads as "somewhere in
// here," never as a precise pin. Two tiers so a municipio match is visibly
// tighter than an estado-only fallback.
const MUNICIPIO_RADIUS_M = 8000
const ESTADO_RADIUS_M = 20000

export function MissingPersonsLayer({ persons }: MissingPersonsLayerProps) {
  const t = useTranslations('map.layers')

  return (
    <>
      {persons.map((person) => {
        if (person.approx_last_seen_lat != null && person.approx_last_seen_lng != null) {
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
        }

        // No coordinates reached the client — the public view nulls them for
        // records flagged as a minor (76 REV2 §2/§3). Render at the municipio
        // centroid instead of dropping the marker entirely, so the person is
        // still discoverable on the map at a deliberately coarse resolution.
        // A Circle (real-world radius), not a CircleMarker pin: the shape
        // itself signals "somewhere in this area," matching the aftershock
        // layer's own approximation convention — never a precise point for
        // data we deliberately don't have precisely on the client.
        const centroid = getMunicipioCentroid(person.estado, person.municipio)
        if (!centroid) return null

        return (
          <Circle
            key={person.id}
            center={[centroid.lat, centroid.lng]}
            radius={centroid.precision === 'municipio' ? MUNICIPIO_RADIUS_M : ESTADO_RADIUS_M}
            pathOptions={{
              color: '#7C3AED',
              fillColor: '#A78BFA',
              fillOpacity: 0.25,
              weight: 1,
              dashArray: '4 3',
            }}
          >
            <Popup>
              <strong>{person.full_name}</strong>
              <p className="text-sm">
                {person.estado}
                {person.municipio ? `, ${person.municipio}` : ''}
              </p>
              <p className="text-xs text-slate-500">
                {centroid.precision === 'municipio'
                  ? t('missingPersonsMunicipioApprox')
                  : t('missingPersonsEstadoApprox')}
              </p>
              <Link
                href={`/buscar/${person.id}`}
                className="mt-2 inline-block text-sm font-medium text-vigil-blue hover:underline"
              >
                {t('missingPersonsView')}
              </Link>
            </Popup>
          </Circle>
        )
      })}
    </>
  )
}
