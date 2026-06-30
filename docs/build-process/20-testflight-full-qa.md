# Vigil — Sidebar Fix + Full Test Flight (Functional + Database + RLS Security)
## Paste into Cursor Composer (Agent mode)

---

## TASK A — Sidebar Nav Text Truncation (desktop)

Labels like "Reportar Desaparecido" and "Actualizaciones Oficiales" are 
currently truncated with ellipsis in the desktop sidebar. Fix by WIDENING 
the sidebar container, not shrinking font size — font size must stay at or 
above 13px per the accessibility fix already applied (going smaller would 
undo that work).

```bash
grep -rn "w-\[240px\]\|width: 240px\|sidebar" src/components/layout/ --include="*.tsx"
```

Find the sidebar width value and increase it enough that the longest label 
("Actualizaciones Oficiales") fits on a single line without wrapping or 
truncating, at the current 13px+ font size with current icon+padding. 
Likely needs to go from 240px to roughly 260-280px — calculate based on 
actual rendered text width, don't guess. Remove any `truncate`, 
`overflow-hidden text-ellipsis`, or `whitespace-nowrap` combination that's 
currently causing the cutoff if simply widening the container doesn't fully 
resolve it — confirm the nav item container allows the full label to render 
on one line.

Test: confirm every nav label renders fully on one line at the new width, 
collapsed sidebar (icon-only mode, the "Contraer menú" state visible in 
the screenshot) still works correctly too.

---

## TASK B — Full Functional Test Flight (real submissions, verified in Supabase)

For EACH item below: submit realistic TEST data through the actual live UI, 
then query Supabase DIRECTLY (via Supabase MCP, SQL editor, or CLI) to 
confirm the row was created with correct values in the correct columns — 
do not just trust that the UI showed a success message. Prefix all test 
data with "TEST QA —" in the name/title field so it's identifiable, and 
DELETE every test row after verifying (this is a live platform real people 
will be using — test data must not linger).

1. **Reportar Desaparecido** — submit a missing person report. Query 
   `missing_persons` table, confirm row exists with correct full_name, 
   status='missing', consent_given=true, claim_token populated. Confirm the 
   claim-link confirmation screen displayed the correct token.

2. **Buscar Persona** — search for the test name just created, confirm it 
   appears in results. Search for a nonsense name, confirm "Sin resultados" 
   displays correctly.

3. **Missing person detail/notes** — open the test record's detail page, 
   add a note/sighting, confirm it appears in real-time, query 
   `missing_person_notes` table to confirm the row exists.

4. **Necesito Ayuda (map marker)** — submit a need. Query `map_markers`, 
   confirm row with correct type/category/coordinates. Confirm it renders 
   on the map after toggling the relevant layer checkbox.

5. **Intercambio (resource exchange)** — submit both an "offering" and a 
   "requesting" entry. Query `resource_exchange`, confirm both rows, confirm 
   claim_token populated, confirm real-time appearance in the UI.

6. **Voluntarios** — register a test volunteer. Query `volunteers` table, 
   confirm row with skills array populated correctly.

7. **Organizaciones** — if a public submission form exists, submit one, 
   confirm `approved_by_admin` defaults to false (should NOT appear publicly 
   until approved) — this is a security/data-integrity check, not just 
   functional.

8. **Calendario** — add a test event, confirm it appears in the date-grouped 
   list, query `events` table to confirm.

9. **Punto de Acopio** — register a test collection point, confirm it 
   appears on map with hours/categories, query `map_markers` with 
   type='collection_point'.

10. **Equipo Activo (rescuer presence)** — register test presence, confirm 
    pin appears, test the "Necesito asistencia" button changes status, 
    query `rescuer_presence` table to confirm status field updated correctly.

11. **Feedback widget** — submit test feedback in each category (bug, 
    feature, missing info, question), query `feedback` table, confirm all 
    4 rows exist with correct category values. If Resend is configured, 
    confirm notification email arrived.

12. **Contact request flow** — from the test missing person's claim-link 
    page, simulate a contact request being submitted, confirm it appears 
    in the claim-link inbox view.

13. **Language switching** — switch through all 8 languages on 3 different 
    pages, confirm no raw translation keys are visible (e.g., no literal 
    text like "footer.notEmergency" showing instead of translated content).

