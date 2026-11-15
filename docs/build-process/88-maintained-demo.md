# 88 — Maintained open-source demo

Status: implementation proposed; human review required before merge or deployment.

## Goal and authorization

Keep the original main deployment functional as an open-source demo with lower
background consumption. This request authorizes a feature branch and draft PR,
not merging, deployment, provider changes, or live-data operations. It supersedes
the older production-response framing in AGENTS.md for this task; all privacy
and safety constraints remain applicable. Florida work and spec 89 are separate.

## Scope before implementation

- Remove the automatic Vigil Watch schedule; retain authenticated manual dispatch
  and all four jobs (watch plus three hazard shards).
- Remove Vercel hazard, AI deduplication, and partner-center sync schedules.
  Preserve retention and coverage-decay maintenance unchanged.
- Make the synthetic uptime script public-route-only even if CRON_SECRET exists;
  remove that secret from the uptime workflow.
- Document remaining resource use, manual operation, and exact reactivation steps.
  Do not claim that scheduled feeds remain live or that the demo is cost-free.
- Preserve nightly database backup workflow and all backup/data resources.
  No provider settings, permissions, secrets, databases, migrations or deployments.
- Preserve maintenance/security CI. Add offline regression tests and run tests,
  typecheck, lint, and build. Record failures and environmental limitations.

## Acceptance

Manual dispatch remains available, disabled schedules are absent, and a mocked
uptime run with a secret sends no authorization header or mutating cron request.
Backup workflow is byte-for-byte unchanged. No UI/emergency guidance changes.

## Reactivation / rollback

See docs/operations/maintained-demo.md. Restore tag:
`restore/pre-maintained-demo-20261115` (main cc9d3e9).

## Execution evidence — 2026-11-15

- Based on latest main `cc9d3e99b256766dbf80cd26101872ab429b0912`;
  reviewed open PRs (including specs 86/87 and metadata PR 84). No overlapping
  original-main implementation found. Florida checkout/branch untouched.
- `npm ci --ignore-scripts`: passed; lockfile unchanged.
- `npm test`: 13 files, 66 tests passed, including six new offline regression tests.
- `npx tsc --noEmit`, `npm run lint`: passed.
- Existing sanitizer, feed fixtures, rate-limit and deployment validation scripts:
  passed. Build precheck: eight locales / 1,305 keys aligned.
- `npm run build`: passed. Warning: existing Supabase dependency uses
  `process.version` in the Edge Runtime import path; webpack also reports cache
  serialization warnings. No dependencies were changed in this task.
- `git diff --check`: passed. Backup, CI, CodeQL, Supabase and lockfile diffs empty.
- No production probes, manual ingestion, backup restore, merge or deployment run.
- Prepared for draft PR publication. Human review and remote CI remain required;
  merge and deployment are outside this execution scope.
