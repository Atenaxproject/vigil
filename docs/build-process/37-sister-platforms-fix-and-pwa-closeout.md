# Build Prompt 37 — Sister Platforms Config Fix + PWA Closeout
Working number — confirm against the actual current max in docs/build-process/ before
committing. Last confirmed file was 36-repo-audit-pwa-cleanup.md; if nothing else landed
in between, this is 37.

## Context
Closes Finding A from Phase 3 of build prompt 36. README's Sister Platforms table lists
7 platforms; crisis.config.ts only has 4, so the live /red page under-lists what Vigil
claims to link. Decision: fix the config, not the README — /red should honestly list
every legitimate citizen platform, matching Vigil's standing link-only, no-scraping
commitment. Also formally closes Phase 2 (PWA) now that iOS install has been confirmed
working on a real device.

## Step 1 — Add three platforms to crisis.config.ts
Match the exact existing object shape/interface used by the current four entries — do not
invent a new shape. Add:

- **CIVIS Venezuela** — civisvenezuela.com — Missing persons, damage maps, supply points
- **SOS Venezuela 2026** — sosvenezuela2026.com — Live collaborative crisis mapping
- **Red Venezuela Activa** — redvenezuelaactiva.com — Volunteer coordination

## Step 2 — Verify
Confirm /red now renders all 7 platforms and matches the README's Sister Platforms table
exactly — same 7 names. This is a link-only addition, no scraping, no data storage from
these platforms, consistent with how the existing 4 are implemented.

## Step 3 — Close out PWA (Phase 2) in the audit trail
Orlando has manually verified on a real iOS device that Safari's Add to Home Screen now
correctly installs the app in standalone mode. Update CATCHUP-REPORT.md to mark PWA as
device-confirmed (not just source-verified, which is what the last pass had). No further
PWA work needed unless a new issue is reported.

## Step 4 — Standard close
Save this file to docs/build-process/ under its confirmed number, delete the root copy,
commit, push to production.

## Definition of done
- /red shows all 7 sister platforms, matching README.
- CATCHUP-REPORT.md shows PWA as device-confirmed.
- File archived under correct number, root copy removed.
- Deployed live, production URL returns 200.

---

## Implementation notes (executed 2026-07-02)

- Added CIVIS Venezuela, SOS Venezuela 2026, Red Venezuela Activa to `crisis.config.ts`
  with `sister-platform` type and slugs for i18n.
- Extended `red.platforms.*` keys in all 8 locale files; updated `RedNetworkClient.tsx` slug union.
- `CATCHUP-REPORT.md` §5.3 marked PWA device-confirmed; Finding A resolved.
