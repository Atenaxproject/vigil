# 72 � DONE

**Executed:** 2026-07-22

# 72 — Navigation IA Restructure and WCAG 2.1 AA Conformance

**Priority:** P1. The accessibility half is a Florida adoption prerequisite, not a polish item.
**Depends on:** 66 (route inventory needed before regrouping), 69 (accessibility controls specified there — consolidate here instead of building twice).
**Routing:** Two PRs. Part A (IA) and Part B (accessibility) are independent.

---

## Why Part B is not optional

DOJ's 2024 ADA Title II final rule adopts **WCAG 2.1 Level AA** as the binding technical standard for state and local government web content and mobile applications, and it covers services provided by public entities **directly or through third-party arrangements**.

If a Florida county emergency management agency adopts Vigil, Vigil falls inside that county's Title II obligation.

Deadlines, per DOJ's interim final rule of 20 April 2026: **26 April 2027** for public entities serving 50,000 or more, **26 April 2028** for smaller entities and special districts. The standard is unchanged; only timing moved. DOJ stated it fully anticipates implementing at the new dates.

Practical consequence: county EM offices are working this problem now. A platform arriving already conformant removes work from their list rather than adding to it. This is a reason to be selected, not a box to tick.

**Do not use an accessibility overlay widget.** Overlays are widely disfavored, automated tooling detects roughly 30% of real issues, and overlays have a poor record as a legal defense. Do the conformance work.

---

## PART A — Navigation information architecture

### The problem

Vigil presents **19 navigation destinations as a flat, undifferentiated list**: Centro de Ayuda, Mapa de Crisis, Buscar Persona, Reportar Desaparecido, Necesito Ayuda, Preparación, Calendario, Muro, Red de búsqueda, Estadísticas, Punto de Acopio, Conectividad, Evaluación Estructural, Intercambio, Voluntarios, Organizaciones, Cómo Ayudar, Equipo Activo, Información.

A person who has just felt an aftershock must read all nineteen to find one. Under stress, on a small screen, on a slow connection.

CIVIS Venezuela groups 17 destinations into 6 labeled sections and their grouping is the reference model — not because grouping is novel, but because of **how they named the groups**.

### The naming principle

CIVIS group names are **user questions**, not feature categories: *Acciones · Tu zona hoy · Dónde hay ayuda · Estado de la emergencia · Información oficial · Ajustes.*

Vigil's item names are internal vocabulary: *Intercambio · Punto de Acopio · Equipo Activo · Conectividad.* Each requires the user to already know what Vigil calls things.

**Every label in the restructured nav must answer a question a user would actually ask.** If a label only makes sense to someone who built the platform, rename it.

### Proposed grouping

Validate against the prompt 66 route inventory before implementing; adjust if the audit surfaced routes not listed here.

| Group | Items |
|---|---|
| **Buscar a alguien** | Buscar Persona · Reportar Desaparecido · Red de búsqueda |
| **Necesito ayuda** | Necesito Ayuda · Refugios/Conectividad · Evaluación Estructural · Preparación |
| **Quiero ayudar** | Cómo Ayudar · Voluntarios · Intercambio · Punto de Acopio · Organizaciones |
| **Estado de la emergencia** | Mapa de Crisis · Estadísticas · Equipo Activo |
| **Información** | Información · Centro de Ayuda · Calendario · Muro · Prensa |
| **Ajustes** | Accesibilidad · Idioma |

Two questions for the implementation to answer rather than assume: does `/muro` belong under Información or somewhere more social, and is `/calendario` earning its nav slot at all? The 66 audit should indicate whether either is actually used.

### Subtitles are mandatory

Every navigation item gets a one-line descriptive subtitle. CIVIS does this consistently — *"Refugios — Lugares seguros con cupo"*, *"Ascensores certificados — Verifica la certificación antes de usarlo"* — and it is what allows scanning rather than guessing.

Write a subtitle for all 19 destinations. If a destination cannot be described usefully in one line, that is a signal the page itself is unclear.

### Bottom navigation

Current: Mapa · Buscar · Reportar · Ayuda · **Más**

Change the fifth slot from an overflow menu to **Emergencia**, routing to the emergency numbers page. CIVIS gives emergency contact a permanent home on every screen; Vigil hides it behind overflow. On a crisis platform the emergency directory should never be two taps away.

Grouped navigation moves into a sheet reachable from the header, not the bottom bar.

### "Mis reportes"

