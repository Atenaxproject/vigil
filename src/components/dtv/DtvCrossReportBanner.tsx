'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'

const STORAGE_KEY = 'vigil_dtv_cross_report_dismissed'
const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

export function DtvCrossReportBanner() {
  const t = useTranslations('missing.form.crossReport')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      setVisible(sessionStorage.getItem(STORAGE_KEY) !== '1')
    } catch {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="mb-4 flex gap-3 rounded-card border border-blue-200 bg-vigil-blue-light p-4"
      role="note"
    >
      <p className="flex-1 text-[16px] leading-relaxed text-vigil-body">
        {t.rich('body', {
          link: (chunks) => (
            <a
              href={DTV_PLATFORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-vigil-blue underline-offset-2 hover:underline"
            >
              {chunks}
            </a>
          ),
        })}
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-input text-vigil-muted hover:bg-white/80 hover:text-vigil-ink"
        aria-label={t('dismiss')}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
