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

**Repo land complete 2026-07-26:** recon doc frozen; `#15` → `#16` → `#17` merged; `#18` merged with canonical SQL `021`–`024`.  
**Prod SQL (2026-07-26 ship):** live verify found 020 + 021 + 024 effects present; **022 + 023 applied** via Actions (`SUPABASE_DB_URL`) — post-probe: `coverage_state` + `flag_missing_person` OK. One-shot workflow removed after green run.  
**Upstash:** still unset in Vercel Production — durable RL remains in-memory fail-open until REST URL + token are added and the app is redeployed.
