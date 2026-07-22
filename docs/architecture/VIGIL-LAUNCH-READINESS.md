# VIGIL — DTV Listing Launch Readiness

> Living checklist. Canonical path: `docs/architecture/VIGIL-LAUNCH-READINESS.md`. Root stub removed 2026-07-21.
## Audit, gap list, and three-way work split
### July 2026 — Orlando Toro x Claude

**Trigger event:** Desaparecidos Terremoto Venezuela is adding Vigil to its `/plataformas` directory. DTV holds the largest citizen missing-persons dataset from the June 2026 earthquakes and is the most-trafficked citizen platform in the response. The API federation between DTV and Vigil is already live.

**What that means operationally:** referral traffic arrives from a source where the user has *already searched and not found their person*. They are Spanish-speaking, mobile, on a degraded connection, emotionally acute, and arriving mid-funnel. They will implicitly compare Vigil to DTV within about eight seconds.

**Therefore this document is not a feature backlog.** It is a launch checklist. Everything is ordered by *what breaks first under traffic*, not by what would be most interesting to build.

---

## PART 0 — THE THREE THINGS THAT ACTUALLY DECIDE THIS

Everything else in this document is secondary to these.

### 0.1 — Cost circuit breaker on the AI endpoints
**Severity: critical. [SHIPPED 2026-07-21 prompt 61].** Remaining Orlando ops: Vercel AI Gateway / Anthropic credits.

Vigil's AI assistant loads live Supabase data on every request, and photo search invokes Sonnet Vision. There is a $50 hard cap in the Anthropic console. A referral spike from DTV — where every arriving user is *specifically* there to search for a person, which is the exact path that triggers photo search — can exhaust that cap in hours.

When the cap is hit, the AI assistant does not degrade gracefully. It fails. For everyone. Silently. During the traffic event that was supposed to be the platform's proof point.

Required before listing goes live:
- Per-IP-hash rate limit on `/api/assistant` and the photo-search endpoint, tighter than the existing 5/hour submission limit
- A spend-aware circuit breaker: when a configurable request-count threshold is crossed, AI features return an honest degraded state ("La búsqueda por foto no está disponible en este momento — usa la búsqueda por nombre") rather than an error
- Name/text search must remain fully functional with zero AI dependency, so the core function survives the breaker tripping
- Vercel AI Gateway with `ANTHROPIC_BASE_URL` for per-request cost visibility (already on the roadmap — this is what makes it urgent)

### 0.2 — Infrastructure tier headroom
**Severity: critical. Unverified.**

Vigil runs on Vercel Hobby and Supabase free tier. Both have bandwidth, function-execution, and connection ceilings that a referral spike can hit. Hobby tier in particular is not built for a traffic event.

The Vercel and Supabase sponsorship letters have been drafted since the V2 outreach round and **have never been sent.** They are the two most directly relevant asks in the entire outreach tracker to what is about to happen, and they are sitting unsent.

Send both today. Add one sentence to each that did not exist when they were drafted: *Vigil is being added to the referral network of the largest citizen missing-persons platform in the Venezuela response, and expects a significant traffic increase.* That sentence converts a generic sponsorship ask into a time-bound operational one, which is a materially different email to receive.

### 0.3 — Admin capacity
**Severity: critical. This is your own stated go/no-go gate.**

`VIGIL-DEPLOYMENT-PLAYBOOK.md`, Section 3, states the rule plainly: every deployment needs an active local admin approving organizations, moderating flags, and verifying that collection points haven't gone stale — and that an unmoderated deployment publishing unverified content is worse than no deployment.

That gate was written about *future* deployments. It applies to this moment, to the Venezuela deployment, right now. A traffic spike means submission volume, moderation queue volume, and flag volume, all landing on one person who has a full-time day job.

