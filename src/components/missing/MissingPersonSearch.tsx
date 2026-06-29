'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import type { PublicMissingPerson } from '@/types/vigil.types'
import { MissingPersonCard } from '@/components/missing/MissingPersonCard'

interface MissingPersonSearchProps {
  initialResults?: PublicMissingPerson[]
}

export function MissingPersonSearch({ initialResults = [] }: MissingPersonSearchProps) {
  const t = useTranslations('missing')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicMissingPerson[]>(initialResults)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

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
        <h2 className="font-display text-lg font-semibold text-vigil-ink">{t('title')}</h2>
        <p className="text-[13px] text-vigil-muted">{t('subtitle')}</p>
        <form onSubmit={handleSearch} className="mt-3 flex gap-2">
          <label htmlFor="missing-search" className="sr-only">
            {t('search.placeholder')}
          </label>
          <input
            id="missing-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('search.placeholder')}
            className="min-h-[44px] flex-1 rounded-input border border-slate-200 bg-vigil-cloud px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-vigil-blue/20"
          />
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-input bg-vigil-blue px-4 text-[13px] font-medium text-white disabled:opacity-50"
          >
            <Search className="h-4 w-4" aria-hidden />
            {loading ? t('search.loading') : t('search.button')}
          </button>
        </form>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {loading && <div className="skeleton h-24 rounded-card" />}
        {!loading && searched && results.length === 0 && (
          <p className="text-center text-[13px] text-vigil-muted">{t('search.noResults')}</p>
        )}
        {!loading && results.length > 0 && (
          <p className="text-[11px] text-vigil-muted">
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
