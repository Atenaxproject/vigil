// Florida hurricane deployment — PRE-BUILT VALUES FILE, NOT WIRED TO THE APP.
// Activation gate: local admin named (Florida VOAD conversation pending) +
// every item in TODO-BEFORE-LAUNCH.md. Swapping these values into
// crisis.config.ts + new Supabase project = same-day activation.

import type { DisasterArchetype, FeedConfig, NotificationConfig } from '@/types/vigil.types'

export const FLORIDA_DEPLOYMENT = {
  country: 'United States',
  regionLabel: 'Florida',
  countryCode: 'US',
  siteUrl: 'https://florida.vigil.youthewave.org', // placeholder — DNS not provisioned
  defaultLang: 'en' as const,
  // Haitian Creole (ht) is REQUIRED for FL — generate + human-review before any
  // launch; never ship machine-only. next-intl locale must be added first.
  supportedLangs: ['en', 'es', 'ht'] as const,

  disasterArchetypes: ['hurricane', 'flood'] as DisasterArchetype[],

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
  ] as FeedConfig[],

  // Evacuation zones: LINK OUT to the official Know Your Zone lookup
  // (floridadisaster.org) — never rebuild or mirror county zone data
  // (accuracy liability; the official source is authoritative).
  uniqueFeatures: ['preparedness_hub', 'evacuation_lookup_link', 'shelter_board'] as string[],

  notificationConfig: {
    zoneSubscription: false,
    // NWS's own tiers, mirrored — never invented.
    severityTiers: ['Extreme', 'Severe', 'Moderate', 'Minor'],
    channels: [],
  } as NotificationConfig,
} as const