This does not block the listing. It does mean:
- The moderation queue needs a volume alert, not just a queue
- Auto-approval thresholds need reviewing before volume arrives, not during
- Rate limits are your moderation capacity control, not just your abuse control — tune them with that in mind
- The Data-Access Volunteer framework in `YOUTHEWAVE-COLLABORATOR-GUIDE.md` exists precisely for this. One trusted person with a signed Volunteer Agreement + Data Access Addendum is worth more right now than two more board directors.

---

## PART 1 — SAFETY: FIX BEFORE ANYTHING ELSE

### 1.1 — The emergency number contradiction
**Severity: physical safety. [SHIPPED 2026-07-21 prompts 60 + 64]** Footer/header use 911; former uncorroborated rescue-coordination line removed globally under the two-source rule.

### 1.2 — Emergency directory completeness
**[SHIPPED 2026-07-21 prompt 64]** National lines (911, PC 0800-PCIVIL1, 166, 167, Cruz Roja, FUNVISIS, TAP), `service_type`, state selector defaulting to La Guaira, bad-number reporting. Orlando should still spot-check against live org channels when able.

### 1.2b — Data provenance and statistics
**[SHIPPED 2026-07-21 prompt 63]** Sourced figures table, staleness rules, live DTV person-search metrics with field-semantic labels, dual epicenters, electricity 90%.

### 1.2c — Press page
**[SHIPPED 2026-07-21 prompt 65]** `/prensa` enhanced with boilerplate copy, provenance fact sheet, kit ZIP, coverage section hidden while empty.

### 1.2d — Live data freshness + content expiry + Vigil Watch
**[SHIPPED 2026-07-22 prompts 67 → 66 → 68]** Aftershock banner uses rolling 7d USGS (was crisis-pinned cumulative "20"); feed_health + stale markers; `/como-ayudar` expiry/suppress; `/monitor` global hazard relay with kill switch. Orlando: apply migrations `016_feed_health` + `017_hazard_events`.

### 1.3 — Minors protection policy
**Gap. Vigil has no equivalent page.**

DTV publishes a dedicated *Protección de Menores* page and, per its API terms, excludes minor-differentiated data from federated responses by default.

Vigil publishes a public missing-persons board that includes children, and is about to receive referral traffic from a platform that has formalized this and will be linking to you. The absence is now visible.

This is a policy page plus a data rule, not a feature:
- Published `/proteccion-de-menores` page stating how records involving minors are handled
- Records for minors carry reduced public field exposure by default
- Explicit statement that Vigil does not surface minor-differentiated data through any export or federation endpoint

---

## PART 2 — THE ARRIVING-USER EXPERIENCE

This is where the listing succeeds or wastes itself.

### 2.1 — Zero-state counters
**[SHIPPED 2026-07-21 prompt 62].** Rule: non-zero or not rendered; CTA empty states applied.

`/evaluacion-estructural` currently displays **0 propiedades evaluadas esta semana** and **0 profesionales voluntarios activos.**

A user arriving from DTV — which displays live operational counters — hits a page announcing that nothing has happened and nobody is here. That is worse than showing no number at all.

Rule to apply across every surface: a counter either shows a real non-zero number or it is not rendered. Audit every page for this, not just the one I could verify.

### 2.2 — Referral landing behavior
**New build.**

Traffic from DTV has a known intent: this person searched for someone and did not find them. Vigil should recognize the referrer and adapt.

- Detect DTV referrer, show a brief contextual line acknowledging where they came from and what Vigil adds that DTV doesn't (geographic breakdown by estado/municipio/parroquia, resource exchange, crisis map, 8 languages)
- Route them toward `/buscar` directly, not the marketing surface
- Reciprocity: your `/red` page must list DTV prominently and accurately, with the federation relationship described honestly

### 2.3 — Zero-result recovery
**Unverified — check `/buscar` yourself.**

The single most common outcome for an arriving DTV user is a search that returns nothing. The Bible notes that "Sin resultados" surfaces sister-platform links and a report button. Confirm that is still live and that DTV is in that list. This state is now the highest-traffic emotional moment on the platform and deserves the most careful copy on the site.

