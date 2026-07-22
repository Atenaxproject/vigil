import type { HazardEvent, HazardType } from '@/lib/hazards/types'

const GDACS_BASE = 'https://www.gdacs.org/gdacsapi/api/events'

const TYPE_MAP: Record<string, HazardType> = {
  EQ: 'earthquake',
  TC: 'tropical_cyclone',
  FL: 'flood',
  VO: 'volcano',
  WF: 'wildfire',
  DR: 'drought',
}

interface GdacsFeature {
  geometry?: { coordinates?: [number, number] }
  properties: {
    eventid?: number | string
    eventname?: string
    name?: string
    alertlevel?: string
    eventtype?: string
    fromdate?: string
    url?: { report?: string }
    country?: string
  }
}

/** GDACS Orange/Red — severity stays Green/Orange/Red. */
export async function pollGdacsHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  try {
    const res = await fetch(`${GDACS_BASE}/geteventlist/SEARCH?eventtypes=EQ;TC;FL;VO;WF;DR`, {
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const data = (await res.json()) as { features?: GdacsFeature[] }
    const out: HazardEvent[] = []
    for (const f of data.features ?? []) {
      const level = f.properties.alertlevel ?? 'Green'
      if (level !== 'Orange' && level !== 'Red') continue
      const et = f.properties.eventtype ?? 'EQ'
      const coords = f.geometry?.coordinates
      out.push({
        id: `gdacs:${f.properties.eventid ?? f.properties.eventname ?? fetched_at}`,
        hazard_type: TYPE_MAP[et] ?? 'other',
        severity: level,
        region: f.properties.country ?? f.properties.eventname ?? '',
        lat: coords?.[1] ?? null,
        lng: coords?.[0] ?? null,
        headline: `GDACS ${level} ${et} — ${f.properties.eventname ?? f.properties.name ?? ''}`,
        issued_at: f.properties.fromdate
          ? new Date(f.properties.fromdate).toISOString()
          : fetched_at,
        source: 'gdacs',
        source_url: f.properties.url?.report ?? 'https://www.gdacs.org',
        fetched_at,
      })
    }
    return out
  } catch {
    return []
  }
}
