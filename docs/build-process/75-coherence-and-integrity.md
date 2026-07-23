# 75 — Coherence & Data Integrity

**Runs after 74.** Do not start until 74 is committed to `docs/build-process/` and merged.
**Two items here are outreach-blocking** (§1 and §2). Everything else is coherence cleanup from your own review.

---

## §1 — DTV METRICS: ONE ROOT CAUSE, FOUR SYMPTOMS 🔴 BLOCKING

**Correction to an earlier read:** `/estadisticas` does eventually render DTV metrics. It just takes between several seconds and a full minute. The "no disponibles" message is a loading fallback that stays visible long enough to look like a failure.

**Root cause: Vigil is enumerating the entire DTV dataset to compute aggregates.** It fetches records until it hits a limit, then derives every displayed statistic from that array. This single defect produces all four symptoms below.

### Evidence

Live at 2026-07-22 ~20:45–20:59 Caracas, `/estadisticas`:

- Personas en red DTV **25.000** — labeled "Registros federados (GET /personas)"
- Aún sin contacto **20.404** (API: estado = sin-contacto)
- Localizados **4.596** (API: estado = localizado)
- `20.404 + 4.596 = 25.000` exactly

Geographic breakdown, same page: La Guaira 15.624 · Sin estado asignado 8.461 · Miranda 188 · Distrito Capital 132 · Aragua 91 · Carabobo 86 · Zulia 69 · Guárico 53 · Falcón 51 · Sucre 42 · Lara 38 · Trujillo 37. **Sum = 24.872**, leaving ~128 in the unlisted tail.

That is an exact enumeration of 25,000 records. A real dataset does not total a round 25,000. DTV's own dashboard reported ~44,295 unique persons after resolving ~16,701 duplicates.

### Symptom 1a — The headline total is a fetch limit, not a count

Never derive a network-wide total from `array.length`. Inspect the raw `GET /personas` response and report the payload shape: is there a `total` / `count` / pagination envelope? Does it cap at 25,000? If an authoritative total exists, read it. If it does not, paginate to exhaustion or display nothing.

### Symptom 1b — The geographic breakdown inherits the cap and is likely distorted

Every state figure is computed from the same truncated array. If the API returns records in creation order, early-reported regions are structurally over-represented. **La Guaira at 62% may be partly an artifact of when reports were filed, not where people are.**

This is worse than a wrong headline, because it is a wrong *distribution* on the page a federation partner will read most closely. Do not publish the geographic breakdown until the underlying set is known-complete.

### Symptom 1c — Performance

Seconds to a minute is unacceptable on a crisis platform, and far worse on 2G. Fixing the root cause fixes this:

- Do not fetch and enumerate 25,000 records to display five numbers
- Cache the aggregate server-side with a revalidate window matching DTV's stated 5-minute cadence — one fetch serves all visitors, not one fetch per pageview
- `/estadisticas` and `/prensa` must read through a **single shared client**. Duplicate fetch logic per surface is how they came to disagree.
- While loading, render a skeleton that reads as loading, not a fallback message that reads as failure

### Symptom 1d — "Localizados sin centro registrado" is almost certainly a null field, not a finding

The panel currently states: *"De 4.596 personas localizadas en la red DTV, 4.596 (100%) no tienen hospital ni centro de acopio registrado"* — and attaches a CTA to report a sighting.

Exactly 100.0% with zero exceptions is far more likely to mean the field is unmapped, or that DTV does not populate it, than that every located person genuinely lacks a registered center. **Verify against the raw payload.** If the field is universally absent, the honest statement is "DTV does not publish this field," and the panel must be removed — not reworded. Do not build a user-facing prompt on top of an unpopulated column.

### Required guard

If a federated total is an exact round number **and** its sub-figures sum to it precisely, log a warning and suppress rather than publish. That heuristic would have caught this before it shipped.

Label semantics stay distinct throughout: reportes ≠ personas únicas ≠ sin contacto. Never relabel to make numbers agree.

### Constraint

If the true figures cannot be established with confidence, render the unavailable state on **both** surfaces. Publishing a wrong number attributed to a federation partner is worse than publishing none. This blocks outreach to DTV's technical lead — do not mark it done without evidence.

### Report

1. Raw `GET /personas` payload shape. Is 25.000 a cap? Yes or no.
2. Is there an aggregate or count endpoint that avoids enumeration entirely?
3. Is the `centro` / `hospital` field present and null, or absent from the schema?
4. Load time for `/estadisticas` before and after caching.

