# 69 � DONE

**Executed:** 2026-07-22

# 69 — Emergency Directory Depth and Multi-Source Seismic Feed

**Priority:** P1 — both are corrections and extensions to already-shipped work. High value, low risk.
**Depends on:** 64 REV2 merged (directory structure), 67 merged (the frozen-feed root cause must be fixed before adding sources to it).
**Routing:** Normal PR. Ships `critical: true` strings.

---

## Context

CIVIS Venezuela (`civisvenezuela.com`) is running the deepest emergency directory and the most complete seismic feed in this response. Both are areas where Vigil is currently thinner than it should be, and both are cheap to close.

Two things this prompt resolves that were previously open:

- **FUNVISIS 0800-836-2567 is confirmed by a third independent source**, and CIVIS surfaces its mnemonic: **0-800-TEMBLOR**. Ship it, and use the mnemonic — it is far more memorable under stress than seven digits.
- **Protección Civil has three published numbers and they are probably all real.** Stop trying to pick one; label them by function instead. See Part A.

---

## Part A — Emergency directory depth

### A1 — Correct and expand the carrier variants

Vigil currently lists one number per carrier. CIVIS lists more, and under emergency conditions a second route per carrier matters.

| Carrier | Current in Vigil | Add |
|---|---|---|
| Cantv (fijo) | 171 | — |
| Movilnet | \*1 | **\*911** |
| Digitel | 112 | **\*112** |
| Movistar | 911 | **\*1** |

Present the national line as **VEN 9-1-1** with the carrier routes beneath it, which is how CIVIS frames it and how Venezuelan users recognize it.

### A2 — Protección Civil: label, don't choose

Three sources, three numbers, no contradiction once labeled by function:

| Label | Number | Source |
|---|---|---|
| Protección Civil — línea nacional | 0800-7248451 (0800-PCIVIL1) | Agency's own published channel |
| Protección Civil — sede Caracas | 0212-631-8662 · 0212-662-8476 · 0212-662-3205 | CIVIS Venezuela |

`0800-5588427` remains excluded — single-sourced and historically identified as 0800-LLUVIAS.

### A3 — FUNVISIS

Ship as **FUNVISIS · 0-800-TEMBLOR · 0800-836-2567**, described as the seismic and aftershock information line. Three independent sources now agree.

### A4 — Cruz Roja Venezolana

CIVIS lists **0212-571-4380**, which differs from the 0212-578-2516 / 0212-571-2411 pair already in scope. All three are plausible (switchboard versus direct lines). List all three under one entry rather than choosing; note that CIVIS is the more recent source.

### A5 — Local fire departments (the real gap)

CIVIS publishes **15 fire department numbers across Caracas and Gran Caracas, by parish**. Vigil has none. In a structural-collapse emergency, the local station is more actionable than a national line.

| Station | Number(s) |
|---|---|
| Antímano | 0212-472-2054 |
| Catia La Mar | 0212-351-9966 |
| Chacao | 0212-265-3261 |
| Del Este (Cafetal) | 0212-987-4334 · 0212-985-5060 |
| Sucre | 0212-985-3640 |
| El Cafetal | 0212-985-3640 · 0212-985-2977 |
| El Paraíso | 0212-481-0961 |
| El Valle | 0212-672-0175 · 0212-672-0636 |
| La Guaira | 0212-332-7620 · 0212-331-0445 |
| La Trinidad | 0212-943-4361 |
| La Urbina | 0212-241-6641 |
| Metropolitanos | 0212-545-4545 |
| Miranda | 0212-235-6967 |
| Plaza Venezuela | 0212-793-0039 · 0212-793-6457 |
| San Bernardino | 0212-577-9209 |

These slot into the state-structured directory from 64 REV2 Part C, under Distrito Capital and La Guaira. Source: CIVIS Venezuela, single source — mark `verified_at` accordingly and rely on the report-a-bad-number affordance from 64 Part E as the correction mechanism.

### A6 — Private ambulance services

CIVIS lists Aeroambulancias, Rescarven, and Ambulancia Metropolitano with the same numbers DTV publishes, and like DTV does not distinguish them from public lines. **Two independent platforms making the same omission is confirmation that the `service_type` field from 64 REV2 Part B is necessary, not optional.** If Vigil carries them, they are labeled `servicio privado · puede tener costo`.

### A7 — Offline guarantee

