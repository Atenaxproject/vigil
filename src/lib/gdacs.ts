import { getDataFeed } from '@/config/crisis.config'
import { recordFeedHealth } from '@/lib/feed-health-server'

const GDACS_FEED = getDataFeed('gdacs')
const GDACS_BASE = GDACS_FEED?.url ?? 'https://www.gdacs.org/gdacsapi/api/events'
const GDACS_REVALIDATE = GDACS_FEED?.cacheSeconds ?? 600

export interface GDACSEvent {
  title: string
  alertLevel: string
  eventType: string
  date: string
  url: string
  lat: number | null
  lng: number | null
  severity: number | null
}

interface GDACSFeature {
  geometry?: { coordinates?: [number, number] }
  properties: {
    eventname?: string
    name?: string
    alertlevel?: string
    eventtype?: string
    fromdate?: string
    url?: { report?: string }
    severitydata?: { severity?: number }
  }
}

interface GDACSResponse {
  features?: GDACSFeature[]
}

export async function getGDACSEvents(): Promise<GDACSEvent[]> {
  try {
    const res = await fetch(
      `${GDACS_BASE}/geteventlist/SEARCH?eventtypes=EQ&country=Venezuela`,
      { next: { revalidate: GDACS_REVALIDATE, tags: ['gdacs'] } }
    )
    if (!res.ok) {
      await recordFeedHealth({
        feedId: 'gdacs',
        label: 'GDACS alerts',
        ok: false,
        error: `HTTP ${res.status}`,
      })
      return []
    }

    const data = (await res.json()) as GDACSResponse
    const events =
      data.features?.map((f) => ({
        title: f.properties.eventname || f.properties.name || 'Earthquake in Venezuela',
        alertLevel: f.properties.alertlevel ?? 'Green',
        eventType: f.properties.eventtype ?? 'EQ',
        date: f.properties.fromdate ?? '',
        url: f.properties.url?.report ?? 'https://www.gdacs.org',
        lat: f.geometry?.coordinates?.[1] ?? null,
        lng: f.geometry?.coordinates?.[0] ?? null,
        severity: f.properties.severitydata?.severity ?? null,
      })) ?? []

    await recordFeedHealth({
      feedId: 'gdacs',
      label: 'GDACS alerts',
      ok: true,
      itemCount: events.length,
    })
    return events
  } catch (err) {
    await recordFeedHealth({
      feedId: 'gdacs',
      label: 'GDACS alerts',
      ok: false,
      error: err instanceof Error ? err.message : 'unknown',
    })
    return []
  }
}
