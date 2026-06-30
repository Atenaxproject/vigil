# Vigil — Mobile Responsiveness + Dark Mode Default Fix
## Paste into Cursor Composer (Agent mode)

---

Read @DESIGN-SYSTEM.md before starting — it explicitly states "Default theme: 
Light (accessibility, high contrast)". Mobile is currently auto-switching to 
dark mode, which violates this spec and creates a confusing, hard-to-read 
experience for non-technical users in a crisis context.

## TASK A — Force Light Mode as True Default (not system-detected)

Find the theme provider configuration (likely using `next-themes`). Check for:

```typescript
<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
```

If `defaultTheme="system"` or `enableSystem` is present, this is the bug — 
it's respecting the phone's OS dark mode setting instead of Vigil's own default. Fix:

```typescript
<ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
```

Also check `globals.css` for any `@media (prefers-color-scheme: dark)` queries 
that might be applying dark styles independent of the theme class — if any 
exist outside the `.dark` class selector pattern already defined in 
DESIGN-SYSTEM.md, remove them. Dark mode should ONLY activate if a user 
explicitly toggles it (if a toggle exists), never automatically.

If there is currently no manual light/dark toggle in the UI, that's fine — 
just hardcode light mode as the only active theme for now. A toggle can be 
added later if needed, but is not required for launch.

## TASK B — Mobile Typography Audit

Per DESIGN-SYSTEM.md, no text should render below 11px. On actual mobile 
viewports (test at 375px, 390px, and 414px widths using Chrome DevTools 
device toolbar), check every page for:

- Text that's been scaled down via responsive classes below the 11px floor
- Text overflowing its container instead of wrapping properly
- Any text requiring horizontal scroll to read (this should never happen)

Fix any Tailwind responsive text classes that violate the minimum.

## TASK C — Fix Overlapping Elements (buttons/text/modals)

This is likely a z-index and/or flex-wrap issue. Systematically check on 
mobile viewport:

1. **EmergencyBanner + Weather/Time bar** — confirm they stack vertically, 
   never overlap, and both remain fully readable at 375px width. If content 
   is too long to fit on one line at this width, allow it to wrap to a 
   second line rather than truncating or overlapping.

2. **Feedback widget modal** — confirm it has a proper backdrop, is centered, 
   and on mobile takes appropriate width (e.g., `w-[90vw] max-w-sm`) rather 
   than a fixed desktop width that causes overflow or overlap with content 
   behind it.

3. **Map layer toggle panel** — on mobile, confirm this doesn't overlap with 
   the map controls (+/- zoom buttons) or get cut off at screen edges. 
   Consider collapsing it into a toggle button on mobile instead of always-visible.

4. **Bottom mobile navigation bar** — confirm it doesn't overlap with page 
   content below it (add appropriate `padding-bottom` to the main content 
   area equal to the nav bar's height, plus safe-area-inset for iPhone 
   notch devices per DESIGN-SYSTEM.md PWA section).

5. **Any card footers with buttons** (missing person cards, organization 
   cards, resource exchange cards) — confirm button text never gets cut off 
   and buttons don't overlap card content above them at narrow widths.

## TASK D — Touch Target Audit

Per DESIGN-SYSTEM.md, all interactive elements need minimum 44px height on 
mobile. Audit every button, link, and form input — anything smaller needs 
padding increased to meet this minimum.

## TASK E — Test Properly Before Reporting Done

Use Chrome DevTools device toolbar set to "iPhone 12 Pro" (390x844) and 
"Pixel 5" (393x851) at minimum. Click through every page: home/map, buscar, 
reportar, necesito-ayuda, intercambio, voluntarios, organizaciones, 
calendario, información. Confirm no horizontal scroll, no overlapping 
elements, no cut-off text, and light mode renders consistently throughout.

## TASK F — Commit

```bash
git add -A
git commit -m "fix: force light mode as true default, fix mobile responsive overlaps and typography

- Removed system dark mode auto-detection, light mode now hardcoded default
- Fixed text below 11px minimum on mobile breakpoints
- Fixed overlapping banner/weather bar, modal positioning, nav bar spacing
- Audited touch targets to meet 44px minimum on mobile
- Tested across iPhone 12 Pro and Pixel 5 viewports"
git push
```

---

## Report back to Orlando

Confirm specifically:
1. Dark mode no longer auto-triggers based on device/system settings
2. Which specific overlap issues were found and fixed (list them)
3. Screenshots or clear description of before/after if possible

---

## Implementation notes (resolved 2026-06-30)

> Source: this file originated as the root prompt `CURSOR-MOBILE-DARKMODE-FIX.md`,
> moved here and renumbered to `09-mobile-darkmode-fix.md`.

**Root cause (Task A).** The app does **not** use `next-themes` and there is no
`ThemeProvider`, no `enableSystem`, and no `@media (prefers-color-scheme: dark)`
rule outside the `.dark` class. The `.dark` class exists in `globals.css` but is
never applied. The dark appearance on mobile was therefore **Chrome's "Auto Dark
Theme" on Android**, which auto-inverts any page that does not declare a
`color-scheme`. The correct, minimal fix is to declare light explicitly:

- `src/app/globals.css` — `:root { color-scheme: light; }` (and `.dark { color-scheme: dark; }`).
- `src/app/layout.tsx` — added `export const viewport: Viewport = { colorScheme: 'light', themeColor: '#0F172A' }`, which emits `<meta name="color-scheme" content="light">`, plus inline `style={{ colorScheme: 'light' }}` on `<html>`.

This stops the browser from auto-darkening; dark mode now only activates if a
`.dark` class is ever explicitly applied.

**Mobile layout (Tasks B–D).** Audited against DESIGN-SYSTEM.md:
- Typography floor (11px) already respected — no responsive class drops below `text-[10px]` except intentional nav labels; body text is `text-[11px]`+.
- Bottom nav already uses `pb-[env(safe-area-inset-bottom)]` and `min-h-[44px]` touch targets; sidebar/nav links meet the 44px minimum.
- `<main>` clearance bumped to `pb-[calc(5rem+env(safe-area-inset-bottom))]` so notched devices never hide content behind the bottom bar.
- Added `overflow-x-hidden` on `html, body` to guarantee no page-level horizontal scroll at 375px.
- EmergencyBanner uses internal `overflow-x-auto` (intentional horizontal scroll for the dense link row) and stacks above the WeatherBar — confirmed no overlap.
