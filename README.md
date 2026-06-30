<div align="center">

<p align="center">
  <img src="docs/assets/vigil-banner.svg" alt="Vigil — We stand watch when it matters most" width="100%" />
</p>

# Vigil

### We stand watch when it matters most.

A unified, open-source humanitarian crisis platform — real-time missing persons, crisis mapping, resource exchange, and volunteer coordination in one accessible interface.

<br />

![License](https://img.shields.io/badge/license-MIT-2563EB)
![Next.js](https://img.shields.io/badge/Next.js-14-0F172A)
![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ECF8E)
![PWA](https://img.shields.io/badge/PWA-Ready-2563EB)
![Languages](https://img.shields.io/badge/Languages-8-2563EB)

<br />

[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)

<br />

**Live now:** [vigil.youthewave.org](https://vigil.youthewave.org) &nbsp;·&nbsp; **📦 Repo:** [github.com/Atenaxproject/vigil](https://github.com/Atenaxproject/vigil) &nbsp;·&nbsp; **🚨 Deployment:** Venezuela 2026 Earthquake Response

</div>

---

## Why Vigil

Most crisis tools already exist — they're just scattered. Vigil does **not** reinvent them. It aggregates proven humanitarian platforms (USGS, ReliefWeb, OCHA, HDX, Google Person Finder) into a single calm interface, then adds the missing connective tissue: a live missing-persons board, a community resource exchange, and skills-based volunteer matching.

One config file change redeploys the whole platform for **any country, any disaster**.

### Built for six user groups

| Group | What they do on Vigil |
|---|---|
| 🆘 **Rescue teams** | Read the crisis map, find active rescue zones, locate needs |
| 🤝 **Volunteers** | Register skills, get matched with organizations |
| 🧍 **Victims** | Report needs, drop a help pin, find shelter & resources |
| 🌎 **Diaspora** | Search for missing family across a real-time board |
| 💛 **Donors** | Reach verified organizations with direct donation links |
| 🏢 **Organizations** | List services, receive volunteers, coordinate response |

---

## Documentation

Full build process and architecture decisions: [`/docs`](./docs) — deployment guide: [`docs/architecture/DEPLOYMENT.md`](./docs/architecture/DEPLOYMENT.md)

---

## Features

What is built and deployed today at [vigil.youthewave.org](https://vigil.youthewave.org).
Features that need optional API keys (e.g. Resend) degrade gracefully when
unconfigured — they do not crash the app.

### Core crisis tools

- 🔍 **Missing persons board** — Search (`/buscar`), report (`/reportar`), realtime feed on home. Public notes & sightings thread on `/buscar/[id]`. Contact info never shown publicly. [PFIF](https://github.com/google/personfinder) export at `/api/pfif`.
- 🗺️ **Crisis map** — USGS aftershocks (no API key), community needs/resources, shelters, hospitals, collection points, and active rescue teams on Leaflet + OpenStreetMap.
- 📦 **Collection points** — Citizen registration at `/punto-de-acopio` → amber map markers (16 seeded markers on production map).
- 🔁 **Resource exchange** — Offer or request goods, shelter, transport, skills, and equipment (`/intercambio`).
- 🦺 **Volunteer marketplace** — Register skills and browse available volunteers (`/voluntarios`).
- 🆘 **I need help** — Drop a need pin on the map (`/necesito-ayuda`).

### Information & coordination

- 📡 **Official updates** — ReliefWeb feed on `/noticias` (live, no key required).
- 📊 **Live information hub** — USGS significant quakes, ReliefWeb reports, manual crisis stats, and realtime infrastructure status (`/informacion`).
- 📅 **Events calendar** — `/calendario` with category filters and Venezuela timezone labels (realtime on `events`).
- 🛡️ **Rescuer safety presence** — Field check-in, SOS, 4-hour auto-expire, map layer (`/equipo-activo`).
- 💛 **How to help** — 18 verified donation organizations from production Supabase seed (`/como-ayudar`).
- 🏢 **Partner links** — Curated NGOs and official sources from `crisis.config.ts` (`/organizaciones`).
- 🌤️ **Weather & time bar** — Open-Meteo bar below emergency banner (no API key).

### Trust, access & resilience

- 🚨 **Emergency banner** — Always-visible hotline (0800-RESCATE), Intérpretes, Cruz Roja. Government-operated intake tools intentionally excluded.
- 📬 **Official contact** — `vigil@youthewave.org` and `vigil.support@youthewave.org` via Cloudflare Email Routing.
- 💬 **Feedback widget** — Floating support button on all pages; admin review at `/admin/feedback`.
- 🔗 **Claim-token inbox** — Passwordless `/mi-reporte/{token}` and `/mi-intercambio/{token}`; claim URL shown on submit.
- 🔐 **Admin auth** — Supabase OTP login + `VIGIL_ADMIN_EMAILS` allowlist. Main `/admin` panel is a stub — use Supabase Studio for moderation queue today.
- 🌐 **8 languages** — Spanish default; English, Portuguese, French, Italian, Chinese, German, Russian.
- 📱 **PWA / offline-first** — Service worker caching, `/offline` fallback, offline form queue, network-status banner.
- ⚖️ **Legal pages** — Privacy Policy and Terms in Spanish (`/privacidad`, `/terminos`) and English (`/privacy`, `/terms`).

### Optional integrations

These ship in the codebase but need an API key or external service before they work in production:

- ✉️ **Resend email alerts** — Feedback notifications and claim-link emails on submit (needs `RESEND_API_KEY` + `youthewave.org` verified in Resend).

### Coming soon

| Feature | Status |
|---|---|
| **Full organization directory UI** | Schema + seed exist; `/organizaciones` shows partner links only — Supabase org cards not wired yet |
| **Admin moderation dashboard** | Auth works; full queue UI not built — use Supabase Studio |
| **HDX dataset feed** | `src/lib/hdx.ts` exists; not surfaced on any page yet |
| **AI translation / dedup / matching** | Library code in `src/lib/ai/`; not wired to submit flows or cron |
| **WhatsApp / Telegram intake** | Discussed in architecture docs; no webhook handlers built |
| **Push notifications (mag 4.0+ aftershocks)** | Planned — PWA notification permission flow |
| **Screenshots in README** | Playwright captures in `screenshots/` (iphone-portrait, iphone-landscape, ipad-portrait, desktop) |

---

## Project Status

Verified against current source code and live production site as of 2026-06-30.

### ✅ Live Now

- Missing persons search, report, detail page (`/buscar`, `/reportar`, `/buscar/[id]`)
- Crisis map — USGS aftershocks, needs, resources, shelters, hospitals, collection points, active teams
- Claim-token private management pages (`/mi-reporte/[token]`, `/mi-intercambio/[token]`)
- Resource exchange (`/intercambio`)
- Volunteer registration and directory (`/voluntarios`)
- Collection point registration (`/punto-de-acopio`)
- Events calendar (`/calendario`)
- Rescuer field presence / SOS (`/equipo-activo`)
- Live information hub — seismic status, ReliefWeb feed, infrastructure metrics (`/informacion`)
- Official updates feed — ReliefWeb (`/noticias`)
- How to help — 18 verified donation orgs from Supabase seed (`/como-ayudar`)
- Emergency banner — 0800-RESCATE, Intérpretes, Cruz Roja (always visible, non-dismissible)
- Weather + time bar — Open-Meteo (no API key)
- Feedback widget — all pages; admin review at `/admin/feedback`
- 8-language i18n — Spanish default; EN, PT, FR, IT, ZH, DE, RU
- PWA — service worker, offline fallback, offline form queue, network-status banner
- Privacy Policy + Terms — Spanish and English
- Admin auth — Supabase OTP + `VIGIL_ADMIN_EMAILS` allowlist
- Mobile viewport fix — `width: device-width` + `initialScale: 1` deployed 2026-06-30
- Map layer panel — collapsible bottom-sheet on mobile, floating panel on desktop

### 🔧 In Progress (code present, needs config)

- **Resend email** — code in `src/lib/email.ts`; needs `RESEND_API_KEY` + `youthewave.org` verified domain in Resend dashboard
- **PFIF export** — `src/lib/pfif.ts` exists; API route at `/api/pfif` not yet created
- **Claude Haiku AI** — translation/dedup/matching code in `src/lib/ai/`; not wired to submit flows or cron; needs `ANTHROPIC_API_KEY`
- **WhatsApp/Telegram intake** — documented in architecture; no webhook handlers built yet

### 🔜 Coming Soon

- Full organization directory with Supabase-backed cards (`/organizaciones` shows partner links only today)
- Admin moderation queue UI (use Supabase Studio in the meantime)
- HDX dataset feed (`src/lib/hdx.ts` exists but not surfaced on any page)
- Push notifications for M4.0+ aftershocks (PWA permission flow not yet built)

---

## Screenshots

Playwright visual captures of the live production site (`https://vigil.youthewave.org`) are in `screenshots/` — run `node scripts/visual-check.mjs` to refresh them.

| Viewport | File | Notes |
|---|---|---|
| iPhone portrait 390×844 | `screenshots/iphone-portrait.png` | Mobile bottom-nav, layers icon button visible |
| iPhone landscape 844×390 | `screenshots/iphone-landscape.png` | Landscape header + nav |
| iPad portrait 768×1024 | `screenshots/ipad-portrait.png` | Tablet layout, bottom-nav at 768px |
| Desktop 1440×900 | `screenshots/desktop.png` | Sidebar, three-column layout, layer panel open |

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR, edge middleware, PWA-ready |
| Language | **TypeScript** (strict) | End-to-end types in `src/types` |
| Database | **Supabase** (Postgres + Realtime) | Row-level security, live subscriptions |
| Auth | **Supabase Auth** | Email/phone OTP, admin allowlist |
| Map | **Leaflet + OpenStreetMap** | Free, Venezuela-locked bounds |
| Styling | **Tailwind CSS** | Tokens from [`docs/architecture/DESIGN-SYSTEM.md`](./docs/architecture/DESIGN-SYSTEM.md) |
| i18n | **next-intl** | 8 locales, Spanish-first |
| AI | **Claude (Haiku)** | Translation, dedup, match suggestions |
| Hosting | **Vercel** + **Cloudflare** | Edge network, DDoS protection |

---

## Quick Start

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in your keys (see below)

# 3. Run
npm run dev                  # http://localhost:3000
```

The app runs **without** a configured Supabase instance: static pages render, the
USGS crisis map loads (USGS is public), and live-data sections show a calm empty
state instead of crashing. Add Supabase keys to enable the missing-persons board,
resource exchange, and volunteer directory.

### Environment variables

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server-only, never exposed
ANTHROPIC_API_KEY=your_anthropic_key              # optional, for AI features
RESEND_API_KEY=your_resend_key                    # optional, feedback email alerts
VIGIL_ADMIN_SECRET=generate_a_strong_random_secret
VIGIL_ADMIN_EMAILS=orlando@atenaxproject.com
```

> Never commit `.env.local`. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) for full setup,
> migrations, and DNS steps.

---

## Deploy Your Own Crisis Instance

Vigil is a **template**. To deploy for a different country or disaster, change one file:

```
src/config/crisis.config.ts
```

Update country bounds, emergency hotline, partner links, languages, and seismic
query — then redeploy. Everything else (UI, schema, data protection, i18n) adapts
automatically. Full guide in [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## Data Protection

Privacy is architecture, not an afterthought:

- **Contact information is never displayed publicly.** All contact is routed through Vigil's internal request flow; submitters choose whether to respond.
- **The Venezuelan government is explicitly excluded** from any data sharing. Government-operated intake apps (e.g. VenApp) are not linked or promoted.
- IPs are stored only as salted SHA-256 hashes — never in clear text.
- Row-level security, coordinate bounds validation, and per-IP rate limiting guard the API.
- Right-to-erasure and data-retention windows are built into the schema.

See the [Privacy Policy](https://vigil.youthewave.org/privacidad) and [Terms](https://vigil.youthewave.org/terminos).

---

## Built By

Made with hope and love for Venezuela 🇻🇪

[Orlando Toro](https://atenaxproject.com) — Founder, Bbluestudios LLC  
For the people of Venezuela. For anyone who needs it next.

---

## Contributors & Acknowledgments

**Human:** Orlando Toro ([@Orlando7oro](https://github.com/Orlando7oro)) — Founder, architect, operator

**AI Co-architect:** Claude (Anthropic) — Strategic co-design, system architecture, database schema, data protection layer, i18n system, design system, legal documents, real-time data research, and the humanitarian vision that shaped every decision in this platform.

**AI Build Agent:** Cursor Agent — Code generation and file implementation

**Humanitarian Tech Partners (applied methodology):**
- [Ushahidi](https://ushahidi.com) — Crisis mapping methodology reference
- [Google Person Finder](https://google.org/personfinder) — PFIF standard for missing persons interoperability
- [Los Topos](https://www.lostopos.org) — Mexico's legendary rescue team that inspired the volunteer skills system
- [OCHA](https://www.unocha.org) — Humanitarian coordination framework

**Real-time Data Sources:**
- [USGS Earthquake Hazards Program](https://earthquake.usgs.gov) — Seismic data
- [ReliefWeb](https://reliefweb.int) — Official situation reports
- [HDX — Humanitarian Data Exchange](https://data.humdata.org) — Crisis datasets

**For Venezuela. For whoever needs it next.**

---

## License

**MIT License** — Free to use, modify, and deploy for humanitarian purposes.
Commercial use of the data is prohibited. See [Terms](https://vigil.youthewave.org/terminos).
