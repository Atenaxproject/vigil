'use client'

import { ExternalLink } from 'lucide-react'
import {
  formatFigureValue,
  formatStatsRefreshLine,
  getFigureFreshness,
  type FigureFreshness,
} from '@/lib/provenance'

export interface SourcedFigureDisplay {
  key: string
  label: string
  value: number | string
  source: string
  source_url?: string | null
  verified_at: string
  is_official: boolean
}

function freshnessLabel(freshness: FigureFreshness, locale: string): string | null {
  if (freshness === 'fresh') return null
  if (freshness === 'stale') {
    return locale === 'en' ? 'May be outdated' : 'Puede estar desactualizado'
  }
  return null
}

function formatVerifiedDate(iso: string, locale: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function SourcedFigureCard({
  figure,
  locale = 'es',
}: {
  figure: SourcedFigureDisplay
  locale?: string
}) {
  const freshness = getFigureFreshness(figure.verified_at)
  if (freshness === 'expired') {
    return (
      <div className="rounded-card border border-slate-200 bg-vigil-cloud p-4">
        <p className="text-[13px] text-vigil-muted">{figure.label}</p>
        <p className="mt-2 text-[16px] text-vigil-body">
          {locale === 'en'
            ? 'Figure suppressed — older than 21 days. See live source:'
            : 'Cifra omitida — tiene más de 21 días. Ver fuente en vivo:'}
        </p>
        {figure.source_url ? (
          <a
            href={figure.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-[16px] text-vigil-blue hover:underline"
          >
            {figure.source}
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        ) : (
          <p className="mt-1 font-mono text-[13px] text-vigil-muted">{figure.source}</p>
        )}
      </div>
    )
  }

  const staleNote = freshnessLabel(freshness, locale)
  const numberLocale = locale === 'en' ? 'en-US' : 'es-VE'
  const displayValue =
    typeof figure.value === 'number' || /^\d+$/.test(String(figure.value))
      ? formatFigureValue(
          typeof figure.value === 'number' ? figure.value : Number(figure.value),
          numberLocale
        )
      : String(figure.value)

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4">
      <p className="text-[13px] text-vigil-muted">{figure.label}</p>
      <p className="mt-1 font-display text-xl font-semibold text-vigil-ink">{displayValue}</p>
      {figure.is_official && (
        <p className="mt-1 text-[13px] font-medium text-status-unverified">
          {locale === 'en' ? 'Official figure' : 'Cifra oficial'}
        </p>
      )}
      {!figure.is_official && (
        <p className="mt-1 text-[13px] font-medium text-vigil-blue">
          {locale === 'en' ? 'Independent analysis' : 'Análisis independiente'}
        </p>
      )}
      <p className="mt-1 font-mono text-[13px] text-vigil-muted">
        {locale === 'en' ? 'Source' : 'Fuente'}: {figure.source}
        {' · '}
        {formatVerifiedDate(figure.verified_at, locale)}
      </p>
      {staleNote && (
        <p className="mt-2 text-[13px] font-medium text-status-unverified">{staleNote}</p>
      )}
    </div>
  )
}

export function StatsRefreshTimestamp({
  lastUpdated,
  locale = 'es',
}: {
  lastUpdated: string | Date
  locale?: string
}) {
  return (
    <p className="mt-3 font-mono text-[13px] text-vigil-muted">
      {formatStatsRefreshLine(lastUpdated, locale)}
    </p>
  )
}
