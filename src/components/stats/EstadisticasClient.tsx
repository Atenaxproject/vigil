'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { PRIORITY_ESTADOS, VENEZUELA_ESTADOS } from '@/lib/venezuela-geo'
import { StatCard } from '@/components/stats/StatCard'
import { StatsRefreshTimestamp } from '@/components/stats/SourcedFigureCard'
import { SourcedFigureCard, ContestedFiguresContext } from '@/components/stats/SourcedFigureCard'
import type { SourcedFigureRow } from '@/types/vigil.types'

interface EstadoCount {
  estado: string
  missing: number
  found_alive: number
}

interface DtvEstadoBreakdown {
  estado: string
  count: number
  percent: number
}

interface DtvMetricsResponse {
  totalPersonas: number
  sinContacto: number
  localizados: number
  totalCentros: number
  totalHospitales: number
  totalCentrosAcopio: number
  totalListas: number
  byEstado: DtvEstadoBreakdown[]
  lastUpdated: string
  source: string
  available: boolean
}

const UNKNOWN_ESTADO = 'Sin estado'
const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

export function EstadisticasClient() {
  const t = useTranslations('estadisticas')
  const [counts, setCounts] = useState<EstadoCount[]>([])
  const [loading, setLoading] = useState(true)
  const [vigilTotal, setVigilTotal] = useState(0)
  const [dtvMetrics, setDtvMetrics] = useState<DtvMetricsResponse | null>(null)
  const [dtvLoading, setDtvLoading] = useState(true)
  const [figures, setFigures] = useState<SourcedFigureRow[]>([])
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  const displayEstados = useMemo(() => {
    const priority = [...PRIORITY_ESTADOS]
    const rest = VENEZUELA_ESTADOS.filter((e) => !priority.includes(e as (typeof PRIORITY_ESTADOS)[number]))
    return [...priority, ...rest]
  }, [])

  useEffect(() => {
    void fetch('/api/dtv-metrics')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: DtvMetricsResponse | null) => {
        if (data) setDtvMetrics(data)
      })
      .catch(() => {
        /* graceful fallback */
      })
      .finally(() => setDtvLoading(false))

    void fetch('/api/sourced-figures')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { figures?: SourcedFigureRow[] } | null) => {
        if (data?.figures) setFigures(data.figures)
      })
      .catch(() => {
        /* ignore */
      })
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function load() {
      setLoading(true)
      const { data } = await supabase.from('public_missing_persons').select('estado, status')

      const map = new Map<string, EstadoCount>()
      let total = 0
      for (const row of data ?? []) {
        total++
        const estado = row.estado ?? UNKNOWN_ESTADO
        const entry = map.get(estado) ?? { estado, missing: 0, found_alive: 0 }
        if (row.status === 'missing') entry.missing++
        if (row.status === 'found_alive') entry.found_alive++
        map.set(estado, entry)
      }

      setVigilTotal(total)

      const sorted = displayEstados
        .map((e) => map.get(e) ?? { estado: e, missing: 0, found_alive: 0 })
        .filter((c) => c.missing > 0 || c.found_alive > 0)

      const unknown = map.get(UNKNOWN_ESTADO)
      if (unknown && (unknown.missing > 0 || unknown.found_alive > 0)) {
        sorted.push(unknown)
      }

      setCounts(sorted.length ? sorted : Array.from(map.values()))
      setLoading(false)
    }

    void load()

    const channel = supabase
      .channel('estadisticas-missing')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'missing_persons' }, () => {
        void load()
      })
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [displayEstados])

  const maxMissing = Math.max(...counts.map((c) => c.missing), 1)
  const numberLocale = locale === 'es' ? 'es-VE' : locale === 'en' ? 'en-US' : locale

  return (
    <div className="mx-auto max-w-2xl p-4 pb-24">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('network.title')}</h2>
          <p className="mt-1 text-[16px] text-vigil-body">
            {t.rich('network.description', {
              link: (chunks) => (
                <a
                  href={DTV_PLATFORM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-vigil-blue hover:underline"
                >
                  {chunks}
                  <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                </a>
              ),
            })}
          </p>
          <p className="mt-2 text-[13px] text-status-unverified">{t('network.attributionPermanent')}</p>
        </div>

        {/* Loading must read as loading — never as the unavailable state (75 §1c). */}
        {dtvLoading && (
          <div className="grid gap-3 sm:grid-cols-2" aria-hidden>
            <div className="skeleton h-[104px] rounded-card" />
            <div className="skeleton h-[104px] rounded-card" />
            <div className="skeleton h-[104px] rounded-card" />
            <div className="skeleton h-[104px] rounded-card" />
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {dtvMetrics?.available && (dtvMetrics.totalPersonas ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.totalPersonas.toLocaleString(numberLocale)}
              label={t('network.dtvPersonas')}
              sublabel={t('network.dtvPersonasSub')}
              source="dtv"
            />
          )}
          {dtvMetrics?.available && (dtvMetrics.sinContacto ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.sinContacto.toLocaleString(numberLocale)}
              label={t('network.dtvSinContacto')}
              sublabel={t('network.dtvSinContactoSub')}
              source="dtv"
            />
          )}
          {dtvMetrics?.available && (dtvMetrics.localizados ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.localizados.toLocaleString(numberLocale)}
              label={t('network.dtvLocalizados')}
              sublabel={t('network.dtvLocalizadosSub')}
              source="dtv"
            />
          )}
          {dtvMetrics?.available && (dtvMetrics.totalCentros ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.totalCentros.toLocaleString(numberLocale)}
              label={t('network.dtvCentros')}
              sublabel={t('network.dtvCentrosDetail', {
                hospitals: dtvMetrics.totalHospitales ?? 0,
                centers: dtvMetrics.totalCentrosAcopio ?? 0,
              })}
              source="dtv"
            />
          )}
          {dtvMetrics?.available && (dtvMetrics.totalListas ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.totalListas.toLocaleString(numberLocale)}
              label={t('network.dtvListas')}
              sublabel={t('network.dtvListasSub')}
              source="dtv"
            />
          )}
          {vigilTotal > 0 && (
            <StatCard
              value={vigilTotal.toLocaleString(numberLocale)}
              label={t('network.vigilPersonas')}
              sublabel={t('network.vigilPersonasSub')}
              source="vigil"
            />
          )}
        </div>

        {dtvMetrics?.available && dtvMetrics.lastUpdated && (
          <StatsRefreshTimestamp lastUpdated={dtvMetrics.lastUpdated} locale={locale} />
        )}
        {dtvMetrics?.available && (
          <p className="mt-2 text-[13px] text-vigil-muted">
            {t('network.attribution', { source: dtvMetrics.source })}
          </p>
        )}
        {!dtvLoading && !dtvMetrics?.available && (
          <p className="mt-3 text-[13px] text-vigil-muted">{t('network.dtvUnavailable')}</p>
        )}
      </section>

      {/* "Localizados sin centro" panel removed 2026-07-22 (75 §1d): the DTV
          `centro` field is universally null — an unpopulated column, not a
          finding. Do not rebuild a figure or CTA on top of it. */}

      {dtvMetrics?.available && (dtvMetrics.byEstado?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('dtvByEstadoTitle')}</h2>
          <p className="mt-1 text-[13px] text-vigil-muted">{t('dtvByEstadoSource')}</p>
          <ul className="mt-4 space-y-2">
            {dtvMetrics.byEstado.slice(0, 12).map((row) => (
              <li
                key={row.estado}
                className="flex items-center justify-between rounded-card border border-slate-200 bg-white px-4 py-3"
              >
                <span className="text-[16px] text-vigil-ink">{row.estado}</span>
                <span className="font-mono text-[13px] text-vigil-muted">
                  {row.count.toLocaleString(numberLocale)} · {row.percent}%
                </span>
              </li>
            ))}
          </ul>
          {dtvMetrics.lastUpdated && (
            <StatsRefreshTimestamp lastUpdated={dtvMetrics.lastUpdated} locale={locale} />
          )}
        </section>
      )}

      {figures.length > 0 && (
        <section className="mt-10">
          <h2 className="text-[20px] font-semibold text-vigil-ink">{t('officialTitle')}</h2>
          <p className="mt-1 text-[13px] text-status-unverified">{t('officialFraming')}</p>
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
                  is_contested: fig.is_contested,
                  disputes: fig.disputes,
                }}
              />
            ))}
          </div>
          <ContestedFiguresContext locale={locale} />
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-[20px] font-semibold text-vigil-ink">{t('byEstadoTitle')}</h2>
        <p className="mt-1 text-[13px] text-vigil-muted">{t('source')}</p>

        {loading && <div className="skeleton mt-6 h-48 rounded-card" />}

        {!loading && counts.length === 0 && (
          <p className="mt-8 text-center text-[16px] text-vigil-muted">{t('empty')}</p>
        )}

        {!loading && counts.length > 0 && (
          <ul className="mt-6 space-y-4" aria-label={t('byEstadoTitle')}>
            {counts.map((row) => (
              <li key={row.estado} className="rounded-card border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-[16px] font-medium text-vigil-ink">{row.estado}</span>
                  <div className="text-right text-[13px]">
                    <span className="font-medium text-status-missing">
                      {t('missingCount', { count: row.missing })}
                    </span>
                    {row.found_alive > 0 && (
                      <span className="ml-3 font-medium text-status-alive">
                        {t('foundCount', { count: row.found_alive })}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100" role="presentation">
                  <div
                    className="h-full rounded-full bg-status-missing transition-all duration-300"
                    style={{ width: `${(row.missing / maxMissing) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
