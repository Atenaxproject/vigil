import { getDataFeed } from '@/config/crisis.config'
import { recordFeedHealth } from '@/lib/feed-health-server'

const RELIEFWEB_FEED = getDataFeed('reliefweb')
const RELIEFWEB_BASE = RELIEFWEB_FEED?.url ?? 'https://api.reliefweb.int/v1/reports'
const RELIEFWEB_REVALIDATE = RELIEFWEB_FEED?.cacheSeconds ?? 3600

export interface ReliefWebReport {
  id: string
  title: string
  date: string
  url: string
  source: string
}

interface ReliefWebResponse {
  data?: Array<{
    id: string
    fields: {
      title?: string
      date?: { created?: string }
      url?: string
      source?: Array<{ name?: string }>
    }
  }>
}

export async function getVenezuelaUpdates(limit = 10): Promise<ReliefWebReport[]> {
  try {
    const res = await fetch(
      `${RELIEFWEB_BASE}?appname=vigil-crisis&filter[field]=country.iso3&filter[value]=VEN&limit=${limit}&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`,
      { next: { revalidate: RELIEFWEB_REVALIDATE, tags: ['reliefweb'] } }
    )

    if (!res.ok) {
      await recordFeedHealth({
        feedId: 'reliefweb',
        label: 'ReliefWeb reports',
        ok: false,
        error: `HTTP ${res.status}`,
      })
      return []
    }

    const data = (await res.json()) as ReliefWebResponse
    const reports = (data.data ?? []).map((item) => ({
      id: item.id,
      title: item.fields.title ?? 'Sin título',
      date: item.fields.date?.created ?? '',
      url: item.fields.url ?? '#',
      source: item.fields.source?.[0]?.name ?? 'ReliefWeb',
    }))

    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: true,
      itemCount: reports.length,
      meta: { newest: reports[0]?.date ?? null },
    })
    return reports
  } catch (err) {
    await recordFeedHealth({
      feedId: 'reliefweb',
      label: 'ReliefWeb reports',
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return []
  }
}
