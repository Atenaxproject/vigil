'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { X } from 'lucide-react'
import {
  MINI_GUIDE_DISMISS_PREFIX,
  getViewModeDefinition,
  type ViewModeId,
} from '@/config/viewMode.config'

interface ModeMiniGuideProps {
  mode: ViewModeId
}

export function ModeMiniGuide({ mode }: ModeMiniGuideProps) {
  const t = useTranslations('viewMode')
  const [visible, setVisible] = useState(false)
  const def = getViewModeDefinition(mode)

  useEffect(() => {
    if (mode === 'ver_todo' || !def) {
      setVisible(false)
      return
    }
    try {
      const dismissed = localStorage.getItem(`${MINI_GUIDE_DISMISS_PREFIX}${mode}`)
      setVisible(dismissed !== 'true')
    } catch {
      setVisible(true)
    }
  }, [mode, def])

  const dismiss = useCallback(() => {
    setVisible(false)
    try {
      localStorage.setItem(`${MINI_GUIDE_DISMISS_PREFIX}${mode}`, 'true')
    } catch {
      /* ignore */
    }
  }, [mode])

  if (!visible || !def) return null

  const tips = t.raw(`miniGuide.${mode}.tips`) as string[]
  const helpHref = `/ayuda#${def.helpSectionId}`

  return (
    <div
      className="border-b border-slate-200 bg-vigil-blue-light px-4 py-3 md:px-6"
      role="region"
      aria-label={t(`miniGuide.${mode}.title`)}
    >
      <div className="mx-auto flex max-w-3xl gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[16px] font-medium text-vigil-ink">{t(`miniGuide.${mode}.title`)}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px] text-vigil-body">
            {Array.isArray(tips) &&
              tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
          </ul>
          <Link
            href={helpHref}
            className="mt-2 inline-flex min-h-[44px] items-center text-[13px] font-medium text-vigil-blue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
          >
            {t('miniGuide.fullGuideLink')} →
          </Link>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('miniGuide.dismiss')}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-vigil-muted hover:bg-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>
      <button
        type="button"
        onClick={dismiss}
        className="mt-2 text-[13px] text-vigil-muted underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
      >
        {t('miniGuide.dismiss')}
      </button>
    </div>
  )
}
