# 85 — Vigil Watch long-term resilience

**Status:** In progress (2026-08-02)  
**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## Summary

Prompt 84 stopped acute 504s with per-feed timeouts. Prompt 85 makes recurrence structurally unlikely: hazard polling is **sharded**, the GitHub Action isolates watch vs hazard jobs, timed-out feeds enter a **cooldown**, and Vercel Cron provides an **offset backup** schedule.

## Scope

- `?shard=eq|weather|land` on `/api/cron/hazards` (USGS+GDACS stay together for EQ clustering)
- 20-minute cooldown after timeout/abort (via `feed_health`, no schema change)
- `vigil-watch.yml`: independent `watch-scan` job + `hazards` matrix (`fail-fast: false`)
- `vercel.json`: shard crons at minute 15/45 (offset from GitHub’s :00/:30)
- No RLS, locale, or UI changes

## Hard constraints

- Soft-fail individual feeds; shard failure must not cancel other shards
- Keep `CRON_SECRET` bearer auth
- Zero Anthropic calls in this pipeline
- Upserts remain idempotent under dual schedulers

See `CHANGELOG.md` (2026-08-02 vigil-watch long-term resilience). Full prompt: `docs/evaluations/archive-from-public/docs/build-process/85-vigil-watch-long-term-resilience.md`.
