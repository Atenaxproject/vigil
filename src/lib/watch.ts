// Vigil Watch — operator early-warning monitor (poll → filter → dedupe → email).
// Operator tool only: no UI, no user-facing surface. See watch.config.ts for
// the watched regions and the trigger philosophy.

import { Resend } from 'resend'
import { CRISIS_CONFIG, getDataFeed } from '@/config/crisis.config'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  WATCHED_REGIONS,
  isInBounds,
  type GdacsHazard,
  type TropicalSeverity,
  type WatchedRegion,
} from '@/config/watch.config'

const NHC_CURRENT_STORMS = 'https://www.nhc.noaa.gov/CurrentStorms.json'
// Global M4.5+ past-week summary feed; region thresholds filter further.
const USGS_WEEK_FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson'

export interface WatchCrossing {
  externalId: string
  source: 'nhc' | 'usgs' | 'gdacs'
  severity: string
  headline: string
  detail: string
  position: string
  link: string
  regions: WatchedRegion[]
  isEscalation: boolean
}

// ── NHC ──────────────────────────────────────────────────────────────────────

interface NhcStorm {
  id?: string
  binNumber?: string
  name?: string
  classification?: string
  intensity?: string | number
  latitudeNumeric?: number
  longitudeNumeric?: number
  lastUpdate?: string
}

/** Saffir-Simpson-aligned ladder from NHC classification + intensity (knots). */
function tropicalSeverity(storm: NhcStorm): TropicalSeverity | null {
  const cls = (storm.classification ?? '').toUpperCase()
  const knots = Number(storm.intensity ?? 0)
  // TD = depression (unnamed) — below the alert floor by design
  if (cls === 'TD' || cls === 'PTC') return null
  if (knots >= 96 || cls === 'MH') return 'major'
  if (knots >= 64 || cls === 'HU') return 'hurricane'
  return 'named' // TS / STS / SS — named systems
}

async function pollNhc(): Promise<Omit<WatchCrossing, 'isEscalation'>[]> {
  try {
    const res = await fetch(NHC_CURRENT_STORMS, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { activeStorms?: NhcStorm[] }
    const out: Omit<WatchCrossing, 'isEscalation'>[] = []

    for (const storm of data.activeStorms ?? []) {
      const lat = storm.latitudeNumeric
      const lng = storm.longitudeNumeric
      if (typeof lat !== 'number' || typeof lng !== 'number') continue
      const severity = tropicalSeverity(storm)
      if (!severity) continue

      const regions = WATCHED_REGIONS.filter((r) => r.tropical && isInBounds(lat, lng, r.bounds))
      if (regions.length === 0) continue

      const id = storm.id ?? storm.binNumber ?? `nhc-${storm.name}`
      out.push({
        externalId: `nhc:${id}`,
        source: 'nhc',
        severity,
        headline: `${storm.classification ?? 'TC'} ${storm.name ?? 'sin nombre'} (${severity.toUpperCase()})`,
        detail: `Intensity ${storm.intensity ?? '?'} kt · last update ${storm.lastUpdate ?? '?'}`,
        position: `${lat.toFixed(1)}, ${lng.toFixed(1)}`,
        link: 'https://www.nhc.noaa.gov/',
        regions,
      })
    }
    return out
  } catch (error) {
    console.error('[vigil-watch] NHC poll failed:', error)
    return []
  }
}

// ── USGS ─────────────────────────────────────────────────────────────────────

interface UsgsFeature {
  id: string
  properties: { mag: number | null; place: string; time: number; url: string }
  geometry: { coordinates: [number, number, number] }
}

async function pollUsgs(): Promise<Omit<WatchCrossing, 'isEscalation'>[]> {
  try {
    const res = await fetch(USGS_WEEK_FEED, { cache: 'no-store' })
    if (!res.ok) return []
    const data = (await res.json()) as { features?: UsgsFeature[] }
    const out: Omit<WatchCrossing, 'isEscalation'>[] = []

    for (const f of data.features ?? []) {
      const mag = f.properties.mag
      if (mag === null) continue
      const [lng, lat] = f.geometry.coordinates
      const regions = WATCHED_REGIONS.filter(
        (r) => r.eqMinMag !== null && mag >= r.eqMinMag && isInBounds(lat, lng, r.bounds)
      )
      if (regions.length === 0) continue

      out.push({
        externalId: `usgs:${f.id}`,
        source: 'usgs',
        severity: `M${mag.toFixed(1)}`,
        headline: `M${mag.toFixed(1)} — ${f.properties.place}`,
        detail: new Date(f.properties.time).toISOString(),
        position: `${lat.toFixed(1)}, ${lng.toFixed(1)}`,
        link: f.properties.url,
        regions,
      })
    }
    return out
  } catch (error) {
    console.error('[vigil-watch] USGS poll failed:', error)
    return []
  }
}

// ── GDACS ────────────────────────────────────────────────────────────────────

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
  }
}

