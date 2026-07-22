# 71 � DONE

**Executed:** 2026-07-22

# 71 — Contested Figures: Editorial Policy and Implementation

**Priority:** P1 — governs every figure Vigil publishes from now on. Supersedes the casualty-figure guidance in 63 REV2 Part B1 and 69 Part C.
**Depends on:** 63 REV2 provenance system.
**Routing:** Normal PR. Ships `critical: false` content but sets standing editorial policy — Orlando reviews the copy before merge.

---

## The problem

Vigil currently publishes official Venezuelan casualty figures with a source label. A reader has no way to know those figures are disputed by human rights organizations, international agencies, and independent experts.

That is the failure. Not that Vigil publishes them — it has to, because no alternative count exists — but that it publishes them as though they were settled.

**Why no alternative exists:** counting deaths requires morgue access, hospital mortality records, and death certificates. No citizen platform has those. DTV publishes reports, unique persons, still-without-contact, and located — never deaths. CIVIS publishes the government figure explicitly labeled *"Balance oficial del gobierno."* Every peer platform either relays with attribution or does not publish. Vigil should do the same, and show the dispute.

**Why omission is the wrong fix:** all documented criticism concerns *undercounting*. If the official figure is wrong, reality is worse. Removing it leaves readers with nothing and removes the floor.

---

## The policy

Any figure that is publicly contested by credible sources gets three elements, always together, never separated:

1. **The figure**, with its issuing body named
2. **The dispute**, with the disputing parties named and cited
3. **Independent measurement**, where any exists

Never merge them into a single number. Never present a range that implies Vigil arbitrated between them. Never editorialize — cite.

**Vigil does not assess the credibility of any government.** It reports that named organizations dispute a figure, and links their statements. The distinction between *"the government undercounts"* and *"Provea states the official figures generate more doubts than certainties"* is the entire difference between a humanitarian platform and a political actor.

This is not caution for its own sake. Vigil is about to be evaluated by US emergency management agencies and covered by journalists via the DTV referral. Every peer platform in this response explicitly declares non-partisanship — DTV states it is *no partidista*, CIVIS states it is not a government entity and not affiliated with one. That posture is what allows them to keep operating and keep being cited.

---

## Implementation

### Data model extension

Extend `SourcedFigure` from 63 REV2:

```typescript
interface ContestedFigure extends SourcedFigure {
  is_contested: boolean
  disputes: Array<{
    party: string           // "Provea" | "USGS" | "ONU"
    claim: string           // short, factual, their words paraphrased
    source_url: string
    dated: string           // ISO
  }>
  independent_alternatives?: SourcedFigure[]
}
```

Any figure with `is_contested: true` **cannot render without its disputes.** Enforce this at the component level, not by convention — a developer must not be able to display a contested figure bare.

### Display

Figure renders normally with its official attribution. Directly beneath, a visually distinct block — not a footnote, not a tooltip, not collapsed by default — listing each dispute with the disputing party named and linked.

Use the existing muted-text and border treatments. No new components, no warning iconography. This is context, not an alert.

---

## Content to ship

### Casualty figures — mark `is_contested: true`

| Figure | Value | Source | As of |
|---|---|---|---|
| Fallecidos | 5,346 | Balance oficial del gobierno | 2026-07-21 |
| Heridos | 16,740 | Asamblea Nacional | 2026-07-08 |
| Rescatados | 6,462 | Balance oficial | 2026-07-21 |
| Pacientes atendidos | 39,567 | Balance oficial | 2026-07-21 |

Note: 5,346 and the two new figures come via CIVIS Venezuela, which attributes them to the official government balance. Verify against a primary source at implementation and record what you find.

### Disputes to attach

