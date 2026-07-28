# Vigil — product overview

**Live:** [vigil.youthewave.org](https://vigil.youthewave.org)  
**Tagline:** *We stand watch when it matters most.*

Vigil is an open-source humanitarian crisis PWA. It aggregates proven tools (seismic feeds, partner platforms, PFIF interoperability) and adds missing-persons search, a crisis map, resource exchange, and volunteer coordination — Spanish-first, privacy-preserving, not a donations processor, and not an emergency dispatcher.

## What is public in this repo

| Document | Contents |
|----------|----------|
| [onboarding.md](./onboarding.md) | User and developer orientation |
| [api-reference.md](./api-reference.md) | Public API overview |
| [data-model.md](./data-model.md) | Schema and migration index |
| [help-center-structure.md](./help-center-structure.md) | In-app help outline |
| [glossary.md](./glossary.md) | Platform terminology |
| [`../../AGENTS.md`](../../AGENTS.md) | Stack and non-negotiable constraints |
| [`../architecture/DESIGN-SYSTEM.md`](../architecture/DESIGN-SYSTEM.md) | Design tokens |

## Privacy stance (summary)

- Contact details for missing-persons reporters and similar submissions are never shown on public listings.
- Contact flows go through request/claim mechanisms, not public phone numbers.
- No facial recognition or biometric storage by Vigil; photo search uses vision *text description* of features.
- Government data-sharing tools are intentionally excluded from the product surface.
- Vigil does not solicit donations until legal registration requirements for the operator are met.

## What is not published

Full internal operational encyclopedias, launch gap inventories, admin SOPs, and historical build-prompt archives stay with the operator. That is intentional: the open-source surface should help families and contributors, not advertise attack surface.

For contributing, see [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md) and [`../../CONTRIBUTORS.md`](../../CONTRIBUTORS.md).
