-- ============================================================
-- VIGIL — Restore public INSERT on missing_persons
-- ============================================================
-- Phase-0 advisor lockdown revoked anon/authenticated INSERT on
-- missing_persons (and dropped public_insert_missing). That broke
-- /api/missing-persons/submit, which uses the anon client by design.
--
-- Restore INSERT only — do NOT restore SELECT/UPDATE/DELETE.
-- Public reads stay on public_missing_persons (migration 006).
-- Consent checks remain enforced by RLS WITH CHECK.
-- ============================================================

GRANT INSERT ON TABLE public.missing_persons TO anon, authenticated;

DROP POLICY IF EXISTS "public_insert_missing" ON public.missing_persons;
CREATE POLICY "public_insert_missing" ON public.missing_persons
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (consent_given = true AND data_accuracy_confirmed = true);
