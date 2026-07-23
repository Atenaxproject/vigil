/** Client-side view modes — presentational nav filtering only. */

export type ViewModeId =
  | 'busco_a_alguien'
  | 'necesito_ayuda'
  | 'quiero_ayudar'
  | 'soy_organizacion'
  | 'equipo_rescate'
  | 'solo_informacion'
  | 'ver_todo'

export const VIEW_MODE_STORAGE_KEY = 'vigil_view_mode'
export const MINI_GUIDE_DISMISS_PREFIX = 'vigil_mini_guide_dismissed_'

/** Routes never filtered by mode (plus /admin, /auth handled separately). */
export const ALWAYS_VISIBLE_PATHS = new Set([
  '/ayuda',
  '/preparacion', // preparedness serves every mode — visible always
  // /monitor omitted from mode-visible nav until redistribution rights cleared (Part A §68)
  '/prensa',
  '/privacidad',
  '/privacy',
  '/terminos',
  '/terms',
])

export interface ViewModeDefinition {
  id: ViewModeId
  routes: string[]
  helpSectionId: string
}

// /donaciones is RETIRED from every mode list (75 §3). This is a compliance
// position, not a UX call: YouTheWave Inc. is not incorporated, holds no
// 501(c)(3) determination and no FDACS charitable solicitation registration.
// The route file remains as a redirect to /como-ayudar. Do not re-wire it into
// navigation or any mode list without BOTH incorporation and FDACS registration.
//
// /noticias is likewise a redirect (→ /informacion) and appears in no list.

export const VIEW_MODES: ViewModeDefinition[] = [
  {
    id: 'busco_a_alguien',
    routes: ['/buscar', '/reportar', '/mis-reportes', '/red', '/estadisticas'],
    helpSectionId: 'personas-desaparecidas',
  },
  {
    id: 'necesito_ayuda',
    routes: [
      '/necesito-ayuda',
      '/reportar',
      '/mis-reportes',
      '/conectividad',
      '/servicios',
      '/informacion',
      '/',
    ],
    helpSectionId: 'mapa-necesidades',
  },
  {
    id: 'quiero_ayudar',
    routes: [
      '/voluntarios',
      '/intercambio',
      '/evaluacion-estructural',
      '/punto-de-acopio',
      '/como-ayudar',
      '/calendario',
    ],
    helpSectionId: 'voluntarios-intercambio',
  },
  {
    // Orgs are the audience for the wall, the statistics page, and the
    // collection-point registry (they hold coverage-transition authority in
    // the upcoming needs-lifecycle work) — 75 §4.
    id: 'soy_organizacion',
    routes: [
      '/organizaciones',
      '/intercambio',
      '/calendario',
      '/red',
      '/muro',
      '/estadisticas',
      '/punto-de-acopio',
    ],
    helpSectionId: 'donaciones-organizaciones',
  },
  {
    id: 'equipo_rescate',
    routes: ['/', '/equipo-activo', '/conectividad', '/necesito-ayuda', '/informacion', '/amenazas'],
    helpSectionId: 'mapa-necesidades',
  },
  {
    id: 'solo_informacion',
    routes: ['/informacion', '/estadisticas', '/red', '/muro', '/calendario', '/amenazas'],
    helpSectionId: 'conectividad-infraestructura',
  },
]

const MODE_ROUTE_MAP = new Map<ViewModeId, Set<string>>(
  VIEW_MODES.map((m) => [m.id, new Set(m.routes)])
)

/** Returns true if href should appear in nav for the given mode. */
export function isRouteVisibleForMode(href: string, mode: ViewModeId): boolean {
  if (mode === 'ver_todo') return true
  if (ALWAYS_VISIBLE_PATHS.has(href)) return true

  const allowed = MODE_ROUTE_MAP.get(mode)
  if (!allowed) return true

  // Token routes share prefix with parent flows
  if (href.startsWith('/mi-reporte/') && allowed.has('/reportar')) return true
  if (href.startsWith('/mi-intercambio/') && allowed.has('/intercambio')) return true
  if (href.startsWith('/mi-evaluacion/') && allowed.has('/evaluacion-estructural')) return true
  if (href.startsWith('/buscar/') && allowed.has('/buscar')) return true

  return allowed.has(href)
}

export function getViewModeDefinition(mode: ViewModeId): ViewModeDefinition | null {
  return VIEW_MODES.find((m) => m.id === mode) ?? null
}

export function parseStoredViewMode(value: string | null): ViewModeId | null {
  const valid: ViewModeId[] = [
    'busco_a_alguien',
    'necesito_ayuda',
    'quiero_ayudar',
    'soy_organizacion',
    'equipo_rescate',
    'solo_informacion',
    'ver_todo',
  ]
  if (value && valid.includes(value as ViewModeId)) return value as ViewModeId
  return null
}
