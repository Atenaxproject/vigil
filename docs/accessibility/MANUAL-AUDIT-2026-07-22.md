# Manual accessibility audit notes (prompt 72 Part B)

**Date:** 2026-07-22  
**Method:** Code review + structural checks (automated axe CI deferred to workflow addition).

## Keyboard

| Route | Finding |
|---|---|
| `/buscar` | Form controls and results links focusable |
| `/reportar` | Form labels + submit operable |
| `/informacion` directory | `tel:` links and state select keyboard operable |
| `/` map | **Gap:** Leaflet circle markers not fully keyboard-operable; mitigated by `MapAccessibleList` |
| Nav sheet | Focus trap + Escape implemented |

## Screen reader (primary flows)

| Flow | Can complete end-to-end? |
|---|---|
| Search missing person | **Yes** with list results (map optional) |
| Report missing person | **Yes** — labeled form fields |
| Emergency numbers | **Yes** — directory as text + tel links |

**Most important finding:** A screen reader user can complete missing-person search without the map, via search UI and accessible list. Map layer toggles need continued keyboard polish.

## Contrast

`#2563EB` on white ≈ 4.6:1 — passes AA for normal text. High-contrast mode darkens ink/borders further.

## Reflow / zoom

Layout uses rem-friendly Tailwind; text-scale control scales root font-size. 320px and 200% zoom remain operator spot-check items on device.

## Motion

Status pulse gated by `prefers-reduced-motion` in `globals.css`.
