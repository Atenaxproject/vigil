# Vigil — Add Sister Platform Links (Venezuela Te Busca + Desaparecidos Terremoto Venezuela)
## Paste into Cursor Composer (Agent mode)

---

Two other citizen-run missing persons platforms exist for this same crisis:
- Venezuela Te Busca — venezuelatebusca.com
- Desaparecidos Terremoto Venezuela — desaparecidosterremotovenezuela.com

These should be linked from Vigil so anyone who searches and finds nothing 
knows to also check there — the goal is helping families, not competing 
for traffic.

## TASK A — Add to crisis.config.ts partnerLinks

```typescript
partnerLinks: [
  // ...existing entries...
  { 
    name: 'Venezuela Te Busca', 
    url: 'https://venezuelatebusca.com', 
    type: 'sister-platform' as const 
  },
  { 
    name: 'Desaparecidos Terremoto Venezuela', 
    url: 'https://desaparecidosterremotovenezuela.com', 
    type: 'sister-platform' as const 
  },
],
```

Add `'sister-platform'` to the `PartnerLinkType` union type if it doesn't 
already include it.

## TASK B — Display Prominently on the Search Results / No Results State

This is the most important placement: when someone searches `/buscar` and 
gets "Sin resultados," show these links right there, warmly, not buried. 
Update the no-results state:

```
No encontramos a esta persona en Vigil todavía.

También puedes buscar en estas plataformas hermanas:
→ Venezuela Te Busca
→ Desaparecidos Terremoto Venezuela

Y por favor, considera reportarla aquí también — cada reporte ayuda.
[Reportar Desaparecido]
```

## TASK C — Add to /informacion page

In the "Fuentes confiables para seguir" or similar section, add both as 
citizen-run sister platforms, briefly described, with their approximate 
scale if known (Desaparecidos Terremoto Venezuela has reported 35,000+ 
active cases at time of writing — note this may be stale, mark as 
approximate/not live-synced).

## Commit

```bash
git add -A
git commit -m "feat: link sister missing-persons platforms (Venezuela Te Busca, 
Desaparecidos Terremoto Venezuela)

- Added to crisis.config.ts partnerLinks
- Prominently shown on /buscar no-results state — families should know 
  to check multiple platforms, not just Vigil
- Added to /informacion trusted sources section

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.
