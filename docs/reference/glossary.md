# Vigil — Glossary

**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

---

## Crisis and humanitarian terms

| Term | Definition |
|------|------------|
| **PFIF** | Person Finder Interchange Format — XML standard used by Google Person Finder and compatible crisis platforms to exchange missing persons data. Vigil exports PFIF 1.4 at `/api/pfif`. |
| **ATC-20** | Applied Technology Council post-earthquake building evaluation procedure. Vigil uses green/yellow/red tagging for property safety assessments. |
| **Acopio** | Collection point for donated goods (Spanish). Registered at `/punto-de-acopio`. |
| **Estado** | Venezuelan state — primary geographic division used in filters and statistics. |
| **Municipio** | Municipality — secondary geographic division within an estado. |
| **Parroquia** | Parish — tertiary geographic division within a municipio. |
| **Diaspora** | Venezuelans and families abroad searching for missing persons and coordinating aid remotely. |

---

## Platform-specific terms

| Term | Definition |
|------|------------|
| **Vigil** | Humanitarian crisis platform operated by Bbluestudios LLC / YouTheWave. Tagline: "We stand watch when it matters most." |
| **Claim token** | UUID embedded in a passwordless management URL (e.g. `/mi-reporte/[token]`). Grants access to private report inbox without account login. |
| **Claim link / claim URL** | Full URL containing a claim token. Must be kept secret like a password. |
| **Federated search** | Live query to an external partner API (DTV) without copying records into Vigil's database. Results are attributed in UI. |
| **Sister platform** | Independent citizen crisis tool linked at `/red`. Vigil aggregates links and federates search where APIs exist. |
| **DTV** | Desaparecidos Terremoto Venezuela — federated partner API for missing persons search, photo ID, and center sync. Marked `integrated: true` in crisis config. |
| **Unverified badge** | Visual indicator on citizen submissions not yet confirmed by admin or official source. |
| **Realtime** | Supabase websocket subscriptions pushing live updates to map and missing persons feed. |
| **PWA** | Progressive Web App — installable web app with offline queue support via `@ducanh2912/next-pwa`. |
| **Crisis config** | Single file `src/config/crisis.config.ts` controlling country, bounds, hotlines, partners, and legal metadata for redeployment. |

---

## Technical terms

| Term | Definition |
|------|------------|
| **RLS** | Row Level Security — Postgres policies in Supabase restricting which rows each role can read/write. |
| **Service role** | Supabase key bypassing RLS — server-only, never exposed to browser. |
| **Anon key** | Supabase public key scoped by RLS — safe for client with proper policies. |
| **Public view** | Database view (`public_missing_persons`, etc.) stripping private fields before public reads. |
| **Middleware rate limit** | IP-based request throttling in `src/middleware.ts` using hashed IP addresses. |
| **Dedup cron** | Daily Vercel cron at 08:00 UTC running Claude Haiku to detect duplicate missing person reports. |
| **DTV sync cron** | Daily Vercel cron at 06:00 UTC geocoding and upserting DTV centers to `map_markers`. |
| **Offline queue** | Client-side queue (`src/lib/offline-queue.ts`) storing form submissions when PWA is offline. |
| **Geo bounds** | Venezuela crisis bounding box — coordinates outside bounds rejected by API validation. |
| **Jittered coordinates** | Slightly offset lat/lng shown publicly for property assessments to protect exact location privacy. |

---

## Organization and integration terms

| Term | Definition |
|------|------------|
| **YouTheWave** | Humanitarian initiative brand under which Vigil is deployed (youthewave.org). |
| **Bbluestudios LLC** | Legal operator of Vigil platform. |
| **ReliefWeb** | UN OCHA disaster information service — source for `/noticias`. |
| **GDACS** | Global Disaster Alert and Coordination System — alerts on `/informacion`. |
| **USGS** | U.S. Geological Survey — earthquake aftershock data on crisis map. |
| **HDX** | Humanitarian Data Exchange — data source integrated in live info hub. |
| **Open-Meteo** | Weather API proxied at `/api/weather`. |
| **Resend** | Transactional email provider for optional claim links and feedback alerts. |
| **Anthropic Claude** | AI provider for assistant, photo search, dedup, and property triage. Haiku for text; Sonnet for vision. |

---

## Status and workflow terms

| Term | Definition |
|------|------------|
| **Moderation queue** | Admin table (`moderation_queue`) holding AI-flagged duplicates and items pending review. |
| **Contact request** | Private message from one user requesting connection to a missing person submitter or listing owner. |
| **Flag count** | Community wall messages auto-hide when flag_count reaches 3. Missing persons flagging not yet implemented. |
| **Duplicate_of** | Foreign key on a missing person record pointing to the canonical record when dedup confirms a duplicate. |
| **Tag status** | Property assessment result: `green`, `yellow`, or `red` (ATC-20 style). Set by assigned volunteer only. |
| **Approved_by_admin** | Boolean gate on organizations — must be true for public directory visibility. |

---

## Abbreviations

| Abbr | Expansion |
|------|-----------|
| API | Application Programming Interface |
| CSP | Content Security Policy |
| OTP | One-Time Password (admin email login) |
| PWA | Progressive Web App |
| RLS | Row Level Security |
| SOS | Distress signal on rescuer presence check-in |
| ToS | Terms of Service |
| UUID | Universally Unique Identifier (claim tokens, record IDs) |
| WCAG | Web Content Accessibility Guidelines (AA target) |
