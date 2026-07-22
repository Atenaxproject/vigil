// Desaparecidos Terremoto Venezuela API client
// Read-only, federated query — no data stored in Vigil's database
// Attribution required on all results

const DTV_BASE = process.env.DTV_API_BASE_URL
const DTV_KEY = process.env.DTV_API_KEY
const DTV_PAGE_LIMIT = '100'

function dtvHeaders(): Record<string, string> {
  return {
    'X-Api-Key': DTV_KEY || '',
    'Content-Type': 'application/json',
  }
}

export interface DTVPersona {
  id: string
  nombre: string
  edad?: number
  sexo?: string
  /** Free-text location from ubicacion.texto */
  ubicacion?: string
  /**
   * Contact-status field from API `estado` (e.g. sin-contacto | localizado).
   * NOT geographic — see estado_geo / DTV_FIELD_MAPPING_DOC in provenance.ts.
   */
  estado?: string
  /** Geographic state from ubicacion.estado */
  estado_geo?: string
  municipio?: string
  parroquia?: string
  foto_url?: string
  localizado: boolean
  /** True when API centro is non-null */
  has_centro: boolean
  created_at: string
  _source: 'dtv'
}

export interface DTVSearchResult {
  data: DTVPersona[]
  pagination: {
    nextCursor?: string
    total?: number
    hasMore?: boolean
    limit?: number
  }
}

export interface DTVCentro {
  id?: string
  nombre?: string
  name?: string
  descripcion?: string
  tipo?: string
  ubicacion?: string
  telefono?: string | null
  lat?: number
  lng?: number
  latitud?: number
  longitud?: number
  createdAt?: number
  updatedAt?: number
}

export interface DTVPagination {
  nextCursor?: string
  hasMore?: boolean
  limit?: number
  total?: number
}

export interface DTVEstadoBreakdown {
  estado: string
  count: number
  percent: number
}

export interface DTVMetrics {
  /** GET /personas record count (unique federated persons — not "reportes"). */
  totalPersonas: number
  /** persona.estado === 'sin-contacto' */
  sinContacto: number
  /** persona.estado === 'localizado' */
  localizados: number
  /** localizado && centro == null */
  localizadosSinCentro: number
  localizadosConCentro: number
  totalCentros: number
  totalHospitales: number
  totalCentrosAcopio: number
  totalListas: number
  byEstado: DTVEstadoBreakdown[]
  lastUpdated: string
  source: string
  available: boolean
  /** Documented so UI never copies DTV homepage label collisions. */
  fieldMapping: {
    totalPersonas: string
    sinContacto: string
    localizados: string
    estadoGeo: string
  }
}

const DTV_SOURCE = 'desaparecidosterremotovenezuela.com'
const DTV_REVALIDATE_SECONDS = 300

function extractPagination(data: Record<string, unknown>): DTVPagination {
  const pagination = (data.pagination ?? data.meta ?? {}) as Record<string, unknown>
  const nested = (pagination.pagination ?? {}) as Record<string, unknown>

  const totalCandidates = [
    pagination.total,
    pagination.totalCount,
    pagination.totalItems,
    pagination.total_records,
    nested.total,
    data.total,
    data.totalCount,
    data.count,
  ]

  const total = totalCandidates.find((v): v is number => typeof v === 'number')

  const cursorCandidates = [pagination.nextCursor, pagination.next, pagination.cursor, data.nextCursor]
  const nextCursor = cursorCandidates.find((v): v is string => typeof v === 'string')

  const hasMore = typeof pagination.hasMore === 'boolean' ? pagination.hasMore : undefined
  const limit = typeof pagination.limit === 'number' ? pagination.limit : undefined

  return { nextCursor, hasMore, limit, total }
}

function extractCentros(data: Record<string, unknown>): DTVCentro[] {
  const raw = data.data ?? data.centros
  return Array.isArray(raw) ? (raw as DTVCentro[]) : []
}

function extractListItems(data: Record<string, unknown>): unknown[] {
  const raw = data.data ?? data.personas ?? data.listas ?? data.items
  return Array.isArray(raw) ? raw : []
}

