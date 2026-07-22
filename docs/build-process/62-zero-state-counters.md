# 62 — Zero-State Counter Audit

> **Status:** ✅ Executed 2026-07-21. Counters suppressed until non-zero; CTA empty states on evaluacion-estructural, voluntarios, intercambio, organizaciones; DTV stats gated on available + non-zero.

# 62 â€” Zero-State Counter Audit

**Priority:** P0 â€” first-impression integrity for DTV referral traffic.
**Depends on:** PR #6 and PR #7 merged. Independent of prompts 60 and 61; can run in parallel.
**Routing:** Normal PR. UI and copy only, no security surface.

---

## Context

A user arriving from DTV's `/plataformas` directory has just come from a platform displaying live operational counters â€” report volume, unique persons, located, still without contact. They arrive at Vigil with that as the reference frame.

**Verified live on production:** `/evaluacion-estructural` currently displays

> **0** Propiedades evaluadas esta semana
> **0** Profesionales voluntarios activos

That page is announcing that nothing has happened and nobody is here. It is worse than showing no number at all, and it is the kind of detail that decides whether a referred user explores the rest of the platform or closes the tab.

This is almost certainly not the only surface with this problem. The verified instance is one page; the audit is the work.

---

## Scope

### Part A â€” Full audit

Enumerate every numeric counter, stat block, and "N results" indicator rendered anywhere in the app. Include at minimum:

- `/evaluacion-estructural` â€” properties assessed, active professionals **(confirmed zero)**
- `/estadisticas` â€” all crisis statistics
- `/voluntarios` â€” registered volunteer count
- `/organizaciones` â€” approved organization count
- `/punto-de-acopio` â€” registered collection points
- `/intercambio` â€” active listings
- `/equipo-activo` â€” active teams
- `/calendario` â€” upcoming events
- `/muro` â€” message count if shown
- `/red` â€” linked platform count
- Header â€” the "N rÃ©plicas M4.0+" indicator
- Any count rendered in nav badges, empty states, or map layer toggles

For each, record: current live value, data source, and whether zero is a realistic steady state.

### Part B â€” The rule

**A counter either displays a real non-zero value, or it is not rendered.**

Apply per-counter using this decision order:

1. **Genuinely zero and likely to stay zero short-term** (e.g. active professional volunteers) â†’ suppress the counter entirely and replace with a recruitment or explanatory state. On `/evaluacion-estructural` specifically: the page should read as *"request an assessment and we will match you with a volunteer professional"* â€” a forward-looking promise â€” rather than *"0 professionals active,"* which is a statement that the service does not exist.
2. **Genuinely zero but expected to populate from referral traffic** (e.g. weekly assessments) â†’ suppress until non-zero, then render normally. No "0" ever appears.
3. **Non-zero and real** â†’ leave it, and verify the number is actually current and not stale-cached.
4. **Non-zero but sourced from the federated DTV network** â†’ leave it, and confirm the attribution is present and correct. This is a standing, non-negotiable rule: federated figures are attributed to the DTV network and never presented as Vigil's own data. Audit this specifically on `/estadisticas`.

### Part C â€” Empty states that recruit

Where a counter is suppressed, the space it occupied should do work rather than vanish silently. Each suppressed counter gets an empty state that gives the user an action:

- `/evaluacion-estructural` â†’ route toward submitting a request, plus a clear path for engineers to volunteer
- `/voluntarios` â†’ route toward registration
- `/intercambio` â†’ route toward posting an offer or a need
- `/calendario` â†’ route toward submitting an event

Copy in ES first, then all 8 locales. Keep it short and non-apologetic. No "unfortunately," no "we're still growing."

---

## Acceptance criteria

- A written inventory of every counter in the app with live value and disposition, committed to the PR description
- Zero instances of a literal `0` rendered as a headline statistic anywhere in the app
- Every suppressed counter has a replacement state with a call to action
- DTV-sourced figures on `/estadisticas` carry visible attribution to the federated network
- Screenshot proof via `scripts/visual-check.mjs` for every changed page, mobile and desktop
- No layout shift introduced by conditional rendering â€” reserve space or restructure, do not let content jump on load

---

## Constraints

- **Do not fabricate, seed, round up, or estimate any number to avoid a zero.** Suppression is the answer, never invention. This is a platform families rely on and a single inflated statistic destroys the credibility the entire outreach strategy is built on.
- Do not remove the underlying data source or query. The counter is hidden at render, not deleted â€” it must appear automatically once real data exists.
- Design system unchanged. Existing typography scale and color tokens only.

---

## Report back

Deliver the counter inventory as a table. Flag any counter whose data source looks stale, cached beyond its revalidation window, or wired to a table that is not actually being populated â€” those findings are more valuable than the cosmetic fix.

