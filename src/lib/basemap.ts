/**
 * Shared Leaflet basemap config (77 §5). CARTO Positron — muted greys, no road
 * hierarchy/label clutter, so markers carry the visual weight instead of
 * competing with default OSM styling. Free, no API key. Attribution credits
 * both CARTO and OpenStreetMap per CARTO's terms.
 *
 * Token change only: swapping the URL/attribution here updates every map;
 * marker colors, layers, and interactions are unchanged.
 */
export const BASEMAP_URL = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
export const BASEMAP_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
