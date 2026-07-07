# [NN+1] — Vigil Watch: Operator Early-Warning Monitor

**Type:** Internal operations tool (not user-facing)
**Prerequisite:** Package Prompt 5 (security hardening) establishes the GitHub Actions + secrets pattern this rides on. Land it first, then reuse that infra — do not modify Prompt 5.
**Cost:** Effectively zero. GitHub Actions free tier + existing feeds (no keys) + one email provider already in the env plan.

---

## 1. Purpose

Right now, deciding when to stand up a new deployment depends on Orlando noticing a disaster in the news. Vigil Watch inverts that: it polls the authoritative feeds 24/7, filters to the regions Vigil actually cares about, and emails a digest when something crosses threshold. It converts "check the news" into "the platform tells me when to consider deploying."

This is an **operator tool**, not a public feature. No UI, no user-facing surface, no dashboard in v1. One instance, global watch, watching regions **regardless of whether Vigil is deployed there yet** — because its whole job is to flag places Vigil might need to go.

Keep v1 tight. Poll → filter → dedupe → email. Nothing more.

---

## 2. Architecture

```
GitHub Action (cron, every 30 min)
    │  authenticated call with CRON_SECRET
    ▼
Next.js API route  /api/watch/scan   (guarded by CRON_SECRET, same pattern as existing cron endpoints)
    │
    ├─ poll NHC CurrentStorms.json          (active tropical cyclones, AL + EP)
    ├─ poll GDACS RSS/API                    (orange + red alerts, global)
    ├─ poll USGS GeoJSON                      (significant earthquakes)
    │
    ├─ filter each event against watch.config.ts region boxes + thresholds
    ├─ dedupe against vigil_watch_state       (alert once on first cross, once on escalation)
    └─ if new/escalated crossings exist → send digest email → update state
```

Logic lives in the Next.js API route (in-repo, testable, reviewable). The GitHub Action is just the trigger — it hits the endpoint with `CRON_SECRET`. Do not put polling logic inside the Action YAML.

---

## 3. Feeds (all public, no keys)

| Feed | Endpoint | Use |
|---|---|---|
| NHC CurrentStorms | `https://www.nhc.noaa.gov/CurrentStorms.json` | Active tropical cyclones, both basins. Check each storm's forecast track/position against watched boxes |
| GDACS | GDACS GeoRSS / API (orange + red only) | Global cyclone/flood/EQ/volcano alerts; filter to watched countries |
| USGS | USGS earthquake GeoJSON feeds (e.g. significant / M4.5+ week) | Filter to M6.0+ within watched boxes |

Reuse Vigil's existing USGS and GDACS client code where it already exists — don't write new fetchers for feeds the app already consumes.

---

## 4. `watch.config.ts` — the watched regions (production values)

A standalone config, independent of any single deployment's `crisis.config.ts`. Implement exactly this — the coordinates and thresholds below are the deliverable, not placeholders.

**Trigger philosophy (this is deliberate — do not "improve" it to category-gated):** tropical alerts fire on any **named** storm whose *current position* enters a box. Boxes are drawn generously seaward to buy lead time. Rapid intensification (Otis 2023: TS → Cat 5 in ~24h) makes category-gated first alerts fire after the decision window has closed. Escalation re-alerts fire at hurricane strength and again at major (Cat 3+). v1 uses current position from CurrentStorms.json only — no forecast-track parsing.

