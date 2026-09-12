/**
 * Shared Leaflet basemap config (77 §5). CARTO Positron — muted greys, no road
 * hierarchy/label clutter, so markers carry the visual weight instead of
 * competing with default OSM styling. CARTO Basemaps require
 * `NEXT_PUBLIC_CARTO_API_KEY` (set in Vercel / `.env.local`; never commit the
 * value). Tile URLs are client-visible by nature. Attribution credits both
 * CARTO and OpenStreetMap per CARTO's terms.
 *
 * Token change only: swapping the URL/attribution here updates every map;
 * marker colors, layers, and interactions are unchanged.
 */
const CARTO_TILE_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

// Direct member access so Next.js inlines this at `next build`. A default
// parameter (`apiKey = process.env.NEXT_PUBLIC_…`) is not replaced, which left
// production tiles unkeyed after the env was set.
const CARTO_API_KEY = process.env.NEXT_PUBLIC_CARTO_API_KEY

export function buildBasemapUrl(apiKey?: string): string {
  const key = (apiKey ?? CARTO_API_KEY)?.trim()
  if (!key) return CARTO_TILE_URL
  return `${CARTO_TILE_URL}?key=${encodeURIComponent(key)}`
}

export const BASEMAP_URL = buildBasemapUrl(CARTO_API_KEY)
export const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
