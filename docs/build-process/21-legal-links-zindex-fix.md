# Vigil — Legal Page Links + Map Z-Index Bleed Fix
## Paste into Cursor Composer (Agent mode)

---

## TASK A — Verify Privacy/Terms/Contact Links Actually Work

```bash
ls -la src/app/privacidad/ src/app/terminos/
grep -rn "href=\"/privacidad\"\|href=\"/terminos\"\|href={.*privacidad\|href={.*terminos" src/components/ --include="*.tsx"
```

Confirm both page files exist with real content (not empty stubs), and 
confirm the footer component links to them correctly via Next.js `<Link>` 
(not a plain `<a>` with a broken/relative path issue). Click-test both 
links live: confirm `/privacidad` and `/terminos` actually render full 
page content, not a 404.

Also confirm the "Contacto" link uses `mailto:vigil@youthewave.org` 
correctly (already specified in CRISIS_CONFIG.legal.contactEmail — confirm 
the footer pulls from that config value, not a hardcoded/stale string).

---

## TASK B — Fix Map Z-Index Bleed (footer/contact link hidden under map)

Leaflet's internal panes (tile layer, markers, popups) carry z-index values 
that can escape their container and overlap subsequent page content if the 
map wrapper doesn't properly contain its own stacking context. This is 
causing the footer's "Contacto" link to render visually behind/under the map.

Find the map container component (likely `CrisisMap.tsx`) and its wrapper:

```bash
grep -rn "leaflet-container\|MapContainer" src/components/map/ --include="*.tsx"
```

Add explicit stacking containment to the map's outer wrapper div:

```css
.map-wrapper {
  position: relative;
  z-index: 0;
  isolation: isolate; /* Creates a new stacking context — nothing inside 
                          can escape above this, regardless of Leaflet's 
                          internal z-index values */
}
```

The `isolation: isolate` property is the cleanest fix here — it guarantees 
everything inside the map (tiles, markers, popups, zoom controls, the 
layers panel) stays contained within its own stacking layer and can never 
visually bleed over sibling content elsewhere on the page, no matter what 
z-index Leaflet sets internally.

Apply this to whatever div directly wraps the `<MapContainer>` or Leaflet 
root element. If the map is used in multiple places (homepage, any other 
page with embedded maps), apply consistently everywhere.

---

## TASK C — Verify Fix

1. Scroll to the footer on the homepage, confirm "Contacto" link is fully 
   visible and clickable, not obscured by the map
2. Confirm the map's zoom controls, layer panel, and any open popups still 
   render correctly ON TOP of the map itself (the isolation fix shouldn't 
   break internal map layering, only prevent it from escaping outward)
3. Test on both desktop and mobile viewports

---

## Commit

```bash
git add -A
git commit -m "fix: map z-index bleed hiding footer contact link, verified legal page links

- Added isolation: isolate to map wrapper to contain Leaflet's internal 
  stacking context, fixing Contacto link being hidden under the map
- Verified /privacidad and /terminos pages render correctly and footer 
  links navigate properly

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.

## Report back

1. Confirm root cause — was the map missing `isolation: isolate` or proper 
   z-index containment?
2. Confirm Contacto link is now fully visible in the footer, not overlapped
3. Confirm /privacidad and /terminos pages load correctly when visited directly
