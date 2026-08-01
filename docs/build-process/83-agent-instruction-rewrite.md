# 83 — Agent Instruction Rewrite (AGENTS.md / CLAUDE.md)

**Status:** Complete (2026-07-28) — root `AGENTS.md` is the canonical operating contract  
**Public stub** — full prompt archived privately under `docs/evaluations/`.

## Summary

Day-one `AGENTS.md` / `CLAUDE.md` build scripts granted blanket autonomy and carried stale facts (license, framework, domain, model routing). Prompt 83 replaces them with an operating contract for a **live** production system: no autonomous mode, verbatim hard constraints, agent roles, and authoritative-source precedence (code wins).

## Hard constraints (this prompt)

- Docs only — no `src/`, schema, migrations, locales, or CI config.
- Do not delete the day-one originals; archive under `docs/build-process/00-original-*.md`.
- Do not invent new hard constraints without precedent; flag conflicts in the PR.

## Deliverables

- Root [`AGENTS.md`](../../AGENTS.md) — eleven-section operating contract
- Root [`CLAUDE.md`](../../CLAUDE.md) — thin Claude Code pointer
- Archives: `00-original-agents-build.md`, `00-original-claude-spec.md`
- Cross-reference sweep documented in the PR

See `CHANGELOG.md` (2026-07-28 prompt 83).
