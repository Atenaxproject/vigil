# Vigil — Unified Humanitarian Crisis Platform

**We stand watch when it matters most.**

Vigil is an open-source humanitarian crisis platform that unifies proven tools into a single,
accessible interface for rescue teams, volunteers, victims, diaspora, donors, and organizations —
all organized around a shared real-time crisis map.

**Currently deployed for: Venezuela 2026 Earthquake Response**

**Production URL:** https://vigil.youthewave.org

---

## What Vigil Does

- **Missing Persons Board** — Real-time, PFIF-compatible, searchable. Contact info protected.
- **Crisis Map** — Live aftershock data (USGS), needs, resources, shelters, hospitals
- **Volunteer Matching** — Skills-based matching with verified organizations
- **Organization Directory** — Verified NGOs, rescue teams, diaspora groups with donation links
- **Official Updates** — ReliefWeb + OCHA/HDX data feeds, verified and labeled
- **Multilingual** — Spanish default, 8 languages supported
- **PWA / Offline-first** — Works at 2G speeds. Forms queue offline, sync on reconnect

## Stack

Next.js 14 App Router · Supabase (Postgres + Realtime) · Leaflet.js · Vercel · Cloudflare · Claude AI (Haiku)

## Data Protection

Contact information is **never displayed publicly**. All contact is routed through Vigil's
internal messaging. The Venezuelan government is **explicitly excluded** from any data sharing.
See [Privacy Policy](https://vigil.youtheway.org/privacidad).

## Deploy Your Own Crisis Instance

Change one file: `src/config/crisis.config.ts`
Update country bounds, emergency numbers, partner links, and deploy.

## Manual Post-Deploy Steps

1. Set env vars in Vercel (Supabase, Anthropic, VIGIL_ADMIN_SECRET)
2. Run `supabase/migrations/001_initial_schema.sql` in Supabase SQL editor
3. Enable Realtime on `missing_persons`, `map_markers`, `needs_offers`
4. Point DNS for vigil.youtheway.org to Vercel + Cloudflare proxy
5. Run `node scripts/generate-translations.mjs` once ANTHROPIC_API_KEY is set

## Built By

[Orlando Toro](https://atenaxproject.com) — Bbluestudios LLC
For the people of Venezuela. For anyone who needs it next.

## License

MIT License — Free to use, modify, and deploy for humanitarian purposes.
Commercial use of the data is prohibited. See [Terms](https://vigil.youtheway.org/terminos).
