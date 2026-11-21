# Maintained demo operation

This configuration keeps the original Vigil application available while removing
nonessential background ingestion. It is a draft change until reviewed and merged.
GitHub schedule changes apply on the default branch; Vercel schedule changes need
a subsequent authorized deployment. Opening this PR does not stop existing jobs.

## Automatic work

| Job | Demo behavior | Previous UTC schedule |
| --- | --- | --- |
| GitHub `vigil-watch` (watch + eq/weather/land) | Manual dispatch only | `*/30 * * * *` |
| Vercel `/api/cron/hazards?shard=eq` | Manual only | `15,45 * * * *` |
| Vercel `/api/cron/hazards?shard=weather` | Manual only | `15,45 * * * *` |
| Vercel `/api/cron/hazards?shard=land` | Manual only | `15,45 * * * *` |
| Vercel `/api/cron/dedup` (AI) | Manual only | `0 8 * * *` |
| Vercel `/api/admin/sync-dtv-centers` | Manual only | `0 6 * * *` |
| Vercel `/api/admin/sync-cav-centers` | Manual only | `0 6 * * 1` |
| Vercel coverage decay | Unchanged | `0 7 * * *` |
| Vercel retention | Unchanged | `0 2 * * *` |
| GitHub encrypted DB backup | Unchanged | `15 7 * * *` |
| GitHub synthetic uptime | Public pages only, no secret | `0 */6 * * *` |

The removed schedules account for 192 GitHub job starts and 144 Vercel hazard
invocations per day, plus daily dedup/DTV sync and weekly CAV sync, before retries
or missed runs. This is not a cost estimate. Hosting, storage, backups, maintenance,
CI and user-driven requests remain. Search, reports, AI features and request-driven
feed reads retain their existing behavior and can consume resources. Public-page
rendering can also record existing feed-health telemetry; the uptime change removes
explicit maintenance mutations, not all application-side effects of page requests.

Stored hazards/watch entries and partner centers will no longer refresh on these
schedules. Empty or old results do not establish that an area is safe. This demo
must not be represented as a continuously monitored emergency service. Existing
emergency guidance is unchanged. No live data has been removed or anonymized;
retaining a demo is not permission to expose private records.

## Manual operation

For an intentional watch/hazard refresh, use GitHub Actions → `vigil-watch` →
Run workflow on the reviewed deployed branch. This runs all four jobs against
`https://vigil.youthewave.org`; it writes data and can send existing watch
notifications. Do not dispatch it as a test or against an unrelated deployment.
The existing GitHub `CRON_SECRET` must match that deployment; no secret is needed
for synthetic uptime.

The removed Vercel routes remain available as authenticated GET operations using
`Authorization: Bearer <existing CRON_SECRET>`. Call only the specific route and
hazard shard needed on the intended deployment. Dedup can invoke paid AI and sync
routes write center records. Keep credentials out of shell history, logs and PRs.
These are maintenance actions, never health probes. Existing admin authorization
for center synchronization is unchanged.

To check page availability only:

```sh
BASE_URL=http://127.0.0.1:3000 npm run test:uptime
```

This checks `/`, `/buscar`, `/reportar`, `/informacion` without credentials. It does
not establish database health, feed freshness, backup success or restore readiness.

## Reactivation and rollback

1. Review the deployment, feed credentials, operating budget and stored-data
   freshness before resuming automated ingestion. Confirm who will monitor it.
2. In a reviewed PR, restore the relevant entries in `vercel.json` using the table
   above. Restore `on.schedule` in `.github/workflows/vigil-watch.yml` only if the
   GitHub schedule is also wanted. The original dual schedule intentionally ran
   hazard shards on both providers; restoring both restores that extra load.
3. Run tests, typecheck, lint and build; obtain approval to merge and deploy.
   Verify schedules and an authorized refresh on the intended deployment.
4. Keep uptime public-only. Never restore the authenticated retention probe.

The pre-change source is recorded by `restore/pre-maintained-demo-20261115` at
`cc9d3e99b256766dbf80cd26101872ab429b0912`. Prefer targeted schedule restoration
over reverting the uptime fix. No provider settings are changed by this work.

Nightly backup and all backup/data resources are deliberately untouched. Restore
verification is still pending and must be completed separately before considering
any reduction to backup retention, storage, or database resources.
