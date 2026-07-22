-- Feed health: last successful fetch per live data source (prompt 67).
-- Public read so the admin UI and Studio can see which feeds died;
-- writes go through the service role from server fetchers only.

CREATE TABLE IF NOT EXISTS feed_health (
  feed_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  last_success_at TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT,
  item_count INTEGER,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feed_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feed_health_public_read"
  ON feed_health FOR SELECT
  TO anon, authenticated
  USING (true);

-- No INSERT/UPDATE policies for anon/authenticated — service role only.
