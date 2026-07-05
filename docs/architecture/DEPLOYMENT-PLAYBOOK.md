# Vigil — New Deployment Playbook
## How to ship Vigil to a new country or crisis without forking
### Draft v1 — July 2026 — Orlando Toro x Claude

This doesn't introduce new architecture. It assembles decisions already made across [`sops.md`](../reference/sops.md), [`VIGIL-COMPLETE-GUIDE.md`](../reference/VIGIL-COMPLETE-GUIDE.md), and [`CLAUDE.md`](./CLAUDE.md) into one document you actually run from when a new disaster hits, instead of reconstructing the plan from memory under time pressure. A dedicated expansion roadmap doc is planned; Section 6 includes the archetype feed lookup table inline.

---

## 1. The standing decision: one repo, many deployments — never a fork

Every future Vigil deployment (new country, new disaster archetype, or both) is: the same GitHub repo, a new `crisis.config.ts` values set, a new Supabase project, and either a new Vercel project or a new subdomain pointed at a shared one. Not a fork.

Why this holds even under pressure to move fast: a fork means every bug fix and every feature built for one country has to be manually ported to every other one. You are one person directing AI agents for execution — that maintenance model breaks at the second deployment, not the tenth. The config-driven model means the mode picker, DTV-style federation patterns, the help center, and every future fix ship to all active deployments through normal git history.

**Why separate Supabase projects per deployment, not one shared multi-tenant database:** data isolation. Different countries carry different privacy-law contexts and different sensitivity levels for the same field (a phone number tied to a missing-persons report is legally and ethically different in different jurisdictions). A schema bug or RLS misconfiguration in one deployment should never be able to touch another country's data. This is the same logic already applied inside Vigil for contact info — extended one level up, to entire deployments.

---

## 2. Pre-launch checklist (infrastructure)

Run in this order:

