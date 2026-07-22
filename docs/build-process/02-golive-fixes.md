# Vigil — Go-Live Master Prompt
## Full Audit + New Features + Real-Time Everything
## Paste this entire document into Cursor Agent. If blocked, hand the same file to Claude Code CLI.

---

## CRITICAL FIX #1 — Domain Mismatch

The domain configured in Vercel does not match the domain with the CNAME record in Cloudflare.
**Resolved (2026-06-30):** Canonical domain is `youthewave.org` (not the earlier typo `youtheway.org`). Steps applied:

1. Update `crisis.config.ts` — the production URL referenced anywhere in code, metadata, 
   sitemap, robots.txt, and the README must use the CORRECT domain only.
2. Search the entire codebase for any hardcoded wrong-domain references and fix them.
3. Update Vercel project domain settings to match (Orlando does this manually in dashboard).

---

## CRITICAL FIX #2 — Remove VenApp (human rights documentation)

VenApp was removed from Google Play and Apple App Store after being repurposed by the 
Venezuelan government to encourage citizens to report on each other, contributing to 
unlawful detentions (sources: CNN, Amnesty International). This conflicts with Vigil's 
own Privacy Policy commitment to never cooperate with government data requests.

1. Remove `officialApp` and `officialAppUrl` from `crisis.config.ts` entirely
2. Remove the VenApp link from `EmergencyBanner.tsx`
3. Remove "officialApp" key from ALL locale files (en.json, es.json, and all 6 generated)
4. Grep entire codebase for "VenApp" and "venapp.gob.ve" — confirm zero remaining references
5. Add code comment in crisis.config.ts explaining the exclusion (documented human rights concerns)

---

## CRITICAL FIX #3 — Translation Key Bug

`footer.notEmergency` is rendering as a literal string instead of translated text on the 
homepage. Check the "footer" object in src/i18n/locales/es.json and en.json — confirm 
"notEmergency" key exists with the {{hotline}} placeholder. If the key exists but still 
renders literally, check the i18n provider/hook configuration — likely a namespace or 
key-path mismatch between the translation call and the JSON structure.

Test in both ES and EN before considering this fixed.

---

## TASK A — Information Page: Auto-Updating Live Feed

The /informacion page currently shows static or empty content. Rebuild it as a 
genuinely live, auto-refreshing information hub. Purpose: this is the single source 
of truth page where anyone — rescue teams, volunteers, families — checks for the 
latest verified facts without needing to search elsewhere.

### A1. Create a real data aggregation API route

`src/app/api/live-info/route.ts`:

```typescript
import { NextResponse } from 'next/server'
import { CRISIS_CONFIG } from '@/config/crisis.config'

export const revalidate = 300 // 5 minutes

export async function GET() {
  const [usgsRes, reliefwebRes] = await Promise.allSettled([
    fetch(
      `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
      `&minlatitude=${CRISIS_CONFIG.mapBounds.minLat}&maxlatitude=${CRISIS_CONFIG.mapBounds.maxLat}` +
      `&minlongitude=${CRISIS_CONFIG.mapBounds.minLng}&maxlongitude=${CRISIS_CONFIG.mapBounds.maxLng}` +
      `&orderby=time&limit=10&minmagnitude=4.0&starttime=${CRISIS_CONFIG.crisisDate}`
    ),
    fetch(
      `https://api.reliefweb.int/v1/reports?appname=vigil-crisis&filter[field]=country.iso3` +
      `&filter[value]=VEN&limit=8&sort[]=date:desc` +
      `&fields[include][]=title&fields[include][]=date&fields[include][]=url&fields[include][]=source`
    )
  ])

  const usgs = usgsRes.status === 'fulfilled' ? await usgsRes.value.json() : null
  const reliefweb = reliefwebRes.status === 'fulfilled' ? await reliefwebRes.value.json() : null

  return NextResponse.json({
    lastUpdated: new Date().toISOString(),
    recentSignificantQuakes: usgs?.features?.map((f: any) => ({
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: f.properties.time,
      url: f.properties.url,
    })) ?? [],
    officialReports: reliefweb?.data?.map((r: any) => ({
      title: r.fields.title,
      date: r.fields.date.created,
      url: r.fields.url,
      source: r.fields.source?.[0]?.name ?? 'ReliefWeb',
    })) ?? [],
  })
}
```

### A2. Rebuild /informacion page to be a live client component

The page fetches `/api/live-info` on mount and re-fetches every 5 minutes via 
`setInterval`. Show a visible "Última actualización: hace X minutos" timestamp 
that updates every 30 seconds (client-side clock, no refetch needed for the clock itself).

Page sections, in this order:

1. **Live status bar** — auto-refreshing: last earthquake update time, total aftershocks 
   tracked, link to full USGS feed
2. **Crisis stats** — these are the verified static numbers we have (deaths, injured, 
   missing estimate, displaced, buildings collapsed) — each with a small "fuente: OCHA" 
   tag. Mark this section "Actualizado manualmente — última verificación: [date]" since 
   these numbers require human verification, not an API
3. **Official Updates feed** — live from ReliefWeb API, auto-refreshing, shows 8 most 
   recent reports with title, date, source, and external link
4. **Infrastructure status** — static admin-editable block (electricity %, water %, 
   roads %, airport status) — pull this from a new Supabase table `infrastructure_status` 
   so Orlando can update it from Supabase Studio without a code deploy
5. **Verified emergency contacts** — [former rescue-coordination label], Cruz Roja phone, OCHA Twitter — static
6. **Trusted sources to follow** — external links list — static

### A3. Create the infrastructure_status table

```sql
CREATE TABLE infrastructure_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('electricity','water','roads','airport','telecom','fuel')),
  status_percent INT CHECK (status_percent BETWEEN 0 AND 100),
  status_label TEXT,
  notes TEXT,
  updated_by TEXT DEFAULT 'admin',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE infrastructure_status;
