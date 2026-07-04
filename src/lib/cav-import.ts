import { createHash } from 'crypto'
import { sleep } from '@/lib/geocode-venezuela'
import type { RegionScope } from '@/types/vigil.types'

export const CAV_SOURCE = 'cav'
export const CAV_CSV_URL =
  'https://centrosayudavenezuela.org/wp-admin/admin-post.php?action=cav_public_export_centers_csv'

export interface CAVCenterRow {
  organizacion: string
  ciudad: string
  estado: string
  pais: string
}

/** Parse CAV public CSV (Organización, Ciudad, Estado, País). */
export function parseCAVCsv(csv: string): CAVCenterRow[] {
  const lines = csv.trim().split(/\r?\n/)
  if (lines.length < 2) return []

  const rows: CAVCenterRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    const fields = parseCsvLine(line)
    if (fields.length < 4) continue
    const [organizacion, ciudad, estado, pais] = fields
    if (!organizacion?.trim()) continue
    rows.push({
      organizacion: organizacion.trim(),
      ciudad: ciudad?.trim() ?? '',
      estado: estado?.trim() ?? '',
      pais: pais?.trim() ?? '',
    })
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

export function inferCAVRegionScope(pais: string): RegionScope {
  const normalized = pais.toLowerCase()
  if (
    normalized.includes('estados unidos') ||
    normalized.includes('united states') ||
    normalized === 'usa' ||
    normalized === 'ee.uu.' ||
    normalized === 'eeuu'
  ) {
    return 'usa_diaspora'
  }
  return 'venezuela'
}

export function buildCAVAddress(row: CAVCenterRow): string {
  const parts = [row.organizacion, row.ciudad, row.estado, row.pais].filter(Boolean)
  return parts.join(', ')
}

export function buildCAVExternalId(row: CAVCenterRow): string {
  const key = `${row.organizacion}|${row.ciudad}|${row.estado}|${row.pais}`.toLowerCase()
  const hash = createHash('sha256').update(key).digest('hex').slice(0, 16)
  return `cav-${hash}`
}

export async function fetchCAVCentersCsv(): Promise<string> {
  const res = await fetch(CAV_CSV_URL, {
    headers: { 'User-Agent': 'Vigil/1.0 humanitarian crisis platform vigil.youthewave.org' },
    next: { revalidate: 0 },
  })
  if (!res.ok) throw new Error(`CAV CSV fetch failed: ${res.status}`)
  return res.text()
}

export async function geocodeCAVAddress(
  row: CAVCenterRow,
  regionScope: RegionScope
): Promise<{ lat: number; lng: number } | null> {
  const address = buildCAVAddress(row)
  const countryCode = regionScope === 'usa_diaspora' ? 'us' : 've'
  const query = encodeURIComponent(address)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=${countryCode}`

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Vigil/1.0 humanitarian crisis platform vigil.youthewave.org',
        'Accept-Language': 'es',
      },
    })
    if (!res.ok) return null
    const data = (await res.json()) as Array<{ lat?: string; lon?: string }>
    if (!data?.length) return null
    const lat = parseFloat(data[0].lat ?? '')
    const lng = parseFloat(data[0].lon ?? '')
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null
    return { lat, lng }
  } catch (error) {
    console.error('CAV geocoding failed:', error)
    return null
  }
}

export async function getAllCAVCenters(): Promise<CAVCenterRow[]> {
  const csv = await fetchCAVCentersCsv()
  return parseCAVCsv(csv)
}

export { sleep }
