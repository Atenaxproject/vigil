-- Vigil Watch operator early-warning monitor: dedupe/state table.
-- Incident continuity across scan runs — an event alerts once on first
-- threshold cross and again only on escalation. Service-role access only;
-- this is an internal operations table, never exposed to the anon key.

CREATE TABLE IF NOT EXISTS vigil_watch_state (
  external_id TEXT PRIMARY KEY,          -- NHC storm ID / USGS event ID / GDACS event ID
  source TEXT NOT NULL CHECK (source IN ('nhc', 'usgs', 'gdacs')),
  last_severity TEXT NOT NULL,           -- 'named'|'hurricane'|'major' / magnitude / 'Orange'|'Red'
  region_ids TEXT[] NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_alerted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE vigil_watch_state ENABLE ROW LEVEL SECURITY;
-- No policies: anon/authenticated get nothing; service role bypasses RLS.
