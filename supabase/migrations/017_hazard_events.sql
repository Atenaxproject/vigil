-- Global hazard events for Vigil Watch /monitor (prompt 68).
-- Public read for non-suppressed active events; writes via service role only.

CREATE TABLE IF NOT EXISTS hazard_events (
  id TEXT PRIMARY KEY,
  hazard_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT '',
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  headline TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  cluster_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  suppressed BOOLEAN NOT NULL DEFAULT false,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS hazard_events_active_idx
  ON hazard_events (active, suppressed, issued_at DESC)
  WHERE active = true AND suppressed = false;

CREATE INDEX IF NOT EXISTS hazard_events_cluster_idx ON hazard_events (cluster_id)
  WHERE cluster_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS hazard_events_source_idx ON hazard_events (source);

ALTER TABLE hazard_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hazard_events_public_read"
  ON hazard_events FOR SELECT
  TO anon, authenticated
  USING (suppressed = false AND active = true);

-- Kill switch + misc flags (flip in Studio without a deploy)
CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "platform_settings_public_read"
  ON platform_settings FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO platform_settings (key, value)
VALUES ('monitor_public_enabled', 'true'::jsonb)
ON CONFLICT (key) DO NOTHING;
