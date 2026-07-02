# Build Prompt 36 — Repo Audit, PWA Fix, Redundancy Cleanup, File Relocation

**Date:** 2026-07-02

## Phase 1 — Audit + README update ✅

### Changes since last README update (72ca1de, 2026-07-01)

| Commit | What landed |
|---|---|
| `d2cdc78` | DTV Nominatim geocoding, external_id dedup, 85 centers importable |
| `0f61f32` | Full UNIQUE constraint on `map_markers.external_id` |
| `d4f3c9d` | Vigil brand favicon — V. mark, all sizes including `apple-touch-icon.png` |
| `cbc0bdd` | Connectivity/comms layer — WiFi, Starlink, cell signal on map + `/conectividad` route |
| `331d18f` | iOS PWA meta tags, informacion hub dedup, crisis stats updated to 2026-07-01 |

### New domain

`vigil.youthewave.com` → 308 permanent redirect → `vigil.youthewave.org` (Vercel-hosted, Cloudflare DNS-only CNAME).

### README.md changes

- Both domains added to header link line
- `What's live now` date updated to 2026-07-02
- Connectivity/comms layer added to core crisis tools table
- Connectivity/comms layer added to Project Status — July 2026 Live Now list

### CATCHUP-REPORT.md

Phase 5 section added with: commit log, domain redirect confirmation, full PWA source audit, redundancy findings, Phase 4 (crisis stats) confirmation.

### GitHub description

Updated to mention connectivity layer and both domains.

---

## Phase 2 — PWA audit (source-level) ✅

All checks pass from source. Lighthouse cannot run remotely — must be run in Chrome DevTools on a live device or in CI.

| Check | Result |
|---|---|
| `manifest.json` — `id`, `scope`, `start_url`, `display: standalone` | ✅ |
| `apple-touch-icon.png` — 180×180 PNG (not SVG) | ✅ |
| `appleWebApp.capable`, `title`, `statusBarStyle` | ✅ (added commit `331d18f`) |
| `IOSInstallBanner` — iOS Safari only, hides in standalone | ✅ |
| Manifest maskable icons 192 + 512 | ✅ |
| `viewport` — `width: device-width`, `initialScale: 1` | ✅ |

---

## Phase 3 — Redundancy findings (report only, no changes made) ✅

### Finding A — Sister platforms list out of sync

- `README.md § Sister Platforms` hardcodes **7 platforms**
- `crisis.config.ts partnerLinks` has **4 sister-platform entries**
- Missing from config (and therefore from `/red` page): CIVIS Venezuela, SOS Venezuela 2026, Red Venezuela Activa
- **Pending Orlando's decision:** add 3 platforms to config, or trim README to match

### Finding B — Root CLAUDE.md

✅ Still a 4-line pointer. No content drift.

### Finding C — DESIGN-SYSTEM.md

✅ Only exists at `docs/architecture/DESIGN-SYSTEM.md`. No root-level stub.

### Finding D — i18n connectivity keys

EN/ES got 55 keys in `cbc0bdd`; auto-generated locales (FR/IT/PT/DE/RU/ZH) got 45. 10 missing keys fall back to ES at runtime — no broken UI, but translations are incomplete. Low urgency.

### Finding E — Informacion hub

✅ Already deduped in `331d18f` — no action needed.

---

## Phase 4 — 35-crisis-statistics-update.md ✅

Execution confirmed in commit `331d18f`:
- `STATS_VERIFIED_DATE = '2026-07-01'`
- Deaths: `2,295` · Injured: `11,267` · Missing: `~50,000 estimado` (via i18n key with qualifier)
- All 8 locale files updated with source keys
- File lives at `docs/build-process/35-crisis-statistics-update.md`; no root copy
