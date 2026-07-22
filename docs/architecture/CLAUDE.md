# CLAUDE.md — Vigil Crisis Platform
**Agent Instruction Document — Read this before every session. Follow it without exception.**

---

## Identity & Mission

**Project:** Vigil
**Tagline:** We stand watch when it matters most.
**Current deployment:** Venezuela earthquake response (June 2026)
**Long-term purpose:** Universal crisis platform — one config file change deploys for any country, any disaster.

Vigil does NOT reinvent existing tools. It aggregates them. Every proven humanitarian platform is a data source, a link, or a partner. Vigil is the unified interface that brings them together for six distinct user groups: rescue teams, volunteers, victims, diaspora searching for family, donors, and organizations.

---

## Operator

**Orlando Toro** — Founder & CCO, Bbluestudios LLC
**Methodology:** BMAD-Nova Protocol. Spec before code. Always. No exceptions.
**Rule:** If a task is ambiguous, ask ONE clarifying question before writing any code.

---

## Tech Stack — No Deviations

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 App Router | Known stack, SSR, Edge, PWA-compatible |
| Database | Supabase (Postgres + Realtime) | Real-time subscriptions for live missing persons board |
| Auth | Supabase Auth | Email + phone OTP. No passwords for victims in crisis. |
| Hosting | Vercel | Deploy in seconds, free hobby tier, edge network |
| Map | Leaflet.js + OpenStreetMap tiles | Free, no billing, Venezuela-locked bounds |
| Styling | Tailwind CSS | Fast, consistent, mobile-first |
| i18n | next-intl | Spanish default, English toggle, Portuguese/French/Italian |
| AI | Claude API (Haiku 3.5 for batch tasks) | Translation, deduplication, match suggestions |
| Automation | Make.com → Supabase | WhatsApp/Telegram intake bridge |
| CDN/DDoS | Cloudflare Free | Must be in front of Vercel from day one |
| PWA | next-pwa | Service worker, offline form queue, 2G-optimized |

**DO NOT suggest:** Firebase, MongoDB, GraphQL, Prisma, additional SaaS tools with costs, or anything that requires setup time > 15 minutes.

---

## Crisis Configuration — Always Read This First

```typescript
// src/config/crisis.config.ts
// THIS FILE IS THE ONLY THING THAT CHANGES BETWEEN DEPLOYMENTS
export const CRISIS_CONFIG = {
  country: 'Venezuela',
  countryCode: 'VE',
  crisis: '2026 Earthquakes',
  crisisDate: '2026-06-24',
  defaultLang: 'es',
  supportedLangs: ['es', 'en', 'pt', 'fr', 'it', 'zh', 'de', 'ru'],
  mapBounds: {
    minLat: 0.6, maxLat: 12.5,
    minLng: -73.5, maxLng: -59.5,
    centerLat: 10.4,  centerLng: -66.9,
    defaultZoom: 7
  },
  emergency: {
    hotline: '911',
    hotlineLabel: '911',
    // VenApp intentionally excluded — see Vigil Privacy Policy section on
    // government data non-cooperation. VenApp has documented human rights concerns.
  },
  partnerLinks: [
    { name: 'Red de Intérpretes', url: 'https://interp-aid.lovable.app', type: 'translation' },
    { name: 'ReliefWeb Venezuela', url: 'https://reliefweb.int/country/ven', type: 'official' },
    { name: 'OCHA Venezuela', url: 'https://www.unocha.org/venezuela', type: 'official' },
    { name: 'UNICEF Venezuela', url: 'https://www.unicef.org/venezuela', type: 'official' },
    { name: 'Cruz Roja Venezolana', url: 'https://cruzrojavenezolana.org', type: 'ngo' },
  ],
  usgsQuery: {
    starttime: '2026-06-24',
    minMagnitude: 2.0,
    alertThreshold: 4.0,   // Push notification above this magnitude
    refreshMs: 300000       // 5 minutes
  }
}
```

**VenApp exclusion:** The Venezuelan government app VenApp is intentionally omitted from `partnerLinks` and the emergency banner. Vigil does not link to or promote government-operated intake tools — consistent with our Privacy Policy commitment not to share user data with the Venezuelan government and documented human rights concerns around VenApp.

