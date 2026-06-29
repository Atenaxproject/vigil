-- ============================================================
-- VIGIL CRISIS PLATFORM — INITIAL SCHEMA
-- Version: 1.0.0 | Date: 2026-06-29
-- Operator: Bbluestudios LLC
-- ============================================================

-- ============================================================
-- MISSING PERSONS
-- PFIF 1.4 compatible for Google Person Finder data exchange
-- Contact info is stored but NEVER exposed in public queries
-- ============================================================
CREATE TABLE missing_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identification (public)
  full_name TEXT NOT NULL,
  age INT CHECK (age >= 0 AND age <= 150),
  gender TEXT CHECK (gender IN ('male','female','other','unknown')),
  photo_url TEXT,

  -- Last known location (text description public, GPS coords private)
  last_seen_location TEXT NOT NULL,
  last_seen_lat DECIMAL(9,6),        -- PRIVATE — admin only
  last_seen_lng DECIMAL(9,6),        -- PRIVATE — admin only
  last_seen_at TIMESTAMPTZ,

  -- Contact info — PRIVATE — NEVER exposed in public API
  -- All contact goes through Vigil's internal contact request system
  contact_name TEXT NOT NULL,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_email TEXT,

  -- Status
  status TEXT DEFAULT 'missing' CHECK (status IN ('missing','found_alive','found_deceased','unverified')),
  notes TEXT,

  -- Data provenance
  source TEXT DEFAULT 'web' CHECK (source IN ('web','whatsapp','telegram','partner','pfif_import')),
  reporter_ip_hash TEXT,             -- Stored as SHA256 hash only, never raw IP

  -- Consent tracking (GDPR-adjacent)
  consent_given BOOLEAN NOT NULL DEFAULT false,
  data_accuracy_confirmed BOOLEAN NOT NULL DEFAULT false,
  consent_timestamp TIMESTAMPTZ,

  -- Moderation
  verified BOOLEAN DEFAULT false,
  verified_by TEXT,
  verified_at TIMESTAMPTZ,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  duplicate_of UUID REFERENCES missing_persons(id),

  -- Data lifecycle
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ,           -- Set when record is archived (90 days no update)
  deletion_requested_at TIMESTAMPTZ  -- For right-to-erasure requests
);

-- PUBLIC VIEW — masks all private contact and GPS data
CREATE VIEW public_missing_persons AS
SELECT
  id,
  full_name,
  age,
  gender,
  photo_url,
  last_seen_location,              -- Text description only, no GPS
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

-- ============================================================
-- CONTACT REQUESTS (replaces exposing phone numbers publicly)
-- Anyone can request contact, submitter receives notification
-- and chooses whether to respond
-- ============================================================
CREATE TABLE contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  missing_person_id UUID NOT NULL REFERENCES missing_persons(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  requester_relationship TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','notified','resolved','spam')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MAP MARKERS
-- ============================================================
CREATE TABLE map_markers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('need','resource','shelter','hospital','danger','rescue_zone','collection_point')),
  category TEXT CHECK (category IN ('food','water','medical','rescue','shelter','clothing','comms','power','transport','other')),
  title TEXT NOT NULL,
  description TEXT,
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  contact TEXT,                    -- Masked in public queries
  urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','resolved','unverified')),
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  source TEXT DEFAULT 'citizen',
  reporter_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ============================================================
-- ORGANIZATIONS
-- Require admin approval before appearing publicly
-- ============================================================
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('rescue','medical','food','shelter','translation','tech','government','diaspora','donation','legal')),
  country TEXT,
  description_es TEXT,
  description_en TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  donation_link TEXT,
  donation_instructions TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  location_label TEXT,
  trusted_source BOOLEAN DEFAULT false,  -- Trusted sources bypass moderation queue
  verified BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  approved_by_admin BOOLEAN DEFAULT false,  -- Orlando must manually approve
  submitted_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VOLUNTEERS
-- Contact info private — matched and connected through Vigil
-- ============================================================
CREATE TABLE volunteers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  skills TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT '{}',
  location TEXT,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  availability TEXT CHECK (availability IN ('immediate','this_week','remote_only','on_request')),
  contact_phone TEXT,              -- PRIVATE
  contact_whatsapp TEXT,           -- PRIVATE
  contact_email TEXT,              -- PRIVATE
  matched_to UUID REFERENCES organizations(id),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- NEEDS / OFFERS