14. **Clean up**: delete every "TEST QA —" prefixed row created during this 
    pass from all tables.

---

## TASK C — RLS / Public Key Security Audit (the real security boundary)

The Supabase anon key being visible in the client bundle is EXPECTED and 
not a vulnerability by itself — that's how Supabase's client-side model 
works. The actual security boundary is Row Level Security. Test it directly:

### C1. Attempt unauthorized reads using only the anon key

Open browser console on the live site (where the anon key is naturally 
available via the existing Supabase client), and attempt:

```javascript
// Attempt to read private contact fields directly
const { data, error } = await supabase
  .from('missing_persons')
  .select('contact_phone, contact_whatsapp, contact_email')
  
console.log(data, error)
```

This should return EITHER an error, OR rows where these fields are null/
not included — confirm the public-facing query path never actually exposes 
these columns. If raw `contact_phone` values come back, this is a CRITICAL 
finding — the public view/RLS policy isn't actually preventing this and 
needs immediate fixing.

Repeat for:
```javascript
await supabase.from('volunteers').select('contact_phone, contact_whatsapp, contact_email')
await supabase.from('map_markers').select('contact')
await supabase.from('resource_exchange').select('contact_value')
```

All of these should be blocked or return null/empty for contact fields when 
queried with just the anon key from a public client context. Report exactly 
what each query returns.

### C2. Verify the public_missing_persons view is actually being used

Confirm the application code queries the `public_missing_persons` VIEW 
(which excludes contact fields and GPS coordinates) rather than the raw 
`missing_persons` TABLE for any public-facing display:

```bash
grep -rn "from('missing_persons')\|from(\"missing_persons\")" src/ --include="*.tsx" --include="*.ts"
```

Any result NOT in an admin-only/server-only context querying the raw table 
directly (instead of the public view) should be flagged and fixed.

### C3. Test rate limiting actually works

Submit 6 missing person reports rapidly from the same session (the limit 
is 5/hour per the middleware config). Confirm the 6th attempt is rejected 
with the rate limit error message, not silently accepted.

### C4. Test coordinate validation

Attempt to submit a map marker with coordinates clearly outside Venezuela 
(e.g., lat: 40.7, lng: -74.0 — New York). Confirm this is rejected by the 
coordinate bounds check, not accepted.

### C5. Confirm organizations require approval

Already partially covered in B7 — explicitly confirm via direct query that 
`approved_by_admin = false` records never appear in the public organizations 
list, only in an admin view.

### C6. Re-confirm the service role / API key check from the previous session

```bash
grep -rln "SUPABASE_SERVICE_ROLE_KEY\|ANTHROPIC_API_KEY" --include="*.tsx" --include="*.ts" src/
```

Confirm every result is server-only. This was checked before — re-verify 
it's still true after all recent changes.

---

## TASK D — Final Report (required format)

1. **Sidebar fix**: confirmed all labels render on one line at new width — 
   yes/no, new width value used
2. **Functional test results**: pass/fail for all 14 items in Task B, with 
   specific detail on any failures, confirm test data was cleaned up
3. **RLS security audit results**: for EACH query in C1, state exactly what 
   was returned — if any private field leaked, mark as CRITICAL and describe 
   the fix applied
4. **Rate limiting**: confirmed working — yes/no
5. **Coordinate validation**: confirmed working — yes/no
6. **Organization approval gate**: confirmed working — yes/no
7. **Service role key check**: CLEAN or LEAK FOUND
8. **Overall launch verdict**: Given everything tested above, is Vigil safe 
   and functionally ready to share publicly? State explicitly yes or no, 
   with any remaining concerns listed clearly.

## Commit

```bash
git add -A
git commit -m "fix: sidebar text truncation, comprehensive test flight (functional + RLS security audit)

- Widened sidebar to fit full nav labels without truncation (kept 13px+ accessibility floor)
- Verified all 14 core features functionally working with direct Supabase confirmation
- Audited RLS policies against direct anon-key queries for private field exposure
- Confirmed rate limiting, coordinate validation, and org approval gates function correctly
- Re-confirmed zero service role/API key leakage in client bundle

Co-authored-by: Claude <noreply@anthropic.com>"
git push
```

Save this file as the next numbered doc in docs/build-process/.
