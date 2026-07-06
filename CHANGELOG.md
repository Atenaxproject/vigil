# Changelog

## [Unreleased] — 2026-07-06 (infrastructure ops 47–51)

### Added
- **`Atenaxproject/vigil-backups`** — private repo with weekly Supabase `pg_dump` GitHub Actions workflow.
- **`.github/dependabot.yml`** — weekly npm and GitHub Actions updates.
- **`.github/workflows/codeql.yml`** — CodeQL for JavaScript/TypeScript.
- **`docs/build-process/47-vigil-backups-repo.md`** through **`51-zoho-dns-cloudflare.md`** — session archives.

### Changed
- **GitHub** — Dependabot vulnerability alerts and automated security updates enabled on `Atenaxproject/vigil`.
- **GitHub Actions secret** — `CRON_SECRET` set on `Atenaxproject/vigil` (`SUPABASE_DB_URL` and `SUPABASE_ACCESS_TOKEN` pending Orlando).

### Pending
- **Cloudflare DNS** — Zoho MX/SPF/DKIM/DMARC for `youthewave.org` (no API token in CI shell).
- **Secrets** — `SUPABASE_DB_URL` / `SUPABASE_ACCESS_TOKEN` on vigil and vigil-backups repos.
All notable changes to Vigil are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/) with
[Conventional Commits](https://www.conventionalcommits.org/) style entries.

## [Unreleased] â€” 2026-07-05 (press kit + outreach corrections)

### Added
- **`/prensa`** â€” bilingual press kit page with live `/api/dtv-metrics`, screenshots, founder bio, government data exclusion, and media contact (`vigil@youthewave.org`).
- **`docs/outreach/OUTREACH-SEND-PACKAGE-V4.md`** â€” corrected outreach letters archived from repo root.
- **`docs/build-process/46-press-kit-and-outreach-corrections.md`** â€” session archive.

### Changed
- **Outreach package** â€” honest DTV federation wording (55,000+ total reports, ~12,000 API-searchable, cached locally); 26 verified orgs; M1 missing-persons figure ~50,000 (IRC).
- **README**, **`help-center-structure.md`**, **`VIGIL-COMPLETE-GUIDE.md`**, **es.json** help FAQ â€” 17 â†’ 26 verified orgs.
- **Footer** â€” press link to `/prensa`; route in `ALWAYS_VISIBLE_PATHS`.
- **`scripts/visual-check.mjs`** â€” writes screenshots to `screenshots/` (README) and `public/screenshots/` (app).

### Removed
- Root **`VIGIL-OUTREACH-SEND-PACKAGE-V4.md`** (content under `docs/outreach/`).

## [Unreleased] â€” 2026-07-04 (deployment playbook docs)

### Changed
- **`docs/architecture/DEPLOYMENT-PLAYBOOK.md`** â€” canonical home for new-crisis rollout playbook (moved from repo root); links fixed to `sops.md`, `data-model.md`, `VIGIL-COMPLETE-GUIDE.md`, `CLAUDE.md`; migrations **001â€“012**; diaspora `region_scope`, CAV sync, and adaptive onboarding in checklist; inline archetype table (expansion roadmap doc noted as planned).
- **`docs/README.md`**, **`DEPLOYMENT.md`**, **`VIGIL-COMPLETE-GUIDE.md`** â€” index cross-links to deployment playbook.
- **`docs/reference/data-model.md`** â€” migrations table extended through **012**.

### Removed
- Root **`VIGIL-DEPLOYMENT-PLAYBOOK.md`** (content lives under `docs/architecture/`).

## [Unreleased] â€” 2026-07-04 (map/search separation + mode nav fix)

### Added
- **Map layer "Personas Desaparecidas"** â€” jittered pins from `public_missing_persons`; popup links to `/buscar/[id]`.
- **Migration `012_missing_persons_map_coords.sql`** â€” `approx_last_seen_lat/lng` on `missing_persons`; `parroquia` in public view.
- **`getMissingPersonsForMap()`** â€” server helper for crisis map missing-persons layer.

### Changed
- **`/` (Mapa de Crisis)** â€” map-only layout; removed missing-persons search widget from home route.
- **`/buscar`** â€” full-width search with `GeoSelect` municipio/parroquia filters and 2-column results grid; DTV federation preserved.
- **Mode nav filtering** â€” synchronous `localStorage` read in `useViewMode`; sidebar strictly applies `isRouteVisibleForMode` (no `!modeReady` bypass).

### Archived
- `docs/build-process/45-fix-map-search-and-mode-filtering.md`; root `NEXT-PROMPT-fix-map-search-and-mode-filtering.md` deleted.

## [Unreleased] â€” 2026-07-04 (adaptive onboarding + CAV sync)

### Added
- **Adaptive view modes** â€” six personas + "Ver todo"; first-visit picker below emergency bar; header switcher; client-side nav filtering (`vigil_view_mode` in localStorage).
- **Per-mode mini-guides** â€” dismissible tips with deep links to `/ayuda` sections.
- **`/ayuda` help center** â€” eight accordion sections from `help-center-structure.md` (Spanish primary, i18n keys in all locales).
- **CAV collection-point sync** â€” `src/lib/cav-import.ts`, `/api/admin/sync-cav-centers`, weekly cron Mon 06:00 UTC.
- **Three sister platforms** â€” Venezuela Earthquake Map, Yummy SOS, Centros de Ayuda Venezuela (`integrated: false`).
- **CAV map attribution** â€” "vÃ­a Centros de Ayuda Venezuela" badge on `source=cav` markers.

### Changed
- **Emergency banner** â€” 911 primary with carrier codes; ProtecciÃ³n Civil, Cruz Roja, FUNVISIS under expandable "MÃ¡s contactos".
- **Mobile nav** â€” Ayuda tab always visible; mode-filtered primary routes.
- **`help-center-structure.md`** â€” marked implemented at `/ayuda`.

### Archived
- `docs/build-process/43-adaptive-onboarding-and-help-center.md`, `44-sister-network-and-cav-sync.md`; root prompt stubs deleted.

## [Unreleased] â€” 2026-07-04 (FUNVISIS pass + USA diaspora hub)

### Added
- **`src/lib/seismic.ts`** â€” merged seismic feed with per-event `source` labels (USGS today; FUNVISIS when feed exists).
- **`diasporaSupportConfig`** + **`emergencyContacts`** in `crisis.config.ts` (unverified numbers flagged).
- **Migration `011_diaspora_region.sql`** â€” `region_scope` on map_markers, organizations, events, resource_exchange, needs_offers.
- **Route `/apoyo-usa`** â€” South Florida diaspora hub (map, orgs, intercambio/events links, 911 module).
- **Region toggle tabs** on home map: Venezuela | Apoyo desde EE.UU.
- **`CrisisMap` `regionScope` prop** â€” separate bounds; reuses single Leaflet component.
- **USA volunteer skills** â€” logistics_shipping, translation_local, warehouse_sorting, local_driver, fundraising_event.
- **Seed `004_diaspora_orgs.sql`** â€” GEM Doral + AFE (flagged for Orlando hour verification).
- **EncuÃ©ntrame VZLA** sister platform link in `crisis.config.ts`.
- **Info hub** â€” psychosocial block, telecom free-calling note, AP July 1 casualty sources, medical strain note.
- **`/como-ayudar`** â€” OFAC GL 60, Meru remittances, Banesco matching notes.

### Changed
- **Emergency banner + `/informacion`** â€” fuller contact directory with verify-before-calling caveat.
- **Org directory** â€” `orgDisplayPriority` sort in `getApprovedOrganizations()`.
- **API submit routes** â€” `region_scope` bounds validation (Venezuela unchanged; usa_diaspora â†’ tri-county FL).
- **README** â€” diaspora hub feature, DTV live wording, AP stats sync, Hurricane `region_scope` reuse note.

### Skipped
- **`src/lib/funvisis.ts`** â€” no official FUNVISIS JSON/XML feed (HTML only); scraper not built per guardrails.

### Archived
- `docs/build-process/41-funvisis-and-content-refresh.md`, `42-vigil-usa-diaspora-hub.md`; root prompt stubs deleted.

## [Unreleased] â€” 2026-07-04 (complete operational reference)

### Added
- **`docs/reference/`** â€” full A-to-Z operational documentation derived from live codebase:
  `VIGIL-COMPLETE-GUIDE.md` (master), `onboarding.md`, `api-reference.md` (33 routes),
  `data-model.md` (migrations 001â€“010, RLS, views), `sops.md`, `help-center-structure.md`,
  `glossary.md`.
- **`docs/README.md`** â€” Reference index section linking all new docs.

## [Unreleased] â€” 2026-07-03 (README + docs index sync)

### Changed
- **README** â€” property safety assessment in live-features table and Project Status;
  org counts corrected to 17 (Hogar Bambi); `support@youthewave.org` in official
  contact line; volunteer skills parenthetical for structural assessment roles;
  verification date 2026-07-03.
- **`package.json` description** â€” mentions post-disaster property safety assessment;
  removed stale "geo breakdown" phrase.
- **`docs/README.md`** â€” build-process index entries #34â€“40 aligned with CHANGELOG.

### Archived
- `docs/build-process/40-readme-docs-sync.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-03 (branding + structural assessment)

### Added
- **YouTheWave branding** â€” footer credits link to youthewave.org; support email
  `support@youthewave.org`; README contact copy updated (legal operator Bbluestudios LLC unchanged).
- **Hogar Bambi Venezuela** â€” 17th verified org in seed `003_hogar_bambi.sql` (`child_protection` type).
- **Mapa de Necesidades VZLA** â€” 8th sister platform on `/red` (link-only).
- **EvaluaciÃ³n de Seguridad Estructural** â€” `/evaluacion-estructural` submission flow, map layer
  (green/yellow/red ATC-20 tags), admin assignment queue, claim link `/mi-evaluacion/{token}`,
  migration `010_property_assessments.sql`, volunteer skills `structural_engineer` / `architect` /
  `surveyor`, optional `credential_note`.
- **ToS Â§4** â€” structural assessments are volunteer opinions, not official government inspections.

### Archived
- `docs/build-process/38-branding-orgs-update.md`, `39-property-safety-assessment.md`; root prompt stubs deleted.

## [Unreleased] â€” 2026-07-02 (sister platforms sync + PWA closeout)

### Added
- **Three sister platforms in config** â€” CIVIS Venezuela, SOS Venezuela 2026, and Red
  Venezuela Activa added to `crisis.config.ts`; `/red` now lists all 7 platforms matching
  README (link-only, no scraping).

### Changed
- **PWA Phase 2 closed** â€” `CATCHUP-REPORT.md` updated: iOS Add to Home Screen confirmed
  in standalone mode on a real device (Orlando).

### Archived
- `docs/build-process/37-sister-platforms-fix-and-pwa-closeout.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-02 (PWA iOS fix, redundancy cleanup, crisis stats)

### Fixed
- **iOS PWA home screen** â€” added `appleWebApp` metadata (`capable`, `title`,
  `statusBarStyle`), `viewportFit: 'cover'`, and manifest `id`/`scope`/180px icon;
  production was missing `apple-mobile-web-app-*` meta tags required for standalone mode.
- **Brand icons in `public/`** â€” synced Orlando's root favicon set into `public/` for
  consistent apple-touch-icon and PWA install assets.

### Changed
- **`/informacion` redundancy** â€” removed duplicate DTV metrics widget and sister-platform
  list; replaced with cross-links to `/estadisticas`, `/red`, and `/conectividad`.
- **`ConnectivityInfoCard`** â€” removed duplicate 0800-RESCATE block (already in emergency
  banner + hotlines section); added link to report connectivity on `/conectividad`.
- **Manual crisis statistics** â€” deaths 2,295, injured 11,267, missing ~50,000 (est.) with
  contested-data qualifier; verified date 2026-07-01; sources updated per Asamblea Nacional /
  IRC / ABC News in all 8 locales.

### Archived
- `docs/build-process/35-crisis-statistics-update.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-02 (Connectivity / comms layer)

### Added
- **`CommsLayer`** â€” distinct amber dashed markers for `category=comms` resources on the
  crisis map (visible under the Recursos layer toggle).
- **`/conectividad`** â€” citizen submission form for Starlink, cell signal, or open WiFi
  points (low-friction, auto-approved, same pattern as Punto de Acopio).
- **`/api/connectivity/submit`** â€” validates GPS bounds, stores `type=resource`,
  `category=comms` in existing `map_markers` schema (no migration).
- **`ConnectivityInfoCard`** on `/informacion` â€” verified Starlink support, activate, and
  emergency-response links; 0800-RESCATE; carrier free-access disclaimer.
- **i18n** â€” `connectivity` and `connectivityInfo` namespaces in all 8 locales; nav link
  in MÃ¡s menu.

### Archived
- `docs/build-process/34-connectivity-comms-layer.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-01 (Vigil brand favicon)

### Added
- **Brand favicon set** â€” `favicon.ico`, PNG sizes 16/32/48/192/512, and
  `apple-touch-icon.png` (180Ã—180) in `public/`.
- **Next.js metadata icons** â€” full `icons` config in `src/app/layout.tsx`
  for browser tabs, iOS home screen, and PWA install.
- **PWA manifest icons** â€” `manifest.json` now references
  `android-chrome-192x192.png` and `android-chrome-512x512.png`.

### Removed
- Placeholder PWA icons under `public/icons/` (replaced by brand assets).

### Archived
- `docs/build-process/33-favicon-deploy.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-01 (DTV geocode + stats fix)

### Added
- **`src/lib/geocode-venezuela.ts`** â€” Nominatim geocoding for Venezuelan
  addresses with User-Agent, rate-limit helper, and map-bounds validation.
- **`supabase/migrations/009_external_id.sql`** â€” `external_id` column on
  `map_markers` for stable DTV centro deduplication.

### Fixed
- **DTV centro sync** â€” geocodes text `ubicacion` via Nominatim (1 req/sec),
  upserts by `external_id`; reports `geocoded`, `skipped`, `failed`.
- **DTV metrics** â€” API exposes no `pagination.total`; counts now walk
  cursor pages (`nextCursor`, `hasMore`, `?cursor=`) for personas/centros/listas.
- **`dtv-api.ts`** â€” aligned types and helpers with real DTV field names
  (`ubicacion`, `foto`, `createdAt`, nested persona ubicacion object).

### Archived
- `docs/build-process/32-dtv-geocode-and-stats-fix.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-01 (full page audit)

### Added
- **Homepage recent empty state** â€” warmer copy directing users to DTV's
  55,891+ records when Vigil has no recent submissions.
- **`/organizaciones` directory** â€” loads admin-approved orgs from Supabase
  with type filter, fraud warning, and donation links (replaces partner-link stub).
- **`/informacion` DTV widget** â€” live combined network metrics from
  `/api/dtv-metrics`.
- **`/necesito-ayuda` pin-drop map** â€” tap-to-place location picker plus
  page intro distinguishing crisis map markers from `/intercambio`.
- **`/como-ayudar` family tracing** â€” Red Cross Honduras, Argentina,
  Colombia lines; curated donations note linking to full org directory.
- **Field-worker warnings** â€” `/equipo-activo` banner for rescue teams only;
  `/intercambio` 7-day expiry notice on publish form.
- **Calendar empty CTA** â€” "Add event" button in empty state.
- **i18n** â€” new strings in all 8 locales for audit changes.

### Changed
- **`/donaciones`** â€” redirects to `/como-ayudar`; removed from desktop
  sidebar (kept in mobile MÃ¡s menu).
- **`/noticias`** â€” redirects to `/informacion`; removed from desktop sidebar.
- **Navigation** â€” `sidebarHidden` flag for consolidated routes.

### Archived
- `docs/build-process/31-page-audit-and-refine.md`; root prompt stub deleted.

## [Unreleased] â€” 2026-07-01 (DTV deep integration)

### Added
- **DTV live metrics** â€” `GET /api/dtv-metrics` returns personas/centros/listas
  totals from DTV pagination metadata (5-minute cache); combined network
  section on `/estadisticas` with amber DTV stat cards vs blue Vigil cards.
- **Search attribution UX** â€” amber DTV source header, permanent trust note on
  `/buscar`, dual-platform no-results state with report CTAs for Vigil and DTV.
- **Cross-report banner** â€” dismissible info banner on `/reportar` (sessionStorage).
- **`/red` page** â€” featured DTV active integration partner + other sister platforms.
- **Paginated DTV center sync** â€” `getAllDTVCentros()` with cursor pagination;
  hospital vs collection_point inference; Vercel cron daily at 06:00 UTC (Hobby tier;
  6-hour schedule requires Pro); DTV badge on map popups for synced markers.
- **i18n** â€” new DTV/red/estadisticas strings in all 8 locales.

### Changed
- **Footer** â€” "CÃ³digo abierto â€” Licencia MIT" links to GitHub repo.
- **`/como-ayudar`** â€” removed redundant standalone hotline line (banner + footer remain).
- **Navigation** â€” `/red` added under MÃ¡s menu.
- **Docs** â€” archived `30-dtv-deep-integration.md`; removed root prompt stub.

## [Unreleased] â€” 2026-07-01 (DTV federated search)

### Added
- **Desaparecidos Terremoto Venezuela federated search** â€” `src/lib/dtv-api.ts`
  read-only client; `/api/missing-persons/search` queries Vigil Supabase and
  DTV API in parallel; results on `/` and `/buscar` with gray source badges and
  back-links. No DTV data stored in Vigil's database.
- **DTV facial recognition in photo search** â€” `/api/photo-search` also calls
  DTV `/identificar`; separate attributed section in `PhotoSearch` UI.
- **DTV center sync** â€” `POST /api/admin/sync-dtv-centers` (admin secret) imports
  collection points into `map_markers` with source attribution.
- **i18n** â€” DTV attribution strings in all 8 locales.

### Changed
- **`crisis.config.ts`** â€” DTV sister platform marked `integrated: true`.
- **Rate limits** â€” `/api/admin/sync-dtv-centers` (5/hr).
- **Docs** â€” archived `29-dtv-api-integration.md`; removed root prompt stub.

## [Unreleased] â€” 2026-06-30 (Claude AI, photo search, geo breakdown)

### Added
- **Claude AI assistant** â€” Floating `VigilAssistant` widget on all pages;
  `/api/assistant` streams SSE responses grounded in live Supabase data
  (map markers, orgs, events, USGS aftershocks). Graceful "Coming soon"
  when `ANTHROPIC_API_KEY` is unset.
- **Photo-based search** â€” `/api/photo-search` uses Claude Vision (Sonnet)
  to describe visible traits, then Haiku matches against public records.
  No biometric storage. UI on `/buscar` with privacy notice.
- **Venezuela geographic breakdown** â€” `estado`/`municipio`/`parroquia` on
  `missing_persons` and `map_markers` (migration `008`); cascading selects
  on `/reportar`; state filter chips on `/buscar`; `src/lib/venezuela-geo.ts`.
- **Statistics page** â€” `/estadisticas` real-time breakdown by estado
  (missing vs found alive) via Supabase Realtime.
- **Duplicate detection cron** â€” `/api/cron/dedup` daily at 08:00 UTC via
  `vercel.json` (Vercel Hobby limit); Claude Haiku flags probable duplicates.
- **Shared AI client** â€” `src/lib/ai/client.ts` for Anthropic config checks.

### Changed
- **Rate limits** â€” `/api/assistant` (30/hr) and `/api/photo-search` (10/hr).
- **Docs** â€” archived `27-claude-ai-facial-geo.md`; removed root prompt stub.
- **README** â€” live features table updated; AI/geo moved from Coming soon.

## [Unreleased] â€” 2026-06-30 (RSS/GDACS + community wall)

### Added
- **GDACS disaster alerts** â€” `src/lib/gdacs.ts` integrated into `/api/live-info`;
  GDACS (UN/EU) earthquake alerts shown on `/informacion` as independent
  verification alongside USGS and ReliefWeb.
- **RSS news aggregation** â€” `rss-parser` + `src/lib/rss.ts` with El Nacional,
  Efecto Cocuyo, and Prodavinci (Infobae Venezuela feed returned 404 at deploy
  time). Secondary tier on `/noticias` and `/informacion`, clearly labeled
  unverified. `/api/news-rss` route with 30-minute cache.
- **Community wall (Muro Comunitario)** â€” `supabase/migrations/007_community_wall.sql`,
  `/muro` page, `/api/community-wall/submit` and `/flag` routes, real-time
  feed, category badges, flag button (3 flags auto-hides). Rate limit: 5/hour/IP.
  Navigation entry between Calendario and Punto de Acopio. i18n in all 8 locales.

### Changed
- **Emergency banner** â€” removed IntÃ©rpretes link from sticky header; Cruz Roja
  and hotline unchanged. Removed `banner.interpreters` i18n keys.
- **Docs** â€” archived `26-rss-gdacs-community-wall.md`; removed root
  `CURSOR-RSS-GDACS-COMMUNITY-WALL.md` stub.

## [Unreleased] â€” 2026-06-30 (report button beside search)

### Added
- **Reportar button beside missing-persons search** â€” `MissingPersonSearch`
  now renders a primary "Reportar" CTA (Lucide `UserPlus`) immediately beside
  the search input, linking to `/reportar`. Responsive: side-by-side on â‰¥640px,
  stacked full-width below the search on mobile. Reuses the existing
  `nav.reportShort` i18n key (all 8 locales); keyboard-focusable with visible
  focus ring and 44px touch target.

## [Unreleased] â€” 2026-06-30 (resources seed + sister platforms)

### Added
- **Resource directory seed** â€” `supabase/seeds/002_resources_venezuelatebusca.sql`:
  5 organizations (Red Cross family search lines in Honduras, Argentina,
  Colombia; UNIMET structural engineers; RedQuipu) and 5 Caracas hospital
  map markers sourced from venezuelatebusca.com/resources. Applied to Supabase
  project `macmlvybpxdnzfviimvl`.
- **Two more sister platforms** â€” RedQuipu and Mapa de DaÃ±os Venezuela in
  `crisis.config.ts`; descriptions on `/informacion`; auto-listed on `/buscar`
  no-results via existing sister-platform filter.
- **Additional emergency hotlines** â€” compact reference list on `/informacion`
  (CICPC, Bomberos Chacao, municipal police, Defensa Civil, Digitel 112,
  TrÃ¡nsito 167) with venezuelatebusca.com/resources citation. i18n in all 8
  locales.

### Changed
- **Docs** â€” archived `25-resources-seed-and-sister-platforms.md`; removed root
  `CURSOR-RESOURCES-SEED-AND-SISTER-PLATFORMS.md` stub.

## [Unreleased] â€” 2026-06-30 (OG banner + sister platforms)

### Added
- **Open Graph / Twitter Card images** â€” `src/app/opengraph-image.tsx` and
  `src/app/twitter-image.tsx` generate 1200Ã—630 share banners via Next.js
  `ImageResponse` (DESIGN-SYSTEM ink/blue palette, Venezuela flag stripes).
  Root `layout.tsx` now exports `openGraph` and `twitter` metadata with
  `metadataBase` â†’ `https://vigil.youthewave.org`.
- **Sister missing-persons platforms** â€” Venezuela Te Busca and Desaparecidos
  Terremoto Venezuela added to `crisis.config.ts` (`sister-platform` type).
  Prominent no-results panel on `/buscar` with external links + report CTA.
  Dedicated section on `/informacion` with approximate-scale disclaimer.
  i18n strings in all 8 locales.

### Changed
- **Docs** â€” archived `23-og-social-banner.md` and `24-partner-platforms-link.md`;
  removed root `CURSOR-*.md` prompt stubs.

## [Unreleased] â€” 2026-06-30 (map accessible list toggle â€” closeable)

### Fixed
- **"Ver como lista" could open but not close** â€” On desktop the right column has a
  fixed height (`lg:h-[calc(100vh-44px-120px)]`) and the map's `.map-wrapper` is
  forced to `min-h-[400px]`. When the accessible list expanded, the map overflowed
  its flex cell and (being a `position:relative; z-index:0` layer) painted on top
  of the in-flow list `<section>`, intercepting the close click on the toggle
  (`elementFromPoint` over the toggle resolved to the Leaflet map div). The list
  `<section>` is now `relative z-10` so its toggle always paints above the map and
  stays clickable in both states (`src/components/map/MapAccessibleList.tsx`).
- **Open list could overflow the footer** â€” The right column is now
  `lg:overflow-y-auto` so a long expanded list scrolls within the column instead of
  bleeding past the bounded section (preserves the prior footer-overlap fix)
  (`src/app/page.tsx`).

### Added
- **List disclosure a11y hardening** â€” toggle now exposes `aria-controls` linking to
  the panel, `Escape` closes the open list and restores focus to the toggle
  (`src/components/map/MapAccessibleList.tsx`).

## [Unreleased] â€” 2026-06-30 (map/footer overlap â€” real fix)

### Fixed
- **Crisis map overlapping footer (root cause)** â€” On desktop the map cell used
  `lg:h-full` (100% of its flex-column section) while sharing that section with
  `AftershockAlert` + `MapAccessibleList` siblings plus padding/gaps. The map
  therefore overflowed its bounded grid cell (`lg:h-[calc(100vh-44px-120px)]`)
  and, because `.map-wrapper` is `position:relative; z-index:0` (a positioned
  layer), painted on top of the in-flow footer/legal bar. The prior
  `isolation: isolate` patch could not help because the overlap was geometric
  height-bleed, not a pure stacking issue. Map cell is now `lg:flex-1` so it
  fills only the space left after its siblings, keeping the section bounded and
  the footer in normal flow below (`src/app/page.tsx`).
- **Defense-in-depth stacking** â€” footer/legal bar is now `position:relative;
  z-index:1` so it always paints above the map's `z-0` stacking context even if
  any future bleed occurs (`src/app/layout.tsx`); z-index scale comment updated
  in `src/app/globals.css`.

## [Unreleased] â€” 2026-06-30 (README & metadata polish)

### Added
- **README** â€” Remarkable GitHub landing: live-demo badges, embedded production
  screenshots, consolidated Live vs Coming soon tables, security/RLS section,
  desktop a11y + collapsible sidebar (280px/64px), retractable map layers, PWA
  install UX, PFIF export marked live at `/api/pfif`.
- **screenshots/** â€” Playwright production captures (iPhone, iPad, desktop).

### Changed
- **GitHub repo metadata** â€” Description, homepage (`https://vigil.youthewave.org`),
  and topics refreshed to match current feature set.
- **docs/README.md** â€” Index verified against build-process archive.

### Verified
- **Domain typo sweep** â€” Zero functional `youtheway` references remain in
  committed code; intentional historical notes in docs only.

## [Unreleased] â€” 2026-06-30 (TestFlight QA + legal/z-index)

### Added
- **docs/build-process** â€” `20-testflight-full-qa.md`, `21-legal-links-zindex-fix.md`;
  root `CURSOR-*` stubs removed after archive verification.

### Fixed
- **Desktop sidebar** â€” widened expanded width from 240px (`w-60`) to 280px (`w-[280px]`);
  removed `truncate` on nav labels so longest Spanish label ("Actualizaciones Oficiales")
  renders on one line at 16px; collapsed icon-only mode unchanged.
- **Map z-index bleed** â€” `.map-wrapper` with `isolation: isolate` on `CrisisMap` outer div
  so Leaflet panes cannot overlap footer "Contacto" link.
- **CRITICAL RLS** â€” dropped `public_read_missing` policy on `missing_persons`; public reads
  must use `public_missing_persons` view only (`006_missing_persons_rls_fix.sql` applied).
  Notes API existence check now queries `public_missing_persons`.
- **Legal links** â€” verified `/privacidad`, `/terminos`, `/privacy`, `/terms` return 200;
  footer uses locale-aware `Link` paths and `CRISIS_CONFIG.legal.contactEmail` mailto.

### Security (verified)
- Anon-key direct `missing_persons` contact field query now returns `[]` (was leaking phone).
- Rate limit (5/hr missing-person submit), coordinate bounds, org approval gate: pass.
- `SUPABASE_SERVICE_ROLE_KEY` / `ANTHROPIC_API_KEY`: server-only modules only.

## [Unreleased] â€” 2026-06-30 (PWA, map layers, docs cleanup)

### Added
- **PWA install UX** â€” iOS Safari dismissible install banner (`IOSInstallBanner`,
  sessionStorage); Android/Chrome native install via `beforeinstallprompt` in MÃ¡s
  menu (`PwaInstallButton`, `usePwaInstall`); `src/lib/pwa-install.ts` helpers.
- **PWA icons** â€” `public/icons/icon-{72,192,512}x*.png` for manifest and
  `metadata.icons.apple` in `layout.tsx`.
- **Retractable desktop map layers** â€” panel defaults open on `lg+`, close button
  + Layers reopen control; preference in `localStorage` (`vigil-map-layers-open`);
  `aria-expanded` / `aria-controls`; i18n `map.layers.showLayers` / `hideLayers`.
- **i18n** â€” `pwa.install`, `pwa.iosBanner.*` in all 8 locales.
- **docs/build-process** â€” `19-pwa-nav-security-final.md`; root `CURSOR-*` stubs
  removed after archive verification.

### Fixed
- **Security verification** â€” confirmed `SUPABASE_SERVICE_ROLE_KEY` and
  `ANTHROPIC_API_KEY` only in server-only modules; zero matches in `.next/static/`.
- **Bottom nav** â€” verified `.mobile-bottom-nav` border/shadow/opaque surface in
  `globals.css` (from session 17).

## [Unreleased] â€” 2026-06-30 (sidebar + desktop a11y)

### Added
- **Collapsible desktop sidebar** â€” `lg+` sidebar toggles between 240px (icon +
  label) and 64px (icon-only) via bottom chevron control; preference persisted
  in `localStorage` (`vigil-sidebar-collapsed`); main content reflows in flex
  layout; `aria-expanded`, i18n labels, tooltips/`aria-label` on collapsed nav
  items (`Navigation`).
- **Skip-to-content link** â€” first focusable element in `<body>`, targets
  `#main-content` (`SkipToContent`, `layout.tsx`).
- **Map text alternative** â€” collapsible â€œVer como listaâ€ section listing
  aftershocks, needs, resources, and collection points as plain text
  (`MapAccessibleList`, homepage).
- **Custom map zoom controls** â€” keyboard-accessible +/- buttons with
  `aria-label`; Leaflet default zoom disabled (`MapZoomControls`, `CrisisMap`).
- **i18n** â€” `nav.collapseMenu` / `nav.expandMenu` / `nav.desktopNav` /
  `nav.mobileNav`, `a11y.skipToContent`, `map.viewAsList` / `map.zoomIn` / etc.
  in all 8 locales.
- **docs/build-process** â€” `18-desktop-accessibility.md`; root
  `CURSOR-DESKTOP-ACCESSIBILITY.md` stub; `docs/README.md` index updated.

### Fixed
- **Desktop accessibility (WCAG AA)** â€” global `*:focus-visible` outline in
  `globals.css`; distinguishing `aria-label` on desktop vs mobile nav; sr-only
  `h1` on `/` and `/buscar`; `main#main-content` landmark with `tabIndex={-1}`;
  form `aria-required` / `aria-describedby` / `role="alert"` errors on report
  form and feedback widget; MapLayers close button i18n; MÃ¡s button
  `aria-label`; icon-only control focus rings audited.
- **Duplicate nav a11y tree** â€” confirmed `hidden` / `lg:hidden` display:none
  hiding (not opacity/invisible).

## [Unreleased] â€” 2026-06-30 (accessibility & menu)

### Fixed
- **Type scale raised for accessibility (WCAG)** â€” body `13px â†’ 16px`,
  caption `11px â†’ 13px`, H3 `15px â†’ 17px`, H2 `18px â†’ 20px`, H1 `24px â†’ 26px`,
  display `32px â†’ 34px`; minimum font floor raised to 13px (`text-xs`/`text-[10px]`
  â†’ 13px). Applied across 42 component/page files plus `DESIGN-SYSTEM.md`.
- **`--vigil-muted` contrast** â€” `#94A3B8 â†’ #64748B` (â‰ˆ2.8:1 â†’ â‰ˆ4.6:1 on white,
  now passes WCAG AA for normal text); updated `globals.css`, `tailwind.config.ts`,
  and `DESIGN-SYSTEM.md`.
- **"MÃ¡s" menu** â€” converted from a side-anchored flyout (clipped off-screen in
  landscape) to a full-width **bottom-sheet** reusing the map-layers pattern:
  backdrop tap-to-close, explicit X button, Escape to close, body-scroll lock,
  focus trap + restore, `aria-modal`/`aria-haspopup`/`aria-expanded`, 44px tap
  targets (`Navigation`).
- **Feedback widget fixed position** â€” trigger button now rendered via
  `createPortal` to `<body>` (previously only the modal was portaled), so its
  `position: fixed` can never be broken by a transformed/filtered ancestor
  containing block (`FeedbackWidget`).
- **Bottom nav visual definition** â€” added `.mobile-bottom-nav` (opaque
  `--vigil-surface`, top border, soft upward shadow) so content no longer shows
  through while scrolling (`globals.css`, `Navigation`).

### Added
- **Short bottom-nav labels** â€” `nav.mapShort/searchShort/reportShort/needHelpShort`
  added to all 8 locales so primary tabs fit at the raised 13px floor.
- **`aria-current="page"`** on active sidebar, bottom-nav, and MÃ¡s-sheet links.
- **docs/build-process** â€” `17-accessibility-and-menu-fix.md` (archived prompt);
  root `CURSOR-ACCESSIBILITY-AND-MENU-FIX.md` reduced to a stub; `docs/README.md`
  index updated (also backfilled the missing `16-viewport-fix-and-proof.md` entry).

## [Unreleased] â€” 2026-06-30

### Fixed
- **Mobile landscape layout** â€” raised mobile/desktop breakpoint from `md` (768px)
  to `lg` (1024px) so phone landscape keeps bottom nav instead of desktop sidebar
  (`Navigation`, `layout`, `WeatherBar`, `FeedbackWidget`).
- **Dark mode fully removed** â€” deleted `.dark` CSS block from `globals.css`; zero
  `dark:` Tailwind classes remain; `darkMode: 'class'` in Tailwind (OS dark mode
  cannot trigger styles).
- **Home map in landscape** â€” mobile map uses `min(45vh,360px)` height instead of
  fixed viewport calc; `CrisisMap` min-height 240px on mobile.
- **Emergency banner** â€” `flex-wrap` so hotline button no longer overlaps map.
- **Map layer panel** â€” viewport-aware width `min(280px, calc(100vw - 24px))`.
- **Accessibility** â€” focus rings on layer checkboxes and feedback button; `nav.more`
  i18n key for mobile "More" menu.

### Added
- **Real translations** â€” generated pt/fr/it/zh/de/ru via `scripts/generate-translations.mjs`
  (Haiku); script now strips markdown fences and supports per-locale CLI args.
- **README banner** â€” `docs/assets/vigil-banner.svg` and shields.io badges in header.
- **docs/build-process** â€” `12-launch-ready.md`, `13-mobile-rebuild-and-translations.md`,
  `14-confirmed-mobile-bugs.md`, `15-deep-investigation-final.md`; root `CURSOR-*.md` stubs point to docs.

### Changed
- **docs/** â€” moved root `DEPLOYMENT.md` to `docs/architecture/DEPLOYMENT.md`; root stub
  retained; `docs/README.md` index updated with architecture and stub inventory.
- **PWA manifest** â€” `background_color` `#F8FAFC`, `theme_color` `#0F172A` (light only).

## [Unreleased] â€” 2026-06-30 (earlier)

### Fixed
- **Dark mode** â€” forced light as the true default. Declared `color-scheme: light`
  in `globals.css` and via a Next `viewport` export (`<meta name="color-scheme">`)
  plus inline `style` on `<html>`, stopping Chrome Auto Dark Theme (Android) from
  auto-inverting the UI. (No `next-themes`/`ThemeProvider` exists.)
- **Mobile layout** â€” `<main>` bottom padding now `calc(5rem + safe-area-inset)`
  so content never hides behind the bottom nav on notched devices; added
  `overflow-x: hidden` on `html, body` to prevent page-level horizontal scroll.
- **Footer hierarchy** â€” reworked the inline footer in `layout.tsx` into three
  clearly separated, quiet groups (open source/legal Â· credits Â· emergency
  disclaimer), each with a 1px `--vigil-border` top border and consistent 16px
  spacing. The "Atenax Project" link is now `--vigil-blue` with hover underline;
  the "not an emergency service" line uses `--vigil-body` weight with a 16px
  Lucide `AlertTriangle` icon (decorative, `aria-hidden`) instead of a loud red
  hotline button (tap-to-call already lives in the sticky EmergencyBanner). Added
  design tokens `--vigil-border`, `--vigil-body`, `--vigil-surface` to
  `globals.css` with `.dark` overrides for dark-mode-correct footer styling. No
  new i18n keys (reuses existing `footer.*` / `nav.*`).
- **Mobile + dark mode (verified)** â€” re-audited Part A: `color-scheme: light` on
  `:root` (+ `.dark` â†’ `dark`), the `viewport` `colorScheme` export, the inline
  `<html style={{ colorScheme: 'light' }}>`, the `calc(... + safe-area-inset)`
  main padding, `overflow-x: hidden`, and â‰¥44px nav touch targets were all
  already in place â€” no code gaps found.

### Changed
- **docs/build-process** â€” added `09-mobile-darkmode-fix.md` (moved from root
  `CURSOR-MOBILE-DARKMODE-FIX.md`) and `10-footer-hierarchy-fix.md`; renumbered the
  prior `09-docs-and-status.md` â†’ `11-docs-and-status.md`; added a build-process
  index to `docs/README.md`.

## [Unreleased] â€” 2026-06-29

### Added
- **`docs/` folder** â€” Architecture (`CLAUDE.md`, `DESIGN-SYSTEM.md`) and build-process prompts moved from repo root; `docs/README.md` index added.

### Changed
- **README**: documentation link, feature list rewritten to match actual codebase (live vs migration-gated vs coming soon).
- **DEPLOYMENT**: pointer to `docs/` for architecture references.
- **README / DEPLOYMENT / 11-docs-and-status**: migration 005 + seed marked applied on production Supabase (`macmlvybpxdnzfviimvl`).

## [Unreleased] â€” 2026-06-29 (prior)

### Added
- **Public notes system** â€” `missing_person_notes` table, realtime thread on `/buscar/[id]`, API at `/api/missing-persons/notes`.
- **Claim-token management** â€” passwordless `/mi-reporte/{token}` and `/mi-intercambio/{token}` pages; claim links shown on submit with copy button.
- **Collection point registration** â€” `/punto-de-acopio` form â†’ `map_markers` with hours, categories, organizer; amber markers on crisis map.
- **Events calendar** â€” `/calendario` lightweight list view with category filters, realtime updates, Venezuela timezone labels.
- **Weather + time bar** â€” `/api/weather` (Open-Meteo, free) + slim ambient bar below emergency banner.
- Migration `005_notes_claims_calendar.sql` â€” claim tokens, notes, events, collection-point fields, contact-request `viewed` flag.
- Nav entries: Calendario, Punto de Acopio (desktop sidebar + mobile MÃ¡s menu).
- i18n keys for notes, claim, weather, calendar, collectionPoint (8 locales).

### Changed
- **README**: new features listed; Coming soon table updated for migration + Resend claim emails.
- **DEPLOYMENT**: migration 005 step, Realtime tables list, Open-Meteo note (no env var).
- **Missing person submit** â€” returns `claimUrl`; optional `contact_email` triggers Resend claim link when configured.

## [Unreleased] â€” 2026-06-29 (prior)

### Added
- **Official email integration** â€” `vigil@youthewave.org` and `vigil.support@youthewave.org` in `crisis.config.ts`; footer contact link; Resend-powered feedback notifications (`src/lib/email/notify.ts`).
- **PWA runtime caching** â€” `@ducanh2912/next-pwa` with network-first Supabase, stale-while-revalidate USGS/ReliefWeb, cache-first images, and `/offline` fallback page.
- **Offline form queue** â€” missing-person and map-marker submissions queue in `localStorage` and flush on reconnect (`src/lib/offline-queue.ts`).
- **Network status banner** â€” â€œshowing saved dataâ€ indicator when offline.
- **Footer credits** â€” â€œMade with hope and love for Venezuelaâ€ + Atenax Project link (ES/EN i18n).
- `RESEND_API_KEY` in `.env.example`.

### Changed
- Removed unused `framer-motion` dependency.
- **README**: official contact emails, PWA details, Built By section, Coming soon table (Resend alerts, push notifications, screenshots).
- **DEPLOYMENT**: Resend setup steps and `RESEND_API_KEY` in Vercel env table.

## [Unreleased] â€” 2026-06-29 (prior)

### Added
- **Live information hub** (`/informacion`) â€” auto-refreshing USGS + ReliefWeb feeds, manual crisis stats, realtime `infrastructure_status` from Supabase.
- **`/api/live-info`** â€” aggregates USGS significant quakes and ReliefWeb reports (5-minute cache).
- **Rescuer safety presence** (`/equipo-activo`) â€” field check-in, SOS button, 4-hour auto-expire, map layer "Equipos Activos".
- **Feedback widget** â€” floating support button on all pages; admin review at `/admin/feedback` (password-gated via `VIGIL_ADMIN_SECRET`).
- Migration `004_golive_features.sql` â€” `infrastructure_status`, `rescuer_presence`, `feedback` tables with Realtime.
- Realtime subscriptions for map markers, missing persons search/feed updates, rescuer presence, infrastructure status.
- `CRISIS_CONFIG.siteUrl` â€” canonical production domain `https://vigil.youthewave.org`.

### Fixed
- **Production client-side crash** ("Application error: a client-side exception
  has occurred"). Root cause: realtime websocket subscriptions were opened
  against the placeholder Supabase instance (`wss://placeholder.supabase.co`)
  while the CSP `connect-src` directive did not allow `wss://*.supabase.co`,
  so the blocked socket bubbled up as an unhandled exception that took down the
  whole page render.

### Added
- `src/app/error.tsx` and `src/app/global-error.tsx` â€” friendly, recoverable
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
  states â€” no websocket is attempted at all.
- **Middleware**: skips the Supabase auth session refresh entirely when Supabase
  is unconfigured, avoiding network calls to a placeholder host.
- **README**: redesigned into a modern GitHub landing (centered header, badges,
  six user groups, feature list, tech-stack table, quick start, one-file deploy
  guide, data-protection statement). Contributors & Acknowledgments preserved.

## [0.1.0] â€” 2026-06-28

### Added
- Initial Vigil crisis platform for the Venezuela 2026 earthquake response.
- Missing persons board (PFIF-compatible), USGS crisis map, resource exchange
  board, volunteer marketplace, organization directory, official updates feed.
- Full data-protection layer (contact masking, RLS, rate limiting, coordinate
  validation), 8-language i18n, PWA manifest, privacy policy + terms.
- Supabase schema migrations `001`â€“`003`, auth setup, and real-data seed.