1. **New Supabase project.** Apply migrations **001–012** in order (see [`data-model.md`](../reference/data-model.md) for the current list). Don't inherit Venezuela's data — this is a clean project.
2. **New Vercel project**, or a new subdomain on the existing one if the disaster is small-scale/short-lived enough not to warrant fully separate infra (judgment call, not a hard rule — a Tier 3 reactive deployment might start as a subdomain and get promoted to its own project if it becomes long-running).
3. **DNS + Supabase Auth Site URL** updated to match.
4. **Env vars**: same variable names as Venezuela (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `VIGIL_ADMIN_EMAILS`, `VIGIL_ADMIN_SECRET`, `ANTHROPIC_API_KEY`, etc.) pointed at the new project. Nothing new to invent here.
5. **`crisis.config.ts`** — set country, bounds, hotlines, legal/operator metadata, `disaster_archetype` (single value or array for compound-risk regions — Florida-style hurricane+flood is the existing example), and `data_feeds` per the archetype table in Section 6 below.
6. **Shipped capabilities to verify** (config/content only — no extra build):
   - **Diaspora / multi-region:** migration `011` adds `region_scope`; configure `diasporaSupportConfig` and bounds if the deployment serves abroad (Venezuela's `/apoyo-usa` is the reference pattern).
   - **Collection-point sync:** CAV CSV weekly cron and `/api/admin/sync-cav-centers` are available when a partner feed exists — wire cron + admin sync for that region's equivalent, or skip.
   - **Adaptive onboarding:** six view modes, first-visit mode picker, and `/ayuda` help center ship by default — generate and human-review locale strings (Section 4) before go-live.

For Supabase CLI, Vercel env vars, DNS, and Auth URL steps, pair this checklist with [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 3. The go/no-go gate that isn't infrastructure: who administers this

Before any of the above, answer this question: **who is the local admin?** Every deployment needs someone actively approving organizations, moderating flags, verifying collection points haven't gone stale, and reviewing the property-assessment queue — the same ~15-minute daily SOP that already exists for Venezuela. You cannot run that checklist for five simultaneous live crises yourself.

This is not a hypothetical for later — it's the actual constraint on how many deployments can be live at once, and it's exactly what the existing co-design outreach (NetHope, IFRC, Florida VOAD) is *for*: a field-partner organization isn't just a source of legitimacy, they're a candidate to own the daily admin role for their region's deployment. If there's no local admin identified, don't launch — an unmoderated Vigil deployment publishing unverified collection points and unapproved organizations is worse than no deployment at all, same principle already enforced on stale seed data.

---

## 4. Language decision

The 8 existing locales (ES, EN, PT, FR, IT, ZH, DE, RU) cover a meaningful chunk of Tier 1/2 regions already, but not all of them — Bangladesh needs Bengali, the Philippines needs Tagalog, Turkey needs Turkish, Indonesia needs Bahasa. None of those exist yet.

Adding one is not a rebuild: `scripts/generate-translations.mjs` already generates locale files via Claude Haiku from the source content. Point it at the new target language, generate, then **human-review the safety-critical strings before shipping** — emergency numbers, hotline instructions, consent language, and anything in the psychosocial-support section. Machine translation is fine for FAQ copy; it is not fine for the one sentence someone in crisis relies on to know where to call. This mirrors the exact standard already applied to the emergency-numbers verification flag from the current Venezuela build — don't lower the bar for a new language just because it's new.

---

## 5. What does NOT carry over automatically: the government-data policy

Vigil's "never share data with the Venezuelan government" commitment is a **policy decision specific to that government's documented conduct** (VenApp repurposed for surveillance, civil-society collection points obstructed) — it is not a universal rule that silently applies to every future deployment. A U.S. hurricane deployment, for instance, might reasonably list a county emergency management office as a legitimate resource — something that would be unthinkable for Venezuela's national government in this crisis.

**Every new deployment needs its own explicit government-data policy stance, decided deliberately, not inherited by default.** Write it into that deployment's privacy policy the same way Venezuela's was written — as a considered position with a stated reason, not a copy-pasted clause.

---

## 6. Data feeds by archetype — quick reference

Lookup table for fast setup (full expansion specs are planned as a separate roadmap doc):

| Archetype | Primary feeds |
|---|---|
| Earthquake | USGS, GDACS, local seismological service if one exists (Venezuela's case: FUNVISIS via a third-party structured proxy, since FUNVISIS itself has no public API — verify this per-country, don't assume every national seismological agency has clean data either) |
| Hurricane / tropical cyclone | NWS `api.weather.gov`, NHC GIS (forecast cone, storm surge) |
| Tornado | NWS tornado warning polygons, SPC convective outlooks |
| Flood | USGS Water Services, NWS river flood warnings |
| Wildfire | NASA FIRMS, AirNow |
| Volcanic / tsunami | GDACS baseline; region-specific ashfall/wave-arrival feeds only if pursued (Tier 2, trigger-built not pre-built) |

**Standing lesson from this Venezuela build, apply proactively next time:** before wiring any government or quasi-official data source, check whether it actually exposes a structured feed (JSON/XML/REST) or is just an HTML page. FUNVISIS looked official and citable but had no usable API — confirm this for every new country's equivalent agency *before* specing integration work, not after Cursor hits the wall.

---

## 7. What never changes per deployment

Design system (light mode, single accent, Inter/Geist, WCAG AA, Status Pulse as the only animation), the privacy architecture (contact info never public, claim-token model, federated-not-copied partner data), and the core codebase. A new deployment changes configuration and content — it does not get a redesign or a rearchitecture. If a future country's context seems to demand a structural change to the core app rather than a config value, that's a signal to stop and re-spec deliberately, not to quietly fork.

---

*Standing reference — pair with [`CLAUDE.md`](./CLAUDE.md) (agent constraints), [`VIGIL-COMPLETE-GUIDE.md`](../reference/VIGIL-COMPLETE-GUIDE.md), [`sops.md`](../reference/sops.md), and [`DEPLOYMENT.md`](./DEPLOYMENT.md) (infra setup).*
