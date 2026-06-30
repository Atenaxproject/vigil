# Vigil — Desktop Accessibility (WCAG AA) Pass
## Paste into Cursor Composer (Agent mode)

---

This builds on the mobile accessibility fixes already applied (type scale, 
contrast). This pass covers what's specific to desktop and screen-reader/
keyboard users: navigation semantics, focus visibility, and structure. Vigil 
must work for someone using a screen reader, someone navigating by keyboard 
only, someone with low vision using browser zoom, and someone with motor 
impairment who can't use a mouse precisely.

## TASK A — Fix Duplicate Navigation (confirmed issue)

Fetching the live page directly shows the full navigation list rendering 
TWICE in the DOM — once for the desktop sidebar, once for the mobile bottom 
nav/Más sheet. This is expected architecturally (one is CSS-hidden depending 
on viewport), but verify it's hidden correctly for accessibility:

```bash
grep -rn "hidden lg:flex\|lg:hidden\|className.*hidden" src/components/layout/Navigation.tsx
```

Tailwind's `hidden` class uses `display: none`, which correctly removes 
content from the accessibility tree — confirm this is actually what's being 
used (not just `opacity-0`, `invisible`, or `scale-0`, which keep content 
in the accessibility tree even though it's visually hidden, causing screen 
readers to announce duplicate navigation).

If both nav versions render in the DOM and only ONE has `hidden`/`lg:hidden` 
applied correctly per breakpoint, this is already fine. If either uses a 
different hiding technique, fix it to use `hidden`/`block` Tailwind display 
utilities specifically.

Additionally, wrap each nav version with a distinguishing `aria-label` so 
even if both were somehow announced, they're clearly identified:

```tsx
<nav aria-label="Navegación principal" className="hidden lg:flex">...</nav>
<nav aria-label="Navegación móvil" className="lg:hidden">...</nav>
```

## TASK B — Skip to Content Link

Add a skip link as the very first focusable element on every page — 
invisible until focused via keyboard Tab, then visible, letting keyboard 
users bypass the 14-item navigation and jump straight to main content:

```tsx
// In root layout, as first child of <body>
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
             focus:z-[9999] focus:bg-vigil-blue focus:text-white focus:px-4 
             focus:py-2 focus:rounded-input"
>
  Saltar al contenido principal
</a>
```

Add `id="main-content"` to the `<main>` element wrapping page content.

## TASK C — Visible Focus Indicators (critical for keyboard users)

Audit globals.css for any focus-removing styles:

```bash
grep -rn "outline: none\|outline:none\|focus:outline-none" src/ --include="*.tsx" --include="*.css"
```

For every match, confirm a replacement focus style exists. If `outline-none` 
is used without a replacement, that element becomes invisible to keyboard 
users when focused — this fails WCAG 2.4.7 entirely. Add a consistent 
visible focus ring globally:

```css
*:focus-visible {
  outline: 2px solid var(--vigil-blue);
  outline-offset: 2px;
}
```

Use `:focus-visible` specifically (not `:focus`) so the ring only appears 
for keyboard navigation, not mouse clicks — this is the modern accessible 
pattern and avoids visual clutter for mouse users while fully serving 
keyboard users.

## TASK D — Icon-Only Buttons Need ARIA Labels

Every button that's only an icon (no visible text) needs an `aria-label` 
describing its function. Audit and fix:

- Map zoom +/- controls
- Layers toggle button (circular icon, mobile and desktop)
- Language switcher globe icon (if icon-only anywhere)
- Feedback widget chat bubble button
- Any close (X) buttons on modals/sheets
- Hamburger/Más menu icon

```tsx
<button aria-label="Mostrar capas del mapa" onClick={...}>
  <Layers size={20} />
</button>
```

## TASK E — Semantic Landmarks & Heading Hierarchy

Confirm proper semantic HTML structure exists:

```bash
grep -rn "<header\|<nav\|<main\|<footer\|<aside" src/app/layout.tsx src/components/layout/
```

