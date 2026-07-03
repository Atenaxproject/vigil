-- ============================================================
-- VIGIL — Property safety assessments + volunteer taxonomy
-- Version: 1.2.0 | Date: 2026-07-03
-- ============================================================

-- Extend organization types (Hogar Bambi — child protection)
ALTER TABLE organizations DROP CONSTRAINT IF EXISTS organizations_type_check;
ALTER TABLE organizations ADD CONSTRAINT organizations_type_check
  CHECK (type IN (
    'rescue','medical','food','shelter','translation','tech','government',
    'diaspora','donation','legal','child_protection'
  ));

-- Volunteer credential note (optional license / association)
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS credential_note TEXT;

-- ============================================================
-- PROPERTY ASSESSMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS property_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_token UUID DEFAULT gen_random_uuid() NOT NULL,

  estado TEXT,
  municipio TEXT,
  approx_location_lat DOUBLE PRECISION,
  approx_location_lng DOUBLE PRECISION,
  request_type TEXT NOT NULL CHECK (request_type IN ('inspection', 'relocation_assistance', 'both')),
  danger_indicators TEXT[] DEFAULT '{}',
  description TEXT,
  tag_status TEXT DEFAULT 'unassessed' CHECK (tag_status IN ('unassessed', 'green', 'yellow', 'red')),
  tag_assigned_at TIMESTAMPTZ,
  tag_assigned_by UUID REFERENCES volunteers(id),
  tag_note TEXT,

  exact_address TEXT,
  exact_lat DOUBLE PRECISION,
  exact_lng DOUBLE PRECISION,
  contact_name TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  photo_url TEXT,

  ai_priority_flag BOOLEAN DEFAULT false,

  consent_given BOOLEAN NOT NULL DEFAULT false,
  data_accuracy_confirmed BOOLEAN NOT NULL DEFAULT false,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'completed', 'closed')),
  assigned_to UUID REFERENCES volunteers(id),
  relocation_exchange_id UUID REFERENCES resource_exchange(id),
  flagged BOOLEAN DEFAULT false,
  reporter_ip_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_property_assessments_claim_token
  ON property_assessments(claim_token);
CREATE INDEX IF NOT EXISTS idx_property_assessments_queue
  ON property_assessments(status, ai_priority_flag DESC, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_property_assessments_tag
  ON property_assessments(tag_status);

-- Public stripped view — no contact, address, or photo
CREATE OR REPLACE VIEW public_property_assessments AS
SELECT
  id,
  estado,
  municipio,
  approx_location_lat,
  approx_location_lng,
  request_type,
  tag_status,
  created_at
FROM property_assessments
WHERE flagged = false
  AND status != 'closed'
  AND approx_location_lat IS NOT NULL
  AND approx_location_lng IS NOT NULL;

GRANT SELECT ON public_property_assessments TO anon, authenticated;

ALTER TABLE property_assessments ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "public_insert_property_assessments" ON property_assessments
  FOR INSERT WITH CHECK (true);

-- Direct table reads blocked for anon — use public_property_assessments view
CREATE POLICY "no_public_direct_read_property" ON property_assessments
  FOR SELECT USING (false);

-- Private photo bucket (admin/service role uploads only)
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-assessment-photos', 'property-assessment-photos', false)
ON CONFLICT (id) DO NOTHING;
