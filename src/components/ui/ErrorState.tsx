'use client'

import { useEffect } from 'react'
import { AlertTriangle, RotateCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ErrorStateProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Friendly, recoverable error UI shared by route-level error boundaries.
 * Lives inside NextIntlClientProvider so translations are available.
 */
export function ErrorState({ error, reset }: ErrorStateProps) {
  const t = useTranslations('common')

  useEffect(() => {
    // Surface the error for diagnostics without breaking the render.
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-status-unverified-bg">
        <AlertTriangle className="h-6 w-6 text-status-unverified" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-lg font-semibold text-vigil-ink">{t('error')}</h2>
      <p className="mt-1 max-w-sm text-[13px] text-vigil-muted">{t('errorHint')}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-4 text-[13px] font-medium text-white"
      >
        <RotateCw className="h-4 w-4" aria-hidden />
        {t('retry')}
      </button>
    </div>
  )
}
