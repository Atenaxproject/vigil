# 82 — Review-Automation Audit (Copilot / Codex credit drain)

**Status:** Audit complete (2026-07-28) — **root cause is platform UI, not in-repo config**  
**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## Summary

PR #35 (trademark first-use / branding pass — also touched `package.json`, legal pages, `crisis.config`, locales, and press-kit scripts) fired **GitHub Copilot** (quota exceeded) and **ChatGPT Codex** (full review) in parallel. Repo sweep found **no** Actions workflow, CODEOWNERS, settings.yml, PR template, or Codex config that requests those reviews. Live ruleset `main protection` requires CI/CodeQL status checks only — no Copilot reviewer in the API payload. Copilot was still requested at open by actor `Atenaxproject`; Codex connector states it auto-reviews on open / draft-ready / `@codex review`.

## Hard constraints

- Investigation + docs only for the public tree; do not weaken CI, Dependabot, Vercel, CodeQL, or axe.
- Do not claim credit drain “fixed” until Orlando disables Copilot auto-review and Codex auto-on-open in GitHub / Codex dashboards.
- No application code, security, schema, or locale changes.

## Operator follow-up (required)

1. Repo Rulesets → disable “Automatically request Copilot code review” (and/or “Review new pushes”).
2. Personal Copilot → Automatic Copilot code review → Disabled.
3. Codex connector for this repo → comment-only (`@codex review`).
4. Then smoke one draft docs PR — no bot review until manually requested.

See `CHANGELOG.md` (2026-07-28 prompt 82). Full prompt + operator checklist: `docs/evaluations/archive-from-public/docs/build-process/82-review-automation-audit.md`.
