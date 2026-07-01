'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink, Search, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { tagVigilPerson, type FederatedPerson } from '@/lib/dtv-mapper'
import { PRIORITY_ESTADOS } from '@/lib/venezuela-geo'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'
import { DtvSourceHeader } from '@/components/dtv/DtvSourceHeader'
import { PhotoSearch } from '@/components/missing/PhotoSearch'

const DTV_PLATFORM_URL = 'https://desaparecidosterremotovenezuela.com'

const GEO_FILTERS = [
  { key: 'all', labelKey: 'allCountry' as const },
  ...PRIORITY_ESTADOS.map((e) => ({
    key: e === 'Distrito Capital' ? 'Caracas' : e,
    label: e === 'Distrito Capital' ? 'Caracas' : e,
  })),
]

interface SearchResponse {
  vigil?: FederatedPerson[]
  dtv?: FederatedPerson[]
  results?: FederatedPerson[]
  dtvAvailable?: boolean
}

interface MissingPersonSearchProps {
  initialResults?: PublicMissingPerson[]
  aiAvailable?: boolean
}

export function MissingPersonSearch({ initialResults = [], aiAvailable = true }: MissingPersonSearchProps) {
  const t = useTranslations('missing')
  const tNav = useTranslations('nav')
  const [query, setQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [vigilResults, setVigilResults] = useState<FederatedPerson[]>(
    initialResults.map(tagVigilPerson)
  )
  const [dtvResults, setDtvResults] = useState<FederatedPerson[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured()) return

    const supabase = createClient()
    const channel = supabase
      .channel('missing-persons-search')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'missing_persons' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const row = payload.new as PublicMissingPerson
            if (!searched || !query.trim()) {
              setVigilResults((prev) => [tagVigilPerson(row), ...prev].slice(0, 50))
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as PublicMissingPerson & { flagged?: boolean }
            if (row.flagged) {
              setVigilResults((prev) => prev.filter((r) => r.id !== row.id))
            } else {
              setVigilResults((prev) =>
                prev.map((r) => (r.id === row.id ? tagVigilPerson({ ...r, ...row }) : r))
              )
            }
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as { id: string }
            setVigilResults((prev) => prev.filter((r) => r.id !== row.id))
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [query, searched])

  async function runSearch(searchQuery: string, estado: string) {
    setLoading(true)
    setSearched(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (estado !== 'all') params.set('estado', estado)
      const res = await fetch(`/api/missing-persons/search?${params.toString()}`)
      const data = (await res.json()) as SearchResponse
      setVigilResults(data.vigil ?? data.results?.filter((r) => r._source === 'vigil') ?? [])
      setDtvResults(data.dtv ?? data.results?.filter((r) => r._source === 'dtv') ?? [])
    } catch {
      setVigilResults([])
      setDtvResults([])
    } finally {
      setLoading(false)
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() && estadoFilter === 'all') return
    await runSearch(query, estadoFilter)
  }

  async function handleEstadoFilter(estado: string) {
    setEstadoFilter(estado)
    if (query.trim() || estado !== 'all') {
      await runSearch(query, estado)
    } else if (!query.trim()) {
      setVigilResults(initialResults.map(tagVigilPerson))
      setDtvResults([])
      setSearched(false)
    }
  }

  const totalResults = vigilResults.length + dtvResults.length
  const hasResults = totalResults > 0

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4">
        <h2 className="font-display text-[20px] font-semibold text-vigil-ink">{t('title')}</h2>
        <p className="text-[16px] text-vigil-muted">{t('subtitle')}</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-stretch">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <label htmlFor="missing-search" className="sr-only">
              {t('search.placeholder')}
            </label>
            <input
              id="missing-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search.placeholder')}
              className="min-h-[44px] flex-1 rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white disabled:opacity-50"
            >
              <Search className="h-4 w-4" aria-hidden />
              {loading ? t('search.loading') : t('search.button')}
            </button>
          </form>
          <Link
            href="/reportar"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 whitespace-nowrap rounded-input bg-vigil-blue px-4 text-[16px] font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40 focus-visible:ring-offset-2"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            {tNav('reportShort')}
          </Link>
        </div>

        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('search.geoFilterLabel')}>
          {GEO_FILTERS.map((filter) => {
            const label = 'labelKey' in filter ? t(`search.${filter.labelKey}`) : filter.label
            const key = filter.key
            const active = estadoFilter === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => void handleEstadoFilter(key)}
                className={`min-h-[36px] rounded-full border px-3 text-[13px] font-medium transition-colors ${
                  active
                    ? 'border-vigil-blue bg-vigil-blue-light text-vigil-blue'
                    : 'border-slate-200 bg-white text-vigil-muted hover:border-slate-300'
                }`}
              >
                {label}
              </button>
            )
          })}
        </div>

        <PhotoSearch aiAvailable={aiAvailable} />

        <p className="mt-3 text-[13px] leading-relaxed text-vigil-muted">{t('search.trustNote')}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <div className="skeleton h-24 rounded-card" />}
        {!loading && searched && !hasResults && (
          <div className="rounded-card border border-slate-200 bg-vigil-cloud p-6 text-center">
            <p className="text-[16px] font-medium text-vigil-ink">{t('search.noResultsBothTitle')}</p>
            <p className="mt-4 text-[16px] text-vigil-body">{t('search.noResultsReportBoth')}</p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/reportar"
                className="inline-flex min-h-[44px] items-center justify-center rounded-input bg-vigil-blue px-5 text-[16px] font-medium text-white"
              >
                {t('search.reportCta')}
              </Link>
              <a
                href={DTV_PLATFORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-1 rounded-input border border-slate-200 bg-white px-5 text-[16px] font-medium text-vigil-blue hover:border-vigil-blue"
              >
                {t('search.noResultsReportDtv')}
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
              </a>
            </div>
            <p className="mt-4 text-[13px] text-vigil-muted">{t('search.noResultsBothHint')}</p>
          </div>
        )}
        {!loading && hasResults && (
          <p className="text-[13px] text-vigil-muted">
            {t('search.resultsCount', { count: totalResults })}
          </p>
        )}

        {!loading && searched && vigilResults.length > 0 && (
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[13px] font-medium text-vigil-ink">
                {t('search.vigilSourceLabel', { count: vigilResults.length })}
              </p>
            </div>
            <div className="space-y-3">
              {vigilResults.map((person) => (
                <MissingPersonCard key={`vigil-${person.id}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {!loading && searched && dtvResults.length > 0 && (
          <section>
            <DtvSourceHeader />
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[13px] font-medium text-vigil-ink">
                {t('search.dtvSourceLabel', { count: dtvResults.length })}
              </p>
            </div>
            <div className="space-y-3">
              {dtvResults.map((person) => (
                <MissingPersonCard key={`dtv-${person.id}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {!loading && !searched && (
          <div className="space-y-3">
            {vigilResults.map((person) => (
              <MissingPersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
