/**
 * Shared Leaflet basemap config (77 §5). CARTO Positron — muted greys, no road
 * hierarchy/label clutter, so markers carry the visual weight instead of
 * competing with default OSM styling. CARTO Basemaps require an API key.
 *
 * Read the key on the server (`CARTO_API_KEY`, or `NEXT_PUBLIC_CARTO_API_KEY`
 * via bracket access so Next cannot inline an empty build-time value). Tile
 * URLs are client-visible by nature. Never commit the key.
 *
 * Token change only: swapping the URL/attribution here updates every map;
 * marker colors, layers, and interactions are unchanged.
 */
export const CARTO_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

export function readCartoApiKey(): string | undefined {
  const server = process.env.CARTO_API_KEY?.trim()
  if (server) return server
  // Bracket access — Next.js only inlines `process.env.NEXT_PUBLIC_*` member access.
  const pub = process.env['NEXT_PUBLIC_CARTO_API_KEY']?.trim()
  return pub || undefined
}

export function buildBasemapUrl(apiKey?: string): string {
  const key = (apiKey ?? readCartoApiKey())?.trim()
  if (!key) return CARTO_TILE_URL
  return `${CARTO_TILE_URL}?key=${encodeURIComponent(key)}`
}

export function isBasemapUrl(url: string): boolean {
  return url.startsWith('https://') && url.includes('basemaps.cartocdn.com/light_all/')
}

/** Unkeyed fallback for the client bundle. Prefer a server-provided `tileUrl`. */
export const BASEMAP_URL = CARTO_TILE_URL
export const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
