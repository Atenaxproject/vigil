# Vigil — Full Page Audit, Refinement & Improvement
## Paste into Cursor Composer (Agent mode)

---

## CONTEXT

Vigil has 16 pages. This session audits every one of them for:
1. Content accuracy and relevance
2. Redundancy / repeated information between pages
3. Empty or thin sections that look broken
4. UX improvements specific to crisis users (low stress, fast actions)
5. DTV integration opportunities (where their data adds real value)
6. Mobile experience on each page

Start by running Playwright screenshots against the live site for 
every page, then audit the code. Report findings per page BEFORE 
fixing anything. Fix only what you find confirmed broken or improvable.

```bash
# Screenshot every page
CHECK_URL=https://vigil.youthewave.org node scripts/visual-check.mjs
```

Modify visual-check.mjs temporarily to capture all routes:
```javascript
const ROUTES = [
  '', 'buscar', 'reportar', 'necesito-ayuda', 'calendario',
  'muro', 'estadisticas', 'punto-de-acopio', 'intercambio',
  'voluntarios', 'organizaciones', 'como-ayudar', 'equipo-activo',
  'informacion', 'donaciones', 'noticias', 'red',
  'privacidad', 'terminos'
]
```

---

## PAGE-BY-PAGE AUDIT CHECKLIST

### / (Homepage)
**What should be here:** Search bar + Reportar button, geographic filters, 
photo search, recent missing persons, USGS alert, crisis map.

**Check:**
- [ ] Does the "Recientes" section show a helpful empty state (not just 
  "Sin resultados") that explains the database is growing and directs 
  to DTV for more records?
- [ ] Is the DTV federated search result showing with amber attribution badge?
- [ ] Is the Reportar button visible next to the search bar?
- [ ] Does the map load without covering the footer?
- [ ] Is there any content duplicated on this page that already exists 
  in detail on /informacion?

**Fix if found:** 
- Replace "Sin resultados. Prueba con otro nombre." with a warmer 
  empty-state: "Aún no hay registros recientes en Vigil. Al buscar 
  por nombre, incluiremos también los 55,891+ registros de 
  Desaparecidos Terremoto Venezuela."

---

### /buscar
**What should be here:** Name search + photo search, geographic filters, 
federated results (Vigil + DTV), sister platform links on no-results.

**Check:**
- [ ] DTV results showing with amber badge and source attribution?
- [ ] Trust note below search bar explaining both data sources?
- [ ] No-results state showing both Reportar button + DTV link?
- [ ] Photo search loading and returning results?
- [ ] Geographic filter chips working (La Guaira, Caracas, etc.)?

---

### /reportar
**What should be here:** Missing persons report form. Simple, fast, 
low-friction. PFIF-compatible fields.

**Check:**
- [ ] Cross-report suggestion banner present (mentioning DTV)?
- [ ] Form fields are complete (name, age, gender, location, photo upload, 
  contact info, consent checkbox)?
- [ ] Geographic dropdowns (estado → municipio → parroquia) cascading correctly?
- [ ] Consent and accuracy checkboxes required before submit?
- [ ] Success state shows claim-token link prominently?
- [ ] Is the form mobile-friendly (no fields cut off, keyboard doesn't 
  cover the submit button)?

**Likely issue:** After submission success, confirm the claim-token URL 
is shown clearly and the user is told to save it.

---

### /necesito-ayuda
**What should be here:** Map marker submission — report a need or resource 
at a location (food, water, medical, shelter, etc.)

**Check:**
- [ ] Map shows for location selection (not just text input for coordinates)?
- [ ] Category options comprehensive (food, water, medical, rescue, 
  shelter, clothing, comms, power, transport)?
- [ ] Urgency/priority option available?
- [ ] Is this page clearly differentiated from /intercambio (which is 
  also about resources)? The distinction: /necesito-ayuda is for mapping 
  a need/resource on the crisis map. /intercambio is for peer-to-peer 
  exchange. If the pages look too similar, add a clear explanatory line 
  at the top of each distinguishing them.

---

### /calendario
**What should be here:** Upcoming events — donation drives, volunteer 
meetups, distributions, memorials. Date-grouped list.

**Check:**
- [ ] Is there any content? (likely empty since events are user-submitted)
- [ ] Empty state helpful? Should say "No hay eventos próximos. 
  ¿Quieres organizar algo? Añade un evento." with a visible Add button.
- [ ] Add event form functional?
- [ ] Times labeled "hora de Venezuela" consistently?

---

### /muro
**What should be here:** Community wall — public append-only messages, 
4 categories, 300 char max.

