# VIGIL — Build Prompt: New Zone Rollout Playbook
### Orlando Toro x Claude — September 2026

---

## Status context (read first)

This documents, retroactively, the process used to activate Florida as Vigil's
second zone deployment (`deploy/florida-v2` branch, 2026-09-30), and fixes it
into a repeatable playbook for the zones after that. Flagged by PR #84 review
(chatgpt-codex-connector, P1): that work landed as production code changes
without a numbered prompt of record, directed conversationally instead. This
is the prompt that should have preceded it — written after the fact because
the gap was caught, not to pretend otherwise.

Orlando's stated intent (2026-09-30): Vigil should be usable by anyone who
needs it, wherever needed, at no cost — open source, by people and friends to
people. Zones get activated one at a time, each fully customized, none of them
gatekept from people outside it.

## Objective

A rollout process for zone N+1 that a future session (or Orlando himself) can
follow without rediscovering, live, the mistakes zone #2 (Florida) made first:

1. A stale deployment branch silently duplicating a feature already merged to
   `main` independently (the original `deploy/florida` branch — discarded,
   redone as `deploy/florida-v2` from current `main`).
2. `CRISIS_CONFIG`'s real shape is large (~30 fields, read by ~20+ files) but
   each zone's pre-built `*.config.ts` values file only covers a subset —
   the gap was discovered empirically via `tsc` errors, one at a time, rather
   than checked against a known contract.
3. Two fields (page title, nav subtitle) were initially *derived* from other
   config values instead of set explicitly, which silently changed Venezuela's
   live rendered text — caught in PR #84 review, not before.

None of these are Florida-specific. They will recur for zone #3 unless this
prompt's steps are actually followed.

## What already exists (don't rebuild this)

