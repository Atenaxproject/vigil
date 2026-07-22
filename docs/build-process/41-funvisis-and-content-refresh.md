# 41 — FUNVISIS Integration + Content Accuracy Pass
## Prepared by Claude for Cursor Agent
## Context: Orlando Toro / youthewave · July 2026
## Status: COMPLETED 2026-07-04

Small, bounded round — content accuracy and one new public data source. No architecture changes, no new routes, no schema changes beyond one new lib file. Read `VIGIL-COMPLETE-GUIDE.md` Section 9 (Integrations) before starting so this doesn't duplicate what's already live.

---

## 1. ADD FUNVISIS AS A SECOND SEISMIC SOURCE

Vigil currently pulls seismic data from USGS only (`src/lib/usgs.ts`). FUNVISIS (Venezuela's national seismological service, funvisis.gob.ve) catalogs smaller local aftershocks that USGS doesn't — confirmed by cross-referencing sos.yummyrides.com, which runs both sources side by side and labels each event by origin.

Create `src/lib/funvisis.ts`, mirroring the existing `usgs.ts` pattern (same shape of function exports, same revalidate/caching approach). Merge FUNVISIS events into the same seismic feed consumed by the crisis map and `/informacion`, and — this part matters — **label each event with its source** ("USGS" or "FUNVISIS"), the same way Yummy's page does it. Don't silently merge them into one undifferentiated list; provenance matters when the two sources can disagree on magnitude or existence of a small local event.

If FUNVISIS doesn't expose a clean JSON/XML feed and only has an HTML page, check `funvisis.gob.ve` directly before building a scraper — don't assume Yummy is scraping it (they may have their own agreement or feed access). If no feed exists, flag this back rather than building something fragile.

**Build outcome:** No `funvisis.ts` — no official JSON/XML feed found (HTML only; SSL timeout from build environment). Implemented `src/lib/seismic.ts` merge layer with USGS source labels; FUNVISIS merge stub documented for future feed.

---

## 2. RECONCILE EMERGENCY CONTACT NUMBERS

Cross-referencing `sos.yummyrides.com`'s emergency directory against what's likely in `crisis.config.ts` today surfaced a more complete set than the single [former rescue-coordination label] line documented in earlier Vigil references:

- Emergencias nacional — 911 (carrier access: Movistar 911, Digitel 112, Movilnet *1, Cantv 171)
- Protección Civil — [do-not-ship-PC-alt] (alt: 0800 266-8446, 0800 262-4368)
- Cruz Roja Venezolana — 0212-578-2516 (alt: 0212 571-2411)
- FUNVISIS — 0212-257-5153 (alt: 0800 836-2567)

**Orlando verifies these directly before they ship** — this list is secondhand from another platform's page, not a primary source Claude confirmed independently. Once verified, update `crisis.config.ts` and the emergency banner/info hub to show the fuller set rather than a single number, matching the level of detail Yummy's page shows.

**Build outcome:** Added `emergencyContacts` to `crisis.config.ts` with `verified: false`; banner + `/informacion` show verify-before-calling language.

---

## 3. ORGANIZATIONS DIRECTORY REFRESH

Audit the current `organizations` table against what's verifiably still active on the ground, based on this month's research:

- Confirm Global Empowerment Mission (GEM) and AFE (Amor, Fe y Esperanza) are seeded if the diaspora hub round already shipped — if not, that's a dependency on the earlier prompt, not this one.
- Review the existing 17 seeded orgs (Bible-era list: IFRC, UNICEF, IRC, Direct Relief, GEM, Los Topos, Team Rubicon, Samaritans Purse, Convoy of Hope, Cadena, Save the Children, UNHCR, Cruz Roja Venezolana, Proteccion Civil, JRS, International Medical Corps, OCHA) for anything that's gone quiet — don't delete, but consider a lower-priority sort position for orgs with no recent activity versus ones with confirmed current operations.
- Do NOT add Yummy as an organization entry yet — wait for the outreach response. Listing a company without contact first is worse than not listing it.

This is a manual verification task as much as a code task — Cursor can build the sort/priority mechanism, but Orlando confirms which orgs are still actually active before the ranking changes.

**Build outcome:** `orgDisplayPriority` in `crisis.config.ts`; `getApprovedOrganizations()` sorts by priority then name.

---

## 4. WHAT NOT TO DO THIS ROUND

- No integration code for venezuela-earthquake-map or Yummy SOS — neither has a documented public API, and both outreach messages are still pending replies.
- No changes to the missing-persons search, DTV federation, or the diaspora hub — untouched.
- No adaptive/role-based navigation work — that's a separate, larger spec, intentionally not bundled here.
