# 74 — Arriving-User Hardening (post-listing)

**Priority:** P0. The DTV listing is **live**, not pending. Referral traffic is arriving now.
**Depends on:** 62 (partially shipped — Part A of this prompt closes it), 63 REV2 (provenance system), 65 (`/prensa`), 66 (route inventory).
**Routing:** Single PR. UI, copy, and one client-side referrer read. No auth, no RLS, no `src/lib/security/`, no schema change. Normal review.

---

## Context

`VIGIL-LAUNCH-READINESS.md` was written as a *pre-listing* checklist. That framing is now stale. Jorge Bastidas (Head of Technology & Innovation, Software Empire Inc / DTV) confirmed on 2026-07-22 that Vigil is listed in DTV's active-platforms directory under **«Búsqueda de personas»**.

That changes the priority order. Items 2.2 and 2.3 of the readiness doc were queued as P1 "launch week." They are now P0, because the user they describe is already on the site.

**Who that user is.** They searched DTV — the largest citizen missing-persons dataset in this response — and did not find their person. They clicked through to Vigil. They are Spanish-speaking, on mobile, on a degraded connection, emotionally acute, and arriving mid-funnel with DTV as their reference frame. They will search again and, statistically, most of them will find nothing again.

**The zero-result state on `/buscar` is now the highest-traffic emotional moment on the platform.** It deserves the most careful copy on the site. Right now it is unverified.

---

## PART A — Close prompt 62 (audit disagreement)

Three documents disagree about whether 62 shipped:

- `VIGIL-LAUNCH-READINESS.md` §2.1 marks it `[SHIPPED 2026-07-21 prompt 62]` while leaving the "currently displays 0 / 0" text in place underneath.
- `MONITOR-AND-AUDIT-DELIVERABLES.md` (2026-07-22) confirms empty CTAs from 62 on `/organizaciones`, `/voluntarios`, `/intercambio` — but lists `/evaluacion-estructural` only as "audited at summary level."
- A later working session reported `/evaluacion-estructural` still rendering `0` / `0`.

**Working hypothesis: 62 shipped partially and missed the one page it was written for.** Resolve this against live code, not against the docs.

### A1 — Verify and fix

Check `/evaluacion-estructural` in the live codebase. If either counter still renders a literal `0`:

- **Propiedades evaluadas esta semana** → genuinely zero and expected to populate. Suppress until non-zero. Never render `0`.
- **Profesionales voluntarios activos** → genuinely zero and likely to stay zero short-term. Suppress the counter permanently in favour of a forward-looking state. The page must read as *"request an assessment and we will match you with a volunteer professional,"* never as *"0 professionals active,"* which reads as *this service does not exist*.

### A2 — Re-run the full inventory

Prompt 62 Part A specified a complete counter inventory. Redo it and commit the table to the PR description. Every numeric counter, stat block, and "N results" indicator, with: route, current live value, data source, and disposition.

Minimum coverage: `/evaluacion-estructural`, `/estadisticas`, `/voluntarios`, `/organizaciones`, `/punto-de-acopio`, `/intercambio`, `/equipo-activo`, `/calendario`, `/muro`, `/red`, header aftershock indicator, nav badges, map layer toggles, and any empty-state count.

**Flag any counter whose source is stale, cached beyond its revalidation window, or wired to a table that is not actually being populated.** Those findings are worth more than the cosmetic fix.

### A3 — Correct the docs

Update `docs/architecture/VIGIL-LAUNCH-READINESS.md` §2.1 so the status marker matches reality and the stale descriptive paragraph is removed. Status markers in that document must come from execution reports only. It has now drifted twice (this, and the migrations 016/017 note corrected in prompt 73).

---

## PART B — Zero-result recovery on `/buscar`

### B1 — Verify current behaviour

`VIGIL-BIBLE.md` states the "Sin resultados" state surfaces sister-platform links and a report button. Confirm that is still live and that **DTV appears in that list**. If a user arrives from DTV, finds nothing, and the empty state sends them back to DTV, that is a loop — the copy must account for the referral case (see Part C).

Also confirm federated DTV records carry a visible provenance badge in results.

### B2 — Rewrite the empty state

This copy is the deliverable. Use as written.

**Spanish (primary):**

> ### No encontramos a esa persona todavía
>
> Que no aparezca aquí no significa nada definitivo. Significa que aún no está en esta base de datos.
>
> **Tres cosas que puedes hacer ahora:**
>
> **1. Amplía la búsqueda.** Prueba solo el apellido, o solo el nombre. Los reportes llegan con la ortografía que pudo escribir un familiar bajo presión — un acento, una letra, un segundo apellido pueden cambiar el resultado.
>
> **2. Crea un reporte.** Si no existe, créalo. Es lo que permite que otra persona que busque a la misma persona los encuentre entre sí. No necesitas cuenta y toma menos de dos minutos.
> → *[Reportar a esta persona]*
>
> **3. Busca en las otras plataformas.** Ninguna base de datos tiene todo. Estas son las que operan en esta emergencia:
> → *[lista de plataformas hermanas, DTV primero cuando el usuario NO viene de DTV]*
>
> ---
>
> Vigil consulta también la red federada de **Desaparecidos Terremoto Venezuela**. Si la persona aparece allí, aparece aquí.

