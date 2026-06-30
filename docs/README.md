# Vigil Documentation

This folder contains the architecture decisions, build process, and
development prompts used to create Vigil. Kept public intentionally —
if you're deploying Vigil for a different crisis or contributing code,
this shows the reasoning behind every major decision.

## Structure

- `architecture/` — Tech stack, design system, and AI agent instructions
  that govern ongoing development (`CLAUDE.md`, `DESIGN-SYSTEM.md`)
- `build-process/` — The sequential build prompts used to construct Vigil
  from scratch, including the Venezuela 2026 data seed, privacy
  architecture decisions, and feature specs

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
- `AGENTS.md` — agent operating notes

## For Contributors

Read `architecture/CLAUDE.md` first — it governs the tech stack and
constraints for any new feature. Read `architecture/DESIGN-SYSTEM.md`
before touching any UI. The `build-process/` files are historical record,
useful for understanding why things were built the way they were, but
are not living specs — check actual code as source of truth.
