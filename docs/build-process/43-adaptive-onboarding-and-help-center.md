# 43 — Adaptive Onboarding, Role-Based Navigation, Emergency Contact Bar & Help Center
## Prepared by Claude for Cursor Agent — single-pass execution
## Context: Orlando Toro / youthewave · July 2026
## Status: COMPLETED 2026-07-04

Presentational-only UX round: six view modes + "Ver todo", first-visit mode picker below emergency bar, header mode switcher, client-side nav filtering, per-mode mini-guides, and `/ayuda` help center from `help-center-structure.md`.

**Hard constraint:** No RLS, auth, or API behavior changes.

---

## Deliverables

- `src/config/viewMode.config.ts` — mode taxonomy and route visibility
- `src/hooks/useViewMode.ts` — `localStorage.vigil_view_mode`
- `src/components/onboarding/*` — ModePicker, ModeSwitcher, ModeMiniGuide, ViewModeProvider
- `src/components/layout/EmergencyBanner.tsx` — 911 primary, expandable "Más contactos"
- `src/components/layout/AppHeader.tsx` — mode switcher in header
- `src/components/help/HelpCenter.tsx` + `src/app/ayuda/page.tsx`
- `src/components/layout/Navigation.tsx` — mode-filtered nav, `/ayuda` always visible
- i18n: `viewMode`, `helpCenter` sections in all 8 locale files (Spanish source)

---

(Full prompt text preserved in git history; see original NEXT-PROMPT-adaptive-onboarding-and-help-center.md commit.)
