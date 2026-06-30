# Vigil — Mobile-First Rebuild, Dark Mode Removal, Translation Fix

> **Production status as of 2026-06-30**
>
> | Item | Status |
> |---|---|
> | Dark mode removed (`.dark` CSS, no `ThemeProvider`) | Done |
> | `tailwind.config.ts` `darkMode: 'class'` | Done — OS dark mode cannot trigger styles |
> | Mobile layout breakpoint `md` → `lg` (1024px) | Done in Navigation, layout, WeatherBar, FeedbackWidget |
> | Home map height (landscape-safe) | Done — `min(45vh,360px)` on mobile |
> | Real translations pt/fr/it/zh/de/ru | Done via `scripts/generate-translations.mjs` |
> | PWA manifest light colors | Done (`background_color: #F8FAFC`) |

## Paste into Cursor Composer (Agent mode)

---

## TASK A — Remove Dark Mode Entirely

Remove `ThemeProvider`, `.dark` block in `globals.css`, all `dark:` Tailwind
classes, and set manifest light colors only.

---

## TASK B — Mobile-First Rebuild Audit

Audit all pages at 375px portrait and landscape. Fix underlying flex/grid
patterns, not individual pixel patches.

Pages: `/`, `/buscar`, `/reportar`, `/necesito-ayuda`, `/intercambio`,
`/voluntarios`, `/organizaciones`, `/calendario`, `/informacion`, `/como-ayudar`.

---

## TASK C — Generate Real Translations

```bash
node --env-file=.env.local scripts/generate-translations.mjs
```

Script strips markdown fences from Haiku output and supports per-locale args:
`node scripts/generate-translations.mjs de ru`

---

*Archived from root `CURSOR-MOBILE-REBUILD-AND-TRANSLATIONS.md` on 2026-06-30.*
