'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import { ConnectivityInfoCard } from '@/components/informacion/ConnectivityInfoCard'
import { EmergencyDirectory } from '@/components/directory/EmergencyDirectory'
import { SourcedFigureCard, StatsRefreshTimestamp } from '@/components/stats/SourcedFigureCard'
import { getFigureFreshness } from '@/lib/provenance'
import type { InfrastructureStatus, SourcedFigureRow } from '@/types/vigil.types'

interface LiveQuake {
  magnitude: number | null
  place: string
  time: number
  url: string
  source?: string
}

interface OfficialReport {
  title: string
  date: string
  url: string
  source: string
}

interface GDACSEvent {
  title: string
  alertLevel: string
  eventType: string
  date: string
  url: string
  lat: number | null
  lng: number | null
  severity: number | null
}

interface RssNewsItem {
  source: string
  title: string
  link: string
  pubDate: string
  contentSnippet: string
}

interface LiveInfoResponse {
  lastUpdated: string
  recentSignificantQuakes: LiveQuake[]
  officialReports: OfficialReport[]
  gdacsEvents?: GDACSEvent[]
}

export function InformacionLive() {
  const t = useTranslations('liveInfo')
  const tc = useTranslations('crisisInfo')
  const [liveData, setLiveData] = useState<LiveInfoResponse | null>(null)
  const [rssItems, setRssItems] = useState<RssNewsItem[]>([])
  const [infra, setInfra] = useState<InfrastructureStatus[]>([])
  const [figures, setFigures] = useState<SourcedFigureRow[]>([])
  const [figuresUpdated, setFiguresUpdated] = useState<string | null>(null)
  const [clock, setClock] = useState(Date.now())
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  const fetchLive = useCallback(async () => {
    try {
      const [liveRes, rssRes, figuresRes] = await Promise.all([
        fetch('/api/live-info'),
        fetch('/api/news-rss'),
        fetch('/api/sourced-figures'),
      ])
      if (liveRes.ok) {
        setLiveData(await liveRes.json())
      }
      if (rssRes.ok) {
        const rssData = (await rssRes.json()) as { items?: RssNewsItem[] }
        setRssItems(rssData.items ?? [])
      }
      if (figuresRes.ok) {
        const figData = (await figuresRes.json()) as {
          figures?: SourcedFigureRow[]
          lastUpdated?: string
        }
        setFigures(figData.figures ?? [])
        setFiguresUpdated(figData.lastUpdated ?? new Date().toISOString())
      }
    } catch {
      /* keep previous data */
    }
  }, [])

  const fetchInfra = useCallback(async () => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const { data } = await supabase.from('infrastructure_status').select('*').order('region')
    if (data) setInfra(data as InfrastructureStatus[])
  }, [])

  useEffect(() => {
    void fetchLive()
    void fetchInfra()
    const liveInterval = setInterval(fetchLive, 5 * 60 * 1000)
    const clockInterval = setInterval(() => setClock(Date.now()), 30 * 1000)
    return () => {
      clearInterval(liveInterval)
      clearInterval(clockInterval)
    }
  }, [fetchLive, fetchInfra])

  useEffect(() => {
    if (!isSupabaseConfigured()) return
    const supabase = createClient()
    const channel = supabase
      .channel('infrastructure-status-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'infrastructure_status' }, () => {
        void fetchInfra()
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sourced_figures' }, () => {
        void fetchLive()
      })
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchInfra, fetchLive])

  const dateLocale = locale === 'es' ? es : enUS
  const lastUpdatedLabel = liveData?.lastUpdated
    ? formatDistanceToNow(new Date(liveData.lastUpdated), { addSuffix: true, locale: dateLocale })
    : '—'

  const visibleInfra = useMemo(() => {
    return infra.filter((item) => {
      const verified = item.verified_at ?? item.updated_at
      return getFigureFreshness(verified) !== 'expired'
    })
  }, [infra])

  const officialSources = CRISIS_CONFIG.partnerLinks.filter((p) => p.type !== 'sister-platform')

  const gdacsAlertColor = (level: string) => {
    if (level === 'Red') return 'text-status-missing'
    if (level === 'Orange') return 'text-status-unverified'
    return 'text-status-alive'
  }

  const metricLabel = (metric: string) => {
    const key = metric as 'electricity' | 'water' | 'roads' | 'airport' | 'telecom' | 'fuel'
    return t(`infraMetrics.${key}`)
  }

  const psychosocial = CRISIS_CONFIG.psychosocialLines

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-6 rounded-card border border-slate-200 bg-vigil-blue-light p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[16px] font-medium text-vigil-ink">{t('liveStatus.title')}</p>
          <button
            type="button"
            onClick={() => void fetchLive()}
            className="inline-flex items-center gap-1 text-[13px] text-vigil-blue"
            aria-label={t('liveStatus.refresh')}
          >
            <RefreshCw className="h-3 w-3" />
            {t('liveStatus.refresh')}
          </button>
        </div>
        <p className="mt-2 font-mono text-[13px] text-vigil-muted">
          {t('liveStatus.lastUpdate', { time: lastUpdatedLabel })}
        </p>
        {(liveData?.recentSignificantQuakes.length ?? 0) > 0 && (
          <p className="mt-1 text-[16px] text-slate-600">
            {t('liveStatus.quakesTracked', {
              count: liveData!.recentSignificantQuakes.length,
            })}
          </p>
        )}
        <div className="mt-3 space-y-1 text-[16px] text-slate-700">
          {CRISIS_CONFIG.epicenters.map((e) => (
            <p key={e.magnitude}>
              <span className="font-semibold">Mw {e.magnitude}</span>
              {' — '}
              {locale === 'en' ? e.place_en : e.place_es}
            </p>
          ))}
        </div>
        <a
          href="https://earthquake.usgs.gov/earthquakes/map/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex items-center gap-1 text-[16px] text-vigil-blue"
        >
          USGS {t('liveStatus.fullFeed')} <ExternalLink className="h-3 w-3" />
        </a>
        {liveData?.recentSignificantQuakes[0] && (
          <p className="mt-2 text-[16px] text-slate-700">
            {t('liveStatus.latest')}:{' '}
            {liveData.recentSignificantQuakes[0].source && (
              <span className="font-mono text-[13px] text-vigil-muted">
                [{liveData.recentSignificantQuakes[0].source}]{' '}
              </span>
            )}
            M{liveData.recentSignificantQuakes[0].magnitude}{' '}
            {liveData.recentSignificantQuakes[0].place}
          </p>
        )}
      </section>

      <ConnectivityInfoCard />

      <section className="mt-10 rounded-card border border-slate-200 bg-white p-4">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('crossLinks.title')}</h2>
        <ul className="mt-3 space-y-2">
          <li>
            <Link href="/estadisticas" className="text-[16px] font-medium text-vigil-blue hover:underline">
              {t('crossLinks.stats')} →
            </Link>
            <p className="text-[13px] text-vigil-muted">{t('crossLinks.statsDesc')}</p>
          </li>
          <li>
            <Link href="/red" className="text-[16px] font-medium text-vigil-blue hover:underline">
              {t('crossLinks.network')} →
            </Link>
            <p className="text-[13px] text-vigil-muted">{t('crossLinks.networkDesc')}</p>
          </li>
          <li>
            <Link href="/conectividad" className="text-[16px] font-medium text-vigil-blue hover:underline">
              {t('crossLinks.connectivity')} →
            </Link>
            <p className="text-[13px] text-vigil-muted">{t('crossLinks.connectivityDesc')}</p>
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('stats.title')}</h2>
        <p className="mt-1 text-[13px] text-status-unverified">{tc('stats.officialFraming')}</p>
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
        <p className="mt-4 text-[16px] text-slate-700">{tc('stats.medicalStrain')}</p>
      </section>

      <section className="mt-10 rounded-card border border-slate-200 bg-white p-4" id="apoyo-psicosocial">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('psychosocial.title')}</h2>
        <p className="mt-1 text-[13px] text-status-unverified">{tc('psychosocial.verifyNote')}</p>
        <p className="mt-2 text-[13px] text-vigil-muted">{tc('psychosocial.scopeNote')}</p>
        <div className="mt-4 space-y-3">
          {psychosocial.map((line) => (
            <div key={line.id} className="rounded-card border border-slate-200 px-4 py-3">
              <p className="text-[16px] font-medium text-vigil-ink">{line.name}</p>
              {line.numbers.length > 0 && (
                <p className="mt-1 font-mono text-[17px] text-vigil-blue">{line.numbers.join(' · ')}</p>
              )}
              <p className="mt-1 text-[13px] text-vigil-muted">
                {locale === 'en' ? line.note_en : line.note_es}
              </p>
              {line.venezuela_only && (
                <p className="mt-2 text-[13px] font-medium text-status-unverified">
                  {tc('psychosocial.venezuelaOnly')}
                </p>
              )}
              <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                {tc('source')}: {line.source} · {line.verified_at}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 rounded-card border border-slate-200 bg-vigil-cloud p-4">
        <p className="text-[16px] text-vigil-body">{tc('telecomFreeCalls')}</p>
        <p className="mt-2 font-mono text-[13px] text-vigil-muted">{tc('telecomFreeCallsSource')}</p>
      </section>

      {/* Show-only-when-real (empty-state policy): a data section renders only
          when it has content. No idle "no alerts" line — GDACS having nothing
          for Venezuela is the normal, good case and shouldn't occupy the page. */}
      {(liveData?.gdacsEvents?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('gdacs.title')}</h2>
          <p className="mt-1 text-[13px] text-vigil-muted">{t('gdacs.subtitle')}</p>
          <div className="mt-4 space-y-3">
            {liveData?.gdacsEvents?.map((event) => (
              <a
                key={`${event.url}-${event.date}`}
                href={event.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[16px] font-medium text-vigil-ink">{event.title}</p>
                  <span className={`font-mono text-[13px] font-semibold ${gdacsAlertColor(event.alertLevel)}`}>
                    {event.alertLevel}
                  </span>
                </div>
                <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                  GDACS · {event.severity != null ? `M${event.severity}` : event.eventType} ·{' '}
                  {event.date ? new Date(event.date).toLocaleDateString(locale) : '—'}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Official updates (ReliefWeb). Suppress the whole section — heading
          included — when the source returns nothing, so a dead/degraded feed
          reads as "unavailable," never as "this platform is broken" (75C §1).
          The hub reads as complete on USGS + GDACS + RSS alone. */}
      {(liveData?.officialReports.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('officialUpdates')}</h2>
          <div className="mt-4 space-y-3">
            {liveData?.officialReports.map((report) => (
              <a
                key={report.url}
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
              >
                <p className="text-[16px] font-medium text-vigil-ink">{report.title}</p>
                <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                  {report.source} · {new Date(report.date).toLocaleDateString(locale)}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {rssItems.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('rssTier')}</h2>
          <p className="mt-1 text-[13px] text-status-unverified">{t('rssDisclaimer')}</p>
          <div className="mt-4 space-y-3">
            {rssItems.slice(0, 8).map((item) => (
              <a
                key={`${item.source}-${item.link}`}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
              >
                <p className="text-[16px] font-medium text-vigil-ink">{item.title}</p>
                <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                  {item.source}
                  {item.pubDate && ` · ${new Date(item.pubDate).toLocaleDateString(locale)}`}
                </p>
              </a>
            ))}
          </div>
        </section>
      )}

      {visibleInfra.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('infra.title')}</h2>
          <p className="mt-1 text-[13px] text-vigil-muted">{t('infraLive')}</p>
          <div className="mt-4 space-y-3">
            {visibleInfra.map((item) => {
            const freshness = getFigureFreshness(item.verified_at ?? item.updated_at)
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-card border border-slate-200 bg-white px-4 py-3"
              >
                <div>
                  <p className="text-[16px] font-medium text-vigil-ink">
                    {metricLabel(item.metric)} — {item.region}
                  </p>
                  {item.status_label && (
                    <p className="text-[13px] text-vigil-muted">{item.status_label}</p>
                  )}
                  {item.source && (
                    <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                      {tc('source')}: {item.source}
                      {item.verified_at
                        ? ` · ${new Date(item.verified_at).toLocaleDateString(locale)}`
                        : ''}
                    </p>
                  )}
                  {freshness === 'stale' && (
                    <p className="mt-1 text-[13px] text-status-unverified">
                      {locale === 'en' ? 'May be outdated' : 'Puede estar desactualizado'}
                    </p>
                  )}
                </div>
                <span className="font-mono text-[17px] font-semibold text-vigil-ink">
                  {item.status_percent != null ? `${item.status_percent}%` : '—'}
                </span>
              </div>
              )
            })}
          </div>
        </section>
      )}

      <section className="mt-10" id="emergency-contacts">
        <EmergencyDirectory locale={locale} />
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('sources.title')}</h2>
        <div className="mt-4 space-y-2">
          {officialSources.map((src) => (
            <a
              key={src.url}
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-card border border-slate-200 bg-white px-4 py-3 text-[16px] text-vigil-blue hover:border-vigil-blue"
            >
              {src.name} →
            </a>
          ))}
        </div>
      </section>

      <p className="mt-8 font-mono text-[13px] text-vigil-muted" suppressHydrationWarning>
        {t('clockTick', {
          time: formatDistanceToNow(
            liveData?.lastUpdated ? new Date(liveData.lastUpdated) : new Date(clock),
            { addSuffix: true, locale: dateLocale }
          ),
        })}
      </p>
    </div>
  )
}
