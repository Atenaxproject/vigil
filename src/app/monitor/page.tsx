import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ExternalLink, Radio } from 'lucide-react'
import { isMonitorPublicEnabled, listPublicHazards, pollAllHazards } from '@/lib/hazards/poll'
import type { HazardEvent } from '@/lib/hazards/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function sourceLabel(source: string): string {
  const map: Record<string, string> = {
    usgs: 'USGS',
    gdacs: 'GDACS',
    nhc: 'NOAA NHC',
    nws: 'NWS',
    firms: 'NASA FIRMS',
    tsunami: 'NOAA Tsunami',
    'usgs-water': 'USGS Water',
    reliefweb: 'ReliefWeb',
    'open-meteo': 'Open-Meteo',
  }
  return map[source] ?? source
}

async function loadEvents(): Promise<HazardEvent[]> {
  const stored = await listPublicHazards(60)
  if (stored.length > 0) return stored
  // Cold start / pre-migration: live poll without requiring persist
  const { events } = await pollAllHazards()
  return events.slice(0, 60)
}

export default async function MonitorPage() {
  const t = await getTranslations('monitor')
  const enabled = await isMonitorPublicEnabled()

  if (!enabled) {
    return (
      <div className="mx-auto max-w-3xl p-4 pb-24">
        <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
        <p className="mt-4 text-[16px] text-vigil-body">{t('disabled')}</p>
        <Link href="/" className="mt-6 inline-flex text-vigil-blue underline">
          {t('backHome')}
        </Link>
      </div>
    )
  }

  const events = await loadEvents()

  // Collapse clustered pairs: show USGS primary, note GDACS sibling
  const byCluster = new Map<string, HazardEvent[]>()
  const singles: HazardEvent[] = []
  for (const e of events) {
    if (e.cluster_id) {
      const list = byCluster.get(e.cluster_id) ?? []
      list.push(e)
      byCluster.set(e.cluster_id, list)
    } else {
      singles.push(e)
    }
  }
  const clustered = [...byCluster.values()].map((group) => {
    const primary = group.find((g) => g.source === 'usgs') ?? group[0]
    return { primary, sources: group }
  })

  return (
    <div className="mx-auto max-w-3xl p-4 pb-24">
      <div className="flex items-start gap-3">
        <Radio className="mt-1 h-6 w-6 shrink-0 text-vigil-blue" aria-hidden />
        <div>
          <h1 className="font-display text-[26px] font-semibold text-vigil-ink">{t('title')}</h1>
          <p className="mt-1 text-[16px] text-vigil-muted">{t('subtitle')}</p>
        </div>
      </div>

      <div
        className="mt-6 rounded-card border border-dashed border-slate-300 bg-vigil-cloud px-4 py-3 text-[13px] text-vigil-body"
        role="note"
      >
        <p className="font-medium text-vigil-ink">{t('relayBadge')}</p>
        <p className="mt-1">{t('disclaimer')}</p>
      </div>

      {events.length === 0 ? (
        <p className="mt-10 text-[16px] text-vigil-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {clustered.map(({ primary, sources }) => (
            <HazardCard key={primary.id} event={primary} t={t} extraSources={sources.slice(1)} />
          ))}
          {singles.map((e) => (
            <HazardCard key={e.id} event={e} t={t} />
          ))}
        </ul>
      )}

      <p className="mt-10 font-mono text-[13px] text-vigil-muted">{t('attribution')}</p>
    </div>
  )
}

function HazardCard({
  event,
  t,
  extraSources = [],
}: {
  event: HazardEvent
  t: Awaited<ReturnType<typeof getTranslations>>
  extraSources?: HazardEvent[]
}) {
  return (
    <li className="rounded-card border border-dashed border-slate-300 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-badge bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-medium uppercase text-slate-700">
          {sourceLabel(event.source)}
        </span>
        <span className="rounded-badge border border-slate-200 px-2 py-0.5 font-mono text-[11px] text-slate-600">
          {event.severity}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-vigil-muted">{event.hazard_type}</span>
      </div>
      <h2 className="mt-2 text-[17px] font-medium text-vigil-ink">{event.headline}</h2>
      {event.region && <p className="mt-1 text-[13px] text-vigil-muted">{event.region}</p>}
      <p className="mt-1 font-mono text-[13px] text-vigil-muted">
        {new Date(event.issued_at).toLocaleString('es-VE', { timeZone: 'UTC' })} UTC
      </p>
      {extraSources.length > 0 && (
        <p className="mt-2 text-[13px] text-vigil-muted">
          {t('alsoReported')}:{' '}
          {extraSources.map((s) => sourceLabel(s.source)).join(', ')}
        </p>
      )}
      <a
        href={event.source_url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex min-h-[44px] items-center gap-1.5 text-[16px] font-medium text-vigil-blue underline-offset-2 hover:underline"
      >
        {t('officialSource')} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
      <p className="mt-2 text-[11px] text-vigil-muted">{t('agencyAuthoritative')}</p>
    </li>
  )
}