CIVIS offers a personal view of a user's own submissions with no account. Vigil already has claim tokens — the mechanism exists, the surface does not. Add a view where a user can see and manage what they submitted, keyed on locally stored claim tokens. No account, no login.

---

## PART B — WCAG 2.1 AA conformance

### B1 — User-facing controls

Surface in navigation under Ajustes, not buried:

- **Text size:** three steps minimum (100% / 125% / 150%), persisted in localStorage, applied via root font-size so all rem-based sizing scales
- **High contrast:** toggle, persisted

**Constraint:** high contrast is an accessibility mode, **not dark mode**. Standing constraint #7 holds. Implement as a high-contrast *light* variant that raises contrast ratios within the existing palette. It must not become a route to reintroducing dark mode.

Supersedes prompt 69 Part D — build it here, once.

### B2 — Conformance audit

Full WCAG 2.1 AA pass across all routes. Automated tooling catches roughly 30% of issues, so manual testing is required.

**Automated:** axe-core or Lighthouse across every route, in CI so regressions fail the build.

**Manual, which is where the real findings are:**

- **Keyboard only.** Every interactive element reachable and operable with no mouse. The map, the layer toggles, the language switcher, and any modal are the likely failures.
- **Focus visible.** Every focusable element has a clearly visible focus indicator meeting contrast requirements.
- **Screen reader.** NVDA or VoiceOver through the primary flows: search for a person, report a missing person, find emergency numbers. Map content needs a meaningful text alternative — a screen reader user must be able to get the information without the map.
- **Contrast.** 4.5:1 for normal text, 3:1 for large text and UI components. Check the single blue accent `#2563EB` against every background it appears on.
- **Reflow.** 320px width with no horizontal scroll, and 200% zoom without content loss.
- **Forms.** Every input has a programmatically associated label. Errors identified in text, not by color alone.
- **Motion.** The Status Pulse sonar ring must respect `prefers-reduced-motion`.
- **Language.** `lang` attribute correct per locale and updating when the language switcher is used.

### B3 — Documentation

Produce an **accessibility conformance statement** at `/accesibilidad`: standard targeted, known limitations, contact for reporting barriers, date of last audit.

This is the document a county procurement officer asks for. Having it written before the meeting is worth more than the code being perfect.

Keep a VPAT-style summary in `docs/` even though Vigil is not selling — public agencies request it regardless.

---

## Icons

CIVIS uses emoji as functional icons — zero bundle weight, renders with no font, works offline, legible on low-end devices. Real engineering reasoning, and worth understanding.

**But keep lucide-react for navigation.** Emoji render inconsistently across platforms and screen readers announce them verbosely, which works against Part B. Emoji are acceptable only for the utility status row if prompt 70 Part A ships, and only with proper `aria-label` text alternatives.

---

## Also verify

CIVIS markets itself as working offline and carries the same `mobile-web-app-capable` metadata Vigil does. Check whether they actually run a service worker and what they cache. Vigil's documented per-asset-class caching strategy may or may not be an advantage — confirm rather than assume, and report what you find.

---

## Acceptance criteria

**Part A:**
- 19 destinations grouped into labeled sections; every group name answers a user question
- Every item has a subtitle
- Bottom nav fifth slot is Emergencia, routing to emergency numbers
- "Mis reportes" live, claim-token keyed, no account
- All 8 locales
- `scripts/visual-check.mjs` proof, mobile and desktop

**Part B:**
- Text size and high contrast controls live and persisted; no dark mode introduced
- Automated accessibility testing in CI, failing the build on regression
- Manual audit completed with findings documented per route
- Keyboard operability verified on the map specifically
- Screen reader walkthrough of the three primary flows documented
- Contrast verified for `#2563EB` on every background
- 320px reflow and 200% zoom pass
- `prefers-reduced-motion` respected
- `/accesibilidad` conformance statement published
- VPAT-style summary in `docs/`

---

## Constraints

- Do not add an accessibility overlay widget.
- Do not introduce dark mode under any framing.
- Do not restructure navigation before the 66 route inventory is available — regrouping routes that are about to be removed wastes the work.
- Design system unchanged. Grouping and subtitles use existing type scale and spacing.

---

## Report back

For Part B, the manual audit findings are the deliverable — automated results are table stakes. Flag every route that fails keyboard operability, and state plainly whether a screen reader user can complete a missing-person search end to end. If they cannot, that is the single most important finding in this prompt.
