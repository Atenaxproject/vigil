-- ============================================================
-- VIGIL — Venezuela geographic breakdown (estado/municipio/parroquia)
-- ============================================================

ALTER TABLE missing_persons
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS municipio TEXT,
  ADD COLUMN IF NOT EXISTS parroquia TEXT;

ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS municipio TEXT;

CREATE INDEX IF NOT EXISTS idx_mp_estado ON missing_persons(estado) WHERE estado IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_mp_municipio ON missing_persons(municipio) WHERE municipio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_markers_estado ON map_markers(estado) WHERE estado IS NOT NULL;

-- Recreate public view with geographic fields (no contact/GPS leak)
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
