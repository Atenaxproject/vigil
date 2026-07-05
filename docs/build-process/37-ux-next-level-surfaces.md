# 37 — UX Next-Level Pass: Surface Redesigns + Fix Sweep

**Date:** 2026-07-05

Plan approved by Orlando 2026-07-04; design directions chosen from a 6-direction
exploration artifact (3 per surface). Picks: **Mode picker B (two-tier)** and
**Emergency bar C (split bar + directory sheet)**.

## Surface 1 — Mode picker (ModePicker.tsx, two-tier redesign)

- Crisis-urgent modes (busco a alguien, necesito ayuda, equipo de rescate) as
  large icon cards under an "Ahora mismo" label; planning modes (quiero ayudar,
  soy organización, solo información) as compact rows under "Para ayudar o
  informarte"; "Ver todo / Omitir" pinned as full-width quiet button.
- Icons per mode (Search, LifeBuoy, HardHat, HeartHandshake, Building2, Info).
- Added Tab focus trap + focus restore (parity with the Navigation sheet).
- **Fixed a live selection bug:** `handleSelect` called `onSelect(mode)` then
  `onClose()`; the close handler's stale `rawMode === null` check synchronously
  overwrote the just-chosen mode with `ver_todo` in localStorage. **Since the
  picker shipped, no first-visit mode selection ever actually stuck.** Verified
  fixed via Playwright: select → reload → `vigil_view_mode = busco_a_alguien`,
  filtered nav, mini-guide shown, picker not re-shown.
- New i18n keys: `viewMode.tierUrgent`, `viewMode.tierPlanning` × 8 locales.

## Surface 2 — Emergency bar (EmergencyBanner.tsx, split bar + sheet)

- Collapsed bar is now minimal: 911 tel button + **carrier chips visible on
  mobile** (Movistar 911 · Digitel 112 · Movilnet *1 · Cantv 171 — previously
  `lg:inline`, i.e. desktop-only, which was backwards) + "Directorio" button +
  aftershock counter.
- "Directorio" opens a focus-trapped bottom sheet (centered modal on desktop,
  z-[110]) with all contacts grouped, every number a 48px `tel:` row, per-number
  amber "Sin verificar" tags, secondhand-source warning note, and a link to
  `/informacion#emergency-contacts`.
- `tel:` hrefs now percent-encode `*` (Movilnet `*1` was previously stripped to
  `tel:1` — wrong number).
- Structured `carrierCodes` array added to `crisis.config.ts` (rescate entry);
  `carrierAccess` display string kept.
- New i18n keys: `banner.directory`, `directoryTitle`, `unverified`,
  `secondhandNote`, `carrierCodes` × 8 locales.

## Fix sweep (committed separately as fa7e591)

1. **Search error state** — failed `/api/missing-persons/search` requests showed
   the "no results" empty state; now a distinct error card with retry.
2. **Form validation** — field-specific messages (invalidEmail, tooShort,
   invalidAge, mustAccept) via zod message keys + `common.validation.*`;
   email error was validated but never rendered — now shown.
3. **Silent submission block** — empty age input produced `NaN` via
   `valueAsNumber`, failing `z.number().optional()` with no visible error;
   now `setValueAs` maps empty → `undefined`.
4. **i18n parity** — backfilled 41 keys in pt/fr/it/zh/de/ru and 22 in en
   (diasporaHub, psychosocial hotlines, remittances/OFAC, volunteer skills,
   regionScope); all 8 locales at parity (967 → 979 keys after this pass).
   Removed internal reminder text leaked into user-facing hotline copy; fixed
   es typo ("e riesgo" → "y riesgo").
5. **Skeletons** — CrisisMap react-leaflet chunk gets a loading shimmer;
   search results get card-shaped skeleton grid.
6. **Touch targets** — 44px for geo filter chips, sheet close buttons,
   collapsed sidebar logo, admin status select; larger consent checkboxes.

## Verification

- `npm run build` clean (39 pages).
- Playwright against local prod build: picker two-tier renders on 390px and
  1440px; carrier chips tappable on mobile; directory sheet groups + tags
  correct; mode selection persists across reload.

## Deferred backlog (next passes)

- **Web Push** — aftershock M4+ alerts, match notifications (VAPID keys,
  subscriptions table, sw handlers, permission UX).
- **Admin moderation queue** — replace the "use Supabase Studio" placeholder;
  unify `/admin` (Supabase auth) with `/admin/feedback` (shared secret).
- **Emergency number verification** — all 4 contacts still `verified: false`
  (secondhand from sos.yummyrides.com). The UI shows "Sin verificar" tags until
  Orlando confirms each number; flip `verified: true` in `crisis.config.ts`.
- `privacidad/page.tsx` TODO — legal operator line pending YouTheWave Inc.
