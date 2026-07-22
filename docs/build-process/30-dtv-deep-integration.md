# Vigil — DTV Deep Integration: Attribution, Metrics, Centers, UX Cleanup
## Paste into Cursor Composer (Agent mode)

---

## CONTEXT

Vigil now has active integrator API access to desaparecidosterremotovenezuela.com (DTV).
Their API is READ-ONLY — Vigil cannot write to their database, by agreement.
The federated search is already working. This session adds:
1. Proper attribution and trust signals throughout the app
2. DTV live metrics on the /estadisticas page
3. DTV centros (centers/hospitals) on the crisis map
4. DTV listas on the estadisticas page
5. Cross-report suggestion on /reportar
6. UX deduplication and cleanup pass
7. Vigil's /red page updated to reflect active integration

All DTV data shown in Vigil must be clearly attributed with source, link back 
to their platform, and a note that it updates automatically.

---

## TASK A — Strengthen Attribution on Search Results

The current DTV result cards show a source label. Make it more explicit and 
trustworthy — families need to know this data is real and where it comes from.

### A1. DTV result section header
```tsx
<div className="dtv-source-header">
  <span className="dtv-badge">
    Fuente: Desaparecidos Terremoto Venezuela
  </span>
  <a 
    href="https://desaparecidosterremotovenezuela.com" 
    target="_blank" 
    rel="noopener noreferrer"
    className="dtv-link"
  >
    Ver plataforma completa →
  </a>
  <span className="dtv-note">
    55,891+ registros · Datos públicos verificados · Se actualiza cada 5 min
  </span>
</div>
```