| Party | Claim | Dated |
|---|---|---|
| Provea (human rights organization) | Stated the official earthquake figures generate more doubts than certainties, and called for zero opacity in the response | 2026-06-28 |
| Provea | Reported growing discordance between official figures and independent estimates | early July 2026 |
| USGS PAGER | Initial loss projection reached up to 100,000 fatalities — orders of magnitude above the official count | June 2026 |
| United Nations | Estimated approximately 50,000 missing, while no official missing-persons figure has been published | early July 2026 |
| Academic experts (via Semana) | Questioned the reliability of official data, noting the state suppressed the agency that previously produced comparable statistics | 2026-07 |

**Required framing note on USGS PAGER:** it is a probabilistic loss *estimate* generated automatically from shaking models, not a count, and it is designed to trigger response scaling rather than to report fatalities. It routinely overestimates. Present it as the projection it is. Overstating it would be the same error in the opposite direction, and it would hand critics a reason to dismiss the whole page.

### Independent measurement to display alongside

| Figure | Value | Source | Note |
|---|---|---|---|
| Structures with damage, nationwide | ~59,000 | Oregon State University, satellite imagery analysis | No government involvement in collection or reporting |

### Federated DTV figures — label precisely

DTV's numbers are **citizen reports, not verified counts, and explicitly not a death toll.** Their own dashboard separates *cantidad de reportes* from *personas únicas (aprox.)* and annotates that one person may be reported multiple times.

Label them as citizen reports from the federated DTV network. Never place them adjacent to casualty figures in a way that invites a reader to treat them as an alternative death count. They measure a different thing.

---

## Copy — ES, Orlando approves before merge

Context block accompanying contested figures:

> **Sobre estas cifras**
>
> Las cifras de fallecidos y heridos provienen del balance oficial del gobierno venezolano. Son las únicas disponibles: el registro de defunciones requiere acceso a morgues, hospitales y actas de defunción que ninguna plataforma ciudadana posee.
>
> Estas cifras han sido cuestionadas públicamente. Provea señaló que "generan más dudas que certezas" y pidió cero opacidad. La proyección inicial del USGS estimó pérdidas muy superiores, aunque se trata de una proyección automática de pérdidas y no de un conteo. La ONU estimó unas 50.000 personas no localizadas, cifra sobre la cual no existe balance oficial.
>
> Vigil publica la cifra oficial con su fuente, y también quién la cuestiona. No evaluamos la credibilidad de ningún gobierno — mostramos lo que cada fuente informa para que puedas juzgar por tu cuenta.

Translate to all 8 locales; ES and EN handcrafted.

---

## Scope boundary

**This policy governs published statistics only.**

It does not modify, weaken, or interact with Vigil's standing commitment that user data is never shared with the Venezuelan government. That is a privacy commitment protecting individuals from a specific documented risk, it is absolute, and it is unrelated to whether Vigil cites published state statistics with attribution.

Do not let these two positions merge in code, copy, or policy documentation. They protect different people from different things.

---

## Acceptance criteria

- `ContestedFigure` implemented; contested figures cannot render without their disputes — enforce at the component level and demonstrate the guard
- All casualty figures marked contested with disputes attached
- USGS PAGER presented as a projection with the framing note, never as a count
- Oregon State figure displayed alongside, labeled independent
- DTV figures labeled as citizen reports, never adjacent to casualty figures as an alternative
- Context block live in all 8 locales
- Every dispute links to its source
- No language anywhere assessing any government's credibility in Vigil's own voice
- `scripts/visual-check.mjs` proof for `/estadisticas`, mobile and desktop

---

## Constraints

- Cite, never editorialize. If a sentence expresses Vigil's opinion of a government rather than reporting what a named party said, cut it.
- Do not present a "real" figure. Vigil does not know it and must not imply that it does.
- Do not remove official figures. Omission leaves readers with nothing and removes the floor on a disaster the criticism says is *under*reported.
- Design system unchanged.

---

## Report back

Verify each dispute against a primary source and record what you find. Flag any claim in this prompt you cannot substantiate — an unsupported dispute is exactly as damaging to Vigil's credibility as an unsupported figure, and arguably more so.