---

## File Structure

```
vigil/
├── CLAUDE.md                          ← This file. Read every session.
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← Root layout with emergency banner
│   │   ├── page.tsx                   ← Home: map + status feed
│   │   ├── buscar/page.tsx            ← Search missing persons
│   │   ├── reportar/page.tsx          ← Report missing person
│   │   ├── necesito-ayuda/page.tsx    ← I need help (drop a pin)
│   │   ├── voluntarios/page.tsx       ← Volunteer registration
│   │   ├── organizaciones/page.tsx    ← Verified org directory
│   │   ├── donaciones/page.tsx        ← Donation portal (links out, no payment processing)
│   │   ├── noticias/page.tsx          ← Official updates (ReliefWeb + HDX feed)
│   │   └── admin/page.tsx             ← Orlando-only moderation dashboard
│   ├── components/
│   │   ├── layout/
│   │   │   ├── EmergencyBanner.tsx    ← Always visible hotline + hotlinks
│   │   │   ├── Navigation.tsx
│   │   │   └── LanguageSwitcher.tsx
│   │   ├── map/
│   │   │   ├── CrisisMap.tsx          ← Main Leaflet map component
│   │   │   ├── MapLayers.tsx          ← Layer toggles: aftershocks/needs/resources
│   │   │   ├── AftershockLayer.tsx    ← USGS real-time data
│   │   │   ├── NeedsLayer.tsx         ← User-submitted need pins
│   │   │   └── ResourceLayer.tsx      ← Available resources pins
│   │   ├── missing/
│   │   │   ├── MissingPersonCard.tsx
│   │   │   ├── MissingPersonForm.tsx
│   │   │   ├── MissingPersonSearch.tsx
│   │   │   └── StatusBadge.tsx        ← missing | found_alive | found_deceased | unverified
│   │   ├── feed/
│   │   │   ├── ReliefWebFeed.tsx      ← Official updates
│   │   │   └── AftershockAlert.tsx    ← Push alert for mag 4.0+
│   │   └── ui/
│   │       ├── VerifiedBadge.tsx
│   │       ├── UnverifiedBadge.tsx
│   │       ├── FlagButton.tsx
│   │       └── EmergencyButton.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── usgs.ts                    ← USGS API queries + transform
│   │   ├── reliefweb.ts               ← ReliefWeb API queries
│   │   ├── hdx.ts                     ← HDX API queries
│   │   ├── ai/
│   │   │   ├── translate.ts           ← Claude Haiku translation
│   │   │   ├── deduplication.ts       ← Hourly batch dedup job
│   │   │   └── matching.ts            ← Missing persons match suggestions
│   │   └── pfif.ts                    ← PFIF export (Google Person Finder compatibility)
│   ├── config/
│   │   └── crisis.config.ts           ← THE ONLY FILE THAT CHANGES PER DEPLOYMENT
│   ├── i18n/
│   │   ├── es.json                    ← Spanish (primary)
│   │   ├── en.json
│   │   ├── pt.json
│   │   └── fr.json
│   └── types/
│       └── vigil.types.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql     ← Full schema below
└── public/
    ├── manifest.json                  ← PWA manifest
    └── sw.js                          ← Service worker
```

---

## Database Schema — Run This Migration First

