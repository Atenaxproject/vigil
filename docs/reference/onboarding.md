# Vigil — Onboarding Guide

**Audience:** End users, volunteers, admins, and developers  
**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

---

## A. End users (crisis affected)

### First visit

1. Open https://vigil.youthewave.org on mobile or desktop.
2. On iPhone/Android, use **Add to Home Screen** for offline-capable PWA access.
3. The emergency banner ([former rescue-coordination label]) is always visible at the top.
4. Switch language via the header if needed (Spanish is default; 8 languages supported).

### Search for a missing person

1. Go to **Buscar** (`/buscar`).
2. Enter at least 2 characters of a name, or filter by **estado**.
3. Results include Vigil records and federated DTV results (marked with attribution).
4. Tap a result to open the detail page (`/buscar/[id]`).
5. Add a public sighting note or submit a **Solicitar contacto** request — you will not see private contact info.

### Report a missing person

1. Go to **Reportar** (`/reportar`).
2. Complete the form: name, last known location, estado, optional photo.
3. Provide contact info (phone/WhatsApp/email) — stored privately, never shown publicly.
4. Check both consent boxes (data processing + public listing without contact).
5. **Save the claim URL** from the confirmation screen — this is your passwordless inbox at `/mi-reporte/[token]`.
6. Optional: if email was provided and Resend is configured, a claim link is emailed.

### Request help on the map

1. Go to **Necesito ayuda** (`/necesito-ayuda`).
2. Drop a pin on the map with a short description of the need.
3. The pin appears on the home crisis map for responders.

### Understand privacy

- Vigil does **not** share data with the Venezuelan government.
- Read `/privacidad` (ES) or `/privacy` (EN) for full policy.
- Sister platforms linked at `/red` are independent — each has its own privacy terms.

---

## B. Volunteers and NGOs

### Register as a volunteer

1. Go to **Voluntarios** (`/voluntarios`).
2. Select skills (medical, logistics, translation, structural assessment, etc.).
3. Select languages spoken.
4. Provide contact method — displayed with masked name in the public directory only if you opt in.
5. Responders contact you through Vigil's contact-request flow, not via public phone numbers.

### List resources for exchange

1. Go to **Intercambio** (`/intercambio`).
2. Choose **offer** or **request** and one of 7 categories.
3. Save your claim URL at `/mi-intercambio/[token]` to manage or close the listing.
4. Listings auto-expire after 7 days.

### Structural / property assessment volunteers

1. Register with skill `structural_engineer`, `architect`, or `surveyor`.
2. Optionally add a `credential_note`.
3. **Do not self-assign assessments** — Orlando assigns via `/admin`.
4. Once assigned, set ATC-20 tag (green / yellow / red) based on field inspection.
5. Disclaimer: assessments are volunteer opinions, not official government inspections (ToS §4).

### Organizations

1. Submit organization details through the org registration flow.
2. Organization appears publicly only after admin sets `approved_by_admin = true` in Supabase.
3. Verified orgs appear on `/organizaciones` and `/como-ayudar`.

### Register a collection point

1. Go to **Punto de acopio** (`/punto-de-acopio`).
2. Provide location, hours, and accepted item categories.
3. Pin appears on the crisis map layer.

### Report connectivity

1. Go to **Conectividad** (`/conectividad`).
2. Report Starlink, WiFi, or cell signal availability with location.
3. Helps rescuers and diaspora find working comms.

---

## C. Admin onboarding (Orlando)

### Prerequisites

1. Email listed in `VIGIL_ADMIN_EMAILS` on Vercel (comma-separated).
2. Supabase user created with that email; optionally set `app_metadata.role = 'admin'` via SQL.
3. Access to Supabase Studio for the production project (`macmlvybpxdnzfviimvl`).
4. `VIGIL_ADMIN_SECRET` configured for feedback admin and IP hashing.

### First login

1. Visit `/auth/login`.
2. Enter admin email → receive OTP → verify.
3. Redirect to `/admin` for property assessment queue and moderation stub.
4. For feedback triage: visit `/admin/feedback`, enter `VIGIL_ADMIN_SECRET` (sets cookie via `/api/admin/verify`).

### Daily checklist (~15 minutes)

| Task | Where |
|------|-------|
| Review AI duplicate flags | Supabase → `moderation_queue` |
| Property assessment queue | `/admin` |
| Feedback triage | `/admin/feedback` |
| Approve pending organizations | Supabase → `organizations` |
| Verify crons ran | Vercel dashboard → Cron logs (dedup 08:00 UTC, DTV sync 06:00 UTC) |

See [sops.md](./sops.md) for step-by-step procedures.

### Emergency contacts

- Platform support: `support@youthewave.org`
- Legal operator: Bbluestudios LLC (see `/terminos`)

---

## D. Developer onboarding

### Read first

1. `docs/architecture/CLAUDE.md` — stack, constraints, privacy rules
2. `docs/architecture/DESIGN-SYSTEM.md` — UI before any component work
3. `docs/architecture/DEPLOYMENT.md` — env vars and deploy steps
4. `docs/reference/VIGIL-COMPLETE-GUIDE.md` — full operational picture

### Local setup

```bash
git clone https://github.com/Atenaxproject/vigil.git
cd vigil
npm install
cp .env.example .env.local
npm run dev
```

1. App runs at http://localhost:3000 without Supabase — USGS map and static pages work.
2. Add Supabase keys to `.env.local` for live data features.
3. Apply migrations 001–010 in order (see [data-model.md](./data-model.md)).
4. Optional seeds: `supabase/seeds/001_real_data.sql`, `002_resources_venezuelatebusca.sql`.

### Development rules

- **Never** expose `SUPABASE_SERVICE_ROLE_KEY` or `ANTHROPIC_API_KEY` client-side.
- All API inputs: Zod validate → sanitize → bounds check.
- User-facing copy defaults to Spanish; update all 8 locale JSON files for i18n changes.
- Contact fields never appear in public views — use `public_*` views for reads.
- One crisis config file: `src/config/crisis.config.ts` for redeployment to new crises.
- Do not work on `main` directly — use feature branches and PRs.

### Key directories

| Path | Purpose |
|------|---------|
| `src/app/` | Pages and API routes (App Router) |
| `src/components/` | React components |
| `src/lib/` | Shared logic (Supabase, USGS, DTV, sanitization) |
| `src/config/crisis.config.ts` | Crisis-specific configuration |
| `supabase/migrations/` | Database schema (001–010) |
| `messages/` | i18n locale files (8 languages) |

### Verify before PR

```bash
npm run lint
# Optional: scripts/visual-check.mjs (Playwright, 4 viewports)
```

### Deploy

Push to `main` → Vercel auto-deploy. Update env vars in Vercel dashboard before enabling admin/cron/AI features.
