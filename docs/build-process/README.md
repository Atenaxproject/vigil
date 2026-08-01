# How we ship

Vigil is built in small, reviewable slices on feature branches. Specs and acceptance criteria come before implementation. Changes that touch authentication, Row Level Security, contact handling, or sanitization go through a pull request so automated review can run before merge.

**Public living docs** (start here):

- [`../../AGENTS.md`](../../AGENTS.md) — canonical agent operating contract
- [`../architecture/DESIGN-SYSTEM.md`](../architecture/DESIGN-SYSTEM.md) — UI tokens and components
- [`../architecture/DEPLOYMENT.md`](../architecture/DEPLOYMENT.md) — local and production setup
- [`../reference/`](../reference/) — API overview, data model, onboarding, glossary

Historical numbered build prompts and internal execution reports are **not published**. They remain in the operator’s private archive for continuity; they are not part of the open-source documentation surface.