Confirm: one `<header>`, navigation wrapped in `<nav>`, page content wrapped 
in `<main>`, footer wrapped in `<footer>`. Confirm each page has exactly one 
`<h1>`, and headings don't skip levels (no `<h3>` directly after `<h1>` 
without an `<h2>` between, etc.) — check `/`, `/buscar`, `/informacion`, 
`/calendario` specifically.

## TASK F — Form Accessibility

For every form (Reportar Desaparecido, Necesito Ayuda, Voluntarios, 
Intercambio, Calendario event, feedback widget):

1. Confirm every input has a properly associated `<label>` via `htmlFor`/`id` 
   (not just placeholder text — placeholders disappear on input and don't 
   count as labels)
2. Confirm required fields are marked with both visual indicator AND 
   `aria-required="true"` (not color/asterisk alone)
3. Confirm validation errors are announced to screen readers via 
   `aria-live="polite"` region or `aria-describedby` linking the error 
   message to its input
4. Confirm the privacy notice text near contact fields ("Tu información 
   nunca se muestra públicamente") is associated with the relevant field 
   via `aria-describedby`, not just visually nearby

## TASK G — Map Accessibility (Leaflet is inherently visual-only)

Maps are a known accessibility gap — screen reader users get nothing 
meaningful from a visual map. Add a text-based alternative:

Near the map (or in a "View as list" toggle), provide a simple accessible 
list of what's currently shown on the map — missing persons locations, 
active needs, resources — as actual readable list items, not just visual 
pins. This doesn't need to be elaborate: a collapsible "Ver como lista" 
section below or beside the map that lists the same data in plain text/links 
satisfies this meaningfully.

Confirm zoom controls (+/-) are keyboard accessible (tabbable, activate on 
Enter/Space) — Leaflet's default controls usually are, but verify.

## TASK H — Browser Zoom / Text Resize Test

Manually test (or describe expected behavior): set browser zoom to 200% on 
desktop. Confirm:
- No text gets cut off or overlaps
- No horizontal scroll appears unexpectedly  
- All interactive elements remain usable and visible

This satisfies WCAG 1.4.4 (Resize Text). If the layout breaks at 200% zoom, 
identify which components use fixed pixel widths instead of relative/fluid 
sizing and fix those specifically.

## TASK I — Confirm Language Attribute Updates

```bash
grep -rn "lang=" src/app/layout.tsx
```

Confirm `<html lang="es">` is set by default and that it actually changes 
when the user switches languages via the selector (e.g., to `lang="en"`, 
`lang="pt"`, etc.) — this affects how screen readers pronounce content and 
is currently worth verifying given the 8-language i18n system already built.

## TASK J — Automated Audit Baseline

Run both and report scores:

```bash
# If not already installed:
npm install -D @axe-core/cli
npx axe https://vigil.youthewave.org --save axe-report.json
```

Also run Chrome DevTools → Lighthouse → Desktop → Accessibility category. 
Report the score and list every flagged issue, even ones not explicitly 
covered above — fix any additional issues axe/Lighthouse surface.

## Commit

```bash
git add -A
git commit -m "fix: desktop accessibility pass (WCAG AA) — keyboard nav, focus 
indicators, ARIA labels, semantic structure, form accessibility, map text 
alternative

- Verified/fixed duplicate navigation accessibility tree handling
- Added skip-to-content link
- Added global focus-visible indicators (was likely missing or removed)
- Added aria-label to all icon-only buttons
- Verified semantic landmark structure and heading hierarchy
- Added form label/error announcement improvements
- Added text-based alternative for map content (screen reader accessibility)
- Verified 200% browser zoom resilience
- Confirmed lang attribute updates with language switcher
- Ran axe-core and Lighthouse accessibility audits, fixed flagged issues

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.

---

## Report back

1. Lighthouse Accessibility score (before/after if measurable)
2. axe-core results summary — how many issues found, how many fixed
3. Confirm specifically: was outline-none found anywhere without a focus 
   replacement? Where?
4. Confirm the duplicate nav uses proper display:none hiding (Task A)
