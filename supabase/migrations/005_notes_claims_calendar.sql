-- ============================================================
-- VIGIL — Notes, claim tokens, collection points, events
-- Version: 1.2.0 | Date: 2026-06-29
-- ============================================================

-- Claim tokens for passwordless report management
ALTER TABLE missing_persons ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT gen_random_uuid();
ALTER TABLE resource_exchange ADD COLUMN IF NOT EXISTS claim_token UUID DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS idx_mp_claim_token ON missing_persons(claim_token);
CREATE UNIQUE INDEX IF NOT EXISTS idx_re_claim_token ON resource_exchange(claim_token);

-- Public notes on missing persons (Google Person Finder pattern)
CREATE TABLE IF NOT EXISTS missing_person_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  note_type TEXT DEFAULT 'sighting' CHECK (note_type IN ('sighting','status_update','encouragement','correction')),
  message TEXT NOT NULL,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE missing_person_notes;
ALTER TABLE missing_person_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_notes" ON missing_person_notes;
CREATE POLICY "public_read_notes" ON missing_person_notes FOR SELECT USING (flagged = false);

DROP POLICY IF EXISTS "public_insert_notes" ON missing_person_notes;
CREATE POLICY "public_insert_notes" ON missing_person_notes FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notes_person ON missing_person_notes(missing_person_id, created_at DESC);

-- Contact request viewed flag for claim-link inbox
ALTER TABLE contact_requests ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT false;
ALTER TABLE resource_exchange_contact_requests ADD COLUMN IF NOT EXISTS viewed BOOLEAN DEFAULT false;

-- Collection point enhancements on map_markers
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS hours_schedule TEXT;
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS accepts_categories TEXT[] DEFAULT '{}';
ALTER TABLE map_markers ADD COLUMN IF NOT EXISTS organizer_name TEXT;

-- Community events calendar
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('donation_drive','volunteer_meetup','distribution','info_session','memorial','other')),
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  location_label TEXT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  organizer_name TEXT,
  organizer_contact TEXT,
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_events" ON events;
CREATE POLICY "public_read_events" ON events FOR SELECT USING (flagged = false);

DROP POLICY IF EXISTS "public_insert_events" ON events;
CREATE POLICY "public_insert_events" ON events FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at) WHERE flagged = false;
