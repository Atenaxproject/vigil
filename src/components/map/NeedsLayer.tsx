'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import type { CoverageState, MapMarker } from '@/types/vigil.types'

interface NeedsLayerProps {
  markers: MapMarker[]
}

const COVERAGE_COLORS: Record<CoverageState, { color: string; fill: string }> = {
  uncovered: { color: '#DC2626', fill: '#DC2626' },
  partial: { color: '#D97706', fill: '#D97706' },
  covered: { color: '#16A34A', fill: '#16A34A' },
  needs_reconfirmation: { color: '#64748B', fill: '#94A3B8' },
}

function coverageOf(marker: MapMarker): CoverageState {
  return marker.coverage_state ?? 'uncovered'
}

export function NeedsLayer({ markers }: NeedsLayerProps) {
  const t = useTranslations('map.coverage')
  const needs = markers.filter((m) => m.type === 'need' && m.status === 'active')

  return (
    <>
      {needs.map((marker) => {
        const state = coverageOf(marker)
        const colors = COVERAGE_COLORS[state]
        return (
          <CircleMarker
            key={marker.id}
            center={[marker.lat, marker.lng]}
            radius={marker.urgent ? 10 : 8}
            pathOptions={{ color: colors.color, fillColor: colors.fill, fillOpacity: 0.7 }}
          >
            <Popup>
              <strong>{marker.title}</strong>
              {marker.description && <p className="text-sm">{marker.description}</p>}
              <p className="mt-1 text-xs font-medium" style={{ color: colors.color }}>
                {t(state)}
                {state === 'needs_reconfirmation' ? ` · ${t('staleHint')}` : null}
              </p>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}
