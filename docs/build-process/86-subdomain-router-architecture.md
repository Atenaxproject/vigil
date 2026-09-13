# VIGIL — Build Prompt: Subdomain-Per-Zone Router Architecture
### Orlando Toro x Claude — September 2026

---

## Status context (read first)

Prompt 52 pre-built Florida as a config swap (`src/config/deployments/florida.config.ts`) on the assumption that `vigil.youthewave.org` stays Venezuela's live root domain and every future zone gets a subdomain hanging off it (`florida.vigil.youthewave.org`, per that prompt's own placeholder). What was never decided: **who or what serves the root domain once more than one zone exists.** Right now `vigil.youthewave.org` root *is* the Venezuela app directly — there is no neutral entry point.

Orlando's original intent for Vigil, restated 2026-09-12: one place you go (`vigil.youthewave.org`), that routes you to the deployment for your zone — eventually covering the Americas and the islands around it, not just Venezuela and Florida. This prompt builds that router.

**Real-world stakes, corrected from AGENTS.md's framing:** AGENTS.md describes Venezuela as "live in production, serving the Venezuela 2026 earthquake response." Per Orlando, that's aspirational, not actual — the deployment never got real adoption; when the earthquake hit, people used other resources, and it was never promoted into use. This does **not** relax the hard constraints in AGENTS.md §4 (privacy, no biometric data, contact info never public, emergency-number verification, etc.) — those protect whoever might use it. It **does** mean this restructuring can proceed at a normal careful-engineering pace rather than incident-response caution: nobody's mid-search-for-a-missing-relative on this domain today. Still do the redirect work below — it's cheap insurance, not paranoia.

Florida is the deployment Orlando is actually betting on for adoption (a credibility pitch to Florida officials), so this router is partly in service of that: presenting one polished home for Vigil, not an orphaned single-country tool.

---

## Objective

1. Turn `vigil.youthewave.org` root into a lightweight, mostly-static router/hub — the "which zone are you in" front door, evolved from the existing `/regiones` list into the interactive Americas map Orlando described.
2. Move the live Venezuela deployment to its own subdomain (`venezuela.vigil.youthewave.org`) with zero functional change and zero broken links — every existing bookmark/shared link/flyer referencing `vigil.youthewave.org/<path>` keeps resolving during a transition window.
3. Leave Florida (and future zones) exactly where prompt 52 already put them: their own subdomain, wired in the moment their `registry.ts` entry flips from `prebuilt` to `live`.

**One codebase, never a fork (AGENTS.md §8) still applies.** The hub is not a separate app to maintain — it's a mode of the same Next.js codebase, selected the same way every deployment already differs (`crisis.config.ts` / an equivalent hub config), and it never touches Supabase.

---

## What already exists (don't rebuild this)

- `src/config/deployments/registry.ts` — `DEPLOYMENTS` array (`id`, `countryCodes`, `regionCodes`, `url`, `label`, `status: 'live' | 'prebuilt'`), `matchDeployment()`, `liveDeployments()`. This is already the single source of truth both the banner and `/regiones` read from.
- `src/components/layout/DeploymentSuggestion.tsx` + `DeploymentSuggestionBanner` — server component reading Vercel's `x-vercel-ip-country` / `x-vercel-ip-country-region` geo headers (no GPS, no cookies, nothing persisted server-side), showing a dismissible "you might want X" banner when a visitor's matched deployment differs from `CURRENT_DEPLOYMENT_ID` and is `live`.
- `src/app/regiones/page.tsx` — plain text list of `liveDeployments()`. This *is* the manual picker prompt 52 (NN+3) called for. It becomes the fallback/secondary view on the hub, not a throwaway.
- Each deployment already means: its own `crisis.config.ts` content (or equivalent), its own Supabase project, its own Vercel project or branch. Nothing about "which domain serves which deployment" needs to change on the data/backend side — this prompt is routing and DNS only.

