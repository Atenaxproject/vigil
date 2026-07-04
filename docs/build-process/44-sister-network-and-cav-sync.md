# 44 — Sister Network Expansion + CAV Collection-Points Sync
## Prepared by Claude for Cursor Agent — single-pass execution
## Context: Orlando Toro / youthewave · July 2026
## Status: COMPLETED 2026-07-04

Mechanical data round: three sister platform links (`integrated: false`) and weekly CAV CSV import mirroring DTV center sync pattern.

---

## Deliverables

- `crisis.config.ts` — Venezuela Earthquake Map, Yummy SOS, Centros de Ayuda Venezuela (`integrated: false`)
- `src/lib/cav-import.ts` — CSV fetch/parse from CAV public export; geocode; `external_id` dedup
- `/api/admin/sync-cav-centers` — GET/POST, same auth as sync-dtv-centers
- `region_scope`: US (`Estados Unidos`) → `usa_diaspora`, else `venezuela`
- `map_markers`: `type=collection_point`, `source=cav`, `verified=false`
- `MapMarkerSourceBadge` — "vía Centros de Ayuda Venezuela"
- `vercel.json` cron: `0 6 * * 1` (Monday 06:00 UTC)
- `middleware.ts` rate limit for sync-cav-centers

**CSV headers (inspected):** Organización, Ciudad, Estado, País — ~285 rows, no lat/lng (Nominatim geocode on sync).

---

(Full prompt text preserved in git history; see original NEXT-PROMPT-sister-network-and-cav-sync.md commit.)
