# 70 � DONE

**Executed:** 2026-07-22

# 70 — Services Status and Rain-Driven Hazard Prediction

**Priority:** P2 — but strategically the highest-value feature work remaining.
**Depends on:** 66 (audit complete), 67 (feed pipeline proven), 69 (seismic sources consolidated).
**Routing:** Two PRs. Part A and Part B are independent and should not be merged together.

---

## Why this exists

Vigil is a platform about an event that is receding. Prompt 66 is cleaning up decayed content — expired fee waivers, 25-day-old rescue-team counts, collection points last verified in June. That decay is a symptom: a crisis-only platform has no reason for anyone to open it once the crisis stops being news, so nothing keeps it current.

CIVIS Venezuela solved this deliberately. Their framing: *"Gratis y sin conexión — en la emergencia y en el día a día."* They built features people use on an ordinary Tuesday, which means the platform stays alive, the community keeps reporting, and the data stays fresh without a curator.

This prompt takes the two most valuable instances of that. Neither competes with anything Vigil already does; both make the platform useful past the emergency.

---

## PART A — Services status (`/servicios`)

### Concept

Community-reported status of essential services, by zone: **luz, agua, gasolina, gas, señal.** CIVIS covers 28 cities and regions. A user opens it to answer an ordinary question — is there power in Catia La Mar right now, is there gasoline in Valencia — and in doing so keeps the dataset current for everyone else.

For post-earthquake Venezuela, where infrastructure is degraded and restoration is uneven, this is genuinely useful daily. It is also the highest-signal early indicator Vigil could have: a sudden collapse in reported service across a zone is often the first sign of a new event, before any official feed reports anything.

### Data model

```
service_reports
  zone_id           -- estado/municipio, reuse existing geography
  service_type      -- electricidad | agua | gasolina | gas | senal
  status            -- disponible | intermitente | sin_servicio
  reported_at
  reporter_hash     -- SHA-256 IP hash, consistent with existing pattern
  confidence        -- derived, see below
```

**Aggregation:** current status per zone per service is computed from recent reports, not from the newest single report. A single contrarian report must not flip a zone. Require a minimum report count within a rolling window before displaying a status, and decay confidence as reports age — a zone with no reports in 12 hours shows "sin datos recientes," never a stale status presented as current.

This is the same discipline as prompt 63's staleness rule, applied to crowd-sourced data.

### Reporting flow

One screen, no account, three taps: pick your zone, pick the service, pick the status. Rate-limited on the existing IP-hash pattern. It must be faster than opening a messaging app to ask a neighbor, or nobody will use it.

### Display

A zone selector defaulting to the user's last choice, persisted locally. Five service icons with current status and last-report time. A national grid view showing which zones are worst affected.

**No AI anywhere in this feature.** It is community data plus arithmetic. Adding Claude here costs money against the cap prompt 61 protects and adds nothing.

### Abuse considerations

Reported infrastructure status is a target for manipulation — false "gasolina disponible" reports send people on wasted trips during a fuel shortage, which is a real cost to a real person. Mitigations: the minimum-report threshold above, per-hash rate limiting, admin visibility into report volume per zone, and a kill switch for the whole feature. Surface volume anomalies to the admin view.

---

## PART B — Rain-driven landslide and flood risk (`/amenazas`)

### Why this specifically

CIVIS runs slide and flood risk prediction driven by rainfall. Of everything surveyed across six platforms, this is the most locally intelligent feature built by anyone — and the reason is historical.

In December 1999, the Vargas tragedy killed tens of thousands when saturated slopes above the coast collapsed after sustained rain. **Vargas is La Guaira.** Same state, same terrain, same coastal mountain face — and it is where 65% of the currently reported missing persons are.

A Mw 7.5 earthquake fractures and destabilizes exactly that slope material. Rain on freshly destabilized slopes is the compounding hazard, and it is the most probable next mass-casualty event in this response. Nobody except CIVIS is watching it.

