# 79 — Phase 2–3 Stack Reconciliation, Migration Fork Resolution, and Landing

**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## What this slice covers (safe summary)

- Freeze a private canonical migration sequence that resolves the conflicting `020` lineages across `main`, the phase stack (#15–#17), and insert-lockdown (#18).
- Rebase #15 onto current `main`, repair #17 CI, and land **#15 → #16 → #17** then **#18** under the mandatory PR / CodeQL path.
- Do **not** apply SQL to production from this prompt — hand an ordered file list to the Supabase/Codex operator.
- Verify durable rate-limit (Upstash) env on production; flag if unset.

## Hard constraints (public)

- Mandatory PR — no direct-to-main for RLS/migrations.
- One linear, gap-free migration sequence — do not deepen the fork.
- No production SQL apply from the agent session.
- Venezuela finalization only — do not activate Florida / México.
- Reconciliation detail stays private under `docs/evaluations/`.

## Private material (not in this stub)

Full lineage tables, prod-unknown markers, and the Codex apply checklist live in `docs/evaluations/migration-reconciliation-2026-07-26.md` (gitignored).

## Status

In progress 2026-07-26: recon doc frozen; #15 rebased MERGEABLE; #17 lockfile + ChromeDriver CI fixes pushed; land blocked on `main protection` review-thread resolution. Upstash unset in prod (Orlando decision).