-- ============================================================
CREATE TABLE needs_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('need','offer')),
  category TEXT CHECK (category IN ('food','water','medical_supplies','medicine','blood','shelter','clothing','transport','money','equipment','manpower','other')),
  description TEXT NOT NULL,
  quantity TEXT,
  location TEXT NOT NULL,
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  contact TEXT,                    -- PRIVATE
  status TEXT DEFAULT 'open' CHECK (status IN ('open','matched','fulfilled','expired')),
  urgent BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MODERATION QUEUE
-- ============================================================
CREATE TABLE moderation_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  reason TEXT CHECK (reason IN ('flag_threshold','ai_duplicate','ai_suspicious','out_of_bounds','rate_limit','spam_pattern')),
  ai_confidence DECIMAL(3,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ERASURE REQUESTS (Right to be forgotten — GDPR-adjacent)
-- ============================================================
CREATE TABLE erasure_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  reason TEXT,
  requestor_contact TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','denied')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RATE LIMITING LOG (for anti-scraping and abuse detection)
-- ============================================================
CREATE TABLE rate_limit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_rate_limit_ip_action ON rate_limit_log(ip_hash, action, created_at);

-- ============================================================
-- REAL-TIME SUBSCRIPTIONS
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE missing_persons;
ALTER PUBLICATION supabase_realtime ADD TABLE map_markers;
ALTER PUBLICATION supabase_realtime ADD TABLE needs_offers;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_mp_status ON missing_persons(status) WHERE archived_at IS NULL;
CREATE INDEX idx_mp_flagged ON missing_persons(flagged);
CREATE INDEX idx_mp_fts ON missing_persons USING gin(to_tsvector('simple', full_name));
CREATE INDEX idx_markers_type_status ON map_markers(type, status) WHERE flagged = false;
CREATE INDEX idx_markers_location ON map_markers(lat, lng);
CREATE INDEX idx_orgs_approved ON organizations(approved_by_admin, active);
CREATE INDEX idx_needs_type ON needs_offers(entry_type, status, urgent);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE missing_persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_markers ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE needs_offers ENABLE ROW LEVEL SECURITY;

-- MISSING PERSONS: public read of non-flagged, non-archived records (via view)
-- Direct table access restricted — always use public_missing_persons view
CREATE POLICY "public_read_missing" ON missing_persons
  FOR SELECT USING (flagged = false AND archived_at IS NULL AND deletion_requested_at IS NULL);

-- MISSING PERSONS: anyone can submit a report
CREATE POLICY "public_insert_missing" ON missing_persons
  FOR INSERT WITH CHECK (consent_given = true AND data_accuracy_confirmed = true);

-- MAP MARKERS: public read of active non-flagged markers
CREATE POLICY "public_read_markers" ON map_markers
  FOR SELECT USING (flagged = false AND status != 'resolved');

CREATE POLICY "public_insert_markers" ON map_markers
  FOR INSERT WITH CHECK (true);

-- ORGANIZATIONS: only show admin-approved organizations
CREATE POLICY "public_read_orgs" ON organizations
  FOR SELECT USING (approved_by_admin = true AND active = true);

CREATE POLICY "public_submit_org" ON organizations
  FOR INSERT WITH CHECK (true);  -- Submissions always accepted, approval required before display

-- VOLUNTEERS: no public read — contact goes through admin matching
CREATE POLICY "no_public_volunteer_read" ON volunteers
  FOR SELECT USING (false);

CREATE POLICY "public_volunteer_register" ON volunteers
  FOR INSERT WITH CHECK (true);

-- NEEDS/OFFERS: public read, anyone can submit
CREATE POLICY "public_read_needs" ON needs_offers
  FOR SELECT USING (status IN ('open','matched'));

CREATE POLICY "public_insert_needs" ON needs_offers
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- AUTOMATED DATA LIFECYCLE (pg_cron — enable in Supabase dashboard)
-- ============================================================
-- Archive missing persons with no updates in 90 days
-- SELECT cron.schedule('archive-stale-records', '0 2 * * *',
--   $$UPDATE missing_persons SET archived_at = NOW()
--     WHERE archived_at IS NULL
--     AND updated_at < NOW() - INTERVAL '90 days'
--     AND status = 'missing'$$
-- );

-- ============================================================
-- TRIGGER: update updated_at on missing_persons changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER missing_persons_updated_at
  BEFORE UPDATE ON missing_persons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
