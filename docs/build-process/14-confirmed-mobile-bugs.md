# Vigil — Confirmed Mobile Bugs (from real device screenshots)

> **Production status as of 2026-06-30**
>
> | Bug | Status |
> |---|---|
> | BUG 1 — Dark mode via OS (`darkMode: 'media'` or `.dark` CSS) | Fixed — `darkMode: 'class'`, `.dark` removed, `color-scheme: light` |
> | BUG 2 — Landscape shows desktop sidebar (`md:` at 768px) | Fixed — layout switch at `lg:` (1024px) |
> | BUG 3 — Hotline button overlapping map in landscape | Fixed — banner wraps; mobile layout + map height constraints |
> | BUG 4 — Layer panel cut off at screen edge | Fixed — `w-[min(280px,calc(100vw-24px))]` |
> | BUG 5 — Accessibility (focus, labels) | Fixed — checkbox focus rings, label associations on layer toggles |

## Paste into Cursor Composer (Agent mode)

---

These are CONFIRMED bugs from actual iPhone screenshots, not speculation.
Fix the root causes listed below, not just symptoms.

## BUG 1 — Dark Mode Still Active

Check `tailwind.config.ts` for `darkMode: 'class'` (not `'media'`).
Remove `.dark` from `globals.css` and all `dark:` utility classes.

## BUG 2 — Mobile Landscape Renders Desktop Sidebar Layout

Change layout-switching breakpoint from `md:` (768px) to `lg:` (1024px) in
Navigation, main padding, WeatherBar collapse, FeedbackWidget position.

## BUG 3 — Emergency Hotline Button Overlapping Map

After Bug 2 fix, verify banner flows in document order with `flex-wrap`.

## BUG 4 — Layer Toggle Panel Cut Off

`max-width: min(280px, calc(100vw - 24px))` on MapLayers panel.

## BUG 5 — Accessibility Pass

Contrast, tab order, focus states, checkbox label associations.

---

*Archived from root `CURSOR-CONFIRMED-MOBILE-BUGS.md` on 2026-06-30.*
