# Incident runbook — public stub

**Full operator playbook** (contacts, escalation, evidence capture, postmortem
template) lives in the private `docs/evaluations/` tree on the admin machine and
is intentionally not published.

## Public high-level steps

1. **Detect** — synthetic uptime workflow, Vercel/Supabase dashboards, or user report.
2. **Stabilize** — Vercel → previous production deployment if a bad release; pause
   crons only if they amplify harm (`CRON_SECRET` routes return 401 without secret).
3. **Contain** — rotate compromised secrets; do not paste secrets into tickets or chat.
4. **Communicate** — short honest status for partners; never invent casualty figures.
5. **Recover** — re-apply known-good deploy; re-run migrations only from reviewed SQL.
6. **Learn** — private postmortem; update evaluations checklist.

See also: [`DEPLOYMENT.md`](./DEPLOYMENT.md) staging & rollback summary.
