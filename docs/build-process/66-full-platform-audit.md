# 66 — Full Platform Audit (DONE)

**Executed:** 2026-07-22 (after 67 freshness fix)

## Why staleness wasn't site-wide

Prompt 63 REV2 (`getFigureFreshness`) applied to **sourced_figures / DB-backed stats**, not to **hardcoded i18n + page constants** on `/como-ayudar`. Peak USAR counts and Ria waiver lived in locale strings / static arrays with no `verified_at` / `expiresAt`.

## Content inventory (dated claims)

| Item | Location | Date | Disposition |
|---|---|---|---|
| Ria fee waiver | `/como-ayudar` transfers | expires 2026-07-15 | **Expired copy** — shows `noteExpired` |
| USAR 2,624 / 137 / 44 | `/como-ayudar` teams | verified 2026-06-27 | **Suppressed** (&gt;21d peak figure) → ReliefWeb link |
| UCV "activo el 27 de junio" | collection points | 2026-06-27 | **Suppressed** |
| GEM duplicate cards | page + DB | — | **Dedupe** by donation URL / name |
| RCF Cruz Roja AR/CO/HN | was top of `/como-ayudar` | — | **Relocated** to search CTA → `/buscar` `/red` |
| OFAC GL 60 | `/como-ayudar` | expires 2026-10-23 | **Kept** + expiry metadata |
| IRC matching | (if present in DB) | through 2026-09-30 | Leave; attach expiry when edited |
| Crisis info "Actualizado: 29 junio" | `crisisInfo.updated` | 2026-06-29 | **Deferred** — informacion now prefers live/sourced figures; static string still in locales |
| Infra "al 29 junio" | locales | 2026-06-29 | **Deferred** — already gated by 63 on live infra rows |

## Mechanism shipped

`src/lib/content-expiry.ts` — `expiresAt` / `verifiedAt` + `suppressWhenStale`; `dedupeDonationOrgs()`.

## Route-by-route (summary)

| Route | Content | Notes |
|---|---|---|
| `/` | Live map | Freshness fixed in 67 |
| `/buscar` `/reportar` | Core MP | OK |
| `/como-ayudar` | Donations | Fixed this prompt |
| `/informacion` | Live + figures | Provenance 63 |
| `/estadisticas` | DTV + sourced | OK |
| `/organizaciones` `/voluntarios` `/intercambio` | Directories | Empty CTAs from 62 |
| `/monitor` | New in 68 | Global relay |
| `/prensa` | Press kit | 65 |
| `/regiones` `/preparacion` | Expansion | OK |
| `/privacidad` `/terminos` `/privacy` `/terms` | Legal | OK |
| Legal EN aliases | OK | |
| Auth / mi-* tokens | Functional | |
| `/admin` | + feed health | 67 |

## Link reachability (sample)

- ReliefWeb API: **410** (documented in 67) — do not auto-remove human links to reliefweb.int HTML.
- Full automated crawl of every outbound URL: **deferred** (report-only; temporary 5xx ≠ dead).

## Mobile dark mode

`colorScheme: 'light'` + `darkMode: 'class'` with no `.dark:` utilities — unchanged. Not escalated to P0; spot-check on device still recommended for Orlando.

## Repo hygiene

- CHANGELOG updated this session for 66–68.
- README index notes build-process 66–68 archives.
- Root prompt stubs deleted after archive.

## Deferred (Orlando / follow-up)

- Full outbound link crawl script + report.
- `scripts/visual-check.mjs` proof pack for every changed route.
- Rewrite marketing README screenshots if still stale.
- GitHub repo description/topics via `gh` (needs Orlando token confirm).
- Suppress remaining static `crisisInfo.updated` / peak copy in all locales beyond `/como-ayudar`.
