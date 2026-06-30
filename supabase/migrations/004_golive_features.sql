-- ============================================================
-- VIGIL GO-LIVE — infrastructure_status, rescuer_presence, feedback
-- Version: 1.1.0 | Date: 2026-06-29
-- ============================================================

CREATE TABLE infrastructure_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region TEXT NOT NULL,
  metric TEXT NOT NULL CHECK (metric IN ('electricity','water','roads','airport','telecom','fuel')),
  status_percent INT CHECK (status_percent BETWEEN 0 AND 100),
  status_label TEXT,
  notes TEXT,
  updated_by TEXT DEFAULT 'admin',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE infrastructure_status;
ALTER TABLE infrastructure_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_infra" ON infrastructure_status FOR SELECT USING (true);

INSERT INTO infrastructure_status (region, metric, status_percent, status_label) VALUES
('La Guaira', 'electricity', 75, 'Restaurado parcialmente'),
('La Guaira', 'water', 68, 'Restaurado parcialmente'),
('La Guaira', 'roads', 90, 'Mayormente operativo'),
('Maiquetía', 'airport', 50, '1 pista operativa de 2');

CREATE TABLE rescuer_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name TEXT NOT NULL,
  team_or_org TEXT,
  presence_type TEXT NOT NULL CHECK (presence_type IN ('rescue_team','volunteer','medical','individual')),
  lat DECIMAL(9,6) NOT NULL,
  lng DECIMAL(9,6) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','checked_in','needs_assistance','signed_off')),
  last_checkin TIMESTAMPTZ DEFAULT NOW(),
  contact_phone TEXT,
  notes TEXT,
  auto_expire_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '4 hours'),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER PUBLICATION supabase_realtime ADD TABLE rescuer_presence;
ALTER TABLE rescuer_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_presence" ON rescuer_presence
  FOR SELECT USING (auto_expire_at > NOW() AND status != 'signed_off');
CREATE POLICY "public_insert_presence" ON rescuer_presence
  FOR INSERT WITH CHECK (true);
CREATE POLICY "public_update_presence" ON rescuer_presence
  FOR UPDATE USING (true);

CREATE INDEX idx_presence_active ON rescuer_presence(status, auto_expire_at);

CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL CHECK (category IN ('bug','feature_request','missing_info','question','other')),
  message TEXT NOT NULL,
  contact_email TEXT,
  page_context TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new','reviewing','resolved','wont_fix')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_insert_feedback" ON feedback FOR INSERT WITH CHECK (true);