```sql
-- supabase/migrations/001_initial_schema.sql

-- MISSING PERSONS (PFIF-compatible for Google Person Finder data sharing)
CREATE TABLE missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  age INT,
  gender TEXT,
  photo_url TEXT,
  last_seen_location TEXT NOT NULL,
  last_seen_lat DECIMAL(9,6),
  last_seen_lng DECIMAL(9,6),
  last_seen_at TIMESTAMPTZ,
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  status TEXT DEFAULT 'missing' CHECK (status IN ('missing','found_alive','found_deceased','unverified')),
  notes TEXT,
  source TEXT DEFAULT 'web' CHECK (source IN ('web','whatsapp','telegram','partner','pfif_import')),
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  duplicate_of UUID REFERENCES missing_persons(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MAP MARKERS (needs, resources, shelters, hospitals, danger zones)
CREATE TABLE map_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('need','resource','shelter','hospital','danger','rescue_zone','collection_point')),
  category TEXT CHECK (category IN ('food','water','medical','rescue','shelter','clothing','comms','power','transport','other')),
  title TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  contact TEXT,
  urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','unverified')),
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  source TEXT DEFAULT 'citizen',
  reporter_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ORGANIZATIONS (NGOs, rescue teams, government, diaspora groups)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('rescue','medical','food','shelter','translation','tech','government','diaspora','donation','legal')),
  country TEXT,
  description_es TEXT,
  description_en TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  donation_link TEXT,
  donation_instructions TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  location_label TEXT,
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  approved_by_admin BOOLEAN DEFAULT false,  -- Orlando manually approves
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VOLUNTEERS
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',  -- medical, rescue, logistics, translation, tech, construction, drone, legal, psych
  languages TEXT[] DEFAULT '{}',
  location TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  availability TEXT CHECK (availability IN ('immediate','this_week','remote_only','on_request')),
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,
  matched_to UUID REFERENCES organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEEDS / RESOURCE OFFERS (structured for matching)
CREATE TABLE needs_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('need','offer')),
  category TEXT CHECK (category IN ('food','water','medical_supplies','medicine','blood','shelter','clothing','transport','money','equipment','manpower','other')),
  description TEXT NOT NULL,
  quantity TEXT,
  location TEXT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  contact TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','matched','fulfilled','expired')),
  urgent BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- MODERATION QUEUE (auto-populated by AI or flag count ≥ 3)
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  reason TEXT,  -- 'flag_threshold' | 'ai_duplicate' | 'ai_suspicious' | 'out_of_bounds'
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTO-MODERATION RULES (handled by Supabase Edge Functions)
-- Rule 1: flag_count >= 3 → insert into moderation_queue, set flagged=true
-- Rule 2: coordinates outside Venezuela bounds → auto-reject
-- Rule 3: same IP, 5+ submissions in 60 min → quarantine
-- Rule 4: missing_persons.status changes → trigger AI match check

-- ENABLE REAL-TIME (critical for live missing persons board)
ALTER PUBLICATION supabase_realtime ADD TABLE missing_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE map_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE needs_offers;

-- INDEXES
CREATE INDEX idx_missing_persons_status ON missing_persons(status);
CREATE INDEX idx_missing_persons_name ON missing_persons USING gin(to_tsvector('spanish', full_name));
CREATE INDEX idx_map_markers_type ON map_markers(type, status);
CREATE INDEX idx_map_markers_location ON map_markers(lat, lng);

-- ROW LEVEL SECURITY
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;

-- Public read on verified/non-flagged records
CREATE POLICY "public_read_missing" ON missing_persons
  FOR SELECT USING (flagged = false OR verified = true);

CREATE POLICY "public_read_markers" ON map_markers
  FOR SELECT USING (flagged = false OR verified = true);

-- Anyone can insert (open submission)
CREATE POLICY "public_insert_missing" ON missing_persons FOR INSERT WITH CHECK (true);
CREATE POLICY "public_insert_markers" ON map_markers FOR INSERT WITH CHECK (true);
```

---

## API Integrations

### USGS Earthquake (free, no key)
```typescript
// src/lib/usgs.ts
const BASE = 'https://earthquake.usgs.gov/fdsnws/event/1/query'

export async function getVenezuelaSeismicEvents() {
  const params = new URLSearchParams({
    format: 'geojson',
    minlatitude: '0.6', maxlatitude: '12.5',
    minlongitude: '-73.5', maxlongitude: '-59.5',
    orderby: 'time',
    limit: '300',
    starttime: CRISIS_CONFIG.crisisDate,
    minmagnitude: '2.0'
  })
  const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 300 } })
  return res.json()
}

// Color scale for map rendering
export function getMagnitudeColor(mag: number): string {
  if (mag < 2.5) return '#22c55e'   // green
  if (mag < 4.0) return '#f59e0b'   // amber
  if (mag < 5.5) return '#f97316'   // orange
  return '#dc2626'                   // red
}
```

