# 51 — Zoho Mail DNS (Cloudflare, youthewave.org)

**Date:** 2026-07-06  
**Scope:** Email DNS for `vigil@youthewave.org` on zone **youthewave.org** (MX/SPF/DKIM/DMARC). Do not change Vigil app CNAME/proxy rules.

## Execution status

| Record | Status |
|--------|--------|
| MX → Zoho | **Pending** — no `CLOUDFLARE_API_TOKEN` / Wrangler auth in environment |
| SPF TXT (root) | **Pending** |
| DKIM TXT | **Pending** — requires DKIM value from Zoho Mail admin |
| DMARC `_dmarc` | **Pending** |

## Records to apply (DNS only / grey cloud for MX)

Verify against [Zoho Mail DNS help](https://www.zoho.com/mail/help/adminconsole/domain-verification.html) before applying.

| Type | Name | Content | Priority | Proxy |
|------|------|---------|----------|-------|
| MX | `@` | `mx.zoho.com` | 10 | DNS only |
| MX | `@` | `mx2.zoho.com` | 20 | DNS only |
| MX | `@` | `mx3.zoho.com` | 50 | DNS only |
| TXT | `@` | `v=spf1 include:zohomail.com ~all` | — | DNS only |
| TXT | `zoho._domainkey` | *(from Zoho Mail → Email Configuration → DKIM)* | — | DNS only |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:vigil@youthewave.org` | — | DNS only |

## Orlando actions

1. Zoho Mail admin → generate DKIM for `youthewave.org` → copy TXT host/value.
2. Cloudflare dashboard (or API token with **Zone.DNS Edit** on `youthewave.org`) → add records above.
3. Zoho → verify domain; send test to/from `vigil@youthewave.org`.

## Methods attempted

1. `CLOUDFLARE_API_TOKEN` / `CF_API_TOKEN` — not set
2. `~/.wrangler/config/default.toml` — not present; `wrangler` CLI not installed
