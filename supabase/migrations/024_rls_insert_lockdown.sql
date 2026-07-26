-- ============================================================
-- VIGIL — RLS / grant INSERT lockdown + FK indexes + profiles initplan
-- Captures production Supabase advisor lockdown so local/CI do not drift.
-- Idempotent: DROP POLICY IF EXISTS, REVOKE, CREATE INDEX IF NOT EXISTS.
-- Does NOT convert SECURITY DEFINER views or drop unused indexes.
--
-- Prerequisite (fresh env / CI): apply 020 → 021 → 022 → 023 before this file.
-- 020 restores column-scoped missing_persons INSERT (submit path).
-- 021 creates public_* SELECT views; 022 extends public_map_markers;
-- 023 adds flag_missing_person RPC. Skipping them leaves a gap vs main.
--
-- IMPORTANT: Do NOT revoke missing_persons INSERT or drop public_insert_missing.
-- That broke /api/missing-persons/submit; 020 restored it. This migration
-- keeps SELECT/UPDATE/DELETE locked while re-asserting column-scoped INSERT.
-- ============================================================

-- ------------------------------------------------------------
-- A) Service-role INSERT lockdown (10 tables)
-- Public writes go through Next.js API + service role.
-- ------------------------------------------------------------
REVOKE INSERT ON TABLE public.map_markers FROM anon, authenticated;
REVOKE INSERT ON TABLE public.volunteers FROM anon, authenticated;
REVOKE INSERT ON TABLE public.resource_exchange FROM anon, authenticated;
REVOKE INSERT ON TABLE public.rescuer_presence FROM anon, authenticated;
REVOKE INSERT ON TABLE public.property_assessments FROM anon, authenticated;
REVOKE INSERT ON TABLE public.events FROM anon, authenticated;
REVOKE INSERT ON TABLE public.organizations FROM anon, authenticated;
REVOKE INSERT ON TABLE public.needs_offers FROM anon, authenticated;
REVOKE INSERT ON TABLE public.erasure_requests FROM anon, authenticated;
REVOKE INSERT ON TABLE public.service_reports FROM anon, authenticated;

DROP POLICY IF EXISTS "public_submit_erasure" ON public.erasure_requests;
DROP POLICY IF EXISTS "public_insert_events" ON public.events;
DROP POLICY IF EXISTS "public_insert_markers" ON public.map_markers;
DROP POLICY IF EXISTS "public_insert_needs" ON public.needs_offers;
DROP POLICY IF EXISTS "public_submit_org" ON public.organizations;
DROP POLICY IF EXISTS "public_insert_property_assessments" ON public.property_assessments;
DROP POLICY IF EXISTS "public_insert_presence" ON public.rescuer_presence;
DROP POLICY IF EXISTS "public_insert_exchange" ON public.resource_exchange;
DROP POLICY IF EXISTS "public_volunteer_register" ON public.volunteers;
DROP POLICY IF EXISTS "service_reports_public_insert" ON public.service_reports;

-- ------------------------------------------------------------
-- B) missing_persons — lock SELECT/UPDATE/DELETE; KEEP public INSERT
-- Public reads via public_missing_persons. Submit uses anon INSERT
-- (column-scoped) + public_insert_missing — same as migration 020.
-- ------------------------------------------------------------
REVOKE SELECT, UPDATE, DELETE ON TABLE public.missing_persons FROM anon, authenticated;

-- Re-assert column-scoped INSERT (idempotent with 020). No SELECT restored.
REVOKE INSERT ON TABLE public.missing_persons FROM anon, authenticated;
GRANT INSERT (
  id,
  claim_token,
  full_name,
  age,
  is_minor,
  gender,
  last_seen_location,
  estado,
  municipio,
  parroquia,
  last_seen_lat,
  last_seen_lng,
  approx_last_seen_lat,
  approx_last_seen_lng,
  last_seen_at,
  notes,
  contact_name,
  contact_phone,
  contact_whatsapp,
  contact_email,
  consent_given,
  data_accuracy_confirmed,
  consent_timestamp,
  reporter_ip_hash,
  source
) ON TABLE public.missing_persons TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_missing" ON public.missing_persons;
CREATE POLICY "public_insert_missing" ON public.missing_persons
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    consent_given = true
    AND data_accuracy_confirmed = true
    AND coalesce(verified, false) = false
    AND coalesce(flagged, false) = false
    AND coalesce(status, 'missing') = 'missing'
    AND coalesce(source, 'web') = 'web'
    AND archived_at IS NULL
    AND deletion_requested_at IS NULL
    AND duplicate_of IS NULL
    AND verified_by IS NULL
    AND verified_at IS NULL
  );

-- ------------------------------------------------------------
-- C) Contact / public-write tables — clients keep INSERT only
-- Do NOT revoke INSERT on: feedback, community_wall, contact_requests,
-- resource_exchange_contact_requests, volunteer_contact_requests,
-- missing_person_notes, missing_persons (column-scoped — section B).
-- ------------------------------------------------------------
REVOKE SELECT, UPDATE, DELETE ON TABLE public.contact_requests FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON TABLE public.resource_exchange_contact_requests FROM anon, authenticated;
REVOKE SELECT, UPDATE, DELETE ON TABLE public.volunteer_contact_requests FROM anon, authenticated;

-- ------------------------------------------------------------
-- D) vigil_watch_state — service role only
-- ------------------------------------------------------------
REVOKE SELECT, INSERT, UPDATE, DELETE ON TABLE public.vigil_watch_state FROM anon, authenticated, PUBLIC;

-- ------------------------------------------------------------
-- E) Function EXECUTE grants
-- is_vigil_admin(): needed by RLS policies for anon/authenticated.
-- handle_new_user(): SECURITY DEFINER trigger from 002_auth_setup;
-- revoke direct client calls (trigger still fires as owner).
-- ------------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.is_vigil_admin() TO anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, PUBLIC;

-- ------------------------------------------------------------
-- F) FK / advisor indexes (IF NOT EXISTS)
-- ------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_missing_persons_duplicate_of
  ON public.missing_persons (duplicate_of)
  WHERE duplicate_of IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_requests_missing_person_id
  ON public.contact_requests (missing_person_id);

CREATE INDEX IF NOT EXISTS idx_needs_offers_matched_to
  ON public.needs_offers (matched_to)
  WHERE matched_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_resource_exchange_matched_with
  ON public.resource_exchange (matched_with)
  WHERE matched_with IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_rex_contact_exchange_id
  ON public.resource_exchange_contact_requests (resource_exchange_id);

CREATE INDEX IF NOT EXISTS idx_vol_contact_volunteer_id
  ON public.volunteer_contact_requests (volunteer_id);

CREATE INDEX IF NOT EXISTS idx_property_assessments_assigned_to
  ON public.property_assessments (assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_assessments_tag_assigned_by
  ON public.property_assessments (tag_assigned_by)
  WHERE tag_assigned_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_property_assessments_relocation_exchange_id
  ON public.property_assessments (relocation_exchange_id)
  WHERE relocation_exchange_id IS NOT NULL;

-- ------------------------------------------------------------
-- G) profiles RLS initplan fix — wrap auth.uid() in (select ...)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS "users_read_own_profile" ON public.profiles;
CREATE POLICY "users_read_own_profile" ON public.profiles
  FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "users_update_own_profile" ON public.profiles;
CREATE POLICY "users_update_own_profile" ON public.profiles
  FOR UPDATE
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "users_insert_own_profile" ON public.profiles;
CREATE POLICY "users_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK ((select auth.uid()) = id);
