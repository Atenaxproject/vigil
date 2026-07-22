# Vigil — VPAT-style accessibility summary

**Product:** Vigil Crisis Platform  
**Standard:** WCAG 2.1 Level AA  
**Date:** 2026-07-22  
**Operator:** Bbluestudios LLC / YouTheWave  

## Scope

Public routes of vigil.youthewave.org used in the Venezuela 2026 deployment, including missing-persons search/report, crisis map, emergency directory, statistics, and help.

## Conformance approach

| Area | Status | Notes |
|---|---|---|
| Perceivable — text alternatives | Partial / Supports | Map has `MapAccessibleList`; images require alt |
| Perceivable — contrast | Supports with exceptions | Accent `#2563EB` on white meets 4.5:1; high-contrast light mode available |
| Operable — keyboard | Partial | Primary flows operable; Leaflet map layers remain a known gap |
| Operable — focus visible | Supports | Global `:focus-visible` styles |
| Understandable — language | Supports | `lang` via next-intl; ES default |
| Robust | Supports | Semantic HTML + ARIA on nav sheets/modals |
| Motion | Supports | `prefers-reduced-motion` respected for status pulse |

## User controls

- Text size: 100% / 125% / 150% (root `font-size`, localStorage)
- High contrast: light-palette contrast boost (not dark mode)

## Automated testing

CI should run axe/Lighthouse on key routes (prompt 72). Manual keyboard + screen-reader walks remain the primary evidence.

## Contact

Barriers: vigil@atenaxproject.com