### ReliefWeb (free, no key)
```typescript
// src/lib/reliefweb.ts
export async function getVenezuelaUpdates(limit = 10) {
  const res = await fetch(
    `https://api.reliefweb.int/v1/reports?appname=vigil-crisis&filter[field]=country.iso3&filter[value]=VEN&limit=${limit}&sort[]=date:desc&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`,
    { next: { revalidate: 3600 } }  // cache 1hr - official updates don't change minute by minute
  )
  return res.json()
}
```

### HDX Humanitarian Data (free)
```typescript
// src/lib/hdx.ts
// Venezuela country page: https://data.humdata.org/group/ven
export async function getVenezuelaDatasets() {
  const res = await fetch(
    'https://data.humdata.org/api/3/action/package_search?q=venezuela+earthquake&rows=10',
    { next: { revalidate: 86400 } }  // cache 24hr
  )
  return res.json()
}
```

### Claude API — AI Layer (Haiku 3.5 ONLY for cost control)
```typescript
// src/lib/ai/translate.ts
// Use claude-haiku-4-5-20251001 for ALL moderation/translation tasks
// Reserve claude-sonnet-4-6 only for complex match reasoning if needed

export async function translateMissingPersonReport(text: string, targetLang: string) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Translate this missing person report to ${targetLang}. Return only the translation, no commentary:\n\n${text}`
      }]
    })
  })
  const data = await res.json()
  return data.content[0].text
}
```

### PFIF Export (Google Person Finder compatibility)
```typescript
// src/lib/pfif.ts
// Expose /api/pfif endpoint so Google Person Finder can index Vigil's missing persons
// PFIF 1.4 standard: https://google.github.io/personfinder/pfif-specification.html
// This makes Vigil's data appear in Google's system automatically
```

---

## Moderation: No Human Moderators Required at Launch

The system is designed to be self-regulating:

1. **Everything posts immediately** but displays with an "Unverified" badge. Users see the label and calibrate trust accordingly.
2. **Rate limiting** (Vercel Edge middleware): max 5 submissions per IP per 60 minutes. Kills spam before it enters the database.
3. **Coordinate validation**: If lat/lng falls outside Venezuela bounding box → auto-reject at API layer. No manual review needed.
4. **AI deduplication** runs as a Supabase cron job every 60 minutes (not real-time, keeps API costs low). Flags probable duplicates to the moderation queue.
5. **Community flagging**: Any visitor can flag a post in 2 clicks. 3 flags → auto-hidden + added to queue.
6. **Orlando is the only admin.** Supabase admin dashboard on his phone is enough. Spend 15 minutes per day max.
7. **Trusted sources auto-verify**: When organizations like Red Cross, UNICEF, or Ángel Rivas's translator network submit via API, their records are marked `verified: true` at intake.
8. **Organizations require manual approval** before they appear in the directory. Only Orlando approves.

---

## Design System

**Palette:**
```
--vigil-red:     #DC2626   /* Emergency, danger, urgent */
--vigil-green:   #16A34A   /* Safe, found alive, verified */
--vigil-amber:   #D97706   /* Unverified, caution, warning */
--vigil-blue:    #1D4ED8   /* Primary actions, links */
--vigil-slate:   #0F172A   /* Background dark mode */
--vigil-light:   #F8FAFC   /* Background light mode */
--vigil-text:    #1E293B   /* Body text */
--vigil-muted:   #64748B   /* Secondary text */
```

**Typography:** Inter (multilingual support, free, Google Fonts)
**Border radius:** 4px (functional, not decorative)
**Default theme:** Light (accessibility, high contrast)
**Motion:** Minimal. This is a crisis tool, not a portfolio piece.

**Emergency Banner (always visible, cannot be dismissed):**
```
🚨  Emergencias Venezuela: 911 (Movistar 911 · Digitel 112 · Movilnet *1 · Cantv 171)  |  Directorio  |  Cruz Roja
```

---

## Performance Constraints (non-negotiable)

- Target: functional at 2G / 512kbps
- No image above the fold larger than 50KB
- All images lazy-loaded with blur placeholders
- Supabase queries must be indexed (check with EXPLAIN ANALYZE before shipping)
- Map tiles load progressively, don't block UI
- Missing person photos: compress to max 200KB on upload before storing in Supabase Storage
- Offline: missing persons search uses last cached query, form submissions queue in localStorage

