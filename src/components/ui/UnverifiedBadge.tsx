'use client'

import { AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function UnverifiedBadge() {
  const t = useTranslations('missing.card')
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-status-unverified-bg px-2 py-0.5 text-[11px] font-medium text-status-unverified">
      <AlertCircle className="h-3 w-3" aria-hidden />
      {t('unverified')}
    </span>
  )
}
