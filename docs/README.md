# Vigil Documentation

**Live:** [vigil.youthewave.org](https://vigil.youthewave.org) · **Repo:** [github.com/Atenaxproject/vigil](https://github.com/Atenaxproject/vigil)

This folder contains the architecture decisions, build process, and
development prompts used to create Vigil. Kept public intentionally —
if you're deploying Vigil for a different crisis or contributing code,
this shows the reasoning behind every major decision.

## Structure

- `architecture/` — Tech stack, design system, deployment guide, and AI agent
  instructions that govern ongoing development
- `build-process/` — The sequential build prompts used to construct Vigil
  from scratch, including the Venezuela 2026 data seed, privacy
  architecture decisions, and feature specs
- `assets/` — Shared documentation assets (e.g. README banner SVG)

## Architecture index

Living specs and operational guides:

- `architecture/CLAUDE.md` — tech stack, constraints, and agent instructions
- `architecture/DESIGN-SYSTEM.md` — UI tokens, typography, and component rules
- `architecture/DEPLOYMENT.md` — Supabase, Vercel, DNS, Resend, and local dev setup

## Build-process index

Sequential prompts/specs used to construct Vigil (historical record):

- `01-seed-data.md` — Venezuela 2026 data seed
- `02-golive-fixes.md` — go-live master fixes
- `03-email-integration.md` — official email + Resend
- `04-pwa-and-credits.md` — PWA performance audit + footer credits
- `05-messaging-calendar-weather.md` — notes, claims, calendar, weather bar
- `09-mobile-darkmode-fix.md` — force light mode, mobile responsive audit
- `10-footer-hierarchy-fix.md` — footer visual hierarchy restructure
- `11-docs-and-status.md` — documentation organization + status report
- `12-launch-ready.md` — pre-launch QA, README banner, domain sweep
- `13-mobile-rebuild-and-translations.md` — dark mode removal, mobile audit, i18n generation
- `14-confirmed-mobile-bugs.md` — landscape layout breakpoint + confirmed iPhone fixes
- `15-deep-investigation-final.md` — proof-required mobile investigation and viewport audit
- `16-viewport-fix-and-proof.md` — viewport meta fix and device-proof verification
- `17-accessibility-and-menu-fix.md` — type-scale accessibility revision, Más bottom-sheet, feedback widget fix, bottom-nav definition
- `18-desktop-accessibility.md` — desktop WCAG AA pass: skip link, focus-visible, ARIA, map list alternative, collapsible sidebar
- `19-pwa-nav-security-final.md` — PWA install UX (iOS banner, Android prompt), bottom-nav definition, critical security gate
- `20-testflight-full-qa.md` — sidebar width fix, full functional TestFlight QA, RLS security audit
- `21-legal-links-zindex-fix.md` — legal page links verification, map z-index bleed fix (`isolation: isolate`)
- `22-claude-code-catchup-and-fix.md` — autonomous catch-up: prompt-vs-done audit, default branch switch, domain typo cleanup, live route health check (completed)
- `23-og-social-banner.md` — Open Graph / Twitter Card social share images via ImageResponse
- `24-partner-platforms-link.md` — sister missing-persons platform links (Venezuela Te Busca, Desaparecidos Terremoto Venezuela)
- `25-resources-seed-and-sister-platforms.md` — Red Cross family search orgs, Caracas hospital markers, RedQuipu + Mapa de Daños sister platforms, additional emergency hotlines on `/informacion`
- `26-rss-gdacs-community-wall.md` — GDACS disaster alerts, Venezuelan RSS news tier, community wall (`/muro`)
- `27-claude-ai-facial-geo.md` — Claude AI assistant (live data Q&A), photo-based search (vision, no biometrics), Venezuela geographic breakdown, duplicate detection cron, `/estadisticas`
- `28-readme-final-update.md` — README final update session
- `29-dtv-api-integration.md` — federated search with Desaparecidos Terremoto Venezuela API (read-only, attributed results, photo ID, center sync)
- `30-dtv-deep-integration.md` — DTV attribution UX, live metrics, paginated center sync cron, /red featured partner, UX cleanup
- `31-page-audit-and-refine.md` — full page audit: empty states, org directory rebuild, route consolidation, DTV widget on /informacion
- `32-dtv-geocode-and-stats-fix.md` — Nominatim geocoding for DTV centros, cursor-pagination metrics counts, external_id dedup
- `AGENTS.md` — agent operating notes

> Numbers `06`–`08` were planned (domain diagnostic, typo fix, partner outreach)
> but those prompts were absorbed into other sessions and never archived as separate files.

## Root stubs

These files remain at the repository root as thin pointers for Cursor workspace rules
and common doc links; canonical content lives under `docs/`:

- `CLAUDE.md` → `architecture/CLAUDE.md`
- `DEPLOYMENT.md` → `architecture/DEPLOYMENT.md`

Historical `CURSOR-*.md` convenience stubs were removed from the root after their
full content was archived under `docs/build-process/`.

## For Contributors

Read `architecture/CLAUDE.md` first — it governs the tech stack and
constraints for any new feature. Read `architecture/DESIGN-SYSTEM.md`
before touching any UI. For deployment, see `architecture/DEPLOYMENT.md`.
The `build-process/` files are historical record,
useful for understanding why things were built the way they were, but
are not living specs — check actual code as source of truth.
