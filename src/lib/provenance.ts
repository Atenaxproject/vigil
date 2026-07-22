/** Sourced figures — provenance + freshness (prompt 63 Part A). */

export interface SourcedFigure {
  value: number | string
  source: string
  source_url?: string
  verified_at: string
  is_official: boolean
}

export type FigureFreshness = 'fresh' | 'stale' | 'expired'

export const FIGURE_STALENESS = {
  /** Under this many days: render normally */
  freshDays: 7,
  /** Under this many days: show "puede estar desactualizado" */
  staleDays: 21,
} as const

export function daysSince(isoDate: string, now = new Date()): number {
  const then = new Date(isoDate)
  if (Number.isNaN(then.getTime())) return Number.POSITIVE_INFINITY
  return (now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24)
}

export function getFigureFreshness(verifiedAt: string, now = new Date()): FigureFreshness {
  const days = daysSince(verifiedAt, now)
  if (days < FIGURE_STALENESS.freshDays) return 'fresh'
  if (days < FIGURE_STALENESS.staleDays) return 'stale'
  return 'expired'
}

export function formatFigureValue(value: number | string, locale = 'es-VE'): string {
  if (typeof value === 'number') return value.toLocaleString(locale)
  return value
}

/** DTV-style timestamp line under statistics blocks. */
export function formatStatsRefreshLine(lastUpdated: Date | string, locale = 'es'): string {
  const date = typeof lastUpdated === 'string' ? new Date(lastUpdated) : lastUpdated
  const formatted = date.toLocaleString(locale === 'en' ? 'en-US' : 'es-VE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
  if (locale === 'en') {
    return `Data refreshes automatically every 5 minutes · Last update: ${formatted}`
  }
  return `Los datos se actualizan automáticamente cada 5 minutos · Última actualización: ${formatted}`
}

/**
 * DTV API → Vigil display field mapping (prompt 63 B2).
 *
 * GET /personas returns unique person records (not raw report rows).
 * There is no /metricas or /stats endpoint on the federated API (verified 2026-07-21).
 *
 * | API field                         | Vigil label (semantics)                          |
 * |-----------------------------------|--------------------------------------------------|
 * | count of /personas records        | Personas en la red DTV (registros federados)     |
 * | persona.estado === 'sin-contacto' | Aún sin contacto                                 |
 * | persona.estado === 'localizado'   | Localizados                                      |
 * | persona.ubicacion.estado          | Estado geográfico (La Guaira, etc.)              |
 * | persona.centro == null + localizado | Localizados sin centro registrado              |
 *
 * Do NOT copy DTV homepage/UI labels ("cantidad de reportes", "/metricas Reportes totales").
 * Those surfaces disagree with each other; we label by API field meaning only.
 */
export const DTV_FIELD_MAPPING_DOC = {
  personasCount: 'GET /personas item count — unique federated person records',
  sinContacto: "persona.estado === 'sin-contacto'",
  localizados: "persona.estado === 'localizado'",
  estadoGeo: 'persona.ubicacion.estado',
  sinCentro: 'persona.estado === localizado && persona.centro == null',
} as const
