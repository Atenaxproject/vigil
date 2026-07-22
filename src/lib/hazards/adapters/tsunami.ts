import type { HazardEvent } from '@/lib/hazards/types'

/**
 * NOAA NWS Tsunami Warning Center atom feed (public).
 * https://www.tsunami.gov/
 */
const TSUNAMI_ATOM =
  'https://www.tsunami.gov/events/xml/PAAQAtom.xml'

export async function pollTsunamiHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  try {
    const res = await fetch(TSUNAMI_ATOM, { next: { revalidate: 300 } })
    if (!res.ok) return []
    const xml = await res.text()
    const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)]
    const out: HazardEvent[] = []

    for (const [, body] of entries) {
      const title = body.match(/<title[^>]*>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim()
      const id = body.match(/<id>([\s\S]*?)<\/id>/)?.[1]?.trim()
      const updated = body.match(/<updated>([\s\S]*?)<\/updated>/)?.[1]?.trim()
      const link = body.match(/<link[^>]+href="([^"]+)"/)?.[1]
      if (!title || !id) continue
      // Skip "no active" style placeholders
      if (/no messages|no warnings|all clear/i.test(title)) continue
      out.push({
        id: `tsunami:${id}`,
        hazard_type: 'tsunami',
        severity: /warning/i.test(title) ? 'Warning' : /advisory/i.test(title) ? 'Advisory' : 'Watch',
        region: title.slice(0, 120),
        lat: null,
        lng: null,
        headline: title.slice(0, 200),
        issued_at: updated ? new Date(updated).toISOString() : fetched_at,
        source: 'tsunami',
        source_url: link ?? 'https://www.tsunami.gov/',
        fetched_at,
      })
    }
    return out
  } catch {
    return []
  }
}