### 2.4 — Client-side image compression
**Gap. Directly copied from Yummy's implementation, and it's the right call.**

Yummy compresses photos and video on the device before upload, explicitly so submissions succeed on weak signal. Vigil accepts photo uploads for missing-persons reports, structural assessment, and photo search — all from people on degraded connections, all currently uploading at full size.

This is the highest ratio of user-visible reliability to engineering effort on the entire list. It applies to every upload path.

### 2.5 — Submission receipt
**Unverified.**

Yummy issues a tracking code on submit. Vigil has claim tokens, which are architecturally better — but the confirmation experience has to *say so* clearly. A person who submits a missing-persons report and isn't certain it landed will submit it again, which is exactly what the hourly dedup cron then has to clean up.

---

## PART 3 — THE ONE REAL FEATURE GAP

### 3.1 — Needs coverage lifecycle
**Verified gap. Highest-value single addition.**

`mapadenecesidadesvzla.com` is the smallest platform of the four and holds the only idea Vigil doesn't have. Their thesis: the failure in a disaster response is not insufficient generosity, it is maldistribution — one community receives tons of supplies while a shelter a few kilometers away has no water.

Their mechanism: every need carries a coverage state, and collection centers (not the platform) are the verifying authority.

- **Crítico** — nobody has arrived
- **Parcial** — help arrived, still far short
- **Cubierto** — do not send more

Vigil's `/necesito-ayuda` posts a category, description, map pin, and an URGENTE boolean. There is no coverage state and no closure path. Needs enter the map and never leave. Eight weeks into a crisis, that means the map is accumulating stale demand — and a volunteer driving to a satisfied pin is a worse outcome than an empty map.

Implementation is small because the trust layer already exists:
- One enum column on the needs record: `coverage_state`
- Transition authority granted to approved organizations and registered collection points — you already have `approved_by_admin` and the Punto de Acopio registry
- Auto-decay to a "needs reconfirmation" state after N days without update, so the map self-cleans
- Colors map onto existing status semantics with no design-system change: `#DC2626` / `#D97706` / `#16A34A`

---

## PART 4 — SECONDARY BUILDS (after listing is live and stable)

### 4.1 — Citizen structural damage report
Vigil's `/evaluacion-estructural` is a *request for professional inspection* — ATC-20, volunteer engineers, AI restricted to queue prioritization and never tag assignment. That constraint is correct and permanent.

But it is the narrow end of the funnel with no supply side attached (0 professionals active). Yummy built the wide end: a two-minute citizen damage report with structure type, a four-level damage scale (leve / moderado / severo / colapso), multi-photo and video, and GPS.

These are complementary. The citizen report populates the map immediately with zero engineers signed up, and feeds the professional queue when engineers do arrive.

**Constraint:** Yummy includes a "people trapped or at immediate risk" checkbox that escalates priority. Vigil must not replicate this as-is. Vigil is not a dispatcher, and its own ToS says so. If included, checking that box must open a blocking 911 interstitial before the form will submit, and the resulting record is flagged for map priority only — never routed as a rescue request.

### 4.2 — Diaspora collection points
`centrosayudavenezuela.org` runs 264 centers across 88 cities in 17 countries, publishes a reduced-field CSV export, and offers site integration on request (info@centrosayudavenezuela.org).

Vigil structurally cannot hold any of this: coordinate validation rejects submissions outside Venezuela bounds at the API layer. That rule is correct for missing-persons and needs records and wrong for collection points, which are inherently diaspora-distributed.

Required: a scoped bounds exception where collection points carry their own geographic policy while every other record type keeps the hard Venezuela lock. This unlocks a category Vigil currently cannot serve at all, and it is the category most relevant to the Miami/Doral audience.

Also worth adopting: their editorial honesty. They tell users plainly that overseas collection centers face brutal logistics and that money to organizations on the ground moves faster, then link four vetted ones (Cáritas Venezuela, Save the Children, World Central Kitchen, Alimenta la Solidaridad). That advice costs them engagement and serves the beneficiary. It belongs on `/como-ayudar`.

