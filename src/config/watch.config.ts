// watch.config.ts — Vigil Watch region boxes + thresholds
// Bounds are decision-trigger watch zones, intentionally wider than any
// deployment's crisis.config.ts bounds (offshore buffer = lead time).
//
// Trigger philosophy (deliberate — do not "improve" to category-gated):
// tropical alerts fire on any NAMED storm whose current position enters a box.
// Rapid intensification (Otis 2023: TS → Cat 5 in ~24h) makes category-gated
// first alerts fire after the decision window has closed. Escalation re-alerts
// fire at hurricane strength and again at major (Cat 3+). v1 uses current
// position from CurrentStorms.json only — no forecast-track parsing.

export type GdacsHazard = 'EQ' | 'TC' | 'FL' | 'VO' | 'DR' | 'WF'

export interface WatchedRegion {
  id: string
  label: string
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }
  /** Alert when a named tropical cyclone's current position is inside bounds.
   *  Escalation re-alerts: 'hurricane', then 'major' (Cat 3+). */
  tropical: boolean
  /** USGS: alert at this magnitude or above inside bounds. null = ignore EQ. */
  eqMinMag: number | null
  /** GDACS: hazard types to alert on at Orange or Red level inside bounds. */
  gdacsHazards: GdacsHazard[]
  notes?: string
}

export const WATCHED_REGIONS: WatchedRegion[] = [
  {
    id: 'venezuela-scarib',
    label: 'Venezuela + southern Caribbean (LIVE deployment)',
    bounds: { minLat: 0.6, maxLat: 15.0, minLng: -73.5, maxLng: -59.5 },
    tropical: true,
    eqMinMag: 6.0, // active aftershock sequence; M6+ = situational escalation for the live instance
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes: 'Deployment bounds + offshore buffer north for Caribbean systems.',
  },
  {
    id: 'mexico-pacific',
    label: 'Mexico Pacific coast',
    bounds: { minLat: 10.0, maxLat: 33.0, minLng: -125.0, maxLng: -92.0 },
    tropical: true,
    eqMinMag: 6.5, // seismically busy; 6.5 keeps signal-to-noise for a deployment trigger
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes:
      'minLat 10.0 reaches the EP genesis zone off Central America — 2-4 days lead on coast-bound storms. Covers Baja through Chiapas.',
  },
  {
    id: 'florida-gulf',
    label: 'Florida / eastern Gulf / Bahamas approach',
    bounds: { minLat: 22.0, maxLat: 31.5, minLng: -90.0, maxLng: -75.0 },
    tropical: true,
    eqMinMag: null,
    gdacsHazards: ['TC', 'FL'],
    notes: 'Home turf. Box includes Bahamas + eastern Gulf approach corridors.',
  },
  {
    id: 'caribbean-arc',
    label: 'Caribbean arc (Hispaniola / Puerto Rico / Antilles)',
    bounds: { minLat: 12.5, maxLat: 20.5, minLng: -75.5, maxLng: -59.0 },
    tropical: true,
    eqMinMag: 6.0, // Haiti: shallow M6 = mass-casualty potential
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes: 'Roadmap Tier 1 (PR) + Tier 2 (Haiti). Covers Hispaniola, PR, Leewards/Windwards to Barbados.',
  },
  {
    id: 'peru-ecuador',
    label: 'Peru / Ecuador coast',
    bounds: { minLat: -18.5, maxLat: 2.5, minLng: -84.0, maxLng: -75.0 },
    tropical: false, // EP cyclones do not track here
    eqMinMag: 6.0, // subduction zone, tsunami-capable
    gdacsHazards: ['EQ', 'FL'],
    notes: 'El Niño flood window Dec-Apr. GDACS Orange flood = the pre-position trigger for the flood template.',
  },
  {
    id: 'centam-pacific',
    label: 'Central America Pacific (Guatemala-Panama)',
    bounds: { minLat: 5.5, maxLat: 17.8, minLng: -95.5, maxLng: -77.0 },
    tropical: true,
    eqMinMag: 6.5,
    gdacsHazards: ['EQ', 'TC', 'FL', 'VO'], // VO: Fuego-class eruptions are a real trigger here
    notes: 'Overlaps mexico-pacific at the Chiapas/Guatemala corridor — dedupe is global by event ID.',
  },
  {
    id: 'california',
    label: 'California',
    bounds: { minLat: 32.0, maxLat: 42.0, minLng: -125.0, maxLng: -114.0 },
    tropical: false,
    eqMinMag: 6.0,
    gdacsHazards: ['EQ', 'WF'], // WF via GDACS only in v1 — no FIRMS integration yet
    notes: 'Roadmap Tier 1 (wildfire + EQ). FIRMS is a later feed; GDACS Orange wildfire suffices as v1 trigger.',
  },
]

export const TROPICAL_ESCALATION_LADDER = ['named', 'hurricane', 'major'] as const
export type TropicalSeverity = (typeof TROPICAL_ESCALATION_LADDER)[number]

export function isInBounds(
  lat: number,
  lng: number,
  bounds: WatchedRegion['bounds']
): boolean {
  return lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng
}
