# CLAUDE.md — Vigil Crisis Platform

**Agent instruction document. Read before every session. Rewritten 2026-07-22 (prompt 75 §7) to describe the system that exists — the previous version described the 9-route Phase-0 plan and had become a cause of docs-vs-code drift.**

Canonical companions (this file is the agent contract; those are the encyclopedia):

- `docs/reference/VIGIL-COMPLETE-GUIDE.md` — product surface, feature by feature
- `docs/reference/api-reference.md` + `docs/reference/data-model.md` — API and schema truth
- `docs/architecture/VIGIL-LAUNCH-READINESS.md` — living launch checklist (status markers come from execution reports only)
- `docs/architecture/DESIGN-SYSTEM.md` — tokens, type scale, components
- `docs/architecture/DEPLOYMENT-PLAYBOOK.md` — multi-country deployment gates
- `docs/build-process/NN-*.md` — numbered execution prompts; the changelog of intent

---

## Identity & Mission

**Project:** Vigil — *We stand watch when it matters most.*
**Live deployment:** Venezuela earthquakes (two mainshocks 39s apart, 2026-06-24) · vigil.youthewave.org
**Long-term:** universal crisis platform — `src/config/crisis.config.ts` is the only file that changes per deployment.

Vigil aggregates proven humanitarian tools rather than reinventing them. Six user groups, expressed in-product as **view modes**: busco_a_alguien · necesito_ayuda · quiero_ayudar · soy_organizacion · equipo_rescate · solo_informacion (+ ver_todo).

**Operator:** Orlando Toro — Founder & CCO, Bbluestudios LLC. BMAD-Nova protocol: **spec before code, always.** If a task is ambiguous, ask ONE clarifying question first.

---

## Tech Stack — no deviations

Next.js 14 App Router + TypeScript + Tailwind · Supabase (Postgres + Realtime + RLS) · Vercel · Leaflet/OSM (Venezuela-locked bounds) · next-intl (**8 locales**: es default, en, pt, fr, it, de, ru, zh) · Claude API (Haiku 4.5 batch/moderation, Sonnet vision for photo search only) · Make.com intake bridge · Cloudflare DNS · PWA (`@ducanh2912/next-pwa`).

**Do not suggest:** Firebase, MongoDB, GraphQL, Prisma, paid SaaS, anything needing >15 min setup.

---

## The system that actually exists (2026-07-22)

### Routes (~40 pages, ~45 API routes)

**Core flows:** `/` (crisis map + seismic) · `/buscar` (+`/buscar/[id]`) federated person search · `/reportar` · `/necesito-ayuda` · `/voluntarios` · `/organizaciones` · `/intercambio` · `/punto-de-acopio` · `/evaluacion-estructural` · `/conectividad` · `/servicios` · `/equipo-activo` · `/muro` · `/calendario` · `/estadisticas` · `/red` · `/informacion` · `/amenazas` · `/como-ayudar` · `/apoyo-usa` · `/preparacion(/[archetype])` · `/ayuda` · `/prensa` · `/monitor` (nav-hidden pending §68 redistribution rights) · `/regiones` · `/accesibilidad` · token flows `/mi-reporte|mi-intercambio|mi-evaluacion/[token]`, `/mis-reportes` · legal (`/privacidad`+`/terminos` ES, `/privacy`+`/terms` EN — outside i18n, known limitation) · `/admin`.

**Retired redirects — do not re-wire:** `/donaciones` → `/como-ayudar` (compliance: no YouTheWave incorporation, no 501(c)(3), no FDACS registration — see comment in `viewMode.config.ts`) and `/noticias` → `/informacion`.

### Navigation & view modes (one IA, three surfaces)

`src/components/layout/Navigation.tsx` owns the single `navItems` list (some entries `sheetOnly`). Sidebar + mobile bar are **filtered by view mode** (`src/config/viewMode.config.ts`); the menu sheet is **always the full site**, labeled as such, with the active mode's group pinned first (75 §4). Keep `viewMode.config.ts` and `Navigation.tsx` reconciled — every route in one must exist in the other or be an intentional redirect/always-visible page.

### Key subsystems (`src/lib/`)

