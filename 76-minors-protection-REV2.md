# 76 REV2 — Minors Protection

**Supersedes `76-minors-protection.md`.** The original was written before the schema investigation. Several sections assumed fields and photo paths that do not exist. This revision is built on what was actually verified in code.

**Own branch off current `main`. Own PR.** Schema migration + RLS-adjacent view changes → CodeQL and review before merge.

---

## §0 — Before you start: clear the queue

Four open PRs (#6–#9) are dependency and workflow updates. Merge them first so 76's PR is the only thing in flight when it needs attention. They touch dependencies; 76 touches schema — no conflict.

Note that merging #7 does not revive the nightly backup. That is still waiting on three secrets only Orlando can set.

---

## §1 — What changed from the original brief

Verified in code, and it simplifies the build considerably:

| Original assumption | Reality |
|---|---|
| Targeting fields (`unaccompanied`, `shelter`, `school`, `routine`) exist and need suppression | **None exist.** Nothing to suppress. Per the original §3, do not create them. |
| Missing-person photos are uploaded and stored by Vigil | **Vigil never stores them.** `photo_url` holds external DTV/PFIF URLs. See §8. |
| Photo display-resolution and EXIF handling needed here | Covered by 76A for the one bucket that exists; not applicable to external URLs |
| A minor flag exists or can be derived | `age` is a single nullable `INT`. No flag. §2 creates one. |

**What the public view actually exposes today** (`public_missing_persons`, reaching anonymous clients):

`full_name, age, gender, photo_url, last_seen_location (free text), estado, municipio, parroquia, approx_last_seen_lat/lng, ...`

**The governing rule is unchanged:** publish what helps a stranger recognize the child; suppress what helps a stranger reach the child.

For a flagged record — **keep** name, photo, age, gender, estado, municipio. **Drop** parroquia, approximate coordinates, and the free-text `last_seen_location`.

---

## §2 — `is_minor` flag

Migration. Route through PR.

- Add `is_minor BOOLEAN NOT NULL DEFAULT false` to `missing_persons`
- Auto-set on insert and update when `age IS NOT NULL AND age < 18`
- **Auto-set only. Never auto-clear.**

That last constraint is the important one. Age is frequently unknown in a crisis, so a record may be flagged manually with `age` null. If a later correction supplies an age of 19, the trigger must not silently unflag it — the manual flag may have been correct and the age wrong, or the record may be one of several siblings. Clearing is a deliberate human action only.

This errs toward protection, which is the correct direction when one error is recoverable and the other is not.

- No AI-assigned minor status, ever. Same class of rule as ATC-20 structural tagging.
- Report the existing `age` constraint verbatim and confirm the trigger interacts with it correctly.

---

## §3 — Reduce the public view

`CASE WHEN is_minor` in `public_missing_persons`:

- `parroquia` → `NULL`
- `approx_last_seen_lat` / `approx_last_seen_lng` → `NULL`
- `last_seen_location` (free text) → `NULL`

**On the free-text field:** dropping it is right — free text is unbounded and can contain a street address, a landmark, or a school name that no sanitizer will reliably catch. But a blank field loses recognition value and reads as missing data.

**Do not put the replacement string in the view.** Return `NULL` from the database and render a localized municipio-level statement in the UI from the `estado` and `municipio` fields that are still present — *"Visto por última vez en {municipio}, {estado}"*. Keeps Spanish out of a Postgres view and keeps the fallback translatable across all 8 locales.

**Verify server-side.** Check the API response payload, not the rendered page. If precise values reach the client and are hidden in the UI, nothing has been protected.

Also report: how approximate are `approx_last_seen_lat/lng` already? If they are fuzzed, state the radius. That determines whether nulling them is necessary or belt-and-braces.

---

## §4 — Apply the same reduction to every emitting surface

Enumerated in the investigation:

- `public_missing_persons` view — §3
- `/api/pfif` (`pfif.ts`)
- `/api/missing-persons/search` and `/notes`
- The map layer

**PFIF specifics.** Minor records stay in the export — removing them would reduce cross-platform match chances, which is the opposite of the goal. What changes is the field set: omit street and neighbourhood equivalents, keep city (municipio) and state. Omit date of birth if present; `age` alone is sufficient for recognition and less precise.

**Map layer.** Render at municipio centroid with a visible approximation label, matching the honest-approximation treatment already used for the La Guaira marker. **Report whether municipio centroid data exists in the codebase.** If it does not, do not silently fall back to precise coordinates and do not drop the marker — surface the question and stop.

A single unreduced endpoint defeats the whole feature. List every route you checked, including ones that turned out not to emit person data.

---

## §5 — Never export `is_minor`

Not in PFIF. Not in any API response. Not in any partner payload. Not in any CSV or JSON export.

The reasoning is specific, so that it is applied correctly rather than treated as symbolic. Age is exported and a low age obviously implies minor status — the flag is not a secret. What it would add is twofold, and both matter:

1. **Records flagged manually with no age.** For those, `is_minor` reveals minor status that is not otherwise inferable from the payload. That is genuinely new information handed to whoever reads the export.
2. **A canonical, machine-filterable boolean** turns a parse-and-threshold operation into a single query. That difference is small for one record and large for bulk extraction.

Reduce the location fields silently. Do not signal why they were reduced.

---

## §6 — `/reportar` checkbox

- Add a "menor de edad" checkbox, settable independently of the age field
- Label it so the purpose is clear without alarming a parent filing a report under stress — it protects the child's location, it does not restrict the search
- All 8 locales
- Does not gate submission; a report with neither age nor flag is treated as adult, per the original §1

---

## §7 — `/proteccion-de-menores`

Spanish primary, all 8 locales. Linked from footer, `/red`, and the Privacy Policy.

State plainly:

- What Vigil publishes about a minor and what it does not, in recognize-versus-locate terms
- That location precision is reduced to municipio on public surfaces
- That the same reduction applies to federation and export, so partner platforms receive the reduced set
- The photo limitation in §8, honestly
- How a parent or guardian requests removal or correction, and the expected response time
- That Vigil never shares data with the Venezuelan government — restate it here rather than only linking

**No compliance claims for any specific regulation.** Describe what the platform does. Legal characterization is Orlando's call with counsel.

DTV publishes an equivalent page and links to Vigil. The reciprocal absence is currently visible.

---

## §8 — Photographs: state the limitation, do not build a proxy

Vigil does not host missing-person photographs. `photo_url` points at DTV and PFIF-sourced external URLs.

This means **Vigil cannot strip EXIF from the photos it displays.** A minor's photograph shown on Vigil is served from the originating platform, carrying whatever metadata that platform wrote — potentially including GPS coordinates of wherever it was taken.

Three possible responses. The decision is made; do not relitigate it in code:

1. **Proxy every image through a Vigil endpoint that strips metadata on the fly.** Rejected for now. It converts an uncontrolled exposure into a controlled one, but adds bandwidth and latency on infrastructure that is currently on free tiers, and it only protects visitors who arrive via Vigil rather than the people actually at risk.
2. **Raise it with the source platform.** This is the real fix — it protects everyone on every surface, not just Vigil's visitors. Orlando is taking this to DTV directly.
3. **Disclose it.** Build this now: `/proteccion-de-menores` states that photographs are served from partner platforms, that Vigil does not host or modify them, and that image metadata is the originating platform's responsibility.

Revisit the proxy only if the source platform declines to strip at upload.

---

## §9 — Adjacent surfaces

- **Volunteer registry** — confirm minors cannot register. If there is no age gate, add an age attestation to the registration flow.
- **Community wall** — append-only free text cannot be enforced, so do not attempt filtering. Add guidance in the posting UI: do not post a minor's current location.
- **Structural assessment** — confirm no minor-related field exists. Expected clean.

---

## Constraints

- No AI-assigned minor status.
- Do not stop collecting precise location. This is a display and export rule. Precise data remains in the database, available to the claim-token holder and any future verified-organization flow.
- No regulatory compliance claims.
- Design system unchanged.
- Every reduction verified in the response payload, server-side.
- Migration applied against a check first.

## Report back

1. Existing `age` constraint verbatim, and how the trigger interacts with it.
2. Every route checked for person data emission, including the clean ones.
3. Whether municipio centroid data exists.
4. How approximate `approx_last_seen_lat/lng` already are.
5. **Proof from an actual API response — not a screenshot — that precise coordinates, parroquia, and free-text location do not reach an unauthenticated client for a flagged record.**
6. Confirm `is_minor` appears in zero export payloads.
