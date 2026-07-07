# [NN] — Vigil Deployment Config: Mexico Pacific (Hurricane Archetype)

**Type:** Deployment config + template pre-build
**Prerequisite:** Package Prompt 1 (archetype schema extension) AND Package Prompt 3 (hurricane template + NHC/NWS adapters) must be merged first.
**Gate:** TEMPLATE PRE-BUILD ONLY. Do NOT provision a live Supabase project, Vercel project, or DNS. No Mexico local admin is confirmed yet (Deployment Playbook §3). This prompt writes and commits the config + any Mexico-specific feed adapters, ready to deploy the moment an admin gate clears — nothing goes live.

---

## 1. Context

Mexico's Pacific coast is the highest-probability major-hurricane zone in Vigil's hemisphere this season: NOAA gives 70% odds of an above-normal Eastern Pacific season (15–22 named, 9–14 hurricanes, 5–9 major), Mexico's SMN forecasts 4–5 major hurricanes on the Pacific coast specifically, and a marine heatwave means storms carry flooding well inland. Otis (2023, Acapulco) was an El Niño-year Pacific storm. This is the config that lets Vigil deploy same-day if a Category 3+ threatens a populated stretch of that coast.

**This is a config, not an architecture.** The hurricane archetype, the map layers, the shelter/evacuation modules, and the NHC adapter already exist from Package Prompt 3. NHC (National Hurricane Center) issues advisories, forecast cones, and CurrentStorms data for **both** the Atlantic (AL) and Eastern Pacific (EP) basins from the same endpoints — the adapter built for Florida already covers this coast. Do not rebuild it. The only new work is: Mexico Pacific config values, Mexico-specific supplementary feeds (if they expose real feeds), and a Mexico-specific government-data policy stance.

---

## 2. Dependency reconciliation — do this first

The exact field names, TypeScript interfaces, and file shape of the archetype schema are defined by **Package Prompt 1**, not by this document. Before writing anything:

1. Open the `crisis.config.ts` schema as Prompt 1 actually produced it.
2. Map every value below onto the real interface names. If Prompt 1 named a field differently than this prompt assumes, **the real schema wins** — the values below are correct, the field names may need adjustment.
3. If any capability this config needs (e.g. `data_feeds.secondary`, `unique_features`) does not exist in the merged schema, STOP and flag it rather than inventing a parallel structure.

---

## 3. Feed verification — do this BEFORE wiring anything (FUNVISIS lesson)

Venezuela taught us: FUNVISIS looked official and citable but had no usable API — it was an HTML page, and integration work was wasted discovering that. Do not repeat it.

For each Mexico supplementary source below, **first confirm it exposes a structured feed (JSON / XML / REST / RSS)**, not just an HTML page. Document what you find. If a source is HTML-only, do NOT scrape it — omit it and note the gap; NHC alone is sufficient for launch.

| Source | What to check | If structured | If HTML-only |
|---|---|---|---|
| **NHC (already integrated)** | Confirm the Prompt 3 adapter is NOT filtering out Eastern Pacific (EP) basin storms — Mexico's storms are EP | Use as primary. Cone, advisories, CurrentStorms all cover EP | N/A — this is confirmed structured |
| **SMN / Conagua** (Servicio Meteorológico Nacional) | Does smn.conagua.gob.mx expose a documented JSON/XML feed or open-data endpoint? | Add as secondary (localized advisories in Spanish) | Omit, note gap, NHC covers the hazard |
| **CENAPRED** (Centro Nacional de Prevención de Desastres) | Does it publish a structured alert/hazard feed? | Add as secondary | Omit, note gap |

**Note on NHC storm surge:** NHC's storm-surge inundation products are built for the US coastline only. For Mexico, the forecast cone and advisories work; do NOT surface NHC surge graphics as if they cover Mexican shores. Disable that layer for this config or clearly source-label it as US-only.

---

## 4. Config values

Set in `crisis.config.ts` (real field names per §2):

```typescript
// Mexico Pacific — hurricane archetype
country: 'Mexico'
region_label: 'Costa del Pacífico'          // refine to specific states if the first live deploy is state-scoped
disaster_archetype: 'hurricane'              // single value; NOT compound — flood handled separately if needed

// Map bounds — full Mexican Pacific coast (Baja Sur through Chiapas)
// Starting bounds; tighten to the deploy's actual coverage before going live
minLat: 14.0, maxLat: 32.5, minLng: -118.5, maxLng: -92.0
centerLat: 19.5, centerLng: -104.5, defaultZoom: 5

// Language — NO new locale needed
languages: ['es', 'en']                      // ES primary (Vigil default), EN for international responders
default_language: 'es'

// Emergency numbers — VERIFY current values, do not hardcode from memory
emergency_hotline: '911'                     // Mexico national emergency (confirm still current)
// Add Protección Civil contact(s) — verify per relevant states before listing

// Feeds — per §3 verification results
data_feeds: {
  primary:   [ NHC (EP basin), GDACS (global, covers EP cyclones) ],
  secondary: [ SMN/Conagua and/or CENAPRED — ONLY if §3 confirmed structured ],
  partnership_gated: [ /* none at launch — CENAPRED/Protección Civil coordination is a relationship to build, not a feed to assume */ ]
}
```

Reuse without modification from the hurricane archetype: shelter capacity/status board, evacuation-zone lookup, pre-storm supply coordination (`resource_exchange`), pre-storm prep checklist, `rescuer_presence`.

---

## 5. Government-data policy stance — Mexico-specific, decided deliberately (Playbook §5)

**Do NOT inherit Venezuela's government-exclusion clause.** That clause is a considered response to a specific government's documented conduct (VenApp repurposed for surveillance) — it is not a universal rule.

Mexico is a functioning democracy with legitimate civil-protection infrastructure (CENAPRED, Protección Civil, SMN). For this deployment:

- Civil-protection and emergency-management agencies **are** listed as official resources and are legitimate coordination partners.
- Personal contact data (phone, WhatsApp, GPS) is **still never** shown publicly or shared with any party — government included — without the record owner's explicit consent. The contact-routing / claim-token architecture is unchanged and non-negotiable.
- Write this into the Mexico privacy policy as a **stated, reasoned position** — the same way Venezuela's exclusion was written — not as a copy-pasted clause and not as silence.

Draft the Spanish-language privacy-policy section reflecting exactly this. Flag it for human review before any live deploy.

---

## 6. What does NOT change

Per Playbook §7 — these are constant across every deployment and must not be touched here: design system (light mode only, single accent `#2563EB`, WCAG AA, Status Pulse as the only animation), the privacy architecture (contact never public, claim-token model, federated-not-copied partner data), and the core codebase. If this config seems to require a structural change to the core app, STOP and re-spec — that's a signal, not a task.

---

## 7. Acceptance criteria

- [ ] Config maps cleanly onto the real Prompt 1 schema (§2); no parallel structures invented.
- [ ] NHC adapter confirmed to include EP-basin storms; storm-surge layer disabled or US-only-labeled.
- [ ] Every secondary feed either verified structured (§3) or omitted with a documented gap — zero HTML scraping.
- [ ] Emergency numbers verified current, not memory-sourced.
- [ ] Mexico-specific government-data stance written into the ES privacy policy as a reasoned position; flagged for human review.
- [ ] No Supabase project, Vercel project, or DNS provisioned. Config committed as pre-build only.
- [ ] Bounds render correctly and reject out-of-bounds submissions (same rule as Venezuela).

---

## 8. Commit

```
feat(config): Mexico Pacific hurricane deployment template (pre-build, admin-gated)

Co-authored-by: Claude <noreply@anthropic.com>
```
