# Vigil — Accessibility Type Scale Revision + Más Menu Bottom-Sheet + Fixed Position Bug
## Paste into Cursor Composer (Agent mode)

---

These are confirmed bugs from real device screenshots (not emulation). Fix 
root causes per the specific diagnosis below.

## TASK A — Revise Type Scale in DESIGN-SYSTEM.md (accessibility correction)

The current type scale is too small for real-world accessibility. Update 
`DESIGN-SYSTEM.md` Typography section to these new values:

```
Display:  34px / 700 / tracking -0.02em  (was 32px)
H1:       26px / 600 / tracking -0.01em  (was 24px)
H2:       20px / 600                      (was 18px)
H3:       17px / 500                      (was 15px)
Body:     16px / 400 / leading 1.6       (was 13px — CRITICAL increase, 
                                            this is primary reading text)
Caption:  13px / 400 / leading 1.5       (was 11px — minimum floor raised)
Mono:     13px / 400                      (was 12px)
```

Also update the "What Never Goes In Vigil" line that says "Font sizes below 
11px" to now read "Font sizes below 13px" — the floor itself moved up.

Update `--vigil-muted` color token — current value fails WCAG AA contrast 
on white background (~2.8:1, needs 4.5:1 minimum for normal text):

```css
--vigil-muted: #64748B;  /* was #94A3B8 — now passes AA at ~4.6:1 on white */
```

Apply both changes throughout the actual codebase — every component using 
the old type scale or the old muted color value needs updating, not just 
the documentation. This includes the footer (currently showing very small 
gray text per the screenshots), all card meta text, captions, and form labels.

After applying, verify contrast using Chrome DevTools: inspect any element 
using `--vigil-muted`, open the color picker on its computed color, and 
confirm the contrast ratio shown is ≥4.5:1 against its background.

---

## TASK B — Convert "Más" Menu to Bottom-Sheet (fixes landscape clipping entirely)

The current "Más" (More) menu is a side-anchored flyout that clips off-screen 
in landscape orientation (confirmed: labels like "Calendario," "Punto de 
Acopio" are cut off at the screen edge).

Fix by converting it to the SAME bottom-sheet pattern already working for 
the map layers panel (built in a previous session) — slides up from bottom, 
full viewport width, backdrop with tap-to-close, explicit X button, never 
clips regardless of orientation:

- List all secondary nav items (Calendario, Punto de Acopio, Intercambio, 
  Voluntarios, Organizaciones, Cómo Ayudar, Equipo Activo, Información, 
  Donar, Actualizaciones Oficiales) as a clean vertical list in the sheet
- Each item: icon + label, full-width tap target (44px minimum height)
- This applies on all viewports below `lg:` (1024px) — both portrait and 
  landscape phone orientations

Find whatever component currently renders the "Más" flyout and refactor it 
to reuse the bottom-sheet component/pattern from the map layers fix (don't 
rebuild from scratch if a reusable bottom-sheet component already exists 
from that work — extract it into a shared component if it doesn't already 
support reuse).

---

## TASK C — Fix Feedback Widget Fixed-Position Bug

The floating feedback button is appearing in inconsistent positions relative 
to page content (overlapping the search bar in one screenshot, near the 
footer in another) — this indicates `position: fixed` is not behaving as a 
true viewport-anchored fixed element, which happens when an ANCESTOR element 
has a CSS `transform`, `filter`, `perspective`, or `will-change: transform` 
property. Any of these properties on a parent creates a new containing block, 
silently breaking `position: fixed` on descendants — the element becomes 
fixed relative to that ancestor instead of the viewport.

```bash
grep -rn "transform\|will-change\|filter:" --include="*.tsx" --include="*.css" src/ | grep -v "transition\|hover:"
```

Check every result — specifically look for any wrapper component around the 
feedback widget, page layout, or any Framer Motion component (motion.div 
often applies transform by default even with simple animations) that could 
be the offending ancestor.

Once found, either remove the transform from that ancestor, or move the 
feedback widget's render location in the DOM tree to be a direct child of 
`<body>` (e.g., using a React portal via `createPortal`) so it's never 
nested inside any potentially-transformed container regardless of where in 
the component tree it's used.

After fixing, verify: scroll the entire homepage on a real device, confirm 
the feedback button stays visually fixed in the exact same screen position 
(bottom-right, above the bottom nav bar) throughout the entire scroll, never 
appearing to "travel" with page content.

---

## TASK D — Bottom Navigation Visual Definition

Add clearer visual separation between the bottom nav bar and scrolling 
content beneath it:

```css
.mobile-bottom-nav {
  border-top: 1px solid var(--vigil-border);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.04);
  background: var(--vigil-surface); /* confirm fully opaque, not transparent */
}
```

Confirm the nav bar has a solid, non-transparent background (content should 
never be visible "through" it while scrolling behind), proper z-index above 
page content, and correct `padding-bottom: env(safe-area-inset-bottom)` 
handling for iPhone home indicator spacing.

---

## TASK E — Test and Verify Before Reporting Done

1. Real device or Chrome DevTools, both portrait AND landscape: open "Más" 
   menu, confirm every label is fully visible, nothing clipped
2. Inspect footer text and any card caption text — confirm it now reads at 
   16px (body) / 13px (caption) and passes contrast check
3. Scroll the full homepage, confirm feedback button stays in one fixed 
   screen position throughout
4. Confirm bottom nav has visible separation/elevation from content

## Commit

```bash
git add -A
git commit -m "fix: accessibility type scale increase, Más menu bottom-sheet conversion, 
feedback widget fixed-position bug, bottom nav visual definition

- Raised body text 13px->16px, captions 11px->13px per WCAG readability standards
- Fixed --vigil-muted contrast ratio (2.8:1 -> 4.6:1, now passes AA)
- Converted Más menu from clipping side-flyout to bottom-sheet pattern
- Fixed feedback widget position:fixed broken by ancestor transform property
- Added visual elevation/separation to bottom nav bar

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.

## Report back

1. Confirm what ancestor element was breaking the feedback widget's fixed 
   position (Task C) — show the actual CSS property found
2. Confirm contrast ratio measurement for the new --vigil-muted value
3. Confirm Más menu now renders correctly in landscape (describe or screenshot)
