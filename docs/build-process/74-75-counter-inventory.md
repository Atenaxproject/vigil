# Counter Inventory — prompts 74 A2 + 75 §1

Every numeric counter, stat block, and "N results" indicator, with route, live value class, source, and disposition. Verified against live code 2026-07-22. Rule in force everywhere: **a counter shows a real non-zero value or it is not rendered.**

| Route / surface | Counter | Source | Zero-gated? | Disposition |
|---|---|---|---|---|
| `/evaluacion-estructural` | Propiedades evaluadas esta semana | `getPropertyAssessmentStats()` → `property_assessments` | ✅ suppressed at 0 | Forward-looking request state; query intact (74 A1) |
| `/evaluacion-estructural` | Profesionales voluntarios activos | same | ✅ suppressed at 0 | Suppressed permanently in favor of "request → we match you" |
| `/estadisticas` | Personas en red DTV | DTV `/personas` complete walk | ✅ `available && > 0`; **suppressed on partial walk** | Fixed 75 §1: was a 25,000 fetch-cap; now suppresses unless walk is complete |
| `/estadisticas` | Aún sin contacto | DTV `estado=sin-contacto` | ✅ | Same suppression path |
| `/estadisticas` | Localizados | DTV `estado=localizado` | ✅ | Same |
| `/estadisticas` | Centros / hospitales / listas | DTV `/centros`, `/listas` | ✅ `> 0` | Short walks, complete |
| `/estadisticas` | **Localizados sin centro** | DTV `centro` field | — | **REMOVED (75 §1d):** field is universally null, not a finding |
| `/estadisticas` | Geographic breakdown (by estado) | DTV walk | ✅ suppressed on partial | Only published from a complete, non-round enumeration |
| `/estadisticas` | Vigil personas total | `public_missing_persons` | ✅ `> 0` | OK |
| `/estadisticas` | Missing/found by estado | Supabase realtime | ✅ filters `> 0` rows | OK |
| `/organizaciones` | "N resultados" | `filtered.length` | ✅ `> 0` | OK |
| `/prensa` (PressKit) | DTV persona/centro tiles | `/api/dtv-metrics` | ✅ `available && > 0` | Reads shared cached aggregate (75 §1c) |
| `/informacion` (DtvNetworkWidget) | personas/centros/listas | `/api/dtv-metrics` | ✅ fixed 74 A2 | Was rendering literal `0`s while loading/unavailable; now skeleton + per-tile `> 0`. **Note: component is currently orphaned (not mounted).** |
| Header aftershock indicator | M4.0+ count (rolling 7d) | USGS via `getLiveAftershockTotal()` | n/a (real live value; hides when feed stale) | OK (prompt 67) |
| `/` AftershockAlert | alert banner | seismic feed | ✅ `length === 0 && !stale` → null | OK |
| `/intercambio` | match suggestion toast | `data.matchCount` | ✅ `> 0` guard | OK |
| `/voluntarios`, `/muro`, `/calendario`, `/punto-de-acopio`, `/equipo-activo` | list renders | Supabase | ✅ empty-state instead of `0` | OK — no numeric headline counters |

## Counters flagged (source concerns, per 74 A2)

- **DTV network-wide total** — was wired to `array.length` of a paginated walk that DTV **caps at 200/page** and offers **no `total`/count endpoint** (probed 2026-07-22: `/personas/count`, `/stats`, etc. all 404). Root cause fixed: the index walk now marks itself `partial` on any cap/timeout/failure and stats suppress entirely when partial. See §1 report below.
- **DTV `centro`/`hospital` field** — present in schema, **universally null** (0 of 200 sampled `estado=localizado` records populated). All derived figures removed, not reworded.
- No counter is wired to a table that is silently empty-but-expected-full other than the two `/evaluacion-estructural` counters, which are correctly suppressed.

## §1 report answers (75)

1. **Is 25.000 a cap?** No hard 25k cap, but there **is** a page cap: DTV clamps `limit` to **200** regardless of requested size, and exposes **no aggregate/count endpoint**. The old "25.000" was the enumeration total of a walk that stopped early (rate limit / page cap) and published its length as a total. Fixed by marking partial walks and suppressing.
2. **Aggregate/count endpoint?** None. Probed `/personas/count`, `/personas/stats`, `/stats`, `/estadisticas`, `/metricas`, `/resumen` — all 404. Response headers carry no `X-Total-Count`. → escalation item for the call with DTV's technical lead (Jorge): count endpoints would benefit every federating platform.
3. **`centro` field present-and-null, or absent?** Present in schema, always `null` in sampled data. Treated as unpopulated: figures removed.
4. **Load time before/after caching:** the aggregate now goes through `unstable_cache` keyed `dtv-metrics-aggregate` with a 300s revalidate matching DTV's cadence — one walk serves all visitors instead of one walk per pageview, and `/estadisticas` + `/prensa` read the same snapshot (removing the disagreement in 75 §1c). Loading renders a skeleton, never the unavailable message.