ALTER TABLE infrastructure_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_infra" ON infrastructure_status FOR SELECT USING (true);

INSERT INTO infrastructure_status (region, metric, status_percent, status_label) VALUES
('La Guaira', 'electricity', 75, 'Restaurado parcialmente'),
('La Guaira', 'water', 68, 'Restaurado parcialmente'),
('La Guaira', 'roads', 90, 'Mayormente operativo'),
('Maiquetía', 'airport', 50, '1 pista operativa de 2');
```

The /informacion page reads this table with a Supabase Realtime subscription — when 
Orlando updates a row in Supabase Studio, every open browser updates instantly with no refresh.

---

## TASK B — Real-Time Everywhere (Full Audit)

Audit every page that displays dynamic data. For each one, confirm it uses a Supabase 
Realtime subscription, not a one-time fetch. Required real-time pages:

- `/` (homepage) — missing persons feed, map markers — MUST be realtime
- `/buscar` — search results should reflect live status changes
- `/necesito-ayuda` — map markers — MUST be realtime
- `/intercambio` — resource exchange listings — MUST be realtime
- `/voluntarios` — volunteer directory — realtime not critical but nice
- `/informacion` — infrastructure_status table — MUST be realtime (Task A above)
- `/noticias` — ReliefWeb feed — polling every 5 min is fine, this is external data

Standard pattern to apply everywhere:

```typescript
useEffect(() => {
  const channel = supabase
    .channel('table-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'missing_persons' },
      (payload) => {
        // Update local state based on payload.eventType: INSERT/UPDATE/DELETE
      }
    )
    .subscribe()
  
  return () => { supabase.removeChannel(channel) }
}, [])
```

Confirm Realtime is enabled in Supabase for: `missing_persons`, `map_markers`, 
`resource_exchange`, `infrastructure_status`, `rescuer_presence` (new table, Task C).

---

## TASK C — Rescuer Safety Presence System (NEW FEATURE)

Purpose: international rescue teams and volunteers can drop a live location pin so 
their position is tracked for safety, and others know where active teams are operating. 
This is different from map_markers (which shows needs/resources) — this is specifically 
about PEOPLE checking in for their own safety tracking.

### C1. Create the table

```sql
CREATE TABLE rescuer_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,         -- "Equipo Los Topos" or "Juan R. - Voluntario"
  team_or_org TEXT,                   -- Optional org affiliation
  presence_type TEXT NOT NULL CHECK (presence_type IN ('rescue_team','volunteer','medical','individual')),
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','checked_in','needs_assistance','signed_off')),
  last_checkin TIMESTAMPTZ DEFAULT NOW(),
  contact_phone TEXT,                 -- PRIVATE — never public
  notes TEXT,                         -- "Operando zona La Páez, edificio colapsado"
  auto_expire_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '4 hours'),  -- Stale pins auto-hide
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE rescuer_presence;
ALTER TABLE rescuer_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_presence" ON rescuer_presence
  FOR SELECT USING (auto_expire_at > NOW() AND status != 'signed_off');
CREATE POLICY "public_insert_presence" ON rescuer_presence
  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_own_presence" ON rescuer_presence
  FOR UPDATE USING (true);  -- Anyone can update (check-in flow uses a returned ID, not auth)

