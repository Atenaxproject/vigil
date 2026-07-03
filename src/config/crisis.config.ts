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
} as const

export type SupportedLang = (typeof CRISIS_CONFIG.supportedLangs)[number]
export type PartnerLinkType = 'translation' | 'official' | 'ngo' | 'data' | 'sister-platform'
