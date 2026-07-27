# Extending crisis archetypes & `region_scope` (scaffolding)

**Status:** documentation / config pattern only. **Do not** use this to activate Florida or México production (DNS, locale flip, registry `live`) until `TODO-BEFORE-LAUNCH.md` gates are checked.

Venezuela remains the live deployment. Additional disaster archetypes and geographic scopes reuse patterns already in the codebase.

---

## Disaster archetypes (preparedness)

Type: `DisasterArchetype` in `src/types/vigil.types.ts`  
(`earthquake` | `hurricane` | `tornado` | `flood` | `wildfire` | `volcanic` | `tsunami` | `winter_storm`)

| Layer | Where | Notes |
|-------|--------|--------|
| Active on VE | `CRISIS_CONFIG.disasterArchetypes` | Currently `['earthquake']` |
| Prep content | `src/content/preparedness/` + `_schema.ts` | v1 ships guides for earthquake / hurricane / flood; other enum values are schema-ready |
| Routes | `/preparacion`, `/preparacion/[archetype]` | Driven by `PREPAREDNESS_ARCHETYPES` |
| Country templates | `florida.config.ts`, `mexico-pacific.config.ts` | **prebuilt** in registry — not live |

Adding a new prep guide: author content from official sources only (Ready.gov / FEMA / NWS / Red Cross / PAHO rules in `_schema.ts`), add to `PREPAREDNESS_ARCHETYPES`, keep all 8 locales if UI strings change.

---

## `region_scope` (map / orgs / events / exchange)

Type: `RegionScope = 'venezuela' | 'usa_diaspora'`

The USA diaspora hub (`/apoyo-usa`, migration `011`) is the **reference pattern** for a second geographic layer on the same VE deployment without a new Vercel project:

1. Migration adds `region_scope` (default `venezuela`) on relevant tables.
2. Config object (see `diasporaSupportConfig` in `crisis.config.ts`) holds bounds + labels.
3. API routes accept `region_scope` query/body and filter `.eq('region_scope', …)`.
4. UI hubs fetch with the matching scope; home map can tab between scopes.

**New scope checklist (future):** migration + type union + Zod enums on submit routes + map bounds helper + UI hub. Do **not** invent a scope that maps to FL/MX activation — those are separate deployments via `src/config/deployments/`.

---

## Optional product explorations (backlog — not built here)

- Voice intake for low-literacy / field use  
- Deeper PFIF exchange **by partner agreement**  
- Specialized Field / Family surfaces  

Prefer a numbered prompt + BMAD spec before any of these become code.

---

*Added 2026-07-27 — next-round optional integrations workstream.*