- **DTV federation** — `dtv-api.ts` (client), `dtv-index.ts` (in-memory search index; DTV has no server-side search), `dtv-mapper.ts`. Read-only, never persisted, always attributed. **Aggregates publish only from a complete pagination walk; partial/capped walks suppress every figure** (75 §1). The `centro` field is universally null — never build UI on it.
- **AI cost circuit breaker** — `ai/circuit-breaker.ts` (`ok|degraded|halted`; `isPhotoSearchAllowed`, `isHaikuFeatureAllowed`). Every advertised AI feature must check it — advertising a degraded feature is worse than not mentioning it (74 C4).
- **Provenance & contested figures** — `provenance.ts`, `contested-figures.ts`, `sourced_figures` table. Official figures labeled with issuer + counterpoints; never averaged, never relabeled.
- **Feeds & hazards** — `usgs.ts`, `funvisis-status.ts`, `emsc.ts`, `gdacs.ts`, `reliefweb.ts`, `hdx.ts`, `rss.ts`, `hazards/`, `watch.ts`, `feed-health(-server).ts` (staleness tracked in `feed_health`).
- **Security** — `security/validate.ts`, `middleware.ts` (rate limiting), `admin-gate.ts`. RLS on all public tables.
- **DTV referral** — `src/hooks/useDtvReferral.ts`: sessionStorage-only flag from `document.referrer`; **never persisted, never logged server-side, no analytics** (74 C1).
- **PFIF export** — `pfif.ts` → `/api/pfif` (Google Person Finder).

### Migrations

`supabase/migrations/001–018` applied. Schema truth is `docs/reference/data-model.md` + the migration files — not this document.

### Scripts & checks

- `npm run check:i18n` (also `prebuild` — **build fails if any locale drifts from `es.json` key parity**)
- `npm run build:press-kit` — renders `docs/press/*.md` → styled PDFs in `public/press-kit/` (Playwright Chromium). PDFs are committed; `/api/press-kit/download` zips static files only. Re-run after editing any press markdown.
- `scripts/visual-check.mjs` — mobile + desktop proof for every changed route
- CI: CodeQL, accessibility workflow, nightly db-backup (secrets pending — issue #2), vigil-watch

---

## Standing constraints (non-negotiable)

1. **Spanish first.** All user-facing copy defaults to es; every key ships in all 8 locales (parity check enforces).
2. **Never fabricate, round, estimate, or seed a number to avoid an empty state. Suppression is always the answer.** A counter shows a real non-zero value or does not render.
3. **DTV figures are attributed to the federated DTV network — never presented as Vigil's own.** Label semantics stay distinct: reportes ≠ personas únicas ≠ sin contacto.
4. **No facial recognition, no biometrics claims.** Photo search = Claude Vision **text description of features**. The federation carries no biometric data.
5. **No donations solicitation** until 501(c)(3) determination + FDACS registration (Florida Ch. 496).
6. **Vigil is not a dispatcher.** Rescue needs route to 911 messaging, never intake.
7. **No government data cooperation.** VenApp intentionally excluded. Referrer values and contact info never logged or exposed.
8. **Performance budget is law:** functional at 2G/512kbps, no above-fold image >50KB, uploads compressed client-side (prompt 78 pending), lazy-loading, indexed queries only.
9. **Design system:** light mode only, Geist/Inter, 4px radius, minimal motion, existing tokens only. No dark mode under any framing.
10. **PR routing:** anything touching `src/lib/security/`, auth, RLS, contact-info handling, or sanitization goes through a PR so CodeQL + Copilot review run pre-merge. Schema changes always PR.
11. **Claude API:** Haiku for all automated/batch paths; Sonnet only for photo-search vision. Everything AI passes through the circuit breaker.
12. When in doubt: *"Does this help families searching for missing Venezuelans right now?"*

## Process rules

- Numbered prompts live in `docs/build-process/` — never at repo root. Generated assets never at repo root (`.gitignore` guards exist; extend them if a new generator appears).
- Status markers in `VIGIL-LAUNCH-READINESS.md` change only from execution reports.
- Keep this file honest: when the architecture changes, update this description in the same PR. This document drifting is how the platform accumulated config-vs-nav incoherence once already.

---

*Last updated: 2026-07-22 · prompt 75 §7 · Venezuela deployment live*
