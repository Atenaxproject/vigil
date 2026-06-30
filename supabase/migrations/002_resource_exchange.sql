-- Resource Exchange Board
-- Structured matching for goods, services, skills, space, transport
CREATE TABLE resource_exchange (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('offering','requesting')),
  category TEXT NOT NULL CHECK (category IN (
    'goods',        -- Physical items: beds, clothing, food, water, medicine
    'shelter',      -- Space: rooms, houses, apartments for displaced families
    'transport',    -- Vehicles, drivers, logistics
    'skills',       -- Professional skills: medical, construction, legal, tech, counseling
    'volunteer',    -- General volunteer hours/labor
    'equipment',    -- Tools, generators, machinery
    'money'         -- Financial help, fundraising
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quantity TEXT,                     -- "20 beds", "1 truck", "2 doctors for 3 days"
  location TEXT NOT NULL,            -- Where the resource is or where it's needed
  lat DECIMAL(9,6),
  lng DECIMAL(9,6),
  contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp','phone','email','vigil')),
  contact_value TEXT,                -- Masked in public view — routed through Vigil messaging
  languages TEXT[] DEFAULT '{}',    -- Languages the person speaks
  available_until TIMESTAMPTZ,       -- When does this offer/need expire?
  urgent BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','matched','fulfilled','expired')),
  matched_with UUID REFERENCES resource_exchange(id),
  verified BOOLEAN DEFAULT false,
  flagged BOOLEAN DEFAULT false,
  flag_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE resource_exchange;

-- Indexes
CREATE INDEX idx_exchange_type_category ON resource_exchange(entry_type, category, status);
CREATE INDEX idx_exchange_urgent ON resource_exchange(urgent, status) WHERE urgent = true;
CREATE INDEX idx_exchange_location ON resource_exchange(lat, lng);

-- RLS
ALTER TABLE resource_exchange ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_exchange" ON resource_exchange
  FOR SELECT USING (flagged = false AND status != 'expired');
CREATE POLICY "public_insert_exchange" ON resource_exchange
  FOR INSERT WITH CHECK (true);

-- Auto-expire after 7 days if not updated
CREATE OR REPLACE FUNCTION expire_old_exchange()
RETURNS void AS $$
  UPDATE resource_exchange
  SET status = 'expired'
  WHERE status = 'active'
    AND created_at < NOW() - INTERVAL '7 days'
    AND updated_at < NOW() - INTERVAL '7 days';
$$ LANGUAGE SQL;
