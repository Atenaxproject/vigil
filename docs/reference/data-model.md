# Vigil — Data Model

**Database:** Supabase Postgres  
**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

---

## Migrations (run in order)

| # | File | Adds |
|---|------|------|
| 001 | `001_initial_schema.sql` | Core tables, views, RLS, indexes |
| 002 | `002_auth_setup.sql` | profiles, admin policies, `is_vigil_admin()` |
| 002 | `002_resource_exchange.sql` | resource_exchange table |
| 003 | `003_volunteer_enhancements.sql` | public_volunteers view, contact tables |
| 004 | `004_golive_features.sql` | infrastructure_status, rescuer_presence, feedback |
| 005 | `005_notes_claims_calendar.sql` | notes, claim_tokens, events, collection point cols |
| 006 | `006_missing_persons_rls_fix.sql` | **Critical:** drops direct anon read on missing_persons |
| 007 | `007_community_wall.sql` | community_wall + flag function |
| 008 | `008_geographic_fields.sql` | estado/municipio/parroquia |
| 009 | `009_external_id.sql` | map_markers.external_id (DTV dedup) |
| 010 | `010_property_assessments.sql` | property_assessments + public view |
| 011 | `011_diaspora_region.sql` | `region_scope` on map_markers, organizations, events, etc. |
| 012 | `012_missing_persons_map_coords.sql` | jittered map coords on missing_persons; parroquia in public view |
| 013 | `013_vigil_watch_state.sql` | Vigil Watch durable state |
| 014 | `014_ai_usage_log.sql` | AI call log for spend-proxy circuit breaker |

> **Note:** `docs/architecture/DEPLOYMENT.md` documents migrations 001–005 in detail. Production requires **001–014** — see also [`DEPLOYMENT-PLAYBOOK.md`](../architecture/DEPLOYMENT-PLAYBOOK.md).

---

## Entity relationship overview

```
missing_persons ──┬── contact_requests
                  ├── missing_person_notes
                  └── moderation_queue (via AI dedup)

map_markers (needs, resources, shelters, hospitals, DTV centers, connectivity)

organizations (approved_by_admin gate)

volunteers ──┬── volunteer_contact_requests
             └── property_assessments (assigned_to)

resource_exchange ── resource_exchange_contact_requests

community_wall
events
feedback
infrastructure_status
rescuer_presence
needs_offers
moderation_queue
erasure_requests
rate_limit_log
ai_usage_log
profiles
```

---

## Core tables

### missing_persons

Citizen-submitted missing person reports. **Never query directly from public clients.**

| Column (key) | Public? | Notes |
|--------------|---------|-------|
| id | Yes (via view) | UUID primary key |
| full_name | Yes | Sanitized text |
| last_seen_location | Yes | Text description |
| estado, municipio, parroquia | Yes | Geographic breakdown |
| lat, lng | **Private** | Exact GPS — view omits or jitters |
| phone, whatsapp, email | **Private** | Never in public view |
| photo_url | Yes (if provided) | Storage URL |
| status | Yes | missing / found_alive / found_deceased |
| verified | Yes | Admin-verified badge |
| claim_token | Private | Passwordless inbox access |
| consent_* | Private | Legal consent flags |
| source | Yes | web / telegram (schema only) / etc. |
| duplicate_of | Admin | Set by dedup cron |
| flag_count | Admin | Spec exists; auto-hide not implemented |

### public_missing_persons (view)

Use this for all public reads. Excludes contact fields and exact coordinates.

### map_markers

Unified map pin table for multiple layer types.

| category | Purpose |
|----------|---------|
| need | "I need help" pins |
| resource | Resource availability |
| shelter | Shelter locations |
| hospital | Hospital status |
| danger | Hazard zones |
| rescue | Rescue operation zones |
| collection_point | Acopio / donation collection |
| comms | Connectivity (Starlink/WiFi/cell) |
| dtv_center | Synced from DTV API |
| property | Property assessment (via separate table + view) |

