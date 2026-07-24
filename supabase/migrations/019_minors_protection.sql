-- ============================================================
-- VIGIL — Minors protection (prompt 76 REV2)
-- Publish what helps a stranger RECOGNIZE the child; suppress what helps a
-- stranger REACH the child. Reduction happens once, in the public view, so
-- every emitting surface (search, map, PFIF, notes, home feed) inherits it —
-- they all read public_missing_persons.
-- ============================================================

-- §2 — is_minor flag, independent of the (frequently-unknown) age field.
ALTER TABLE missing_persons
  ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT false;

-- Auto-set ONLY. Never auto-clear: age is often unknown in a crisis, a record
-- may be flagged manually with age null, and a later age correction must not
-- silently unflag it. Clearing is a deliberate human action (admin) only.
-- Never AI-assigned — same rule as ATC-20 tagging; this trigger is pure age math.
CREATE OR REPLACE FUNCTION set_is_minor_from_age()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.age IS NOT NULL AND NEW.age < 18 THEN
    NEW.is_minor := true;
  END IF;
  -- age >= 18 or null: leave whatever is_minor already holds (no clearing).
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_is_minor ON missing_persons;
CREATE TRIGGER trg_set_is_minor
  BEFORE INSERT OR UPDATE OF age ON missing_persons
  FOR EACH ROW EXECUTE FUNCTION set_is_minor_from_age();

-- One-time backfill for existing rows with a known minor age.
UPDATE missing_persons SET is_minor = true WHERE age IS NOT NULL AND age < 18;

-- §3 / §5 — Rebuild the public view with the minor reduction.
-- For a minor: keep name, photo, age, gender, estado, municipio (recognition).
-- Null parroquia, approx coordinates, and the free-text last_seen_location
-- (locating). is_minor is NOT a column here, so consumers doing SELECT * never
-- receive it — the reason for the reduction is not signalled (§5). The UI
-- renders a localized "{municipio}, {estado}" statement from the fields that
-- remain, so no Spanish lives in this view.
DROP VIEW IF EXISTS public_missing_persons;
CREATE VIEW public_missing_persons AS
SELECT
  id,
  full_name,
  age,
  gender,
  photo_url,
  CASE WHEN is_minor THEN NULL ELSE last_seen_location END AS last_seen_location,
  estado,
  municipio,
  CASE WHEN is_minor THEN NULL ELSE parroquia END AS parroquia,
  CASE WHEN is_minor THEN NULL ELSE approx_last_seen_lat END AS approx_last_seen_lat,
  CASE WHEN is_minor THEN NULL ELSE approx_last_seen_lng END AS approx_last_seen_lng,
  last_seen_at,
  status,
  -- Free-text notes are unbounded like last_seen_location and can carry a
  -- street, school, or shelter — locating info. Null for minors too, or the
  -- structured reduction is defeated through this field.
  CASE WHEN is_minor THEN NULL ELSE notes END AS notes,
  source,
  verified,
  created_at,
  updated_at
FROM missing_persons
WHERE flagged = false
  AND archived_at IS NULL
  AND deletion_requested_at IS NULL;

GRANT SELECT ON public_missing_persons TO anon, authenticated;
