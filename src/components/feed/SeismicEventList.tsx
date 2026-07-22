'use client'

import type { SeismicEvent } from '@/types/vigil.types'
import { CRISIS_CONFIG } from '@/config/crisis.config'
import {
  formatSeismicLocality,
  formatSeismicRelativeTime,
  isAlertTier,
} from '@/lib/seismic-format'

export function SeismicEventList({
  events,
  locale = 'es',
  limit = 12,
  totalCount,
}: {
  events: SeismicEvent[]
  locale?: string
  limit?: number
  /** Live sequence total when available (prompt 69 B4). */
  totalCount?: number
}) {
  const threshold = CRISIS_CONFIG.seismic.alertThresholdMag
  const shown = events.slice(0, limit)

  return (
    <div className="rounded-card border border-slate-200 bg-white p-4">
      <h2 className="text-[17px] font-semibold text-vigil-ink">
        {locale === 'en' ? 'Recent aftershocks' : 'Réplicas recientes'}
      </h2>
      <p className="mt-1 text-[13px] text-vigil-muted">
        {locale === 'en'
          ? `M${CRISIS_CONFIG.seismic.minMagnitudeDisplay}+ · M${threshold}+ highlighted · USGS + EMSC`
          : `M${CRISIS_CONFIG.seismic.minMagnitudeDisplay}+ · M${threshold}+ destacadas · USGS + EMSC`}
      </p>
      {typeof totalCount === 'number' && (
        <p className="mt-2 font-mono text-[13px] text-vigil-body">
          {locale === 'en'
            ? `${totalCount.toLocaleString('en-US')} events in sequence (live feed)`
            : `${totalCount.toLocaleString('es-VE')} eventos en la secuencia (feed en vivo)`}
        </p>
      )}
      {shown.length === 0 ? (
        <p className="mt-3 text-[16px] text-vigil-muted">
          {locale === 'en' ? 'No recent events' : 'Sin eventos recientes'}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-slate-100">
          {shown.map((e) => {
            const alert = isAlertTier(e, threshold)
            return (
              <li key={e.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 py-2">
                <span
                  className={`font-mono text-[16px] font-semibold ${
                    alert ? 'text-status-missing' : 'text-vigil-ink'
                  }`}
                >
                  M{e.magnitude.toFixed(1)}
                </span>
                <span className="min-w-0 flex-1 text-[16px] text-vigil-body">
                  {formatSeismicLocality(e)}
                </span>
                <span className="text-[13px] text-vigil-muted">
                  {formatSeismicRelativeTime(e.time, locale)}
                </span>
                <span className="font-mono text-[12px] uppercase text-vigil-muted">{e.source}</span>
                {e.url && (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] text-vigil-blue hover:underline"
                  >
                    {e.source}
                  </a>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
