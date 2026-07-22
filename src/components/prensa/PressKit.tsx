'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ExternalLink, Mail, Copy, Check, Download } from 'lucide-react'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { SourcedFigureCard, StatsRefreshTimestamp } from '@/components/stats/SourcedFigureCard'
import type { SourcedFigureRow } from '@/types/vigil.types'

interface DtvMetricsResponse {
  totalPersonas: number
  sinContacto: number
  localizados: number
  totalCentros: number
  lastUpdated: string
  source: string
  available: boolean
}

/** Coverage entries — hidden until non-zero (prompt 62 / 65). */
const COVERAGE: { outlet: string; country: string; format: string; date: string; url: string }[] = []

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
  const [figures, setFigures] = useState<SourcedFigureRow[]>([])
  const [figuresUpdated, setFiguresUpdated] = useState<string | null>(null)
  const [locale, setLocale] = useState('es')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  useEffect(() => {
    void fetch('/api/dtv-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DtvMetricsResponse | null) => setMetrics(data))
      .catch(() => setMetrics(null))

    void fetch('/api/sourced-figures')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { figures?: SourcedFigureRow[]; lastUpdated?: string } | null) => {
        setFigures(data?.figures ?? [])
        setFiguresUpdated(data?.lastUpdated ?? null)
      })
      .catch(() => setFigures([]))
  }, [])

  const numberLocale = locale === 'en' ? 'en-US' : 'es-VE'

  async function copyBoilerplate() {
    try {
      await navigator.clipboard.writeText(t('boilerplate.body'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const values = [
    { title: t('values.honesty'), body: t('values.honestyBody') },
    { title: t('values.privacy'), body: t('values.privacyBody') },
    { title: t('values.federate'), body: t('values.federateBody') },
    { title: t('values.open'), body: t('values.openBody') },
    { title: t('values.barrier'), body: t('values.barrierBody') },
  ]

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('boilerplate.title')}</h2>
          <button
            type="button"
            onClick={() => void copyBoilerplate()}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-input border border-slate-200 px-3 text-[13px] font-medium text-vigil-blue hover:border-vigil-blue"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? t('boilerplate.copied') : t('boilerplate.copy')}
          </button>
        </div>
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
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('factSheet.title')}</h2>
        <p className="mt-1 text-[16px] text-vigil-muted">{t('factSheet.subtitle')}</p>
        <p className="mt-2 text-[13px] text-status-unverified">{t('factSheet.dtvNote')}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {figures.map((fig) => (
            <SourcedFigureCard
              key={fig.key}
              locale={locale}
              figure={{
                key: fig.key,
                label: locale === 'en' ? fig.label_en : fig.label_es,
                value: fig.value,
                source: fig.source,
                source_url: fig.source_url,
                verified_at: fig.verified_at,
                is_official: fig.is_official,
              }}
            />
          ))}
        </div>
        {figuresUpdated && <StatsRefreshTimestamp lastUpdated={figuresUpdated} locale={locale} />}

        {metrics?.available && (
          <div className="mt-6">
            <h3 className="text-[17px] font-medium text-vigil-ink">{t('stats.title')}</h3>
            <p className="mt-1 text-[13px] text-vigil-muted">{t('stats.subtitle')}</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {(metrics.totalPersonas ?? 0) > 0 && (
                <div className="rounded-card border border-slate-200 bg-white p-4">
                  <p className="text-[13px] text-vigil-muted">{t('stats.searchablePersons')}</p>
                  <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
                    {metrics.totalPersonas.toLocaleString(numberLocale)}
                  </p>
                  <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                    {t('stats.source', { source: metrics.source })}
                  </p>
                </div>
              )}
              {(metrics.sinContacto ?? 0) > 0 && (
                <div className="rounded-card border border-slate-200 bg-white p-4">
                  <p className="text-[13px] text-vigil-muted">{t('stats.sinContacto')}</p>
                  <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
                    {metrics.sinContacto.toLocaleString(numberLocale)}
                  </p>
                </div>
              )}
              {(metrics.localizados ?? 0) > 0 && (
                <div className="rounded-card border border-slate-200 bg-white p-4">
                  <p className="text-[13px] text-vigil-muted">{t('stats.localizados')}</p>
                  <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
                    {metrics.localizados.toLocaleString(numberLocale)}
                  </p>
                </div>
              )}
              {(metrics.totalCentros ?? 0) > 0 && (
                <div className="rounded-card border border-slate-200 bg-white p-4">
                  <p className="text-[13px] text-vigil-muted">{t('stats.centros')}</p>
                  <p className="mt-1 font-display text-[34px] font-bold tracking-tight text-vigil-ink">
                    {metrics.totalCentros.toLocaleString(numberLocale)}
                  </p>
                </div>
              )}
            </div>
            {metrics.lastUpdated && (
              <StatsRefreshTimestamp lastUpdated={metrics.lastUpdated} locale={locale} />
            )}
            <p className="mt-2 text-[13px] text-vigil-muted">{t('stats.disclaimer')}</p>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('founder.title')}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-vigil-body">{t('founder.bio')}</p>
        <p className="mt-2 text-[13px] text-vigil-muted">{t('founder.responseTime')}</p>
        <a
          href={`mailto:${PRESS_EMAIL}`}
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 text-[16px] font-medium text-vigil-blue hover:underline"
        >
          <Mail className="h-4 w-4" aria-hidden />
          {PRESS_EMAIL}
        </a>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('assets.title')}</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <a href="/brand/vigil-mark.svg" download className="text-[16px] text-vigil-blue hover:underline">
              {t('assets.logoSvg')}
            </a>
          </li>
          <li>
            <a href="/android-chrome-512x512.png" download className="text-[16px] text-vigil-blue hover:underline">
              {t('assets.logoPng')}
            </a>
          </li>
          <li>
            <a href="/android-chrome-512x512.png" download className="text-[16px] text-vigil-blue hover:underline">
              {t('assets.ogImage')}
            </a>
          </li>
        </ul>
        <h3 className="mt-6 text-[17px] font-medium text-vigil-ink">{t('screenshots.title')}</h3>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          {SCREENSHOTS.map((shot) => (
            <a key={shot.src} href={shot.src} download className="block overflow-hidden rounded-card border border-slate-200">
              <Image
                src={shot.src}
                alt={t(shot.altKey)}
                width={shot.width}
                height={shot.height}
                className="h-auto w-full"
              />
            </a>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('story.title')}</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-vigil-body">{t('story.body')}</p>
        <div className="mt-4 space-y-1 text-[16px] text-vigil-body">
          {CRISIS_CONFIG.epicenters.map((e) => (
            <p key={e.magnitude}>
              <strong>Mw {e.magnitude}</strong> — {locale === 'en' ? e.place_en : e.place_es}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('mission.title')}</h2>
        <p className="mt-2 text-[16px] text-vigil-body">{t('mission.body')}</p>
        <h2 className="mt-6 text-[20px] font-semibold text-vigil-ink">{t('vision.title')}</h2>
        <p className="mt-2 text-[16px] text-vigil-body">{t('vision.body')}</p>
        <h2 className="mt-6 text-[20px] font-semibold text-vigil-ink">{t('values.title')}</h2>
        <ul className="mt-3 space-y-3">
          {values.map((v) => (
            <li key={v.title} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[16px] font-medium text-vigil-ink">{v.title}</p>
              <p className="mt-1 text-[16px] text-vigil-body">{v.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10 rounded-card border border-slate-200 bg-vigil-cloud p-4">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('kit.title')}</h2>
        <p className="mt-1 text-[16px] text-vigil-muted">{t('kit.subtitle')}</p>
        <a
          href="/api/press-kit/download"
          className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white"
        >
          <Download className="h-4 w-4" aria-hidden />
          {t('kit.download')}
        </a>
        <p className="mt-3 text-[13px] text-vigil-muted">{t('kit.bulletinsNext')}</p>
      </section>

      {/* Coverage: structure ready, hidden while empty — never show a zero counter */}
      {COVERAGE.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('coverage.title')}</h2>
          <ul className="mt-4 space-y-3">
            {COVERAGE.map((c) => (
              <li key={c.url}>
                <a
                  href={c.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
                >
                  <p className="text-[16px] font-medium text-vigil-ink">{c.outlet}</p>
                  <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                    {c.country} · {c.format} · {c.date}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('govExclusion.title')}</h2>
        <p className="mt-2 text-[16px] text-vigil-body">{t('govExclusion.body')}</p>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('contact.title')}</h2>
        <p className="mt-2 text-[16px] text-vigil-body">{t('contact.note')}</p>
        <Link href="/informacion" className="mt-4 inline-block text-[16px] text-vigil-blue hover:underline">
          {t('informacionLink')} →
        </Link>
      </section>
    </div>
  )
}
