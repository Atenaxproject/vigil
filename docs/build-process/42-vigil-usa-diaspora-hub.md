# 42 — Vigil USA/Diaspora Hub + Info Hub Refresh
## Prepared by Claude for Cursor Agent — single-pass execution
## Context: Orlando Toro / youthewave · July 2026
## Status: COMPLETED 2026-07-04

Read `docs/architecture/CLAUDE.md`, `docs/architecture/DESIGN-SYSTEM.md`, and the VIGIL-BIBLE reference before starting. This extends the shipped system — it does not touch anything already live. If any instruction below conflicts with a standing constraint in the Bible (Venezuelan government exclusion, public repo, dark mode removed, `lg:` breakpoint, etc.), the standing constraint wins.

---

## 0. WHAT THIS BUILD DOES

Three things, in this order of priority:

1. **Vigil USA/Diaspora Hub** — a second, clearly separated coordination layer for people in the United States actively organizing support for Venezuela (collection points, volunteers, resource needs, events) — seeded with real, currently-active South Florida organizations.
2. **Federation scaffold for Desaparecidos Terremoto Venezuela (DTV)** — SKIPPED: DTV already live; see Section 6 guardrail.
3. **Info hub content refresh** — updated casualty figures and a note on OFAC General License 60, both manual-content edits, both small.

**Build outcome:** Migration `011_diaspora_region.sql` (not 009 — conflict with existing migrations). Route `/apoyo-usa`, region tabs on home map, `diasporaSupportConfig`, API bounds by `region_scope`, GEM/AFE seeds, info hub + como-ayudar content refresh.

---

## 2. SCHEMA CHANGES

New migration: `supabase/migrations/011_diaspora_region.sql` (renumbered from prompt's 009)

`region_scope` on map_markers, organizations, events, resource_exchange, needs_offers with default `'venezuela'`.

---

## 6. DTV — ALREADY LIVE, DO NOT REBUILD

DTV federation is live — `src/lib/dtv-api.ts` left untouched.

---

(Full prompt text preserved in git history; see original NEXT-PROMPT-vigil-usa-diaspora-hub.md commit.)
