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

  useEffect(() => {
    void fetch('/api/dtv-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DtvMetricsResponse | null) => setMetrics(data))
      .catch(() => setMetrics(null))
  }, [])

  return (
    <section className="mt-10 rounded-card border border-status-unverified/30 bg-status-unverified-bg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('title')}</h2>
        <span className="rounded-badge bg-status-unverified px-2 py-0.5 text-[13px] font-medium text-white">
          {t('badge')}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-card border border-slate-200 bg-white p-3">
          <p className="text-[13px] text-vigil-muted">{t('personas')}</p>
          <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">
            {(metrics?.totalPersonas ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-card border border-slate-200 bg-white p-3">
          <p className="text-[13px] text-vigil-muted">{t('centros')}</p>
          <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">
            {(metrics?.totalCentros ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="rounded-card border border-slate-200 bg-white p-3">
          <p className="text-[13px] text-vigil-muted">{t('listas')}</p>
          <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">
            {(metrics?.totalListas ?? 0).toLocaleString()}
          </p>
        </div>
      </div>
      {!metrics?.available && (
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
