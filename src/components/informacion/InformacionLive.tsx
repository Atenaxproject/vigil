'use client'

import { useCallback, useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ExternalLink, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { InfrastructureStatus } from '@/types/vigil.types'

interface LiveQuake {
  magnitude: number | null
  place: string
  time: number
  url: string
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

const STATS_VERIFIED_DATE = '2026-06-29'

export function InformacionLive() {
  const t = useTranslations('liveInfo')
  const tc = useTranslations('crisisInfo')
  const [liveData, setLiveData] = useState<LiveInfoResponse | null>(null)
  const [rssItems, setRssItems] = useState<RssNewsItem[]>([])
  const [infra, setInfra] = useState<InfrastructureStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [clock, setClock] = useState(Date.now())
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  const fetchLive = useCallback(async () => {
    try {
      const [liveRes, rssRes] = await Promise.all([
        fetch('/api/live-info'),
        fetch('/api/news-rss'),
      ])
      if (liveRes.ok) {
        setLiveData(await liveRes.json())
      }
      if (rssRes.ok) {
        const rssData = (await rssRes.json()) as { items?: RssNewsItem[] }
        setRssItems(rssData.items ?? [])
      }
    } catch {
      /* keep previous data */
    } finally {
      setLoading(false)
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
      .subscribe()
    return () => {
      void supabase.removeChannel(channel)
    }
  }, [fetchInfra])

  const dateLocale = locale === 'es' ? es : enUS
  const lastUpdatedLabel = liveData?.lastUpdated
    ? formatDistanceToNow(new Date(liveData.lastUpdated), { addSuffix: true, locale: dateLocale })
    : '—'

  const stats = [
    { label: tc('stats.deaths'), value: '1,430+', source: 'OCHA' },
    { label: tc('stats.injured'), value: '3,238+', source: 'OCHA' },
    { label: tc('stats.missing'), value: '45,000–68,900', source: tc('stats.missingSource') },
    { label: tc('stats.displaced'), value: '12,000+', source: 'OCHA' },
    { label: tc('stats.buildings'), value: '770+', source: 'OCHA' },
  ]

  const hotlines = [
    {
      label: tc('hotlines.rescate'),
      value: `${CRISIS_CONFIG.emergency.hotlineLabel} — ${CRISIS_CONFIG.emergency.hotline}`,
      source: 'Gobierno de Venezuela',
    },
    { label: tc('hotlines.redCross'), value: '+58-212-781-2974', source: 'Cruz Roja Venezolana' },
    { label: 'OCHA Venezuela', value: '@OCHAVenezuela', source: 'X / Twitter' },
  ]

  const additionalHotlines = [
    { label: tc('hotlines.additional.cicpc'), value: '(0212) 571-3533' },
    { label: tc('hotlines.additional.bomberosChacao'), value: '(0212) 265-3261' },
    { label: tc('hotlines.additional.policiaBaruta'), value: '(0212) 943-2855' },
    { label: tc('hotlines.additional.policiaElHatillo'), value: '(0212) 961-1682' },
    { label: tc('hotlines.additional.defensaCivil'), value: '(0212) 662-6759' },
    { label: tc('hotlines.additional.emergenciasDigitel'), value: '112' },
    { label: tc('hotlines.additional.transito'), value: '167' },
  ]

  const officialSources = CRISIS_CONFIG.partnerLinks.filter((p) => p.type !== 'sister-platform')

  const gdacsAlertColor = (level: string) => {
    if (level === 'Red') return 'text-status-missing'
    if (level === 'Orange') return 'text-status-unverified'
    return 'text-status-alive'
  }
  const sisterPlatforms = CRISIS_CONFIG.partnerLinks.filter((p) => p.type === 'sister-platform')

  const metricLabel = (metric: string) => {
    const key = metric as 'electricity' | 'water' | 'roads' | 'airport' | 'telecom' | 'fuel'
    return t(`infraMetrics.${key}`)
  }

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
        <p className="mt-1 text-[16px] text-slate-600">
          {t('liveStatus.quakesTracked', { count: liveData?.recentSignificantQuakes.length ?? 0 })}
        </p>
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
            {t('liveStatus.latest')}: M{liveData.recentSignificantQuakes[0].magnitude}{' '}
            {liveData.recentSignificantQuakes[0].place}
          </p>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('stats.title')}</h2>
        <p className="mt-1 font-mono text-[13px] text-status-unverified">
          {t('manualStats', { date: STATS_VERIFIED_DATE })}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[13px] text-vigil-muted">{stat.label}</p>
              <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">{stat.value}</p>
              <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                {tc('source')}: {stat.source}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('gdacs.title')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('gdacs.subtitle')}</p>
        {loading && <div className="skeleton mt-4 h-24 rounded-card" />}
        {!loading && (liveData?.gdacsEvents?.length ?? 0) === 0 && (
          <p className="mt-3 text-[16px] text-vigil-muted">{t('gdacs.empty')}</p>
        )}
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

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('officialUpdates')}</h2>
        {loading && <div className="skeleton mt-4 h-24 rounded-card" />}
        {!loading && (liveData?.officialReports.length ?? 0) === 0 && (
          <p className="mt-3 text-[16px] text-vigil-muted">{t('noReports')}</p>
        )}
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

      <section className="mt-10 border-t border-slate-200 pt-8">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('rssTier')}</h2>
        <p className="mt-1 text-[13px] text-status-unverified">{t('rssDisclaimer')}</p>
        {loading && <div className="skeleton mt-4 h-24 rounded-card" />}
        {!loading && rssItems.length === 0 && (
          <p className="mt-3 text-[16px] text-vigil-muted">{t('rssEmpty')}</p>
        )}
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

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('infra.title')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('infraLive')}</p>
        <div className="mt-4 space-y-3">
          {infra.length === 0 && (
            <p className="text-[16px] text-vigil-muted">{t('infraEmpty')}</p>
          )}
          {infra.map((item) => (
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
              </div>
              <span className="font-mono text-[17px] font-semibold text-vigil-ink">
                {item.status_percent != null ? `${item.status_percent}%` : '—'}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('hotlines.title')}</h2>
        <div className="mt-4 space-y-3">
          {hotlines.map((line) => (
            <div key={line.label} className="rounded-card border border-slate-200 bg-white p-4">
              <p className="text-[16px] font-medium text-vigil-ink">{line.label}</p>
              <p className="mt-1 font-mono text-[17px] text-vigil-blue">{line.value}</p>
              <p className="mt-1 font-mono text-[13px] text-vigil-muted">
                {tc('source')}: {line.source}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('hotlines.additionalTitle')}</h2>
        <div className="mt-4 space-y-2">
          {additionalHotlines.map((line) => (
            <div
              key={line.label}
              className="flex items-center justify-between rounded-card border border-slate-200 bg-white px-4 py-3"
            >
              <p className="text-[16px] text-vigil-body">{line.label}</p>
              <p className="font-mono text-[16px] font-medium text-vigil-blue">{line.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[13px] text-vigil-muted">
          {tc('source')}: {tc('hotlines.additionalSource')}
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{tc('sisterPlatforms.title')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{tc('sisterPlatforms.approximateNote')}</p>
        <div className="mt-4 space-y-3">
          {sisterPlatforms.map((platform) => {
            const slug =
              'slug' in platform && platform.slug ? platform.slug : 'venezuelaTeBusca'
            const descriptionKey = `sisterPlatforms.${slug}` as
              | 'sisterPlatforms.venezuelaTeBusca'
              | 'sisterPlatforms.desaparecidosTerremoto'
              | 'sisterPlatforms.redQuipu'
              | 'sisterPlatforms.mapaDanosVenezuela'
            return (
              <a
                key={platform.url}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-card border border-slate-200 bg-white p-4 hover:border-vigil-blue"
              >
                <p className="flex items-center gap-1 text-[16px] font-medium text-vigil-blue">
                  {platform.name}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </p>
                <p className="mt-1 text-[16px] text-vigil-body">{tc(descriptionKey)}</p>
              </a>
            )
          })}
        </div>
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
        {t('clockTick', { time: formatDistanceToNow(liveData?.lastUpdated ? new Date(liveData.lastUpdated) : new Date(clock), { addSuffix: true, locale: dateLocale }) })}
      </p>
    </div>
  )
}
