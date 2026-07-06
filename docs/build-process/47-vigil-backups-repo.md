# 47 — vigil-backups private repo

**Date:** 2026-07-06  
**Scope:** Private GitHub repo for scheduled Supabase PostgreSQL backups.

## Result

| Item | Status |
|------|--------|
| Repo `Atenaxproject/vigil-backups` | **Created** (private) |
| URL | https://github.com/Atenaxproject/vigil-backups |
| Initial commit | `4a96c3a` — README + `.github/workflows/backup.yml` |

## Contents

- **README.md** — purpose, required secrets, pointer to restore procedure in main repo [`DEPLOYMENT-PLAYBOOK`](https://github.com/Atenaxproject/vigil/blob/main/docs/architecture/DEPLOYMENT-PLAYBOOK.md)
- **backup.yml** — weekly cron `0 6 * * 0` (Sunday 06:00 UTC) + `workflow_dispatch`; `pg_dump` → gzip → optional `openssl enc` when `BACKUP_ENCRYPTION_KEY` is set; 90-day artifact retention

## Secrets (see build-process 50)

Workflow requires `SUPABASE_DB_URL` on **vigil-backups** before first successful run.

## Verification (already done — session 46)

- `/prensa` press kit: commit `9406220`
- Production search: `GET https://vigil.youthewave.org/api/missing-persons/search?q=maria` → **dtvMatchTotal=1025**, total=20 (2026-07-06)
