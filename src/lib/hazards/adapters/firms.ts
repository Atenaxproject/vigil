import type { HazardEvent } from '@/lib/hazards/types'

/**
 * NASA FIRMS VIIRS 24h CSV — no API key for the public CSV endpoints.
 * Terms: attribution required; redistribution of raw fire pixels OK with credit.
 * https://firms.modaps.eosdis.nasa.gov/download/
 */
const FIRMS_VIIRS =
  'https://firms.modaps.eosdis.nasa.gov/data/active_fire/noaa-20-viirs-c2/csv/J1_VIIRS_C2_Global_24h.csv'

/** Cap public events — densest clusters only (bright/conf). */
const MAX_EVENTS = 40
const MIN_FRP = 50

export async function pollFirmsHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  try {
    const res = await fetch(FIRMS_VIIRS, { next: { revalidate: 3600 * 4 } })
    if (!res.ok) return []
    const text = await res.text()
    const lines = text.trim().split(/\r?\n/)
    if (lines.length < 2) return []
    const header = lines[0].split(',')
    const latI = header.indexOf('latitude')
    const lngI = header.indexOf('longitude')
    const frpI = header.indexOf('frp')
    const confI = header.indexOf('confidence')
    const dateI = header.indexOf('acq_date')
    const timeI = header.indexOf('acq_time')
    if (latI < 0 || lngI < 0) return []

    const rows: { lat: number; lng: number; frp: number; conf: string; issued: string }[] = []
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',')
      const lat = parseFloat(cols[latI])
      const lng = parseFloat(cols[lngI])
      const frp = frpI >= 0 ? parseFloat(cols[frpI]) : 0
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || frp < MIN_FRP) continue
      const conf = confI >= 0 ? cols[confI] : ''
      const date = dateI >= 0 ? cols[dateI] : ''
      const time = timeI >= 0 ? cols[timeI].padStart(4, '0') : '0000'
      const issued = date
        ? new Date(`${date}T${time.slice(0, 2)}:${time.slice(2)}:00Z`).toISOString()
        : fetched_at
      rows.push({ lat, lng, frp, conf, issued })
    }

    rows.sort((a, b) => b.frp - a.frp)
    return rows.slice(0, MAX_EVENTS).map((r, idx) => ({
      id: `firms:${r.lat.toFixed(3)},${r.lng.toFixed(3)},${r.issued}`,
      hazard_type: 'wildfire' as const,
      severity: `FRP ${Math.round(r.frp)}`,
      region: `${r.lat.toFixed(2)}, ${r.lng.toFixed(2)}`,
      lat: r.lat,
      lng: r.lng,
      headline: `Hotspot VIIRS FRP ${Math.round(r.frp)} (conf ${r.conf || '—'})`,
      issued_at: r.issued,
      source: 'firms' as const,
      source_url: 'https://firms.modaps.eosdis.nasa.gov/mapserver/FIRMS_Public_NRT/',
      fetched_at,
      meta: { frp: r.frp, confidence: r.conf, rank: idx + 1 },
    }))
  } catch {
    return []
  }
}
