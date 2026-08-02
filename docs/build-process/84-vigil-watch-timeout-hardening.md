# 84 — Vigil Watch timeout hardening

**Status:** Complete (2026-08-02) — shipped in #42; follow-up structural work in prompt 85  
**Public stub.** The full execution prompt is retained in the operator’s private archive (`docs/evaluations/`, gitignored) and is **not published**.

## Summary

Scheduled GitHub Action `vigil-watch` was intermittently failing: `/api/watch/scan` or `/api/cron/hazards` returned HTTP 504 with `FUNCTION_INVOCATION_TIMEOUT` after ~60s. Upstream agency feeds (USGS/GDACS/FIRMS/etc.) could hang with no per-request abort, burning the whole serverless invocation.

## Scope

- Add 15s feed-level timeouts (`withTimeout` + `AbortSignal.timeout` / `feedAbortSignal`)
- Raise `maxDuration` on watch + hazards cron routes to 300s
- Retry once in `.github/workflows/vigil-watch.yml` on non-200
- No schema, RLS, locale, or UI changes

## Hard constraints

- Soft-fail individual feeds (empty batch + feed-health error); do not fail the whole poll because one agency is slow
- Keep `CRON_SECRET` bearer auth unchanged
- Zero Anthropic calls in this pipeline

See `CHANGELOG.md` (2026-08-02 vigil-watch timeout hardening). Full prompt: `docs/evaluations/archive-from-public/docs/build-process/84-vigil-watch-timeout-hardening.md`.