---

## Build Phases

### Phase 0 — Weekend 1 (NOW)
- [ ] Next.js project init + Vercel deploy + Cloudflare DNS
- [ ] Supabase project + run 001_initial_schema.sql migration
- [ ] crisis.config.ts
- [ ] Layout with EmergencyBanner
- [ ] Missing persons: submit form
- [ ] Missing persons: search + real-time feed
- [ ] USGS aftershock map (Leaflet, Venezuela-locked)
- [ ] Official info: hotline, partner links, ReliefWeb feed
- [ ] PWA manifest + basic service worker

### Phase 1 — Week 1
- [ ] Organization directory (seed 20 verified orgs manually)
- [ ] "I need help" / "I have resources" pins on map
- [ ] Volunteer registration form
- [ ] WhatsApp intake via Make.com → Supabase Edge Function
- [ ] Language switcher (ES/EN minimum)
- [ ] Admin dashboard for Orlando (Supabase Studio + custom view)
- [ ] Rate limiting middleware
- [ ] PFIF export endpoint

### Phase 2 — Week 2
- [ ] Claude Haiku: translation on submit
- [ ] Claude Haiku: hourly deduplication cron job
- [ ] Match suggestions (when status changes to found, scan for matching searches)
- [ ] Telegram bot (10 lines)
- [ ] Donation section with verified org profiles
- [ ] ReliefWeb + HDX feed page
- [ ] Push notifications (PWA) for mag 4.0+ aftershocks

### Phase 3 — Month 1
- [ ] Abstract all Venezuela config into crisis.config.ts (already done from day 1)
- [ ] Multi-country framework documented
- [ ] "Vigil: Venezuela" becomes a template for any future deployment
- [ ] Open source the codebase on GitHub

---

## Agent Rules

1. BMAD-Nova applies: **spec before code**. If asked to build a new feature, confirm the spec matches this CLAUDE.md before writing code.
2. Never suggest paid tools without explicitly noting the cost and justifying the ROI.
3. Keep the Venezuela deployment live and functional at all times. No breaking changes to the live site without a migration plan.
4. All user-facing copy defaults to Spanish. English is a toggle, never the default.
5. Every database query must be tested against the schema above before generating.
6. Performance budget is law. No component ships without considering 2G behavior.
7. Claude API calls: Haiku 3.5 for all automated/batch tasks. Never use Sonnet in a hot path.
8. When in doubt about a feature, ask: "Does this help families searching for missing Venezuelans right now?" If yes, build it. If not, defer.

---

## First Cursor Prompt (copy-paste to start Day 1)

```
Read CLAUDE.md completely before doing anything.

Task: Initialize the Vigil crisis platform — Phase 0, Day 1.

Execute in this exact order:

1. Create Next.js 14 App Router project with TypeScript and Tailwind CSS configured
2. Install dependencies: @supabase/supabase-js @supabase/ssr leaflet react-leaflet next-intl next-pwa
3. Create src/config/crisis.config.ts with the exact config from CLAUDE.md
4. Create src/types/vigil.types.ts with TypeScript interfaces for all database tables
5. Create the layout.tsx with:
   - EmergencyBanner component (always visible, hotline 911, Intérpretes + Cruz Roja links)
   - Navigation with links to: Buscar persona / Reportar / Necesito ayuda / Voluntarios / Organizaciones / Donar / Noticias
   - LanguageSwitcher (ES default)
6. Create the home page (/) with:
   - Left panel: MissingPersonSearch + real-time recent submissions feed
   - Right panel: CrisisMap with USGS aftershock layer (Venezuela bounds from crisis.config.ts)
7. Create src/app/reportar/page.tsx: missing person submit form
8. Create src/app/buscar/page.tsx: missing person search
9. Create supabase/migrations/001_initial_schema.sql with the schema from CLAUDE.md
10. Create public/manifest.json for PWA

Do not skip steps. Do not add features not listed. Confirm schema against CLAUDE.md before every Supabase query.
```

---

*Last updated: June 29, 2026 | Version: 0.1.0-venezuela*