Key fields: `lat`, `lng`, `title`, `description`, `active`, `flagged`, `external_id` (DTV dedup).

### organizations

Verified NGO directory entries.

- Public visibility requires `approved_by_admin = true`, `active = true`.
- Submissions default to pending approval.

### volunteers

Volunteer registrations with skills array and language list.

- Public directory uses `public_volunteers` view (masked names).
- Contact via `volunteer_contact_requests` — not public fields.

### resource_exchange

7-day expiring offer/request listings.

- Categories: food, water, medicine, shelter, transport, equipment, other.
- Claim token for passwordless management at `/mi-intercambio/[token]`.

### property_assessments

ATC-20 structural safety assessments.

| Field | Public view |
|-------|-------------|
| tag_status (green/yellow/red) | Yes |
| approx lat/lng (jittered) | Yes |
| exact address, coords, contact, photo | **No** |
| assigned_to (volunteer) | Admin only |

Public reads: `public_property_assessments` view.

### community_wall

Public messages with flagging. Auto-hidden when `flag_count >= 3` (SQL function in migration 007).

### events

Community calendar events with date, location, description.

### feedback

User feedback from site widget. Triaged at `/admin/feedback`.

### infrastructure_status

Live infrastructure reports (power, water, comms) for `/informacion` hub.

### rescuer_presence

Rescue team check-ins with 4-hour expiry. SOS flag supported.

### moderation_queue

AI duplicate detection output from `/api/cron/dedup`.

| Field | Purpose |
|-------|---------|
| record_id | Suspected duplicate record |
| reason | e.g. `ai_duplicate` |
| notes | Reference to potential match ID |
| status | pending / approved / rejected |

### profiles

Supabase Auth user profiles linked to admin access.

---

## Privacy views (always use for public reads)

| View | Source table | Excludes |
|------|--------------|----------|
| `public_missing_persons` | missing_persons | contact, exact GPS |
| `public_volunteers` | volunteers | full contact, unmasked name |
| `public_property_assessments` | property_assessments | address, contact, photo, exact coords |

---

## RLS summary

| Table | Public SELECT | Public INSERT | Admin UPDATE |
|-------|---------------|---------------|--------------|
| missing_persons | **Blocked** (use view) | Yes (consent required) | Yes |
| public_missing_persons (view) | Yes | — | — |
| map_markers | Non-flagged, active | Yes | Yes |
| organizations | approved + active only | Yes (pending approval) | Yes |
| volunteers | public_display only | Yes | Yes |
| resource_exchange | non-flagged, not expired | Yes | — |
| community_wall | non-flagged | Yes | — |
| moderation_queue | Admin only | Service role | Admin |
| property_assessments | Via public view | Yes | Yes (assignment) |

Admin check: `is_vigil_admin()` function (migration 002) + `VIGIL_ADMIN_EMAILS` env.

---

## Realtime-enabled tables

Supabase Realtime subscriptions on:

- `missing_persons`
- `map_markers`
- `needs_offers`
- `resource_exchange`
- `missing_person_notes`
- `events`
- `infrastructure_status`
- `rescuer_presence`
- `community_wall`

Used for live map updates and missing persons feed on `/`.

---

## Seeds

| File | Contents |
|------|----------|
| `supabase/seeds/001_real_data.sql` | Venezuela 2026 crisis seed data |
| `supabase/seeds/002_resources_venezuelatebusca.sql` | Resource/org seed from sister platform |
| `supabase/seeds/003_hogar_bambi.sql` | Hogar Bambi org (17th verified org) |

---

## Data retention

Configured in `crisis.config.ts`:

- 90-day active retention
- 365-day archive

**Status:** pg_cron archive job is **commented out** in migration 001 — not running in production.

---

## Federated data (not stored locally)

DTV (Desaparecidos Terremoto Venezuela) search results are fetched live via `src/lib/dtv-api.ts` and attributed in UI. They are **not** copied into `missing_persons` except DTV centers synced to `map_markers` via cron.
