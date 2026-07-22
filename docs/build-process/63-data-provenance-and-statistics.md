# 63 — Data Provenance, Freshness, and Statistics Refresh
## REVISION 2 — supersedes the original. Two instructions in v1 were wrong; see Part 0.

**Priority:** P1 — credibility. Ship before or alongside the DTV `/plataformas` listing.
**Depends on:** 60–62 on `main` (`2652894`). Migration 014 (`ai_usage_log`) applied.
**Routing:** Normal PR.

---

## Part 0 — CORRECTIONS TO REVISION 1. Read before implementing.

**Correction A — the epicenter instruction in v1 was wrong. Do not execute it.**

v1 told you to change "San Felipe" to "Yumare." That is incorrect and would introduce an error.

There were **two shocks 39 seconds apart, with two different epicenters**:

- **Mw 7.2** — epicenter near **San Felipe, Yaracuy**
- **Mw 7.5** — epicenter near **Yumare, Yaracuy**

Confirmed by DTV's own published history-and-context document. Vigil's existing content was right; v1's correction was an over-read of USGS event titles, which reference only the mainshock. **The fix is to label each shock with its own epicenter**, not to replace one with the other. Audit every surface where the epicenter appears and make sure both events are represented correctly.

**Correction B — do not hardcode the person-search figures.**

v1 gave you static numbers to enter. Vigil already holds authenticated API access to DTV's `/api/v1`. Wire the federated figures live instead. Details in Part B2.

---

## Part A — Provenance and freshness system (build first; unchanged from v1)

Every non-live figure carries its source and date, stored with the value:

```typescript
interface SourcedFigure {
  value: number | string
  source: string          // "Asamblea Nacional" | "USGS" | "Red DTV" | "Oregon State University"
  source_url?: string
  verified_at: string     // ISO
  is_official: boolean    // government/agency figure vs independent analysis
}
```

**Display rules:**

1. Source and verification date visible on every figure. Never behind a tooltip.
2. Staleness thresholds in `crisis.config.ts`: under 7 days renders normally; 7–21 days renders with a visible "puede estar desactualizado" marker; over 21 days the figure is suppressed and replaced with a link to the live source.
3. Live-feed data (USGS, GDACS, ReliefWeb, weather, DTV API) is exempt — it carries its own fetch timestamp.
4. **Adopt DTV's timestamp pattern verbatim in placement and prominence:** a single line beneath any statistics block reading `Los datos se actualizan automáticamente cada 5 minutos · Última actualización: 21/07/2026, 11:10 p.m.` Theirs sits directly under the stats grid and it is the right pattern.

**Admin surface:** figures editable from Supabase Studio with no redeploy. Reuse the `infrastructure_status` pattern.

**If runway runs short, ship Part A alone.** A number that admits it is stale is safer than a fresh number with no expiry.

---

## Part B1 — Casualty figures (wire-sourced, manually maintained)

These come from press and official channels, not from any API. Re-verify each at implementation time and report anything that has moved.

| Figure | Value | Source | As of |
|---|---|---|---|
| Deaths | 5,119 | Official balance, Asamblea Nacional | 2026-07-18 |
| Injured | 16,740 | Jorge Rodríguez, Asamblea Nacional | 2026-07-08 |
| Without housing | 17,907 | Asamblea Nacional | 2026-07-08 |
| Displaced in transitional camps | 23,587 across 107 camps | EFE | 2026-07-20 |
| Buildings affected / destroyed | 856 / 190 | Asamblea Nacional | 2026-07-08 |
| Structures damaged, nationwide | ~59,000 | Oregon State University, satellite analysis | 2026-06-29 |

Trajectory for sanity-checking anything newer: 235 (Jun 26) → 589 → 920 → 1,943 (Jun 29) → 2,295 (Jul 1) → 3,685–3,811 (Jul 8) → 5,119 (Jul 18). A lower figure is wrong; a much higher one needs a second source.

**Editorial constraint, non-negotiable.** These originate from Venezuelan government channels, and Vigil's standing public position is that this government undercounted missing persons. Both are true. Label them **cifras oficiales**, name the issuing body, and do not present them as independently verified. Where an independent figure exists — Oregon State's structural analysis — label it as independent and show it alongside. Vigil's credibility here comes from being precise about who said what.

---

## Part B2 — Person-search figures (live, via DTV API)

**Replace the current [retired static estimate]+ "unaccounted for" figure entirely.** Its provenance is now known: it is DTV's *personas únicas* count from their June 27 press bulletin ([retired DTV Jun27 count]). It is four weeks old and, critically, it has since gone *down* — not because people were found, but because duplicates were merged.

