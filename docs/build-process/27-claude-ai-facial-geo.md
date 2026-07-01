# Vigil — Claude AI Assistant Layer + Photo-Based Search + Geographic Breakdown
## Paste into Cursor Composer (Agent mode)

---

This is the most important feature set Vigil gets after stabilization.
Read @CLAUDE.md and @DESIGN-SYSTEM.md before starting.

## CONTEXT — What Claude Should Do in the App

Claude currently does nothing in the live app. This changes with this session.
Claude becomes the intelligence layer that ties everything together:
- Understands natural language in ANY of the 8 supported languages
- Queries live Supabase data to give grounded, accurate answers
- Never invents information — if data isn't in the database, it says so
- Routes people to the right feature or resource immediately

---

## TASK A — Venezuela Geographic Data (state/municipality/parish breakdown)

### A1. Add geographic fields to existing tables

```sql
-- Add structured geographic fields to missing_persons
ALTER TABLE missing_persons
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS municipio TEXT,
  ADD COLUMN IF NOT EXISTS parroquia TEXT;

-- Add to map_markers too
ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS municipio TEXT;

-- Create indexes for filtering
CREATE INDEX IF NOT EXISTS idx_mp_estado ON missing_persons(estado) WHERE estado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mp_municipio ON missing_persons(municipio) WHERE municipio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_markers_estado ON map_markers(estado) WHERE estado IS NOT NULL;
```

### A2. Create Venezuela geographic reference

Create `src/lib/venezuela-geo.ts` with the complete list of Venezuela's
23 estados + Distrito Capital, their municipios, and parroquias for the
most affected regions (La Guaira, Miranda, Carabobo, Aragua, Yaracuy,
Caracas). Full national data is available at:
https://github.com/meleu/venezueladata (open source, public domain)

For the initial build, include at minimum:
- All 24 estados/DC as a flat array for the state dropdown
- For the 6 most-affected states: their municipios and key parroquias
- The rest: municipios only (parroquias can be added progressively)

```typescript
export const VENEZUELA_ESTADOS = [
  'Amazonas', 'Anzoátegui', 'Apure', 'Aragua', 'Barinas',
  'Bolívar', 'Carabobo', 'Cojedes', 'Delta Amacuro', 'Distrito Capital',
  'Falcón', 'Guárico', 'Lara', 'La Guaira', 'Mérida',
  'Miranda', 'Monagas', 'Nueva Esparta', 'Portuguesa', 'Sucre',
  'Táchira', 'Trujillo', 'Vargas', 'Yaracuy', 'Zulia'
]

// Priority states — most affected by the 2026 earthquake
export const PRIORITY_ESTADOS = [
  'La Guaira', 'Caracas', 'Miranda', 'Carabobo', 'Aragua', 'Yaracuy'
]
```

### A3. Update the report form

In `/reportar`, add three cascading select fields after "Última ubicación":
- Estado (dropdown, required)
- Municipio (dropdown, populates based on selected estado)
- Parroquia (dropdown, optional, populates based on selected municipio)

These should be ADDITIONAL to the free-text location field, not replace it.

### A4. Add geographic filter to search

In `/buscar`, add filter chips: "Todo el país" + the most-affected states
as quick filters. These filter the Supabase query by `estado` field.

### A5. Statistics page

Create `/estadisticas` — a simple breakdown:
- Count of missing persons by estado (bar or number list)
- Count found alive by estado
- Auto-refreshes via Supabase Realtime subscription on the
  missing_persons table
- Source: "Datos de Vigil, actualizados en tiempo real"

---

## TASK B — Duplicate Detection (activate what was always planned)

The schema already has a `duplicate_of UUID` field on missing_persons.
Now build the detection:

Create `src/app/api/cron/dedup/route.ts` — runs on a schedule:

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const supabase = createAdminClient()
  const anthropic = new Anthropic()

  // Get recent unverified records from the last 24 hours
  const { data: recent } = await supabase
    .from('missing_persons')
    .select('id, full_name, age, gender, last_seen_location, estado')
    .eq('status', 'missing')
    .is('duplicate_of', null)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .limit(50)

  if (!recent?.length) return Response.json({ processed: 0 })

  // Ask Claude Haiku to identify probable duplicates within this batch
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: `Analyze this list of missing persons reports and identify probable duplicates.
Two records are probably the same person if: same or very similar name, similar age (within 5 years), same general location.
Return ONLY a JSON array of pairs: [{"original_id": "...", "duplicate_id": "..."}]
If no duplicates found, return [].

Records:
${JSON.stringify(recent, null, 2)}`
    }]
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  try {
    const pairs = JSON.parse(text)
    for (const pair of pairs) {
      await supabase.from('moderation_queue').insert({
        table_name: 'missing_persons',
        record_id: pair.duplicate_id,
        reason: 'ai_duplicate',
        ai_confidence: 0.8,
        notes: `Probable duplicate of record ${pair.original_id}`
      })
    }
    return Response.json({ processed: recent.length, duplicatesFound: pairs.length })
  } catch {
    return Response.json({ error: 'parse failed' })
  }
}
```

Add to vercel.json or next.config.js to run every 2 hours:
```json
{
  "crons": [{ "path": "/api/cron/dedup", "schedule": "0 */2 * * *" }]
}
```

---

## TASK C — Photo-Based Search (Claude Vision, no biometric storage)

This is NOT storing face embeddings or biometric data.
It uses Claude's vision capability to describe a photo's person in structured
text, then matches against existing text descriptions in the database.
No third-party facial recognition service. No biometric data retained.

### C1. API route

Create `src/app/api/photo-search/route.ts`:

(See implementation in repo — Claude Vision + Haiku matching against `public_missing_persons`.)

### C2. UI — Photo search option on /buscar

Add a secondary search option below the name search bar.
After upload: show loading, then person cards with confidence label.
Privacy notice: photo analyzed temporarily, not stored.

---

## TASK D — Claude AI Assistant (Active in the App)

Create `src/app/api/assistant/route.ts` with live Supabase context.
Create `src/components/ai/VigilAssistant.tsx` — floating widget with SSE streaming.

---

## TASK E — Commit

Save as `docs/build-process/27-claude-ai-facial-geo.md`.

---

## Report back

1. Confirm USGS assistant response works
2. Confirm photo search returns a plausible description from a test photo
3. Confirm geographic dropdowns cascade correctly (estado → municipio)
4. Confirm duplicate detection cron job is scheduled correctly
5. Note: monitor Anthropic console for API costs after deploy
