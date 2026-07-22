# VIGIL — Build Prompt Package: Preparación Hub, Archetype Foundation, Florida Template, Geo-Routing, Security Hardening
### Orlando Toro x Claude — July 2026
### Target: docs/build-process/ — five sequential prompt files

---

## HOW TO USE THIS PACKAGE

1. **Confirm the sequence number first.** Open `docs/build-process/`, screenshot the directory, and replace every `NN` below with the next available number. (We had a duplicate at position 29 once — don't repeat it.)
2. Split this package into **five separate files**, one per prompt, named:
   - `NN-archetype-config-foundation.md`
   - `NN+1-preparacion-knowledge-hub.md`
   - `NN+2-florida-hurricane-template.md`
   - `NN+3-geo-deployment-suggestion.md`
   - `NN+4-security-hardening.md`
3. Execute **in order**. Prompt NN is foundational — NN+1 and NN+2 depend on it.
4. Handoff command per prompt (Claude Code inside Cursor):
   ```bash
   claude --dangerously-skip-permissions "Read docs/build-process/NN-archetype-config-foundation.md completely. Execute autonomously. Do not deviate from the spec. Report every file created or modified when done."
   ```
5. Complete the **MANUAL TASKS** section (bottom) yourself — those are dashboard/account actions no agent can do.

**Global constraints (apply to every prompt, non-negotiable):**
- Live codebase and `DESIGN-SYSTEM.md` are authoritative. If this spec conflicts with the live code, stop and flag — don't guess.
- Light mode only. Single accent `#2563EB`. Geist + Inter + Geist Mono. WCAG AA. Status Pulse is the ONLY animation — these features add zero new animations.
- Mobile breakpoint is `lg:` (1024px), never `md:`.
- Contact info never public. No new tables expose PII.
- Claude/AI never invents safety guidance. All preparedness content is adapted from cited official sources.
- Spanish (ES) is the primary locale; EN handcrafted second; other 6 locales via `scripts/generate-translations.mjs` with human review of safety-critical strings before ship.
- No forking, no redesign, no architecture changes outside this spec.

---
---

# PROMPT NN — Archetype Configuration Foundation

## Objective
Extend `src/config/crisis.config.ts` with the disaster-archetype schema from `VIGIL-EXPANSION-ROADMAP.md`, without changing any live Venezuela behavior. This is the foundation the Knowledge Hub (NN+1) and Florida template (NN+2) build on.

## Why this exists
Vigil currently redeploys by swapping config values. The archetype schema turns that into: pick archetype(s) → feeds, map layers, knowledge guides, and notification triggers come with it. One repo, many deployments, never a fork.

## Exact changes

### 1. Types — `src/types/vigil.types.ts` (or wherever config types live; verify in codebase)
```typescript
export type DisasterArchetype =
  | 'earthquake' | 'hurricane' | 'tornado' | 'flood'
  | 'wildfire' | 'volcanic' | 'tsunami' | 'winter_storm';

export interface FeedConfig {
  id: string;                      // 'usgs', 'nws-alerts', 'nhc-storms', 'funvisis'
  label: string;                   // display name, i18n key
  url: string;                     // base endpoint
  tier: 'primary' | 'secondary' | 'partnership_gated';
  cacheSeconds: number;
  enabled: boolean;
}

export interface NotificationConfig {
  zoneSubscription: boolean;
  severityTiers: string[];         // MIRROR the official agency's tiers. Never invent tiers.
  channels: ('push' | 'email' | 'sms' | 'whatsapp')[];
}

export interface CrisisConfig {
  // ...existing fields unchanged...
  disasterArchetypes: DisasterArchetype[];   // array — Florida = ['hurricane','flood']
  dataFeeds: FeedConfig[];
  notificationConfig: NotificationConfig;
  uniqueFeatures: string[];                  // archetype modules toggled on, e.g. 'preparedness_hub'
}
```

### 2. Venezuela config values (current deployment — behavior must not change)
```typescript
disasterArchetypes: ['earthquake'],
dataFeeds: [
  { id: 'usgs',      label: 'feeds.usgs',      url: 'https://earthquake.usgs.gov/fdsnws/event/1/query', tier: 'primary',   cacheSeconds: 300,  enabled: true },
  { id: 'funvisis',  label: 'feeds.funvisis',  url: 'https://sismosve.rafnixg.dev',                     tier: 'secondary', cacheSeconds: 300,  enabled: true },
  { id: 'gdacs',     label: 'feeds.gdacs',     url: 'https://www.gdacs.org/gdacsapi/api/events',        tier: 'primary',   cacheSeconds: 600,  enabled: true },
  { id: 'reliefweb', label: 'feeds.reliefweb', url: 'https://api.reliefweb.int/v1/reports',             tier: 'secondary', cacheSeconds: 3600, enabled: true },
],
notificationConfig: { zoneSubscription: false, severityTiers: [], channels: [] }, // Alerta not built yet — honest empty state
uniqueFeatures: ['preparedness_hub'],
```
Match existing integration URLs exactly as they appear in the live code — the URLs above are reference; the code is the source of truth.

### 3. Refactor existing feed consumers
Wherever USGS/GDACS/ReliefWeb URLs are currently hardcoded in `src/lib/`, refactor to read from `crisisConfig.dataFeeds` by `id`. Behavior-identical refactor: same URLs, same cache values, same output. No visual or functional change.

## Non-goals
- No new feeds wired in this prompt. No Vigil Alerta implementation. No UI changes at all.

## Acceptance criteria
- [ ] `npm run build` clean, zero type errors
- [ ] Venezuela deployment behavior byte-identical (map layers, informacion page, seismic feed all unchanged)
- [ ] All external feed URLs resolved through config, none hardcoded in lib files
- [ ] New config fields fully typed, no `any`

---
---

# PROMPT NN+1 — Preparación Knowledge Hub

## Objective
Ship `/preparacion` — a per-archetype disaster preparedness hub structured **Antes / Durante / Después**, fully offline-capable, config-driven, with a printable family emergency plan and supply checklist. This is Vigil's first feature that serves people BEFORE a crisis.

## Strategic context (for the agent's understanding, not for scope expansion)
Every current Vigil feature activates mid-crisis. This hub gives people a reason to install the PWA on a calm day — which means Vigil is already on their phone when disaster hits. It is also the platform's SEO surface. Treat content quality and offline reliability as the two success conditions.

## Architecture

### Content model — JSON, per archetype, per locale
```
src/content/preparedness/
  earthquake/ es.json  en.json  (pt/fr/it/zh/de/ru generated later)
  hurricane/  es.json  en.json
  flood/      es.json  en.json
  _schema.ts            (zod schema validating every content file at build time)
```

Schema per guide file:
```typescript
{
  archetype: DisasterArchetype,
  title: string,
  summary: string,                       // 2-3 sentences, plain language
  sources: { label: string, url: string }[],   // REQUIRED, min 2 — Ready.gov, FEMA, NWS, Cruz Roja, PAHO
  lastReviewed: string,                  // ISO date, human review date
  sections: {
    antes:   PrepBlock[],
    durante: PrepBlock[],               // durante supports sub-contexts: 'interior' | 'exterior' | 'vehiculo'
    despues: PrepBlock[],
  },
  supplyChecklist: { item: string, qty?: string, note?: string }[],
  familyPlanPrompts: { id: string, label: string, placeholder: string }[],
}

type PrepBlock = {
  heading: string,
  body: string,                          // plain text/markdown-lite, no HTML injection
  context?: 'interior' | 'exterior' | 'vehiculo',
  critical?: boolean,                    // renders with status-missing red left border — the "do this or die" items
}
```

### Content authoring rules (CRITICAL)
- Adapt content ONLY from: Ready.gov, FEMA (fema.gov), NWS/NOAA (weather.gov, nhc.noaa.gov), American Red Cross (redcross.org), PAHO (paho.org), Cruz Roja. Cite every guide's sources in the `sources` array AND render them visibly at the bottom of each guide page ("Fuentes oficiales").
- Do NOT generate novel safety advice. If official sources conflict, use FEMA/NWS as tiebreaker.
- Venezuela earthquake guide must include: Triángulo de vida MYTH DEBUNK (Drop/Cover/Hold On is the official guidance — this misinformation is widespread in Latin America and correcting it is a life-safety matter), aftershock behavior, and [former rescue-coordination label] routing.
- Write ES first, natural Venezuelan-neutral Spanish. Then EN. Mark every string that contains an emergency number, dosage-like instruction, or imperative safety action with `"critical": true` — these are the human-review gate before any generated locale ships.
- v1 archetypes: **earthquake, hurricane, flood.** Tornado, wildfire, tsunami, volcanic are P1 (structure supports them; content comes later).

### Routes & UI
- `/preparacion` — index page. Guides ordered by `crisisConfig.disasterArchetypes` first (Venezuela → earthquake on top), remaining archetypes after, under "Otras emergencias".
- `/preparacion/[archetype]` — guide page. Three-tab or three-section layout: Antes / Durante / Después. `durante` renders context chips (Interior / Exterior / Vehículo) that filter blocks — no animation, instant toggle.
- **Family plan builder**: client-side form from `familyPlanPrompts` (meeting point, out-of-area contact, medical notes, pet plan). "Imprimir plan" button → print-optimized view. Data stays in `localStorage` on the user's device ONLY — never sent to Supabase, state this on the page ("Este plan se guarda solo en tu dispositivo").
- **Supply checklist**: checkable list, `localStorage` persistence, print button.
- Print CSS: `@media print` styles — black on white, no nav, no map, sources footer with URL text visible, page-break-inside avoid on blocks.
- Nav: add "Preparación" to sidebar and to mobile bottom bar ONLY if a slot exists without exceeding 5 tabs; if the bar is full, place it inside the existing "más/menu" pattern the app uses. Do not redesign the bottom bar.
- Design system compliance: standard type scale, single blue for interactive, `critical` blocks use `--status-missing` red left border (2px) — a border, not an animation.

### Offline (this is the feature)
In `next-pwa` runtime caching config, add:
```javascript
{
  urlPattern: /\/preparacion/,
  handler: 'CacheFirst',
  options: { cacheName: 'preparedness-pages', expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 30 } }
}
```
Content JSON ships in the bundle (static import), so guide content is available offline by default once the page has been visited — verify with DevTools offline mode. Add a subtle offline indicator line on guide pages when `navigator.onLine === false`: "Estás sin conexión — esta guía funciona sin internet." (text only, no animation).

### AI assistant integration
Add a compact preparedness index (archetype → title → route) to the assistant's loaded context so it can ROUTE users to guides ("¿Cómo me preparo para un huracán?" → link to /preparacion/hurricane + 2-sentence summary from the guide's own `summary` field). The assistant must not paraphrase safety steps beyond what's in the content files. Extend the system prompt: "For preparedness questions, answer only from the preparedness content provided and link to the guide."

