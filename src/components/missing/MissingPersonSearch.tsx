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
import { DtvReferralNotice } from '@/components/dtv/DtvReferralNotice'
import { useDtvReferral } from '@/hooks/useDtvReferral'
import { GeoSelect } from '@/components/missing/GeoSelect'
import { PhotoSearch } from '@/components/missing/PhotoSearch'
import { CRISIS_CONFIG } from '@/config/crisis.config'

const DTV_SLUG = 'desaparecidosTerremoto'

// Person-search platforms only — the zero-result state routes a searcher, not a
// donor. The criterion is a config flag (`personSearch`), not a list kept here,
// so the set stays correct when platforms are added/removed in crisis.config
// (see the personSearch RULE note there). 74 B2 / R4.
const PERSON_SEARCH_PLATFORMS = CRISIS_CONFIG.partnerLinks.filter(
  (p): p is (typeof CRISIS_CONFIG.partnerLinks)[number] & { slug: string; personSearch: true } =>
    'personSearch' in p && p.personSearch === true && 'slug' in p
)

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
  fullWidth?: boolean
}

export function MissingPersonSearch({
  initialResults = [],
  aiAvailable = true,
  fullWidth = false,
}: MissingPersonSearchProps) {
  const t = useTranslations('missing')
  const tNav = useTranslations('nav')
  const [query, setQuery] = useState('')
  const [estadoFilter, setEstadoFilter] = useState('all')
  const [municipioFilter, setMunicipioFilter] = useState('')
  const [parroquiaFilter, setParroquiaFilter] = useState('')
  const [vigilResults, setVigilResults] = useState<FederatedPerson[]>(
    initialResults.map(tagVigilPerson)
  )
  const [dtvResults, setDtvResults] = useState<FederatedPerson[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [searchError, setSearchError] = useState(false)
  const { referred } = useDtvReferral()

  // Referred users just came from DTV — never lead the sister-platform list
  // with it (74 C3). Otherwise DTV goes first.
  const sisterPlatforms = referred
    ? [...PERSON_SEARCH_PLATFORMS.filter((p) => p.slug !== DTV_SLUG), ...PERSON_SEARCH_PLATFORMS.filter((p) => p.slug === DTV_SLUG)]
    : [...PERSON_SEARCH_PLATFORMS.filter((p) => p.slug === DTV_SLUG), ...PERSON_SEARCH_PLATFORMS.filter((p) => p.slug !== DTV_SLUG)]

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

  async function runSearch(
    searchQuery: string,
    estado: string,
    municipio: string,
    parroquia: string
  ) {
    setLoading(true)
    setSearched(true)
    setSearchError(false)
    try {
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set('q', searchQuery.trim())
      if (estado !== 'all') params.set('estado', estado)
      if (municipio) params.set('municipio', municipio)
      if (parroquia) params.set('parroquia', parroquia)
      const res = await fetch(`/api/missing-persons/search?${params.toString()}`)
      if (!res.ok) throw new Error(`search failed: ${res.status}`)
      const data = (await res.json()) as SearchResponse
      setVigilResults(data.vigil ?? data.results?.filter((r) => r._source === 'vigil') ?? [])
      setDtvResults(data.dtv ?? data.results?.filter((r) => r._source === 'dtv') ?? [])
    } catch {
      // A failed request is not "no results" — keep them separate so the
      // empty state never claims a person wasn't found when the search broke.
      setVigilResults([])
      setDtvResults([])
      setSearchError(true)
    } finally {
      setLoading(false)
    }
  }

  const hasGeoFilter = estadoFilter !== 'all' || municipioFilter || parroquiaFilter

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim() && !hasGeoFilter) return
    await runSearch(query, estadoFilter, municipioFilter, parroquiaFilter)
  }

  async function handleEstadoFilter(estado: string) {
    setEstadoFilter(estado)
    setMunicipioFilter('')
    setParroquiaFilter('')
    if (query.trim() || estado !== 'all') {
      await runSearch(query, estado, '', '')
    } else if (!query.trim()) {
      setVigilResults(initialResults.map(tagVigilPerson))
      setDtvResults([])
      setSearched(false)
    }
  }

  async function handleGeoSelectChange(
    field: 'estado' | 'municipio' | 'parroquia',
    value: string
  ) {
    let nextEstado = estadoFilter
    let nextMunicipio = municipioFilter
    let nextParroquia = parroquiaFilter

    if (field === 'estado') {
      nextEstado = value || 'all'
      nextMunicipio = ''
      nextParroquia = ''
      setEstadoFilter(nextEstado)
      setMunicipioFilter('')
      setParroquiaFilter('')
    } else if (field === 'municipio') {
      nextMunicipio = value
      nextParroquia = ''
      setMunicipioFilter(value)
      setParroquiaFilter('')
    } else {
      nextParroquia = value
      setParroquiaFilter(value)
    }

    const estadoParam = nextEstado === 'all' ? 'all' : nextEstado
    if (query.trim() || estadoParam !== 'all' || nextMunicipio || nextParroquia) {
      await runSearch(query, estadoParam, nextMunicipio, nextParroquia)
    } else if (!query.trim()) {
      setVigilResults(initialResults.map(tagVigilPerson))
      setDtvResults([])
      setSearched(false)
    }
  }

  const totalResults = vigilResults.length + dtvResults.length
  const hasResults = totalResults > 0
  const resultsGridClass = fullWidth
    ? 'grid gap-3 sm:grid-cols-2'
    : 'space-y-3'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-200 p-4">
        <DtvReferralNotice photoSearchAvailable={aiAvailable} />
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
                className={`min-h-[44px] rounded-full border px-4 text-[13px] font-medium transition-colors ${
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

        {fullWidth && (
          <div className="mt-4">
            <GeoSelect
              estado={estadoFilter === 'all' ? '' : estadoFilter}
              municipio={municipioFilter}
              parroquia={parroquiaFilter}
              onEstadoChange={(v) => void handleGeoSelectChange('estado', v)}
              onMunicipioChange={(v) => void handleGeoSelectChange('municipio', v)}
              onParroquiaChange={(v) => void handleGeoSelectChange('parroquia', v)}
            />
          </div>
        )}

        <PhotoSearch aiAvailable={aiAvailable} />

        <p className="mt-3 text-[13px] leading-relaxed text-vigil-muted">{t('search.trustNote')}</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && (
          <div className={resultsGridClass} aria-hidden>
            <div className="skeleton h-32 rounded-card" />
            <div className="skeleton h-32 rounded-card" />
            <div className="skeleton h-32 rounded-card" />
          </div>
        )}
        {!loading && searchError && (
          <div role="alert" className="rounded-card border border-status-unverified bg-status-unverified-bg p-6 text-center">
            <p className="text-[16px] font-medium text-vigil-ink">{t('search.errorTitle')}</p>
            <p className="mt-2 text-[16px] text-vigil-body">{t('search.errorBody')}</p>
            <button
              type="button"
              onClick={() => void runSearch(query, estadoFilter, municipioFilter, parroquiaFilter)}
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-input bg-vigil-blue px-5 text-[16px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
            >
              {t('search.retry')}
            </button>
          </div>
        )}
        {/* Zero-result recovery (74 Part B) — the highest-traffic emotional
            moment on the platform. Copy is the deliverable: no apology
            language, no false hope, no exclamation marks, never a rendered 0. */}
        {!loading && !searchError && searched && !hasResults && (
          <div className="rounded-card border border-slate-200 bg-vigil-cloud p-6">
            <h3 className="text-[20px] font-semibold text-vigil-ink">{t('search.empty.title')}</h3>
            <p className="mt-2 text-[16px] leading-relaxed text-vigil-body">{t('search.empty.intro')}</p>
            <p className="mt-4 text-[16px] font-semibold text-vigil-ink">{t('search.empty.actionsTitle')}</p>

            <div className="mt-3 space-y-4">
              <div>
                <p className="text-[16px] leading-relaxed text-vigil-body">
                  <strong className="text-vigil-ink">{t('search.empty.step1Title')}</strong>{' '}
                  {t('search.empty.step1Body')}
                </p>
              </div>

              <div>
                <p className="text-[16px] leading-relaxed text-vigil-body">
                  <strong className="text-vigil-ink">{t('search.empty.step2Title')}</strong>{' '}
                  {t('search.empty.step2Body')}
                </p>
                <Link
                  href="/reportar"
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-input bg-vigil-blue px-5 text-[16px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vigil-blue/40"
                >
                  {t('search.empty.step2Cta')}
                </Link>
              </div>

              <div>
                <p className="text-[16px] leading-relaxed text-vigil-body">
                  <strong className="text-vigil-ink">{t('search.empty.step3Title')}</strong>{' '}
                  {referred ? t('search.empty.step3BodyReferred') : t('search.empty.step3Body')}
                </p>
                <ul className="mt-2 space-y-1">
                  {sisterPlatforms.map((platform) => (
                    <li key={platform.slug}>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[44px] items-center gap-1.5 text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
                      >
                        {platform.name}
                        <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 border-t border-slate-200 pt-4 text-[13px] leading-relaxed text-vigil-muted">
              {t('search.empty.federationNote')}
            </p>
            <p className="mt-3 text-[16px] text-vigil-body">
              {t('search.psychosocialPrompt')}{' '}
              <Link href="/informacion#apoyo-psicosocial" className="font-medium text-vigil-blue hover:underline">
                {t('search.psychosocialLink')}
              </Link>
            </p>
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
            <div className={resultsGridClass}>
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
            <div className={resultsGridClass}>
              {dtvResults.map((person) => (
                <MissingPersonCard key={`dtv-${person.id}`} person={person} />
              ))}
            </div>
          </section>
        )}

        {!loading && !searched && (
          <div className={resultsGridClass}>
            {vigilResults.map((person) => (
              <MissingPersonCard key={person.id} person={person} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
