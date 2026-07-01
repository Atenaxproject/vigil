-- Stable external reference for federated imports (e.g. DTV centros)
ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_map_markers_external_id
  ON map_markers (external_id)
  WHERE external_id IS NOT NULL;
