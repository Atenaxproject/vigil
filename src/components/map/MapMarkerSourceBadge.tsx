'use client'

import { useTranslations } from 'next-intl'

const DTV_SOURCE = 'desaparecidosterremotovenezuela.com'
const CAV_SOURCE = 'cav'

interface MapMarkerSourceBadgeProps {
  source?: string | null
}

export function MapMarkerSourceBadge({ source }: MapMarkerSourceBadgeProps) {
  const t = useTranslations('map')

  if (source === DTV_SOURCE) {
    return (
      <p className="mt-2 inline-flex items-center rounded-full border border-amber-300 bg-status-unverified-bg px-2 py-0.5 text-[13px] font-medium text-status-unverified">
        {t('dtvSourceBadge')}
      </p>
    )
  }

  if (source === CAV_SOURCE) {
    return (
      <p className="mt-2 inline-flex items-center rounded-full border border-amber-300 bg-status-unverified-bg px-2 py-0.5 text-[13px] font-medium text-status-unverified">
        {t('cavSourceBadge')}
      </p>
    )
  }

  return null
}
