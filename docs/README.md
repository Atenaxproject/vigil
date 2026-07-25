# Vigil Documentation

**Live:** [vigil.youthewave.org](https://vigil.youthewave.org) · **Repo:** [github.com/Atenaxproject/vigil](https://github.com/Atenaxproject/vigil)

Public documentation for contributors and operators deploying their own crisis instance. Internal security evaluations and historical build archives are not part of this tree.

## Structure

| Path | Purpose |
|------|---------|
| `architecture/` | Stack constraints, design system, deployment setup |
| `reference/` | API overview, data model, onboarding, glossary |
| `build-process/` | Short “how we ship” note (historical prompts not published) |
| `accessibility/` | Public accessibility summary |
| `press/` | Press kit source markdown |
| `assets/` | Shared doc assets (e.g. README banner) |
| `outreach/` | Pointer only — outreach packages are private |

## Start here

- [`architecture/CLAUDE.md`](./architecture/CLAUDE.md) — tech stack, ethics constraints, agent contract
- [`architecture/DESIGN-SYSTEM.md`](./architecture/DESIGN-SYSTEM.md) — UI tokens and components
- [`architecture/DEPLOYMENT.md`](./architecture/DEPLOYMENT.md) — Supabase, Vercel, DNS, local dev
- [`reference/api-reference.md`](./reference/api-reference.md) — public API overview
- [`reference/data-model.md`](./reference/data-model.md) — schema and migrations index
- [`reference/onboarding.md`](./reference/onboarding.md) — orientation for users and developers
- [`accessibility/VPAT-SUMMARY.md`](./accessibility/VPAT-SUMMARY.md) — accessibility summary
- [`../CONTRIBUTING.md`](../CONTRIBUTING.md) · [`../CONTRIBUTORS.md`](../CONTRIBUTORS.md)

## Architecture notes

- `architecture/DEPLOYMENT-PLAYBOOK.md` — high-level multi-country pointer (detailed gates are private)
- `architecture/VIGIL-LAUNCH-READINESS.md` — stub; launch checklists are private

## Reference notes

- `reference/VIGIL-COMPLETE-GUIDE.md` — short public product overview
- `reference/sops.md` — stub; admin SOPs are private
- `reference/help-center-structure.md` — FAQ / in-app help outline
- `reference/glossary.md` — PFIF, DTV, ATC-20, platform terms

## For contributors

Read `architecture/CLAUDE.md` first. Read `architecture/DESIGN-SYSTEM.md` before UI. Use `architecture/DEPLOYMENT.md` for local setup. Prefer small PRs; security-sensitive paths always go through review. See root [`CONTRIBUTING.md`](../CONTRIBUTING.md).
