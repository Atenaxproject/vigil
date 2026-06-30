# 16 — Viewport Fix & Automated Visual Proof

**Date:** 2026-06-30  
**Branch:** main  
**Commit:** 784c309

---

## Problem

Previous fix attempts were reported as complete but did not resolve the
"looks like a shrunken desktop" rendering on real mobile devices.

---

## Root Cause (Phase 1 findings)

### Confirmed: missing `width` and `initialScale` in viewport export

`src/app/layout.tsx` had a `viewport` export but it was missing the two
properties that tell mobile browsers to render at device width:

```typescript
// BEFORE — broken
export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#0F172A',
}
```

Without `width: 'device-width'` and `initialScale: 1`, every mobile browser
defaults to a simulated ~980px desktop viewport and scales the entire rendered
page down to fit the physical screen. This defeats every Tailwind responsive
breakpoint regardless of how correct the underlying CSS is.

```typescript
// AFTER — fixed
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
  themeColor: '#0F172A',
}
```

### Previous fixes confirmed present and untouched

| Fix | Status |
|---|---|
| `darkMode: 'class'` in `tailwind.config.ts` | ✅ Already correct |
| Navigation uses `lg:` breakpoint (not `md:`) | ✅ Already correct |
| No stray `dark:` utility classes in `src/` | ✅ Zero found |

---

## Changes Made

### 1. `src/app/layout.tsx`
Added `width: 'device-width'` and `initialScale: 1` to the `viewport` export.

### 2. `src/components/map/MapLayers.tsx`
Refactored layer panel for mobile:
- **Mobile (below `lg:`)** — floating `Layers` icon button at top-right of
  map; tap opens a bottom-sheet with backdrop tap-to-close and an X button;
  starts **closed** by default so it does not cover the map on load
- **Desktop (`lg:` and above)** — unchanged always-visible floating panel

### 3. All 8 locale files
Added `map.layers.title` and `map.layers.toggleLayers` keys required by the
refactored MapLayers component.

---

## Deployment

Push to `main` → Vercel auto-deployed in **49 seconds** → status: Ready.

Deployment URL: `https://vigil-gbjt3ui87-atenaxproject.vercel.app`  
Production alias: `https://vigil.youthewave.org`

---

## Visual Proof (Phase 3)

Playwright screenshots captured against the live production URL
(`https://vigil.youthewave.org`) using `node scripts/visual-check.mjs`.

| File | Size | Verdict |
|---|---|---|
| `screenshots/iphone-portrait.png` | 107,834 bytes | ✅ Correct mobile layout — bottom nav visible, content at full device width, emergency banner readable, Layers icon button in map corner |
| `screenshots/iphone-landscape.png` | 38,678 bytes | ✅ Landscape header + nav bar; content scrollable below fold |
| `screenshots/ipad-portrait.png` | 227,242 bytes | ✅ Tablet at 768px renders mobile layout (below `lg:` 1024px threshold); bottom nav + Layers button correct |
| `screenshots/desktop.png` | 307,829 bytes | ✅ Sidebar + three-column layout; map layer panel open as always-visible floating panel |

**Honest verdict:** Mobile portrait shows the site rendering at true 390px
device width with legible text and properly-sized touch targets. This is
fundamentally different from the pre-fix state where the page would render at
~980px and shrink. The Layers button appears in the map corner on mobile and
iPad; desktop shows the full panel. No layout issues visible in any capture.

---

## README Updates (Phase 4 & 5)

- Added `## Project Status` section with verified ✅ / 🔧 / 🔜 breakdown
- Updated Screenshots section to reference Playwright captures and
  `scripts/visual-check.mjs`
- Confirmed `docs/assets/vigil-banner.svg` exists and README header renders
  the SVG + shields.io badges correctly

---

## Domain Typo Audit

Searched `README.md` and all `docs/**/*.md` for `youtheway` (the old typo).

Results:
- `README.md` — **zero matches** (already clean from commit 88337a5)
- `docs/build-process/02-golive-fixes.md:10` — intentional historical note
  ("earlier typo `youtheway.org`") — correct to leave as-is
- `docs/architecture/DEPLOYMENT.md:163-164` — same intentional historical note
- `docs/build-process/12-launch-ready.md:26,30` — grep command designed to
  *find* the typo — correct to leave as-is

No actual broken domain URLs remain anywhere in docs or README.