**Check:**
- [ ] Messages loading (realtime subscription working)?
- [ ] Post form visible and functional?
- [ ] Category filter tabs (Todos / Aviso / Solidaridad / Pregunta) working?
- [ ] Flag button on each message?
- [ ] Rate limiting working (test: post 6 times rapidly)?

---

### /estadisticas
**What should be here:** Real-time statistics — Vigil's own data + 
DTV network metrics (from the deep integration prompt).

**Check:**
- [ ] Vigil stats showing (even if zeros — zeros should explain why)?
- [ ] DTV metrics section showing (may not be built yet — if not, 
  this is the gap from the DTV deep integration prompt)?
- [ ] Geographic breakdown by estado showing?
- [ ] "Datos en tiempo real" badge with last-updated timestamp?
- [ ] Page is not showing static/hardcoded numbers?

**If DTV metrics section is missing:** implement the /api/dtv-metrics 
endpoint and the network stats section from the previous DTV deep 
integration prompt.

---

### /punto-de-acopio
**What should be here:** Register a citizen collection point — name, 
address, hours, categories accepted.

**Check:**
- [ ] DTV centros showing alongside Vigil's own? (if DTV center sync 
  has been run, they should appear here too)
- [ ] Map showing existing points?
- [ ] Registration form working?
- [ ] Newly registered points appear on the map?

---

### /intercambio
**What should be here:** Resource exchange board — offer or request 
goods, shelter, transport, skills, etc. Claim-token based.

**Check:**
- [ ] Both Ofrecer and Solicitar tabs working?
- [ ] Real-time listing updating without refresh?
- [ ] Claim-token shown after posting?
- [ ] Auto-expiry notice (7 days) shown to user at submission?
- [ ] Clear distinction from /necesito-ayuda communicated?

---

### /voluntarios
**What should be here:** Volunteer registration + public directory 
(first name + last initial only).

**Check:**
- [ ] Skills taxonomy complete (medical, rescue, logistics, translation, 
  tech, construction, drone, legal, psych, comms)?
- [ ] Availability options clear?
- [ ] Public directory showing registered volunteers?
- [ ] Privacy: only first name + last initial visible publicly?
- [ ] Language skills field present? (critical for international rescue teams)

---

### /organizaciones
**What should be here:** 16 verified seeded organizations with type, 
description, donation link, fraud warning.

**Check:**
- [ ] All 16 organizations showing?
- [ ] Donation links working (spot check 3)?
- [ ] Fraud warning present on donation section?
- [ ] Organization type filter working (rescue, medical, food, etc.)?
- [ ] Can new organizations submit for approval? If yes, confirm 
  approved_by_admin=false by default (never appears public until admin approves)?

---

### /como-ayudar
**What should be here:** How to help — verified donation channels, 
Red Cross family search lines, country teams on the ground, 
physical collection points, Ria Money Transfer note.

**Check:**
- [ ] Is this page duplicating content from /organizaciones?
  If organizations are listed in both places, consolidate:
  /organizaciones = full directory with all details
  /como-ayudar = curated "best ways to help right now" with quick links
  DO NOT show the full 16-org list in both places.
- [ ] Red Cross international family search lines present 
  (Honduras, Argentina, Colombia)?
- [ ] Ria Money Transfer note still accurate? (was "until July 15, 2026" 
  — if that date has passed, update or remove)
- [ ] Fraud warning on all donation content?

---

### /equipo-activo
**What should be here:** Rescuer presence — GPS check-in, 4-hour 
auto-expiry, SOS button, team type selection.

**Check:**
- [ ] GPS location permission prompt working?
- [ ] Pins appearing on the main crisis map after check-in?
- [ ] SOS button changes status and pin color immediately?
- [ ] Auto-expiry notice shown (4 hours)?
- [ ] Team type options clear (rescue_team, volunteer, medical, individual)?
- [ ] Is this page clearly labeled as "for rescue teams/field workers" 
  so civilians don't accidentally use it and clutter the map?

---

### /informacion
**What should be here:** Deep information hub — USGS seismic data, 
GDACS alerts, ReliefWeb reports, Venezuelan news RSS, infrastructure 
status, emergency contacts, verified sources list.

**Check:**
- [ ] Is USGS data showing? (same as homepage map — is it duplicated?)
  Resolution: homepage shows the map WITH seismic markers.
  /informacion shows the TEXT LIST of recent earthquakes with full details.
  These are different enough to keep both. Confirm the presentations differ.
