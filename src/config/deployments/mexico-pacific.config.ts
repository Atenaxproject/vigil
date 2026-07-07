// Mexico Pacific hurricane deployment — TEMPLATE PRE-BUILD ONLY, NOT WIRED.
// Hard gate: no Mexico local admin confirmed (Deployment Playbook §3) — no
// Supabase project, no Vercel project, no DNS until that clears. See
// TODO-BEFORE-LAUNCH.md.
//
// Feed verification (spec §3, FUNVISIS lesson — do not scrape HTML):
// - NHC: structured (CurrentStorms.json covers the EP basin; the adapter in
//   src/lib/feeds/nhc.ts does NOT filter by basin — confirmed).
// - SMN/Conagua (smn.conagua.gob.mx): no documented public JSON/XML feed —
//   HTML pages only. OMITTED; gap documented. Re-verify at launch.
// - CENAPRED: no structured live alert feed found (static open-data catalogs
//   only). OMITTED; gap documented. Re-verify at launch.
// NHC + GDACS alone are sufficient for launch per spec.
//
// NHC storm surge: US-coastline products only — the surge layer must stay
// disabled or be clearly US-only-labeled for Mexican shores.

import type { DisasterArchetype, FeedConfig, NotificationConfig } from '@/types/vigil.types'

export const MEXICO_PACIFIC_DEPLOYMENT = {
  country: 'Mexico',
  regionLabel: 'Costa del Pacífico',
  countryCode: 'MX',
  siteUrl: 'https://mexico.vigil.youthewave.org', // placeholder — DNS not provisioned
  defaultLang: 'es' as const,
  // ES primary (Vigil default), EN for international responders. No new locale needed.
  supportedLangs: ['es', 'en'] as const,

  disasterArchetypes: ['hurricane'] as DisasterArchetype[],

  // Full Mexican Pacific coast (Baja Sur through Chiapas) — starting envelope;
  // tighten to the deploy's actual coverage before going live.
  mapBounds: {
    minLat: 14.0,
    maxLat: 32.5,
    minLng: -118.5,
    maxLng: -92.0,
    centerLat: 19.5,
    centerLng: -104.5,
    defaultZoom: 5,
    maxZoom: 16,
    minZoom: 4,
  },

  emergency: {
    // 911 is Mexico's national emergency number — VERIFY current at launch,
    // plus Protección Civil contacts per covered state (do not memory-source).
    hotline: '911',
    hotlineLabel: '911',
  },

  dataFeeds: [
    {
      id: 'nhc-storms',
      label: 'feeds.nhcStorms',
      url: 'https://www.nhc.noaa.gov/CurrentStorms.json',
      tier: 'primary',
      cacheSeconds: 600,
      enabled: true,
    },
    {
      id: 'gdacs',
      label: 'feeds.gdacs',
      url: 'https://www.gdacs.org/gdacsapi/api/events',
      tier: 'primary',
      cacheSeconds: 600,
      enabled: true,
    },
    // SMN/Conagua + CENAPRED intentionally absent — no structured feeds (see
    // header). partnership_gated: CENAPRED/Protección Civil coordination is a
    // relationship to build, not a feed to assume.
  ] as FeedConfig[],

  // Reused unchanged from the hurricane archetype: shelter board, evacuation
  // lookup link, pre-storm supply coordination (resource_exchange),
  // preparedness checklist, rescuer_presence.
  uniqueFeatures: ['preparedness_hub', 'evacuation_lookup_link', 'shelter_board'] as string[],

  notificationConfig: {
    zoneSubscription: false,
    // Saffir-Simpson via NHC — mirrored, never invented.
    severityTiers: ['Extreme', 'Severe', 'Moderate', 'Minor'],
    channels: [],
  } as NotificationConfig,

  /**
   * Government-data policy — Mexico-specific, decided deliberately.
   * Do NOT inherit Venezuela's exclusion clause: that was a considered response
   * to documented conduct (VenApp surveillance), not a universal rule. Mexico's
   * civil-protection agencies (CENAPRED, Protección Civil, SMN) ARE legitimate
   * coordination partners and are listed as official resources. Personal
   * contact data (phone, WhatsApp, GPS) is STILL never shown publicly or
   * shared with any party — government included — without the record owner's
   * explicit consent. The contact-routing / claim-token architecture is
   * unchanged and non-negotiable. The ES privacy-policy section reflecting
   * this is drafted in TODO-BEFORE-LAUNCH and requires human review.
   */
  governmentDataPolicy: 'cooperate-official-resources-no-pii-sharing' as const,
} as const