### Scope — read this carefully

**Vigil relays risk indicators. Vigil does not issue warnings and does not forecast.**

This is the same boundary as prompt 68 Part E and it is harder to hold here, because the output looks like a prediction. Implementation must make it structurally impossible to read as an official warning:

- Display **observed and forecast rainfall** against terrain and slope data, plus **official INAMEH and Protección Civil advisories** where they exist
- Present as **conditions**, never as a Vigil-issued alert level: "Lluvia acumulada alta en zona de ladera — consulta INAMEH" rather than "Alto riesgo de deslizamiento"
- Every screen links to INAMEH and Protección Civil as the authoritative sources
- Where an official advisory exists, it leads and Vigil's data is supporting context
- **No Vigil-generated risk score, index, or color-coded alert level.** If a scale is displayed, it is an official agency's own scale, attributed

### Data sources — all free, all keyless

| Source | Provides |
|---|---|
| Open-Meteo | Observed and forecast precipitation. **Already integrated** |
| INAMEH | Venezuelan official hydrometeorology and advisories |
| USGS / SRTM elevation | Slope and terrain gradient |
| NASA GPM / IMERG | Satellite precipitation where ground data is sparse |
| Copernicus EMS | Flood mapping activations where they exist |

Start with Open-Meteo, which is already in the stack. Accumulated rainfall over 24, 48, and 72 hours against slope gradient is the core signal and it is achievable with what Vigil already consumes.

### Display

Map layer plus a per-state view, prioritizing La Guaira, Distrito Capital, Miranda, and Vargas-adjacent terrain. Integrate with the existing Leaflet setup — do not introduce a second mapping approach.

### Preparedness linkage

Where conditions warrant attention, link to the existing `/preparacion` content on landslide and flood safety. If that content does not exist, it needs writing — and it is subject to the `critical: true` human-review gate before shipping.

---

## What is explicitly not in scope

From the CIVIS survey, deliberately excluded:

- **AR terrain overlay** — impressive, disproportionate build cost for a solo operator
- **Certified elevator registry** — requires a data source Vigil does not have and cannot verify
- **Team operator portal** — Vigil's admin tier is sufficient; a full operator role requires the local-admin capacity the deployment playbook says Vigil lacks
- **WhatsApp AI agents** — runs directly into the Anthropic cost cap prompt 61 exists to protect

These are good features. They are not good features *for Vigil right now*, and building them would be copying a competitor's roadmap rather than serving Vigil's users.

---

## Acceptance criteria

**Part A:**
- Report flow completes in three taps with no account
- Aggregation requires minimum report count; single reports cannot flip a zone
- Zones with no recent reports display "sin datos recientes," never a stale status
- Rate limiting on the existing IP-hash pattern; no raw IPs stored
- Admin visibility into per-zone report volume; anomaly surfacing
- Kill switch disables the feature without a deploy
- No Anthropic API calls introduced

**Part B:**
- No Vigil-generated risk score, index, or alert level anywhere
- Every view links INAMEH and Protección Civil as authoritative
- Official advisories, where present, lead the display
- Rainfall accumulation displayed with source and observation time
- Integrated into the existing Leaflet map, not a second mapping stack
- Cost impact stated

---

## Constraints

- Design system unchanged. Both features use existing components and status colors.
- Neither feature may issue, imply, or resemble an official warning.
- Do not scrape CIVIS for zone lists, thresholds, or any other data. The 28-zone coverage is noted as evidence the approach works, not as a source to copy from.
- Ship Part A first. It is lower risk, and the community-reporting habit it builds is what makes Part B's audience exist.

---

## Report back

For Part A, state the aggregation thresholds chosen and the reasoning. For Part B, state exactly what is displayed and confirm that no element of it could be read by a user as Vigil issuing a warning — that judgment call is the whole risk of the feature.
