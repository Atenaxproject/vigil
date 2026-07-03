'use client'

import { CircleMarker, Popup } from 'react-leaflet'
import { useTranslations } from 'next-intl'
import { PROPERTY_TAG_COLORS, type PropertyTagStatus } from '@/lib/property-assessment'
import type { PublicPropertyAssessment } from '@/types/vigil.types'

interface PropertyAssessmentLayerProps {
  assessments: PublicPropertyAssessment[]
}

export function PropertyAssessmentLayer({ assessments }: PropertyAssessmentLayerProps) {
  const t = useTranslations('propertyAssessment.map')

  return (
    <>
      {assessments.map((item) => {
        if (item.approx_location_lat == null || item.approx_location_lng == null) return null
        const tag = (item.tag_status ?? 'unassessed') as PropertyTagStatus
        const colors = PROPERTY_TAG_COLORS[tag]
        return (
          <CircleMarker
            key={item.id}
            center={[item.approx_location_lat, item.approx_location_lng]}
            radius={8}
            pathOptions={{
              color: colors.stroke,
              fillColor: colors.fill,
              fillOpacity: tag === 'unassessed' ? 0.5 : 0.75,
              weight: 2,
              dashArray: colors.dashArray,
            }}
          >
            <Popup>
              <strong>{t(`tag.${tag}`)}</strong>
              <p className="text-sm">
                {item.estado}
                {item.municipio ? `, ${item.municipio}` : ''}
              </p>
              <p className="text-xs text-slate-500">{t('approxLocation')}</p>
            </Popup>
          </CircleMarker>
        )
      })}
    </>
  )
}