- `src/config/deployments/registry.ts` — `DEPLOYMENTS` array + `matchDeployment()` / `liveDeployments()`. Single source of truth for the geo-suggestion banner and `/regiones`.
- `src/config/deployments/*.config.ts` — pre-built values files per zone (`florida.config.ts`, `mexico-pacific.config.ts`). Partial by design (see gap #2 above) — a starting point, not a drop-in replacement for `crisis.config.ts`.
- `src/config/deployments/TODO-BEFORE-LAUNCH.md` — per-zone launch gates (local admin, legal review, locale review, emergency numbers, Supabase/Vercel setup). This is already the right template; extend it per zone rather than writing a new format each time.
- `src/components/layout/DeploymentSuggestion.tsx` — the geo-suggestion banner. Confirmed policy (2026-09-30 conversation, restated below): this is the *only* access-shaping mechanism, ever.
- The `crisis.config.ts` header comment's "swap + redeploy" model — one codebase, one file that differs per deployment, each deployment its own Supabase project and Vercel project/branch.

## Access model — settled, do not re-litigate per zone

**Soft suggestion only. Never blocking. No IP persistence, ever.**

Decided explicitly 2026-09-30: "anyone who needs it, wherever needed, at no
cost" is incompatible with geofencing or access restriction by location. A
Venezuelan searching for a missing relative from Miami must be able to use the
Venezuela zone; a Florida evacuee's family abroad must be able to use the
Florida zone. The existing `DeploymentSuggestion` banner (coarse
country/region match from Vercel geo headers, no GPS, no cookies, nothing
persisted server-side) is the entire access model, for every zone, forever.
Anti-abuse (spam/bot submissions) is a separate, already-handled concern via
the existing per-IP-hash rate limiting in `middleware.ts` — that stays
identity-blind (hashed, not logged raw) and is not the same thing as
geofencing.

If a future zone seems to need something stronger than this, that is a
decision for Orlando specifically, made explicitly, not a default to drift
into.

## Implementation — the rollout sequence

### 1. Branch from current `main`, never from an old zone branch

Confirm any deployment-agnostic fix (title strings, legal-text plumbing, the
kind of thing that benefits every zone) is already merged to `main` first. If
one isn't, land it on `main` on its own PR before branching — see PR #84 for
the category of fix this means (page title, OG locale, legal-text fields
moved into config).

### 2. Provision infra before touching config

- New Supabase project (region near the affected population) → apply every
  migration in order → verify RLS is enabled on every table → confirm zero
  rows (a fresh project, not a copy of another zone's data).
- New Vercel project (or branch on the existing one) tracking the new zone
  branch as its production branch.
- Fresh secrets per zone — `VIGIL_ADMIN_SECRET`, `CRON_SECRET` — generated new,
  never copied from another zone. Shared-service credentials (`ANTHROPIC_API_KEY`,
  `CARTO_API_KEY`) are fine to reuse.
- Deployment Protection (password or Vercel Authentication) on the new
  project until the zone's `TODO-BEFORE-LAUNCH.md` gates all clear —
  reachable by direct link for stakeholder review, not publicly indexed.

### 3. Config swap — full shape, honest-empty, never fabricated

`crisis.config.ts`'s real shape includes fields no pre-built `*.config.ts`
values file currently covers: `partnerLinks`, `emergencyContacts`,
`psychosocialLines`, `directoryStatePriority`, `orgDisplayPriority`,
`legal.*`, `seismic`/`epicenters` (inert if the zone's `disasterArchetypes`
excludes `earthquake`, but the shape must still exist — many files read it
unconditionally), `siteTitle`, `navSubtitle`.

For everything the pre-built file doesn't cover: default to **honest-empty**
(`[]`, `{}`, or a single universally-true fact like the generic `911` hotline
entry), never an invented specific claim. This is what made Florida's
activation defensible — no fabricated county EM contacts, no invented partner
orgs, no guessed legal citations. Follow-up work fills these in with verified
specifics; the initial activation should never guess.

`siteTitle` and `navSubtitle` are set directly per zone, never derived from
`crisis`/`country`/`crisisDate` — see PR #84 review for why the derived
approach broke.

**Recommended follow-up, not required to ship zone #3**: formalize
`CRISIS_CONFIG`'s shape as a named TypeScript type (e.g. `type
CrisisConfig = {...}` in `vigil.types.ts`), so a new zone's config gets
compile-time "you're missing field X" errors instead of the current
discover-via-`tsc`-error-by-error-until-clean process. Worth doing once a
third zone confirms the pattern, not before.

### 4. Legal/content gate — every zone, no exceptions

Extend `TODO-BEFORE-LAUNCH.md` with the new zone's own section, matching the
existing Florida/Mexico Pacific format: named local admin, deployment-specific
privacy stance (government-agency relationships are genuinely different per
place — Florida's county EM offices are legitimate partners where Venezuela's
government is excluded entirely), two-independent-source emergency numbers,
native-speaker review for any non-machine-translated locale before it ships.

### 5. Registry stays `prebuilt` until every gate clears

`registry.ts`'s entry for the new zone: `status: 'prebuilt'`, `url: null`,
until `TODO-BEFORE-LAUNCH.md`'s checklist for that zone is fully checked. Flip
to `'live'` + real URL only then — that's what actually turns on the
geo-suggestion banner surfacing it to real visitors.

## Non-goals

- The subdomain-per-zone hub (prompt 86) — a unified front door, decoupled
  from this playbook. Worth doing once there are 2+ *live* zones people need
  to discover; doesn't change anything in this prompt.
- A single-build multi-tenant architecture (config selected at runtime
  instead of N branches) — would reduce the ongoing per-branch rebase cost
  this playbook's step 1 manages manually. Not spec'd anywhere yet; a bigger
  investment than this prompt scopes.
- Any form of access restriction beyond the geo-suggestion banner — settled
  above, not open for a quick default change per zone.

## Acceptance criteria

- [ ] New zone branched from current `main`, not an older zone branch
- [ ] Supabase project: fresh, migrated, RLS verified, zero seed data
- [ ] Vercel project: fresh, Deployment Protection on, fresh admin/cron secrets
- [ ] `crisis.config.ts` swap: every field present (no `tsc` errors), nothing
      fabricated for fields the pre-built file didn't cover
- [ ] `npx tsc --noEmit`, `npm run lint`, `npm run build` all clean before
      first deploy
- [ ] `TODO-BEFORE-LAUNCH.md` extended with the new zone's own gate checklist
- [ ] `registry.ts` entry added as `prebuilt` — not flipped to `live` by this
      step

## MANUAL TASKS — Orlando only

1. Supabase project creation (dashboard) and service-role key retrieval —
   never exposed via any automated tool, by design.
2. Vercel project creation and env var entry, if the acting session's Vercel
   connector lacks write permission (confirmed the case for Florida,
   2026-09-30 — read-only: can list/view, cannot create projects or env vars).
3. Legal review sign-off on the zone's privacy-policy/terms draft text before
   any real public use.
4. Sourcing/confirming a named local admin and native-speaker locale
   reviewer — relationships, not code.

---

*Pair with `docs/architecture/DEPLOYMENT-PLAYBOOK.md`, `docs/architecture/DEPLOYMENT.md`, `src/config/deployments/registry.ts`, `src/config/deployments/TODO-BEFORE-LAUNCH.md`. Live codebase overrides this document wherever they conflict.*
