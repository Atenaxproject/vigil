'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { ExternalLink, Search, UserPlus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isSupabaseConfigured } from '@/lib/supabase/env'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'

const sisterPlatforms = CRISIS_CONFIG.partnerLinks.filter((link) => link.type === 'sister-platform')

interface MissingPersonSearchProps {
  initialResults?: PublicMissingPerson[]
}

export function MissingPersonSearch({ initialResults = [] }: MissingPersonSearchProps) {
  const t = useTranslations('missing')
  const tNav = useTranslations('nav')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicMissingPerson[]>(initialResults)
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
              setResults((prev) => [row, ...prev].slice(0, 50))
            }
          } else if (payload.eventType === 'UPDATE') {
            const row = payload.new as PublicMissingPerson & { flagged?: boolean }
            if (row.flagged) {
              setResults((prev) => prev.filter((r) => r.id !== row.id))
            } else {
              setResults((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)))
            }
          } else if (payload.eventType === 'DELETE') {
            const row = payload.old as { id: string }
            setResults((prev) => prev.filter((r) => r.id !== row.id))
          }
        }
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [query, searched])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/missing-persons/search?q=${encodeURIComponent(query.trim())}`)
      const data = (await res.json()) as { results?: PublicMissingPerson[] }
      setResults(data.results ?? [])
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

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
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <div className="skeleton h-24 rounded-card" />}
        {!loading && searched && results.length === 0 && (
          <div className="rounded-card border border-slate-200 bg-vigil-cloud p-6 text-center">
            <p className="text-[16px] font-medium text-vigil-ink">{t('search.noResultsTitle')}</p>
            <p className="mt-4 text-[16px] text-vigil-body">{t('search.sisterPlatformsIntro')}</p>
            <ul className="mt-3 space-y-2">
              {sisterPlatforms.map((platform) => (
                <li key={platform.url}>
                  <a
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[44px] items-center justify-center gap-1 text-[16px] text-vigil-blue hover:underline"
                  >
                    {platform.name}
                    <ExternalLink className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="sr-only">({t('search.externalLink')})</span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[16px] text-vigil-muted">{t('search.sisterPlatformsReport')}</p>
            <Link
              href="/reportar"
              className="mt-4 inline-flex min-h-[44px] items-center justify-center rounded-input bg-vigil-blue px-5 text-[16px] font-medium text-white"
            >
              {t('search.reportCta')}
            </Link>
          </div>
        )}
        {!loading && results.length > 0 && (
          <p className="text-[13px] text-vigil-muted">
            {t('search.resultsCount', { count: results.length })}
          </p>
        )}
        {results.map((person) => (
          <MissingPersonCard key={person.id} person={person} />
        ))}
      </div>
    </div>
  )
}
