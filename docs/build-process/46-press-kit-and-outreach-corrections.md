# 46 — Press kit and outreach corrections

**Date:** 2026-07-05  
**Scope:** Honest stat corrections across outreach package and docs; bilingual `/prensa` press kit page; screenshot refresh for README and press embeds.

## Problem

Outreach package v4 at repo root still claimed "55,000+ records searchable" and "17 verified orgs." README and help-center copy repeated 17 orgs. M1 media pitch used 68,000 missing-persons figure instead of the IRC estimate used on `/informacion`.

DTV search fix (commit `78197fe`) already shipped cached index + honest i18n stats; outreach and README had not caught up.

## Corrections applied

| Claim | Before | After |
|---|---|---|
| DTV federation | "55,000+ records searchable" | Federated with DTV: 55,000+ total citizen reports; ~12,000 searchable via public API (cached locally, not stored in Vigil DB) |
| Verified orgs | 17 | 26 (production count) |
| Missing persons (M1) | 68,000 | ~50,000 (estimated, IRC) — matches `/informacion` |

## Deliverables

- `docs/outreach/OUTREACH-SEND-PACKAGE-V4.md` — corrected outreach letters (archived from root)
- `src/app/prensa/page.tsx` + `src/components/prensa/PressKit.tsx` — bilingual press kit with live `/api/dtv-metrics`, screenshots, founder bio, government exclusion, contact
- Footer link to `/prensa`; `/prensa` in `ALWAYS_VISIBLE_PATHS`
- README, `help-center-structure.md`, `VIGIL-COMPLETE-GUIDE.md`, es.json help FAQ updated
- `scripts/visual-check.mjs` writes to `screenshots/` (README) and `public/screenshots/` (app)

## Files not touched

- DTV index implementation (`src/lib/dtv-index.ts`) — already correct
- Crisis config, migrations, unrelated favicon assets

## QA

- `npm run lint && npx tsc --noEmit`
- `/prensa` renders with live metrics fetch and four screenshots
