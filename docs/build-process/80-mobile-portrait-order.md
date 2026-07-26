# 80 — Mobile Portrait Layout Order

**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## What this slice covers (safe summary)

Portrait-mode polish for the shared shell (trapped status/emergency bars, dead vertical space, FAB/footer overlap, top control density) so Venezuela and future deploys inherit one layout.

## Hard constraints (public)

- Presentational only — no auth, RLS, `src/lib/security/`, schema, or emergency-number / `critical: true` string changes.
- Light mode only; existing design tokens; no new component library.
- `scripts/visual-check.mjs` proof for `/`, `/buscar` (list), and map view — mobile portrait and desktop.
- Independent of prompt 79 (own branch).

## Private material (not in this stub)

Full issue write-ups and acceptance checklist live under `docs/evaluations/archive-from-public/docs/build-process/80-mobile-portrait-order.md`.

## Status

Implementation + visual-check proof on `fix/mobile-portrait-order` / PR #24 (2026-07-26). Screenshots under `screenshots/` + `public/screenshots/` (`home-*`, `buscar-*`).  
**Follow-up shipped (#26):** emergency carrier chip strip hardened for real mobile touch pan + scroll-edge fades; `/informacion` axe contrast fixed.
