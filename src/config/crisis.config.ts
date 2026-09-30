// THIS IS THE ONLY FILE THAT CHANGES BETWEEN COUNTRY DEPLOYMENTS
// Swap these values + redeploy = Vigil runs for any country, any disaster

import type { DisasterArchetype, FeedConfig, NotificationConfig } from '@/types/vigil.types'

export const CRISIS_CONFIG = {
  country: 'Florida',
  countryCode: 'US',
  crisis: 'Hurricane Season 2026',
  crisisDate: '2026-06-01',
  // Explicit display strings, not derived from crisis/country/crisisDate —
  // see PR #84 review (derived format silently changed VE's live title, and
  // assumed every deployment defines crisisDate). Every deployment sets
  // these two directly.
  siteTitle: 'Vigil — Florida Hurricane Response',
  navSubtitle: 'Florida 2026',
  // Placeholder — patched to the real Vercel URL after first deploy, and
  // again once florida.vigil.youthewave.org DNS is provisioned.
  siteUrl: 'https://vigil-florida.vercel.app',
  activeDeployment: true,
  // Widened beyond a single literal so per-deployment `=== 'es'` checks
  // (privacy/page.tsx, terms/page.tsx) type-check regardless of which
  // deployment's value is active here.
  defaultLang: 'en' as 'en' | 'es',
  // Haitian Creole ('ht') intentionally omitted: project rule is no
  // machine-only translation without native-speaker review first. See
  // src/config/deployments/TODO-BEFORE-LAUNCH.md.
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

  emergency: {
    hotline: '911',
    hotlineLabel: '911',
  },

  // Deliberately minimal: only canonical, easily-verifiable .gov sources.
  // VE's list was built over months of vetting sister missing-persons
  // platforms — Florida's equivalent partner vetting has not happened yet,
  // so nothing is invented here rather than listing an unverified org.
  partnerLinks: [
    { name: 'FEMA', url: 'https://www.fema.gov', type: 'official' as PartnerLinkType },
    {
      name: 'Florida Division of Emergency Management',
      url: 'https://www.floridadisaster.org',
      type: 'official' as PartnerLinkType,
    },
  ],

  // Inert for Florida: disasterArchetypes below doesn't include 'earthquake',
  // so the aftershock UI this feeds is archetype-gated off (see CrisisMap.tsx,
  // AftershockAlert.tsx). Shape kept for type compatibility across the ~20
  // files that read CRISIS_CONFIG.seismic/.epicenters.
  seismic: {
    startDate: '2026-06-01',
    minMagnitudeDisplay: 2.5,
    alertThresholdMag: 4.0,
    refreshIntervalMs: 300000,
    alertWindowDays: 7,
    mapWindowDays: 30,
  },

  /** No earthquake epicenters for a hurricane/flood deployment. */
  epicenters: [] as { magnitude: number; place_es: string; place_en: string; source: string }[],

  /** Prompt 63 Part A — staleness for non-live sourced figures */
  figureStaleness: {
    freshDays: 7,
    staleDays: 21,
  } as const,

  /** Prompt 64 Part E — auto-mark after N independent bad_number reports */
  directoryBadNumberThreshold: 3,

  // ── Disaster-archetype schema ─────────────────────────────────────────────
  // Foundation for multi-deployment templates (Florida, Mexico Pacific, …).
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
      // Generic all-Florida feed for now — curating the ~15 flood-relevant
      // gauge sites is a follow-up enhancement, not a launch blocker.
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

  // Evacuation zones: LINK OUT to the official Know Your Zone lookup — never
  // rebuild or mirror official zone data (accuracy liability).
  evacuationZonesUrl: 'https://www.floridadisaster.org/knowyourzone/' as string | undefined,

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
    // DRAFT versions — not yet reviewed. See TODO-BEFORE-LAUNCH.md: Florida's
    // privacy policy needs an owned, human-reviewed rewrite before any real
    // launch. This unblocks a working demo; it is not a finished policy.
    privacyPolicyVersion: '0.1.0-draft',
    tosVersion: '0.1.0-draft',
    governingLaw: 'Florida, United States',
    effectiveDate: 'Draft — pending legal review',
    // DRAFT: county/state EM offices are legitimate partners here (unlike
    // VE's blanket government-agency exclusion) — see TODO-BEFORE-LAUNCH.md
    // and partnerLinks comment above. Needs Orlando's real legal review
    // before this is presented as Vigil Florida's actual policy.
    governmentDataStance:
      'Vigil does not sell or share user data for commercial purposes. Data may be shared with county and state emergency management agencies solely to support disaster response coordination, and disclosed to law enforcement only when required by valid legal process.',
    // DRAFT: no invented specific legal citation (unlike VE's Article 28
    // habeas data reference) — needs Orlando's review to pick or write the
    // right basis for a Florida deployment.
    dataRightsBasis: "Vigil's data correction and deletion policy (see contact above)",
  },

  /**
   * AI rate limits and circuit-breaker defaults.
   * Thresholds are spend proxies (Anthropic does not expose live spend).
   * Override at request time via AI_DEGRADE_THRESHOLD / AI_HALT_THRESHOLD env vars.
   *
   * Load reasoning (approx, $50 Anthropic console hard cap):
   * - Photo search ≈ Sonnet vision + Haiku match ≈ $0.03–0.08 / call
   * - Assistant ≈ Haiku ≈ $0.001–0.002 / call
   * - Unit weights: sonnet=10, haiku=1 → ~800 units ≈ early photo burn,
   *   ~2000 units ≈ remaining budget under mixed traffic.
   * At ~400 concurrent DTV referral searchers / hour with 20% using photo,
   * degrade trips within ~2–4 hours; halt protects the rest of the day.
   */
  aiLimits: {
    photoSearchPerHour: 3,
    assistantPerHour: 5,
    nlIntakePerHour: 10,
    sonnetUnitCost: 10,
    haikuUnitCost: 1,
    /** Rolling window for usage aggregation (hours). */
    usageWindowHours: 24,
    degradeThresholdDefault: 800,
    haltThresholdDefault: 2000,
  },

  /**
   * Only the universal, trivially-verifiable national number — the two-source
   * rule (see VE entries' `source` fields for the pattern) has not been
   * applied to any Florida county-specific number yet. 'nacional' id is a
   * hardcoded lookup key in EmergencyBanner.tsx — keep it even though the
   * label is US-specific. Populating county EM office numbers is a
   * follow-up, not a demo blocker.
   */
  emergencyContacts: [
    {
      id: 'nacional',
      label_es: 'EE. UU. 9-1-1 — Emergencias nacional',
      label_en: 'US 911 — National emergencies',
      numbers: ['911'],
      service_type: 'publico' as const,
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-09-30',
      source: 'FCC National 911 Program (universally documented)',
    },
  ] as {
    id: string
    label_es: string
    label_en: string
    numbers: string[]
    service_type: 'publico' | 'privado'
    carrierAccess?: string
    carrierCodes?: { carrier: string; code: string }[]
    label_short?: string
    states: string[]
    verified: boolean
    verified_at: string
    source: string
    note_es?: string
    note_en?: string
  }[],

  /** No Florida-specific state/county priority ordering defined yet. */
  directoryStatePriority: [] as string[],

  /** No verified Florida psychosocial-support lines yet. */
  psychosocialLines: [] as {
    id: string
    name: string
    numbers: string[]
    venezuela_only: boolean
    verified_at: string
    source: string
    note_es: string
    note_en: string
  }[],

  /** Empty until the Florida organizations directory has real entries. */
  orgDisplayPriority: {} as Record<string, number>,
} as const

