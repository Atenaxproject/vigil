-- Add region_scope to tables serving Venezuela + USA diaspora contexts
-- Default 'venezuela' preserves all existing rows with zero data migration risk

ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS region_scope TEXT NOT NULL DEFAULT 'venezuela'
  CHECK (region_scope IN ('venezuela', 'usa_diaspora'));

ALTER TABLE organizations ADD COLUMN IF NOT EXISTS region_scope TEXT NOT NULL DEFAULT 'venezuela'
  CHECK (region_scope IN ('venezuela', 'usa_diaspora'));

ALTER TABLE events ADD COLUMN IF NOT EXISTS region_scope TEXT NOT NULL DEFAULT 'venezuela'
  CHECK (region_scope IN ('venezuela', 'usa_diaspora'));

ALTER TABLE resource_exchange ADD COLUMN IF NOT EXISTS region_scope TEXT NOT NULL DEFAULT 'venezuela'
  CHECK (region_scope IN ('venezuela', 'usa_diaspora'));

ALTER TABLE needs_offers ADD COLUMN IF NOT EXISTS region_scope TEXT NOT NULL DEFAULT 'venezuela'
  CHECK (region_scope IN ('venezuela', 'usa_diaspora'));

CREATE INDEX IF NOT EXISTS idx_map_markers_region_scope ON map_markers(region_scope);
CREATE INDEX IF NOT EXISTS idx_organizations_region_scope ON organizations(region_scope);
CREATE INDEX IF NOT EXISTS idx_events_region_scope ON events(region_scope);
CREATE INDEX IF NOT EXISTS idx_resource_exchange_region_scope ON resource_exchange(region_scope);
CREATE INDEX IF NOT EXISTS idx_needs_offers_region_scope ON needs_offers(region_scope);
