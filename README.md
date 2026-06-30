<div align="center">

# Vigil

### We stand watch when it matters most.

A unified, open-source humanitarian crisis platform — real-time missing persons, crisis mapping, resource exchange, and volunteer coordination in one accessible interface.

<br />

[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20Realtime-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](#license)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![PWA](https://img.shields.io/badge/PWA-offline--first-5A0FC8?logo=pwa&logoColor=white)](#performance)

<br />

**🌐 Live:** [vigil.youtheway.org](https://vigil.youtheway.org) &nbsp;·&nbsp; **📦 Repo:** [github.com/Atenaxproject/vigil](https://github.com/Atenaxproject/vigil) &nbsp;·&nbsp; **🚨 Deployment:** Venezuela 2026 Earthquake Response

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

## Features

- 🔍 **Missing Persons Board** — Real-time, [PFIF](https://github.com/google/personfinder)-compatible, searchable. Contact info is never shown publicly.
- 🗺️ **Crisis Map** — Live aftershock data from USGS (no API key needed), plus community-submitted needs, resources, shelters, and hospitals on Leaflet + OpenStreetMap.
- 🔁 **Resource Exchange** — Offer or request goods, shelter, transport, skills, equipment, and more.
- 🦺 **Volunteer Marketplace** — Skills, languages, equipment, and availability — matched with verified organizations.
- 🏢 **Organization Directory** — Verified NGOs, rescue teams, and diaspora groups with donation links (admin-approved before display).
- 🛡️ **Admin Dashboard** — Protected by Supabase Auth (email/phone OTP) and an email allowlist (`VIGIL_ADMIN_EMAILS`).
- 📡 **Official Updates** — ReliefWeb + OCHA/HDX feeds, labeled and unedited.
- 📬 **Official Contact** — `vigil@youtheway.org` (general) and `vigil.support@youtheway.org` (feedback/support), routed via Cloudflare Email Routing.
- 🚨 **Emergency Banner** — Always-visible hotline (0800-RESCATE), Intérpretes, and Cruz Roja links — government-operated intake tools intentionally excluded.
- 🌐 **8 Languages** — Spanish default; English, Portuguese, French, Italian, Chinese, German, Russian.
- 📱 **PWA / Offline-first** — Service worker with runtime caching (Supabase network-first, USGS/ReliefWeb stale-while-revalidate), offline fallback page, form submission queue, and a “showing saved data” banner when offline.
- 📝 **Public notes & claim links** — Google Person Finder–style sightings on missing persons; passwordless private `/mi-reporte/{token}` and `/mi-intercambio/{token}` management pages.
- 📦 **Collection points** — Citizen self-registration for donation drop-offs on the crisis map (`/punto-de-acopio`).
- 📅 **Events calendar** — Lightweight date-grouped list of donation drives, volunteer meetups, and distributions (`/calendario`), with Venezuela timezone labels.
- 🌤️ **Weather & time bar** — Open-Meteo ambient bar (Caracas + La Guaira) below the emergency banner; no API key required.

### Coming soon

| Feature | Status |
|---|---|
| **Migration `005_notes_claims_calendar.sql`** | Coded — run in Supabase SQL Editor to enable notes, claim tokens, events, and collection-point fields |
| **Claim-link email on submit** | Coded — requires `RESEND_API_KEY` + `youtheway.org` domain verification in Resend |
| **Resend feedback email alerts** | Coded — requires `RESEND_API_KEY` in Vercel + `youtheway.org` domain verification in Resend |
| **Push notifications (mag 4.0+ aftershocks)** | Planned — PWA install + notification permission flow |
| **Screenshots in README** | Planned — add to `public/screenshots/` |

---

## Screenshots

> No screenshots are committed yet. Add images to `public/` and reference them here, e.g.
> `![Crisis map](public/screenshots/map.png)`. The live site at
> [vigil.youtheway.org](https://vigil.youtheway.org) is the current reference.

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR, edge middleware, PWA-ready |
| Language | **TypeScript** (strict) | End-to-end types in `src/types` |
| Database | **Supabase** (Postgres + Realtime) | Row-level security, live subscriptions |
| Auth | **Supabase Auth** | Email/phone OTP, admin allowlist |
| Map | **Leaflet + OpenStreetMap** | Free, Venezuela-locked bounds |
| Styling | **Tailwind CSS** | Tokens from `DESIGN-SYSTEM.md` |
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

See the [Privacy Policy](https://vigil.youtheway.org/privacidad) and [Terms](https://vigil.youtheway.org/terminos).

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
Commercial use of the data is prohibited. See [Terms](https://vigil.youtheway.org/terminos).
