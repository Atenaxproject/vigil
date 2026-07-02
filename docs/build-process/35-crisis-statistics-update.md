# Build Prompt 35 — Update Crisis Statistics Block

**Status:** Completed 2026-07-02

Content-only update. No architecture, schema, or UI changes. This is the static,
manually-updated block described in the Vigil Bible (section 5, Information Hub).

## Update these fields exactly as follows

**Muertos confirmados**
- Change: 1,430+ → 2,295
- Fuente: Asamblea Nacional (Jorge Rodríguez), corroborado por NPR, ABC News, El Diario
- Última verificación: 2026-07-01

**Heridos**
- Change: 3,238+ → 11,267
- Fuente: Asamblea Nacional (Jorge Rodríguez), corroborado por NPR, ABC News, El Diario
- Última verificación: 2026-07-01

**Desaparecidos**
- Change: 45,000–68,900 → ~50,000 (estimado)
- Fuente: IRC / ABC News
- Última verificación: 2026-07-01
- Add a short qualifier line under this stat only (not the others): "Cifra en revisión —
  los balances oficiales han mostrado discrepancias y pueden tardar semanas en
  consolidarse." This field is genuinely contested; don't present it with the same
  confidence as the death/injury counts.

## Do NOT update these fields — leave as-is

**Edificios colapsados** and **Desplazados** — leave both at current values. Two
conflicting figures were found for each and neither cleanly matches the field's existing
definition (one source counts fully-collapsed structures, another counts satellite-assessed
damage — nearly 100x apart; displaced-vs-impacted has the same problem). Do not pick one
and overwrite. Flag both in the PR description as needing a source using the same
definition as the current value before they're touched.

## General
- Update the top-level "Actualizado manualmente — última verificación" date to 2026-07-01
  once the above fields are changed.
- Do not touch any live-fetched data (USGS, GDACS, ReliefWeb feed) — this block is the
  static, hand-maintained one only.
- Do not add a DTV (desaparecidosterremotovenezuela.com) comparison number in this pass.
  Their stats are loaded client-side and weren't retrievable for this update, and their
  "desaparecidos" count uses a different methodology (citizen report count, not an
  official estimate) — adding it without labeling the methodology difference would
  misrepresent both numbers. Separate task if Orlando wants it later.

## Implementation notes (2026-07-02)

- Updated `InformacionLive.tsx` static stats array and `STATS_VERIFIED_DATE`.
- Added i18n keys: `deathsSource`, `injuredSource`, `missingValue`, `missingQualifier`,
  `displacedSource`, `buildingsSource` across all 8 locales.
