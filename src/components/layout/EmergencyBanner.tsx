'use client'

import { useTranslations } from 'next-intl'
import { AlertTriangle } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import Link from 'next/link'

interface EmergencyBannerProps {
  aftershockCount?: number
}

export function EmergencyBanner({ aftershockCount = 0 }: EmergencyBannerProps) {
  const t = useTranslations('banner')

  return (
    <div
      className="sticky top-0 z-[100] flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-slate-800 bg-vigil-ink px-4 py-2 text-xs text-slate-200"
      role="banner"
    >
      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden />
      <span className="shrink-0 font-medium">
        {t('emergency')} Venezuela
      </span>
      <a
        href={`tel:${CRISIS_CONFIG.emergency.hotline}`}
        className="shrink-0 rounded bg-status-missing px-2 py-0.5 font-mono text-[11px] font-bold text-white"
      >
        {t('hotline')} ({t('hotlineNumber')})
      </a>
      <Link
        href="https://interp-aid.lovable.app"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded border border-blue-700 px-2 py-0.5 text-blue-300 hover:bg-slate-800"
      >
        {t('interpreters')}
      </Link>
      <Link
        href="https://cruzrojavenezolana.org"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded border border-blue-700 px-2 py-0.5 text-blue-300 hover:bg-slate-800"
      >
        Cruz Roja
      </Link>
      {aftershockCount > 0 && (
        <span className="ml-auto shrink-0 font-mono text-slate-400">
          {aftershockCount} réplicas M4.0+
        </span>
      )}
    </div>
  )
}
