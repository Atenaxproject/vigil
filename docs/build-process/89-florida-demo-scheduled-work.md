# 89 — Florida demo: reduce optional scheduled work

Date: 2026-11-15
Status: scoped proposal; human review and deployment verification required
Target: `deploy/florida-v2`, not `main`

## Owner intent and scope

Keep both Vigil editions maintained as functional open-source demonstrations,
without unnecessary always-on work. This first Florida change removes only
scheduled AI deduplication and Venezuela-specific DTV/CAV center imports from
`vercel.json`. It does not disable their authenticated endpoints.

## Preserved behavior

- Retention and coverage-decay schedules remain unchanged: privacy/data lifecycle
  and coverage freshness are not treated as expendable demo overhead.
- Hazard schedules remain unchanged until a separate, explicitly labeled demo
  data strategy is verified. Removing them now could silently stale live-looking
  hazard displays.
- Database backups, GitHub workflows, application routes, access controls,
  credentials, schema and deployment configuration outside these three entries
  are unchanged. No merge, production deployment, database deletion or migration.
- No claims of a current backup, restored database or healthy live deployment.

## Acceptance checks

1. Parse before/after JSON and verify exactly three paths removed: dedup,
   sync-dtv-centers, sync-cav-centers.
2. Verify all five remaining schedule objects are byte-equivalent values.
3. Verify the diff contains only this spec and `vercel.json`, with no backup or
   runtime source changes; run `git diff --check`.
4. Human review before merge; verify Florida deployment mapping and live demo
   behavior after any separately authorized deployment.

## Rollback and remaining work

A local restore tag `restore/florida-before-demo-crons-2026-11-15` points at
`3029fffaf52eb6086e4363b62811a4e9bb2f7130`. Reverting the configuration commit
restores the three schedules; hosting schedules change only on deployment.

This is not a completed demo conversion. Synthetic data, a prominent
non-operational label, Florida backup/restore verification and the eventual
removal of remaining live polling need separate scoped work. The branch's
AGENTS.md production framing is stale against the owner's demo direction; its
privacy and human-review safeguards remain applicable.
