-- ============================================================
-- 021 — Needs coverage lifecycle + missing-person photo bucket
-- Apply after 021_rls_contact_lockdown on each live project.
-- ============================================================

-- ------------------------------------------------------------
-- map_markers.coverage_state — demand lifecycle for type=need
-- uncovered | partial | covered | needs_reconfirmation
-- ------------------------------------------------------------
ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS coverage_state TEXT NOT NULL DEFAULT 'uncovered'
    CHECK (coverage_state IN ('uncovered', 'partial', 'covered', 'needs_reconfirmation'));

ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS coverage_updated_at TIMESTAMPTZ;

ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS coverage_updated_by TEXT;

CREATE INDEX IF NOT EXISTS idx_map_markers_coverage
  ON map_markers (type, coverage_state, coverage_updated_at)
  WHERE type = 'need';

-- Recreate public view with coverage columns (must match 020 column set + new)
DROP VIEW IF EXISTS public_map_markers;
CREATE VIEW public_map_markers AS
SELECT
  id,
  type,
  category,
  title,
  description,
  lat,
  lng,
  estado,
  municipio,
  urgent,
  status,
  verified,
  source,
  hours_schedule,
  accepts_categories,
  organizer_name,
  region_scope,
  coverage_state,
  coverage_updated_at,
  created_at,
  resolved_at
FROM map_markers
WHERE flagged = false
  AND status != 'resolved';

GRANT SELECT ON public_map_markers TO anon, authenticated;

-- ------------------------------------------------------------
-- Missing-person photos — public bucket (recognition > privacy
-- for published photos; EXIF stripped server-side before upload)
-- ------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public)
VALUES ('missing-person-photos', 'missing-person-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Anon/authenticated may read; only service role uploads (no INSERT policy for anon)
DROP POLICY IF EXISTS "public_read_missing_person_photos" ON storage.objects;
CREATE POLICY "public_read_missing_person_photos" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'missing-person-photos');
