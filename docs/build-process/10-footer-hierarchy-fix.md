# Vigil — Footer Visual Hierarchy Fix
## Paste into Cursor Composer (Agent mode)

---

Read @docs/architecture/DESIGN-SYSTEM.md before starting.

## Problem

The footer currently renders three logical groups (open source/legal, credits,
emergency disclaimer) in flat uniform gray — hard to scan. There is no visual
separation between groups, the "Atenax Project" link is indistinguishable from
plain text, the safety-critical disclaimer reads at the same low weight as
everything else, and there is an awkward whitespace gap between "Contacto" and
"Hecho con esperanza…".

## Required changes (apply these exact requirements)

1. **Group separation:** add a thin top border (1px, `--vigil-border`) above each
   of the three groups, with consistent 16px vertical spacing between groups.
2. **"Atenax Project" link:** style it in `--vigil-blue` with underline on hover
   so it's clearly a link (currently indistinguishable).
3. **Safety-critical line** ("Vigil NO es un servicio de emergencias…"): give it
   slightly more weight than surrounding footer text — use `--vigil-body` color
   (not muted), and add a small warning/info icon (Lucide, e.g. `AlertTriangle`
   or `Info`, 16px) before it. Do NOT make it loud — still quiet per
   DESIGN-SYSTEM.
4. **Spacing:** remove the awkward whitespace gap between "Contacto" and "Hecho
   con esperanza…"; make inter-group spacing intentional and consistent
   (16–20px).

## Rules

- Keep it minimal and quiet per DESIGN-SYSTEM.md — clarity and hierarchy, not
  decoration.
- Maintain dark mode correctness (use the dark tokens).
- i18n: any new strings authored in ES + EN and merged as placeholders to the
  other locales.
- Accessibility: the icon is decorative (`aria-hidden`); the link has
  discernible text.
- Caption text stays `11px` minimum (DESIGN-SYSTEM typography floor); one blue
  only (`--vigil-blue`) for interactive elements.

## Implementation notes (resolved 2026-06-30)

The footer lives **inline in `src/app/layout.tsx`** (there is no `Footer.tsx`).
The earlier reconstruction of this doc proposed a loud, red `tel:` hotline
button as a prominent first tier; that contradicted the actual intent ("quiet,
not loud"). This pass replaced that with Orlando's real requirements above.

What changed:

- **Design tokens.** Added `--vigil-border`, `--vigil-body`, and
  `--vigil-surface` to `:root` in `src/app/globals.css`, each with a `.dark`
  override (`#374151`, `#cbd5e1`, `#111827`) so the footer is dark-mode correct.
  (`--vigil-muted` already had a dark override.)
- **Group separation (#1).** The footer now stacks three groups — open
  source/legal, credits, emergency disclaimer — each with a `1px` top border in
  `--vigil-border` and uniform `py-4` (16px) padding, giving consistent,
  intentional spacing and a clear scan order.
- **Atenax link (#2).** "Atenax Project" is now `text-vigil-blue` with
  `hover:underline` (was muted, blue only on hover) so it reads as a link.
- **Safety line (#3).** The "Vigil NO es un servicio de emergencias…" line uses
  `--vigil-body` (not muted) at `font-medium`, prefixed by a 16px Lucide
  `AlertTriangle` icon (`aria-hidden`, `--vigil-body` tint). It is heavier than
  surrounding caption text but stays quiet — no red, no button. The always-on,
  tappable hotline lives in the sticky `EmergencyBanner`, so the footer does not
  duplicate it as a loud control.
- **Spacing (#4).** The previous tinted/red first tier and uneven `py-5` credit
  block were removed; all three groups share `py-4`, eliminating the awkward gap
  between "Contacto" and "Hecho con esperanza…".

No new i18n keys were required — the footer reuses existing `footer.*` and
`nav.*` keys, which are already present (ES + EN authored, other six locales
inherit placeholders).

## Commit

Combined with the Part A mobile/dark-mode verification in a single commit:

```bash
git add -A
git commit -m "fix: footer visual hierarchy; docs: update build-process 10-footer-hierarchy-fix"
git push origin main
```
