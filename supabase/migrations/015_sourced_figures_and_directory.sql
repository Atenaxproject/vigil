-- ============================================================
-- VIGIL 015 — sourced figures (prompt 63) + feedback bad_number (64)
-- Editable from Supabase Studio without redeploy (infra pattern).
-- ============================================================

-- Provenance table for manually maintained crisis figures
CREATE TABLE IF NOT EXISTS sourced_figures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  label_es TEXT NOT NULL,
  label_en TEXT NOT NULL,
  value TEXT NOT NULL,
  source TEXT NOT NULL,
  source_url TEXT,
  verified_at TIMESTAMPTZ NOT NULL,
  is_official BOOLEAN NOT NULL DEFAULT true,
  category TEXT NOT NULL DEFAULT 'casualty'
    CHECK (category IN ('casualty', 'infrastructure', 'operational', 'other')),
  sort_order INT NOT NULL DEFAULT 100,
  active BOOLEAN NOT NULL DEFAULT true,
  updated_by TEXT DEFAULT 'admin',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sourced_figures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_sourced_figures" ON sourced_figures
  FOR SELECT USING (active = true);

ALTER PUBLICATION supabase_realtime ADD TABLE sourced_figures;

CREATE INDEX IF NOT EXISTS idx_sourced_figures_category ON sourced_figures(category, sort_order);

-- Seed official casualty figures (prompt 63 B1) — cifras oficiales, attributed
INSERT INTO sourced_figures (key, label_es, label_en, value, source, source_url, verified_at, is_official, category, sort_order) VALUES
('deaths', 'Muertos (cifra oficial)', 'Deaths (official figure)', '5119', 'Asamblea Nacional', NULL, '2026-07-18T00:00:00Z', true, 'casualty', 10),
('injured', 'Heridos (cifra oficial)', 'Injured (official figure)', '16740', 'Jorge Rodríguez, Asamblea Nacional', NULL, '2026-07-08T00:00:00Z', true, 'casualty', 20),
('without_housing', 'Sin vivienda (cifra oficial)', 'Without housing (official figure)', '17907', 'Asamblea Nacional', NULL, '2026-07-08T00:00:00Z', true, 'casualty', 30),
('displaced_camps', 'Desplazados en albergues de transición', 'Displaced in transitional camps', '23587 en 107 albergues', 'EFE', NULL, '2026-07-20T00:00:00Z', true, 'casualty', 40),
('buildings_affected', 'Edificios afectados / destruidos', 'Buildings affected / destroyed', '856 / 190', 'Asamblea Nacional', NULL, '2026-07-08T00:00:00Z', true, 'casualty', 50),
('structures_damaged_osu', 'Estructuras dañadas (análisis satelital)', 'Structures damaged (satellite analysis)', '~59000', 'Oregon State University', NULL, '2026-06-29T00:00:00Z', false, 'casualty', 60)
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  source = EXCLUDED.source,
  verified_at = EXCLUDED.verified_at,
  is_official = EXCLUDED.is_official,
  label_es = EXCLUDED.label_es,
  label_en = EXCLUDED.label_en,
  updated_at = NOW();

-- Infrastructure: add provenance columns + correct La Guaira electricity to 90%
ALTER TABLE infrastructure_status
  ADD COLUMN IF NOT EXISTS source TEXT,
  ADD COLUMN IF NOT EXISTS source_url TEXT,
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

UPDATE infrastructure_status
SET status_percent = 90,
    status_label = 'Restaurado en gran parte',
    source = 'Reportes de campo / balance regional',
    verified_at = '2026-07-18T00:00:00Z',
    updated_at = NOW()
WHERE region = 'La Guaira' AND metric = 'electricity';

-- Water/roads: no fresh independent source — mark as stale so UI can suppress
UPDATE infrastructure_status
SET source = COALESCE(source, 'Seed inicial — sin fuente reciente'),
    verified_at = COALESCE(verified_at, '2026-06-29T00:00:00Z'),
    updated_at = NOW()
WHERE verified_at IS NULL OR metric IN ('water', 'roads');

-- Feedback: allow bad_number category + optional entry_id for directory reports
ALTER TABLE feedback DROP CONSTRAINT IF EXISTS feedback_category_check;
ALTER TABLE feedback ADD CONSTRAINT feedback_category_check
  CHECK (category IN ('bug','feature_request','missing_info','question','other','bad_number'));

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS entry_id TEXT,
  ADD COLUMN IF NOT EXISTS ip_hash TEXT;

CREATE INDEX IF NOT EXISTS idx_feedback_bad_number ON feedback(category, entry_id)
  WHERE category = 'bad_number';

-- Directory report threshold config (prompt 64 Part E)
CREATE TABLE IF NOT EXISTS directory_report_config (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bad_number_threshold INT NOT NULL DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO directory_report_config (id, bad_number_threshold)
VALUES (1, 3)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE directory_report_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read_directory_report_config" ON directory_report_config
  FOR SELECT USING (true);
