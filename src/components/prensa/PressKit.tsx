'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ExternalLink, Mail } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'

interface DtvMetricsResponse {
  totalPersonas: number
  totalCentros: number
  totalListas: number
  lastUpdated: string
  source: string
  available: boolean
}

const SCREENSHOTS = [
  { src: '/screenshots/desktop.png', altKey: 'screenshotDesktop', width: 720, height: 450 },
  { src: '/screenshots/iphone-portrait.png', altKey: 'screenshotIphone', width: 390, height: 844 },
  { src: '/screenshots/ipad-portrait.png', altKey: 'screenshotIpad', width: 384, height: 512 },
  { src: '/screenshots/iphone-landscape.png', altKey: 'screenshotLandscape', width: 422, height: 195 },
] as const

const PRESS_EMAIL = 'vigil@youthewave.org'
const REPO_URL = 'https://github.com/Atenaxproject/vigil'

export function PressKit() {
  const t = useTranslations('press')
  const [metrics, setMetrics] = useState<DtvMetricsResponse | null>(null)
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  useEffect(() => {
    void fetch('/api/dtv-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DtvMetricsResponse | null) => setMetrics(data))
      .catch(() => setMetrics(null))
  }, [])

  const dateLocale = locale === 'es' ? es : enUS
  const lastUpdated = metrics?.lastUpdated
    ? formatDistanceToNow(new Date(metrics.lastUpdated), { addSuffix: true, locale: dateLocale })
    : null

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('boilerplate.title')}</h2>
        <div className="mt-4 space-y-3 rounded-card border border-slate-200 bg-white p-4">
          <p className="text-[16px] leading-relaxed text-vigil-body">{t('boilerplate.body')}</p>
          <p className="text-[16px] text-vigil-body">
            <strong>{t('boilerplate.liveLabel')}:</strong>{' '}
            <a
              href={CRISIS_CONFIG.siteUrl}
              className="text-vigil-blue underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {CRISIS_CONFIG.siteUrl.replace('https://', '')}
            </a>
          </p>
          <p className="text-[16px] text-vigil-body">
            <strong>{t('boilerplate.repoLabel')}:</strong>{' '}
            <a
              href={REPO_URL}
              className="inline-flex items-center gap-1 text-vigil-blue underline-offset-2 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              github.com/Atenaxproject/vigil
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('stats.title')}</h2>
        <p className="mt-1 text-[16px] text-vigil-muted">{t('stats.subtitle')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <p className="text-[13px] text-vigil-muted">{t('stats.searchablePersons')}</p>
            <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
              {(metrics?.totalPersonas ?? 0).toLocaleString(locale)}
            </p>
            <p className="mt-1 font-mono text-[13px] text-vigil-muted">
              {t('stats.source', { source: metrics?.source ?? 'desaparecidosterremotovenezuela.com' })}
            </p>
          </div>
          <div className="rounded-card border border-slate-200 bg-white p-4">
            <p className="text-[13px] text-vigil-muted">{t('stats.centros')}</p>
            <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
              {(metrics?.totalCentros ?? 0).toLocaleString(locale)}
            </p>
          </div>
        </div>
        {!metrics?.available && (
          <p className="mt-3 text-[13px] text-vigil-muted">{t('stats.unavailable')}</p>
        )}
        {lastUpdated && (
          <p className="mt-2 font-mono text-[13px] text-vigil-muted" suppressHydrationWarning>
            {t('stats.lastUpdated', { time: lastUpdated })}
          </p>
        )}
        <div className="mt-4 rounded-card border border-amber-200 bg-status-unverified-bg p-4 text-[16px] text-amber-900">
          {t('stats.disclaimer')}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('screenshots.title')}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SCREENSHOTS.map((shot) => (
            <figure
              key={shot.src}
              className="overflow-hidden rounded-card border border-slate-200 bg-white"
            >
              <Image
                src={shot.src}
                alt={t(shot.altKey)}
                width={shot.width}
                height={shot.height}
                className="h-auto w-full"
              />
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('founder.title')}</h2>
        <div className="mt-4 rounded-card border border-slate-200 bg-white p-4">
          <p className="text-[16px] leading-relaxed text-vigil-body">{t('founder.bio')}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('govExclusion.title')}</h2>
        <div className="mt-4 rounded-card border border-slate-200 bg-vigil-blue-light p-4">
          <p className="text-[16px] leading-relaxed text-vigil-body">{t('govExclusion.body')}</p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('keyFacts.title')}</h2>
        <ul className="mt-4 space-y-2 rounded-card border border-slate-200 bg-white p-4 text-[16px] text-vigil-body">
          <li>{t('keyFacts.languages')}</li>
          <li>{t('keyFacts.diaspora')}</li>
          <li>{t('keyFacts.structural')}</li>
          <li>{t('keyFacts.connectivity')}</li>
          <li>{t('keyFacts.orgs')}</li>
          <li>{t('keyFacts.missingEstimate')}</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('contact.title')}</h2>
        <a
          href={`mailto:${PRESS_EMAIL}`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-5 text-[16px] font-medium text-white"
        >
          <Mail className="h-4 w-4" aria-hidden />
          {PRESS_EMAIL}
        </a>
        <p className="mt-3 text-[16px] text-vigil-muted">{t('contact.note')}</p>
      </section>

      <Link href="/informacion" className="mt-8 inline-block text-[16px] text-vigil-blue underline">
        {t('informacionLink')} →
      </Link>
    </div>
  )
}
