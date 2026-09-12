// THIS IS THE ONLY FILE THAT CHANGES BETWEEN COUNTRY DEPLOYMENTS
// Swap these values + redeploy = Vigil runs for any country, any disaster
//
// FLORIDA STAGING DEPLOYMENT — branch: deploy/florida
// Values sourced from src/config/deployments/florida.config.ts (prompt 52).
// This is a staging/testing environment, not a public launch: per AGENTS.md,
// no deployment goes live without a named local admin (still in outreach —
// see src/config/deployments/TODO-BEFORE-LAUNCH.md). Do not promote this URL
// publicly or add it to registry.ts as 'live' until that gate clears.
//
// Haitian Creole ('ht') intentionally excluded from supportedLangs below —
// no ht.json exists yet and next-intl's dynamic locale import would 404 the
// whole request. Add it only after generation + native-speaker review.
//
// Honest-empty-state fields (no fabricated content): psychosocialLines,
// orgDisplayPriority, epicenters, directoryStatePriority. emergencyContacts
// carries only 911 — no county EM office numbers are verified yet (two-
// independent-source rule, AGENTS.md). partnerLinks carries only official
// federal/state resources (NHC, NWS, FEMA, Ready.gov, floridadisaster.org,
// Florida VOAD, Red Cross) — no sister-platforms exist for Florida yet, so
// pages reading personSearch/sister-platform links render empty, correctly.

import type { DisasterArchetype, FeedConfig, NotificationConfig } from '@/types/vigil.types'

// Explicit shapes for fields whose Venezuela literals carry optional variant
// fields (carrierCodes, personSearch, integrated, note_es/en, …). Florida's
// arrays don't use every variant, so they're typed against these interfaces
// via `satisfies X[] as X[]` rather than left to bare `as const` inference —
// otherwise TypeScript narrows e.g. an empty `epicenters` tuple to `never`,
// or a `partnerLinks` array with no 'sister-platform' entries to a type that
// can't even be *compared* against that literal, breaking every shared
// component (EmergencyBanner, InformacionLive, RedNetworkClient, …) that
// pattern-matches on the fuller Venezuela-shaped union.
interface Epicenter {
  magnitude: number
  place_es: string
  place_en: string
  source: string
}

interface EmergencyContact {
  id: string
  label_es: string
  label_en: string
  numbers: string[]
  service_type: 'publico' | 'privado'
  states: readonly string[]
  verified: boolean
  verified_at?: string
  source: string
  label_short?: string
  carrierAccess?: string
  carrierCodes?: { carrier: string; code: string }[]
  note_es?: string
  note_en?: string
}

interface PsychosocialLine {
  id: string
  name: string
  numbers: string[]
  venezuela_only: boolean
  verified_at?: string
  source: string
  note_es?: string
  note_en?: string
}

interface PartnerLinkEntry {
  name: string
  url: string
  type: 'translation' | 'official' | 'ngo' | 'data' | 'sister-platform'
  slug?: string
  personSearch?: true
  integrated?: boolean
}

