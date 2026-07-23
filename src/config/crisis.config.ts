// THIS IS THE ONLY FILE THAT CHANGES BETWEEN COUNTRY DEPLOYMENTS
// Swap these values + redeploy = Vigil runs for any country, any disaster

import type { DisasterArchetype, FeedConfig, NotificationConfig } from '@/types/vigil.types'

export const CRISIS_CONFIG = {
  country: 'Venezuela',
  countryCode: 'VE',
  crisis: '2026 Earthquakes',
  crisisDate: '2026-06-24',
  siteUrl: 'https://vigil.youthewave.org',
  activeDeployment: true,
  defaultLang: 'es' as const,
  supportedLangs: ['es', 'en', 'pt', 'fr', 'it', 'zh', 'de', 'ru'] as const,

  mapBounds: {
    minLat: 0.6,
    maxLat: 12.5,
    minLng: -73.5,
    maxLng: -59.5,
    centerLat: 10.4,
    centerLng: -66.9,
    defaultZoom: 7,
    maxZoom: 16,
    minZoom: 5,
  },

  emergency: {
    // Primary national emergency line — matches header banner and peer platforms.
    hotline: '911',
    hotlineLabel: '911',
    // VenApp intentionally excluded — see Vigil Privacy Policy section on
    // government data non-cooperation. VenApp has documented human rights concerns.
  },

  partnerLinks: [
    { name: 'Red de Intérpretes', url: 'https://interp-aid.lovable.app', type: 'translation' as const },
    { name: 'ReliefWeb Venezuela', url: 'https://reliefweb.int/country/ven', type: 'official' as const },
    { name: 'OCHA Venezuela', url: 'https://www.unocha.org/venezuela', type: 'official' as const },
    { name: 'UNICEF Venezuela', url: 'https://www.unicef.org/venezuela', type: 'official' as const },
    { name: 'Cruz Roja Venezolana', url: 'https://cruzrojavenezolana.org', type: 'ngo' as const },
    { name: 'HDX — Datos Humanitarios', url: 'https://data.humdata.org/group/ven', type: 'data' as const },
    {
      name: 'Venezuela Te Busca',
      url: 'https://venezuelatebusca.com',
      type: 'sister-platform' as const,
      slug: 'venezuelaTeBusca' as const,
    },
    {
      name: 'CIVIS Venezuela',
      url: 'https://civisvenezuela.com',
      type: 'sister-platform' as const,
      slug: 'civisVenezuela' as const,
    },
    // Retired 2026-07-22 (74 Part D link check): domains no longer resolve.
    // Restore only after verifying the platform is live again.
    //   SOS Venezuela 2026 — https://sosvenezuela2026.com (DNS NXDOMAIN)
    //   Red Venezuela Activa — https://redvenezuelaactiva.com (DNS NXDOMAIN)
    {
      name: 'Desaparecidos Terremoto Venezuela',
      url: 'https://desaparecidosterremotovenezuela.com',
      type: 'sister-platform' as const,
      slug: 'desaparecidosTerremoto' as const,
      integrated: true,
    },
    {
      name: 'RedQuipu',
      url: 'https://redquipu.com',
      type: 'sister-platform' as const,
      slug: 'redQuipu' as const,
    },
    {
      name: 'Mapa de Daños Venezuela',
      url: 'https://terremotovenezuela.com',
      type: 'sister-platform' as const,
      slug: 'mapaDanosVenezuela' as const,
    },
    {
      name: 'Mapa de Necesidades VZLA',
      url: 'https://mapadenecesidadesvzla.com/',
      type: 'sister-platform' as const,
      slug: 'mapaNecesidadesVzla' as const,
    },
    {
      name: 'Encuéntrame VZLA',
      url: 'https://encuentramevzla.com',
      type: 'sister-platform' as const,
      slug: 'encuentrameVzla' as const,
    },
    {
      name: 'Venezuela Earthquake Map',
      url: 'https://venezuela-earthquake-map.vercel.app',
      type: 'sister-platform' as const,
      slug: 'venezuelaEarthquakeMap' as const,
      integrated: false,
    },
    {
      name: 'Yummy SOS',
      url: 'https://sos.yummyrides.com',
      type: 'sister-platform' as const,
      slug: 'yummySos' as const,
      integrated: false,
    },
    {
      name: 'Centros de Ayuda Venezuela',
      url: 'https://centrosayudavenezuela.org',
      type: 'sister-platform' as const,
      slug: 'centrosAyudaVenezuela' as const,
      integrated: false,
    },
    {
      name: 'Ayuda Venezuela',
      url: 'https://ayudavenezuela.app',
      type: 'sister-platform' as const,
      slug: 'ayudaVenezuela' as const,
      integrated: false,
    },
    {
      name: 'Tiltely Venezuela',
      url: 'https://venezuela.tiltely.com',
      type: 'sister-platform' as const,
      slug: 'tiltelyVenezuela' as const,
      integrated: false,
    },
  ],

  seismic: {
    startDate: '2026-06-24',
    /** Display threshold M2.5+ (prompt 69); M4.0+ remains alert tier. */
    minMagnitudeDisplay: 2.5,
    alertThresholdMag: 4.0,
    refreshIntervalMs: 300000,
    /** Banner M4+ count — pure rolling days (prompt 67; never crisis-pinned). */
    alertWindowDays: 7,
    /** Map marker window — rolling days; events age out. */
    mapWindowDays: 30,
  },

  /**
   * Two mainshocks 39s apart (DTV history-and-context; USGS titles name the larger).
   * Label each with its own epicenter — never collapse to one place name.
   */
  epicenters: [
    {
      magnitude: 7.2,
      place_es: 'cerca de San Felipe, Yaracuy',
      place_en: 'near San Felipe, Yaracuy',
      source: 'USGS / DTV history-and-context',
    },
    {
      magnitude: 7.5,
      place_es: 'inmediaciones de Yumare, Yaracuy',
      place_en: 'near Yumare, Yaracuy',
      source: 'USGS / DTV history-and-context',
    },
  ] as const,

  /** Prompt 63 Part A — staleness for non-live sourced figures */
  figureStaleness: {
    freshDays: 7,
    staleDays: 21,
  } as const,

  /** Prompt 64 Part E — auto-mark after N independent bad_number reports */
  directoryBadNumberThreshold: 3,

  // ── Disaster-archetype schema ─────────────────────────────────────────────
  // Foundation for multi-deployment templates (Florida, Mexico Pacific, …).
  // Venezuela behavior is unchanged: values mirror the live integrations.
  disasterArchetypes: ['earthquake'] satisfies DisasterArchetype[] as DisasterArchetype[],

  dataFeeds: [
    {
      id: 'usgs',
      label: 'feeds.usgs',
      url: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
      tier: 'primary',
      cacheSeconds: 300,
      enabled: true,
    },
    {
      // FUNVISIS gap (2026-07-04): funvisis.gob.ve is HTML-only — no structured
      // feed exists. Kept disabled; see src/lib/seismic.ts for the merge point.
      id: 'funvisis',
      label: 'feeds.funvisis',
      url: 'https://www.funvisis.gob.ve',
      tier: 'secondary',
      cacheSeconds: 300,
      enabled: false,
    },
    {
      id: 'gdacs',
      label: 'feeds.gdacs',
      url: 'https://www.gdacs.org/gdacsapi/api/events',
      tier: 'primary',
      cacheSeconds: 600,
      enabled: true,
    },
    {
      id: 'reliefweb',
      label: 'feeds.reliefweb',
      url: 'https://api.reliefweb.int/v1/reports',
      tier: 'secondary',
      cacheSeconds: 3600,
      enabled: true,
    },
  ] satisfies FeedConfig[] as FeedConfig[],

  // Vigil Alerta is not built yet — honest empty state, no invented tiers.
  notificationConfig: {
    zoneSubscription: false,
    severityTiers: [],
    channels: [],
  } satisfies NotificationConfig as NotificationConfig,

  uniqueFeatures: ['preparedness_hub'] as string[],

  dataRetention: {
    activeRecordDays: 90,
    archiveAfterDays: 365,
    photoPurgeWithRecord: true,
  },

  legal: {
    operator: 'Bbluestudios LLC',
    operatorLocation: 'Greenacres, Florida, USA',
    contactEmail: 'vigil@youthewave.org',
    supportEmail: 'support@youthewave.org',
    privacyPolicyVersion: '1.0.0',
    tosVersion: '1.0.0',
    governingLaw: 'Florida, United States',
    effectiveDate: '2026-06-29',
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
    assistantPerHour: 15,
    nlIntakePerHour: 10,
    sonnetUnitCost: 10,
    haikuUnitCost: 1,
    /** Rolling window for usage aggregation (hours). */
    usageWindowHours: 24,
    degradeThresholdDefault: 800,
    haltThresholdDefault: 2000,
  },

  /**
   * Emergency contacts — prompt 64 Part A final list.
   * Two-source rule; service_type required (público | privado).
   * Former uncorroborated rescue-coordination and flooding-line candidates removed
   * under the two-source rule (peer platforms + issuing org channels).
   */
  emergencyContacts: [
    {
      id: 'nacional',
      label_es: 'VEN 9-1-1 — Emergencias nacional',
      label_en: 'VEN 9-1-1 — National emergencies',
      numbers: ['911'],
      service_type: 'publico' as const,
      carrierAccess:
        'Movistar 911 · Movistar *1 · Digitel 112 · Digitel *112 · Movilnet *1 · Movilnet *911 · Cantv 171',
      carrierCodes: [
        { carrier: 'Movistar', code: '911' },
        { carrier: 'Movistar', code: '*1' },
        { carrier: 'Digitel', code: '112' },
        { carrier: 'Digitel', code: '*112' },
        { carrier: 'Movilnet', code: '*1' },
        { carrier: 'Movilnet', code: '*911' },
        { carrier: 'Cantv', code: '171' },
      ],
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'Header Vigil + plataformas pares (911 / variantes de operador)',
    },
    {
      id: 'proteccion_civil',
      label_es: 'Protección Civil — línea nacional',
      label_en: 'Civil Protection — national line',
      numbers: ['0800-7248451'],
      service_type: 'publico' as const,
      label_short: '0800-PCIVIL1',
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'Canal publicado de Protección Civil',
    },
    {
      id: 'proteccion_civil_caracas',
      label_es: 'Protección Civil — sede Caracas',
      label_en: 'Civil Protection — Caracas HQ',
      numbers: ['0212-631-8662', '0212-662-8476', '0212-662-3205'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (lectura pública; fuente única para sede)',
    },
    {
      id: 'proteccion_civil_corto',
      label_es: 'Protección Civil — código corto',
      label_en: 'Civil Protection — short code',
      numbers: ['166'],
      service_type: 'publico' as const,
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-07-21',
      source: 'Múltiples fuentes independientes',
    },
    {
      id: 'bomberos_corto',
      label_es: 'Bomberos — código corto',
      label_en: 'Firefighters — short code',
      numbers: ['167'],
      service_type: 'publico' as const,
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-07-21',
      source: 'Múltiples fuentes independientes',
    },
    {
      id: 'cruz_roja',
      label_es: 'Cruz Roja Venezolana',
      label_en: 'Venezuelan Red Cross',
      numbers: ['0212-578-2516', '0212-571-2411', '0212-571-4380'],
      service_type: 'publico' as const,
      states: ['nacional', 'Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'Corroborado; CIVIS lista 0212-571-4380 (más reciente)',
      note_es: 'Tres líneas publicadas (centralita / directas). No elegimos una sola.',
      note_en: 'Three published lines (switchboard / direct). Listed together, not chosen.',
    },
    {
      id: 'funvisis',
      label_es: 'FUNVISIS · 0-800-TEMBLOR',
      label_en: 'FUNVISIS · 0-800-TEMBLOR',
      numbers: ['0800-836-2567', '0212-257-5153'],
      service_type: 'publico' as const,
      label_short: '0-800-TEMBLOR',
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'Tres fuentes independientes (incl. CIVIS); línea de información sísmica',
      note_es: 'Información sísmica y réplicas',
      note_en: 'Seismic and aftershock information line',
    },
    {
      id: 'tap',
      label_es: 'TAP — Telemedicina de Acceso Público',
      label_en: 'TAP — Public Access Telemedicine',
      numbers: ['0212-822-1262'],
      service_type: 'publico' as const,
      states: ['nacional'] as const,
      verified: true,
      verified_at: '2026-06-27',
      source: 'Directorio ciudadano; gratuito 24/7',
      note_es: 'Gratis, 24/7',
      note_en: 'Free, 24/7',
    },
    // Fire stations — CIVIS Venezuela, single-sourced (prompt 69 A5)
    {
      id: 'bomberos_antamano',
      label_es: 'Bomberos Antímano',
      label_en: 'Antímano Fire Station',
      numbers: ['0212-472-2054'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_catia_la_mar',
      label_es: 'Bomberos Catia La Mar',
      label_en: 'Catia La Mar Fire Station',
      numbers: ['0212-351-9966'],
      service_type: 'publico' as const,
      states: ['La Guaira'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_chacao',
      label_es: 'Bomberos Chacao',
      label_en: 'Chacao Fire Station',
      numbers: ['0212-265-3261'],
      service_type: 'publico' as const,
      states: ['Distrito Capital', 'Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_del_este',
      label_es: 'Bomberos Del Este (Cafetal)',
      label_en: 'Eastern Fire Station (Cafetal)',
      numbers: ['0212-987-4334', '0212-985-5060'],
      service_type: 'publico' as const,
      states: ['Distrito Capital', 'Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_sucre',
      label_es: 'Bomberos Sucre',
      label_en: 'Sucre Fire Station',
      numbers: ['0212-985-3640'],
      service_type: 'publico' as const,
      states: ['Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_el_cafetal',
      label_es: 'Bomberos El Cafetal',
      label_en: 'El Cafetal Fire Station',
      numbers: ['0212-985-3640', '0212-985-2977'],
      service_type: 'publico' as const,
      states: ['Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_el_paraiso',
      label_es: 'Bomberos El Paraíso',
      label_en: 'El Paraíso Fire Station',
      numbers: ['0212-481-0961'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_el_valle',
      label_es: 'Bomberos El Valle',
      label_en: 'El Valle Fire Station',
      numbers: ['0212-672-0175', '0212-672-0636'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_la_guaira',
      label_es: 'Bomberos La Guaira',
      label_en: 'La Guaira Fire Station',
      numbers: ['0212-332-7620', '0212-331-0445'],
      service_type: 'publico' as const,
      states: ['La Guaira'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_la_trinidad',
      label_es: 'Bomberos La Trinidad',
      label_en: 'La Trinidad Fire Station',
      numbers: ['0212-943-4361'],
      service_type: 'publico' as const,
      states: ['Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_la_urbina',
      label_es: 'Bomberos La Urbina',
      label_en: 'La Urbina Fire Station',
      numbers: ['0212-241-6641'],
      service_type: 'publico' as const,
      states: ['Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_metropolitanos',
      label_es: 'Bomberos Metropolitanos',
      label_en: 'Metropolitan Fire Station',
      numbers: ['0212-545-4545'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_miranda',
      label_es: 'Bomberos Miranda',
      label_en: 'Miranda Fire Station',
      numbers: ['0212-235-6967'],
      service_type: 'publico' as const,
      states: ['Miranda'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_plaza_venezuela',
      label_es: 'Bomberos Plaza Venezuela',
      label_en: 'Plaza Venezuela Fire Station',
      numbers: ['0212-793-0039', '0212-793-6457'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    {
      id: 'bomberos_san_bernardino',
      label_es: 'Bomberos San Bernardino',
      label_en: 'San Bernardino Fire Station',
      numbers: ['0212-577-9209'],
      service_type: 'publico' as const,
      states: ['Distrito Capital'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'CIVIS Venezuela (fuente única)',
    },
    // Private ambulance — labeled servicio privado (prompt 69 A6 / 64)
    {
      id: 'aeroambulancias',
      label_es: 'Aeroambulancias',
      label_en: 'Aeroambulancias',
      numbers: ['0212-993-2541', '0212-992-8980', '0212-992-8990', '0212-991-7940'],
      service_type: 'privado' as const,
      states: ['Distrito Capital', 'nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'DTV + CIVIS (ambos omiten etiqueta privada — Vigil la añade)',
      note_es: 'Servicio privado · puede tener costo',
      note_en: 'Private service · may have a cost',
    },
    {
      id: 'rescarven',
      label_es: 'Rescarven',
      label_en: 'Rescarven',
      numbers: ['0212-993-6911', '0212-993-6991', '0212-993-1310', '0212-993-3367'],
      service_type: 'privado' as const,
      states: ['Distrito Capital', 'nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'DTV + CIVIS',
      note_es: 'Servicio privado · puede tener costo',
      note_en: 'Private service · may have a cost',
    },
    {
      id: 'ambulancia_metropolitano',
      label_es: 'Ambulancia Metropolitano (S.A.M.)',
      label_en: 'Metropolitan Ambulance (S.A.M.)',
      numbers: ['0212-545-4545', '0212-545-4655', '0212-577-9209'],
      service_type: 'privado' as const,
      states: ['Distrito Capital', 'nacional'] as const,
      verified: true,
      verified_at: '2026-07-22',
      source: 'DTV + CIVIS',
      note_es: 'Servicio privado · puede tener costo',
      note_en: 'Private service · may have a cost',
    },
  ] as const,

  /** States surfaced first in the directory selector (La Guaira default). */
  directoryStatePriority: [
    'La Guaira',
    'Distrito Capital',
    'Yaracuy',
    'Carabobo',
    'Aragua',
    'Miranda',
    'Falcón',
  ] as const,

  psychosocialLines: [
    {
      id: 'psicolinea',
      name: 'PsicoLínea Venezuela (UCAB)',
      numbers: ['0414-121-7882', '0424-172-3981'],
      venezuela_only: true,
      verified_at: '2026-07-21',
      source: 'DTV directory + fuente independiente',
      note_es: 'Atención psicológica gratuita. Solo alcanzable desde Venezuela.',
      note_en: 'Free psychological care. Only reachable from inside Venezuela.',
    },
    {
      id: 'venemergencia',
      name: 'Grupo Venemergencia',
      numbers: [] as string[],
      venezuela_only: false,
      verified_at: '2026-07-21',
      source: 'Canales publicados de Venemergencia',
      note_es: 'Plataforma médica venezolana; efectos físicos y psicológicos — consulta sus canales publicados.',
      note_en: 'Venezuelan medical platform; physical and psychological effects — use their published channels.',
    },
  ] as const,

  /**
   * Directory sort priority — lower number = shown first.
   * Orlando confirms which orgs remain actively operating before changing ranks.
   */
  orgDisplayPriority: {
    'Cruz Roja Venezolana': 1,
    'IFRC': 2,
    'UNICEF Venezuela': 3,
    'Direct Relief': 4,
    'International Rescue Committee': 5,
    'Global Empowerment Mission': 10,
    'We Love Foundation': 11,
    'Los Topos': 12,
    'Team Rubicon': 13,
    'Samaritan': 14,
    'Convoy of Hope': 15,
    'Cadena': 16,
    'Save the Children': 17,
    'UNHCR': 18,
    'Protección Civil': 19,
    'JRS': 20,
    'International Medical Corps': 21,
    'OCHA': 90,
  } as Record<string, number>,
} as const

/** USA diaspora support layer — separate bounds from Venezuela crisis map. */
export const diasporaSupportConfig = {
  enabled: true,
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
