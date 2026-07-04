# 45 — Fix: Map/Search Separation + Mode Filtering Completion
## Prepared by Claude for Cursor Agent
## Context: Orlando Toro / youthewave · July 2026
## Status: COMPLETED 2026-07-04

Fix round correcting layout wiring from prompts 43 and earlier map/search specs.

---

## Deliverables

### Task 1 — Separate Mapa de Crisis from Buscar Persona

- **`/` (Mapa de Crisis)** — map-only layout; removed `MissingPersonSearch` and `RecentMissingFeed` from home route.
- **New map layer "Personas Desaparecidas"** — `MissingPersonsLayer.tsx` with jittered `approx_last_seen_*` coords from `public_missing_persons`; pin popup links to `/buscar/[id]`.
- **Migration `012_missing_persons_map_coords.sql`** — adds `approx_last_seen_lat/lng` to `missing_persons`, backfills deterministic jitter, extends `public_missing_persons` view with `parroquia` + approx coords.
- **`/buscar`** — full-width search (`max-w-5xl`), `GeoSelect` municipio/parroquia filters, responsive 2-column results grid; DTV federation unchanged.
- **`getMissingPersonsForMap()`** in `src/lib/data.ts` — server fetch for map layer pins.

### Task 2 — Mode-based nav filtering

- **`useViewMode`** — synchronous `localStorage` read on init so mode is available before hydration completes.
- **`Navigation.tsx`** — removed `!modeReady` bypass that showed all 18 items; always applies `isRouteVisibleForMode(href, mode)` (except `alwaysVisible` items).

### Files changed

- `src/app/page.tsx`, `src/app/buscar/page.tsx`
- `src/components/map/CrisisMap.tsx`, `MapLayers.tsx`, `MissingPersonsLayer.tsx`
- `src/components/missing/MissingPersonSearch.tsx`
- `src/components/layout/Navigation.tsx`
- `src/hooks/useViewMode.ts`
- `src/lib/data.ts`, `src/types/vigil.types.ts`
- `src/app/api/missing-persons/search/route.ts`, `submit/route.ts`
- `supabase/migrations/012_missing_persons_map_coords.sql`
- i18n: `map.layers.missingPersons*` in all 8 locales

### Guardrails respected

- DTV federation (`dtv-api.ts`) untouched
- CAV sync untouched
- Diaspora hub toggle untouched
- Mode taxonomy unchanged

### QA checklist

- [ ] `/` — zero search inputs; map full width; Personas Desaparecidas layer toggles
- [ ] `/buscar` — no Leaflet/map; name + photo search; geo filters; DTV attribution
- [ ] Mode switcher — sidebar count changes per mode; `/ayuda` always visible; `ver_todo` shows all

### Rollback

- Revert commit; run down migration only if `012` was applied to production Supabase (drop approx columns + recreate view without them).
