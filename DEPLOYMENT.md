# Vigil — Deployment Guide

## Supabase Setup (Orlando — manual steps)

### 1. Create Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Choose **US East** region (closest to Florida operator, data stays in USA).
3. Save the database password securely.

### 2. Copy API keys to `.env.local`

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VIGIL_ADMIN_SECRET=generate_a_strong_random_secret
VIGIL_ADMIN_EMAILS=orlando@atenaxproject.com
```

Get keys from **Project Settings → API** in the Supabase dashboard.

> Never commit `.env.local`. Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.

### 3. Run database migrations

**Option A — Supabase SQL Editor (quickest for launch)**

Open **SQL Editor** in the Supabase dashboard and run, in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_auth_setup.sql`
3. `supabase/migrations/002_resource_exchange.sql`
4. `supabase/migrations/003_volunteer_enhancements.sql`

Then seed verified launch data:

5. `supabase/seeds/001_real_data.sql`

**Option B — Supabase CLI (linked project)**

```bash
# One-time: authenticate (requires browser)
supabase login

# Link to remote project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### 4. Enable Auth providers

In **Authentication → Providers**:

- **Email**: Enable. Turn on "Confirm email" if desired (magic link + OTP both work).
- **Phone**: Enable if SMS OTP needed. Configure Twilio or Supabase SMS provider.

In **Authentication → URL Configuration**, set:

- **Site URL**: `https://vigil.youtheway.org` (or your production domain)
- **Redirect URLs**: add `https://vigil.youtheway.org/auth/callback` and `http://localhost:3000/auth/callback`

### 5. Grant admin access

**Method A — Environment allowlist (recommended for launch)**

Add admin emails to `VIGIL_ADMIN_EMAILS` in `.env.local` and Vercel env vars:

```env
VIGIL_ADMIN_EMAILS=orlando@atenaxproject.com,other@example.com
```

**Method B — Supabase app_metadata (for RLS admin policies)**

Run in SQL Editor (replace email):

```sql
UPDATE auth.users
SET raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb
WHERE email = 'orlando@atenaxproject.com';
```

Use **app_metadata**, never `user_metadata`, for authorization (user_metadata is editable by users).

### 6. Enable Realtime

In **Database → Replication**, enable Realtime for:

- `missing_persons`
- `map_markers`
- `needs_offers`
- `resource_exchange`

### 7. Vercel environment variables

Add the following to the Vercel project under **Settings → Environment Variables**
(Production scope), then redeploy:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | From Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Server-only — never client-exposed |
| `VIGIL_ADMIN_SECRET` | ✅ | Strong random string (rate-limit IP hashing) |
| `VIGIL_ADMIN_EMAILS` | ✅ | Comma-separated admin allowlist |
| `ANTHROPIC_API_KEY` | optional | Enables translation / dedup / matching |

> **Until real values are set, production renders without crashing** (static pages,
> the USGS map, and forms all work) but live data sections show a calm empty state.
> Adding the Supabase vars above + running migrations/seed enables live data.

### 8. Deploy

Production deploys automatically on push to `main` if the GitHub integration is
connected. To deploy manually with the CLI:

```bash
vercel deploy --prod
```

### 9. Domain — vigil.youtheway.org

1. In Vercel → **Settings → Domains**, add `vigil.youtheway.org`.
2. In Cloudflare DNS, add a `CNAME` for `vigil` → `cname.vercel-dns.com`
   (proxied / orange cloud for DDoS protection).
3. Set Supabase **Auth → URL Configuration → Site URL** to
   `https://vigil.youtheway.org` and add `/auth/callback` to redirect URLs.

---

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in keys
npm run dev
```

Optional local Supabase stack:

```bash
supabase start    # requires Docker
supabase db reset # applies migrations locally
```

---

## Auth flow summary

| User type | Method | Route |
|-----------|--------|-------|
| Public/victims | Email OTP or SMS OTP | `/auth/login` |
| Admin (Orlando) | Same OTP flow + email allowlist | `/admin` (protected) |

- No passwords — OTP only per crisis UX requirements.
- `/admin` routes redirect to `/auth/login` if unauthenticated or not on admin allowlist.
- Session cookies refreshed automatically via Next.js middleware.

---

## Verification checklist

- [ ] Submit missing person report — contact info not visible in public search
- [ ] Login at `/auth/login` with admin email
- [ ] Access `/admin` after login
- [ ] Non-admin user blocked from `/admin`
- [ ] Rate limit: 6th submission from same IP in 1 hour returns 429