export const CRISIS_CONFIG = {
  country: 'United States',
  countryCode: 'US',
  crisis: 'Hurricane Season Readiness',
  crisisDate: '2026-06-01',
  siteUrl: 'https://florida.vigil.youthewave.org',
  activeDeployment: false,
  defaultLang: 'en' as const,
  supportedLangs: ['en', 'es'] as const,

  mapBounds: {
    minLat: 24.3,
    maxLat: 31.0,
    minLng: -87.7,
    maxLng: -79.8,
    centerLat: 27.8,
    centerLng: -81.7,
    defaultZoom: 7,
    maxZoom: 16,
    minZoom: 5,
  },

  // WeatherBar / api/weather were hardcoded to Caracas + two Venezuelan
  // cities with no config path at all — found while verifying this
  // deployment (the header showed "Venezuela: <Caracas time>"). Both files
  // now read from here.
  timeZone: 'America/New_York',
  weatherLocations: [
    { name: 'Miami', lat: 25.7617, lng: -80.1918 },
    { name: 'Tampa', lat: 27.9506, lng: -82.4572 },
    { name: 'Orlando', lat: 28.5383, lng: -81.3792 },
  ] as { name: string; lat: number; lng: number }[],

  emergency: {
    hotline: '911',
    hotlineLabel: '911',
  },

  // No sister-platforms or person-search partners exist for Florida yet —
  // official resources only. MissingPersonSearch / RedNetworkClient filter
  // on `type`/`personSearch` and render empty states correctly with this list.
  partnerLinks: [
    { name: 'National Hurricane Center', url: 'https://www.nhc.noaa.gov', type: 'official' },
    { name: 'National Weather Service', url: 'https://www.weather.gov', type: 'official' },
    { name: 'FEMA', url: 'https://www.fema.gov', type: 'official' },
    { name: 'Ready.gov', url: 'https://www.ready.gov', type: 'official' },
    { name: 'Florida Division of Emergency Management', url: 'https://www.floridadisaster.org', type: 'official' },
    { name: 'Florida VOAD', url: 'https://flvoad.org', type: 'ngo' },
    { name: 'American Red Cross — Florida', url: 'https://www.redcross.org/local/florida.html', type: 'ngo' },
  ] satisfies PartnerLinkEntry[] as PartnerLinkEntry[],

  // Pages that are Venezuela-specific in their own component code, not just
  // config (hardcoded Venezuelan zone names, DTV earthquake integration,
  // INAMEH rain/landslide monitoring) — hidden from nav rather than shown
  // broken or fabricated for Florida. Nav-level only: does not block direct
  // navigation to the URL. See Navigation.tsx.
  hiddenRoutes: ['/prensa', '/red', '/servicios', '/amenazas', '/estadisticas'] as string[],

  seismic: {
    startDate: '2026-06-01',
    minMagnitudeDisplay: 2.5,
    alertThresholdMag: 4.0,
    refreshIntervalMs: 300000,
    alertWindowDays: 7,
    mapWindowDays: 30,
  },

  // No earthquake epicenters — hurricane/flood archetype. Kept as an empty
  // array (not omitted) so InformacionLive.tsx / PressKit.tsx's `.map()`
  // calls render nothing rather than needing a type change.
  epicenters: [] satisfies Epicenter[] as Epicenter[],

  figureStaleness: {
    freshDays: 7,
    staleDays: 21,
  } as const,

  directoryBadNumberThreshold: 3,

  // ── Disaster-archetype schema ─────────────────────────────────────────────
  disasterArchetypes: ['hurricane', 'flood'] satisfies DisasterArchetype[] as DisasterArchetype[],

  dataFeeds: [
    {
      id: 'nws-alerts',
      label: 'feeds.nwsAlerts',
      url: 'https://api.weather.gov/alerts/active',
      tier: 'primary',
      cacheSeconds: 120,
      enabled: true,
    },
    {
      id: 'nhc-storms',
      label: 'feeds.nhcStorms',
      url: 'https://www.nhc.noaa.gov/CurrentStorms.json',
      tier: 'primary',
      cacheSeconds: 600,
      enabled: true,
    },
    {
      id: 'usgs-water',
      label: 'feeds.usgsWater',
      url: 'https://waterservices.usgs.gov/nwis/iv/',
      tier: 'secondary',
      cacheSeconds: 900,
      enabled: true,
    },
    {
      id: 'gdacs',
      label: 'feeds.gdacs',
      url: 'https://www.gdacs.org/gdacsapi/api/events',
      tier: 'secondary',
      cacheSeconds: 600,
      enabled: true,
    },
  ] satisfies FeedConfig[] as FeedConfig[],

  notificationConfig: {
    zoneSubscription: false,
    // NWS's own tiers, mirrored — never invented.
    severityTiers: ['Extreme', 'Severe', 'Moderate', 'Minor'],
    channels: [],
  } satisfies NotificationConfig as NotificationConfig,

  uniqueFeatures: ['preparedness_hub', 'evacuation_lookup_link', 'shelter_board'] as string[],

  // Florida-only field, read by CrisisMap/MapLayers instead of a hardcoded
  // constant (review finding on PR #63 — never share one deployment's
  // evacuation-zone URL with another that shares the hurricane archetype).
  evacuationZonesUrl: 'https://www.floridadisaster.org/knowyourzone/',

  dataRetention: {
    activeRecordDays: 90,
    archiveAfterDays: 365,
    photoPurgeWithRecord: true,
  },

  legal: {
    operator: 'Bbluestudios™ LLC',
    operatorLocation: 'Greenacres, Florida, USA',
    contactEmail: 'vigil@youthewave.org',
    supportEmail: 'support@youthewave.org',
    privacyPolicyVersion: '0.1.0-staging',
    tosVersion: '0.1.0-staging',
    governingLaw: 'Florida, United States',
    effectiveDate: '2026-09-12',
  },

  aiLimits: {
    photoSearchPerHour: 3,
    assistantPerHour: 15,
    nlIntakePerHour: 10,
    sonnetUnitCost: 10,
    haikuUnitCost: 1,
    usageWindowHours: 24,
    degradeThresholdDefault: 800,
    haltThresholdDefault: 2000,
  },

  // Only 911 — no county EM office numbers have cleared the two-independent-
  // source verification rule yet (AGENTS.md). Add them here once verified,
  // never before.
  emergencyContacts: [
    {
      id: 'nacional',
      label_es: 'Emergencias — 9-1-1',
      label_en: 'Emergencies — 9-1-1',
      numbers: ['911'],
      service_type: 'publico',
      states: ['nacional'],
      verified: true,
      verified_at: '2026-09-12',
      source: 'FCC — national emergency number designation',
    },
  ] satisfies EmergencyContact[] as EmergencyContact[],

  // No Florida counties verified/prioritized yet — EmergencyDirectory.tsx
  // spreads this into its state list; empty is safe (see ALL_STATES there,
  // which still lists Venezuela states inline — a known rough edge, not
  // fixed by this config; the directory page is not part of Florida's
  // ready-to-demo surface yet).
  directoryStatePriority: [] as readonly string[],

  // No Florida-specific psychosocial support lines verified yet.
  psychosocialLines: [] satisfies PsychosocialLine[] as PsychosocialLine[],

  // No organizations confirmed for Florida yet — empty until local
  // partnerships land (TODO-BEFORE-LAUNCH.md).
  orgDisplayPriority: {} as Record<string, number>,
} as const