Style the DTV badge in a distinct color from Vigil's blue — use amber 
(#D97706 / bg #FFFBEB) to visually differentiate the source without 
being alarming. This makes it immediately clear which results come from 
which platform.

### A2. Add a trust note below the search bar on /buscar

Below the search input and before results appear, add permanently visible text:
```
Los resultados incluyen registros de Vigil y de Desaparecidos Terremoto Venezuela 
(55,891+ personas reportadas). Ambas fuentes son iniciativas ciudadanas verificadas 
sin fines de lucro.
```

### A3. No-results state
When a search returns nothing from EITHER source, show:
```
No encontramos a esta persona en ninguna de las dos plataformas.

Considera reportarla:
→ Aquí en Vigil [Reportar Desaparecido button]
→ En Desaparecidos Terremoto Venezuela [external link]

Reportar en ambas amplía la red de búsqueda.
```

---

## TASK B — Cross-Report Suggestion on /reportar

At the top of the /reportar form (above the form, below the page title), 
add a non-blocking informational banner:

```tsx
<div className="info-banner">
  <span>💡</span>
  <p>
    Si ya reportaste a esta persona en{' '}
    <a href="https://desaparecidosterremotovenezuela.com" target="_blank" rel="noopener noreferrer">
      Desaparecidos Terremoto Venezuela
    </a>
    , reportarla también aquí amplía su alcance en la red de búsqueda.
    Si aún no lo has hecho, te recomendamos hacerlo en ambas plataformas.
  </p>
</div>
```

Style as a soft blue information banner (not a warning/error). Dismissible 
with an X button, dismissed state stored in sessionStorage.

---

## TASK C — DTV Live Metrics on /estadisticas

Create a new API route `src/app/api/dtv-metrics/route.ts` that pulls 
real counts from DTV's API using our credentials:

```typescript
import { getDTVPersonas, getDTVCentros, getDTVListas } from '@/lib/dtv-api'

export async function GET() {
  const [personasRes, centrosRes, listasRes] = await Promise.allSettled([
    // Get first page just for pagination metadata (total count)
    fetch(`${process.env.DTV_API_BASE_URL}/personas?limit=1`, {
      headers: { 'X-Api-Key': process.env.DTV_API_KEY || '' },
      next: { revalidate: 300 } // 5-minute cache matching their update frequency
    }).then(r => r.json()),
    
    fetch(`${process.env.DTV_API_BASE_URL}/centros?limit=1`, {
      headers: { 'X-Api-Key': process.env.DTV_API_KEY || '' },
      next: { revalidate: 300 }
    }).then(r => r.json()),
    
    fetch(`${process.env.DTV_API_BASE_URL}/listas?limit=1`, {
      headers: { 'X-Api-Key': process.env.DTV_API_KEY || '' },
      next: { revalidate: 300 }
    }).then(r => r.json()),
  ])

  // Extract totals from pagination metadata
  // DTV API returns pagination.total or similar — adjust field names 
  // based on actual API response structure
  const personas = personasRes.status === 'fulfilled' ? personasRes.value : null
  const centros = centrosRes.status === 'fulfilled' ? centrosRes.value : null
  const listas = listasRes.status === 'fulfilled' ? listasRes.value : null

  return Response.json({
    totalPersonas: personas?.pagination?.total || personas?.total || 0,
    totalCentros: centros?.pagination?.total || centros?.total || 0,
    totalListas: listas?.pagination?.total || listas?.total || 0,
    lastUpdated: new Date().toISOString(),
    source: 'desaparecidosterremotovenezuela.com'
  })
}
```

IMPORTANT: Test the actual response shape from the DTV API first:
```bash
curl -H "X-Api-Key: $DTV_API_KEY" \
  "$DTV_API_BASE_URL/personas?limit=1" | jq .
```
Look at the pagination object and adjust field names accordingly.

### C2. Update /estadisticas page

Add a "Red de búsqueda combinada" section at the top of the estadisticas 
page, ABOVE Vigil's own stats:

```tsx
<section className="network-stats">
  <div className="section-header">
    <h2>Red de búsqueda combinada</h2>
    <p>
      Vigil trabaja en red con{' '}
      <a href="https://desaparecidosterremotovenezuela.com" target="_blank" rel="noopener noreferrer">
        Desaparecidos Terremoto Venezuela
      </a>
      . Los datos se actualizan automáticamente cada 5 minutos.
    </p>
  </div>

  <div className="stats-grid">
    {/* DTV stats with attribution */}
    <StatCard
      value={dtvMetrics.totalPersonas.toLocaleString('es-VE')}
      label="Personas en red DTV"
      sublabel="Desaparecidos Terremoto Venezuela"
      source="dtv"
      color="amber"
    />
    <StatCard
      value={dtvMetrics.totalCentros.toLocaleString('es-VE')}
      label="Centros y hospitales"
      sublabel="Registrados en red DTV"
      source="dtv"
      color="amber"
    />
    <StatCard
      value={dtvMetrics.totalListas.toLocaleString('es-VE')}
      label="Listas de centros"
      sublabel="Grupos en albergues"
      source="dtv"
      color="amber"
    />
    
    {/* Vigil's own stats below, clearly labeled */}
    <StatCard
      value={vigilMetrics.totalPersonas.toLocaleString('es-VE')}
      label="Reportados en Vigil"
      sublabel="Base de datos propia"
      source="vigil"
      color="blue"
    />
  </div>
  
  <p className="attribution-note">
    Datos de DTV: fuente desaparecidosterremotovenezuela.com · 
    Última actualización: {formatRelativeTime(dtvMetrics.lastUpdated)}
  </p>
</section>
```

---

## TASK D — DTV Centers on the Crisis Map

Pull their centers data and add to the map. Run a one-time sync via the 
admin endpoint, then schedule it to refresh every 6 hours:

### D1. Update getDTVCentros in dtv-api.ts to handle pagination

```typescript
export async function getAllDTVCentros(): Promise<any[]> {
  const allCentros: any[] = []
  let cursor: string | undefined
  
  do {
    const params = new URLSearchParams({ limit: '100' })
    if (cursor) params.set('cursor', cursor)
    
    const res = await fetch(
      `${process.env.DTV_API_BASE_URL}/centros?${params}`,
      { headers: { 'X-Api-Key': process.env.DTV_API_KEY || '' } }
    )
    if (!res.ok) break
    
    const data = await res.json()
    const items = data.data || data.centros || []
    allCentros.push(...items)
    cursor = data.pagination?.nextCursor
  } while (cursor)
  
  return allCentros
}
```

### D2. Update the admin sync endpoint

In `src/app/api/admin/sync-dtv-centers/route.ts`, use getAllDTVCentros 
and upsert into map_markers. Each center should have:
- source: 'desaparecidosterremotovenezuela.com'
- type: 'hospital' (if it's a hospital) or 'collection_point' (if acopio)
- verified: true
- A visible "DTV" badge in the info popup on the map

After syncing, add a Vercel cron to run every 6 hours:
```json
// vercel.json
{
  "crons": [
    { "path": "/api/admin/sync-dtv-centers", "schedule": "0 */6 * * *" }
  ]
}
```
Protect with VIGIL_ADMIN_SECRET header in the route.

---

## TASK E — Update /red Page (Sister Platforms)

The /red page currently links to DTV as one of 7 equal platforms. 
Update to reflect active integration status:

```tsx
{/* Featured integration at top */}
<div className="featured-partner">
  <div className="partner-badge">Integración activa</div>
  <h3>Desaparecidos Terremoto Venezuela</h3>
  <p>
    Plataforma hermana con 55,891+ registros, reconocimiento facial y 
    desglose geográfico. Los resultados de búsqueda en Vigil incluyen 
    automáticamente su base de datos en tiempo real.
  </p>
  <div className="partner-capabilities">
    <span>✓ Búsqueda federada activa</span>
    <span>✓ Reconocimiento facial</span>
    <span>✓ Centros y hospitales</span>
    <span>✓ Actualización cada 5 min</span>
  </div>
  <a href="https://desaparecidosterremotovenezuela.com" target="_blank">
    Visitar plataforma →
  </a>
</div>

{/* Other platforms below, unchanged */}
```

---

## TASK F — UX Deduplication Cleanup

### F1. Remove duplicated emergency numbers
The emergency hotline ([former rescue-coordination label]) appears in:
- The top emergency banner ✓ (keep — this is primary)
- The footer "Vigil NO es un servicio de emergencias" ✓ (keep — legal/safety)
- Potentially inside /informacion and /como-ayudar pages

Check all pages for the emergency number and keep only:
- Top banner: always visible, that's the right place
- Footer disclaimer: correct, required
- Remove any mid-page repetitions that aren't contextually necessary 
  (e.g., if it appears as a standalone section AND in the footer on the 
  same page, remove the standalone one)

### F2. Information Hub (/informacion) cleanup
This page likely has overlap with the main homepage (aftershock data showing 
in both places). Audit and reorganize:
- Homepage: map + recent missing persons + quick stats
- /informacion: deep data only — USGS detail, GDACS, ReliefWeb, 
  infrastructure status, DTV metrics, Venezuelan news RSS
- Remove any widgets from /informacion that are already prominent on homepage

### F3. Footer link cleanup
Current footer shows: Política de Privacidad · Términos de Uso · 
Contacto · Código abierto — Licencia MIT · Construido para el pueblo de Venezuela

This is clean. Confirm all 5 links actually work and have real content. 
If "Código abierto — Licencia MIT" is a link, confirm it goes to the 
GitHub repo. If it's plain text, convert it to a link.

### F4. Language switcher — confirm all 8 work
Run a quick check: switch to each of the 8 languages and confirm that at 
least the main page renders in that language without showing raw translation 
keys. If any language shows raw keys (like `nav.search` instead of 
"Search"), flag which ones and regenerate translations for those locales 
using: `node scripts/generate-translations.mjs`

---

## TASK G — Commit

```bash
git add -A
git commit -m "feat: DTV deep integration — attribution, live metrics, centers sync, UX cleanup

- Strengthened source attribution on all DTV search results (amber badge, 
  clear link back to desaparecidosterremotovenezuela.com)
- Added trust note on /buscar explaining both data sources
- Added cross-report suggestion on /reportar (dismissible, not intrusive)
- /estadisticas now shows DTV live metrics (total records, centers, lists)
  via /api/dtv-metrics endpoint with 5-minute cache
- DTV centers/hospitals synced to crisis map via paginated bulk import
- Vercel cron added to refresh DTV centers every 6 hours
- /red updated to feature DTV as active integration partner
- UX dedup pass: removed redundant emergency number repetitions
- Confirmed all 8 language translations rendering correctly

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.

---

## POST-RUN CHECKLIST (Orlando verifies manually)

1. Search "García" on /buscar — confirm amber DTV badge appears on results
2. Visit /estadisticas — confirm DTV metrics section shows real numbers
3. Check crisis map — confirm DTV centers appear with attribution popup
4. Visit /reportar — confirm cross-report suggestion banner is visible
5. Visit /red — confirm DTV appears as featured active integration
6. Test all 8 language switches — confirm no raw translation keys visible
7. Check footer on homepage — confirm "Código abierto" links to GitHub repo
