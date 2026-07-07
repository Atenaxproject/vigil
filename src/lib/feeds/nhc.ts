// NHC Active Storms adapter (CurrentStorms.json). One integration covers the
// entire Atlantic (AL) + Eastern Pacific (EP) basins — serves Florida,
// Caribbean, Mexico, and Central America deployments unchanged. Do NOT filter
// by basin here; deployment configs filter by their own bounds.
//
// v1 parses positions/classification and links to the official NHC advisory —
// native forecast-cone polygon rendering is P1 (needs shapefile/KML parsing;
// no heavy dependency for v1).

const NHC_CURRENT_STORMS = 'https://www.nhc.noaa.gov/CurrentStorms.json'
const NHC_REVALIDATE = 600

export interface NhcActiveStorm {
  id: string
  name: string
  /** NHC classification code: TD/TS/HU/MH/STS/SS/PTC… — official, not invented. */
  classification: string
  intensityKt: number | null
  lat: number
  lng: number
  movement: string | null
  lastUpdate: string
  /** AL (Atlantic) | EP (Eastern Pacific) | CP (Central Pacific) */
  basin: string
  advisoryUrl: string
}

interface RawStorm {
  id?: string
  binNumber?: string
  name?: string
  classification?: string
  intensity?: string | number
  latitudeNumeric?: number
  longitudeNumeric?: number
  movementDir?: number
  movementSpeed?: number
  lastUpdate?: string
  publicAdvisory?: { url?: string }
}

function basinFromId(id: string): string {
  const prefix = id.slice(0, 2).toUpperCase()
  return ['AL', 'EP', 'CP'].includes(prefix) ? prefix : 'AL'
}

/** All active tropical cyclones, both basins. Graceful: feed down → []. */
export async function getNhcActiveStorms(): Promise<NhcActiveStorm[]> {
  try {
    const res = await fetch(NHC_CURRENT_STORMS, { next: { revalidate: NHC_REVALIDATE } })
    if (!res.ok) {
      console.error('NHC CurrentStorms error:', res.status, res.statusText)
      return []
    }
    const data = (await res.json()) as { activeStorms?: RawStorm[] }
    const storms: NhcActiveStorm[] = []

    for (const s of data.activeStorms ?? []) {
      const lat = s.latitudeNumeric
      const lng = s.longitudeNumeric
      if (typeof lat !== 'number' || typeof lng !== 'number') continue
      const id = s.id ?? s.binNumber ?? `${s.name}`
      storms.push({
        id,
        name: s.name ?? 'Unnamed',
        classification: (s.classification ?? 'TD').toUpperCase(),
        intensityKt: s.intensity != null && !Number.isNaN(Number(s.intensity)) ? Number(s.intensity) : null,
        lat,
        lng,
        movement:
          s.movementDir != null && s.movementSpeed != null
            ? `${s.movementDir}° @ ${s.movementSpeed} kt`
            : null,
        lastUpdate: s.lastUpdate ?? '',
        basin: basinFromId(id),
        advisoryUrl: s.publicAdvisory?.url ?? 'https://www.nhc.noaa.gov/',
      })
    }
    return storms
  } catch (error) {
    console.error('NHC CurrentStorms fetch failed:', error)
    return []
  }
}
