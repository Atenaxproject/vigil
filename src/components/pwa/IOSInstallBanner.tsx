'use client'

import { useEffect, useState } from 'react'
import { Share, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  IOS_BANNER_DISMISSED_KEY,
  isIOS,
  isInStandaloneMode,
} from '@/lib/pwa-install'

export function IOSInstallBanner() {
  const t = useTranslations('pwa.iosBanner')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isIOS() || isInStandaloneMode()) return
    if (sessionStorage.getItem(IOS_BANNER_DISMISSED_KEY)) return
    setVisible(true)
  }, [])

  const dismiss = () => {
    sessionStorage.setItem(IOS_BANNER_DISMISSED_KEY, '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="region"
      aria-label={t('title')}
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-3 right-3 z-40 rounded-card border border-[color:var(--vigil-border)] bg-[color:var(--vigil-surface)] p-3 shadow-md lg:bottom-4 lg:left-auto lg:right-4 lg:max-w-sm"
    >
      <div className="flex items-start gap-3">
        <p className="flex-1 text-[13px] leading-snug text-[color:var(--vigil-body)]">
          <span className="mb-1 block text-[16px] font-medium text-[color:var(--vigil-heading)]">
            {t('title')}
          </span>
          {t('instructionsPrefix')}{' '}
          <Share className="mx-0.5 inline h-4 w-4 align-text-bottom text-vigil-blue" aria-hidden />{' '}
          {t('instructionsSuffix')}
        </p>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-vigil-cloud focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          aria-label={t('dismiss')}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="mt-3 w-full rounded-input bg-vigil-blue px-3 py-2 text-[13px] font-medium text-white hover:bg-vigil-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        {t('dismiss')}
      </button>
    </div>
  )
}
