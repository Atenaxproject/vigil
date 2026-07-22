# Monitor and Audit Deliverables (prompts 66–68)

**Written:** 2026-07-22  
**Purpose:** Mandatory Part A answers before further `/monitor` promotion and before prompts 69–72.  
**Sources:** `docs/build-process/66-*.md`, `67-*.md`, `68-*.md`, `CHANGELOG.md`, live code (`usgs.ts`, `next.config.js` Workbox, `Navigation.tsx`, `vercel.json`, hazards adapters, `017_hazard_events.sql`).

---

## §67 — Root cause of the frozen aftershock count

### Primary layer (ONE)

**USGS query window** — crisis-pinned `starttime`.

The banner showed **"20 réplicas M4.0+"** because the USGS FDSN query used `starttime` floored at `seismic.startDate` / crisis date (`2026-06-24`). That produced a **cumulative M4+ count since the mainshock**, not a rolling “recent aftershocks” count. Once the M4+ sequence plateaued, the number stopped moving even though fetches succeeded every ~300s.

Live check recorded in archive 67 (2026-07-22): crisis-pinned M4+ = **20** (matched the UI); rolling 7d M4+ = **4**.

| Candidate | Verdict |
|---|---|
| **USGS query window** | **PRIMARY** |
| Vercel cache tag | Not primary — data refreshed; count was semantically cumulative |
| Service worker revalidation | Secondary only — see below |
| Hardcoded constant | **Not** the banner count (no `20` constant drove the live banner) |

Same pattern elsewhere:

- `/api/live-info` used hard `starttime=${crisisDate}` with no rolling window.
- Map markers used the same cumulative window (markers could still appear for new events; the **banner number** looked frozen).
- ReliefWeb **HTTP 410** looked “fine” until feed health recorded failure — different bug class (upstream), not the freeze.

### Service worker note (secondary)

Workbox caches USGS with **StaleWhileRevalidate**, `maxAge` 300s (`next.config.js` → `usgs-data`). Archive 67: SW was **not** the root cause (banner is SSR via layout; SW only affects browser USGS requests).

**Returning visitors after deploy:** devices that already have a SW may briefly serve stale USGS JSON until SWR refreshes (≤ ~5 min) or the SW updates. Resolution: wait for cache expiry / SW update cycle, or hard refresh / clear site data. No SW revision was required for the 67 fix; rolling windows are server-side.

### Fix shipped (67)

Pure rolling windows: **7d** banner M4+; **30d** map markers; `feed_health`; stale/unavailable UI; layout `force-dynamic`.

---

## §66 — Two inventories

### 1. Content inventory (dated claims)

Reconstructed from archive 66 + CHANGELOG + `content-expiry.ts` usage. Gaps called out honestly.

| Item | Location | Date | Disposition |
|---|---|---|---|
| Ria fee waiver | `/como-ayudar` transfers | expires 2026-07-15 | **Expired notice** (`noteExpired`) |
| USAR peak 2,624 / 137 / 44 | `/como-ayudar` teams | verified 2026-06-27 | **Suppressed** (>21d peak) → ReliefWeb link |
| UCV “activo el 27 de junio” | collection points | 2026-06-27 | **Suppressed** |
| GEM duplicate donation cards | page + DB | — | **Dedupe** by donation URL / name |
| RCF Cruz Roja AR/CO/HN | was top of `/como-ayudar` | — | **Moved** to search CTA → `/buscar`, `/red` |
| OFAC GL 60 | `/como-ayudar` | expires 2026-10-23 | **Kept** + expiry metadata |
| IRC matching | DB (if present) | through 2026-09-30 | **Kept**; attach expiry when edited |
| Crisis info “Actualizado: 29 junio” | `crisisInfo.updated` locales | 2026-06-29 | **Deferred** — informacion prefers live/sourced figures; static string may remain in locales |
| Infra “al 29 junio” | locales | 2026-06-29 | **Deferred** — gated by 63 on live infra rows |

**Gaps:** Full outbound URL crawl of every link was **deferred** (66). Not every locale string with a calendar date was exhaustively inventoried beyond `/como-ayudar` + the deferred crisisInfo/infra items. Visual-check proof pack for every changed route was deferred.

### 2. Route-by-route table

| Route | Status (66 audit) | Notes |
|---|---|---|
| `/` | OK after 67 | Live map; freshness fixed in 67 |
| `/buscar`, `/reportar` | OK | Core missing persons |
| `/como-ayudar` | Fixed in 66 | Expiry / suppress / relocate |
| `/informacion` | OK | Live + sourced figures (63) |
| `/estadisticas` | OK | DTV + sourced |
| `/organizaciones`, `/voluntarios`, `/intercambio` | OK | Empty CTAs from 62 |
| `/monitor` | Shipped in 68 | Global relay; **not in public nav until §68 rights clear** (see below) |
| `/prensa` | OK | Press kit (65) |
| `/regiones`, `/preparacion` | OK | Expansion |
| `/privacidad`, `/terminos`, `/privacy`, `/terms` | OK | Legal |
| Auth / mi-* claim tokens | Functional | Surface expansion in 72 |
| `/admin` | Extended | Feed health panel (67) |
| `/ayuda`, `/calendario`, `/muro`, `/red`, `/punto-de-acopio`, `/conectividad`, `/evaluacion-estructural`, `/equipo-activo`, `/necesito-ayuda`, `/donaciones`→redirect, `/noticias` | Audited at summary level | No dated-claim purge beyond 66 scope |
| Mobile dark mode | Not P0 | `colorScheme: light`; device spot-check still recommended |

