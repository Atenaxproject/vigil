'use client'

import { useEffect, useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { PRIORITY_ESTADOS, VENEZUELA_ESTADOS } from '@/lib/venezuela-geo'

interface EstadoCount {
  estado: string
  missing: number
  found_alive: number
}

const UNKNOWN_ESTADO = 'Sin estado'

export function EstadisticasClient() {
  const t = useTranslations('estadisticas')
  const [counts, setCounts] = useState<EstadoCount[]>([])
  const [loading, setLoading] = useState(true)

  const displayEstados = useMemo(() => {
    const priority = [...PRIORITY_ESTADOS]
    const rest = VENEZUELA_ESTADOS.filter((e) => !priority.includes(e as (typeof PRIORITY_ESTADOS)[number]))
    return [...priority, ...rest]
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    const supabase = createClient()

    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('public_missing_persons')
        .select('estado, status')

      const map = new Map<string, EstadoCount>()
      for (const row of data ?? []) {
        const estado = row.estado ?? UNKNOWN_ESTADO
        const entry = map.get(estado) ?? { estado, missing: 0, found_alive: 0 }
        if (row.status === 'missing') entry.missing++
        if (row.status === 'found_alive') entry.found_alive++
        map.set(estado, entry)
      }

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
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missing_persons' },
        () => {
          void load()
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [displayEstados])

  const maxMissing = Math.max(...counts.map((c) => c.missing), 1)

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
      <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
      <p className="mt-2 text-[13px] text-vigil-muted">{t('source')}</p>

      {loading && <div className="skeleton mt-6 h-48 rounded-card" />}

      {!loading && counts.length === 0 && (
        <p className="mt-8 text-center text-[16px] text-vigil-muted">{t('empty')}</p>
      )}

      {!loading && counts.length > 0 && (
        <ul className="mt-6 space-y-4" aria-label={t('title')}>
          {counts.map((row) => (
            <li key={row.estado} className="rounded-card border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[16px] font-medium text-vigil-ink">{row.estado}</span>
                <div className="text-right text-[13px]">
                  <span className="text-status-missing font-medium">
                    {t('missingCount', { count: row.missing })}
                  </span>
                  {row.found_alive > 0 && (
                    <span className="ml-3 text-status-alive font-medium">
                      {t('foundCount', { count: row.found_alive })}
                    </span>
                  )}
                </div>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-status-missing transition-all duration-300"
                  style={{ width: `${(row.missing / maxMissing) * 100}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