async function pollGdacs(): Promise<Omit<WatchCrossing, 'isEscalation'>[]> {
  try {
    const base = getDataFeed('gdacs')?.url ?? 'https://www.gdacs.org/gdacsapi/api/events'
    const res = await fetch(`${base}/geteventlist/SEARCH?eventtypes=EQ;TC;FL;VO;WF;DR`, {
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = (await res.json()) as { features?: GdacsFeature[] }
    const out: Omit<WatchCrossing, 'isEscalation'>[] = []

    for (const f of data.features ?? []) {
      const level = f.properties.alertlevel ?? 'Green'
      if (level !== 'Orange' && level !== 'Red') continue
      const coords = f.geometry?.coordinates
      if (!coords) continue
      const [lng, lat] = coords
      const hazard = (f.properties.eventtype ?? '') as GdacsHazard
      const regions = WATCHED_REGIONS.filter(
        (r) => r.gdacsHazards.includes(hazard) && isInBounds(lat, lng, r.bounds)
      )
      if (regions.length === 0) continue

      out.push({
        externalId: `gdacs:${f.properties.eventid ?? f.properties.eventname ?? `${lat},${lng}`}`,
        source: 'gdacs',
        severity: level,
        headline: `GDACS ${level} ${hazard} — ${f.properties.eventname ?? f.properties.name ?? ''}`,
        detail: f.properties.fromdate ?? '',
        position: `${lat.toFixed(1)}, ${lng.toFixed(1)}`,
        link: f.properties.url?.report ?? 'https://www.gdacs.org',
        regions,
      })
    }
    return out
  } catch (error) {
    console.error('[vigil-watch] GDACS poll failed:', error)
    return []
  }
}

// ── Dedupe / escalation ──────────────────────────────────────────────────────

const SEVERITY_RANK: Record<string, number> = {
  named: 0,
  hurricane: 1,
  major: 2,
  Orange: 0,
  Red: 1,
}

function severityRank(source: WatchCrossing['source'], severity: string): number {
  if (source === 'usgs') return Math.round(parseFloat(severity.replace('M', '')) * 10)
  return SEVERITY_RANK[severity] ?? 0
}

// ── Scan ─────────────────────────────────────────────────────────────────────

export interface ScanResult {
  polled: { nhc: number; usgs: number; gdacs: number }
  crossings: number
  alerted: number
  emailed: boolean
}

export async function runWatchScan(): Promise<ScanResult> {
  const [nhc, usgs, gdacs] = await Promise.all([pollNhc(), pollUsgs(), pollGdacs()])
  const candidates = [...nhc, ...usgs, ...gdacs]

  const supabase = createAdminClient()
  const ids = candidates.map((c) => c.externalId)
  const { data: existing } = ids.length
    ? await supabase.from('vigil_watch_state').select('external_id, last_severity').in('external_id', ids)
    : { data: [] as { external_id: string; last_severity: string }[] }

  const stateById = new Map((existing ?? []).map((row) => [row.external_id, row.last_severity]))

  const toAlert: WatchCrossing[] = []
  for (const c of candidates) {
    const prev = stateById.get(c.externalId)
    if (prev === undefined) {
      toAlert.push({ ...c, isEscalation: false })
    } else if (severityRank(c.source, c.severity) > severityRank(c.source, prev)) {
      toAlert.push({ ...c, isEscalation: true })
    }
    // same or lower severity → already alerted, stay silent
  }

  let emailed = false
  if (toAlert.length > 0) {
    emailed = await sendDigest(toAlert)
    // Update state only after a successful (or attempted) digest so a failed
    // email retries next scan rather than silently swallowing the alert.
    if (emailed) {
      for (const c of toAlert) {
        await supabase.from('vigil_watch_state').upsert({
          external_id: c.externalId,
          source: c.source,
          last_severity: c.severity,
          region_ids: c.regions.map((r) => r.id),
          last_alerted_at: new Date().toISOString(),
        })
      }
    }
  }

  return {
    polled: { nhc: nhc.length, usgs: usgs.length, gdacs: gdacs.length },
    crossings: candidates.length,
    alerted: toAlert.length,
    emailed,
  }
}

// ── Digest email ─────────────────────────────────────────────────────────────

async function sendDigest(crossings: WatchCrossing[]): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[vigil-watch] RESEND_API_KEY not set — digest not sent:', crossings.length, 'crossings')
    return false
  }

  const lines = crossings
    .map((c) => {
      const tag = c.isEscalation ? 'ESCALATED' : 'NEW'
      const regions = c.regions.map((r) => r.label).join(' · ')
      return `<li style="margin-bottom:12px;">
<strong>[${tag}] ${c.headline}</strong><br/>
Regiones: ${regions}<br/>
Posición: ${c.position} · ${c.detail}<br/>
<a href="${c.link}">Fuente oficial</a>
</li>`
    })
    .join('')

  try {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: `Vigil Watch <${CRISIS_CONFIG.legal.contactEmail}>`,
      to: CRISIS_CONFIG.legal.supportEmail,
      subject: `[Vigil Watch] ${crossings.length} evento(s) sobre umbral — ${new Date().toISOString().slice(0, 16)}Z`,
      html: `<p>Eventos que cruzaron umbral en las regiones vigiladas:</p><ul>${lines}</ul><p style="color:#64748B;font-size:12px;">Vigil Watch · scan cada 30 min · umbrales oficiales (Saffir-Simpson / GDACS Orange-Red / USGS magnitud)</p>`,
    })
    return true
  } catch (error) {
    console.error('[vigil-watch] digest send failed:', error)
    return false
  }
}