/**
 * USA diaspora support layer — separate bounds from Venezuela crisis map.
 * VE-specific concept (support FROM the US FOR Venezuela's crisis); disabled
 * for the Florida deployment itself, which has no equivalent diaspora layer.
 */
export const diasporaSupportConfig = {
  enabled: false,
  region_id: 'usa_diaspora' as const,
  region_label: 'Apoyo desde EE.UU.',
  region_label_en: 'Support from the U.S.',
  bounds: {
    minLat: 25.1,
    maxLat: 26.95,
    minLng: -80.9,
    maxLng: -79.9,
  },
  centerLat: 25.9,
  centerLng: -80.36,
  defaultZoom: 9,
  minZoom: 8,
  maxZoom: 16,
  emergency_number: '911',
  legal_note_en:
    'Informational only. Verify all locations and hours directly before traveling. Vigil is not affiliated with any government agency.',
  legal_note_es:
    'Uso informativo. Verifica siempre ubicaciones y horarios directamente antes de trasladarte. Vigil no está afiliado a ninguna agencia gubernamental.',
} as const

export type { RegionScope } from '@/types/vigil.types'

/** Resolve a data feed by id. Feed consumers in src/lib/ read URL and cache
 *  values through this — never hardcode external endpoints in lib files. */
export function getDataFeed(id: string): FeedConfig | undefined {
  return CRISIS_CONFIG.dataFeeds.find((f) => f.id === id)
}

export type SupportedLang = (typeof CRISIS_CONFIG.supportedLangs)[number]
export type PartnerLinkType = 'translation' | 'official' | 'ngo' | 'data' | 'sister-platform'