**Escalation note for Orlando:** if DTV exposes no aggregate endpoint, that becomes an agenda item for the call with Jorge — requesting count endpoints benefits every platform federating with them, not just Vigil.

---

## §2 — PRESS KIT PDF REGENERATION 🔴 BLOCKING

The kit at `/api/press-kit/download` ships four PDFs that are unusable. Diagnosed from the artifact:

- Base-14 Helvetica, **no embedded font, no `/Encoding` dictionary**
- UTF-8 bytes written raw into PDF text strings → `código` renders as `cÃ³digo`, `—` renders as `â`, every accent in Spanish is mangled
- H1 emitted twice per document
- Markdown structure flattened — `## Qué hace` and its bullets collapse into one paragraph with inline ` - ` separators

The `.md` sources are clean, correct UTF-8. **The markdown is fine; the PDF writer is the defect.** Do not patch the encoding — replace the generator.

**Approach — build-time, not runtime:**
1. Render each markdown file to HTML using the existing design system tokens (Geist/Inter, ink `#0F172A`, single blue accent, generous margins, real heading hierarchy, real bullets).
2. Convert HTML → PDF at **build time** via a script in `scripts/`, not in a serverless route. Headless Chromium in a Vercel function is a cold-start and bundle-size cost this does not justify.
3. Commit the output to `public/press-kit/` as static assets.
4. `/api/press-kit/download` zips static files only.

**Requirements:**
- Every accented character correct in ES and EN. Verify by extracting text from the generated PDF and diffing against the source markdown.
- Headings, lists, and links render as structure, not flattened prose.
- No duplicated title.
- Footer on each page: `vigil.youthewave.org · Licencia MIT · [fecha de generación]`
- Both `.md` and `.pdf` stay in the ZIP — journalists copy from markdown, editors file the PDF.

**Fallback if this stalls past one session:** ship markdown + HTML only and remove the PDFs. A missing PDF is neutral; a mojibake PDF from a design-led organization is actively damaging. This kit is about to be offered to a partner with 102 publications across 13 countries.

---

## §3 — ORPHANED ROUTES (decisions made, execute as stated)

**`/donaciones` → RETIRE. Do not wire it into navigation.**

This is not a UX call. YouTheWave Inc. is not incorporated, there is no 501(c)(3) determination, and there is no FDACS charitable solicitation registration. A reachable donations page in Florida under those conditions is a compliance exposure.

- Remove from all `viewMode.config.ts` mode route lists (it currently appears in two, which is how config and nav drifted apart)
- Leave the route file in place, returning a redirect or a neutral state
- Add a config comment: retired pending YouTheWave Inc. incorporation + FDACS charitable solicitation registration. Do not re-wire without both.

**`/noticias` →** wire into the "Información" group **only if** it has current content worth reading. If it is stale or empty, delete the route. A stale news page on a crisis platform is worse than no news page. Report which you did and why.

---

## §4 — MENU vs. MODE (decision made)

**The menu sheet is the full site, explicitly labeled as such, with the user's current mode group pinned first.**

Rejected alternative: mode-filtered sheet with a "ver todo" expander. On a crisis platform the cost of hiding a route from someone who already knows what they want exceeds the cost of showing too many.

- Label the sheet so the full-site semantics are stated, not implied
- Pin the active mode's group to the top; the rest follow in current order
- Fix the mode gaps you identified: `soy_organizacion` gets routes to `/muro`, `/estadisticas`, `/punto-de-acopio` — orgs are the audience for all three, and for the coverage authority landing in the lifecycle work
- Resolve `/mis-reportes` handling for `necesito_ayuda` users who filed a need report
- Reconcile `viewMode.config.ts` against `Navigation.tsx` so no route exists in one and not the other. Commit the reconciliation table to the PR.

---

## §5 — i18n PARITY

- Backfill the 7 keys added in commit `53fc70b` (`footer.press`, `howToHelp.usaDiaspora.*`, `howToHelp.collection.gemNote`) across pt, fr, it, de, ru, zh
- Add a **key-parity check to CI** that fails the build when any locale is missing a key present in `es.json`. This is the permanent fix — the backfill alone guarantees recurrence on the next seed commit
- Legal pages stay outside i18n for now. Document as a known limitation in the architecture docs and add a diff-check reminder for the ES/EN pair whenever `legal.tosVersion` bumps. Do not attempt to bring legal text into the i18n system in this prompt.

---

## §6 — REPO HYGIENE