The progression, from DTV's own bulletins and dashboard: [retired DTV Jun27 count] (Jun 27) → 64,431 (Jun 28–29) → **44,295 (Jul 21)**. Their dashboard shows **16,701 duplicates resolved, 1 pending**. Vigil is currently publishing a figure 2.3× the current value.

**Current federated values, DTV dashboard, 21/07/2026 11:10 p.m.:**

| Field | Value |
|---|---|
| Cantidad de reportes | 82,435 |
| Personas únicas (aprox.) | 44,295 |
| Aún sin contacto | 29,463 |
| Localizados | 14,832 |

**Wire these live from `/api/v1`. Do not hardcode them.**

### Critical implementation warning

**DTV publishes three different figures for the same concept across their own surfaces.** This is not a criticism of them — they are the most rigorous operation in this response — but you must not naively copy their display labels.

| Surface | Figure |
|---|---|
| Homepage | 82,435 "cantidad de reportes" · 44,295 "personas únicas" |
| `/metricas` | 44,303 labeled "Reportes totales" |
| Their `/plataformas` self-description | "56.000+ reportadas · 37.000+ sin contacto · 19.000+ localizados" |

Their `/metricas` figure labeled *reportes totales* actually tracks the homepage's *personas únicas*, not its *cantidad de reportes*. Their directory self-description matches neither and is roughly two weeks stale.

**Therefore: label Vigil's display by the API's own field definitions, not by DTV's UI labels.** Read the API schema, map each field to what it actually counts, and name it accordingly on Vigil. Document the mapping in the PR. If the API's field semantics are ambiguous, ask before shipping — do not guess.

**Attribution is mandatory and permanent.** Every one of these figures is attributed to the federated DTV network and never presented as Vigil's own data. Attribution must be visible on the same screen as the figure, not in a footnote.

---

## Part B3 — Geographic and operational breakdown (live, via API)

DTV's dashboard exposes a state-level breakdown that Vigil should mirror, since Vigil's own geographic granularity goes deeper (estado → municipio → parroquia):

| Estado | Reportes | % |
|---|---|---|
| La Guaira | 28,583 | 65% |
| Sin estado asignado | 13,014 | 29% |
| Distrito Capital | 1,020 | 2% |
| Miranda | 585 | 1% |
| Carabobo | 156 | 0% |
| Aragua | 146 | 0% |
| Zulia | 112 | 0% |
| Guárico | 102 | 0% |
| Trujillo | 94 | 0% |

**One operational finding worth surfacing prominently:** of the 14,832 located persons, **13,230 (89%) have no registered center** — located but not tied to a hospital or shelter. Only 1,599 (11%) are in hospital and 8 in a collection center. That gap is arguably the most actionable fact in the entire dataset and no platform is currently displaying it as a call to action. Surface it on `/estadisticas` with a route toward reporting a sighting or location.

Also available and worth mirroring: 89 centers and hospitals mapped (31 hospitals, 58 collection centers), 74 registered lists covering 15,341 persons.

---

## Part C — Corrections to existing content

- **Infrastructure status:** La Guaira electricity reported at 90%, not the 75% displayed. Re-check water and roads; if no current source exists, suppress under the Part A staleness rule rather than leaving stale values.
- **Epicenter:** per Correction A, label both shocks with their own epicenters. Do not replace one with the other.
- **Aftershock counts:** "430+" static and the header's "20 réplicas M4.0+" should both derive from the live USGS feed, not stored constants.

---

## Acceptance criteria

- No figure renders anywhere without source and verification date
- Staleness works: backdate a `verified_at` and confirm the marker, then the suppression
- Person-search figures pull live from `/api/v1`, with the field mapping documented in the PR
- Zero occurrences of [retired static estimate] or [retired DTV Jun27 count] anywhere in the codebase
- Both epicenters correctly represented on every surface
- Every DTV-derived figure carries visible network attribution
- Timestamp line present beneath every statistics block
- Statistics editable from Supabase Studio with no redeploy — demonstrate it
- `scripts/visual-check.mjs` proof for `/estadisticas`, `/informacion`, homepage, mobile and desktop

---

## Constraints

- Do not average, round, extrapolate, or reconcile conflicting sources into one number. Publish the better-sourced figure and say who said it.
- Do not copy DTV's UI labels. Map from API field semantics.
- Do not remove the "cifras oficiales" framing.
- Design system unchanged.

---

## Report back

Table of every figure now live: value, source, URL, verification date, and whether static or API-derived. Include the DTV API field mapping. Flag any figure found on the platform with no traceable source.
