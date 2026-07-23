<div align="center">

<p align="center">
  <img src="docs/assets/vigil-banner.svg" alt="Vigil — We stand watch when it matters most" width="100%" />
</p>

# Vigil

### We stand watch when it matters most.

A unified, open-source humanitarian crisis platform — real-time missing persons, crisis mapping, resource exchange, and volunteer coordination in one accessible interface.

**Live deployment:** Venezuela 2026 Earthquake Response · June 24, 2026 onward

<br />

[![Live Demo](https://img.shields.io/badge/Live-vigil.youthewave.org-2563EB?style=for-the-badge)](https://vigil.youthewave.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F172A?style=for-the-badge)](./LICENSE)

<br />

![Next.js 15](https://img.shields.io/badge/Next.js-15-0F172A?logo=next.js&logoColor=white)
![React 19](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline--ready-2563EB)
![i18n](https://img.shields.io/badge/Languages-8-2563EB)
![WCAG](https://img.shields.io/badge/WCAG-AA-06B6D4)

<br />

[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Map-Leaflet-199900?logo=leaflet&logoColor=white)](https://leafletjs.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

<br />

**[vigil.youthewave.org](https://vigil.youthewave.org)** &nbsp;·&nbsp; **[vigil.youthewave.com](https://vigil.youthewave.com)** (redirects) &nbsp;·&nbsp; **[github.com/Atenaxproject/vigil](https://github.com/Atenaxproject/vigil)**

</div>

---

## Why Vigil

Most crisis tools already exist — they're just scattered. Vigil does **not** reinvent them. It aggregates proven humanitarian platforms (USGS, ReliefWeb, OCHA, HDX, Google Person Finder) into a single calm interface, then adds the missing connective tissue: a live missing-persons board, a community resource exchange, and skills-based volunteer matching.

One config file change redeploys the whole platform for **any country, any disaster**.

### Built for six user groups

| Group | What they do on Vigil |
|---|---|
| 🆘 **Rescue teams** | Crisis map, active rescue zones, field presence check-in, locate needs |
| 🤝 **Volunteers** | Register skills, browse the marketplace, get matched with organizations |
| 🧍 **Victims** | Report needs, drop a help pin, find shelter and resources |
| 🌎 **Diaspora** | Search for missing family on a real-time board with public notes |
| 💛 **Donors** | Reach verified organizations with direct donation links |
| 🏢 **Organizations** | List services, receive volunteers, coordinate response |

---

## What Vigil Does

### Missing persons search — federated with Desaparecidos Terremoto Venezuela

- Search Vigil's own database AND Desaparecidos Terremoto Venezuela simultaneously
- Results from both platforms shown side by side with clear source attribution
- Photo-based search: upload a photo, Claude Vision analyzes features, matched against both databases — no biometric data stored
- Geographic filters: estado, municipio, parroquia across all 24 Venezuelan states
- Zero-result recovery: a careful three-action state (widen the search, create a report, check sister platforms) instead of a dead end — never a rendered "0"
- DTV referral awareness: visitors arriving from Desaparecidos Terremoto Venezuela get a contextual orientation, detected client-side only and never persisted or logged
- PFIF 1.4 compatible — interoperable with Google Person Finder
- Real-time updates across all open browser tabs (Supabase Realtime)

### Crisis map — live data from multiple verified sources

- USGS aftershock data (real-time, 5-min refresh, magnitude 2.0+, **source-labeled USGS/FUNVISIS** when FUNVISIS feed available)
- GDACS disaster alerts (United Nations / European Commission)
- Centers and hospitals from Desaparecidos Terremoto Venezuela (integrated)
- Citizen-reported needs, resources, shelters, danger zones, rescue zones
- Rescuer safety presence system with GPS check-in and SOS button
- Layer toggles for all marker types

### AI coordination — Claude-powered in 8 languages

- Live Q&A assistant: answers questions using real database data, never invents
- Natural language intake: describe a person in plain text, Claude structures it
- Photo-based identification: Claude Vision + DTV facial recognition
- Hourly duplicate detection (Claude Haiku cron)

---

## Screenshots

Production captures from [vigil.youthewave.org](https://vigil.youthewave.org). Refresh with `node scripts/visual-check.mjs`.

| iPhone portrait | Desktop (sidebar + map layers) |
|---|---|
| <img src="screenshots/iphone-portrait.png" alt="Vigil on iPhone — mobile bottom nav and crisis map" width="390" /> | <img src="screenshots/desktop.png" alt="Vigil on desktop — collapsible sidebar and retractable map layers panel" width="720" /> |

| iPad portrait | iPhone landscape |
|---|---|
| <img src="screenshots/ipad-portrait.png" alt="Vigil on iPad" width="384" /> | <img src="screenshots/iphone-landscape.png" alt="Vigil on iPhone landscape" width="422" /> |

---

## What's live now

Verified against source and production as of **2026-07-23**. Optional integrations degrade gracefully when API keys are missing — they never crash the app.

### Core crisis tools

| Feature | Route | Notes |
|---|---|---|
| **Missing persons board** | `/buscar`, `/reportar` | Realtime feed on home; estado/municipio/parroquia on report form; state filter chips on search |
| **Photo search (AI vision)** | `/buscar` | Claude Vision describes traits, matches public records — no biometric storage; needs `ANTHROPIC_API_KEY` |
| **Claude AI assistant** | all pages (widget) | Live-data Q&A in 8 languages; streams from `/api/assistant`; degrades gracefully without API key |
| **Statistics by state** | `/estadisticas` | Vigil's own missing/found-alive counts per estado (Supabase Realtime); federated DTV figures shown only when a complete enumeration is available, suppressed otherwise |
| **Contested figures** | `/estadisticas` | Official casualty figures published with issuer attribution and independent counterpoints (Provea, USGS PAGER, UN, academic) stacked beneath — never averaged into one number |
| **Person detail + public notes** | `/buscar/[id]` | Sightings thread; privacy-preserving contact flow |
| **PFIF export** | `/api/pfif` | [Google Person Finder](https://github.com/google/personfinder) XML interoperability |
| **Claim-token inbox** | `/mi-reporte/[token]`, `/mi-intercambio/[token]` | Passwordless management; claim URL on submit |
| **Crisis map** | `/` | USGS aftershocks (source-labeled), needs, resources, shelters, hospitals, collection points, active rescue teams; region tabs → `/apoyo-usa` |
| **USA/Diaspora hub** | `/apoyo-usa` | South Florida tri-county map (separate bounds), collection points, diaspora orgs, intercambio/events filtered by `region_scope`; does not share Venezuela map data |
| **Connectivity / comms layer** | `/conectividad` | WiFi, Starlink, cell signal citizen reports — map layer + info card on `/informacion` |
| **Retractable map layers** | `/` (desktop) | Collapsible panel on `lg+`; preference in `localStorage` |
| **Collection points** | `/punto-de-acopio` | Citizen registration → amber map markers |
| **Resource exchange** | `/intercambio` | Offer or request goods, shelter, transport, skills, equipment |
| **Volunteer marketplace** | `/voluntarios` | Skills registration and directory (now includes structural_engineer, architect, surveyor for post-disaster property assessment). |
| **Property safety assessment** | `/evaluacion-estructural` | ATC-20-style green/yellow/red tagging; volunteer-assigned only (structural_engineer/architect/surveyor roles), never AI-assigned; claim link at `/mi-evaluacion/[token]` |
| **I need help** | `/necesito-ayuda` | Drop a need pin on the map |

### Information & coordination

| Feature | Route | Notes |
|---|---|---|
| **Live information hub** | `/informacion` | USGS significant quakes, GDACS alerts, manual stats, infrastructure status, emergency directory |
| **Press kit** | `/prensa` | Boilerplate, provenance fact sheet, downloadable ZIP (markdown + design-system PDFs) |
| **Operator hazard monitor** | `/monitor` | Global early-warning relay (USGS/GDACS/hazards) with DB-level kill switch; URL-reachable only, intentionally not in public nav pending FIRMS/GDACS redistribution confirmation |
| **Events calendar** | `/calendario` | Category filters, Venezuela timezone labels |
| **Rescuer field presence** | `/equipo-activo` | Check-in, SOS, 4-hour auto-expire, map layer |
| **How to help** | `/como-ayudar` | Curated, source-dated donation organizations; overseas-logistics honesty guidance |
| **Partner links** | `/organizaciones` | Verified NGO directory (admin-approved), sourced from the production `organizations` table |
| **Weather & time bar** | all pages | Open-Meteo below emergency banner (no API key) |

### Trust, access & resilience

- 🚨 **Emergency banner** — Always-visible **911** call button plus verified carrier access codes (Movistar 911 / \*1, Digitel 112 / \*112, Movilnet \*1 / \*911, Cantv 171) and a full emergency directory sheet. Government-operated intake tools intentionally excluded.
- 📬 **Official contact** — `vigil@youthewave.org`, `vigil.support@youthewave.org`, and `support@youthewave.org` via Cloudflare Email Routing.
- 💬 **Feedback widget** — Floating support button on all pages; admin review at `/admin/feedback`.
- 🔐 **Admin auth** — Supabase OTP + `VIGIL_ADMIN_EMAILS` allowlist.
- 🌐 **8 languages** — Spanish default; English, Portuguese, French, Italian, Chinese, German, Russian (machine-translated locales).
- 📱 **PWA / offline-first** — Service worker, `/offline` fallback, offline form queue, network-status banner.
- 📲 **PWA install UX** — iOS Safari dismissible install banner; Android/Chrome native install via Más menu.
- ⚖️ **Legal pages** — Privacy Policy and Terms in Spanish (`/privacidad`, `/terminos`) and English (`/privacy`, `/terms`).

### Desktop UX & accessibility

- **Global accessibility controls** — Header type-scale toggle (**A / A+ / A++**) and high-contrast mode, available from every page; preference persisted.
- **Collapsible sidebar** — `lg+` toggles between **280px** (icon + label) and **64px** (icon-only); preference in `localStorage`.
- **View-mode navigation** — Six audience modes filter the sidebar and mobile bar; the menu sheet always exposes the full site, labeled as such, with the active mode's group pinned first.
- **Skip-to-content link** — First focusable element; targets `#main-content`.
- **WCAG AA type scale** — 16px body floor, contrast-safe muted tokens.
- **Map accessible list** — Collapsible “Ver como lista” text alternative for map markers.
- **Keyboard map controls** — Custom zoom +/- with `aria-label`; Leaflet default zoom disabled.
- **Focus-visible rings** — Global outline audit across nav, forms, and icon buttons.

### Security & data protection

Privacy is architecture, not an afterthought:

- **Contact information is never displayed publicly.** All contact routes through Vigil's internal request flow.
- **RLS hardening (migration 006)** — Dropped `public_read_missing` on `missing_persons`; public reads use `public_missing_persons` view only. Anon-key direct contact queries return empty.
- **Rate limiting** — Per-IP limits on API routes via edge middleware.
- **Coordinate bounds validation** — Submissions outside crisis map bounds rejected.
- **IP hashing** — Stored as salted SHA-256 only; never in clear text.
- **Server key isolation** — `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` in server-only modules; zero matches in client bundles.
- **Government exclusion** — Venezuelan government data sharing explicitly prohibited; VenApp not linked.

See the [Privacy Policy](https://vigil.youthewave.org/privacidad) and [Terms](https://vigil.youthewave.org/terminos).

---

## Project Status — July 2026

### ✅ Live Now

- **Federated missing persons search** — Vigil DB + a cached, short-lived DTV index queried in real time, accent-insensitive ranked name matching (no network-wide total is published — see [Data Partnership](#data-partnership))
- **Photo-based search** — Claude Vision analysis + DTV facial recognition
- **Claude AI assistant** — live database Q&A in 8 languages, never invents information
- **Crisis map** — USGS aftershocks (source-labeled), GDACS alerts, needs, resources, shelters, hospitals, rescue zones, collection points (including DTV-sourced centers); **USA diaspora hub** at `/apoyo-usa` (South Florida, separate `region_scope`)
- **Connectivity / comms layer** — WiFi, Starlink, cell signal points on map; citizen submission at `/conectividad`
- **Rescuer safety system** — GPS check-in, 4-hour auto-expiry, SOS button
- **Resource exchange (Intercambio)** — 7 categories, claim-token, 7-day auto-expiry
- **Volunteer registry** — skills-based, public directory (name privacy protected)
- **Organization directory** — verified NGOs from the production seed (including Hogar Bambi Venezuela child protection, GEM, and We Love Foundation), admin approval gate
- **Property safety assessment** — `/evaluacion-estructural`, ATC-20 green/yellow/red tagging, volunteer-assigned (structural_engineer/architect/surveyor), never AI-assigned, ToS §4 liability language
- **Events calendar** — donation drives, meetups, distributions, memorials
- **Citizen collection point registry** — self-registration, map display
- **Community wall (Muro)** — append-only, categorized, rate-limited
- **Real-time information hub** — USGS, GDACS, Venezuelan news RSS (ReliefWeb feed temporarily offline — see note under In Progress)
- **Infrastructure status tracker** — electricity, water, roads, airport (admin-editable)
- **Feedback system** — floating widget, admin-only access
- **8-language interface** — ES/EN handcrafted, PT/FR/IT/ZH/DE/RU generated
- **PWA** — 2G-optimized, offline form queue, iOS/Android install support
- **Hourly duplicate detection** — Claude Haiku cron, flags to moderation queue
- **PFIF 1.4 endpoint** — `/api/pfif`, Google Person Finder compatible
- **Sister platform network** — 12 citizen platforms linked at `/red`
- **DTV active integration** — Desaparecidos Terremoto Venezuela federated API (live when `DTV_API_KEY` configured)
- **Social share images** — Open Graph + Twitter Card auto-generated
- **Geographic breakdown** — estado/municipio/parroquia across 24 Venezuelan states
- **Privacy** — contact info never public, Venezuelan government explicitly excluded

### 🔧 In Progress

- **ReliefWeb v2 (appname pending)** — the public `v1` API was decommissioned (HTTP 410). The code is migrated to `v2`, but ReliefWeb now requires a **pre-approved `appname`** (enforced since 1 Nov 2025); until one is registered and set as `RELIEFWEB_APPNAME`, the feed returns HTTP 403 and the Official-Updates section is cleanly suppressed. Request an appname: <https://apidoc.reliefweb.int/parameters#appname>
- WhatsApp intake via Make.com (code ready, scenario not built)
- Telegram bot (TELEGRAM_BOT_TOKEN needed)
- Resend email notifications (RESEND_API_KEY needed)
- Vercel AI Gateway (cost observability optimization)
- Vigil Hurricane (Florida) archetype — diaspora hub's `region_scope` + bounds pattern is designed for reuse

### 🔜 Coming Soon

- Voice intake via OpenAI Whisper (field accessibility)
- PFIF bidirectional sync with DTV (proposed — not yet agreed)
- Vigil Field variant (specialized for rescue teams, in design phase)
- Vigil Family variant (specialized for victims/families, in design phase)
- Vigil Command variant (organizational coordinators, planned)
- Predictive aftershock visualization
- Satellite imagery damage assessment
- youthewave.org main site (Astro-based, design stage)

---

## Sister Platforms

Vigil links honestly to every citizen-run platform responding to this crisis.
If you don't find someone here, check these too:

The 12 platforms below are the sister platforms carried in `crisis.config.ts` and shown on [`/red`](https://vigil.youthewave.org/red). Desaparecidos Terremoto Venezuela is the federated integration partner; the rest are honest outbound links.

| Platform | Focus |
|---|---|
| [Desaparecidos Terremoto Venezuela](https://desaparecidosterremotovenezuela.com) | Missing persons, facial recognition, geographic breakdown — **federated integration partner** |
| [Venezuela Te Busca](https://venezuelatebusca.com) | Missing persons search and resources |
| [CIVIS Venezuela](https://civisvenezuela.com) | Missing persons, damage maps, supply points, service status |
| [RedQuipu](https://redquipu.com) | Multi-organization coordination |
| [Mapa de Daños Venezuela](https://terremotovenezuela.com) | Structural damage mapping |
| [Mapa de Necesidades VZLA](https://mapadenecesidadesvzla.com/) | Zone-based live needs map (critical/partial/covered) |
| [Encuéntrame VZLA](https://encuentramevzla.com) | Hospital admissions locator (distinct from general missing-persons search) |
| [Venezuela Earthquake Map](https://venezuela-earthquake-map.vercel.app) | Crisis mapping |
| [Yummy SOS](https://sos.yummyrides.com) | Rides and logistics SOS |
| [Centros de Ayuda Venezuela](https://centrosayudavenezuela.org) | Diaspora collection points |
| [Ayuda Venezuela](https://ayudavenezuela.app) | Aid coordination |
| [Tiltely Venezuela](https://venezuela.tiltely.com) | Fundraising / donations |

---

## Documentation

| Resource | Description |
|---|---|
| [`docs/README.md`](./docs/README.md) | Documentation index |
| [`docs/architecture/CLAUDE.md`](./docs/architecture/CLAUDE.md) | Tech stack, constraints, agent instructions |
| [`docs/architecture/DESIGN-SYSTEM.md`](./docs/architecture/DESIGN-SYSTEM.md) | UI tokens, typography, component rules |
| [`docs/architecture/DEPLOYMENT.md`](./docs/architecture/DEPLOYMENT.md) | Supabase, Vercel, DNS, Resend, local dev |
| [`docs/build-process/`](./docs/build-process/) | Sequential build prompts (historical record) |

---

## Tech stack

**Frontend:** Next.js 15 App Router · React 19 · Tailwind CSS · next-intl (8 languages) · PWA (@ducanh2912/next-pwa)

**Database:** Supabase (Postgres + Realtime + RLS) · PFIF 1.4 schema

**AI:** Claude Sonnet 4.6 (vision + photo search) · Claude Haiku 4.5 (assistant + dedup + property triage), all metered through a spend-aware circuit breaker

**Map:** Leaflet.js + OpenStreetMap · Supabase Realtime subscriptions

**Infrastructure:** Vercel · Cloudflare DNS · Supabase (sa-east-1 São Paulo)

**External data:** USGS Earthquake API · GDACS (UN) · ReliefWeb · Open-Meteo weather ·
Desaparecidos Terremoto Venezuela API (federated search + centers)

**Standard:** PFIF 1.4 — Google Person Finder compatible, enables data federation

---

## Data Partnership

Vigil federates with **[Desaparecidos Terremoto Venezuela](https://desaparecidosterremotovenezuela.com)**
as a registered integrator. Their records are searchable through Vigil alongside
Vigil's own, with full source attribution and a direct link back to their
platform.

**Vigil does not publish a total record count for the DTV network.** Their
public API exposes no count endpoint, so any total derived by paginating would
be a partial walk rather than a count — and publishing that as a network total
would misrepresent their data. Current figures live on their platform.

**Integration approach:** nothing is stored in Vigil's database. Because the DTV
API has no server-side search, Vigil keeps a short-lived in-memory name index
(30-minute TTL) and runs accent-insensitive ranked matching against it;
federated aggregate figures shown on `/estadisticas` are cached separately (~5
minutes) and suppressed entirely unless a complete enumeration is available.

**Biometrics stay on their side of the boundary.** DTV's facial-recognition
endpoint powers Vigil's photo search, but **no biometric data is ever stored by
Vigil and none crosses the federation boundary** — Vigil's own contribution is
Claude Vision *text description* of features, not biometric matching.

This partnership is part of Vigil's commitment to building a network,
not competing with the other citizen platforms serving the same families.

---

## Quick start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your keys (see below)

# 3. Run
npm run dev                  # http://localhost:3000
```

The app runs **without** a configured Supabase instance: static pages render, the USGS crisis map loads, and live-data sections show a calm empty state instead of crashing.

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, never exposed
ANTHROPIC_API_KEY=your_anthropic_key              # optional, for AI assistant, photo search, dedup cron
CRON_SECRET=generate_a_strong_random_secret       # optional, secures /api/cron/dedup on Vercel
RESEND_API_KEY=your_resend_key                    # optional, feedback email alerts
VIGIL_ADMIN_SECRET=generate_a_strong_random_secret
VIGIL_ADMIN_EMAILS=vigil@youthewave.org
```

> Never commit `.env.local`. See [`DEPLOYMENT.md`](./docs/architecture/DEPLOYMENT.md) for migrations and DNS.

---

## Deploy your own crisis instance

Vigil is a **template**. To deploy for a different country or disaster, change one file:

```
src/config/crisis.config.ts
```

Update country bounds, emergency hotline, partner links, languages, and seismic query — then redeploy. Full guide in [`DEPLOYMENT.md`](./docs/architecture/DEPLOYMENT.md).

---

## Built by

Made with hope and love for Venezuela 🇻🇪

[Orlando Toro](https://youthewave.org) — Founder, Bbluestudios LLC  
For the people of Venezuela. For anyone who needs it next.

---

## Contributors & acknowledgments

| Role | Who |
|---|---|
| **Human** | [Orlando Toro](https://github.com/Orlando7oro) — Founder, architect, operator |
| **AI co-architect** | Claude (Anthropic) — Strategic co-design, system architecture, database schema, data protection, i18n, design system, legal documents |
| **AI build agent** | Cursor Agent — Code generation and file implementation |

**Humanitarian tech partners (methodology):** [Ushahidi](https://ushahidi.com) · [Google Person Finder](https://google.org/personfinder) · [Los Topos](https://www.lostopos.org) · [OCHA](https://www.unocha.org)

**Real-time data sources:** [USGS](https://earthquake.usgs.gov) · [ReliefWeb](https://reliefweb.int) · [HDX](https://data.humdata.org)

**For Venezuela. For whoever needs it next.**

---

## License

**Code: MIT License.** Free to use, modify, fork, and deploy — commercially or otherwise, for any purpose. See [LICENSE](./LICENSE).

**Data: not covered by the MIT license.** Records submitted to a Vigil deployment by the people it serves are governed by that deployment's Terms of Service and Privacy Policy. Nothing in the MIT license grants rights to personal data held in any Vigil instance. Scraping and commercial use of platform data are prohibited under the [Terms](https://vigil.youthewave.org/terminos).

**Federated data** from partner platforms remains theirs. Attribution and usage terms follow the originating platform.
