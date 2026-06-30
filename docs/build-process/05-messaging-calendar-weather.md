# Vigil — Lightweight Messaging, Collection Points, Calendar, Weather Bar
## Paste into Cursor Composer (Agent mode)

---

Read @CLAUDE.md and @DESIGN-SYSTEM.md before starting.

## CONTEXT — Why this approach instead of real-time chat

Real-time chat is intentionally NOT being built. It introduces auth complexity, 
moderation burden, and abuse surface disproportionate to a solo-operated platform. 
Instead, build the proven pattern from Google Person Finder (public notes) and 
a private claim-link system (no passwords required, matches CLAUDE.md's "no 
passwords for victims in crisis" principle).

---

## TASK A — Public Notes System (missing persons)

### A1. Migration

```sql
-- supabase/migrations/003_notes_and_claims.sql

ALTER TABLE missing_persons ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT gen_random_uuid();
ALTER TABLE resource_exchange ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT gen_random_uuid();

CREATE TABLE missing_person_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  note_type TEXT DEFAULT 'sighting' CHECK (note_type IN ('sighting','status_update','encouragement','correction')),
  message TEXT NOT NULL,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE missing_person_notes;
ALTER TABLE missing_person_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_notes" ON missing_person_notes FOR SELECT USING (flagged = false);
CREATE POLICY "public_insert_notes" ON missing_person_notes FOR INSERT WITH CHECK (true);
CREATE INDEX idx_notes_person ON missing_person_notes(missing_person_id, created_at DESC);

-- Private inbox: contact_requests already exists from the original schema.
-- Add claim_token reference so the record owner can view requests without a password.
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT false;
```

### A2. UI — Notes thread on the Missing Person Card / detail view

Below each missing person's full detail (clicking a card opens a detail view if 
one doesn't exist yet — create `src/app/buscar/[id]/page.tsx`):

- "Actualizaciones y avistamientos" section
- List of notes, newest first, each showing: author name, note type badge 
  (color-coded: sighting=blue, status_update=green, encouragement=gray, 
  correction=amber), message, time ago
- "Agregar actualización" button → small inline form: name, note type select, 
  message textarea, submit
- Real-time subscription so new notes appear instantly for anyone viewing

### A3. Claim Link System

When a missing person report is successfully submitted, show a confirmation 
screen with:

```
Tu reporte fue enviado correctamente.

Guarda este enlace para gestionar tu reporte y ver actualizaciones:
https://vigil.youthewave.org/mi-reporte/{claim_token}

⚠️ Este enlace es privado. Solo tú deberías tenerlo.
```

Include a "Copiar enlace" button. If the submitter provided an email, also send 
this link via Resend automatically.

Create `src/app/mi-reporte/[token]/page.tsx`:
- Looks up the missing_persons record by claim_token (NOT by id — id should not 
  be guessable/usable for this lookup, token is the only key)
- Shows the full record with edit capability: update status (missing → found 
  alive/deceased), edit notes/description
- Shows all notes/sightings on the record
- Shows all contact_requests received (name, relationship, message, phone) — 
  THIS is where private contact info becomes visible, only to the token holder
- Mark requests as "viewed"

Apply the same claim_token pattern to `resource_exchange` — when someone posts 
an offer/need, they get a link to `/mi-intercambio/{claim_token}` to see who 
wants to connect with them.

---

## TASK B — Citizen Collection Point Self-Registration

### B1. Migration

```sql
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS hours_schedule TEXT;
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS accepts_categories TEXT[] DEFAULT '{}';
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS organizer_name TEXT;
```

### B2. UI — Self-registration form

Create `src/app/punto-de-acopio/page.tsx` (or a modal accessible from the map 
page) — a friendly form specifically for citizens organizing collection points:

Fields:
- Nombre del punto de acopio (title)
- Organizador (your name or group name)
- Ubicación (address/description + optional map pin)
- ¿Qué reciben? (multi-select: alimentos, agua, ropa, medicinas, higiene, 
  herramientas, otros)
- Horario (text: "Lunes a Viernes 9am-5pm" — free text, not a complex scheduler)
- Contacto (masked in public view, routed through contact request system)

These submit as `map_markers` with `type = 'collection_point'`. Unlike 
organizations (which require admin approval), collection points are 
auto-approved but auto-flagged for review if they receive 3+ flags — citizens 
organizing physical donation points is lower-risk than claiming NGO status, 
so friction should be minimal.

Display on the map with a distinct icon (Package/Box icon, amber color) and 
in the card popup show: title, organizer, hours, categories accepted, "Solicitar 
contacto" button.

---

## TASK C — Events Calendar

### C1. Migration

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('donation_drive','volunteer_meetup','distribution','info_session','memorial','other')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location_label TEXT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  organizer_name TEXT,
  organizer_contact TEXT,
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_events" ON events FOR SELECT USING (flagged = false);
CREATE POLICY "public_insert_events" ON events FOR INSERT WITH CHECK (true);
CREATE INDEX idx_events_starts ON events(starts_at) WHERE flagged = false;
```

### C2. UI — Calendar page

Create `src/app/calendario/page.tsx`. Do NOT use a heavy calendar grid library — 
keep it lightweight and mobile-first:

- A simple date-grouped list view: events grouped by day, sorted chronologically, 
  showing only upcoming events by default
- Each event card: category icon + color, title, time (formatted in Venezuela 
  time, see Task D for timezone handling), location, organizer
- Filter pills: Todos · Recolección · Encuentro de Voluntarios · Distribución · 
  Información · Memorial
- "Agregar evento" button → form: title, description, category, date/time 
  start (datetime-local input), end (optional), location, organizer name, 
  contact (masked)
- Real-time subscription — new events appear without refresh

Add "Calendario" to navigation (desktop sidebar and mobile "Más" menu).

---

## TASK D — Weather + Time Bar

### D1. API Route

Create `src/app/api/weather/route.ts` using Open-Meteo (free, no API key required):

```typescript
import { NextResponse } from 'next/server'

const LOCATIONS = [
  { name: 'Caracas', lat: 10.4806, lng: -66.9036 },
  { name: 'La Guaira', lat: 10.6014, lng: -66.9311 },
]

export const revalidate = 1800 // 30 minutes

export async function GET() {
  const results = await Promise.all(
    LOCATIONS.map(async (loc) => {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}` +
        `&current=temperature_2m,precipitation_probability,weather_code` +
        `&timezone=America/Caracas`
      )
      const data = await res.json()
      return {
        name: loc.name,
        temp: Math.round(data.current.temperature_2m),
        precipProbability: data.current.precipitation_probability,
        weatherCode: data.current.weather_code,
      }
    })
  )
  return NextResponse.json({ locations: results, venezuelaTime: new Date().toLocaleString('es-VE', { timeZone: 'America/Caracas' }) })
}
```

Map `weather_code` (WMO codes) to a small icon set: clear (sun), cloudy (cloud), 
rain (cloud-rain), storm (cloud-lightning) — use Lucide icons, no external 
weather icon library needed.

### D2. UI — Slim ambient bar

Add a thin secondary bar, placed directly below the EmergencyBanner (smaller, 
lower visual weight — text-only, no background color competing with the red/dark 
emergency banner). Format:

```
🕐 Venezuela: 2:45 PM  ·  Caracas 28°C ☁️  ·  La Guaira 30°C ☀️ (20% lluvia)
```

This bar fetches `/api/weather` on mount and refreshes every 30 minutes 
(matches the revalidate window — no need to poll more often). Keep it to a 
single line, 11px text, `--vigil-muted` color, collapsible on mobile (tap to 
expand if space is tight) but always showing at minimum the Venezuela time.

This same time should be referenced anywhere events are displayed — format 
all event times explicitly in `America/Caracas` timezone regardless of the 
viewer's device timezone, and label it: "2:00 PM (hora de Venezuela)" so 
international teams aren't confused about which timezone they're seeing.

---

## TASK E — Navigation Updates

Add to both desktop sidebar and mobile "Más" menu:
- Calendario (new)
- Punto de Acopio (new, or fold into "Necesito Ayuda" as a sub-option)

Update i18n locale files (en.json, es.json minimum, others can follow) with 
new nav keys: `calendar`, `collectionPoint`.

---

## TASK F — Commit

```bash
git add -A
git commit -m "feat: lightweight messaging via notes+claims, collection points, calendar, weather bar

- Added public notes/sightings system on missing persons (Google Person Finder pattern)
- Added private claim-token links for report owners to manage their submissions
  without requiring passwords
- Added citizen collection point self-registration with hours and accepted categories
- Built events calendar: donation drives, volunteer meetups, distributions
- Added Open-Meteo weather + Venezuela time ambient bar (free, no API key)
- All new tables wired with Supabase Realtime subscriptions"
git push
```

---

## Report back to Orlando

Confirm in your summary:
1. The claim-token link is shown clearly at submission and copyable
2. Notes appear in real-time across browser tabs without refresh
3. The weather bar doesn't visually compete with the emergency banner
4. Event times are unambiguously labeled with Venezuela timezone
