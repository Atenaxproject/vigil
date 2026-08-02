import type { HazardEvent } from '@/lib/hazards/types'
import { feedAbortSignal, isFeedAbortError } from '@/lib/with-timeout'
import { RELIEFWEB_ENABLED, reliefwebUrl } from '@/lib/reliefweb'

/**
 * ReliefWeb recent disaster reports (headline relay only — no commentary).
 * Uses the shared v2 client (75C). Fails soft to [] when RELIEFWEB_APPNAME is
 * unset, on 403 (appname not yet approved), 410, or any error — the monitor
 * merges hazard sources, so an empty ReliefWeb contributes nothing rather than
 * an empty labelled section.
 */
export async function pollReliefwebHazards(): Promise<HazardEvent[]> {
  if (!RELIEFWEB_ENABLED) return []
  const fetched_at = new Date().toISOString()
  try {
    const url = reliefwebUrl(
      'disasters',
      'limit=15&sort[]=date.created:desc' +
        '&fields[include][]=name&fields[include][]=date&fields[include][]=url&fields[include][]=country&fields[include][]=status'
    )
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: feedAbortSignal(),
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      data?: Array<{
        id: string
        fields: {
          name?: string
          date?: { created?: string }
          url?: string
          country?: Array<{ name?: string }>
          status?: string
        }
      }>
    }
    return (data.data ?? []).map((item) => ({
      id: `reliefweb:${item.id}`,
      hazard_type: 'other' as const,
      severity: item.fields.status ?? 'reported',
      region: item.fields.country?.[0]?.name ?? '',
      lat: null,
      lng: null,
      headline: item.fields.name ?? 'ReliefWeb disaster',
      issued_at: item.fields.date?.created
        ? new Date(item.fields.date.created).toISOString()
        : fetched_at,
      source: 'reliefweb' as const,
      source_url: item.fields.url ?? 'https://reliefweb.int',
      fetched_at,
    }))
  } catch (err) {
    if (isFeedAbortError(err)) throw err
    return []
  }
}