### 4.3 — FUNVISIS per-record source labeling
Yummy supplements USGS with FUNVISIS for local micro-aftershocks that USGS does not catalog, and labels every record with its source. They are showing roughly 20 local events in 24 hours against a much smaller USGS count.

Vigil's header currently reads "20 réplicas M4.0+" — a USGS-only threshold that under-reports what people are physically feeling, which erodes trust in the seismic layer specifically among users who just felt something the site doesn't show.

You already have the FUNVISIS proxy. The addition is per-record source attribution — the same discipline already applied to DTV data attribution.

---

## PART 5 — INITIATIVE BOUNDARY CHECK

You asked whether the initiative list is complete and what needs to move out of Vigil.

**Currently documented:** Vigil (live), Nova / homeschool tutoring (in progress), and three backlog candidates — food distribution, sexual education, civic values education.

**Nothing currently inside Vigil needs to move out.** `/preparacion`, `/conectividad`, and the resource exchange are all crisis-scoped and correctly placed.

**One new candidate surfaced from this research: psychosocial support.**

DTV is standing up `redapoyoemocional.com` — explicitly framed around the fact that searching for someone carries its own psychological weight. Vigil has nothing in this space.

Recommendation, and I'd defend this one hard: **do not build it into Vigil.** Vigil links out to it and to Venezuelan mental-health resources, and that is the whole of Vigil's involvement. Reasons: DTV is already occupying it and competing with a federation partner is strategically incoherent; a psychosocial support service carries duty-of-care and clinical-liability exposure categorically different from anything Vigil currently holds; and it fails the scoping rule — it is a separate problem requiring separate expertise.

If YouTheWave wants that space later, it goes through the same discipline as everything else: its own name, own scope, own MVP, own pitch. Log it as backlog candidate #4. Do not let it enter Vigil through the side door as a "support resources" feature that grows.

**Watch item:** the resource exchange and collection-point work is the most likely thing in Vigil to drift toward becoming a general food-distribution product. It is crisis-scoped. Keep it there.

---

## PART 6 — WORK SPLIT

### ORLANDO — only you can do these

**Today, before anything ships:**
1. Verify the emergency numbers in 1.1 and 1.2 against an official source. This is the physical-safety gate and it cannot be delegated to me or to Fable.
2. Send the Vercel sponsorship letter with the traffic-event sentence added.
3. Send the Supabase sponsorship letter, same addition.
4. Send the Anthropic humanitarian credits letter — this is the cost-risk mitigation and it has been drafted and unsent since the V2 round.
5. ~~Confirm former rescue-coordination line~~ → **removed globally** (prompt 64, two-source rule).

**This week:**
6. Enable 2FA on GitHub, Vercel, Supabase, Cloudflare, Anthropic. Before the traffic, not after. A public humanitarian platform about to get attention is a target.
7. Decide the Cloudflare proxy question. The `vigil` CNAME is DNS-only (gray cloud), which means Galileo protection exists at zone level but Cloudflare is not actually proxying, caching, or DDoS-filtering the crisis surface itself. The original reasoning — that proxying breaks Vercel's SSL — is solvable with Full (strict) SSL mode, but it needs deliberate testing, not a flip during a traffic event. Decide now: either test and enable it this week, or consciously accept unproxied for this launch.
8. Supply DTV with the listing copy for Vigil's entry in `/plataformas`. Do not let them write it. I'll draft it — you approve and send.
9. Complete the db-backup secrets: `SUPABASE_DB_URL` (session pooler), `BACKUP_AGE_PUBLIC_KEY`, `BACKUP_REPO_TOKEN`. A traffic event is the wrong time to have no verified backup.
10. Set `RESEND_API_KEY` in Vercel.
11. Human-review every `critical: true` string in `es.json` and `en.json`.