---

## Implementation

### 1. Hub mode (new)

Add a way for a deployment to declare itself the router rather than a zone — e.g. `CRISIS_CONFIG` gets a sibling `HUB_MODE = true` config, or a dedicated minimal config/branch (`deploy/hub`) mirroring how `deploy/florida` already works as its own branch tonight. When hub mode is active:

- Root route (`/`) renders the Americas map + `liveDeployments()` list (evolve `/regiones`'s content into this page; keep `/regiones` as a redirect to `/` for the hub, or as the non-JS/no-map fallback).
- No `EmergencyBanner`, no `WeatherBar`, no `Navigation` sidebar, no Supabase client initialization at all — the hub has no missing-persons/reports/map-marker features of its own. It exists to route, nothing else.
- `NEXT_PUBLIC_SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` env vars are simply absent from the hub's Vercel project — if any shared component accidentally tries to call Supabase in hub mode, that's a bug to catch in review, not something to silently guard with a fallback.

### 2. Americas map

- Reuse `DEPLOYMENTS` from `registry.ts` — never a second hand-maintained zone list (exactly the rule prompt NN+3 already established for the banner; this map is the same principle, more visually elaborate).
- Design-system compliant: light mode only, single accent `#2563EB`, WCAG AA, no new animation categories beyond what Status Pulse already allows (a hover/focus state on a map region is fine; nothing beyond that).
- Each zone: `live` → clickable, navigates to its `url`. `prebuilt` → visibly present (so the ambition is legible — "Florida: coming soon" style) but not clickable and never linking to a `null` url. No vaporware banners, no vaporware map pins either — same rule, same reasoning.
- Mobile-first: this page will get more first-time traffic than any other Vigil surface if the hub concept works. Test at 400px width before anything else.
- Static-generation friendly: this page's content (the registry) doesn't change per-request, so it should be fully static/ISR, not `force-dynamic` — the hub's whole value proposition is being fast and cheap to serve.

### 3. Venezuela subdomain cutover

Sequencing matters here — never flip root DNS before the new subdomain is proven:

1. Add `venezuela.vigil.youthewave.org` as an additional domain on the existing "vigil" Vercel project (same deployment Venezuela already runs), pointed at the same `main` branch. At this point `vigil.youthewave.org` and `venezuela.vigil.youthewave.org` both serve the identical VE app — no cutover yet, purely additive.
2. Update Supabase Auth (VE's project, `macmlvybpxdnzfviimvl`) → **Authentication → URL Configuration**: add `https://venezuela.vigil.youthewave.org/auth/callback` to Redirect URLs *before* cutover, so magic-link login keeps working through the transition. Do not remove the old `vigil.youthewave.org` callback until the redirect window (below) closes.
3. Confirm the new subdomain end-to-end: map tiles, Realtime, photo upload, missing-person submit, login — the full `securityheaders.com`-style smoke pass, on `venezuela.vigil.youthewave.org` specifically.
4. Only then: point `vigil.youthewave.org` root at the **hub** deployment instead of the VE app, and add a redirect so any path beyond the bare root forwards to the matching Venezuela path — e.g. `vigil.youthewave.org/buscar` → `venezuela.vigil.youthewave.org/buscar` (Vercel `redirects()` in `next.config.js` on the hub project, or a Cloudflare Redirect Rule if simpler to manage centrally; pick one, don't split the logic across both). 301, not 302 — this is a permanent restructuring, not a temporary detour.
5. Keep the redirect live for a stated window (suggest 90 days minimum, given flyers/word-of-mouth don't update on a schedule) before considering removing it. There is no cost to leaving it indefinitely if traffic through it stays near zero — removing it should be a deliberate future decision, not a cleanup default.

### 4. Registry + banner updates

- `registry.ts`: Venezuela's entry gets `url: 'https://venezuela.vigil.youthewave.org'` (was the root domain). `CURRENT_DEPLOYMENT_ID` stays `'venezuela'` for the VE deployment's own build; the hub build doesn't have a "current deployment" at all (it's not a zone).
- `DeploymentSuggestion` banner logic is unaffected in shape — it still compares a visitor's matched zone against `CURRENT_DEPLOYMENT_ID` and only fires on a *different, live* match. Verify it still no-ops correctly when someone is already on `venezuela.vigil.youthewave.org` from a VE IP.
- Footer "Otras regiones" link (prompt NN+3) now points at the hub's root instead of an in-app `/regiones` route, since the hub *is* `/regiones` evolved — from any given zone, "other regions" means "leave this zone's app and go to the router."

---

## Non-goals

- No Neon / database migration — a separate, unrelated initiative (see 2026-09-12 conversation; Neon is being evaluated for *future new zones' own databases*, not as part of this restructuring, and never for Venezuela's live data as part of this prompt).
- No Florida public launch. Florida's subdomain wiring here is the same `prebuilt` map-pin treatment every other non-live zone gets — this prompt does not change Florida's launch-readiness gates (`TODO-BEFORE-LAUNCH.md`).
- No redesign of any in-zone app (Venezuela's or Florida's own pages/nav/features) beyond the domain they're served from.
- No changes to Cloudflare's gray-cloud (DNS-only) posture — the hub and every subdomain stay DNS-only, matching the standing rule for this zone, unless a specific orange-cloud (proxied) need is identified and confirmed separately.

## Acceptance criteria

- [ ] Hub loads at `vigil.youthewave.org` root, renders the Americas map from `DEPLOYMENTS`, zero Supabase calls, passes Lighthouse ≥ 95 accessibility, works at 400px width
- [ ] Clicking a `live` zone navigates to its subdomain; `prebuilt` zones are visible but not clickable, no dead links
- [ ] `venezuela.vigil.youthewave.org` fully functional: map, Realtime, photo upload, missing-person submit/search, login — verified before any root DNS change
- [ ] Supabase Auth redirect URLs include the new subdomain before cutover
- [ ] `vigil.youthewave.org/<any-existing-path>` 301s to the matching `venezuela.vigil.youthewave.org/<path>`
- [ ] Restore tag created before DNS changes begin
- [ ] `registry.ts` and `DeploymentSuggestion` banner verified against both the old and new Venezuela URL during the transition (no self-suggesting-itself bug)

---

## MANUAL TASKS — Orlando only (dashboard/DNS actions no agent can do)

1. Cloudflare DNS: add `venezuela` CNAME (gray-cloud) pointing at the same Vercel target the root currently uses.
2. Vercel: add `venezuela.vigil.youthewave.org` as a domain on the existing "vigil" project.
3. Supabase (VE project `macmlvybpxdnzfviimvl`) → Authentication → URL Configuration: add the new subdomain's `/auth/callback` to Redirect URLs.
4. After the new subdomain is verified end-to-end (see Acceptance criteria): Cloudflare DNS — repoint root `vigil.youthewave.org` at the hub deployment's Vercel target; Vercel — assign the hub project as the root domain's target.
5. Lower the root domain's DNS TTL a day or two *before* the cutover step, so a rollback (if needed) propagates fast; raise it back to normal after the cutover is confirmed stable.
6. Decide the hub's Vercel project: new dedicated project, or a `deploy/hub` branch on the existing "vigil" project (mirrors how `deploy/florida` works today). Either is fine; pick based on whether you want the hub's env vars/analytics fully separated from the zone apps' — recommend a dedicated project for the cleaner separation, since the hub has effectively zero env-var overlap with any zone (no Supabase at all).

---

*Pair with `docs/architecture/DEPLOYMENT-PLAYBOOK.md`, `src/config/deployments/registry.ts`, `src/config/deployments/TODO-BEFORE-LAUNCH.md`. Live codebase overrides this document wherever they conflict.*
