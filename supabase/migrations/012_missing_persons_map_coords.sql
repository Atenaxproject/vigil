-- ============================================================
-- VIGIL — Jittered map coordinates for missing persons (privacy)
-- ============================================================

ALTER TABLE missing_persons
  ADD COLUMN IF NOT EXISTS approx_last_seen_lat DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS approx_last_seen_lng DOUBLE PRECISION;

-- Deterministic backfill (~100–200 m jitter) from exact coords
UPDATE missing_persons
SET
  approx_last_seen_lat = ROUND(
    (
      last_seen_lat
      + (CASE WHEN (abs(hashtext(id::text)) % 2) = 0 THEN 1 ELSE -1 END)
        * (0.001 + (abs(hashtext(id::text)) % 1000) / 1000000.0)
    )::numeric,
    4
  ),
  approx_last_seen_lng = ROUND(
    (
      last_seen_lng
      + (CASE WHEN (abs(hashtext(id::text || 'lng')) % 2) = 0 THEN 1 ELSE -1 END)
        * (0.001 + (abs(hashtext(id::text || 'lng')) % 1000) / 1000000.0)
    )::numeric,
    4
  )
WHERE last_seen_lat IS NOT NULL
  AND last_seen_lng IS NOT NULL
  AND approx_last_seen_lat IS NULL;

DROP VIEW IF EXISTS public_missing_persons;
CREATE VIEW public_missing_persons AS
SELECT
  id,
  full_name,
  age,
  gender,
  photo_url,
  last_seen_location,
  estado,
  municipio,
  parroquia,
  approx_last_seen_lat,
  approx_last_seen_lng,
  last_seen_at,
  status,
  notes,
  source,
  verified,
  created_at,
  updated_at
FROM missing_persons
WHERE flagged = false
  AND archived_at IS NULL
  AND deletion_requested_at IS NULL;

GRANT SELECT ON public_missing_persons TO anon, authenticated;