CIVIS headlines their directory: *"Disponibles sin conexión · toca para llamar."*

Verify and, if necessary, fix: the emergency numbers page must be precached by the service worker and fully functional with no network. Every number is a `tel:` link that works offline. This is the single most important page on the platform to survive connectivity loss, and it should be explicitly stated on the page that it works offline.

---

## Part B — Multi-source seismic feed

### B1 — Add EMSC

CIVIS aggregates **FUNVISIS + USGS + EMSC**. Vigil uses USGS with a FUNVISIS proxy. EMSC (`seismicportal.eu`) is free, keyless, and frequently reports European-Mediterranean and global events faster than USGS.

Add as a third source with per-record attribution, consistent with the existing DTV attribution discipline.

### B2 — Lower the magnitude threshold

Vigil's header reads "réplicas M4.0+." CIVIS displays events at **M2.6–M3.5**, hours old, and reports **1,405 total aftershocks** against Vigil's static "430+."

After a Mw 7.5, people feel M3 events and want confirmation they are not imagining it. An M4.0+ filter makes Vigil look inert to a user who just felt the ground move. Lower the display threshold to **M2.5+ within Venezuela bounds**, keep M4.0+ as a distinct highlighted tier, and drive both from the live feed rather than a stored constant.

### B3 — Match their record format

Each event shows: magnitude, distance and direction from the nearest named locality, relative time ("hace 4 h"), and source. That format is more useful than coordinates. Adopt it.

### B4 — Reconcile the aftershock total

Vigil's "430+" and header "20" are both wrong against CIVIS's 1,405. Compute the total live from the aggregated feed rather than storing it. This is a direct dependency on prompt 67 — do not add sources to a pipeline that has not been proven to refresh.

---

## Part C — Statistics correction

CIVIS publishes, attributed as **Balance oficial del gobierno · 21 de julio de 2026** — one day fresher than what prompt 63 REV2 specified, and with two figures no other platform carries:

| Figure | Value |
|---|---|
| Fallecidos | 5,346 |
| Heridos | 16,740 |
| Rescatados | 6,462 |
| Pacientes atendidos | 39,567 |
| Réplicas | 1,405 |

Update `/estadisticas` accordingly, under the same editorial constraint from 63 REV2: these are **cifras oficiales**, attributed to the issuing body, not presented as independently verified. Note that CIVIS applies exactly this framing — "Balance oficial del gobierno" — which is confirmation the approach is right.

---

## Part D — Accessibility controls

CIVIS surfaces text-size controls (A / A+ / A++) and a high-contrast toggle **directly in the navigation**, not buried in settings.

Vigil claims WCAG AA compliance. Expose the controls: a text-size stepper and a high-contrast mode, persisted in localStorage, reachable from the main nav on mobile and desktop.

**Constraint:** high contrast is an accessibility mode, not a dark mode. Standing constraint #7 stands — this must not become a route to reintroducing dark mode. Implement as a high-contrast light variant that increases contrast ratios within the existing light palette.

---

## Acceptance criteria

- All carrier variants present, national line framed as VEN 9-1-1
- Protección Civil listed with both national and Caracas entries, correctly labeled
- FUNVISIS ships with the 0-800-TEMBLOR mnemonic
- 15 fire stations live under the correct states in the 64 REV2 structure
- Every private service carries `servicio privado` labeling
- Emergency numbers page verified functional with network disabled — demonstrate it
- EMSC integrated with per-record source attribution
- Display threshold at M2.5+, aftershock total computed live
- Event format shows magnitude, distance from named locality, relative time, source
- Statistics updated to the 21 July official balance with attribution
- Accessibility controls live and persisted; no dark mode introduced
- All 8 locales
- `scripts/visual-check.mjs` proof for `/informacion`, the map, `/estadisticas`

---

## Constraints

- Do not add EMSC or lower the threshold until prompt 67's root cause is fixed and verified. Adding sources to a broken pipeline hides the breakage.
- Fire station numbers are single-sourced. Mark them accordingly and do not present them with the same confidence as the multi-sourced national lines.
- Do not scrape CIVIS. These numbers were read from a public page for verification; the platform relationship should be an outreach conversation, not a data dependency.

---

## Report back

Confirm the offline behavior of the emergency page with a demonstrated test. Flag any discrepancy found between EMSC, USGS, and FUNVISIS for the same event — divergence between sources is expected and should be surfaced honestly rather than reconciled away.
