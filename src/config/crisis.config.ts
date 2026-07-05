// THIS IS THE ONLY FILE THAT CHANGES BETWEEN COUNTRY DEPLOYMENTS
// Swap these values + redeploy = Vigil runs for any country, any disaster

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
    hotline: '0800-7372282',
    hotlineLabel: '0800-RESCATE',
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
    {
      name: 'SOS Venezuela 2026',
      url: 'https://sosvenezuela2026.com',
      type: 'sister-platform' as const,
      slug: 'sosVenezuela2026' as const,
    },
    {
      name: 'Red Venezuela Activa',
      url: 'https://redvenezuelaactiva.com',
      type: 'sister-platform' as const,
      slug: 'redVenezuelaActiva' as const,
    },
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
  ],

  seismic: {
    startDate: '2026-06-24',
    minMagnitudeDisplay: 2.0,
    alertThresholdMag: 4.0,
    refreshIntervalMs: 300000,
  },

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
   * Emergency contacts — secondhand from sos.yummyrides.com (NOT independently verified).
   * Orlando must verify each number before treating as authoritative.
   * UI surfaces verify-before-calling language when verified === false.
   */
  emergencyContacts: [
    {
      id: 'rescate',
      label_es: '0800-RESCATE (Emergencias nacional)',
      label_en: '0800-RESCATE (National emergencies)',
      numbers: ['0800-7372282', '911'],
      carrierAccess: 'Movistar 911 · Digitel 112 · Movilnet *1 · Cantv 171',
      carrierCodes: [
        { carrier: 'Movistar', code: '911' },
        { carrier: 'Digitel', code: '112' },
        { carrier: 'Movilnet', code: '*1' },
        { carrier: 'Cantv', code: '171' },
      ],
      verified: false,
      source: 'sos.yummyrides.com (secondhand — Orlando must verify)',
    },
    {
      id: 'proteccion_civil',
      label_es: 'Protección Civil',
      label_en: 'Civil Protection',
      numbers: ['0800-5588427', '0800-266-8446', '0800-262-4368'],
      verified: false,
      source: 'sos.yummyrides.com (secondhand — Orlando must verify)',
    },
    {
      id: 'cruz_roja',
      label_es: 'Cruz Roja Venezolana',
      label_en: 'Venezuelan Red Cross',
      numbers: ['0212-578-2516', '0212-571-2411'],
      verified: false,
      source: 'sos.yummyrides.com (secondhand — Orlando must verify)',
    },
    {
      id: 'funvisis',
      label_es: 'FUNVISIS (Información sísmica)',
      label_en: 'FUNVISIS (Seismic information)',
      numbers: ['0212-257-5153', '0800-836-2567'],
      verified: false,
      source: 'sos.yummyrides.com (secondhand — Orlando must verify)',
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
    'Los Topos': 11,
    'Team Rubicon': 12,
    'Samaritan': 13,
    'Convoy of Hope': 14,
    'Cadena': 15,
    'Save the Children': 16,
    'UNHCR': 17,
    'Protección Civil': 18,
    'JRS': 19,
    'International Medical Corps': 20,
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

export type SupportedLang = (typeof CRISIS_CONFIG.supportedLangs)[number]
export type PartnerLinkType = 'translation' | 'official' | 'ngo' | 'data' | 'sister-platform'
