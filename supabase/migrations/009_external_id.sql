-- Stable external reference for federated imports (e.g. DTV centros)
ALTER TABLE map_markers
  ADD COLUMN IF NOT EXISTS external_id TEXT;

DROP INDEX IF EXISTS idx_map_markers_external_id;

ALTER TABLE map_markers
  DROP CONSTRAINT IF EXISTS map_markers_external_id_key;

ALTER TABLE map_markers
  ADD CONSTRAINT map_markers_external_id_key UNIQUE (external_id);
