# Vigil — README Update: DTV Integration + Full Current Status
## Paste into Cursor Composer (Agent mode)

---

Update README.md to reflect the DTV integration now live. Do not change 
the visual header (banner, badges). Update content sections only.

## TASK A — Update the repo description via CLI

```bash
gh repo edit Atenaxproject/vigil \
  --description "Vigil — Open-source humanitarian crisis platform. Federated search across 55,891+ missing persons records (DTV integration), Claude AI assistant, photo search, real-time crisis map, 8 languages, PWA. Live: vigil.youthewave.org · Venezuela 2026"
```

## TASK B — Update "What Vigil Does" section

Replace the missing persons bullet points with this updated version:

```markdown
**Missing persons search — now federated across 55,891+ records**
- Search Vigil's own database AND Desaparecidos Terremoto Venezuela simultaneously
- Results from both platforms shown side by side with clear source attribution
- Photo-based search: upload a photo, Claude Vision analyzes features, 
  matched against both databases — no biometric data stored
- Geographic filters: estado, municipio, parroquia across all 24 Venezuelan states
- PFIF 1.4 compatible — interoperable with Google Person Finder
- Real-time updates across all open browser tabs (Supabase Realtime)

**Crisis map — live data from multiple verified sources**
- USGS aftershock data (real-time, 5-min refresh, magnitude 2.0+)
- GDACS disaster alerts (United Nations / European Commission)
- Centers and hospitals from Desaparecidos Terremoto Venezuela (integrated)
- Citizen-reported needs, resources, shelters, danger zones, rescue zones
- Rescuer safety presence system with GPS check-in and SOS button
- Layer toggles for all marker types

**AI coordination — Claude-powered in 8 languages**
- Live Q&A assistant: answers questions using real database data, never invents
- Natural language intake: describe a person in plain text, Claude structures it
- Photo-based identification: Claude Vision + DTV facial recognition
- Hourly duplicate detection (Claude Haiku cron)
```

## TASK C — Update the Stack section

```markdown
## Stack

**Frontend:** Next.js 14 App Router · Tailwind CSS · next-intl (8 languages) · PWA (next-pwa)

**Database:** Supabase (Postgres + Realtime + RLS) · PFIF 1.4 schema

**AI:** Claude Sonnet 4.6 (vision + photo search) · Claude Haiku 3.5 (assistant + dedup)

**Map:** Leaflet.js + OpenStreetMap · Supabase Realtime subscriptions

**Infrastructure:** Vercel · Cloudflare DNS · Supabase (sa-east-1 São Paulo)

**External data:** USGS Earthquake API · GDACS (UN) · ReliefWeb · Open-Meteo weather · 
Desaparecidos Terremoto Venezuela API (federated search + centers)

**Standard:** PFIF 1.4 — Google Person Finder compatible, enables data federation
```

## TASK D — Update Project Status section

```markdown
## Project Status — July 2026

### ✅ Live Now
- **Federated missing persons search** — Vigil DB + DTV API (55,891+ records combined)
- **Photo-based search** — Claude Vision analysis + DTV facial recognition
- **Claude AI assistant** — live database Q&A in 8 languages, never invents information
- **Crisis map** — USGS aftershocks, GDACS alerts, needs, resources, shelters, 
  hospitals, rescue zones, collection points (including DTV-sourced centers)
- **Rescuer safety system** — GPS check-in, 4-hour auto-expiry, SOS button
- **Resource exchange (Intercambio)** — 7 categories, claim-token, 7-day auto-expiry
- **Volunteer registry** — skills-based, public directory (name privacy protected)
- **Organization directory** — 16 verified NGOs seeded, admin approval gate
- **Events calendar** — donation drives, meetups, distributions, memorials
- **Citizen collection point registry** — self-registration, map display
- **Community wall (Muro)** — append-only, categorized, rate-limited
- **Real-time information hub** — USGS, GDACS, ReliefWeb, Venezuelan news RSS
- **Infrastructure status tracker** — electricity, water, roads, airport (admin-editable)
- **Feedback system** — floating widget, admin-only access
- **8-language interface** — ES/EN handcrafted, PT/FR/IT/ZH/DE/RU generated
- **PWA** — 2G-optimized, offline form queue, iOS/Android install support
- **Hourly duplicate detection** — Claude Haiku cron, flags to moderation queue
- **PFIF 1.4 endpoint** — /api/pfif, Google Person Finder compatible
- **Sister platform network** — 7 citizen platforms linked at /red
- **DTV active integration** — Desaparecidos Terremoto Venezuela federated API
- **Social share images** — Open Graph + Twitter Card auto-generated
- **Geographic breakdown** — estado/municipio/parroquia across 24 Venezuelan states
- **Privacy:** contact info never public, Venezuelan government explicitly excluded

### 🔧 In Progress
- WhatsApp intake via Make.com (code ready, scenario not built)
- Telegram bot (TELEGRAM_BOT_TOKEN needed)
- Resend email notifications (RESEND_API_KEY needed)
- Vercel AI Gateway (cost observability optimization)
- DTV statistics widget on /estadisticas (API integration, UI in progress)

### 🔜 Coming Soon  
- Voice intake via OpenAI Whisper (field accessibility)
- PFIF bidirectional sync with DTV (partnership in validation)
- Vigil Field variant (specialized for rescue teams, in design phase)
- Vigil Family variant (specialized for victims/families, in design phase)
- Vigil Command variant (organizational coordinators, planned)
- Predictive aftershock visualization
- Satellite imagery damage assessment
- youthewave.org main site (Astro-based, design stage)
```

## TASK E — Add DTV Partnership section

Add after the Stack section:

```markdown
## Data Partnership

Vigil integrates with **[Desaparecidos Terremoto Venezuela](https://desaparecidosterremotovenezuela.com)** 
as a registered integrator. Their database (55,891+ records, 15,770+ located) 
is accessible through Vigil's federated search — results appear alongside 
Vigil's own records with full source attribution and a direct link back 
to their platform.

**Integration approach:** federated query only — their data is never stored 
in Vigil's database. Every search queries both platforms simultaneously in 
real time. Their facial recognition endpoint powers Vigil's photo search.

This partnership is part of Vigil's commitment to building a network, 
not competing with the other citizen platforms serving the same families.
```

## Commit

```bash
git add -A
git commit -m "docs: update README — DTV integration live, federated search, full status

- Updated What Vigil Does to reflect 55,891+ record federated search
- Updated Stack section with DTV API and current AI models
- Updated Project Status with full verified Live Now / In Progress / Coming Soon
- Added Data Partnership section documenting DTV integration approach
- Updated GitHub repo description

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.