export function inferCentroMarkerType(centro: DTVCentro): 'hospital' | 'collection_point' {
  const text = `${centro.nombre ?? centro.name ?? ''} ${centro.descripcion ?? ''} ${centro.tipo ?? ''}`.toLowerCase()
  if (/hospital|clinic|clínica|médic|salud|centro de salud|urgencias/.test(text)) {
    return 'hospital'
  }
  return 'collection_point'
}

export function inferCentroCategory(centro: DTVCentro): 'medical' | 'other' {
  return inferCentroMarkerType(centro) === 'hospital' ? 'medical' : 'other'
}

export function getCentroAddress(centro: DTVCentro): string | null {
  const address =
    (typeof centro.ubicacion === 'string' ? centro.ubicacion : null) ||
    centro.descripcion ||
    centro.nombre ||
    centro.name

  return address?.trim() ? address.trim() : null
}

async function fetchDTVPage(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<Record<string, unknown> | null> {
  if (!DTV_BASE || !DTV_KEY) return null

  const search = new URLSearchParams(params)
  try {
    const res = await fetch(`${DTV_BASE}/${endpoint}?${search}`, {
      headers: dtvHeaders(),
      next: { revalidate: DTV_REVALIDATE_SECONDS },
    })
    if (!res.ok) {
      console.error(`DTV API error (${endpoint}):`, res.status, res.statusText)
      return null
    }
    return (await res.json()) as Record<string, unknown>
  } catch (error) {
    console.error(`DTV API fetch failed (${endpoint}):`, error)
    return null
  }
}

/** Count items by walking cursor pagination — DTV does not expose pagination.total. */
export async function countDTVItems(endpoint: string): Promise<number> {
  if (!DTV_BASE || !DTV_KEY) return 0

  let total = 0
  let cursor: string | undefined

  do {
    const params: Record<string, string> = { limit: DTV_PAGE_LIMIT }
    if (cursor) params.cursor = cursor

    const data = await fetchDTVPage(endpoint, params)
    if (!data) break

    total += extractListItems(data).length

    const pagination = extractPagination(data)
    cursor = pagination.nextCursor

    if (pagination.hasMore === false) break
  } while (cursor)

  return total
}

export function mapRawDTVPersona(p: Record<string, unknown>): DTVPersona {
  return mapPersona(p)
}

function mapPersona(p: Record<string, unknown>): DTVPersona {
  const ubicacionRaw = p.ubicacion
  let ubicacionText: string | undefined
  let estadoGeo: string | undefined
  let municipio: string | undefined
  let parroquia: string | undefined

  if (typeof ubicacionRaw === 'string') {
    ubicacionText = ubicacionRaw
  } else if (typeof ubicacionRaw === 'object' && ubicacionRaw !== null) {
    const u = ubicacionRaw as Record<string, unknown>
    if (typeof u.texto === 'string') ubicacionText = u.texto
    if (typeof u.estado === 'string') estadoGeo = u.estado
    if (typeof u.municipio === 'string') municipio = u.municipio
    if (typeof u.parroquia === 'string') parroquia = u.parroquia
  }

  const estadoContacto = typeof p.estado === 'string' ? p.estado : undefined
  const localizado = estadoContacto === 'localizado' || Boolean(p.localizado)
  const hasCentro = p.centro != null && p.centro !== ''

  return {
    id: String(p.id ?? ''),
    nombre: String(p.nombre ?? p.name ?? ''),
    edad: typeof p.edad === 'number' ? p.edad : undefined,
    sexo: typeof p.sexo === 'string' ? p.sexo : undefined,
    ubicacion: ubicacionText,
    estado: estadoContacto,
    estado_geo: estadoGeo,
    municipio,
    parroquia,
    foto_url: typeof p.foto === 'string' ? p.foto : typeof p.foto_url === 'string' ? p.foto_url : undefined,
    localizado,
    has_centro: hasCentro,
    created_at:
      typeof p.created_at === 'string'
        ? p.created_at
        : typeof p.createdAt === 'number'
          ? new Date(p.createdAt).toISOString()
          : new Date().toISOString(),
    _source: 'dtv',
  }
}

// NOTE: DTV's /personas endpoint has NO server-side search — q/search/nombre
// are silently ignored and the same first page comes back for any query
// (verified 2026-07-05). Name search runs against the cached index in
// src/lib/dtv-index.ts instead. Do not reintroduce a q= passthrough here.

export async function identifyByPhotoDTV(
  photoBase64: string,
  mimeType: string
): Promise<DTVPersona[] | null> {
  if (!DTV_BASE || !DTV_KEY) return null

  try {
    const res = await fetch(`${DTV_BASE}/identificar`, {
      method: 'POST',
      headers: dtvHeaders(),
      body: JSON.stringify({
        foto: photoBase64,
        tipo: mimeType,
      }),
    })

    if (!res.ok) return null

    const data = (await res.json()) as Record<string, unknown>
    const raw = data.data ?? data.matches ?? data.resultados
    const results = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []

    return results.map(mapPersona)
  } catch (error) {
    console.error('DTV identify failed:', error)
    return null
  }
}

export async function getDTVCentros(): Promise<DTVCentro[] | null> {
  const all = await getAllDTVCentros()
  return all.length ? all : null
}

export async function getAllDTVCentros(): Promise<DTVCentro[]> {
  if (!DTV_BASE || !DTV_KEY) return []

  const allCentros: DTVCentro[] = []
  let cursor: string | undefined

  do {
    const params: Record<string, string> = { limit: DTV_PAGE_LIMIT }
    if (cursor) params.cursor = cursor

    const data = await fetchDTVPage('centros', params)
    if (!data) break

    allCentros.push(...extractCentros(data))

    const pagination = extractPagination(data)
    cursor = pagination.nextCursor
    if (pagination.hasMore === false) break
  } while (cursor)

  return allCentros
}

const EMPTY_FIELD_MAPPING = {
  totalPersonas: 'GET /personas item count',
  sinContacto: "persona.estado === 'sin-contacto'",
  localizados: "persona.estado === 'localizado'",
  estadoGeo: 'persona.ubicacion.estado',
} as const

export async function getDTVMetrics(): Promise<DTVMetrics> {
  const fallback: DTVMetrics = {
    totalPersonas: 0,
    sinContacto: 0,
    localizados: 0,
    localizadosSinCentro: 0,
    localizadosConCentro: 0,
    totalCentros: 0,
    totalHospitales: 0,
    totalCentrosAcopio: 0,
    totalListas: 0,
    byEstado: [],
    lastUpdated: new Date().toISOString(),
    source: DTV_SOURCE,
    available: false,
    fieldMapping: { ...EMPTY_FIELD_MAPPING },
  }

  if (!DTV_BASE || !DTV_KEY) return fallback

  try {
    // Persona stats from cached index (avoids re-walking /personas on every call).
    // Centros/listas remain short walks (1–2 pages).
    const { getDTVPersonaStats } = await import('@/lib/dtv-index')
    const [personaStats, centros, totalListas] = await Promise.all([
      getDTVPersonaStats(),
      getAllDTVCentros(),
      countDTVItems('listas'),
    ])

    let totalHospitales = 0
    let totalCentrosAcopio = 0
    for (const c of centros) {
      if (inferCentroMarkerType(c) === 'hospital') totalHospitales++
      else totalCentrosAcopio++
    }
    const totalCentros = centros.length

    const available =
      personaStats.totalPersonas > 0 || totalCentros > 0 || totalListas > 0

    return {
      totalPersonas: personaStats.totalPersonas,
      sinContacto: personaStats.sinContacto,
      localizados: personaStats.localizados,
      localizadosSinCentro: personaStats.localizadosSinCentro,
      localizadosConCentro: personaStats.localizadosConCentro,
      totalCentros,
      totalHospitales,
      totalCentrosAcopio,
      totalListas,
      byEstado: personaStats.byEstado,
      lastUpdated: new Date().toISOString(),
      source: DTV_SOURCE,
      available,
      fieldMapping: { ...EMPTY_FIELD_MAPPING },
    }
  } catch (error) {
    console.error('DTV metrics count failed:', error)
    return fallback
  }
}

export function isDTVConfigured(): boolean {
  return Boolean(DTV_BASE && DTV_KEY)
}

export { DTV_SOURCE }