- [ ] ReliefWeb: showing real articles? How many? Are they recent?
- [ ] GDACS: showing real alerts?
- [ ] Venezuelan news RSS: showing articles from El Nacional / Infobae / 
  Efecto Cocuyo?
- [ ] Infrastructure status: showing the admin-editable fields 
  (electricity %, water %, roads, airport)?
- [ ] Emergency contacts section complete?
- [ ] Is there anything on this page that belongs ONLY here (not homepage)?
  If not, consolidate.

**Likely improvement:** Add a DTV data section here:
"Red de plataformas hermanas · Datos combinados" showing the 
DTV metrics pulled from the API (total persons, located count, 
centers count) as a live widget.

---

### /donaciones
**What should be here:** Donation guidance — verified channels only, 
fraud warning prominent, no direct money handling by Vigil.

**Check:**
- [ ] Is this page thin or fully built?
- [ ] Does it duplicate /como-ayudar?
  Resolution: if these two pages have overlapping content, merge them.
  /como-ayudar = comprehensive "how to help" (volunteers, donations, 
  physical presence, diaspora options)
  /donaciones can redirect to /como-ayudar or be removed from nav if 
  redundant. Evaluate and decide.
- [ ] Fraud warning prominent?
- [ ] No direct donation buttons that look like Vigil is collecting money?

---

### /noticias
**What should be here:** Official updates — ReliefWeb reports, GDACS 
alerts, official Venezuelan government crisis updates (from verified 
sources only).

**Check:**
- [ ] Is this duplicating /informacion?
  Resolution: /informacion = all live data (seismic, weather, news, 
  infrastructure). /noticias = specifically curated verified reports 
  and official announcements. If both are pulling from the same RSS 
  feeds and showing the same content, merge them:
  Keep /informacion as the comprehensive hub.
  /noticias in nav can point to /informacion or be removed.
- [ ] Content is labeled by source?
- [ ] Last updated timestamp visible?

---

### /red
**What should be here:** Sister platform network — all 7 platforms 
listed, DTV featured as active integration partner.

**Check:**
- [ ] DTV shown at top as featured active integration partner?
- [ ] All 7 platforms linking correctly?
- [ ] Each platform has a brief description of its focus?
- [ ] "Integración activa" badge on DTV?

---

### /privacidad
**What should be here:** Full Privacy Policy in Spanish.

**Check:**
- [ ] Page loads with full real content (not placeholder)?
- [ ] Venezuelan government data exclusion explicitly stated?
- [ ] Contact information protection explained?
- [ ] Data retention periods mentioned (90 days active, 1 year archived)?
- [ ] Last updated date present?

---

### /terminos
**What should be here:** Full Terms of Service in Spanish.

**Check:**
- [ ] Page loads with full real content?
- [ ] Non-emergency service disclaimer present?
- [ ] MIT open source license mentioned?
- [ ] Florida governing law stated?

---

## CONSOLIDATION DECISIONS (resolve after audit)

Based on the audit, make these consolidation calls:

1. **/noticias vs /informacion**: If content is >60% overlapping, 
   redirect /noticias to /informacion and remove from nav. 
   Update nav link.

2. **/donaciones vs /como-ayudar**: If /donaciones is thin or 
   duplicates /como-ayudar, redirect /donaciones → /como-ayudar 
   and remove from sidebar nav. Keep in mobile Más menu only.

3. **Ria Money Transfer date**: If the "until July 15, 2026" 
   promotion has ended, update to "contacta a Ria para verificar 
   tarifas actuales para Venezuela" rather than removing the 
   reference entirely (the reduced-fee option may still be active).

4. **USGS on homepage + /informacion**: Confirm these show different 
   presentations (map markers vs text list). If both show the same 
   "10 most recent quakes" text list, remove the text list from 
   homepage and keep it only on /informacion.

---

## AFTER AUDIT — FIXES TO APPLY

For each confirmed issue found, fix immediately. Priority order:
1. Broken/empty pages (no content showing at all)
2. Duplicated content (consolidate, don't just note it)
3. Outdated information (Ria date, any static crisis stats)
4. UX friction points (empty states, missing call-to-actions)
5. DTV integration gaps (metrics, centers)

---

## COMMIT

```bash
git add -A
git commit -m "refine: full page audit — content cleanup, deduplication, 
empty states, DTV metrics, consolidation

[List specific pages changed and what was done]

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.

---

## REPORT TO ORLANDO (required format)

For each of the 19 pages:
- Status: ✅ Good / ⚠️ Needs attention / ❌ Broken/empty
- What was found
- What was fixed (if anything)

Then:
- Pages consolidated/redirected (if any)
- Overall health score: X/19 pages fully functional
