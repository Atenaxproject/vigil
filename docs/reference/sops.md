# Vigil — Standard Operating Procedures

**Audience:** Platform admin (Orlando) and on-call operators  
**Parent:** [VIGIL-COMPLETE-GUIDE.md](./VIGIL-COMPLETE-GUIDE.md)

---

## Daily operations checklist

Run every day during active crisis deployment (~15 minutes):

| # | Task | Location | Action |
|---|------|----------|--------|
| 1 | AI duplicate review | Supabase → `moderation_queue` | Follow [SOP: AI duplicate flag](#sop-handle-ai-duplicate-flag) |
| 2 | Property assessments | `/admin` | Assign open assessments to qualified volunteers |
| 3 | Feedback triage | `/admin/feedback` | Review new feedback; mark resolved |
| 4 | Organization approvals | Supabase → `organizations` | Approve legitimate pending orgs |
| 5 | Cron health | Vercel → Cron logs | Confirm dedup (08:00 UTC) and DTV sync (06:00 UTC) ran |

---

## SOP: Approve a new organization

**Trigger:** New org submission with `approved_by_admin = false`

1. Open Supabase Studio → `organizations` table.
2. Filter `approved_by_admin = false`.
3. Verify legitimacy:
   - Website loads and matches stated mission
   - Donation/contact links are valid
   - No duplicate of existing approved org
4. Set:
   - `approved_by_admin = true`
   - `verified = true`
   - `active = true`
5. Confirm org appears on `/organizaciones` and `/como-ayudar`.
6. If rejected: set `active = false` and optionally add internal note (no public rejection UI).

---

## SOP: Handle AI duplicate flag

**Trigger:** New row in `moderation_queue` with `reason = 'ai_duplicate'`

1. Open `moderation_queue` → note `record_id` and reference ID in `notes`.
2. Open both `missing_persons` records in Supabase.
3. Compare: name, photo, location, estado, submission time.
4. If confirmed duplicate:
   - Set `duplicate_of` on the newer record pointing to the canonical record, **or**
   - Merge manually (keep richer record; deactivate duplicate).
5. Update moderation_queue `status` to `approved` (action taken) or `rejected` (false positive).
6. Verify duplicate no longer appears prominently in `/buscar` results.

---

## SOP: Property assessment assignment

**Trigger:** New submission at `/evaluacion-estructural` or AI priority flag

1. Open `/admin` → Property Assessment queue.
2. Review submission details (private address/coords visible to admin only).
3. Identify volunteer with skill `structural_engineer`, `architect`, or `surveyor`.
4. Assign via admin UI or PATCH `/api/property-assessments/admin`.
5. Notify volunteer out-of-band (WhatsApp/email they registered with).
6. Volunteer performs field inspection and sets `tag_status`:
   - **Green:** Safe to occupy
   - **Yellow:** Restricted entry / further evaluation needed
   - **Red:** Unsafe — do not enter
7. Confirm jittered pin appears on public map layer.
8. **Never** let AI set tag status — human volunteer only (ToS §4).

---

## SOP: Respond to contact request

**Trigger:** New row in `contact_requests` or notification in claim inbox

1. Open `contact_requests` in Supabase **or** submitter's claim inbox at `/mi-reporte/[token]`.
2. Review requester message and their provided contact info.
3. Contact original submitter out-of-band using **their private** phone/WhatsApp/email.
4. Facilitate connection between parties — Vigil does not expose contacts publicly.
5. Update `status`:
   - `resolved` — connection made
   - `spam` — abusive or invalid request
6. Do not share either party's contact in public notes or community wall.

---

## SOP: Moderate community wall

**Trigger:** `flag_count >= 3` on `community_wall` message (auto-hidden)

1. Review flagged message in Supabase → `community_wall`.
2. If violates guidelines (hate, misinformation, spam):
   - Confirm `flagged = true` / hidden state
   - Optionally delete record
3. If false flags:
   - Reset `flag_count = 0`, set `flagged = false`
4. No public moderation UI — Supabase Studio only.

---

## SOP: Troubleshooting — search returns nothing

**Symptoms:** `/buscar` shows no results for valid queries

1. Check Vercel env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Confirm query ≥ 2 characters.
3. Test Supabase connectivity in Studio — `public_missing_persons` view should return rows.
4. For DTV results: verify `DTV_API_BASE_URL` and `DTV_API_KEY` on Vercel.
5. Check RLS: public queries must use `public_missing_persons`, not `missing_persons` directly.
6. Review browser console for API errors on `/api/missing-persons/search`.

---

## SOP: Troubleshooting — submissions fail

**Symptoms:** Form submission returns error or 429

1. **429 Too Many Requests:** User hit rate limit — wait 1 hour or review limits in `src/middleware.ts`.
2. **400 Validation:** Check required fields and consent checkboxes.
3. **400 Out of bounds:** Coordinates outside Venezuela — user must adjust pin.
4. **500 Server error:** Check Vercel function logs; verify Supabase service availability.
5. **Offline queue:** PWA users may have queued submissions — sync when back online.

---

## SOP: Rate limit false positive

**Symptoms:** Legitimate user blocked after multiple submissions

1. Rate limits are per hashed IP in middleware memory (resets on cold start).
2. Ask user to wait 1 hour.
3. For persistent issues during crisis surge, temporarily raise limits in `src/middleware.ts` and redeploy.
4. Document change in CHANGELOG if limits are permanently adjusted.

---

## SOP: DTV center sync failure

**Trigger:** Cron `/api/admin/sync-dtv-centers` fails in Vercel logs

1. Verify `CRON_SECRET` or `VIGIL_ADMIN_SECRET` header auth.
2. Check `DTV_API_BASE_URL` and `DTV_API_KEY`.
3. Review Nominatim geocoding rate limits (external dependency).
4. Manually trigger: POST to `/api/admin/sync-dtv-centers` with `x-admin-secret` header.
5. Confirm new centers in `map_markers` with `external_id` populated.

---

## SOP: Deploy configuration change for new crisis

**Trigger:** Vigil redeployment for a different disaster

1. Update `src/config/crisis.config.ts`:
   - Country, bounds, hotlines, partner links, languages, legal metadata
   - Seismic/USGS query parameters
2. Run database migration review — may need fresh Supabase project or data purge.
3. Update DNS if domain changes.
4. Update Supabase Auth Site URL.
5. Update all 8 locale files for crisis-specific copy.
6. Redeploy via push to `main`.
7. Run full manual QA from `docs/architecture/DEPLOYMENT.md`.

---

## SOP: Incident response — data breach concern

1. Immediately rotate `SUPABASE_SERVICE_ROLE_KEY` and `VIGIL_ADMIN_SECRET` in Supabase/Vercel.
2. Review Supabase audit logs for anomalous service-role usage.
3. Check RLS policies still intact (especially migration 006 missing_persons fix).
4. Document incident and notify `support@youthewave.org` stakeholders.
5. If contact data exposed: follow erasure request process via `erasure_requests` table.

---

## Escalation contacts

| Role | Contact |
|------|---------|
| Platform support | support@youthewave.org |
| Legal operator | Bbluestudios LLC (see `/terminos`) |
| Supabase project | `macmlvybpxdnzfviimvl` |
