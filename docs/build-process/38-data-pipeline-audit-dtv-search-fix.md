# 38 — Data Pipeline Audit + DTV Search Fix

**Date:** 2026-07-05

Full production audit of every data pipeline, triggered before the v4 outreach
send (every letter points recipients at the platform).

## Audit results

### APIs (production, vigil.youthewave.org)

| Endpoint | Status | Notes |
|---|---|---|
| `/api/live-info` | ✅ | USGS + GDACS + ReliefWeb flowing |
| `/api/weather` | ✅ | Open-Meteo, Caracas + La Guaira |
| `/api/news-rss` | ✅ | RSS tier populated |
| `/api/dtv-metrics` | ✅ (was hammering DTV — fixed) | |
| `/api/missing-persons/search` | ❌ **broken → fixed** | see below |
| `/api/events` | ⚠️ empty | 0 rows in events table — content, not code |
| `/api/pfif` | ✅ but empty | 0 Vigil-own missing persons records |

### Database row counts (2026-07-05)

- `public_missing_persons`: **0** — all real search value is the DTV federation
- `map_markers`: 40 (27 hospitals + 3 collection points from DTV sync + 10 other)
- `organizations`: **26, all verified** (outreach letters said 17 — understated)
- `events`: 0 · `community_wall`: 0 · `volunteers`: 1 · `infrastructure_status`: 4

## The DTV search bug (critical, was live)

**DTV's API has no server-side search.** `/personas?q=maria`, `?search=`,
`?nombre=`, `?filter=` are all silently ignored — the same cursor-paginated
first page comes back for any query. There is no `/buscar` endpoint (404).
Vigil was therefore displaying DTV's unfiltered first page as "search results"
for every query — searching "maria" showed "Jesus sabala".

**Second bug (root cause of intermittent `dtvAvailable: false`):**
`/api/dtv-metrics` walked ALL DTV pagination (~230 pages across
personas/centros/listas) as often as every 30s (`s-maxage=30`), tripping DTV's
429 rate limit, which then randomly killed search fetches for everyone.
Measured: full personas walk = 116 pages / ~15.5s before 429.

## The fix — `src/lib/dtv-index.ts`

- In-memory persona index per warm lambda, TTL 30 min, single-flight rebuild;
  page fetches use `next.revalidate: 1800` so rebuilds across lambdas hit the
  Vercel data cache instead of DTV. 429 → 2s backoff + one retry; a partial
  (rate-limited) index expires 4× sooner so it heals.
- Accent-insensitive (`NFD` + combining-char strip), multi-token AND matching,
  ranked: exact prefix > word prefix > substring, newest first within rank.
- Search route: `maxDuration = 60` (cold build), returns `dtvMatchTotal` +
  `dtvIndexSize`. Stale index is served while a background rebuild lands.
- `getDTVMetrics` personas count now reuses the index (no more full walk per
  metrics call); metrics cache raised to `s-maxage=300, swr=3600`.
- Nothing persisted to Vigil's DB — the partnership promise holds; README's
  Data Partnership section updated to describe the cache honestly.

**Verified locally against the real DTV API:** cold search 15.1s, warm 0.5s,
"maria" → 487 matches (first: "María corro"), "maría" == "maria" (487 == 487),
index = 12,000 records.

## Honesty corrections (numbers)

DTV's public API exposes **~12,000** person records; the hardcoded
"55,891+ registros" claim (4 i18n keys × 8 locales + 3 README spots + repo
description) overstated what Vigil can actually search. All replaced with
honest phrasing; live counts continue to come from `/api/dtv-metrics`. Three
locales' DTV strings were also still in English (it/fr/pt/zh/de/ru) — now
translated.

**For outreach (VIGIL-OUTREACH-SEND-PACKAGE-V4.md):** letters claiming
"55,000+ records searchable" should say "federated with a partner platform
reporting 55,000+ citizen reports (~12,000 searchable via their public API)"
— or verify the API/site gap with DTV first. "17 verified orgs" can be
upgraded to **26 verified organizations** (production count).

## Remaining content gaps (not code)

- `events` table empty → `/calendario` shows empty state
- `community_wall` empty → `/muro` shows empty state
- Vigil-own missing persons: 0 — expected pre-adoption; federation carries it
