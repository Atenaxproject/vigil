'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { PRIORITY_ESTADOS, VENEZUELA_ESTADOS } from '@/lib/venezuela-geo'
import { StatCard } from '@/components/stats/StatCard'

interface EstadoCount {
  estado: string
  missing: number
  found_alive: number
}

interface DtvMetricsResponse {
  totalPersonas: number
  totalCentros: number
  totalListas: number
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
  const [locale, setLocale] = useState('es')

  useEffect(() => {
    setLocale(document.documentElement.lang || 'es')
  }, [])

  const dateLocale = locale === 'es' ? es : enUS

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
  const dtvUpdatedLabel =
    dtvMetrics?.lastUpdated &&
    formatDistanceToNow(new Date(dtvMetrics.lastUpdated), { addSuffix: true, locale: dateLocale })

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
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {dtvMetrics?.available && (dtvMetrics.totalPersonas ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.totalPersonas.toLocaleString(numberLocale)}
              label={t('network.dtvPersonas')}
              sublabel={t('network.dtvPersonasSub')}
              source="dtv"
            />
          )}
          {dtvMetrics?.available && (dtvMetrics.totalCentros ?? 0) > 0 && (
            <StatCard
              value={dtvMetrics.totalCentros.toLocaleString(numberLocale)}
              label={t('network.dtvCentros')}
              sublabel={t('network.dtvCentrosSub')}
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

        {dtvMetrics?.available && dtvUpdatedLabel && (
          <p className="mt-3 text-[13px] text-vigil-muted">
            {t('network.attribution', { time: dtvUpdatedLabel })}
          </p>
        )}
        {!dtvMetrics?.available && (
          <p className="mt-3 text-[13px] text-vigil-muted">{t('network.dtvUnavailable')}</p>
        )}
      </section>

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
