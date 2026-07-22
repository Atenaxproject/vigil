# 68 — Vigil Watch: Global Hazard Monitor (DONE)

**Executed:** 2026-07-22 (after 66/67)

## Shipped

### Feed adapter layer (`src/lib/hazards/`)
Nine adapters → normalized `HazardEvent` (agency-native severity, never flattened):

| Source | Adapter | Notes |
|---|---|---|
| USGS | `adapters/usgs.ts` | M4.5+ week feed |
| GDACS | `adapters/gdacs.ts` | Orange/Red only |
| ReliefWeb | `adapters/reliefweb.ts` | disasters endpoint; soft-fail on 410 |
| Open-Meteo | `adapters/open-meteo.ts` | storm-class WMO codes only |
| NASA FIRMS | `adapters/firms.ts` | VIIRS 24h CSV, FRP≥50, cap 40 |
| NOAA NHC | `adapters/nhc.ts` | wraps existing feed |
| NWS | `adapters/nws.ts` | Extreme/Severe, priority US states |
| NOAA Tsunami | `adapters/tsunami.ts` | Atom feed |
| USGS Water | `adapters/usgs-water.ts` | FL priority gauges |

Cross-source EQ clustering: USGS↔GDACS within 80km / 6h → shared `cluster_id`.

### Storage / cron
- Migration `017_hazard_events.sql` + `platform_settings.monitor_public_enabled`
- `POST/GET` `/api/cron/hazards` — `CRON_SECRET` bearer (same as dedup/watch)
- GitHub Action `vigil-watch.yml` also hits hazards poll every 30m

### Public surface `/monitor`
- Dashed-border relay cards (visually distinct from verified Vigil content)
- Attribution + official deep link on every card; no AI text; no casualties
- Kill switch: `VIGIL_MONITOR_PUBLIC_ENABLED=false` **or** Studio `platform_settings.monitor_public_enabled = false` (no deploy)

### Operator watch
- Existing `/api/watch/scan` + Resend digest retained
- Watch regions expanded: Canada wildfire belt, East/SE Asia

## Cost impact
- Added Vercel invocations: ~48/day hazards + existing 48/day watch ≈ modest Hobby load
- Storage: hazard_events rows (capped FIRMS + alerts) — low growth
- **Zero Anthropic calls** in this pipeline

## Terms / redistribution flags
- **FIRMS:** attribution required; NRT fire data — credit NASA FIRMS on UI (done in footer copy)
- **NWS:** User-Agent identifying Vigil required (already in nws.ts)
- **GDACS / USGS / NHC / Tsunami:** public feeds; always deep-link to agency (never claim authorship)

## Orlando actions
1. Apply migration `017_hazard_events.sql`
2. Set Resend DNS for digests if not done (`alerts@notify…` still optional; today uses legal contact from)
3. Flip kill switch in Studio to confirm `/monitor` disables without deploy
4. Confirm FIRMS CSV URL still reachable from Vercel egress (occasional NASA blocks)