CREATE INDEX idx_presence_active ON rescuer_presence(status, auto_expire_at);
```

### C2. Build the feature

Add a new map layer toggle: "Equipos Activos" (Active Teams) — shows pins from 
`rescuer_presence` where status is active/checked_in, color-coded by `presence_type`:
- rescue_team: orange pin with users icon
- medical: pink pin with cross icon  
- volunteer: blue pin with heart icon
- individual: gray pin with person icon

A "needs_assistance" status pin pulses red and is visually distinct — this is a 
safety SOS specifically for people who registered their presence and now need help themselves.

Create `src/app/equipo-activo/page.tsx` (or integrate into the map page as a layer):
- Form: "Registrar mi presencia" — name, team/org (optional), type, get GPS location 
  (browser geolocation API with permission prompt), notes, optional phone (private)
- After registering, show a persistent "Check-in" button the person can tap every 
  hour to refresh `last_checkin` and extend `auto_expire_at` by 4 more hours
- A red "Necesito asistencia" button that immediately sets status to `needs_assistance` 
  — this should be impossible to miss, large, top of the page when checked in
- Pins not checked in for 4+ hours auto-hide via the `auto_expire_at` check (no manual cleanup needed)

This must be dead simple to use on a phone with shaky hands in the field. Large touch 
targets, minimal typing, GPS auto-fill.

---

## TASK D — Support & Feedback Channel (NEW FEATURE)

Purpose: anyone using Vigil can report a bug, request a feature, flag missing 
information, or ask for help with the platform itself.

### D1. Create the table

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('bug','feature_request','missing_info','question','other')),
  message TEXT NOT NULL,
  contact_email TEXT,                 -- Optional, for follow-up
  page_context TEXT,                  -- Which page they were on
  status TEXT DEFAULT 'new' CHECK (status IN ('new','reviewing','resolved','wont_fix')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_feedback" ON feedback FOR INSERT WITH CHECK (true);
-- No public read policy — feedback is admin-only visibility
```

### D2. Build a floating feedback widget

Add a small floating button (bottom-right, above mobile nav bar, always visible) 
with a chat-bubble icon. Tapping opens a simple modal:

- Category selector (pills): 🐛 Error · 💡 Sugerencia · 📋 Falta información · ❓ Pregunta
- Message textarea
- Optional email field: "¿Quieres que te respondamos? (opcional)"
- Submit button: "Enviar"
- Success state: "Gracias. Tu mensaje ayuda a mejorar Vigil para todos."

Auto-capture `page_context` from the current route, no user input needed for that field.

Style per DESIGN-SYSTEM.md — small, unobtrusive, doesn't compete visually with the 
emergency banner or primary actions.

### D3. Simple admin view

Create `src/app/admin/feedback/page.tsx` — protected by checking against 
`VIGIL_ADMIN_SECRET` in a simple password-gate (not full auth, just enough friction 
to keep it private). List all feedback sorted by newest, with status dropdown to mark 
reviewing/resolved.

---

## TASK E — WhatsApp/Telegram Status Check

These are NOT blockers for going live today. Confirm this in your response to Orlando:
Vigil functions completely through the web app without them. WhatsApp and Telegram 
are additional intake channels for people without easy web access — valuable, but 
the web platform is the core product and is launch-ready independent of them.

No code changes needed for this task — just confirm in your final summary that the 
web app does not depend on these integrations to function.

---

## TASK F — Final Pre-Launch Checklist

Before declaring ready, verify each of these by actually testing them:

1. [ ] Submit a test missing person report — confirm it appears in real-time on another 
       browser tab without refresh
2. [ ] Submit a map marker — confirm same real-time behavior
3. [ ] Submit a resource exchange listing — confirm real-time
4. [ ] Register rescuer presence — confirm pin appears on map
5. [ ] Submit feedback — confirm it lands in the feedback table
6. [ ] Check /informacion — confirm ReliefWeb feed loads real articles
7. [ ] Check footer translation bug is fixed in ES and EN
8. [ ] Confirm zero "VenApp" references anywhere (grep search)
9. [ ] Confirm domain references are consistent throughout (Critical Fix #1)
10. [ ] Run `npm run build` — zero errors
11. [ ] Test on a throttled "Slow 3G" network in Chrome DevTools — confirm it's usable
12. [ ] Test the language switcher across all 8 languages — no broken keys visible

Commit everything:

```bash
git add -A
git commit -m "feat: live information hub, rescuer safety presence, feedback channel, critical fixes

- Fixed domain mismatch in config and metadata
- Removed VenApp per documented human rights concerns
- Fixed footer.notEmergency translation key bug
- Built auto-updating /informacion page with live USGS + ReliefWeb feeds
- Added infrastructure_status table for admin-editable real-time infra updates
- Added rescuer_presence system: safety check-ins, SOS button, active teams map layer
- Added feedback/support widget with admin review queue
- Audited and confirmed Realtime subscriptions across all dynamic pages
- Completed full pre-launch testing checklist"
git push
```

---

## IF CURSOR GETS STUCK — Hand to Claude Code CLI

If Cursor's agent stalls, times out, or you hit usage limits, open WSL and run:

```bash
cd /mnt/c/Dev/Vigil
claude --dangerously-skip-permissions \
  "Read VIGIL-GOLIVE-MASTER-PROMPT.md completely. Execute every task in order: 
   Critical Fixes 1-3 first, then Tasks A through F. Test everything in the 
   final checklist before reporting completion. Commit and push when done."
```

Claude Code CLI and Cursor's agent are both Claude underneath — either one can 
execute this file. Use whichever isn't currently rate-limited or stuck.
