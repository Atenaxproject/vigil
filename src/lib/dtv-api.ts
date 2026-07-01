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
  ubicacion?: string
  estado?: string
  foto_url?: string
  localizado: boolean
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

export interface DTVMetrics {
  totalPersonas: number
  totalCentros: number
  totalListas: number
  lastUpdated: string
  source: string
  available: boolean
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

function extractPersonas(data: Record<string, unknown>): Record<string, unknown>[] {
  const raw = data.data ?? data.personas
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
}

function mapPersona(p: Record<string, unknown>): DTVPersona {
  const ubicacionRaw = p.ubicacion
  const ubicacionText =
    typeof ubicacionRaw === 'string'
      ? ubicacionRaw
      : typeof ubicacionRaw === 'object' &&
          ubicacionRaw !== null &&
          typeof (ubicacionRaw as Record<string, unknown>).texto === 'string'
        ? String((ubicacionRaw as Record<string, unknown>).texto)
        : undefined

  return {
    id: String(p.id ?? ''),
    nombre: String(p.nombre ?? p.name ?? ''),
    edad: typeof p.edad === 'number' ? p.edad : undefined,
    sexo: typeof p.sexo === 'string' ? p.sexo : undefined,
    ubicacion: ubicacionText,
    estado: typeof p.estado === 'string' ? p.estado : undefined,
    foto_url: typeof p.foto === 'string' ? p.foto : typeof p.foto_url === 'string' ? p.foto_url : undefined,
    localizado: p.estado === 'localizado' || Boolean(p.localizado),
    created_at:
      typeof p.created_at === 'string'
        ? p.created_at
        : typeof p.createdAt === 'number'
          ? new Date(p.createdAt).toISOString()
          : new Date().toISOString(),
    _source: 'dtv',
  }
}

export async function searchDTVPersonas(
  query: string,
  cursor?: string
): Promise<DTVSearchResult | null> {
  if (!DTV_BASE || !DTV_KEY) return null

  try {
    const params = new URLSearchParams({ q: query, limit: '20' })
    if (cursor) params.set('cursor', cursor)

    const res = await fetch(`${DTV_BASE}/personas?${params}`, {
      headers: dtvHeaders(),
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error('DTV API error:', res.status, res.statusText)
      return null
    }

    const data = (await res.json()) as Record<string, unknown>
    const pagination = extractPagination(data)
    const tagged = extractPersonas(data).map(mapPersona)

    return {
      data: tagged,
      pagination: {
        nextCursor: pagination.nextCursor,
        hasMore: pagination.hasMore,
        limit: pagination.limit,
        total: pagination.total,
      },
    }
  } catch (error) {
    console.error('DTV API fetch failed:', error)
    return null
  }
}

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

export async function getDTVMetrics(): Promise<DTVMetrics> {
  const fallback: DTVMetrics = {
    totalPersonas: 0,
    totalCentros: 0,
    totalListas: 0,
    lastUpdated: new Date().toISOString(),
    source: DTV_SOURCE,
    available: false,
  }

  if (!DTV_BASE || !DTV_KEY) return fallback

  try {
    const [totalPersonas, totalCentros, totalListas] = await Promise.all([
      countDTVItems('personas'),
      countDTVItems('centros'),
      countDTVItems('listas'),
    ])

    const available = totalPersonas > 0 || totalCentros > 0 || totalListas > 0

    return {
      totalPersonas,
      totalCentros,
      totalListas,
      lastUpdated: new Date().toISOString(),
      source: DTV_SOURCE,
      available,
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
