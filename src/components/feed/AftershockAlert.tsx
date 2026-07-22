'use client'

import { AlertTriangle, ExternalLink } from 'lucide-react'
import { useTranslations } from 'next-intl'
import type { SeismicEvent } from '@/types/vigil.types'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { getFeedFreshness, usgsSourceUrl } from '@/lib/feed-health'

interface AftershockAlertProps {
  events: SeismicEvent[]
  fetchedAt?: string
  ok?: boolean
}

export function AftershockAlert({ events, fetchedAt, ok = true }: AftershockAlertProps) {
  const t = useTranslations('map.seismicFreshness')
  const freshness = ok ? getFeedFreshness(fetchedAt) : 'unavailable'

  if (freshness === 'unavailable' || !ok) {
    return (
      <div
        className="flex items-center gap-2 rounded-card border border-amber-200 bg-status-unverified-bg px-4 py-3 text-[16px] text-amber-900"
        role="alert"
      >
        <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
        <span className="flex-1">{t('unavailable')}</span>
        <a
          href={usgsSourceUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-vigil-blue underline-offset-2 hover:underline"
        >
          USGS <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    )
  }

  const alerts = events.filter((e) => e.magnitude >= CRISIS_CONFIG.seismic.alertThresholdMag)
  if (alerts.length === 0 && freshness !== 'stale') return null

  const latest = alerts[0]
  return (
    <div
      className="flex flex-col gap-1 rounded-card border border-amber-200 bg-status-unverified-bg px-4 py-3 text-[16px] text-amber-900"
      role="alert"
    >
      {latest && (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
          <span>
            Réplica M{latest.magnitude.toFixed(1)} — {latest.place}
          </span>
        </div>
      )}
      {freshness === 'stale' && (
        <p className="pl-6 text-[13px] text-amber-800/80">
          {t('stale')}{' '}
          <a
            href={usgsSourceUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-vigil-blue underline-offset-2 hover:underline"
          >
            USGS
          </a>
        </p>
      )}
    </div>
  )
}
