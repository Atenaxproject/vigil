# Vigil — Footer Visual Hierarchy Fix
## Paste into Cursor Composer (Agent mode)

---

> **Source note.** No standalone `CURSOR-*FOOTER*` prompt existed in the repo or
> in the captured agent transcripts — the original footer instruction was an
> attachment that was not persisted. This file reconstructs the intent from
> `docs/architecture/DESIGN-SYSTEM.md`, the existing footer in
> `src/app/layout.tsx`, the credits spec in `04-pwa-and-credits.md`, and the
> resume task brief ("footer hierarchy — emergency disclaimer, hotline, credits
> (Orlando + Claude + Cursor), legal/privacy links, open source line").

Read @docs/architecture/DESIGN-SYSTEM.md before starting.

## Problem

The footer renders everything at one flat visual weight (all `text-[11px]`
muted, centered), in an order that buries the most safety-critical line:

```
Built for the people of Venezuela
Open source — MIT License
Contact
Made with hope and love for Venezuela 🇻🇪
A project by Orlando Toro — Atenax Project
Vigil is NOT an emergency service. For immediate rescue call: 0800-RESCATE
```

The "NOT an emergency service" disclaimer + hotline is the single most important
thing in the footer in a crisis context, yet it sits last and smallest. There is
no legal/privacy linking, and the build attribution (Claude + Cursor) is missing.

## Required hierarchy (top → bottom)

1. **Tier 1 — Safety disclaimer (most prominent).** The "Vigil is NOT an
   emergency service" sentence in body weight (`13px`, `--vigil-body`), in its
   own bordered/tinted block, with the emergency hotline as a large, tappable
   `tel:` button (red `--status-missing`, mono, ≥44px touch target).
2. **Tier 2 — Credits (understated, centered).** "Made with hope and love for
   Venezuela 🇻🇪", then "A project by Orlando Toro — Atenax Project"
   (Atenax = link to `https://atenaxproject.com`, blue on hover only), then a
   quiet build line: "Built with Claude + Cursor".
3. **Tier 3 — Legal / meta (smallest).** A wrapping `·`-separated row:
   Privacy Policy · Terms of Use · Contact · Open source — MIT License ·
   Built for the people of Venezuela.

## Rules

- Caption text stays `11px` minimum (DESIGN-SYSTEM typography floor).
- One blue only (`--vigil-blue`) for interactive hover; red only for the hotline.
- Legal links must be locale-aware: ES → `/privacidad`, `/terminos`;
  other locales → `/privacy`, `/terms` (pages already exist).
- Reuse existing i18n keys `nav.privacy` / `nav.terms` for the link labels.
- All footer strings remain translatable (ES + EN authored; other 6 locales
  inherit the existing English placeholders already present in their files).
- Touch targets ≥44px on the tappable elements (hotline + legal links).

## i18n

Add one new key to `footer` in every locale (`es` translated, others EN):

```json
"footer": { ..., "builtWith": "Built with Claude + Cursor" }
```
- `es`: `"Construido con Claude + Cursor"`

## Implementation notes (resolved 2026-06-30)

Footer lives **inline in `src/app/layout.tsx`** (there is no `Footer.tsx`).
Implemented the three-tier structure there:
- Tier 1 block uses `bg-vigil-cloud` with the disclaimer in `text-[13px]` and a
  red `tel:` hotline button (`min-h-[44px]`, `font-mono`).
- Tier 2 credits keep Atenax as an external link; added `footer.builtWith`.
- Tier 3 is a `flex-wrap` row of locale-aware `next/link` legal links + contact
  + open-source line, separated by muted `·`.
- Added `import Link from 'next/link'` and a second `getTranslations('nav')`
  call for the Privacy/Terms labels.

## Commit

Combined with the mobile/dark-mode fix in a single commit:

```bash
git add -A
git commit -m "fix: mobile dark mode and footer hierarchy; docs: add build-process 09-10"
git push origin main
```
