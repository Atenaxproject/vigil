# 76 — Minors Protection

**PR routing required.** Touches public field exposure, export, and federation endpoints. CodeQL and Copilot review before merge.
**Priority: highest in the queue.** Ahead of coverage lifecycle and image compression.

---

## Why this is not a policy page

Vigil is a public missing-persons platform with unauthenticated search. Records of minors are precisely what gets harvested by people looking for children who are displaced, unsupervised, and unaccounted for. Reduced public exposure of the right fields is the difference between a search tool and a targeting list.

**But the naive version of this actively harms the mission.** Hiding minors, or stripping their photos, or excluding them from federation, makes them harder to find — and finding them is the entire point. NCMEC and Google Person Finder both publish photographs of missing children, because recognition outweighs the exposure risk. That judgment is correct and Vigil should not depart from it.

The distinction that resolves it:

> **Publish what helps a stranger recognize the child. Suppress what helps a stranger reach the child.**

Those are different field sets, and almost nothing appears in both.

| Publish — recognition | Suppress or reduce — locating |
|---|---|
| Name | Exact coordinates |
| Photograph | Street address, parroquia-level location |
| Age or approximate age | Current shelter or center name |
| Physical description | Guardian status, especially "unaccompanied" |
| Last seen — general area (estado / municipio) | School, routine, usual whereabouts |
| Date last seen | Any contact detail for the child or family |

Build to that rule. Where a field is ambiguous, ask whether it helps a stranger in another country recognize a face, or helps a stranger three blocks away find a body — and place it accordingly.

---

## §1 — Identify minor records

- Determine how age is currently captured on `/reportar` and stored on `missing_persons`. Report the actual schema; do not assume.
- Age is frequently unknown or estimated in a crisis. A report must be markable as a minor **without** a precise age — an explicit "menor de edad" flag independent of any numeric age field.
- Where age is present and under 18, the flag applies automatically.
- Where age is absent and the flag is unset, the record is treated as adult. **Do not infer minor status from a photograph, a name, or AI analysis.** A false positive suppresses location data that might have helped; a false negative is worse. Neither is a guess Vigil should make. This follows the same rule as ATC-20 tagging: the system never assigns the classification, a human does.

Migration required. Route through PR.

---

## §2 — Reduce location precision on public surfaces

For any record flagged as a minor:

- Public location resolution drops to **municipio**. No parroquia, no street, no exact coordinates.
- Map markers for minor records render at municipio centroid with a visible precision disclaimer — the same honest-approximation treatment already used for the La Guaira marker.
- The precise location remains in the database and remains visible to the claim-token holder. This is a public-display rule, not a data-collection rule.
- Verify the reduction happens **server-side**. If full coordinates reach the client and are hidden in the UI, nothing has been protected. Check the API response payload, not the rendered page.

---

## §3 — Suppress the targeting fields entirely

Never public for a minor record, under any circumstance:

- **Unaccompanied status.** This is the single highest-risk field on the platform — it is a direct targeting signal identifying a child with no adult present. It must not appear in public output, in an export, in a federation payload, or in an API response consumed by an unauthenticated client.
- Current shelter, hospital, or collection point placement
- Any contact detail, which already routes through the internal request flow — verify it holds here with no exception path
- School, routine, or habitual location

If any of these fields do not currently exist, do not create them in this prompt. Report which exist and which do not.

---

## §4 — Federation and export

**Minor records stay in PFIF export.** Removing them would reduce the chance of a cross-platform match, which is the opposite of the goal.

What changes is the field set:

- PFIF output for a minor carries the recognition fields and omits every field in §3
- Location in PFIF for a minor is municipio-level, matching §2
- The same rule applies to every export path — `/api/pfif`, any CSV or JSON export, any partner-facing endpoint
- **Audit every route that emits person data** and confirm the reduction applies at each. A single unreduced endpoint defeats the entire feature. List them all in the report.

---

## §5 — Photographs

Photographs stay. They are the primary recognition tool and removing them would harm children.

Reduce the collateral exposure instead:

- No full-resolution original served publicly — display resolution only
- No direct hotlink to an unprocessed original in storage
- Verify EXIF is stripped on upload, including GPS coordinates. **If EXIF stripping is not currently implemented, that is a live location leak for every photo on the platform, not just minors** — report it immediately and treat it as its own finding rather than folding it into this prompt.

---

## §6 — Policy page

Create `/proteccion-de-menores`, Spanish primary, all 8 locales.

State plainly:

- What Vigil publishes about a minor and what it does not, in the recognize-versus-locate terms above
- That location precision is reduced on public surfaces
- That unaccompanied status is never published
- That the same reduction applies to federation and export, so partner platforms receive the reduced set
- How a parent or guardian requests removal or correction, and the expected response time
- That Vigil never shares data with the Venezuelan government — restate the standing commitment here rather than only linking to it

Link from the footer, from `/red`, and from the Privacy Policy. DTV publishes an equivalent page and links to Vigil; the reciprocal absence is currently visible.

**Do not claim compliance with any specific regulation.** Describe what the platform does. Legal characterization is Orlando's call with counsel, not a claim to generate.

---

## §7 — Adjacent surfaces

- **Volunteer registry** — confirm minors cannot register as volunteers, and that the registration flow states an age requirement.
- **Community wall** — check whether any pathway allows a post to identify a minor's current location.
- **Structural assessment** — confirm no minor-related field exists in that flow.

---

## Constraints

- No AI-assigned minor status, ever. Same class of rule as ATC-20 structural tagging.
- Do not delete or stop collecting precise location. This is a display and export rule; the data remains available to the claim-token holder and to any future verified-organization flow.
- No regulatory compliance claims.
- Design system unchanged.
- Every reduction verified server-side, in the response payload.

## Report back

1. Current age schema on `missing_persons`, verbatim.
2. Every route that emits person data, with confirmation the reduction applies to each.
3. Whether EXIF stripping is currently implemented — this one answer independently of the rest.
4. Which §3 fields exist today and which do not.
5. Proof from an API response, not a screenshot, that precise coordinates do not reach an unauthenticated client for a flagged record.
