# Vigil — README Final Update + Repo Description Sync
## Paste into Cursor Composer (Agent mode)

---

The platform has grown significantly since the README was last updated.
Rewrite key sections to accurately reflect what's actually built and live.
Do not change the visual header (banner SVG, badges) — update content only.

## TASK A — Verify current state before writing anything

```bash
find src/app -name "page.tsx" | sort
grep -rn "CREATE TABLE" supabase/migrations/ | grep -o "CREATE TABLE [a-z_]*" | sort
```

Use the actual output — do not assume what exists.

## TASK B — Rewrite "What Vigil Does" section

Replace the current bullet list with this accurate, current version:

```markdown
## What Vigil Does

**For families searching for missing persons**
- Search or report a missing person — PFIF 1.4 compatible, interoperable with Google Person Finder
- Photo-based search — Claude Vision analyzes uploaded photos and matches against database descriptions (no biometric data stored)
- Private claim-link inbox — manage your own report and receive contact requests without creating an account
- Public notes and sightings — anyone can add a verified sighting to any record in real time
- Geographic breakdown — filter by estado, municipio, and parroquia across all 24 Venezuelan states

**For rescue teams and volunteers**
- Crisis map — live USGS aftershock data, needs, resources, shelters, hospitals, danger zones
- Rescuer presence and safety — register your location, check in hourly, one-tap SOS
- Volunteer matching — skills-based registration matched to verified organizations
- 8-language interface — Spanish, English, Portuguese, French, Italian, Chinese, German, Russian

**For organizations and coordinators**
- Verified organization directory with donation links
- Resource exchange board — goods, shelter, transport, skills, equipment matching
- Events calendar — donation drives, volunteer meetups, distribution points
- Collection point self-registration with hours and accepted categories

**For everyone**
- Claude AI assistant — answers questions in any language using live database data, never invents information
- Community wall — public, append-only messages and announcements
- Real-time information hub — USGS seismic feed, ReliefWeb official reports, GDACS disaster alerts, Venezuelan news RSS
- Infrastructure status tracker — electricity, water, roads, airport — updated by admin, pushed live instantly
- Feedback and improvement channel — floating widget, saves to database
- PWA / offline-first — works at 2G speeds, forms queue locally and sync on reconnect
```

## TASK C — Update "Stack" section

```markdown
## Stack

Next.js 14 App Router · Supabase (Postgres + Realtime + RLS) · Leaflet.js + OpenStreetMap ·
Vercel · Cloudflare · Claude AI (Haiku + Sonnet) · next-intl (8 languages) ·
USGS Earthquake API · GDACS (UN disaster alerts) · ReliefWeb API · Open-Meteo weather ·
PFIF 1.4 (Google Person Finder compatible)
```

## TASK D — Update Project Status section

Replace whatever is currently in "Project Status" with this verified list
(confirm each item actually exists in code before listing it):

```markdown
## Project Status

### ✅ Live Now
- Missing persons board — search, report, real-time updates, claim-token private inbox
- Photo-based search via Claude Vision
- Public notes and sightings on missing persons records
- Crisis map — USGS aftershocks, needs, resources, shelters, hospitals, danger zones, rescue zones
- Rescuer safety presence system with SOS button
- Resource exchange board (Intercambio)
- Volunteer registration and public directory
- Organization directory (16 verified organizations seeded)
- Events calendar
- Citizen collection point registration
- Claude AI assistant — live database Q&A in 8 languages
- Real-time information hub — USGS, GDACS, ReliefWeb, Venezuelan news RSS
- Infrastructure status tracker (admin-editable, Supabase Realtime)
- Community wall (Muro Comunitario)
- Feedback and improvement channel
- Weather + Venezuela time ambient bar (Open-Meteo, free)
- 8-language interface (ES, EN, PT, FR, IT, ZH, DE, RU)
- PWA with offline form queue
- Hourly duplicate detection via Claude Haiku cron job
- PFIF 1.4 compatible missing persons endpoint
- Sister platform network — links to 7 active citizen platforms
- Emergency contacts — 0800-RESCATE, Cruz Roja, OCHA, regional hospitals
- Geographic breakdown by estado/municipio/parroquia
- Data protection — contact info never public, Venezuelan government explicitly excluded
- Privacy Policy and Terms of Service (ES + EN)

### 🔧 In Progress
- WhatsApp intake (Make.com scenario — code ready, scenario not built)
- Telegram bot (code ready, bot token needed)
- Resend email notifications for feedback submissions (RESEND_API_KEY needed)
- Vercel AI Gateway integration (optimization — reduces Claude API costs via caching)
- X/Twitter nonprofit API access (application submitted)

### 🔜 Coming Soon
- Voice-based intake via OpenAI Whisper (accessibility for field workers)
- PFIF bidirectional sync with Desaparecidos Terremoto Venezuela (partnership in discussion)
- Multi-country framework documentation (one config file = any future disaster)
- Predictive aftershock visualization
```

## TASK E — Update "Sister Platforms" section

Add or update:

```markdown
## Sister Platforms

Vigil links honestly to every citizen-run platform responding to this crisis.
If you don't find someone here, check these too:

| Platform | Focus |
|---|---|
| [Desaparecidos Terremoto Venezuela](https://desaparecidosterremotovenezuela.com) | Missing persons, facial recognition, geographic breakdown |
| [Venezuela Te Busca](https://venezuelatebusca.com) | Missing persons search and resources |
| [CIVIS Venezuela](https://civisvenezuela.com) | Missing persons, damage maps, supply points |
| [SOS Venezuela 2026](https://sosvenezuela2026.com) | Live collaborative crisis mapping |
| [Red Venezuela Activa](https://redvenezuelaactiva.com) | Volunteer coordination |
| [Mapa de Daños Venezuela](https://terremotovenezuela.com) | Structural damage mapping |
| [RedQuipu](https://redquipu.com) | Multi-organization coordination |
```

## TASK F — Update GitHub repo description and topics

```bash
gh repo edit Atenaxproject/vigil \
  --description "Vigil — Open-source humanitarian crisis platform. Missing persons (PFIF), crisis map, Claude AI assistant, photo search, 8 languages, rescuer safety, volunteer coordination. Live: vigil.youthewave.org · Built for Venezuela 2026 · Redeploys for any disaster." \
  --add-topic "ai" \
  --add-topic "claude-ai" \
  --add-topic "missing-persons" \
  --add-topic "crisis-response" \
  --add-topic "humanitarian" \
  --add-topic "pwa" \
  --add-topic "nextjs" \
  --add-topic "supabase" \
  --add-topic "venezuela" \
  --add-topic "open-source"
```

## TASK G — Commit

```bash
git add -A
git commit -m "docs: comprehensive README update reflecting all live features

- Updated What Vigil Does to reflect full current feature set
- Updated stack (GDACS, Open-Meteo, PFIF, Claude Haiku + Sonnet)
- Updated Project Status: verified Live Now / In Progress / Coming Soon
- Added Sister Platforms table
- Updated GitHub repo description and topics via CLI

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save as next numbered file in docs/build-process/.