---

## §68 — Cost and rights (BLOCKER for public nav link)

### 1. Added Vercel function invocations (nine cron feeds)

`vercel.json` does **not** list `/api/cron/hazards`. Scheduling is **GitHub Actions** `vigil-watch.yml`: `*/30 * * * *` → hits `/api/watch/scan` and `/api/cron/hazards`.

| Path | Schedule | Invocations / day (approx.) |
|---|---|---|
| `/api/cron/hazards` | every 30m via GHA | **~48** |
| `/api/watch/scan` | every 30m via GHA (pre-existing) | **~48** |

Each hazards invocation runs **nine adapters in one function** (USGS, GDACS, ReliefWeb, Open-Meteo, FIRMS, NHC, NWS, Tsunami, USGS Water) — that is **one** Vercel invocation per poll, not nine. External HTTP from the function is separate from Vercel billable invocations.

**Estimate:** ~48 added function invocations/day for public monitor polling (+ existing ~48 watch). Modest on Hobby if within plan limits; monitor for 429s / cron failures.

Also note: page views of `/monitor` and on-demand `pollAllHazards` fallback add user-driven invocations beyond cron.

### 2. Storage growth (`hazard_events`)

- Upsert by stable `id`; FIRMS capped (~40); NWS/GDACS filtered to high severity.
- Steady active set: on the order of **tens to low hundreds** of rows if inactive cleanup is occasional.
- Without aggressive archive of inactive IDs, unique historical rows can grow with wildfire detections and weather alerts — estimate **low hundreds to low thousands of rows/month** at current filters; each row is small (text + coords + jsonb meta). **Low Supabase storage risk** at current caps; revisit if FIRMS/NWS filters widen.

### 3. Redistribution vs consumption (feeds used by `/monitor`)

`/monitor` **republishes** headlines, severity, region, and deep links (relay cards). That is redistribution of feed-derived content, not mere private consumption.

| Feed | Consumption | Redistribution / republish on `/monitor` |
|---|---|---|
| **USGS** (EQ + Water) | OK | US gov work generally **public domain**; always deep-link + attribute |
| **NOAA NHC / Tsunami** | OK | Public domain; attribute + deep-link |
| **NWS** | OK if User-Agent identifies Vigil (in code) | Public domain; do not imply NWS endorsement |
| **Open-Meteo** | OK | Open data license — attribution; republish of derived weather codes OK with credit |
| **GDACS** | OK for situational awareness | **Caution:** agency product; republish summaries + link only; do not strip attribution or claim authorship |
| **ReliefWeb / OCHA** | Soft-fail on 410 | Terms favor attribution; **do not bulk-mirror** full reports — headlines + link only (current design) |
| **NASA FIRMS** | NRT fire hotspots | **Attribution required** (UI credit). NRT products often restrict commercial redistribution and expect credit to NASA FIRMS / LANCE; humanitarian non-commercial relay with attribution is the intended posture — **confirm NASA FIRMS redistribution terms before promoting `/monitor` in public nav** |

**Verdict for public nav:** Rights are **conditionally clear** for US gov feeds and Open-Meteo with attribution. **FIRMS (and to a lesser degree GDACS/ReliefWeb) need an explicit Orlando go-ahead** that NRT republish + attribution on a public marketing nav item is acceptable. Until that confirmation, **keep `/monitor` out of public navigation**; route remains reachable by URL when the kill switch allows.

### 4. Kill switch (no deploy)

Confirmed in code (`isMonitorPublicEnabled`):

1. Env: `VIGIL_MONITOR_PUBLIC_ENABLED=false` (Vercel env flip — no code deploy; may need redeploy only if env not hot-reloaded — prefer Studio for true no-deploy).
2. Studio / DB: `platform_settings.monitor_public_enabled = false` — **disables public `/monitor` surface without a code deploy**.

Public read of `platform_settings` is allowed (migration 017); page checks this before rendering the relay.

### Nav policy (this session)

- **Removed** `/monitor` from public `Navigation` until Orlando confirms §68.3 FIRMS/GDACS republish posture.
- Route `/monitor` remains for admin/testing when kill switch is on.

---

## Orlando remaining actions (66–68)

1. Confirm production banner shows rolling 7d M4+ (not cumulative 20).
2. Apply migrations `016_feed_health.sql`, `017_hazard_events.sql` if not applied.
3. Flip `monitor_public_enabled` in Studio to verify kill switch.
4. Confirm FIRMS CSV reachable from Vercel egress.
5. **Decide:** approve public-nav `/monitor` after reviewing FIRMS/GDACS redistribution, or leave URL-only.
6. ReliefWeb 410: investigate alternate endpoint with OCHA if reports must return.
7. Optional: full outbound link crawl; visual-check pack; suppress remaining static `crisisInfo.updated` in all locales.
