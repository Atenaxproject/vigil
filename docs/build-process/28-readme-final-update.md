# 28 — README Final Update & Repo Description Sync

**Date:** 2026-06-30

## What changed

Comprehensive README rewrite to reflect all features that are live as of the Venezuela 2026 earthquake response deployment.

### Sections added / updated

| Section | Change |
|---|---|
| `## What Vigil Does` | New section with four audience groups (families, rescue teams, organizations, everyone) — replaces vague bullet list with accurate feature descriptions |
| `## Tech stack` | Added compact one-liner stack summary above the existing table: Next.js · Supabase · Leaflet · Vercel · Cloudflare · Claude AI · next-intl · USGS · GDACS · ReliefWeb · Open-Meteo · PFIF 1.4 |
| `## Project Status` | Replaced `## Coming soon` with full ✅ Live Now (24 items) / 🔧 In Progress (5 items) / 🔜 Coming Soon (4 items) — all items verified against source before listing |
| `## Sister Platforms` | New section with 7-platform table linking to citizen-run platforms responding to the same crisis |
| GitHub description | Updated to reflect Claude AI, photo search, PFIF, 8-language scope |
| GitHub topics | Replaced all previous topics with: `ai`, `claude-ai`, `missing-persons`, `crisis-response`, `humanitarian`, `pwa`, `nextjs`, `supabase`, `venezuela`, `open-source` |

### Verification performed before writing

- All 27 page routes confirmed against `src/app/*/page.tsx`
- All 27 API routes confirmed against `src/app/api/`
- All DB tables confirmed against `supabase/migrations/`
- New components confirmed: `EstadisticasClient`, `CommunityWall`, `PhotoSearch`, `VigilAssistant`, `src/lib/gdacs.ts`
- Every item in ✅ Live Now is traceable to a real source file

### What was NOT changed

- Visual header (banner SVG, badges, taglines)
- `## Why Vigil` section (still accurate)
- `## Screenshots` section
- `## What's live now` tables (already updated in prior session)
- Quick start, Deploy, Built by, License sections
