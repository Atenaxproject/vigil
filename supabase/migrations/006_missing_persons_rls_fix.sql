-- ============================================================
-- VIGIL — Block direct anon reads of missing_persons (contact leak fix)
-- Public display must use public_missing_persons view only.
-- ============================================================

-- Remove policy that exposed contact_phone/whatsapp/email via direct table SELECT
DROP POLICY IF EXISTS "public_read_missing" ON missing_persons;

-- Ensure the public view remains readable by anon/authenticated clients
GRANT SELECT ON public_missing_persons TO anon, authenticated;
