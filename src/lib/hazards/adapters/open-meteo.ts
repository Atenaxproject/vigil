import type { HazardEvent } from '@/lib/hazards/types'

/**
 * Open-Meteo severe weather signals for watched cities — not a warning product.
 * Severity = WMO weather_code description only (agency code mirror).
 */
const POINTS = [
  { name: 'Caracas', lat: 10.48, lng: -66.9 },
  { name: 'Miami', lat: 25.76, lng: -80.19 },
  { name: 'Lima', lat: -12.05, lng: -77.04 },
]

function codeSeverity(code: number): string | null {
  // Only surface storm-class codes for the monitor
  if (code >= 95) return `WMO ${code} thunderstorm`
  if (code >= 80 && code <= 82) return `WMO ${code} rain showers`
  if (code >= 71 && code <= 77) return `WMO ${code} snow`
  return null
}

export async function pollOpenMeteoHazards(): Promise<HazardEvent[]> {
  const fetched_at = new Date().toISOString()
  const out: HazardEvent[] = []
  try {
    await Promise.all(
      POINTS.map(async (p) => {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${p.lat}&longitude=${p.lng}` +
          `&current=weather_code&timezone=auto`
        const res = await fetch(url, { next: { revalidate: 1800 } })
        if (!res.ok) return
        const data = await res.json()
        const code = data.current?.weather_code as number
        const sev = codeSeverity(code)
        if (!sev) return
        out.push({
          id: `open-meteo:${p.name}:${code}`,
          hazard_type: 'weather_alert',
          severity: sev,
          region: p.name,
          lat: p.lat,
          lng: p.lng,
          headline: `${p.name}: ${sev}`,
          issued_at: data.current?.time
            ? new Date(data.current.time).toISOString()
            : fetched_at,
          source: 'open-meteo',
          source_url: 'https://open-meteo.com/',
          fetched_at,
        })
      })
    )
    return out
  } catch {
    return out
  }
}
