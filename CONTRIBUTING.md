# Contributing to Vigil

Thank you for helping improve an open-source humanitarian crisis platform. Families searching for missing people — and responders coordinating aid — are the users this code serves.

## Before you write code

1. Read [`docs/architecture/CLAUDE.md`](./docs/architecture/CLAUDE.md) — non-negotiable product and stack constraints.
2. Read [`docs/architecture/DESIGN-SYSTEM.md`](./docs/architecture/DESIGN-SYSTEM.md) before UI work.
3. Prefer a short written scope (issue or PR description) before a large change. Spec before code.

## Ground rules

- **Spanish first** for user-facing copy; keep locale key parity (CI enforces).
- **Never invent statistics** to fill empty states — suppress instead.
- **No donations solicitation** in product UI until the operator’s legal registration is complete.
- **Vigil is not a dispatcher** — rescue needs must not become intake that pretends to dispatch.
- **Contact privacy** — never expose reporter/volunteer contact fields on public listings.
- **Security-sensitive changes** (RLS, auth, contact handling, sanitization) must go through a pull request.

## Workflow

1. Fork or branch from `main` — never commit directly to `main`.
2. Use a descriptive branch name (`feat/…`, `fix/…`, `docs/…`, `security/…`).
3. Keep PRs small and reviewable.
4. Run locally: `npm run lint`, relevant tests, and `npm run build` when you touch i18n or shared lib code.
5. Update `CHANGELOG.md` for user-visible or security-relevant changes.

## What we are not looking for

- Dark mode or unrelated redesigns
- New backend stacks (Firebase, MongoDB, GraphQL, Prisma, etc.)
- Features that store biometrics or claim facial recognition on Vigil’s side
- Public documentation of unfixed security defects or admin attack surface

## Conduct

Be respectful. This project deals with trauma and missing persons. Do not scrape personal data, do not test against production with real PII, and do not publish exploit detail in issues — email `vigil@youthewave.org` for sensitive reports.

## License

By contributing, you agree your contributions are licensed under the MIT License covering this repository’s code. Submitted personal data in any live deployment is governed by that deployment’s privacy policy — not by MIT.
