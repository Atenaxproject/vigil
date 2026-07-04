# Vigil — API Reference

**Base path:** `src/app/api/`  
**Total routes:** 33  
**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

All submission endpoints follow: **Zod validation → sanitize → geo bounds check → Supabase insert → JSON response**.

Rate limits are enforced in `src/middleware.ts` per IP (hashed). Limits reset on serverless cold start.

---

## Public submission endpoints

### Missing persons

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/missing-persons/submit` | POST | 5 | None | name, location, estado, contact, consent | `{ id, claim_token, claimUrl }` |
| `/api/missing-persons/search` | GET | 60 | None | `q`, `estado` | `{ vigil[], dtv[], results[], total }` |
| `/api/missing-persons/notes` | GET/POST | 20 | None | person id, note text | notes list / new note |
| `/api/missing-persons/claim` | GET/PATCH/POST | — | claim_token | token in URL/body | report data / updates / contact inbox |

**Privacy:** Search reads `public_missing_persons` view only. Full records require admin/service role.

### Map and location markers

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/map-markers/submit` | POST | 10 | None | type, lat, lng, title, description | marker record |
| `/api/connectivity/submit` | POST | 10 | None | starlink/cell/wifi, lat, lng, notes | map_marker (category=comms) |
| `/api/collection-points/submit` | POST | 5 | None | hours, categories, lat, lng | collection_point marker |

**Geo:** All coordinates must pass `isWithinBounds()` (Venezuela crisis bounds from config).

### Resource exchange

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/resource-exchange/submit` | POST | 5 | None | entry_type, category, contact_method | listing + claim_token |
| `/api/resource-exchange/claim` | GET/POST | — | claim_token | token | listing management |
| `/api/resource-exchange/contact` | POST | 3 | None | listing id, requester info | contact request |

### Volunteers and rescuers

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/volunteers/submit` | POST | 5 | None | skills, languages, contact | volunteer id |
| `/api/volunteers/contact` | POST | 3 | None | volunteer id, message | contact request |
| `/api/rescuer-presence/submit` | POST | 10 | None | name, lat, lng, team type | presence record (4hr expiry) |
| `/api/rescuer-presence/checkin` | POST | 20 | None | presence id | updated checkin timestamp |

### Property assessments

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/property-assessments/submit` | POST | 5 | None | multipart: JSON payload + optional photo | assessment + claim_token |
| `/api/property-assessments/claim` | GET | — | claim_token | token | assessment status (no private fields) |
| `/api/property-assessments/admin` | GET/PATCH | Admin session | assignment fields | open queue / assign volunteer |

Public map uses `public_property_assessments` view (jittered coords, no address/contact/photo).

### Community and events

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/community-wall/submit` | POST | 5 | None | author, message, category | wall message |
| `/api/community-wall/flag` | POST | 20 | None | message id | increments flag_count (auto-hide at 3) |
| `/api/events` | GET/POST | 10 POST | None | event fields | events list / new event |

### Contact and feedback

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/contact-request` | POST | 3 | None | missing_person_id, requester info | contact request |
| `/api/feedback/submit` | POST | 5 | None | category, message | feedback id |

---

## AI and search endpoints

| Endpoint | Method | Rate limit/hr | Auth | Key inputs | Output |
|----------|--------|---------------|------|------------|--------|
| `/api/assistant` | POST | 30 | None | message, language | streamed AI reply (SSE) |
| `/api/photo-search` | POST | 10 | None | photo file (multipart) | vision description + Vigil + DTV matches |

**Degradation:** Without `ANTHROPIC_API_KEY`, assistant returns a friendly unavailable message; photo search returns 503.

---

## Read-only / feed endpoints

| Endpoint | Method | Rate limit/hr | Notes |
|----------|--------|---------------|-------|
| `/api/pfif` | GET | — | PFIF 1.4 XML export, max 500 records |
| `/api/weather` | GET | — | Open-Meteo proxy, 30min cache |
| `/api/live-info` | GET | — | Aggregated live crisis data for `/informacion` |
| `/api/news-rss` | GET | — | Venezuelan RSS news tier |
| `/api/dtv-metrics` | GET | 120 | DTV federated stats for widgets |

---

## Admin and cron endpoints

| Endpoint | Method | Auth | Schedule / use |
|----------|--------|------|----------------|
| `/api/cron/dedup` | GET | `Authorization: Bearer CRON_SECRET` | Daily 08:00 UTC — Claude Haiku duplicate detection → `moderation_queue` |
| `/api/admin/sync-dtv-centers` | GET/POST | CRON_SECRET or `x-admin-secret: VIGIL_ADMIN_SECRET` | Daily 06:00 UTC — geocode + upsert DTV centers to `map_markers` |
| `/api/admin/sync-cav-centers` | GET/POST | CRON_SECRET or `x-admin-secret: VIGIL_ADMIN_SECRET` | Weekly Mon 06:00 UTC — geocode + upsert CAV collection points (`source=cav`, `verified=false`) |
| `/api/admin/verify` | POST | body.secret = VIGIL_ADMIN_SECRET | Sets feedback admin cookie |
| `/api/admin/feedback` | GET/PATCH | `vigil_admin_gate` cookie | Feedback triage at `/admin/feedback` |

---

## Common response patterns

### Success (submission)

```json
{
  "success": true,
  "id": "uuid",
  "claim_token": "uuid",
  "claimUrl": "https://vigil.youthewave.org/mi-reporte/uuid"
}
```

### Validation error (400)

```json
{
  "error": "Validation failed",
  "details": [/* Zod issue array */]
}
```

### Rate limited (429)

```json
{
  "error": "Too many requests"
}
```

### Out of bounds (400)

Coordinates outside Venezuela crisis bounds are rejected before database insert.

---

## Security notes

- IP addresses stored as SHA-256 hash with `VIGIL_ADMIN_SECRET` salt — never raw IP in DB.
- Service role key used only in server routes and cron — never sent to client.
- Claim tokens are UUIDs — treat claim URLs as secrets (passwordless access to private inbox).
- Admin routes protected by middleware + Supabase session or secret cookie.
