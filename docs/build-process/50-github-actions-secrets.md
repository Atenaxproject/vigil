# 50 — GitHub Actions secrets

**Date:** 2026-07-06  
**Scope:** Standard backup/CI secrets on `Atenaxproject/vigil` and `Atenaxproject/vigil-backups`.

## Target secrets

| Secret | vigil | vigil-backups | Notes |
|--------|-------|---------------|-------|
| `SUPABASE_DB_URL` | Pending | Pending | **Orlando action required** |
| `SUPABASE_ACCESS_TOKEN` | Pending | Pending | **Orlando action required** |
| `CRON_SECRET` | **Set** (2026-07-06) | N/A | Sourced from local `.env.local` (matches Vercel production intent) |

## Why blocked

- `vercel env pull --environment=production` returned **empty quoted placeholders** for `POSTGRES_URL` and `CRON_SECRET` (secrets not exported to CLI in this session).
- Local `.env.local` has `CRON_SECRET` but **no** `SUPABASE_DB_URL` / `DATABASE_URL` / `SUPABASE_ACCESS_TOKEN`.

## Orlando — set remaining secrets

```powershell
# From Supabase → Project macmlvybpxdnzfviimvl → Settings → Database → Connection string (URI, direct or pooler)
gh secret set SUPABASE_DB_URL --repo Atenaxproject/vigil
gh secret set SUPABASE_DB_URL --repo Atenaxproject/vigil-backups

# From https://supabase.com/dashboard/account/tokens (PAT for CLI/Management API)
gh secret set SUPABASE_ACCESS_TOKEN --repo Atenaxproject/vigil
gh secret set SUPABASE_ACCESS_TOKEN --repo Atenaxproject/vigil-backups
```

Optional on **vigil-backups** only: `BACKUP_ENCRYPTION_KEY` (passphrase for encrypted artifacts).

**Do not** commit `.env.local` or paste secrets into build-process docs.
