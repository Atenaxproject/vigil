# 60 — Emergency Number Consistency

> **Status:** ✅ Executed 2026-07-21. Footer/header reconciled to 911; [former rescue-coordination label] relabeled as rescue-coordination (TODO Orlando verify). Part C directory lines remain verified:false pending sign-off.

# 60 â€” Emergency Number Consistency

**Priority:** P0 â€” physical safety. Ship before the DTV `/plataformas` listing goes live.
**Depends on:** PR #6 and PR #7 merged, `main` clean.
**Routing:** Normal PR. Does not touch `src/lib/security/`, auth, or RLS, but ships a `critical: true` string change, so it gets a PR and a human read before merge regardless.

---

## Context

Vigil is about to be listed in Desaparecidos Terremoto Venezuela's `/plataformas` directory. Referral traffic will arrive from users actively searching for missing people. The emergency-number surface is the single highest-consequence content on the platform and it currently contradicts itself.

**Verified live on production, July 2026:**

- The **header bar** correctly shows `911` with carrier routing: Movistar 911 Â· Digitel 112 Â· Movilnet \*1 Â· Cantv 171
- The **footer**, rendered on every page, reads: *"Vigil NO es un servicio de emergencias. Para rescate inmediato llama al: [former rescue-coordination label]"*

Two different emergency numbers, same viewport, no explanation of the difference. A person in crisis reads one of them and it is not deterministic which.

All four peer platforms in the Venezuela response (Yummy SOS, DTV, Centros de Ayuda, Mapa de Necesidades) treat 911 as the national single line with carrier variants. Vigil's header already matches that consensus. The footer is the outlier.

---

## Scope

### Part A â€” Footer reconciliation (do this now, unblocked)

The header's 911 + carrier set is already shipped and already accepted as correct. Bring the footer into agreement with it. No new number verification is required for this part.

1. Locate the footer emergency string. It is a `critical: true` entry â€” check `src/i18n/locales/es.json` and `en.json` first, then the 6 generated locales.
2. Replace the `[former rescue-coordination label]` reference with `911`, preserving the "Vigil is not an emergency service" framing, which is correct and stays.
3. The footer must not introduce a *second* number set. It references the same national line as the header. If a user needs carrier detail, the header already has it â€” do not duplicate the carrier list in the footer.
4. Apply across all 8 locales. ES and EN are handcrafted and get exact copy; the 6 generated locales get the same numeric values with translated framing.

**Suggested ES copy** (Orlando approves before merge):

> Vigil NO es un servicio de emergencias. Para rescate inmediato llama al 911.

### Part B â€” `[former rescue-coordination label]` disposition (gated)

`[former rescue-coordination label]` ([removed-hotline]) appears in `crisis.config.ts` and in the emergency directory per the project Bible. Do not remove it globally in this prompt.

**Blocked on Orlando confirming whether the line is still active.** Two outcomes:

- **Still active** â†’ it stays in the `/informacion` directory only, explicitly relabeled as a rescue-coordination line rather than the primary emergency number. It does not appear in the footer.
- **No longer active or unverifiable** â†’ remove it from `crisis.config.ts`, the directory, and every locale file. Grep the whole repo; it appears in more places than the obvious ones.

Leave a clearly marked `TODO(orlando-verify)` comment at the config site so this cannot be silently forgotten.

### Part C â€” Directory additions (gated)

The following lines are published by peer platforms in the same response. **Every one requires human verification against an official source before it ships.** Do not add any of these on the authority of a peer site.

| Line | Number | Purpose |
|---|---|---|
| ProtecciÃ³n Civil (nacional) | [do-not-ship-PC-alt] Â· alt 0800-266-8446 Â· 0800-262-4368 | Disaster coordination, evacuations, shelters |
| Cruz Roja Venezolana | 0212-578-2516 Â· alt 0212-571-2411 | Medical and first aid, Caracas |
| FUNVISIS | 0212-257-5153 Â· free 0800-836-2567 | Official seismic information |

Prepare the directory entries in a branch but **do not merge Part C** until Orlando signs off per-line. Structure the change so each line can be individually included or dropped without reworking the others.

---

## Acceptance criteria

- No page renders two different primary emergency numbers anywhere in the viewport
- Footer string matches header across all 8 locales
- `grep -ri "[former rescue-coordination label]\|[removed-hotline]"` returns only the intentional, relabeled directory occurrence (or zero occurrences if removed)
- No `critical: true` string was changed without a corresponding entry in the PR description listing old value â†’ new value, per locale
- Screenshot proof via `scripts/visual-check.mjs` against the deployed preview: header and footer in the same frame, mobile and desktop

---

## Constraints

- Do not invent, infer, or "correct" any phone number. If a number is not in this prompt or already in the repo, it does not go in.
- Do not touch the AI assistant's hardcoded emergency-routing instruction in the same PR. That string is referenced by prompt 61 and changing it in two places at once makes both PRs harder to review.
- Design system is unchanged. No new components, no color changes, no layout changes.

---

## Report back

List every file touched, every locale key changed with before/after values, and flag anything found during the grep that looks like a third emergency-number source nobody has accounted for.

