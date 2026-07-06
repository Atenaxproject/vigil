# 48 — Dependabot and security updates

**Date:** 2026-07-06  
**Scope:** Dependabot version updates + vulnerability alerts on `Atenaxproject/vigil`.

## Files added

- `.github/dependabot.yml` — weekly npm (limit 5 open PRs) + weekly GitHub Actions

## GitHub API

| Endpoint | Result |
|----------|--------|
| `PUT .../vulnerability-alerts` | **204** — Dependabot alerts enabled |
| `PUT .../automated-security-fixes` | **200** — automated security updates enabled |

## Notes

Dependabot will open PRs after the config lands on `main`. No org-level blockers observed.
