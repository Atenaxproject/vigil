'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

interface DtvMetricsResponse {
  totalPersonas: number
  totalCentros: number
  totalListas: number
  lastUpdated: string
  available: boolean
}

export function DtvNetworkWidget() {
  const t = useTranslations('liveInfo.dtvNetwork')
  const [metrics, setMetrics] = useState<DtvMetricsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void fetch('/api/dtv-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DtvMetricsResponse | null) => setMetrics(data))
      .catch(() => setMetrics(null))
      .finally(() => setLoading(false))
  }, [])

  // Zero-suppression rule (74 A2 / 75 §1): each tile renders only for a real
  // non-zero value. Never a literal 0 as a headline stat, and loading reads as
  // loading — not as an all-zero board.
  const tiles = metrics?.available
    ? ([
        ['personas', metrics.totalPersonas],
        ['centros', metrics.totalCentros],
        ['listas', metrics.totalListas],
      ] as const).filter(([, value]) => value > 0)
    : []

  return (
    <section className="mt-10 rounded-card border border-status-unverified/30 bg-status-unverified-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('title')}</h2>
        <span className="rounded-badge bg-status-unverified px-2 py-0.5 text-[13px] font-medium text-white">
          {t('badge')}
        </span>
      </div>
      {loading && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3" aria-hidden>
          <div className="skeleton h-[68px] rounded-card" />
          <div className="skeleton h-[68px] rounded-card" />
          <div className="skeleton h-[68px] rounded-card" />
        </div>
      )}
      {!loading && tiles.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tiles.map(([key, value]) => (
            <div key={key} className="rounded-card border border-slate-200 bg-white p-3">
              <p className="text-[13px] text-vigil-muted">{t(key)}</p>
              <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">
                {value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
      {!loading && tiles.length === 0 && (
        <p className="mt-3 text-[13px] text-vigil-muted">{t('unavailable')}</p>
      )}
      <a
        href={DTV_PLATFORM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1 text-[16px] text-vigil-blue"
      >
        {t('viewPlatform')}
        <ExternalLink className="h-3 w-3" aria-hidden />
      </a>
      <p className="mt-2 font-mono text-[13px] text-vigil-muted">{t('attribution')}</p>
    </section>
  )
}