```typescript
// watch.config.ts — Vigil Watch region boxes + thresholds
// Bounds are decision-trigger watch zones, intentionally wider than any
// deployment's crisis.config.ts bounds (offshore buffer = lead time).

export type GdacsHazard = 'EQ' | 'TC' | 'FL' | 'VO' | 'DR' | 'WF';

export interface WatchedRegion {
  id: string;
  label: string;
  bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number };
  /** Alert when a named tropical cyclone's current position is inside bounds.
   *  Escalation re-alerts: 'hurricane', then 'major' (Cat 3+). */
  tropical: boolean;
  /** USGS: alert at this magnitude or above inside bounds. null = ignore EQ. */
  eqMinMag: number | null;
  /** GDACS: hazard types to alert on at Orange or Red level inside bounds. */
  gdacsHazards: GdacsHazard[];
  notes?: string;
}

export const WATCHED_REGIONS: WatchedRegion[] = [
  {
    id: 'venezuela-scarib',
    label: 'Venezuela + southern Caribbean (LIVE deployment)',
    bounds: { minLat: 0.6, maxLat: 15.0, minLng: -73.5, maxLng: -59.5 },
    tropical: true,
    eqMinMag: 6.0, // active aftershock sequence; M6+ = situational escalation for the live instance
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes: 'Deployment bounds + offshore buffer north for Caribbean systems.',
  },
  {
    id: 'mexico-pacific',
    label: 'Mexico Pacific coast',
    bounds: { minLat: 10.0, maxLat: 33.0, minLng: -125.0, maxLng: -92.0 },
    tropical: true,
    eqMinMag: 6.5, // seismically busy; 6.5 keeps signal-to-noise for a deployment trigger
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes: 'minLat 10.0 reaches the EP genesis zone off Central America — 2-4 days lead on coast-bound storms. Covers Baja through Chiapas.',
  },
  {
    id: 'florida-gulf',
    label: 'Florida / eastern Gulf / Bahamas approach',
    bounds: { minLat: 22.0, maxLat: 31.5, minLng: -90.0, maxLng: -75.0 },
    tropical: true,
    eqMinMag: null,
    gdacsHazards: ['TC', 'FL'],
    notes: 'Home turf. Box includes Bahamas + eastern Gulf approach corridors.',
  },
  {
    id: 'caribbean-arc',
    label: 'Caribbean arc (Hispaniola / Puerto Rico / Antilles)',
    bounds: { minLat: 12.5, maxLat: 20.5, minLng: -75.5, maxLng: -59.0 },
    tropical: true,
    eqMinMag: 6.0, // Haiti: shallow M6 = mass-casualty potential
    gdacsHazards: ['EQ', 'TC', 'FL'],
    notes: 'Roadmap Tier 1 (PR) + Tier 2 (Haiti). Covers Hispaniola, PR, Leewards/Windwards to Barbados.',
  },
  {
    id: 'peru-ecuador',
    label: 'Peru / Ecuador coast',
    bounds: { minLat: -18.5, maxLat: 2.5, minLng: -84.0, maxLng: -75.0 },
    tropical: false, // EP cyclones do not track here
    eqMinMag: 6.0, // subduction zone, tsunami-capable
    gdacsHazards: ['EQ', 'FL'],
    notes: 'El Niño flood window Dec-Apr. GDACS Orange flood = the pre-position trigger for the flood template.',
  },
  {
    id: 'centam-pacific',
    label: 'Central America Pacific (Guatemala-Panama)',
    bounds: { minLat: 5.5, maxLat: 17.8, minLng: -95.5, maxLng: -77.0 },
    tropical: true,
    eqMinMag: 6.5,
    gdacsHazards: ['EQ', 'TC', 'FL', 'VO'], // VO: Fuego-class eruptions are a real trigger here
    notes: 'Overlaps mexico-pacific at the Chiapas/Guatemala corridor — see dedupe rule below.',
  },
  {
    id: 'california',
    label: 'California',
    bounds: { minLat: 32.0, maxLat: 42.0, minLng: -125.0, maxLng: -114.0 },
    tropical: false,
    eqMinMag: 6.0,
    gdacsHazards: ['EQ', 'WF'], // WF via GDACS only in v1 — no FIRMS integration yet
    notes: 'Roadmap Tier 1 (wildfire + EQ). FIRMS is a later feed; GDACS Orange wildfire suffices as v1 trigger.',
  },
];

export const TROPICAL_ESCALATION_LADDER = ['named', 'hurricane', 'major'] as const;
```

**Overlap dedupe rule:** boxes intentionally overlap (mexico-pacific ∩ centam-pacific; venezuela ∩ caribbean-arc). Dedupe is **global by external event ID** — one event = one digest line listing *all* matching region labels. Never one email per box.

Thresholds mirror the official agencies' own tiers (Saffir-Simpson categories, GDACS Orange/Red, USGS magnitude) — never invent a severity scale.

---

## 5. Dedupe / state

A small Supabase table `vigil_watch_state`:
- keyed by external event ID (NHC storm ID, USGS event ID, GDACS event ID)
- stores last-alerted severity/status
- an event alerts **once** on first threshold cross, and **again only on escalation** (e.g. TS→hurricane, orange→red, or track newly entering a box)
- prevents the same storm emailing every 30 minutes

This is the "incident continuity across runs" pattern — the same event tracked as a stateful incident, not rediscovered as new each poll.

---

## 6. Email digest

- Send via Resend (already planned in env vars — needs `RESEND_API_KEY`). If Resend isn't wired yet, fall back to SMTP through the working Zoho inbox.
- Recipient: Orlando's operator address.
- One digest per scan that has new/escalated crossings; **no email when nothing crosses** (no noise).
- Digest content per event: region label, hazard type, official severity/category, position or affected area, link to the authoritative source (NHC/USGS/GDACS page), and timestamp.
- Plain, scannable, mobile-first. This is a decision trigger, not a newsletter.

---

## 7. Acceptance criteria

- [ ] `/api/watch/scan` rejects any call without valid `CRON_SECRET`.
- [ ] GitHub Action triggers the endpoint on schedule; no polling logic in the YAML.
- [ ] Existing USGS/GDACS client code reused, not duplicated.
- [ ] Events filtered correctly against `watch.config.ts` boxes and thresholds.
- [ ] Same event does not re-alert without escalation (verified against `vigil_watch_state`).
- [ ] Zero email when nothing crosses threshold.
- [ ] Thresholds mirror official agency tiers; no invented severity scale.
- [ ] No user-facing surface added — this is operator-only.

---

## 8. Commit

```
feat(ops): Vigil Watch operator early-warning monitor (NHC/GDACS/USGS, region-filtered digest)

Co-authored-by: Claude <noreply@anthropic.com>
```
