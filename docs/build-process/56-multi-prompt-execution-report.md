# 56 — Multi-Prompt Execution Report (docs 52–55)

**Date:** 2026-07-07 · **Executed by:** Claude Code, single session
**Commits:** `b6df31c` `e9cac95` `9af2603` `f762f2e` `1529081` (+ this archive commit)

All five root prompt files checked against the repo — none were implemented —
then executed. Status per prompt:

## ✅ Archetype config foundation (pkg prompt 1) — `b6df31c`
Types (`DisasterArchetype`/`FeedConfig`/`NotificationConfig`), Venezuela config
extended (behavior identical), USGS/GDACS/ReliefWeb consumers read through
`getDataFeed()`. FUNVISIS listed `enabled:false` (HTML-only, documented gap).

## ✅ Preparación knowledge hub (pkg prompt 2) — `1529081`
`/preparacion` + 3 guides (earthquake/hurricane/flood) ES+EN handcrafted, zod
build-gate, sources rendered, Triángulo-de-vida debunk, context chips, family
plan + checklist (localStorage-only), print CSS, CacheFirst offline, assistant
routing via cacheable index, nav + always-visible in every mode.
**Human gate open:** Orlando must review every `critical:true` string (ES+EN)
— content is adapted from Ready.gov/FEMA/NWS/Red Cross but the review gate is
policy. Other locales fall back to ES until reviewed translations ship.

## ✅ Florida hurricane template (pkg prompt 3) — `f762f2e`
NWS/NHC/USGS-Water adapters (typed, graceful, official tiers mirrored),
fixture tests (`node scripts/test-feeds.mjs` — ALL PASS; NHC quiet at build
time so a documented synthetic fixture exercises the parser, EP-basin asserted),
map layers gated behind archetype flag (Venezuela never renders them),
`florida.config.ts` + `TODO-BEFORE-LAUNCH.md`. NOT deployed — by design.

## ✅ Geo deployment suggestion (pkg prompt 4) — `9af2603`
Registry + Vercel geo headers (server component — Cloudflare gray-cloud means
no CF-IPCountry), banner only for live non-current matches, dismissal
persisted, `/regiones` picker + privacy note, footer link. No cookies/GPS/storage.

## ✅ Security hardening (pkg prompt 5) — `9af2603`
Headers + CSP existed (Cursor, docs 47-51); added HSTS, DTV photo CDN +
GDACS origins, worker-src, report-uri → `/api/csp-report` (console sink),
nightly encrypted backup workflow (`db-backup.yml`, age-encrypted → private
vigil-backups repo, 30-day retention, failure→issue). `dependabot.yml` +
CodeQL were already present.
**Note:** CSP was already ENFORCED in production (not report-only) — kept
enforced; the report sink now gives visibility that was missing.

## ✅ Vigil Watch (doc 53) — `9af2603`
`watch.config.ts` (7 regions, exact spec values), `/api/watch/scan`
(CRON_SECRET-guarded), NHC+GDACS+USGS pollers, `vigil_watch_state` dedupe
(**migration applied to production Supabase**), Resend digest (silent when
quiet), GH Action trigger every 30 min.

## ✅ Mexico Pacific config (doc 54) — `f762f2e`
`mexico-pacific.config.ts` pre-build. NHC EP-basin confirmed unfiltered
(fixture-asserted). SMN/CENAPRED omitted — no structured feeds (documented,
re-verify at launch). Mexico-specific government-data stance written into the
config + TODO (official agencies = legitimate partners; PII never shared
without owner consent). Nothing provisioned.

## ✅ Ops cost + map audit (doc 55) — `e9cac95` + `b6df31c`
**A (cost):** prompt-caching structure (assistant stable-prefix split,
photo-search instruction-before-image, dedup instruction block),
`ANTHROPIC_BASE_URL` plumbing for AI Gateway. Found already-satisfied: explicit
conservative `max_tokens` on all 8 call sites, Haiku everywhere except photo
vision, dedup cron already DAILY (stricter than the 6h spec) with
zero-new-records short-circuit. Note: Vercel crons are static config — the
interval cannot be an env var; reverting to hourly during an active event is a
one-line vercel.json change.
**B (map):** USGS rolling 30-day window with crisis-date floor (the real
staleness risk was the fixed June-24 start filling the 300-event cap). All 8
map-subscribed tables verified present in the `supabase_realtime` publication.
Layer trace (2026-07-05 DB counts): needs/resources/shelters starved by
CONTENT (map_markers: 27 hospitals + 3 collection points + 10 other), not by
pipeline; `rescuer_presence` empty = 4h expiry by design. Zero fake data seeded.

---

## MANUAL TASKS — Orlando (nothing above depends on code you don't have)

1. **GitHub secrets** for the two new workflows: `CRON_SECRET` (same value as
   Vercel), `SUPABASE_DB_URL` (session pooler), `BACKUP_AGE_PUBLIC_KEY` (age
   keygen — private key to password manager ONLY), `BACKUP_REPO_TOKEN`
   (fine-grained PAT for vigil-backups). Then run both workflows once manually
   (Actions → run workflow) and confirm green.
2. **Test one backup restore** to a scratch Supabase project; document the
   command in vigil-backups/RESTORE.md. An untested backup is not a backup.
3. **RESEND_API_KEY** in Vercel env — Vigil Watch digests and feedback emails
   are silent without it.
4. **Review `critical:true` preparedness strings** (ES+EN) before promoting
   the hub prominently — emergency numbers and imperative safety actions.
5. **Vercel AI Gateway**: create the gateway, set `ANTHROPIC_BASE_URL` env —
   code path is ready. Also pull the console.anthropic.com usage breakdown
   (spec A0) to baseline spend.
6. **2FA check** on GitHub/Supabase/Vercel/Cloudflare/Anthropic (pkg manual
   task 6 — outranks everything else in that list).
7. Still open from previous sessions: verify the 4 emergency numbers
   (`verified:false` in crisis.config.ts), Web Push + admin moderation queue
   (deferred backlog), `privacidad` TODO (YouTheWave Inc. line).