- Move `74-arriving-user-hardening.md` from repo root into `docs/build-process/`
- Resolve the 8 untracked icon files at root: into `public/` and `public/brand/` if they are the shipping brand icons, deleted if they are `scripts/generate-icons.cjs` leftovers. State which.
- **Pattern to fix, not just instances:** prompt files and generated assets are landing at repo root and staying there. Add whatever guard prevents recurrence — `.gitignore` entries for generator output, and prompts written directly to `docs/build-process/`.

---

## §7 — `docs/architecture/CLAUDE.md` REWRITE

Not background work. This is the file every Cursor session reads. It currently describes a 9-route Phase-0 site, references Haiku "3.5", and omits ~30 routes plus the entire `security/`, `dtv/`, `onboarding/`, and view-mode layers.

**It is therefore a cause of the config-vs-nav, docs-vs-code drift this whole review documented, not a symptom of it.** Rewrite it to describe the system that exists, or reduce it to a pointer with `VIGIL-BIBLE.md` named canonical. Fixing this shortens every future review.

Also complete **74 Part A3**: `VIGIL-LAUNCH-READINESS.md` §2.1 still says `[SHIPPED]` above a contradictory "currently displays 0/0" paragraph. Third documented drift in that file. Status markers in that document come from execution reports only.

---

## §8 — CIVIS FINDINGS: WHAT WE'RE TAKING AND WHAT WE'RE NOT

**Already shipped — no work needed.** Global accessibility toggles (A / A+ / A++ / Alto contraste) are live in the header right now, alongside the mode picker and language selector. That recommendation is satisfied.

**Rejected — do not build.**

- **AR overlay of damaged buildings.** Fails the 2G performance budget and helps nobody searching for a missing person. Correctly refused.
- **Homepage government casualty dashboard, CIVIS-style.** Correctly refused — but note the nuance so this isn't "fixed" later: Vigil *does* publish official figures on `/estadisticas`. It publishes them attributed to the issuing body, with Provea, USGS PAGER, ONU, and academic counterpoints stacked directly underneath, plus staleness flags. That is prompt 71's contested-figures policy working as designed, and it is the differentiator against reprinting official numbers uncritically. **Do not remove official figures, and do not promote them to an unqualified homepage dashboard.** The current treatment is correct.

**Deferred — not now.** Marketing the estado/municipio/parroquia granularity on the homepage. It is a real differentiator and it is already named in the 74 Part C referral copy. Homepage promotion waits until the geographic breakdown has enough data to be worth surfacing — `/estadisticas` currently reads "Aún no hay datos geográficos suficientes."

---

## §9 — QUEUE RENUMBERED

Minors protection is promoted, but **not for the reason given in the review.** The framing was "DTV publishes one and links to you, so the absence is visible." That is the weakest argument for it.

The real one: Vigil is a public missing-persons platform with unauthenticated search, and records of minors are precisely what gets harvested by people looking for children who are displaced, unsupervised, and unaccounted for. Reduced public field exposure — **location precision above all** — is the difference between a search tool and a targeting list.

This is not "a policy page plus a field rule." The field-exposure design needs actual thought about which attributes are safe to surface publicly, at what geographic resolution, and what is excluded from every export and federation endpoint including PFIF. Scope it properly.

| # | Work |
|---|---|
| **76** | Minors protection — policy page, reduced public field exposure, explicit exclusion from all export/federation endpoints |
| **77** | Needs coverage lifecycle — `coverage_state` enum, transition authority, auto-decay, map colors. Schema change → PR routing |
| **78** | Client-side image compression — all upload paths |
| **—** | Open from 72 Part B: axe/Lighthouse in CI |

---

## STANDING CONSTRAINTS

- Spec before code. Anything touching `src/lib/security/`, auth, RLS, contact-info handling, or sanitization routes through a PR so CodeQL and Copilot run pre-merge.
- **Never fabricate, round, estimate, or seed a number to avoid an empty state.** Suppression is always the answer. §1 exists because a plausible wrong number already shipped.
- DTV figures are attributed to the federated DTV network, never presented as Vigil data.
- No facial-recognition claim anywhere. AI text description of features, not biometrics.
- No Vigil↔DTV partnership claim beyond what exists: API federation with attribution, reciprocal directory listing.
- Design system unchanged. Light mode only. No dark mode under any framing.
- `scripts/visual-check.mjs` proof for every changed route, mobile and desktop.

## REPORT BACK

1. Raw `GET /personas` response shape — is 25.000 a cap? Yes or no.
2. Why `/estadisticas` and `/prensa` disagree at the same timestamp.
3. Extracted text from one regenerated PDF, diffed against its markdown source, showing accents intact.
4. `/noticias`: wired or deleted, and why.
5. The `viewMode.config.ts` ↔ `Navigation.tsx` reconciliation table.
