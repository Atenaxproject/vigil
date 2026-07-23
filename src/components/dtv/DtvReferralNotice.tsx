'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import { useDtvReferral } from '@/hooks/useDtvReferral'

interface DtvReferralNoticeProps {
  /** Show the "Buscar aquí" CTA (used on pages that are not /buscar). */
  showCta?: boolean
  /**
   * Honest differentiation gate (74 C4): the photo-search clause renders only
   * when the feature is actually available right now — key configured AND the
   * cost circuit breaker allows it. Advertising a degraded feature to a
   * grieving user is worse than not mentioning it.
   */
  photoSearchAvailable?: boolean
}

export function DtvReferralNotice({ showCta = false, photoSearchAvailable = false }: DtvReferralNoticeProps) {
  const t = useTranslations('missing.dtvReferral')
  const tCommon = useTranslations('common')
  const { showNotice, dismissNotice } = useDtvReferral()

  if (!showNotice) return null

  return (
    <div
      role="note"
      className="mb-3 flex items-start gap-3 rounded-card border border-blue-200 bg-vigil-blue-light p-4"
    >
      <div className="flex-1">
        <p className="text-[16px] font-semibold text-vigil-ink">{t('title')}</p>
        <p className="mt-1 text-[16px] leading-relaxed text-vigil-body">
          {photoSearchAvailable ? t('bodyFull') : t('bodyNoPhoto')}
        </p>
        {showCta && (
          <Link
            href="/buscar"
            className="mt-3 inline-flex min-h-[44px] items-center rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            {t('cta')}
          </Link>
        )}
      </div>
      <button
        type="button"
        onClick={dismissNotice}
        aria-label={tCommon('close')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        <X className="h-5 w-5" aria-hidden />
      </button>
    </div>
  )
}
