// In-memory DTV persona search index.
//
// DTV's API has no server-side search: /personas ignores q/search/nombre and
// always returns the same cursor-paginated pages. Filtering must happen on our
// side. This module walks the full pagination once, keeps the result in module
// memory (per warm lambda), and leans on the Next.js data cache for the page
// fetches so rebuilds across lambdas mostly hit cache instead of DTV.
//
// Nothing is persisted to Vigil's database — the partnership commitment
// ("federated query only, never stored") holds; this is an ephemeral cache,
// same as the fetch caches already in use.

import { mapRawDTVPersona, type DTVPersona } from '@/lib/dtv-api'

const DTV_BASE = process.env.DTV_API_BASE_URL
const DTV_KEY = process.env.DTV_API_KEY

const INDEX_TTL_MS = 30 * 60 * 1000
const PAGE_REVALIDATE_SECONDS = 1800 // page fetches shared via Vercel data cache
const PAGE_LIMIT = '100'
const MAX_PAGES = 250

interface IndexedPersona extends DTVPersona {
  /** Pre-normalized (lowercase, diacritics stripped) name for matching. */
  _normName: string
}

interface PersonaIndex {
  builtAt: number
  personas: IndexedPersona[]
  /** True if the pagination walk hit a rate limit and the index is partial. */
  partial: boolean
}

let indexCache: PersonaIndex | null = null
let buildInFlight: Promise<PersonaIndex> | null = null

export function normalizeForSearch(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

async function fetchPage(cursor?: string, retryOn429 = true): Promise<Record<string, unknown> | null> {
  const params = new URLSearchParams({ limit: PAGE_LIMIT })
  if (cursor) params.set('cursor', cursor)

  try {
    const res = await fetch(`${DTV_BASE}/personas?${params}`, {
      headers: { 'X-Api-Key': DTV_KEY ?? '', 'Content-Type': 'application/json' },
      next: { revalidate: PAGE_REVALIDATE_SECONDS },
    })
    if (res.status === 429 && retryOn429) {
      await new Promise((r) => setTimeout(r, 2000))
      return fetchPage(cursor, false)
    }
    if (!res.ok) {
      console.error('DTV index page error:', res.status, res.statusText)
      return null
    }
    return (await res.json()) as Record<string, unknown>
  } catch (error) {
    console.error('DTV index page fetch failed:', error)
    return null
  }
}

async function buildIndex(): Promise<PersonaIndex> {
  const personas: IndexedPersona[] = []
  let cursor: string | undefined
  let pages = 0
  let partial = false

  do {
    const data = await fetchPage(cursor)
    if (!data) {
      partial = personas.length > 0
      break
    }

    const raw = data.data ?? data.personas
    const items = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : []
    for (const item of items) {
      const persona = mapRawDTVPersona(item)
      personas.push({ ...persona, _normName: normalizeForSearch(persona.nombre) })
    }

    const pagination = (data.pagination ?? {}) as Record<string, unknown>
    cursor = typeof pagination.nextCursor === 'string' ? pagination.nextCursor : undefined
    if (pagination.hasMore === false) break
    pages++
  } while (cursor && pages < MAX_PAGES)

  return { builtAt: Date.now(), personas, partial }
}

async function getIndex(): Promise<PersonaIndex | null> {
  if (!DTV_BASE || !DTV_KEY) return null

  const fresh = indexCache && Date.now() - indexCache.builtAt < INDEX_TTL_MS
  // A partial index (rate-limited walk) expires 4x sooner so it heals quickly.
  const partialFresh =
    indexCache && indexCache.partial && Date.now() - indexCache.builtAt > INDEX_TTL_MS / 4

  if (indexCache && fresh && !partialFresh) return indexCache

  if (!buildInFlight) {
    buildInFlight = buildIndex().finally(() => {
      buildInFlight = null
    })
  }

  // If we have a stale index, serve it and let the rebuild land in background.
  if (indexCache) {
    void buildInFlight.then((next) => {
      if (next.personas.length > 0) indexCache = next
    })
    return indexCache
  }

  const built = await buildInFlight
  if (built.personas.length > 0) indexCache = built
  return indexCache ?? built
}

export interface DTVIndexSearchResult {
  data: DTVPersona[]
  total: number
  indexSize: number
  partial: boolean
}

/**
 * Real name search over the cached DTV index. Accent-insensitive; every
 * whitespace-separated token must match. Ranked: exact prefix, then word
 * prefix, then substring; newest first within each rank.
 */
export async function searchDTVIndex(query: string, limit = 20): Promise<DTVIndexSearchResult | null> {
  const index = await getIndex()
  if (!index) return null

  const tokens = normalizeForSearch(query).split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { data: [], total: 0, indexSize: index.personas.length, partial: index.partial }

  const ranked: { persona: IndexedPersona; rank: number }[] = []
  for (const persona of index.personas) {
    const name = persona._normName
    if (!tokens.every((t) => name.includes(t))) continue

    let rank = 2
    if (name.startsWith(tokens[0])) rank = 0
    else if (tokens.every((t) => name.split(/\s+/).some((w) => w.startsWith(t)))) rank = 1
    ranked.push({ persona, rank })
  }

  ranked.sort(
    (a, b) => a.rank - b.rank || b.persona.created_at.localeCompare(a.persona.created_at)
  )

  return {
    data: ranked.slice(0, limit).map(({ persona }) => {
      const publicPersona = { ...persona } as Partial<IndexedPersona>
      delete publicPersona._normName
      return publicPersona as DTVPersona
    }),
    total: ranked.length,
    indexSize: index.personas.length,
    partial: index.partial,
  }
}

/** Persona count for metrics — reuses the index instead of re-walking DTV. */
export async function getDTVPersonaCount(): Promise<number> {
  const index = await getIndex()
  return index?.personas.length ?? 0
}

export interface DTVPersonaStats {
  totalPersonas: number
  sinContacto: number
  localizados: number
  localizadosSinCentro: number
  localizadosConCentro: number
  byEstado: { estado: string; count: number; percent: number }[]
  partial: boolean
}

/**
 * Aggregate person-search figures from the federated /personas index.
 * Labels must follow API field semantics (see provenance.ts DTV_FIELD_MAPPING_DOC).
 */
export async function getDTVPersonaStats(): Promise<DTVPersonaStats> {
  const empty: DTVPersonaStats = {
    totalPersonas: 0,
    sinContacto: 0,
    localizados: 0,
    localizadosSinCentro: 0,
    localizadosConCentro: 0,
    byEstado: [],
    partial: false,
  }

  const index = await getIndex()
  if (!index || index.personas.length === 0) return empty

  let localizados = 0
  let localizadosSinCentro = 0
  let localizadosConCentro = 0
  const geoCounts = new Map<string, number>()

  for (const p of index.personas) {
    if (p.localizado || p.estado === 'localizado') {
      localizados++
      if (p.has_centro) localizadosConCentro++
      else localizadosSinCentro++
    }

    const geo = p.estado_geo?.trim() || 'Sin estado asignado'
    geoCounts.set(geo, (geoCounts.get(geo) ?? 0) + 1)
  }

  const total = index.personas.length
  const sinContacto = total - localizados
  const byEstado = Array.from(geoCounts.entries())
    .map(([estado, count]) => ({
      estado,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)

  return {
    totalPersonas: total,
    sinContacto,
    localizados,
    localizadosSinCentro,
    localizadosConCentro,
    byEstado,
    partial: index.partial,
  }
}
