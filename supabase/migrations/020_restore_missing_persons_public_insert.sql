-- ============================================================
-- VIGIL — Restore public INSERT on missing_persons
-- ============================================================
-- Phase-0 advisor lockdown revoked anon/authenticated INSERT on
-- missing_persons (and dropped public_insert_missing). That broke
-- /api/missing-persons/submit, which uses the anon client by design.
--
-- Restore INSERT only on submission-safe columns — do NOT restore
-- SELECT/UPDATE/DELETE, and do NOT grant moderation/provenance
-- columns (verified*, status, flagged*, lifecycle, photo_url).
-- Public reads stay on public_missing_persons (migration 006).
-- Consent + safe-default checks remain enforced by RLS WITH CHECK.
-- ============================================================

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
