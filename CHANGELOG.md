# Changelog

All notable changes to Vigil are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/) with
[Conventional Commits](https://www.conventionalcommits.org/) style entries.

## [Unreleased] — 2026-06-29

### Added
- **`docs/` folder** — Architecture (`CLAUDE.md`, `DESIGN-SYSTEM.md`) and build-process prompts moved from repo root; `docs/README.md` index added.

### Changed
- **README**: documentation link, feature list rewritten to match actual codebase (live vs migration-gated vs coming soon).
- **DEPLOYMENT**: pointer to `docs/` for architecture references.
- **README / DEPLOYMENT / 09-docs-and-status**: migration 005 + seed marked applied on production Supabase (`macmlvybpxdnzfviimvl`).

## [Unreleased] — 2026-06-29 (prior)

### Added
- **Public notes system** — `missing_person_notes` table, realtime thread on `/buscar/[id]`, API at `/api/missing-persons/notes`.
- **Claim-token management** — passwordless `/mi-reporte/{token}` and `/mi-intercambio/{token}` pages; claim links shown on submit with copy button.
- **Collection point registration** — `/punto-de-acopio` form → `map_markers` with hours, categories, organizer; amber markers on crisis map.
- **Events calendar** — `/calendario` lightweight list view with category filters, realtime updates, Venezuela timezone labels.
- **Weather + time bar** — `/api/weather` (Open-Meteo, free) + slim ambient bar below emergency banner.
- Migration `005_notes_claims_calendar.sql` — claim tokens, notes, events, collection-point fields, contact-request `viewed` flag.
- Nav entries: Calendario, Punto de Acopio (desktop sidebar + mobile Más menu).
- i18n keys for notes, claim, weather, calendar, collectionPoint (8 locales).

### Changed
- **README**: new features listed; Coming soon table updated for migration + Resend claim emails.
- **DEPLOYMENT**: migration 005 step, Realtime tables list, Open-Meteo note (no env var).
- **Missing person submit** — returns `claimUrl`; optional `contact_email` triggers Resend claim link when configured.

## [Unreleased] — 2026-06-29 (prior)

### Added
- **Official email integration** — `vigil@youtheway.org` and `vigil.support@youtheway.org` in `crisis.config.ts`; footer contact link; Resend-powered feedback notifications (`src/lib/email/notify.ts`).
- **PWA runtime caching** — `@ducanh2912/next-pwa` with network-first Supabase, stale-while-revalidate USGS/ReliefWeb, cache-first images, and `/offline` fallback page.
- **Offline form queue** — missing-person and map-marker submissions queue in `localStorage` and flush on reconnect (`src/lib/offline-queue.ts`).
- **Network status banner** — “showing saved data” indicator when offline.
- **Footer credits** — “Made with hope and love for Venezuela” + Atenax Project link (ES/EN i18n).
- `RESEND_API_KEY` in `.env.example`.

### Changed
- Removed unused `framer-motion` dependency.
- **README**: official contact emails, PWA details, Built By section, Coming soon table (Resend alerts, push notifications, screenshots).
- **DEPLOYMENT**: Resend setup steps and `RESEND_API_KEY` in Vercel env table.

## [Unreleased] — 2026-06-29 (prior)

### Added
- **Live information hub** (`/informacion`) — auto-refreshing USGS + ReliefWeb feeds, manual crisis stats, realtime `infrastructure_status` from Supabase.
- **`/api/live-info`** — aggregates USGS significant quakes and ReliefWeb reports (5-minute cache).
- **Rescuer safety presence** (`/equipo-activo`) — field check-in, SOS button, 4-hour auto-expire, map layer "Equipos Activos".
- **Feedback widget** — floating support button on all pages; admin review at `/admin/feedback` (password-gated via `VIGIL_ADMIN_SECRET`).
- Migration `004_golive_features.sql` — `infrastructure_status`, `rescuer_presence`, `feedback` tables with Realtime.
- Realtime subscriptions for map markers, missing persons search/feed updates, rescuer presence, infrastructure status.
- `CRISIS_CONFIG.siteUrl` — canonical production domain `https://vigil.youtheway.org`.

### Fixed
- **Production client-side crash** ("Application error: a client-side exception
  has occurred"). Root cause: realtime websocket subscriptions were opened
  against the placeholder Supabase instance (`wss://placeholder.supabase.co`)
  while the CSP `connect-src` directive did not allow `wss://*.supabase.co`,
  so the blocked socket bubbled up as an unhandled exception that took down the
  whole page render.

### Added
- `src/app/error.tsx` and `src/app/global-error.tsx` — friendly, recoverable
  error boundaries (global boundary is provider-free and bilingual).
- Route-level `loading.tsx` / `error.tsx` for the main interactive routes
  (home, `buscar`, `reportar`, `intercambio`, `voluntarios`).
- Shared `ErrorState` and `LoadingState` UI components (DESIGN-SYSTEM compliant).
- `common.errorHint` translation key across all 8 locales.
- `CHANGELOG.md`.

### Changed
- **CSP** (`next.config.js`): added `wss://*.supabase.co` and
  `https://*.tile.openstreetmap.org` to `connect-src`, and
  `https://*.basemaps.cartocdn.com` to `img-src`. CSP otherwise unchanged.
- **Graceful degradation**: realtime subscriptions and client Supabase queries
  in `RecentMissingFeed`, `intercambio`, and `voluntarios` now no-op when
  Supabase is unconfigured (placeholder/missing env) and render calm empty
  states — no websocket is attempted at all.
- **Middleware**: skips the Supabase auth session refresh entirely when Supabase
  is unconfigured, avoiding network calls to a placeholder host.
- **README**: redesigned into a modern GitHub landing (centered header, badges,
  six user groups, feature list, tech-stack table, quick start, one-file deploy
  guide, data-protection statement). Contributors & Acknowledgments preserved.

## [0.1.0] — 2026-06-28

### Added
- Initial Vigil crisis platform for the Venezuela 2026 earthquake response.
- Missing persons board (PFIF-compatible), USGS crisis map, resource exchange
  board, volunteer marketplace, organization directory, official updates feed.
- Full data-protection layer (contact masking, RLS, rate limiting, coordinate
  validation), 8-language i18n, PWA manifest, privacy policy + terms.
- Supabase schema migrations `001`–`003`, auth setup, and real-data seed.
