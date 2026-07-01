# Vigil — DTV Centro Geocoding + Statistics Field Fix
## Archived build prompt — completed 2026-07-01

---

## THE PROBLEM

DTV's /centros API returns 85 centers with only text `ubicacion` (address), 
no lat/lng. The sync route silently skips any centro without coordinates, 
so 0 of 85 imported. The fix: add a free Nominatim geocoding step.

Also: /estadisticas network totals show zero — likely a DTV API pagination 
field name mismatch. Fix both in this session.

---

## TASK A — Debug DTV API Response Shape (do this first)

Before changing any code, fetch the actual API response to see exact field 
names for pagination and centro data:

```bash
# Check personas pagination fields
curl -s -H "X-Api-Key: $DTV_API_KEY" \
  "$DTV_API_BASE_URL/personas?limit=1" | jq '{pagination, total, count, meta}'

# Check centros data shape  
curl -s -H "X-Api-Key: $DTV_API_KEY" \
  "$DTV_API_BASE_URL/centros?limit=3" | jq '.'
```

Report EXACTLY what fields the response contains — do not assume.
The statistics fix depends on knowing the real field names.

---

## TASK B — Fix /api/dtv-metrics (statistics totals showing zero)

Based on the actual response fields found in Task A, update 
`src/app/api/dtv-metrics/route.ts` to use the correct field names.

Common patterns to check:
```typescript
// Try these in order until one returns a non-zero number:
const total = 
  data.pagination?.total ||   // { pagination: { total: N } }
  data.total ||               // { total: N }
  data.count ||               // { count: N }
  data.meta?.total ||         // { meta: { total: N } }
  data.data?.length ||        // fallback: count items in first page
  0
```

After fixing, verify by visiting /estadisticas on the live site and 
confirming DTV network totals show real numbers, not zeros.

---

## TASK C — Add Nominatim Geocoding to Centro Sync

Nominatim is OpenStreetMap's free geocoding service. No API key required.
Rate limit: 1 request per second (must be respected).

Update `src/app/api/admin/sync-dtv-centers/route.ts`:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

// Geocode a Venezuelan address using Nominatim (free, no API key)
async function geocodeVenezuela(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address?.trim()) return null
  
  // Always append Venezuela for better accuracy
  const query = encodeURIComponent(`${address.trim()}, Venezuela`)
  const url = `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=ve`
  
  try {
    const res = await fetch(url, {
      headers: {
        // Required by Nominatim — identify your application
        'User-Agent': 'Vigil/1.0 humanitarian crisis platform vigil.youthewave.org',
        'Accept-Language': 'es',
      },
    })
    
    if (!res.ok) return null
    const data = await res.json()
    
    if (!data?.length) return null
    
    const lat = parseFloat(data[0].lat)
    const lng = parseFloat(data[0].lon)
    
    // Validate coordinates are within Venezuela bounds
    if (lat < 0.6 || lat > 12.5 || lng < -73.5 || lng > -59.5) {
      console.warn(`Geocoding returned out-of-bounds coords for: ${address}`, { lat, lng })
      return null
    }
    
    return { lat, lng }
  } catch (error) {
    console.error('Nominatim geocoding failed:', error)
    return null
  }
}

// Rate-limited delay between Nominatim requests (1 req/sec policy)
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function POST(req: Request) {
  // Admin protection
  const authHeader = req.headers.get('x-admin-secret')
  if (authHeader !== process.env.VIGIL_ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const supabase = createAdminClient()
  
  // Fetch all DTV centers (paginated)
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
    // Use actual field names from Task A output
    const items = data.data || data.centros || []
    allCentros.push(...items)
    cursor = data.pagination?.nextCursor || data.nextCursor
  } while (cursor)

  console.log(`Fetched ${allCentros.length} centros from DTV`)

  let geocoded = 0
  let skipped = 0
  let imported = 0
  let failed = 0

  for (const centro of allCentros) {
    // Extract address from whatever field DTV uses
    const address = centro.ubicacion || centro.direccion || centro.address || centro.nombre
    
    if (!address) {
      skipped++
      continue
    }

    // Respect Nominatim rate limit: 1 request per second
    await sleep(1100)

    const coords = await geocodeVenezuela(address)
    
    if (!coords) {
      console.warn(`Could not geocode: ${address}`)
      skipped++
      continue
    }
    
    geocoded++

    // Determine type from DTV data
    const isHospital = 
      centro.tipo?.toLowerCase().includes('hospital') ||
      centro.nombre?.toLowerCase().includes('hospital') ||
      centro.nombre?.toLowerCase().includes('clínica') ||
      centro.nombre?.toLowerCase().includes('clinica')
    
    const { error } = await supabase.from('map_markers').upsert({
      // Use DTV's own ID as a stable external reference
      external_id: `dtv-centro-${centro.id || centro._id}`,
      type: isHospital ? 'hospital' : 'collection_point',
      category: isHospital ? 'medical' : 'other',
      title: centro.nombre || centro.name || address,
      description: address,
      lat: coords.lat,
      lng: coords.lng,
      source: 'desaparecidosterremotovenezuela.com',
      verified: true,
      status: 'active',
    }, { onConflict: 'external_id' })
    
    if (error) {
      console.error('Supabase upsert failed:', error.message)
      failed++
    } else {
      imported++
    }
  }
  
  const result = {
    total: allCentros.length,
    geocoded,
    imported,
    skipped,
    failed,
    estimatedDuration: `${(allCentros.length * 1.1).toFixed(0)} seconds`
  }
  
  console.log('DTV centro sync complete:', result)
  return Response.json(result)
}
```

Note: `external_id` column may need to be added to map_markers:
```sql
ALTER TABLE map_markers 
  ADD COLUMN IF NOT EXISTS external_id TEXT UNIQUE;
```

Add this migration as `supabase/migrations/009_external_id.sql` and apply it.

---

## TASK D — Trigger the Sync

After deploying, trigger the sync from the terminal (takes ~90 seconds 
for 85 centers at 1 req/sec):

```bash
curl -X POST https://vigil.youthewave.org/api/admin/sync-dtv-centers \
  -H "x-admin-secret: $VIGIL_ADMIN_SECRET"
```

Wait for the response — it will show:
```json
{
  "total": 85,
  "geocoded": N,
  "imported": N, 
  "skipped": N,
  "failed": 0
}
```

Then open the Vigil crisis map and confirm DTV centers appear as 
distinct pins with the DTV attribution in their popup.

If `geocoded` is very low (< 20), the addresses may be too abbreviated 
for Nominatim to resolve — report back with a sample address from the 
DTV API response for manual review.

---

## Commit

```bash
git add -A
git commit -m "fix: DTV centro geocoding via Nominatim, statistics field alignment

- Added free Nominatim geocoding to centro sync (no API key, no cost)
- Rate-limited to 1 req/sec per Nominatim policy
- Validates coordinates fall within Venezuela bounds before storing
- Added external_id column for stable DTV center deduplication
- Fixed DTV metrics API to use correct pagination field names
- 85 DTV centers now geocodable and importable to crisis map

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.

---

## Report back

1. Show exact curl output from Task A (what fields does DTV return?)
2. Confirm /estadisticas now shows real DTV numbers
3. Show sync result JSON (total/geocoded/imported/skipped counts)
4. Confirm DTV center pins appear on the crisis map
