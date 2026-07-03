# VIGIL BUILD PROMPT — Property Safety Assessment (Evaluación de Seguridad Estructural)
### Renumber to the next sequential file in docs/build-process/ before handing to Cursor.

---

## WHY (read this before touching code)

Real precedent: this mirrors ATC-20 Rapid/Detailed Evaluation, the standard US post-disaster building safety tagging system (green = inspected/safe, yellow = restricted use, red = unsafe/do not enter). Vigil's existing design principle — "mirror official severity tiers, never invent your own" — applies directly here. Don't design a new tagging scale. Use green/yellow/red.

This is more liability-sensitive than anything else in Vigil so far. Missing persons and resource data are informational. A safety tag on someone's home is a physical-safety claim. Two hard rules, non-negotiable:

1. **AI never assigns or suggests a tag.** Claude Vision may flag a submitted photo as "shows visible severe damage — prioritize in queue," purely for triage ordering. It must never output green/yellow/red to the requester, and that flag must never be presented as an assessment. Only a credentialed volunteer or admin assigns the tag.
2. **ToS must state, in the assessment flow itself (not just buried in the ToS page):** this is a volunteer opinion, not an official government inspection, and does not substitute for orders from local building/emergency management authorities. This closes the liability gap already flagged in YOUTHEWAVE-VIGIL-GROWTH-MASTER.md Section 6.

---

## 1. VOLUNTEER TAXONOMY EXTENSION

Extend the existing skills taxonomy (currently: medical, rescue, logistics, translation, tech, construction, drone, legal, psych, communications) with three new values:

- `structural_engineer` — the role that actually assigns the safety tag
- `architect` — post-assessment rebuild/rehab guidance
- `surveyor` — site/land stability, boundary, access assessment (topógrafo)

Add an optional `credential_note` text field to the volunteers table (e.g., license number, professional association membership). Optional, not gated — don't build a verification system for this at MVP. Admin can eyeball it when assigning.

---

## 2. DATABASE SCHEMA

New migration: `supabase/migrations/009_property_assessments.sql`

```sql
create table property_assessments (
  id uuid primary key default gen_random_uuid(),
  claim_token uuid default gen_random_uuid(), -- private management link, same pattern as missing_persons/resource_exchange

  -- Public/map fields
  estado text,
  municipio text,
  approx_location_lat double precision, -- rounded/jittered for public map display
  approx_location_lng double precision,
  request_type text check (request_type in ('inspection', 'relocation_assistance', 'both')),
  danger_indicators text[], -- e.g. {visible_cracks, leaning, flooding, foundation_damage, gas_smell, partial_collapse, other}
  description text, -- natural language, Claude structures like missing_persons intake
  tag_status text default 'unassessed' check (tag_status in ('unassessed', 'green', 'yellow', 'red')),
  tag_assigned_at timestamptz,
  tag_assigned_by uuid references volunteers(id), -- admin or credentialed volunteer only

  -- Private fields (admin/assigned-volunteer only, RLS-gated, same as missing_persons pattern)
  exact_address text,
  exact_lat double precision,
  exact_lng double precision,
  contact_name text,
  contact_phone text,
  contact_whatsapp text,
  photo_url text, -- Supabase signed URL, same short-expiry pattern as missing_persons photos

  -- Triage (internal only, never shown to requester as a verdict)
  ai_priority_flag boolean default false, -- Claude Vision severity flag, queue-sorting only

  -- Moderation/lifecycle
  consent_given boolean not null default false,
  data_accuracy_confirmed boolean not null default false,
  status text default 'open' check (status in ('open', 'assigned', 'completed', 'closed')),
  flagged boolean default false,
  reporter_ip_hash text,
  created_at timestamptz default now()
);

-- RLS: public insert; public select only via a stripped view (public_property_assessments)
-- that exposes estado/municipio/approx_lat/approx_lng/request_type/tag_status/created_at — nothing else.
-- Exact address, contact fields, photo_url: admin + tag_assigned_by only, same as contact routing elsewhere in Vigil.
```

Bounds validation: reuse the existing crisis.config.ts bounds check at the API layer — same rejection rule as every other submission.

---

## 3. MAP LAYER

New marker type on the crisis map: `property_assessment`. Color by `tag_status`:
- Unassessed: gray/neutral (matches "unverified" dashed styling already used elsewhere)
- Green/Yellow/Red: exact status colors from the design system's seismic/status palette — reuse existing hex values, don't invent new ones.

Toggle in the layer panel alongside existing layers (Réplicas, Necesidades, Recursos, etc.).

---

## 4. SUBMISSION FLOW

- Address/location picker (map tap, within bounds)
- Request type toggle: Inspección / Reubicación / Ambas
- Danger indicator checkboxes (multi-select)
- Free-text description — natural language OR structured, Claude structures the natural-language version exactly like missing persons intake
- Optional photo upload (JPG/PNG/WebP, max 5MB, same validation as existing photo search)
- Consent + accuracy checkboxes (required, same pattern)
- On submit: Claude Vision (if photo present) sets `ai_priority_flag` only — this never reaches the requester-facing UI as a status

---

## 5. ADMIN / VOLUNTEER FLOW

- Admin assignment queue, sorted by `ai_priority_flag` then submission time
- Assign to a volunteer with `structural_engineer` (or admin self-assigns)
- Assigned volunteer/admin is the only role that can write to `tag_status` — enforce at the RLS/API layer, not just the UI
- Tag submission requires a short note (what was observed) — stored, not public
- `relocation_assistance` requests route to the existing `resource_exchange` shelter category rather than building a parallel system — just set a flag/link, don't duplicate the shelter-matching logic

---

## 6. "WHO'S DOING THIS WORK" — PUBLIC VISIBILITY

Do not build an open directory of individual volunteer professionals. That breaks the same privacy rule already documented in VIGIL-BIBLE.md (contact info never public, predators/bad actors angle) — an architect's name and specialty is enough to be targeted or harassed, same reasoning as everything else.

Two things instead:
1. **Aggregate public stats** on the feature's landing view — "X properties assessed this week, Y volunteer professionals active" — visible, builds trust, no identifying info.
2. **If a firm or professional association formally partners** (not an individual volunteer, an institution — e.g., a local colegio de ingenieros or an architecture firm), they go in the existing Organizations directory, same as Hogar Bambi, same admin-approval gate. That's the "connect with them" visibility Orlando wants, without breaking the individual-privacy architecture.

---

## 7. ToS ADDITION REQUIRED

Add explicit language to /terminos before this feature goes live: assessments are volunteer professional opinions, not official government inspections, and do not override or substitute for orders from local building departments or emergency management authorities. This is the single highest-priority legal gap this feature introduces — don't ship without it.

---

*Pairs with VIGIL-BIBLE.md and YOUTHEWAVE-VIGIL-GROWTH-MASTER.md Section 6 (gaps flagged)*