**English:** translate faithfully; do not soften. Then all 8 locales.

### B3 — Copy constraints

- No apology language. No *"lamentablemente"*, no *"desafortunadamente"*.
- No false hope and no false comfort. *"No significa nada definitivo"* is true; *"seguro aparecerá"* is not.
- No exclamation marks anywhere in this state.
- Do not render a result count of `0` above this state. Per Part A, the number is suppressed and the state replaces it.

---

## PART C — DTV referral landing

### C1 — Detection

Read `document.referrer` on first load. If the host matches the DTV domain, set a session-scoped flag.

**Privacy constraints, non-negotiable:**
- The referrer value is **never persisted** to Supabase, never attached to a report record, never logged server-side.
- `sessionStorage` only. Not `localStorage`, not a cookie.
- No analytics event carrying the referrer.
- If the flag cannot be read, the site behaves exactly as it does today. This is progressive enhancement, never a gate.

### C2 — Contextual state

When the flag is set, render a dismissible line above the search field on `/buscar` and on `/`. Route the user toward `/buscar`, not the marketing surface.

**Spanish:**

> **Vienes de Desaparecidos Terremoto Venezuela.**
> Vigil consulta esa misma base de datos, así que verás los mismos reportes — más los que se crearon aquí. Lo que Vigil añade: búsqueda por fotografía, desglose por estado, municipio y parroquia, y mapa de crisis con réplicas en vivo.
> → *[Buscar aquí]*

### C3 — Adjust the empty state for referred users

When the referral flag is set, the sister-platform list in Part B **must not lead with DTV** — they just came from there. Reorder so the other platforms surface first, and replace item 3's intro line with:

> **3. Busca en las otras plataformas.** Ya buscaste en DTV. Estas son las demás que operan en esta emergencia:

### C4 — Honest differentiation only

Every claim in C2 must be true of the live platform today. If photo search is degraded by the prompt 61 circuit breaker at the moment the line renders, do not advertise it — read the breaker state and drop that clause. **Advertising a feature that is currently returning a degraded state to a grieving user is worse than not mentioning it.**

---

## PART D — Reciprocity check on `/red`

DTV listed Vigil. Confirm the reverse is accurate and current:

- DTV is present and prominent on `/red`
- The federation relationship is described honestly — API-federated, attributed, not copied
- Attribution language matches the standing rule: figures from DTV are attributed to the federated DTV network and never presented as Vigil's own data
- The seven sister platforms in `crisis.config.ts partnerLinks` still resolve; flag any dead link

---

## Acceptance criteria

- Zero instances of a literal `0` rendered as a headline statistic anywhere in the app
- Counter inventory table committed to the PR description, with stale/unpopulated sources flagged
- `/evaluacion-estructural` reads as a forward-looking service, not an empty one
- `VIGIL-LAUNCH-READINESS.md` §2.1 corrected
- `/buscar` empty state live in ES + EN, then all 8 locales
- Referral flag is `sessionStorage`-only, never persisted, never logged — verify by inspecting network and Supabase writes during a referred session
- Referred users do not see DTV at the top of the sister-platform list
- C2 claims gated on live feature state, including breaker status
- `/red` reciprocity confirmed, dead links flagged
- No layout shift from conditional rendering — reserve space, do not let content jump
- `scripts/visual-check.mjs` proof for every changed route, mobile and desktop

---

## Constraints

- **Do not fabricate, seed, round up, or estimate any number to avoid a zero.** Suppression is the answer. A single inflated statistic destroys the credibility the entire outreach strategy is built on.
- Do not delete the underlying query for a suppressed counter — hide at render so it reappears automatically when real data exists.
- Design system unchanged. Existing type scale and color tokens only. No dark mode under any framing.
- No claim of a Vigil↔DTV partnership beyond what exists: API federation with attribution, and reciprocal directory listing.
- No facial-recognition claim anywhere. Vigil does AI text description of features, not biometrics. This is a deliberate privacy position and a differentiator.

---

## Report back

Answer these directly:

1. Was 62 actually shipped on `/evaluacion-estructural`, or not? State it plainly.
2. Which counters in the inventory are wired to tables that are not being populated?
3. Does the `/buscar` zero-result state currently list DTV, and did it before this PR?
4. Confirm with evidence that no referrer value reaches Supabase or any server log.

---

## Queued after this — do not start until 74 is merged

- `75-client-side-image-compression.md` — all upload paths (report photo, structural assessment, photo search). Highest reliability-per-effort item remaining; users on 2G are currently uploading full-size images.
- `76-needs-coverage-lifecycle.md` — `coverage_state` enum (crítico / parcial / cubierto), transition authority for approved orgs and registered collection points, auto-decay to "needs reconfirmation," map colors `#DC2626` / `#D97706` / `#16A34A`. Schema change → PR routing required.
- `77-minors-protection.md` — `/proteccion-de-menores` policy page, reduced public field exposure for minor records, explicit statement that minor-differentiated data is never surfaced through any export or federation endpoint. DTV publishes this and links to you; the absence is now visible.
- **Open from 72 Part B:** automated axe/Lighthouse accessibility testing in CI was deferred. Manual audit and VPAT exist; CI enforcement does not.