/** USA diaspora support layer — not applicable to the Florida deployment
 *  (that's a Venezuela-diaspora-in-USA feature). Kept structurally present,
 *  unused: no page routes to regionScope 'usa_diaspora' for this deployment. */
export const diasporaSupportConfig = {
  enabled: false,
  region_id: 'usa_diaspora' as const,
  region_label: 'N/A',
  region_label_en: 'N/A',
  bounds: {
    minLat: 24.3,
    maxLat: 31.0,
    minLng: -87.7,
    maxLng: -79.8,
  },
  centerLat: 27.8,
  centerLng: -81.7,
  defaultZoom: 7,
  minZoom: 5,
  maxZoom: 16,
  emergency_number: '911',
  legal_note_en: 'Not applicable to this deployment.',
  legal_note_es: 'No aplica a este despliegue.',
} as const

export type { RegionScope } from '@/types/vigil.types'

/** Resolve a data feed by id. Feed consumers in src/lib/ read URL and cache
 *  values through this — never hardcode external endpoints in lib files. */
export function getDataFeed(id: string): FeedConfig | undefined {
  return CRISIS_CONFIG.dataFeeds.find((f) => f.id === id)
}

export type SupportedLang = (typeof CRISIS_CONFIG.supportedLangs)[number]
export type PartnerLinkType = 'translation' | 'official' | 'ngo' | 'data' | 'sister-platform'
