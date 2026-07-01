# Vigil — Desaparecidos Terremoto Venezuela API Integration
## Paste into Cursor Composer (Agent mode)

---

## CONTEXT

Desaparecidos Terremoto Venezuela (desaparecidosterremotovenezuela.com) has
granted Vigil integrator access to their read-only REST API. They have:
- 55,891 records (vs Vigil's small initial database)
- 15,770 already located
- Facial recognition endpoint
- Centers/hospitals data
- Proper REST API with cursor-based pagination

Integration approach: FEDERATED QUERY ONLY — no storing their data in
Vigil's database. When a user searches, query both Vigil's own Supabase AND
their API simultaneously, combine results, show with clear attribution.
This respects their data sovereignty and keeps Vigil compliant with the
integrator agreement.

## TASK A — Add API credentials to environment

Add to .env.local (Orlando adds the real key after creating it in their panel):
```
DTV_API_BASE_URL=https://desaparecidos-terremoto-api.theempire.tech/api/v1
DTV_API_KEY=your_api_key_here
```

Add to .env.example:
```
DTV_API_BASE_URL=
DTV_API_KEY=
```

Add `DTV_API_KEY` to Vercel Production environment variables.
Add `DTV_API_BASE_URL` to Vercel Production environment variables.

## TASK B — Create the DTV API client

Create `src/lib/dtv-api.ts`:

```typescript
// Desaparecidos Terremoto Venezuela API client
// Read-only, federated query — no data stored in Vigil's database
// Attribution required on all results

const DTV_BASE = process.env.DTV_API_BASE_URL
const DTV_KEY = process.env.DTV_API_KEY

function dtvHeaders() {
  return {
    'X-Api-Key': DTV_KEY || '',
    'Content-Type': 'application/json',
  }
}

export interface DTVPersona {
  id: string
  nombre: string
  edad?: number
  sexo?: string
  ubicacion?: string
  estado?: string
  foto_url?: string
  localizado: boolean
  created_at: string
  // Add other fields as their API returns them
  _source: 'dtv' // always tagged for attribution
}

export interface DTVSearchResult {
  data: DTVPersona[]
  pagination: {
    nextCursor?: string
    total?: number
  }
}

// Search persons by name
export async function searchDTVPersonas(
  query: string,
  cursor?: string
): Promise<DTVSearchResult | null> {
  if (!DTV_BASE || !DTV_KEY) return null
  
  try {
    const params = new URLSearchParams({ q: query, limit: '20' })
    if (cursor) params.set('cursor', cursor)
    
    const res = await fetch(`${DTV_BASE}/personas?${params}`, {
      headers: dtvHeaders(),
      next: { revalidate: 60 }, // 60-second cache — fresh but not hammering their API
    })
    
    if (!res.ok) {
      console.error('DTV API error:', res.status, res.statusText)
      return null
    }
    
    const data = await res.json()
    
    // Tag every result with source for attribution
    const tagged = (data.data || data.personas || []).map((p: any) => ({
      ...p,
      _source: 'dtv' as const,
    }))
    
    return {
      data: tagged,
      pagination: {
        nextCursor: data.pagination?.nextCursor,
        total: data.pagination?.total,
      }
    }
  } catch (error) {
    console.error('DTV API fetch failed:', error)
    return null // Fail gracefully — Vigil search still works without their data
  }
}

// Photo-based identification via their facial recognition
export async function identifyByPhotoDTV(
  photoBase64: string,
  mimeType: string
): Promise<DTVPersona[] | null> {
  if (!DTV_BASE || !DTV_KEY) return null
  
  try {
    const res = await fetch(`${DTV_BASE}/identificar`, {
      method: 'POST',
      headers: dtvHeaders(),
      body: JSON.stringify({
        foto: photoBase64,
        tipo: mimeType,
      }),
    })
    
    if (!res.ok) return null
    
    const data = await res.json()
    const results = data.data || data.matches || data.resultados || []
    
    return results.map((p: any) => ({ ...p, _source: 'dtv' as const }))
  } catch (error) {
    console.error('DTV identify failed:', error)
    return null
  }
}

// Get centers/hospitals from their database
export async function getDTVCentros(): Promise<any[] | null> {
  if (!DTV_BASE || !DTV_KEY) return null
  
  try {
    const res = await fetch(`${DTV_BASE}/centros?limit=100`, {
      headers: dtvHeaders(),
      next: { revalidate: 3600 }, // Cache for 1 hour — centers don't change minute-to-minute
    })
    
    if (!res.ok) return null
    const data = await res.json()
    return data.data || data.centros || []
  } catch {
    return null
  }
}
```

## TASK C — Federated Search API Route

Update or create `src/app/api/search/personas/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server'
import { searchDTVPersonas } from '@/lib/dtv-api'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('q')?.trim()
  if (!query || query.length < 2) {
    return Response.json({ vigil: [], dtv: [], total: 0 })
  }

  // Query both sources simultaneously
  const [vigilResult, dtvResult] = await Promise.allSettled([
    // Vigil's own database
    createClient()
      .from('public_missing_persons')
      .select('*')
      .textSearch('full_name', query, { type: 'websearch', config: 'simple' })
      .limit(20),
    // DTV federated query
    searchDTVPersonas(query)
  ])

  const vigilData = vigilResult.status === 'fulfilled'
    ? (vigilResult.value.data || []).map(p => ({ ...p, _source: 'vigil' }))
    : []

  const dtvData = dtvResult.status === 'fulfilled' && dtvResult.value
    ? dtvResult.value.data
    : []

  return Response.json({
    vigil: vigilData,
    dtv: dtvData,
    total: vigilData.length + dtvData.length,
    dtvAvailable: dtvResult.status === 'fulfilled' && dtvResult.value !== null,
  })
}
```

## TASK D — Update Search UI to Show Federated Results

In the missing persons search component (homepage + /buscar), update the
results display to handle two sources:

```tsx
// Results section structure
<>
  {/* Vigil's own results */}
  {results.vigil.length > 0 && (
    <section>
      <div className="source-label">
        En Vigil ({results.vigil.length})
      </div>
      {results.vigil.map(p => <PersonCard key={p.id} person={p} source="vigil" />)}
    </section>
  )}

  {/* DTV federated results */}
  {results.dtv.length > 0 && (
    <section>
      <div className="source-label">
        En Desaparecidos Terremoto Venezuela ({results.dtv.length})
        <a
          href="https://desaparecidosterremotovenezuela.com"
          target="_blank"
          rel="noopener noreferrer"
          className="source-link"
        >
          Ver plataforma completa →
        </a>
      </div>
      {results.dtv.map(p => <PersonCard key={p.id} person={p} source="dtv" />)}
    </section>
  )}

  {/* No results state */}
  {results.vigil.length === 0 && results.dtv.length === 0 && (
    <NoResults query={query} dtvSearched={results.dtvAvailable} />
  )}
</>
```

Attribution design: DTV results must show a subtle but clear
"Fuente: Desaparecidos Terremoto Venezuela" badge on every card.
Use a neutral gray badge (not Vigil's blue — visually distinct from
Vigil's own results). Include a direct link to desaparecidosterremotovenezuela.com.

## TASK E — Enhance Photo Search with DTV Facial Recognition

In the photo search API route (`src/app/api/photo-search/route.ts`),
add DTV's `/identificar` call after the existing Claude Vision analysis:

```typescript
// After Claude Vision describes the photo and gets Vigil matches...

// Also call DTV's facial recognition endpoint
const dtvMatches = await identifyByPhotoDTV(base64, photo.type)

// Return combined results
return Response.json({
  description,          // Claude's text description
  vigilMatches,         // Vigil's text-based matches
  dtvMatches: dtvMatches || [],  // DTV's facial recognition matches
  confidence: result.confidence,
})
```

In the photo search UI, show DTV facial recognition results as a separate
clearly-attributed section below Vigil's own results.

## TASK F — Import DTV Centers as Map Markers

Create a one-time or periodic import of their `/centros` data into
Vigil's `map_markers` table as collection_point type:

```typescript
// src/app/api/admin/sync-dtv-centers/route.ts
// Admin-only endpoint (protected by VIGIL_ADMIN_SECRET)
// Imports DTV centers as map markers with attribution

import { createAdminClient } from '@/lib/supabase/admin'
import { getDTVCentros } from '@/lib/dtv-api'

export async function POST(req: Request) {
  const authHeader = req.headers.get('x-admin-secret')
  if (authHeader !== process.env.VIGIL_ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const centros = await getDTVCentros()
  if (!centros?.length) return Response.json({ imported: 0 })

  const supabase = createAdminClient()
  let imported = 0

  for (const centro of centros) {
    const { error } = await supabase.from('map_markers').upsert({
      type: 'collection_point',
      title: centro.nombre || centro.name,
      description: centro.descripcion || '',
      lat: centro.lat || centro.latitud,
      lng: centro.lng || centro.longitud,
      source: 'desaparecidosterremotovenezuela.com',
      verified: true,
      status: 'active',
    }, { onConflict: 'title,lat,lng' }) // Prevent duplicates

    if (!error) imported++
  }

  return Response.json({ imported, total: centros.length })
}
```

Note: Run this once Orlando has the API key and confirms their data structure
from testing the /centros endpoint directly.

## TASK G — Update Sister Platforms section

In crisis.config.ts, update the DTV entry to reflect active integration status:

```typescript
{
  name: 'Desaparecidos Terremoto Venezuela',
  url: 'https://desaparecidosterremotovenezuela.com',
  type: 'sister-platform',
  integrated: true, // Mark as actively integrated, not just linked
},
```

## Commit

```bash
git add -A
git commit -m "feat: federated search integration with Desaparecidos Terremoto Venezuela API

- Added DTV API client (src/lib/dtv-api.ts) — read-only, no data stored
- Federated search: name queries hit both Vigil DB and DTV API simultaneously
- Photo search: combines Claude Vision analysis with DTV facial recognition
- DTV results clearly attributed with source label and link back to their platform
- Center import endpoint for syncing their collection points to Vigil map
- All queries fail gracefully if DTV API unavailable (Vigil search still works)

Integration approach: federated query only — data sovereignty fully preserved.
DTV data never stored in Vigil's database, always served fresh from their API.

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.

---

## POST-INTEGRATION CHECKLIST (Orlando does manually)

1. Create API key in DTV admin panel (Configuración → Nueva API key)
2. Add `DTV_API_KEY` and `DTV_API_BASE_URL` to Vercel Production env vars
3. Add same values to local .env.local
4. Test: search "García" — confirm both Vigil and DTV results appear with attribution
5. Test: upload photo — confirm both Claude Vision AND DTV facial recognition results appear
6. Test: confirm graceful fallback when DTV key is removed (search still works from Vigil's own DB)
7. Run the admin center sync: POST /api/admin/sync-dtv-centers with X-Admin-Secret header
8. Confirm DTV results show proper attribution badge and back-link on every card
