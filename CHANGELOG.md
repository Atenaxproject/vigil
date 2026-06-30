# Changelog

All notable changes to Vigil are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/) with
[Conventional Commits](https://www.conventionalcommits.org/) style entries.

## [Unreleased] — 2026-06-30 (PWA, map layers, docs cleanup)

### Added
- **PWA install UX** — iOS Safari dismissible install banner (`IOSInstallBanner`,
  sessionStorage); Android/Chrome native install via `beforeinstallprompt` in Más
  menu (`PwaInstallButton`, `usePwaInstall`); `src/lib/pwa-install.ts` helpers.
- **PWA icons** — `public/icons/icon-{72,192,512}x*.png` for manifest and
  `metadata.icons.apple` in `layout.tsx`.
- **Retractable desktop map layers** — panel defaults open on `lg+`, close button
  + Layers reopen control; preference in `localStorage` (`vigil-map-layers-open`);
  `aria-expanded` / `aria-controls`; i18n `map.layers.showLayers` / `hideLayers`.
- **i18n** — `pwa.install`, `pwa.iosBanner.*` in all 8 locales.
- **docs/build-process** — `19-pwa-nav-security-final.md`; root `CURSOR-*` stubs
  removed after archive verification.

### Fixed
- **Security verification** — confirmed `SUPABASE_SERVICE_ROLE_KEY` and
  `ANTHROPIC_API_KEY` only in server-only modules; zero matches in `.next/static/`.
- **Bottom nav** — verified `.mobile-bottom-nav` border/shadow/opaque surface in
  `globals.css` (from session 17).

## [Unreleased] — 2026-06-30 (sidebar + desktop a11y)

### Added
- **Collapsible desktop sidebar** — `lg+` sidebar toggles between 240px (icon +
  label) and 64px (icon-only) via bottom chevron control; preference persisted
  in `localStorage` (`vigil-sidebar-collapsed`); main content reflows in flex
  layout; `aria-expanded`, i18n labels, tooltips/`aria-label` on collapsed nav
  items (`Navigation`).
- **Skip-to-content link** — first focusable element in `<body>`, targets
  `#main-content` (`SkipToContent`, `layout.tsx`).
- **Map text alternative** — collapsible “Ver como lista” section listing
  aftershocks, needs, resources, and collection points as plain text
  (`MapAccessibleList`, homepage).
- **Custom map zoom controls** — keyboard-accessible +/- buttons with
  `aria-label`; Leaflet default zoom disabled (`MapZoomControls`, `CrisisMap`).
- **i18n** — `nav.collapseMenu` / `nav.expandMenu` / `nav.desktopNav` /
  `nav.mobileNav`, `a11y.skipToContent`, `map.viewAsList` / `map.zoomIn` / etc.
  in all 8 locales.
- **docs/build-process** — `18-desktop-accessibility.md`; root
  `CURSOR-DESKTOP-ACCESSIBILITY.md` stub; `docs/README.md` index updated.

### Fixed
- **Desktop accessibility (WCAG AA)** — global `*:focus-visible` outline in
  `globals.css`; distinguishing `aria-label` on desktop vs mobile nav; sr-only
  `h1` on `/` and `/buscar`; `main#main-content` landmark with `tabIndex={-1}`;
  form `aria-required` / `aria-describedby` / `role="alert"` errors on report
  form and feedback widget; MapLayers close button i18n; Más button
  `aria-label`; icon-only control focus rings audited.
- **Duplicate nav a11y tree** — confirmed `hidden` / `lg:hidden` display:none
  hiding (not opacity/invisible).

## [Unreleased] — 2026-06-30 (accessibility & menu)

### Fixed
- **Type scale raised for accessibility (WCAG)** — body `13px → 16px`,
  caption `11px → 13px`, H3 `15px → 17px`, H2 `18px → 20px`, H1 `24px → 26px`,
  display `32px → 34px`; minimum font floor raised to 13px (`text-xs`/`text-[10px]`
  → 13px). Applied across 42 component/page files plus `DESIGN-SYSTEM.md`.
- **`--vigil-muted` contrast** — `#94A3B8 → #64748B` (≈2.8:1 → ≈4.6:1 on white,
  now passes WCAG AA for normal text); updated `globals.css`, `tailwind.config.ts`,
  and `DESIGN-SYSTEM.md`.
- **"Más" menu** — converted from a side-anchored flyout (clipped off-screen in
  landscape) to a full-width **bottom-sheet** reusing the map-layers pattern:
  backdrop tap-to-close, explicit X button, Escape to close, body-scroll lock,
  focus trap + restore, `aria-modal`/`aria-haspopup`/`aria-expanded`, 44px tap
  targets (`Navigation`).
- **Feedback widget fixed position** — trigger button now rendered via
  `createPortal` to `<body>` (previously only the modal was portaled), so its
  `position: fixed` can never be broken by a transformed/filtered ancestor
  containing block (`FeedbackWidget`).
- **Bottom nav visual definition** — added `.mobile-bottom-nav` (opaque
  `--vigil-surface`, top border, soft upward shadow) so content no longer shows
  through while scrolling (`globals.css`, `Navigation`).

### Added
- **Short bottom-nav labels** — `nav.mapShort/searchShort/reportShort/needHelpShort`
  added to all 8 locales so primary tabs fit at the raised 13px floor.
- **`aria-current="page"`** on active sidebar, bottom-nav, and Más-sheet links.
- **docs/build-process** — `17-accessibility-and-menu-fix.md` (archived prompt);
  root `CURSOR-ACCESSIBILITY-AND-MENU-FIX.md` reduced to a stub; `docs/README.md`
  index updated (also backfilled the missing `16-viewport-fix-and-proof.md` entry).

## [Unreleased] — 2026-06-30

### Fixed
- **Mobile landscape layout** — raised mobile/desktop breakpoint from `md` (768px)
  to `lg` (1024px) so phone landscape keeps bottom nav instead of desktop sidebar
  (`Navigation`, `layout`, `WeatherBar`, `FeedbackWidget`).
- **Dark mode fully removed** — deleted `.dark` CSS block from `globals.css`; zero
  `dark:` Tailwind classes remain; `darkMode: 'class'` in Tailwind (OS dark mode
  cannot trigger styles).
- **Home map in landscape** — mobile map uses `min(45vh,360px)` height instead of
  fixed viewport calc; `CrisisMap` min-height 240px on mobile.
- **Emergency banner** — `flex-wrap` so hotline button no longer overlaps map.
- **Map layer panel** — viewport-aware width `min(280px, calc(100vw - 24px))`.
- **Accessibility** — focus rings on layer checkboxes and feedback button; `nav.more`
  i18n key for mobile "More" menu.

### Added
- **Real translations** — generated pt/fr/it/zh/de/ru via `scripts/generate-translations.mjs`
  (Haiku); script now strips markdown fences and supports per-locale CLI args.
- **README banner** — `docs/assets/vigil-banner.svg` and shields.io badges in header.
- **docs/build-process** — `12-launch-ready.md`, `13-mobile-rebuild-and-translations.md`,
  `14-confirmed-mobile-bugs.md`, `15-deep-investigation-final.md`; root `CURSOR-*.md` stubs point to docs.

### Changed
- **docs/** — moved root `DEPLOYMENT.md` to `docs/architecture/DEPLOYMENT.md`; root stub
  retained; `docs/README.md` index updated with architecture and stub inventory.
- **PWA manifest** — `background_color` `#F8FAFC`, `theme_color` `#0F172A` (light only).

## [Unreleased] — 2026-06-30 (earlier)

### Fixed
- **Dark mode** — forced light as the true default. Declared `color-scheme: light`
  in `globals.css` and via a Next `viewport` export (`<meta name="color-scheme">`)
  plus inline `style` on `<html>`, stopping Chrome Auto Dark Theme (Android) from
  auto-inverting the UI. (No `next-themes`/`ThemeProvider` exists.)
- **Mobile layout** — `<main>` bottom padding now `calc(5rem + safe-area-inset)`
  so content never hides behind the bottom nav on notched devices; added
  `overflow-x: hidden` on `html, body` to prevent page-level horizontal scroll.
- **Footer hierarchy** — reworked the inline footer in `layout.tsx` into three
  clearly separated, quiet groups (open source/legal · credits · emergency
  disclaimer), each with a 1px `--vigil-border` top border and consistent 16px
  spacing. The "Atenax Project" link is now `--vigil-blue` with hover underline;
  the "not an emergency service" line uses `--vigil-body` weight with a 16px
  Lucide `AlertTriangle` icon (decorative, `aria-hidden`) instead of a loud red
  hotline button (tap-to-call already lives in the sticky EmergencyBanner). Added
  design tokens `--vigil-border`, `--vigil-body`, `--vigil-surface` to
  `globals.css` with `.dark` overrides for dark-mode-correct footer styling. No
  new i18n keys (reuses existing `footer.*` / `nav.*`).
- **Mobile + dark mode (verified)** — re-audited Part A: `color-scheme: light` on
  `:root` (+ `.dark` → `dark`), the `viewport` `colorScheme` export, the inline
  `<html style={{ colorScheme: 'light' }}>`, the `calc(... + safe-area-inset)`
  main padding, `overflow-x: hidden`, and ≥44px nav touch targets were all
  already in place — no code gaps found.

### Changed
- **docs/build-process** — added `09-mobile-darkmode-fix.md` (moved from root
  `CURSOR-MOBILE-DARKMODE-FIX.md`) and `10-footer-hierarchy-fix.md`; renumbered the
  prior `09-docs-and-status.md` → `11-docs-and-status.md`; added a build-process
  index to `docs/README.md`.

## [Unreleased] — 2026-06-29

### Added
- **`docs/` folder** — Architecture (`CLAUDE.md`, `DESIGN-SYSTEM.md`) and build-process prompts moved from repo root; `docs/README.md` index added.

### Changed
- **README**: documentation link, feature list rewritten to match actual codebase (live vs migration-gated vs coming soon).
- **DEPLOYMENT**: pointer to `docs/` for architecture references.
- **README / DEPLOYMENT / 11-docs-and-status**: migration 005 + seed marked applied on production Supabase (`macmlvybpxdnzfviimvl`).

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
- **Official email integration** — `vigil@youthewave.org` and `vigil.support@youthewave.org` in `crisis.config.ts`; footer contact link; Resend-powered feedback notifications (`src/lib/email/notify.ts`).
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
- `CRISIS_CONFIG.siteUrl` — canonical production domain `https://vigil.youthewave.org`.

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
