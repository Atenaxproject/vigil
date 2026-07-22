# 67 — Live Data Freshness: Map and Feed Diagnostic (DONE)

**Executed:** 2026-07-22  
**Priority:** P0

## Root cause (stated plainly)

The emergency banner **"20 réplicas M4.0+"** was a **crisis-pinned cumulative count**, not a frozen cache.

- USGS query used `starttime` floored at `seismic.startDate` (`2026-06-24`) while the crisis was still &lt; 30 days old.
- `/api/live-info` used a hard `starttime=${crisisDate}` with no rolling window at all.
- Live USGS check on 2026-07-22: **crisis-pinned M4+ = 20** (exact match to the frozen UI); **rolling 7d M4+ = 4**.
- Once the aftershock sequence plateaued, the cumulative count stopped changing even though fetches succeeded every 300s.
- **Map markers** used the same cumulative window — markers could still appear when new events arrived, but the banner count looked "stuck in time."
- **Not** a hardcoded constant, **not** primarily the service worker (SW only intercepts browser USGS requests; banner is SSR via layout).

Secondary issues found:
- Weather bar showed `Venezuela: —` during client hydration (null state before `/api/weather` returned). Fixed with immediate Caracas clock.
- ReliefWeb API returns **HTTP 410 Gone** for report queries (upstream) — feed health now records failure instead of looking fine.
- FUNVISIS community proxy `sismosve.rafnixg.dev` responds **200** on GET (HEAD was 405).
- Layout lacked `force-dynamic` while carrying live aftershock count — added.

## Fix

1. Pure rolling windows: **7d** for banner M4+ count; **30d** for map markers (no crisis floor).
2. `feed_health` table + `recordFeedHealth` on USGS/GDACS/ReliefWeb/Open-Meteo/DTV.
3. Stale (&gt;30m) / unavailable (&gt;2h) UI on banner + AftershockAlert with USGS deep link.
4. Admin `/admin` FeedHealthPanel (+ Studio on `feed_health`).
5. WeatherBar local Caracas clock; never ship em-dash while waiting.

## Feed audit (Part B)

| Feed | TTL | Status 2026-07-22 |
|---|---|---|
| USGS seismic | 300s | Fixed — rolling windows |
| GDACS | 600s | 200 OK |
| ReliefWeb | 3600s | **410 upstream** — recorded as failed |
| Open-Meteo | 1800s | OK; clock fixed client-side |
| FUNVISIS proxy | — | GET 200; still HTML-only / not merged |
| DTV metrics | 300s CDN | Health recorded on fetch |
| Supabase Realtime | live | Unchanged (`useRealtimeMapMarkers`) |

## Map layers (Part D)

| Layer | Data | Notes |
|---|---|---|
| Réplicas | USGS rolling 30d | Updates on refresh; ages out |
| Necesidades / Recursos / Acopio / etc. | Supabase markers | Realtime hook intact |
| Equipos Activos | rescuer_presence | Realtime |
| Refugios / Hospitales | markers by type | Empty if no rows — expected |
| SW USGS SWR | maxAge 300 | Left in place (offline AC); not root cause |

## SW note

Service worker USGS StaleWhileRevalidate **not removed**. No SW revision required for this fix. Flag if a future change alters Workbox USGS rules.

## Orlando actions

1. Apply migration `016_feed_health.sql` in Supabase.
2. Confirm production banner shows rolling 7d count (e.g. `4 réplicas M4.0+ (7d)`), not cumulative 20.
3. Investigate ReliefWeb 410 with OCHA / alternate endpoint if reports must return.