### SEO
- Per-guide metadata: title, description, OpenGraph. `hreflang` alternates for available locales.
- Add `/preparacion` routes to the sitemap.
- JSON-LD `FAQPage` markup is P1 — skip in v1.

## Non-goals
- No push notifications (that's Vigil Alerta, separate prompt, not yet scheduled).
- No user accounts, no server-side storage of family plans.
- No video/embedded media in v1.
- No new animations of any kind.

## Acceptance criteria
- [ ] `/preparacion` and three guide pages live in ES + EN, sources rendered on every guide
- [ ] Zod validation fails the build on malformed content files
- [ ] Guides load with network disabled after first visit (test in DevTools)
- [ ] Family plan + checklist persist across reloads, never leave the device, print cleanly on Letter and A4
- [ ] Assistant routes preparedness questions to guides without inventing steps
- [ ] Lighthouse accessibility ≥ 95 on guide pages; all touch targets ≥ 44px
- [ ] Zero new animations; zero dark-mode classes; `lg:` breakpoint respected

---
---

# PROMPT NN+2 — Florida Hurricane Template (pre-built, NOT deployed)

## Objective
Pre-build the hurricane archetype: feed adapters for NWS + NHC, a Florida `crisis.config.ts` values file, and the hurricane map layers — merged to main, feature-complete, but **not launched**. Per the Deployment Playbook, no deployment goes live without a local admin (Florida VOAD conversation pending). This prompt makes activation a same-day task instead of an overnight build.

## Feed adapters — exact API details

### 1. NWS Alerts — `src/lib/feeds/nws.ts`
- Endpoint: `https://api.weather.gov/alerts/active?area=FL` (state) and `https://api.weather.gov/alerts/active?point={lat},{lng}` (point lookup)
- **Required**: `User-Agent` header identifying the app + contact — `"Vigil (vigil.youthewave.org, vigil@youthewave.org)"`. NWS blocks anonymous clients.
- Format: GeoJSON. Relevant fields: `properties.event`, `severity`, `urgency`, `certainty`, `headline`, `instruction`, `effective`, `expires`, `geometry` (polygon).
- Cache: 60 seconds minimum (their stated policy), use 120s via Vercel revalidate tag.
- Severity tiers come from NWS itself (`Extreme/Severe/Moderate/Minor`) — mirror, never invent (roadmap rule).

### 2. NHC Active Storms — `src/lib/feeds/nhc.ts`
- Summary endpoint: `https://www.nhc.noaa.gov/CurrentStorms.json` — all active Atlantic/EPAC systems: id, name, classification, intensity, movement, lat/lng, advisory links.
- Per-storm GIS (forecast cone): `https://www.nhc.noaa.gov/gis/` products keyed by storm ID — for v1 parse `CurrentStorms.json` for position/track points and link out to the official NHC cone graphic per storm. Rendering the cone polygon natively is P1 (requires shapefile/KML parsing — do not add a heavy dependency for v1).
- Cache: 600s.
- One integration covers the entire Atlantic + Eastern Pacific basins — this same adapter serves future Caribbean, Mexico, and Central America deployments unchanged.

### 3. USGS Water Services (flood pairing) — `src/lib/feeds/usgs-water.ts`
- Endpoint: `https://waterservices.usgs.gov/nwis/iv/?format=json&stateCd=fl&parameterCd=00065&siteStatus=active` (00065 = gauge height, feet). For deployment configs, prefer explicit `sites=` lists of the ~15 most flood-relevant gauges for the region rather than statewide dumps.
- Cache: 900s.

All three adapters: typed responses, graceful degradation (feed down → layer shows "fuente no disponible" state, never crashes the map), registered in the `dataFeeds` registry by id, consumed only through config.

## Florida config values — `src/config/deployments/florida.config.ts`
Not wired to the live app. A values file, complete and ready:
```typescript
disasterArchetypes: ['hurricane', 'flood'],
bounds: { minLat: 24.3, maxLat: 31.0, minLng: -87.7, maxLng: -79.8, centerLat: 27.8, centerLng: -81.7, defaultZoom: 7 },
emergencyHotline: '911',
languages: ['en', 'es', 'ht'],        // Haitian Creole flagged as REQUIRED for FL — generate + human-review before any launch; do not ship machine-only
dataFeeds: [ nws-alerts, nhc-storms, usgs-water, gdacs ],
uniqueFeatures: ['preparedness_hub', 'evacuation_lookup_link', 'shelter_board'],
notificationConfig: { zoneSubscription: false, severityTiers: ['Extreme','Severe','Moderate','Minor'], channels: [] },
```
**Government-data policy (Playbook Section 5):** Florida gets its OWN privacy stance — county EM offices are legitimate resources here; the Venezuela exclusion clause does not copy over. Add `TODO-BEFORE-LAUNCH.md` in the deployments folder listing: privacy policy rewrite, FDACS check, local admin named, Haitian Creole review, new Supabase project + migrations.

## Map layers (behind archetype flag — only render when `disasterArchetypes` includes hurricane/flood)
- **Alertas NWS**: warning polygons colored by NWS severity, popup shows headline + instruction + expires.
- **Tormentas activas**: NHC storm positions with classification icon, popup links to official NHC advisory. Attribution: "Fuente: National Hurricane Center".
- **Nivel de agua**: USGS gauges, colored by flood-stage status where the API provides it.
- Evacuation zones: LINK OUT to the official Know Your Zone lookup (floridadisaster.org) — do not rebuild or mirror county zone data in v1 (accuracy liability; official source is authoritative — same rule as the tornado "do not attempt" clause in the roadmap).

## Non-goals
- No deployment, no new Supabase project, no DNS. No shelter-capacity data (partnership-gated: FEMA NSS/Red Cross). No push notifications. No native cone-polygon rendering (P1).

## Acceptance criteria
- [ ] All three adapters return typed, cached data; unit-tested against recorded fixtures (a hurricane may not be active when this builds — fixtures mandatory)
- [ ] Venezuela deployment completely unaffected (archetype flag verified: no hurricane layers render in production)
- [ ] Florida config type-checks against the extended `CrisisConfig`
- [ ] Feed failure degrades gracefully per layer, map never crashes
- [ ] `TODO-BEFORE-LAUNCH.md` written and complete

---
---

# PROMPT NN+3 — Geo-Aware Deployment Suggestion

## Objective
Lightweight, privacy-consistent location awareness: suggest the right Vigil deployment based on coarse country/region, with a manual picker always available. No GPS permission, no tracking, no cookies.

## Key technical fact — read carefully
`vigil.youthewave.org` is **DNS-only on Cloudflare (gray cloud)** — Cloudflare's `CF-IPCountry` header does NOT exist on this domain. Use **Vercel's geo headers** instead: in Next.js middleware/edge, read `request.headers.get('x-vercel-ip-country')` and `x-vercel-ip-country-region`. Available on all Vercel plans, zero cost, coarse by design.

## Implementation
1. **Deployment registry** — `src/config/deployments/registry.ts`:
```typescript
export const DEPLOYMENTS = [
  { id: 'venezuela', countryCodes: ['VE'], regionCodes: [], url: 'https://vigil.youthewave.org', label: 'Vigil Venezuela', status: 'live' },
  { id: 'florida',   countryCodes: ['US'], regionCodes: ['FL'], url: null, label: 'Vigil Florida', status: 'prebuilt' },
] as const;
```
2. **Middleware** (`middleware.ts`, edge): read geo headers, match against registry, set a single header/prop consumed by the layout. Match logic: region match > country match > none.
3. **Suggestion banner**: if the visitor's matched deployment ≠ current deployment AND matched status is `live`, render a dismissible one-line banner (top of page, design-system styles, no animation): "¿Estás en {region}? Vigil {label} está disponible → [Ir]". Dismissal persisted in `localStorage`, key per deployment id, never re-shown after dismiss. If matched deployment is `prebuilt` (no live URL), render nothing — no vaporware banners.
4. **Manual picker**: footer link "Otras regiones" → simple list of live deployments. Registry-driven.
5. **Privacy page note**: one sentence added to /privacidad — coarse, header-based, never stored, no consent banner needed because nothing is persisted server-side.

## Non-goals
- No redirects (suggestion only — never move a user automatically). No GPS. No IP logging. No analytics events.

## Acceptance criteria
- [ ] Banner shows for a simulated VE visitor on a hypothetical second deployment and vice versa (test by header injection in dev)
- [ ] Dismiss persists; banner never reappears for that deployment
- [ ] Zero impact when only one live deployment exists except the footer link
- [ ] No cookies set, nothing written server-side

---
---

# PROMPT NN+4 — Security Hardening

## Objective
Close the identified gaps: security headers, CSP (report-only first), automated encrypted database backups. Vigil holds missing-persons contact data — losing or leaking that database is the worst possible failure. Treat this prompt with production seriousness.

## Part 1 — Security headers (`next.config.mjs`)
Add via `headers()`:
```javascript
{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
{ key: 'X-Content-Type-Options', value: 'nosniff' },
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
{ key: 'X-Frame-Options', value: 'DENY' },
{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },  // geolocation=self — Equipo Activo check-in needs it
```

## Part 2 — CSP in Report-Only mode
Ship `Content-Security-Policy-Report-Only` first (a strict CSP deployed blind WILL break Leaflet tiles, Supabase realtime websockets, or next/font — report-only for 7 days, then enforce):
```
default-src 'self';
script-src 'self' 'unsafe-inline';            // audit for nonce-based upgrade later; Next inline runtime needs this initially
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.supabase.co;
connect-src 'self' https://*.supabase.co wss://*.supabase.co https://earthquake.usgs.gov https://api.weather.gov https://www.nhc.noaa.gov https://waterservices.usgs.gov https://www.gdacs.org https://api.reliefweb.int https://api.open-meteo.com https://sismosve.rafnixg.dev;
font-src 'self';
frame-ancestors 'none';
worker-src 'self';
```
Verify every third-party origin against the live code's actual fetch targets before writing the policy — the list above is the starting inventory, the code is the source of truth. Add a `report-to`/`report-uri` pointing at a simple `/api/csp-report` endpoint that logs to console (Vercel logs) — no new storage.

## Part 3 — Nightly encrypted backups (GitHub Actions)
File: `.github/workflows/db-backup.yml`
- Schedule: `cron: '15 7 * * *'` (07:15 UTC nightly).
- Steps: install `postgresql-client` + `age` → `pg_dump "$SUPABASE_DB_URL" --format=custom --file=vigil-$(date +%F).dump` → `age -r "$BACKUP_AGE_PUBLIC_KEY" -o vigil-$(date +%F).dump.age vigil-$(date +%F).dump` → shred the plaintext dump → push the `.age` file to the **private** repo `Atenaxproject/vigil-backups` (checkout with `BACKUP_REPO_TOKEN`, commit, push).
- Retention step: delete `.age` files older than 30 days from the backup repo in the same job.
- **The workflow file contains zero secrets.** Secrets consumed: `SUPABASE_DB_URL` (Supabase session-pooler connection string), `BACKUP_AGE_PUBLIC_KEY`, `BACKUP_REPO_TOKEN` — all set in the MANUAL TASKS below. The age PRIVATE key never touches GitHub — it lives only in Orlando's password manager. A backup nobody can decrypt is not a backup: test one full restore cycle to a scratch Supabase project after the first run and document the restore command in `vigil-backups/RESTORE.md`.
- Add a failure notification: the workflow's `if: failure()` step opens a GitHub issue in the main repo titled "Backup failed {date}".

## Part 4 — Repo config note
Dependabot and CodeQL are dashboard toggles, not code — listed in MANUAL TASKS. The agent's only task here: add `.github/dependabot.yml` (npm ecosystem, weekly, grouped minor/patch) so the toggle has config waiting.

## Non-goals
- No WAF rules, no rate-limit changes (existing rate limiting stays as-is), no auth changes, no Cloudflare proxy changes (Vercel domains stay gray-cloud — standing rule).

## Acceptance criteria
- [ ] securityheaders.com scan of vigil.youthewave.org: A grade (CSP report-only accepted)
- [ ] Site fully functional with headers live: map tiles, realtime, photo upload, AI assistant, fonts — all verified
- [ ] Backup workflow runs green; encrypted dump lands in private repo; plaintext never committed anywhere
- [ ] One restore tested and documented in RESTORE.md
- [ ] `dependabot.yml` present

---
---

# MANUAL TASKS — Orlando only (dashboards, ~45 minutes total)

**GitHub (github.com/Atenaxproject):**
1. Create **private** repo `vigil-backups` (empty, README only).
2. Generate a fine-grained PAT scoped to `vigil-backups` (contents: read/write) → save as `BACKUP_REPO_TOKEN` secret in the `vigil` repo.
3. Generate an age keypair locally (`age-keygen`): public key → `BACKUP_AGE_PUBLIC_KEY` repo secret; **private key → password manager only.**
4. Supabase dashboard → Database → Connection string (Session pooler) → save as `SUPABASE_DB_URL` repo secret.
5. `vigil` repo → Settings → Code security: enable **Dependabot alerts + security updates** and **CodeQL default setup**. (Free on public repos, two toggles.)

**Accounts:**
6. Verify **2FA enabled** on: GitHub, Supabase, Vercel, Cloudflare, Anthropic Console. Your personal accounts are the single point of compromise for families' private data — this outranks every code task in this package.

**After NN+4 ships:**
7. After 7 clean days of CSP report-only (check Vercel logs for /api/csp-report noise), tell Cursor to flip the header from `Content-Security-Policy-Report-Only` to `Content-Security-Policy`.

**Content review gate (after NN+1):**
8. Human-review every `critical: true` string in the ES and EN preparedness content before deploy. When generated locales come later, same gate per locale.

**Deferred keys (only when wildfire archetype gets built — not now):**
- NASA FIRMS MAP_KEY (free, firms.modaps.eosdis.nasa.gov) and AirNow API key (airnowapi.org). Don't create accounts you won't use yet.

---

*Pair with VIGIL-BIBLE.md, VIGIL-EXPANSION-ROADMAP.md, VIGIL-DEPLOYMENT-PLAYBOOK.md. Live codebase and DESIGN-SYSTEM.md override this document wherever they conflict.*