**Explicitly NOT on this critical path:**
Board recruitment. It remains the bottleneck for 501(c)(3) and every grant, and it is genuinely important — but it blocks nothing about this launch. Do not let it absorb the next two weeks.

### CLAUDE — I'll produce these

1. Vigil's listing blurb for DTV's `/plataformas` directory — positioning that differentiates from DTV rather than duplicating it
2. Updated Vercel, Supabase, and Anthropic letters with the traffic-event framing
3. Spanish copy for the DTV referral landing state
4. Spanish copy for the zero-result recovery state
5. `/prensa` page refresh — inbound traffic brings journalists, and the press page is currently untested for that
6. `/proteccion-de-menores` policy page draft
7. Numbered prompt files in `docs/build-process/` for every Fable item below
8. Revised `/como-ayudar` section carrying the honest overseas-logistics guidance

### FABLE / CURSOR — code, in this order

**P0 — before the listing goes live:**
- ~~`60-emergency-number-consistency.md`~~ — DONE 2026-07-21 (footer/header 911; Part C still gated on Orlando)
- ~~`61-ai-cost-circuit-breaker.md`~~ — DONE 2026-07-21
- ~~`62-zero-state-counters.md`~~ — DONE 2026-07-21

**P1 — launch week:**
- `NN-needs-coverage-lifecycle.md` — enum, transition authority, auto-decay, map colors
- `NN-dtv-referral-landing.md` — referrer detection, contextual message, routing to `/buscar`
- `NN-client-side-image-compression.md` — all upload paths
- `NN-zero-result-recovery.md` — copy plus DTV placement in the empty state

**P2 — after stable:**
- `NN-citizen-damage-report.md` — four-level scale, multi-upload, 911 interstitial constraint
- `NN-collection-point-bounds-exception.md` — scoped geographic policy per record type
- `NN-funvisis-source-labeling.md` — per-record attribution
- `NN-minors-protection.md` — policy page plus reduced field exposure

Standing rule reminder: anything touching `src/lib/security/`, auth, RLS, contact-info handling, or sanitization routes through a PR so CodeQL and Copilot review run before merge. The circuit breaker and the bounds exception both qualify.

---

## PART 7 — WHAT NOT TO BUILD

**No facial recognition.** DTV does biometric matching; Vigil's Claude Vision text-description approach is a deliberate privacy position. DTV's own API terms carve biometrics out of what they will federate — which tells you they treat it as liability, not asset. This is a differentiator. Do not re-litigate it.

**No donations portal.** Yummy runs one with a corporate match; DTV accepts operational donations. YouTheWave is pre-incorporation and pre-FDACS. Soliciting from a Florida address before that registration exists is a Chapter 496 problem, not a product decision. Hard no until the determination letter.

**No telemedicine, rides, or logistics layer.** That is Yummy's actual business and they have drivers. You would be building a worse version of someone's core competency.

**No psychosocial support service.** See Part 5.

---

## VERIFY YOURSELF — pages I could not fetch

The fetcher blocked further requests to your domain partway through this audit. Check these and tell me what you find:

- `/red` — is DTV listed, and does the copy describe the live federation accurately?
- `/estadisticas` — are the numbers current, and is the DTV-sourced figure attributed to the federated network rather than claimed as Vigil's own?
- `/informacion` — emergency directory completeness against the table in 1.2
- `/buscar` — zero-result state, and whether federated DTV records carry a visible provenance badge
- `/ayuda` — does it orient a first-time arriving user in under ten seconds?
- `/prensa` — is it ready for a journalist who arrives cold?
- `/punto-de-acopio` — how many are actually live, and are any stale?
- `/regiones` — what does it currently promise?

---

*Standing reference — pair with VIGIL-BIBLE.md, VIGIL-DEPLOYMENT-PLAYBOOK.md, and YOUTHEWAVE-OUTREACH-TRACKER.md*
*vigil.youthewave.org · "We stand watch when it matters most."*

