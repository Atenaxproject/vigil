// Desaparecidos Terremoto Venezuela API client
// Read-only, federated query — no data stored in Vigil's database
// Attribution required on all results

const DTV_BASE = process.env.DTV_API_BASE_URL
const DTV_KEY = process.env.DTV_API_KEY

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
  }
}

export interface DTVCentro {
  id?: string
  nombre?: string
  name?: string
  descripcion?: string
  tipo?: string
  lat?: number
  lng?: number
  latitud?: number
  longitud?: number
}

export interface DTVPagination {
  nextCursor?: string
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

  const cursorCandidates = [pagination.nextCursor, pagination.next, pagination.cursor]
  const nextCursor = cursorCandidates.find((v): v is string => typeof v === 'string')

  return { nextCursor, total }
}

function extractCentros(data: Record<string, unknown>): DTVCentro[] {
  const raw = data.data ?? data.centros
  return Array.isArray(raw) ? (raw as DTVCentro[]) : []
}

export function inferCentroMarkerType(centro: DTVCentro): 'hospital' | 'collection_point' {
  const text = `${centro.nombre ?? centro.name ?? ''} ${centro.descripcion ?? ''} ${centro.tipo ?? ''}`.toLowerCase()
  if (/hospital|clinic|clínica|médic|salud|centro de salud|urgencias/.test(text)) {
    return 'hospital'
  }
  return 'collection_point'
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

function extractPersonas(data: Record<string, unknown>): Record<string, unknown>[] {
  const raw = data.data ?? data.personas
  return Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
}

function mapPersona(p: Record<string, unknown>): DTVPersona {
  return {
    id: String(p.id ?? ''),
    nombre: String(p.nombre ?? p.name ?? ''),
    edad: typeof p.edad === 'number' ? p.edad : undefined,
    sexo: typeof p.sexo === 'string' ? p.sexo : undefined,
    ubicacion: typeof p.ubicacion === 'string' ? p.ubicacion : undefined,
    estado: typeof p.estado === 'string' ? p.estado : undefined,
    foto_url: typeof p.foto_url === 'string' ? p.foto_url : undefined,
    localizado: Boolean(p.localizado),
    created_at: typeof p.created_at === 'string' ? p.created_at : new Date().toISOString(),
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
    const pagination = (data.pagination ?? {}) as DTVSearchResult['pagination']
    const tagged = extractPersonas(data).map(mapPersona)

    return {
      data: tagged,
      pagination: {
        nextCursor: pagination.nextCursor,
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
    const params: Record<string, string> = { limit: '100' }
    if (cursor) params.cursor = cursor

    const data = await fetchDTVPage('centros', params)
    if (!data) break

    allCentros.push(...extractCentros(data))
    cursor = extractPagination(data).nextCursor
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

  const [personasRes, centrosRes, listasRes] = await Promise.allSettled([
    fetchDTVPage('personas', { limit: '1' }),
    fetchDTVPage('centros', { limit: '1' }),
    fetchDTVPage('listas', { limit: '1' }),
  ])

  const personas =
    personasRes.status === 'fulfilled' && personasRes.value ? extractPagination(personasRes.value) : null
  const centros =
    centrosRes.status === 'fulfilled' && centrosRes.value ? extractPagination(centrosRes.value) : null
  const listas =
    listasRes.status === 'fulfilled' && listasRes.value ? extractPagination(listasRes.value) : null

  const available = Boolean(personas || centros || listas)

  return {
    totalPersonas: personas?.total ?? 0,
    totalCentros: centros?.total ?? 0,
    totalListas: listas?.total ?? 0,
    lastUpdated: new Date().toISOString(),
    source: DTV_SOURCE,
    available,
  }
}

export function isDTVConfigured(): boolean {
  return Boolean(DTV_BASE && DTV_KEY)
}

export { DTV_SOURCE }
