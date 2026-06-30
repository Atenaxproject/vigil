-- ============================================================
-- VIGIL — Volunteer enhancements + contact request tables
-- Version: 1.1.0 | Date: 2026-06-29
-- ============================================================

-- Volunteer profile enhancements
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS specialization TEXT;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS equipment TEXT[] DEFAULT '{}';
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS remote_available BOOLEAN DEFAULT false;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS verification_url TEXT;
ALTER TABLE volunteers ADD COLUMN IF NOT EXISTS public_display BOOLEAN DEFAULT true;

-- Public view — masks name and location for privacy
CREATE OR REPLACE VIEW public_volunteers AS
SELECT
  id,
  CASE
    WHEN position(' ' IN full_name) > 0 THEN
      split_part(full_name, ' ', 1) || ' ' ||
      left(split_part(full_name, ' ', array_length(string_to_array(trim(full_name), ' '), 1)), 1) || '.'
    ELSE full_name
  END AS display_name,
  skills,
  languages,
  CASE
    WHEN location IS NULL THEN NULL
    WHEN position(',' IN location) > 0 THEN trim(split_part(location, ',', 1))
    ELSE trim(split_part(location, ' ', 1))
  END AS location_city,
  availability,
  specialization,
  equipment,
  remote_available,
  created_at
FROM volunteers
WHERE active = true
  AND public_display = true;

-- Update volunteer RLS for public directory
DROP POLICY IF EXISTS "no_public_volunteer_read" ON volunteers;
CREATE POLICY "public_read_volunteers" ON volunteers
  FOR SELECT USING (active = true AND public_display = true);

-- Resource exchange contact requests
CREATE TABLE IF NOT EXISTS resource_exchange_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_exchange_id UUID NOT NULL REFERENCES resource_exchange(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','notified','resolved','spam')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE resource_exchange_contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_exchange_contact" ON resource_exchange_contact_requests
  FOR INSERT WITH CHECK (true);

-- Volunteer contact requests
CREATE TABLE IF NOT EXISTS volunteer_contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id UUID NOT NULL REFERENCES volunteers(id) ON DELETE CASCADE,
  requester_name TEXT NOT NULL,
  requester_phone TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','notified','resolved','spam')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE volunteer_contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_volunteer_contact" ON volunteer_contact_requests
  FOR INSERT WITH CHECK (true);
