# Vigil Documentation

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
- `AGENTS.md` — agent operating notes

> Numbers `06`–`08` were planned (domain diagnostic, typo fix, partner outreach)
> but those prompts were absorbed into other sessions and never archived as separate files.

## Root stubs

These files remain at the repository root as thin pointers for Cursor `@` mentions
and workspace rules; canonical content lives under `docs/`:

- `CLAUDE.md` → `architecture/CLAUDE.md`
- `DEPLOYMENT.md` → `architecture/DEPLOYMENT.md`
- `CURSOR-LAUNCH-READY.md` → `build-process/12-launch-ready.md`
- `CURSOR-MOBILE-REBUILD-AND-TRANSLATIONS.md` → `build-process/13-mobile-rebuild-and-translations.md`
- `CURSOR-CONFIRMED-MOBILE-BUGS.md` → `build-process/14-confirmed-mobile-bugs.md`
- `CURSOR-DEEP-INVESTIGATION-FINAL.md` → `build-process/15-deep-investigation-final.md`

## For Contributors

Read `architecture/CLAUDE.md` first — it governs the tech stack and
constraints for any new feature. Read `architecture/DESIGN-SYSTEM.md`
before touching any UI. For deployment, see `architecture/DEPLOYMENT.md`.
The `build-process/` files are historical record,
useful for understanding why things were built the way they were, but
are not living specs — check actual code as source of truth.
