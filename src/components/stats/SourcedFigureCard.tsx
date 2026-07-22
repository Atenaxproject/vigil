'use client'

import { ExternalLink } from 'lucide-react'
import {
  formatFigureValue,
  formatStatsRefreshLine,
  getFigureFreshness,
  type FigureFreshness,
} from '@/lib/provenance'
import { assertContestedHasDisputes, type FigureDispute } from '@/lib/contested-figures'

export interface SourcedFigureDisplay {
  key: string
  label: string
  value: number | string
  source: string
  source_url?: string | null
  verified_at: string
  is_official: boolean
  is_contested?: boolean
  disputes?: FigureDispute[]
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

/**
 * Contested figures cannot render bare — component-level guard (prompt 71).
 */
export function SourcedFigureCard({
  figure,
  locale = 'es',
}: {
  figure: SourcedFigureDisplay
  locale?: string
}) {
  if (figure.is_contested && !assertContestedHasDisputes(figure)) {
    return (
      <div className="rounded-card border border-status-missing bg-status-missing-bg p-4" role="alert">
        <p className="text-[16px] font-medium text-status-missing">
          {locale === 'en'
            ? 'Contested figure blocked: disputes required before display.'
            : 'Cifra cuestionada bloqueada: se requieren disputas antes de mostrar.'}
        </p>
        <p className="mt-1 font-mono text-[13px] text-vigil-muted">{figure.key}</p>
      </div>
    )
  }

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
      {figure.is_contested && figure.disputes && figure.disputes.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3">
          <p className="text-[13px] font-medium text-vigil-ink">
            {locale === 'en' ? 'Public disputes' : 'Cuestionamientos públicos'}
          </p>
          <ul className="mt-2 space-y-2">
            {figure.disputes.map((d, i) => (
              <li key={`${d.party}-${i}`} className="text-[13px] text-vigil-body">
                <span className="font-medium text-vigil-ink">{d.party}</span>
                {' — '}
                {d.claim}
                {' '}
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-0.5 text-vigil-blue hover:underline"
                >
                  {locale === 'en' ? 'Source' : 'Fuente'}
                  <ExternalLink className="h-3 w-3" aria-hidden />
                </a>
                <span className="font-mono text-vigil-muted"> · {d.dated}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export function ContestedFiguresContext({ locale = 'es' }: { locale?: string }) {
  if (locale === 'en') {
    return (
      <div className="mt-6 rounded-card border border-slate-200 bg-vigil-cloud p-4 text-[16px] text-vigil-body">
        <p className="font-semibold text-vigil-ink">About these figures</p>
        <p className="mt-2">
          Death and injury figures come from the Venezuelan government&apos;s official balance.
          They are the only counts available: death registration requires morgue, hospital, and
          certificate access that no citizen platform has.
        </p>
        <p className="mt-2">
          These figures have been publicly disputed. Provea said they &quot;generate more doubts
          than certainties&quot; and called for zero opacity. USGS&apos;s initial PAGER loss projection
          was far higher — it is an automated loss projection, not a count. The UN estimated about
          50,000 people unaccounted for, a figure with no official balance.
        </p>
        <p className="mt-2">
          Vigil publishes the official figure with its source, and who disputes it. We do not assess
          any government&apos;s credibility — we show what each source reports so you can judge.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-card border border-slate-200 bg-vigil-cloud p-4 text-[16px] text-vigil-body">
      <p className="font-semibold text-vigil-ink">Sobre estas cifras</p>
      <p className="mt-2">
        Las cifras de fallecidos y heridos provienen del balance oficial del gobierno venezolano.
        Son las únicas disponibles: el registro de defunciones requiere acceso a morgues, hospitales
        y actas de defunción que ninguna plataforma ciudadana posee.
      </p>
      <p className="mt-2">
        Estas cifras han sido cuestionadas públicamente. Provea señaló que &quot;generan más dudas
        que certezas&quot; y pidió cero opacidad. La proyección inicial del USGS estimó pérdidas muy
        superiores, aunque se trata de una proyección automática de pérdidas y no de un conteo. La
        ONU estimó unas 50.000 personas no localizadas, cifra sobre la cual no existe balance oficial.
      </p>
      <p className="mt-2">
        Vigil publica la cifra oficial con su fuente, y también quién la cuestiona. No evaluamos la
        credibilidad de ningún gobierno — mostramos lo que cada fuente informa para que puedas juzgar
        por tu cuenta.
      </p>
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
