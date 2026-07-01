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
  nombre?: string
  name?: string
  descripcion?: string
  lat?: number
  lng?: number
  latitud?: number
  longitud?: number
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
  if (!DTV_BASE || !DTV_KEY) return null

  try {
    const res = await fetch(`${DTV_BASE}/centros?limit=100`, {
      headers: dtvHeaders(),
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const data = (await res.json()) as Record<string, unknown>
    const raw = data.data ?? data.centros
    return Array.isArray(raw) ? (raw as DTVCentro[]) : []
  } catch {
    return null
  }
}

export function isDTVConfigured(): boolean {
  return Boolean(DTV_BASE && DTV_KEY)
}
