'use client'

import { ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

export function DtvSourceHeader() {
  const t = useTranslations('missing.search')

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-card border border-amber-200 bg-status-unverified-bg p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
      <span className="inline-flex w-fit items-center rounded-full border border-amber-300 bg-white px-3 py-1 text-[13px] font-medium text-status-unverified">
        {t('dtvSectionBadge')}
      </span>
      <a
        href={DTV_PLATFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[13px] font-medium text-vigil-blue hover:underline"
      >
        {t('dtvViewFullPlatform')}
        <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
      </a>
      <span className="w-full text-[13px] text-vigil-muted sm:w-auto">{t('dtvSectionNote')}</span>
    </div>
  )
}
